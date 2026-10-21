 
 
/* =========================================
   KRISHISLOT - FARMER REGISTRATION
   Corrected Complete JavaScript
========================================= */

/* HTML ELEMENTS */
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
const completeBtn = document.getElementById("completeBtn");

const API_URL = "https://krishislot.onrender.com/api/farmers";

let selectedCenter = null;
let isRegistering = false;

/* PROCUREMENT CENTERS */
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
    if (!modal) {
        console.error("Registration modal not found in index.html");
        return;
    }

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
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });
}

/* TOAST MESSAGE */
function showToast(message) {
    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.krishiToastTimeout);

    window.krishiToastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* SHOW FORM STEP */
function showStep(step) {
    [formStep1, formStep2, formStep3].forEach((element) => {
        if (element) element.classList.remove("active");
    });

    if (successScreen) {
        successScreen.classList.remove("show");
    }

    [stepIndicator1, stepIndicator2, stepIndicator3].forEach((element) => {
        if (element) element.classList.remove("active");
    });

    if (step === 1) {
        formStep1?.classList.add("active");
        stepIndicator1?.classList.add("active");
    }

    if (step === 2) {
        formStep2?.classList.add("active");
        stepIndicator1?.classList.add("active");
        stepIndicator2?.classList.add("active");
        showCenters();
    }

    if (step === 3) {
        formStep3?.classList.add("active");
        stepIndicator1?.classList.add("active");
        stepIndicator2?.classList.add("active");
        stepIndicator3?.classList.add("active");

        const mobile = document.getElementById("mobile")?.value.trim() || "";
        const mobileDisplay = document.getElementById("mobileDisplay");

        if (mobileDisplay) {
            mobileDisplay.textContent = "******" + mobile.slice(-4);
        }
    }
}

/* STEP 1: PERSONAL DETAILS */
document.getElementById("nextStep1")?.addEventListener("click", () => {
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
        showToast("Enter a valid 10-digit mobile number.");
        return;
    }

    if (Number(age) < 18 || !Number.isFinite(Number(age))) {
        showToast("Please enter a valid age of 18 or above.");
        return;
    }

    showStep(2);
});

/* DISPLAY PROCUREMENT CENTERS */
function showCenters() {
    if (!centerList) return;

    centerList.replaceChildren();

    centers.forEach((center) => {
        const card = document.createElement("div");
        card.className = "center-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const info = document.createElement("div");
        info.className = "center-info";

        const name = document.createElement("strong");
        name.textContent = center.name;

        const location = document.createElement("span");
        location.textContent = "📍 " + center.location;

        const slots = document.createElement("span");
        slots.textContent = center.slots + " slots available";

        const distance = document.createElement("div");
        distance.className = "distance";

        const distanceValue = document.createElement("strong");
        distanceValue.textContent = center.distance + " km";

        const distanceLabel = document.createElement("span");
        distanceLabel.textContent = "away";

        info.append(name, location, slots);
        distance.append(distanceValue, distanceLabel);
        card.append(info, distance);

        function selectCenter() {
            centerList.querySelectorAll(".center-card").forEach((item) => {
                item.classList.remove("selected");
            });

            card.classList.add("selected");
            selectedCenter = center;

            if (locationMessage) {
                locationMessage.textContent = center.name + " selected";
            }

            showToast(center.name + " selected.");
        }

        card.addEventListener("click", selectCenter);

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectCenter();
            }
        });

        centerList.appendChild(card);
    });

    /* Select first center by default */
    const firstCard = centerList.querySelector(".center-card");

    if (firstCard) {
        firstCard.click();
    }
}

/* CURRENT LOCATION */
document.getElementById("locationBtn")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showToast("Location is not supported by your browser.");
        return;
    }

    showToast("Getting your location...");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            document.getElementById("location").value =
                latitude.toFixed(5) + ", " + longitude.toFixed(5);

            if (locationMessage) {
                locationMessage.textContent = "Current location detected.";
            }

            showToast("Location detected successfully.");
        },
        () => {
            showToast("Location unavailable. Enter your area or pincode manually.");
        },
        {
            enableHighAccuracy: false,
            timeout: 10000
        }
    );
});

