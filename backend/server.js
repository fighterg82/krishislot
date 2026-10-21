const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Farmer = require("./models/Farmer");

const app = express();

app.use(cors());
app.use(express.json());

const centers = [
    "District Procurement Center",
    "Block Mandi Center",
    "Shivaji Nagar",
    "Rural Collection Center"
];

const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM"
];

const MAX_FARMERS_PER_SLOT = 5;

// Date ko YYYY-MM-DD format mein banana
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Automatic available slot find karna
async function findAvailableBooking(requestedCenter) {
    const orderedCenters = centers.includes(requestedCenter)
        ? [
            requestedCenter,
            ...centers.filter(center => center !== requestedCenter)
        ]
        : centers;

    // Kal se agle 30 din tak available slot check hoga
    for (let day = 1; day <= 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const bookingDate = formatDate(date);

        for (const center of orderedCenters) {
            for (const timeSlot of timeSlots) {
                const existingBookings = await Farmer.countDocuments({
                    bookingDate,
                    selectedCenter: center,
                    timeSlot
                });

                if (existingBookings < MAX_FARMERS_PER_SLOT) {
                    return {
                        bookingDate,
                        timeSlot,
                        selectedCenter: center
                    };
                }
            }
        }
    }

    return null;
}

// Backend test
app.get("/", (req, res) => {
    res.send("KrishiSlot Backend is running!");
});

// Register farmer + automatic booking

app.post("/api/farmers", async (req, res) => {
    try {
        const {
            farmerId,
            name,
            mobile,
            age,
            state,
            district,
            village,
            land,
            crop,
            quantity,
            location,
            center
        } = req.body;

        if (!farmerId || !name || !mobile || !crop || !center) {
            return res.status(400).json({
                success: false,
                message: "Required farmer details are missing."
            });
        }

        // Available time slots
        const slots = [
            { label: "09:00 AM - 10:00 AM", start: 9, end: 10 },
            { label: "10:00 AM - 11:00 AM", start: 10, end: 11 },
            { label: "11:00 AM - 12:00 PM", start: 11, end: 12 },
            { label: "12:00 PM - 01:00 PM", start: 12, end: 13 },
            { label: "02:00 PM - 03:00 PM", start: 14, end: 15 },
            { label: "03:00 PM - 04:00 PM", start: 15, end: 16 }
        ];

        // Daily capacity of each center
        const capacities = {
            "District Procurement Center": 28,
            "Block Mandi Center": 46,
            "Shivaji Nagar Procurement Center": 67,
            "Rural Collection Center": 31
        };

        const dailyCapacity = capacities[center];

        if (!dailyCapacity) {
            return res.status(400).json({
                success: false,
                message: "Invalid procurement center."
            });
        }

        const perSlotCapacity = Math.ceil(
            dailyCapacity / slots.length
        );

        let bookingDate = null;
        let timeSlot = null;

        // Find the earliest available booking
        for (let day = 0; day <= 30; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const dateNumber = String(date.getDate()).padStart(2, "0");

            const dateString = `${year}-${month}-${dateNumber}`;

            for (const slot of slots) {
                // Skip time slots that have already ended today
                if (day === 0 && slot.end <= new Date().getHours()) {
                    continue;
                }

                const dailyBookings = await Farmer.countDocuments({
                    selectedCenter: center,
                    bookingDate: dateString
                });

                if (dailyBookings >= dailyCapacity) {
                    break;
                }

                const slotBookings = await Farmer.countDocuments({
                    selectedCenter: center,
                    bookingDate: dateString,
                    timeSlot: slot.label
                });

                if (slotBookings < perSlotCapacity) {
                    bookingDate = dateString;
                    timeSlot = slot.label;
                    break;
                }
            }

            if (bookingDate) {
                break;
            }
        }

        if (!bookingDate) {
            return res.status(503).json({
                success: false,
                message: "No booking slot available in the next 30 days."
            });
        }

        // Generate a token for this center and date
        const tokenCount = await Farmer.countDocuments({
            selectedCenter: center,
            bookingDate: bookingDate
        });

        const centerCode = {
            "District Procurement Center": "DPC",
            "Block Mandi Center": "BMC",
            "Shivaji Nagar Procurement Center": "SNC",
            "Rural Collection Center": "RCC"
        }[center];

        const tokenNumber =
            `KST-${centerCode}-${bookingDate.replace(/-/g, "")}-${String(tokenCount + 1).padStart(3, "0")}`;

        // Save farmer and booking in MongoDB
        const farmer = new Farmer({
            farmerId,
            name,
            mobile,
            age,
            state,
            district,
            village,
            land,
            crop,
            quantity,
            location,
            selectedCenter: center,
            bookingDate,
            timeSlot,
            tokenNumber,
            status: "Scheduled"
        });

        await farmer.save();

        return res.status(201).json({
            success: true,
            message: "Farmer registered and slot booked successfully!",
            farmer
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to register farmer or book slot."
        });
    }
});


// Update farmer status
app.patch("/api/farmers/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Scheduled",
            "Arrived",
            "Processing",
            "Accepted",
            "Payment"
        ];

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid farmer ID."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status."
            });
        }

        const farmer = await Farmer.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found."
            });
        }

        res.json({
            success: true,
            message: "Farmer status updated successfully!",
            farmer
        });

    } catch (error) {
        console.error("Status update error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update farmer status."
        });
    }
});
// Fetch all registered farmers
 
app.get("/api/farmers", async (req, res) => {
    try {
        const farmers = await Farmer.find({}).sort({
            createdAt: -1
        });

        res.status(200).json(farmers);
    } catch (error) {
        console.error("Fetch farmers error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch farmers",
            error: error.message
        });
    }
});


 
app.post("/api/farmer/login", async (req, res) => {
    try {
        const { loginValue } = req.body;

        if (!loginValue || !loginValue.trim()) {
            return res.status(400).json({
                success: false,
                message: "Mobile number or Farmer ID is required."
            });
        }

        const value = loginValue.trim();

        let farmer;

        if (/^\d{10}$/.test(value)) {
            // Login using mobile number
            farmer = await Farmer.findOne({
                mobile: value
            }).lean();
        } else {
            // Login using Farmer ID
            farmer = await Farmer.findOne({
                farmerId: value.toUpperCase()
            }).lean();
        }

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found. Check your mobile number or Farmer ID."
            });
        }

        res.json({
            success: true,
            farmer: {
                farmerId: farmer.farmerId,
                name: farmer.name,
                mobile: farmer.mobile,
                crop: farmer.crop,
                quantity: farmer.quantity,
                selectedCenter: farmer.selectedCenter,
                bookingDate: farmer.bookingDate,
                timeSlot: farmer.timeSlot,
                tokenNumber: farmer.tokenNumber,
                status: farmer.status
            }
        });

    } catch (error) {
        console.error("Farmer login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});


// Connect database and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });
