 
/* =========================================
   KRISHISLOT - FARMER REGISTRATION
   Complete JavaScript
========================================= */
 
/* GET HTML ELEMENTS */
const modal = document.getElementById("registrationModal");
const openRegisterBtn = document.getElementById("openRegisterBtn");
const heroRegisterBtn = document.getElementById("heroRegisterBtn");
const closeRegisterBtn = document.getElementById("closeRegisterBtn");

const formStep1 = document.getElementById("formStep1");
const formStep2 = document.getElementById("formStep2");
const formStep3 = document.getElementById("formStep3");
const successScreen = document.getElementById("successScreen");

const stepIndicator1 = document.getElementById("stepIndicator1");
const stepIndicator2 = document.getElementById("stepIndicator2");
const stepIndicator3 = document.getElementById("stepIndicator3");

const centerList = document.getElementById("centerList");
const locationMessage = document.getElementById("locationMessage");
const toast = document.getElementById("toast");

let selectedCenter = null;

const centers = [
    {
        name: "District Procurement Center",
        location: "Main Mandi Road",
        distance: 2.4,
        slots: 28
    },
    {
        name: "Block Mandi Center",
        location: "Block Market Area",
        distance: 5.8,
        slots: 46
    },
    {
        name: "Shivaji Nagar Procurement Center",
        location: "Shivaji Nagar",
        distance: 8.1,
        slots: 67
    },
    {
        name: "Rural Collection Center",
        location: "Village Market",
        distance: 11.3,
        slots: 31
    }
];

/* OPEN REGISTRATION */
function openRegistration() {
    if (!modal) return;
    modal.classList.add("show");
    showStep(1);
}

if (openRegisterBtn) {
    openRegisterBtn.addEventListener("click", openRegistration);
}

if (heroRegisterBtn) {
    heroRegisterBtn.addEventListener("click", openRegistration);
}

/* CLOSE REGISTRATION */
if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener("click", () => {
        modal.classList.remove("show");
    });
}

if (modal) {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });
}

/* SHOW STEP */
function showStep(step) {
    formStep1.classList.remove("active");
    formStep2.classList.remove("active");
    formStep3.classList.remove("active");
    successScreen.classList.remove("show");

    stepIndicator1.classList.remove("active");
    stepIndicator2.classList.remove("active");
    stepIndicator3.classList.remove("active");

    if (step === 1) {
        formStep1.classList.add("active");
        stepIndicator1.classList.add("active");
    }

    if (step === 2) {
        formStep2.classList.add("active");
        stepIndicator1.classList.add("active");
        stepIndicator2.classList.add("active");
        showCenters();
    }

    if (step === 3) {
        formStep3.classList.add("active");
        stepIndicator1.classList.add("active");
        stepIndicator2.classList.add("active");
        stepIndicator3.classList.add("active");

        const mobile = document.getElementById("mobile").value.trim();
        document.getElementById("mobileDisplay").textContent =
            "******" + mobile.slice(-4);
    }
}

/* TOAST MESSAGE */
function showToast(message) {
    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimeout);

    window.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* STEP 1: PERSONAL DETAILS */
document.getElementById("nextStep1").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const age = document.getElementById("age").value.trim();
    const state = document.getElementById("state").value;
    const district = document.getElementById("district").value.trim();

    if (!name || !mobile || !age || !state || !district) {
        showToast("Please fill all personal details.");
        return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        showToast("Please enter a valid 10 digit mobile number.");
        return;
    }

    showStep(2);
});

/* SHOW PROCUREMENT CENTERS */
function showCenters() {
    centerList.innerHTML = "";

    centers.forEach(center => {
        const card = document.createElement("div");
        card.className = "center-card";

        card.innerHTML = `
            <div class="radio"></div>
            <div class="center-info">
                <strong>${center.name}</strong>
                <span>📍 ${center.location}</span>
                <span>${center.slots} slots available</span>
            </div>
            <div class="distance">
                <strong>${center.distance} km</strong>
                <span>away</span>
            </div>
        `;

        card.addEventListener("click", () => {
            document.querySelectorAll(".center-card").forEach(item => {
                item.classList.remove("selected");
            });

            card.classList.add("selected");
            selectedCenter = center;
            locationMessage.textContent = center.name + " selected";
            showToast(center.name + " selected.");
        });

        centerList.appendChild(card);

        if (center === centers[0]) {
            card.classList.add("selected");
            selectedCenter = center;
            locationMessage.textContent = center.name + " selected";
        }
    });
}