/* STEP 2: FARM DETAILS */
document.getElementById("nextStep2")?.addEventListener("click", () => {
    const village = document.getElementById("village").value.trim();
    const land = Number(document.getElementById("land").value);
    const crop = document.getElementById("crop").value;
    const quantity = Number(document.getElementById("quantity").value);
    const location = document.getElementById("location").value.trim();

    if (!village || !crop || !location || !document.getElementById("land").value ||
        !document.getElementById("quantity").value) {
        showToast("Please fill all farm details.");
        return;
    }

    if (land <= 0 || quantity <= 0) {
        showToast("Land area and quantity must be greater than zero.");
        return;
    }

    if (!selectedCenter) {
        showToast("Please select a procurement center.");
        return;
    }

    showStep(3);
});

/* BACK BUTTONS */
document.getElementById("backStep2")?.addEventListener("click", () => {
    showStep(1);
});

document.getElementById("backStep3")?.addEventListener("click", () => {
    showStep(2);
});

/* STEP 3: REGISTER FARMER AND CREATE BOOKING */
if (completeBtn) {
    completeBtn.addEventListener("click", async () => {
        if (isRegistering) return;

        const otp = document.getElementById("otp").value.trim();

        if (otp !== "123456") {
            showToast("Wrong OTP. Please enter demo OTP 123456.");
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
            selectedCenter: selectedCenter.name,
            center: selectedCenter.name
        };

        if (!farmerData.name || !/^[0-9]{10}$/.test(farmerData.mobile)) {
            showToast("Please check your name and mobile number.");
            showStep(1);
            return;
        }

        isRegistering = true;
        completeBtn.disabled = true;
        completeBtn.textContent = "Registering...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(farmerData)
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Registration failed.");
            }

            /*
              Support APIs that return either:
              { success: true, farmer: {...} }
              or the saved farmer object directly.
            */
            const savedFarmer = result.farmer || result;

            if (!savedFarmer.farmerId) {
                throw new Error("Registration response is missing Farmer ID.");
            }

            localStorage.setItem(
                "krishiSlotFarmer",
                JSON.stringify(savedFarmer)
            );

            document.getElementById("farmerId").textContent =
                savedFarmer.farmerId || "-";

            document.getElementById("successName").textContent =
                savedFarmer.name || farmerData.name;

            document.getElementById("successCrop").textContent =
                savedFarmer.crop || farmerData.crop;

            document.getElementById("successCenter").textContent =
                savedFarmer.selectedCenter || savedFarmer.center || farmerData.center;

            document.getElementById("successBookingDate").textContent =
                savedFarmer.bookingDate || "-";

            document.getElementById("successTimeSlot").textContent =
                savedFarmer.timeSlot || "-";

            document.getElementById("successTokenNumber").textContent =
                savedFarmer.tokenNumber || "-";

            formStep1?.classList.remove("active");
            formStep2?.classList.remove("active");
            formStep3?.classList.remove("active");

            stepIndicator1?.classList.remove("active");
            stepIndicator2?.classList.remove("active");
            stepIndicator3?.classList.remove("active");

            successScreen?.classList.add("show");

            showToast("Registration and slot booking successful!");

        } catch (error) {
            console.error("Registration error:", error);

            showToast(
                error.message || "Registration failed. Please try again."
            );
        } finally {
            isRegistering = false;
            completeBtn.disabled = false;
            completeBtn.textContent = "✓ Complete Registration";
        }
    });
}

/* FINISH REGISTRATION */
document.getElementById("finishBtn")?.addEventListener("click", () => {
    modal?.classList.remove("show");
    showToast("Registration complete! You can log in to view your booking.");
});

console.log("KrishiSlot registration script loaded successfully.");
