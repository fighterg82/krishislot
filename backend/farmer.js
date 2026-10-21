 
const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
    farmerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    age: Number,
    state: String,
    district: String,
    village: String,
    land: Number,
    crop: {
        type: String,
        required: true
    },
    quantity: Number,
    location: String,
    selectedCenter: String,

    // Automatic booking details
    bookingDate: {
        type: String,
        default: null
    },
    timeSlot: {
        type: String,
        default: null
    },
    tokenNumber: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: ["Scheduled", "Arrived", "Processing", "Accepted", "Payment"],
        default: "Scheduled"
    }
}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