/* CURRENT LOCATION */
document.getElementById("locationBtn").addEventListener("click", () => {
    if (!navigator.geolocation) {
        showToast("Location is not supported by your browser.");
        return;
    }

    showToast("Getting your location...");

    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            document.getElementById("location").value =
                latitude.toFixed(4) + ", " + longitude.toFixed(4);

            locationMessage.textContent = "Current location detected.";
            showToast("Location detected successfully.");
        },
        () => {
            showToast("Location unavailable. Allow location permission or enter it manually.");
        }
    );
});

/* STEP 2: FARM DETAILS */
document.getElementById("nextStep2").addEventListener("click", () => {
    const village = document.getElementById("village").value.trim();
    const land = document.getElementById("land").value.trim();
    const crop = document.getElementById("crop").value;
    const quantity = document.getElementById("quantity").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!village || !land || !crop || !quantity || !location) {
        showToast("Please fill all farm details.");
        return;
    }

    if (!selectedCenter) {
        showToast("Please select a procurement center.");
        return;
    }

    showStep(3);
});

/* BACK BUTTONS */
document.getElementById("backStep2").addEventListener("click", () => {
    showStep(1);
});

document.getElementById("backStep3").addEventListener("click", () => {
    showStep(2);
});

/* STEP 3: REGISTRATION + AUTOMATIC BOOKING */
document.getElementById("completeBtn").addEventListener("click", async () => {
    const otp = document.getElementById("otp").value.trim();

    if (otp !== "123456") {
        showToast("Wrong OTP. Please enter 123456.");
        return;
    }

    if (!selectedCenter) {
        showToast("Please select a procurement center.");
        return;
    }

    const farmerData = {
        farmerId: "KSL-" + Math.floor(100000 + Math.random() * 900000),
        name: document.getElementById("name").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        age: Number(document.getElementById("age").value),
        state: document.getElementById("state").value,
        district: document.getElementById("district").value.trim(),
        village: document.getElementById("village").value.trim(),
        land: Number(document.getElementById("land").value),
        crop: document.getElementById("crop").value,
        quantity: Number(document.getElementById("quantity").value),
        location: document.getElementById("location").value.trim(),
        center: selectedCenter.name
    };

    const completeBtn = document.getElementById("completeBtn");
    completeBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/api/farmers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(farmerData)
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.farmer) {
            throw new Error(result.message || "Registration failed.");
        }

        // Use the actual booking generated by the backend
        const savedFarmer = result.farmer;

        // Save backend-confirmed farmer details
        localStorage.setItem(
            "krishiSlotFarmer",
            JSON.stringify(savedFarmer)
        );

        document.getElementById("farmerId").textContent =
            savedFarmer.farmerId;

        document.getElementById("successName").textContent =
            savedFarmer.name;

        document.getElementById("successCrop").textContent =
            savedFarmer.crop;

        document.getElementById("successCenter").textContent =
            savedFarmer.selectedCenter || farmerData.center;

        // These IDs must exist in index.html
        const bookingDateElement =
            document.getElementById("successBookingDate");

        const timeSlotElement =
            document.getElementById("successTimeSlot");

        const tokenElement =
            document.getElementById("successTokenNumber");

        if (bookingDateElement) {
            bookingDateElement.textContent = savedFarmer.bookingDate || "-";
        }

        if (timeSlotElement) {
            timeSlotElement.textContent = savedFarmer.timeSlot || "-";
        }

        if (tokenElement) {
            tokenElement.textContent = savedFarmer.tokenNumber || "-";
        }

        formStep1.classList.remove("active");
        formStep2.classList.remove("active");
        formStep3.classList.remove("active");

        stepIndicator1.classList.remove("active");
        stepIndicator2.classList.remove("active");
        stepIndicator3.classList.remove("active");

        successScreen.classList.add("show");
        showToast("Registration and slot booking successful!");

    } catch (error) {
        console.error("Registration error:", error);
        showToast(error.message || "Data save nahi hua. Backend check karo.");
    } finally {
        completeBtn.disabled = false;
    }
});

/* FINISH REGISTRATION */
document.getElementById("finishBtn").addEventListener("click", () => {
    modal.classList.remove("show");
    showToast("Welcome to KrishiSlot!");
});
