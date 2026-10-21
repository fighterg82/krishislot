 
 const API_URL = "https://krishislot.onrender.com/api/farmers";

const table = document.getElementById("farmerTable");
const total = document.getElementById("total");
const statusText = document.getElementById("status");
const search = document.getElementById("search");

let allFarmers = [];

async function loadFarmers() {
    statusText.textContent = "Loading farmers...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Backend directly returns an array
        const result = await response.json();

        if (!Array.isArray(result)) {
            throw new Error("API did not return a farmers array.");
        }

        allFarmers = result;
        total.textContent = allFarmers.length;

        renderFarmers();
        statusText.textContent =
            `Farmer data loaded successfully! Total: ${allFarmers.length}`;

    } catch (error) {
        statusText.textContent = "Error loading data: " + error.message;
        console.error("Load farmers error:", error);
    }
}

function renderFarmers() {
    const query = search.value.trim().toLowerCase();

    const filtered = allFarmers.filter(farmer =>
        [
            farmer.farmerId,
            farmer.name,
            farmer.mobile,
            farmer.district,
            farmer.village,
            farmer.crop,
            farmer.quantity,
            farmer.selectedCenter,
            farmer.bookingDate,
            farmer.timeSlot,
            farmer.tokenNumber,
            farmer.status
        ].some(value =>
            String(value ?? "").toLowerCase().includes(query)
        )
    );

    table.replaceChildren();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 13;
        cell.textContent = "No farmers found.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    filtered.forEach(farmer => {
        const row = document.createElement("tr");

        const values = [
            farmer.farmerId,
            farmer.name,
            farmer.mobile,
            farmer.district,
            farmer.village,
            farmer.crop,
            farmer.quantity,
            farmer.selectedCenter,
            farmer.bookingDate,
            farmer.timeSlot,
            farmer.tokenNumber
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        // Status dropdown
        const statusCell = document.createElement("td");
        const select = document.createElement("select");

        const statuses = [
            "Scheduled",
            "Arrived",
            "Processing",
            "Accepted",
            "Payment"
        ];

        const currentStatus = farmer.status || "Scheduled";

        statuses.forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            option.selected = status === currentStatus;
            select.appendChild(option);
        });

        statusCell.appendChild(select);
        row.appendChild(statusCell);

        // Update status button
        const actionCell = document.createElement("td");
        const button = document.createElement("button");

        button.textContent = "Update";

        button.addEventListener("click", async () => {
            button.disabled = true;
            button.textContent = "Saving...";

            try {
                const response = await fetch(
                    `${API_URL}/${encodeURIComponent(farmer._id)}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            status: select.value
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Status update failed."
                    );
                }

                farmer.status = result.farmer.status;

                statusText.textContent =
                    `${farmer.name}: status updated to ${farmer.status}.`;

            } catch (error) {
                statusText.textContent = "Error: " + error.message;

            } finally {
                button.disabled = false;
                button.textContent = "Update";
            }
        });

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        table.appendChild(row);
    });
}

// Search
search.addEventListener("input", renderFarmers);

// Refresh button
document.getElementById("refreshBtn").addEventListener(
    "click",
    loadFarmers
);

// Initial load
loadFarmers();
