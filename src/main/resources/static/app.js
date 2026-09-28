const API = "http://localhost:8080/api";

let camps = [];
let selectedCampId = null;
let currentCamp = null;
let currentInventory = [];
let currentFamilies = [];

let activities = [];


// ======================================================
// BASIC HELPERS
// ======================================================

async function api(url, options = {}) {
    const response = await fetch(`${API}${url}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const data = await response.json();

            if (data.message) {
                message = data.message;
            } else if (data.error) {
                message = data.error;
            }
        } catch {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}


// ======================================================
// TOAST
// ======================================================

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ======================================================
// CLOCK
// ======================================================

function updateClock() {
    const clock = document.getElementById("clock");

    if (!clock) return;

    const now = new Date();

    clock.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

setInterval(updateClock, 1000);
updateClock();


// ======================================================
// CAMP DEDUPLICATION
// ======================================================

function getUniqueCamps(list) {

    const unique = new Map();

    list.forEach(camp => {

        const name = String(camp.name || "").trim().toLowerCase();
        const location = String(camp.location || "").trim().toLowerCase();

        const key = `${name}|${location}`;

        if (!unique.has(key)) {
            unique.set(key, camp);
        }

    });

    return Array.from(unique.values());
}


// ======================================================
// LOAD ALL CAMPS
// ======================================================

async function loadCamps() {

    try {

        const data = await api("/camps");

        camps = Array.isArray(data) ? data : [];

        // Remove duplicate name + location combinations
        camps = getUniqueCamps(camps);

        renderCampSelector();
        renderCampList();

        if (camps.length === 0) {

            selectedCampId = null;
            currentCamp = null;

            clearDashboard();

            return;
        }

        // Keep selected camp if it still exists
        const existing = camps.find(
            camp => Number(camp.id) === Number(selectedCampId)
        );

        if (existing) {
            selectedCampId = existing.id;
        } else {
            selectedCampId = camps[0].id;
        }

        const selector = document.getElementById("campSelector");

        if (selector) {
            selector.value = selectedCampId;
        }

        await loadSelectedCamp();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load camps. Make sure the server is running."
        );
    }
}


// ======================================================
// CAMP DROPDOWN
// ======================================================

function renderCampSelector() {

    const selector = document.getElementById("campSelector");

    if (!selector) return;

    if (camps.length === 0) {

        selector.innerHTML = `
            <option value="">No camps available</option>
        `;

        return;
    }

    selector.innerHTML = camps.map(camp => {

        return `
            <option value="${camp.id}">
                ${escapeHtml(camp.name)} · ${escapeHtml(camp.location)}
            </option>
        `;

    }).join("");

    selector.value = selectedCampId;
}


// ======================================================
// CAMP LIST
// ======================================================

function renderCampList() {

    const container = document.getElementById("campList");

    if (!container) return;

    if (camps.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No relief camps registered.
            </div>
        `;

        return;
    }

    container.innerHTML = camps.map(camp => {

        const capacity = Number(camp.capacity || 0);
        const occupancy = Number(camp.currentOccupancy || 0);
        const available = Math.max(capacity - occupancy, 0);

        return `
            <div class="list-row">

                <div>
                    <b>${escapeHtml(camp.name)}</b>
                    <span>${escapeHtml(camp.location)}</span>
                </div>

                <div>
                    <b>${occupancy}/${capacity}</b>
                    <span>${available} available</span>
                </div>

            </div>
        `;

    }).join("");
}


// ======================================================
// CAMP SELECT CHANGE
// ======================================================

document
    .getElementById("campSelector")
    ?.addEventListener("change", async function () {

        selectedCampId = Number(this.value);

        await loadSelectedCamp();

    });


// ======================================================
// LOAD SELECTED CAMP
// ======================================================

async function loadSelectedCamp() {

    if (!selectedCampId) return;

    try {

        currentCamp = await api(`/camps/${selectedCampId}`);

        currentInventory =
            await api(`/camps/${selectedCampId}/inventory`);

        currentFamilies =
            await api(`/camps/${selectedCampId}/families`);

        if (!Array.isArray(currentInventory)) {
            currentInventory = [];
        }

        if (!Array.isArray(currentFamilies)) {
            currentFamilies = [];
        }

        renderDashboard();

        renderInventory();

        renderFamilies();

        renderFamilySelect();

        renderSupplySelect();

    } catch (error) {

        console.error(error);

        showToast("Unable to load camp information.");
    }
}


// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

    if (!currentCamp) {
        clearDashboard();
        return;
    }

    const capacity =
        Number(currentCamp.capacity || 0);

    const occupancy =
        Number(currentCamp.currentOccupancy || 0);

    const available =
        Math.max(capacity - occupancy, 0);

    const percentage =
        capacity > 0
            ? Math.min((occupancy / capacity) * 100, 100)
            : 0;


    // ------------------------------------------
    // HERO
    // ------------------------------------------

    setText(
        "campName",
        currentCamp.name || "Relief Camp"
    );

    setText(
        "campLocation",
        currentCamp.location || "Location unavailable"
    );

    setText(
        "available",
        available
    );


    // ------------------------------------------
    // STATISTICS
    // ------------------------------------------

    setText(
        "totalCamps",
        camps.length
    );

    setText(
        "familyCount",
        currentFamilies.length
    );

    const totalPeople =
        currentFamilies.reduce(
            (sum, family) =>
                sum + Number(family.headcount || 0),
            0
        );

    setText(
        "totalPeople",
        totalPeople
    );

    setText(
        "availableStat",
        available
    );


    // ------------------------------------------
    // CAPACITY
    // ------------------------------------------

    setText(
        "occupancyPercent",
        `${Math.round(percentage)}%`
    );

    setText(
        "occupancy",
        `${occupancy} / ${capacity}`
    );

    setText(
        "availableCapacity",
        available
    );


    const statusElement =
        document.getElementById("campStatus");

    if (statusElement) {

        if (percentage >= 90) {

            statusElement.textContent =
                "NEAR CAPACITY";

            statusElement.style.color =
                "#dc2626";

        } else if (percentage >= 75) {

            statusElement.textContent =
                "HIGH OCCUPANCY";

            statusElement.style.color =
                "#d97706";

        } else {

            statusElement.textContent =
                "OPERATIONAL";

            statusElement.style.color =
                "#16a34a";
        }
    }


    // ------------------------------------------
    // CAPACITY RING
    // ------------------------------------------

    const ring =
        document.querySelector(".ring");

    if (ring) {

        const degrees =
            percentage * 3.6;

        ring.style.background = `
            conic-gradient(
                #7c3aed ${degrees}deg,
                #eee9f8 ${degrees}deg
            )
        `;
    }


    // ------------------------------------------
    // INVENTORY SUMMARY
    // ------------------------------------------

    const food =
        getInventoryQuantity("Food");

    const water =
        getInventoryQuantity("Water");

    const blankets =
        getInventoryQuantity("Blankets");

    const totalStock =
        food + water + blankets;

    setText(
        "foodStock",
        food
    );

    setText(
        "waterStock",
        water
    );

    setText(
        "totalStock",
        totalStock
    );

    updateStockBadge("foodAlert", food);

    updateStockBadge("waterAlert", water);


    renderInventoryBars();

    renderActivities();
}


// ======================================================
// CLEAR DASHBOARD
// ======================================================

function clearDashboard() {

    setText("campName", "No Camp Available");
    setText("campLocation", "Register a camp to begin");
    setText("available", "0");

    setText("totalCamps", "0");
    setText("familyCount", "0");
    setText("totalPeople", "0");
    setText("availableStat", "0");

    setText("occupancyPercent", "0%");
    setText("occupancy", "0 / 0");
    setText("availableCapacity", "0");

    setText("foodStock", "0");
    setText("waterStock", "0");
    setText("totalStock", "0");

    const inventoryBars =
        document.getElementById("inventoryBars");

    if (inventoryBars) {
        inventoryBars.innerHTML =
            `<div class="empty">No inventory available.</div>`;
    }
}


// ======================================================
// INVENTORY QUANTITY
// ======================================================

function getInventoryQuantity(type) {

    const item = currentInventory.find(
        supply =>
            String(supply.type || "").toLowerCase() ===
            String(type).toLowerCase()
    );

    return item
        ? Number(item.quantity || 0)
        : 0;
}


// ======================================================
// STOCK STATUS
// ======================================================

function getStockStatus(quantity) {

    quantity = Number(quantity || 0);

    if (quantity <= 50) {

        return {
            text: "CRITICAL",
            className: "critical"
        };

    }

    if (quantity <= 150) {

        return {
            text: "LOW",
            className: "low"
        };

    }

    return {
        text: "NORMAL",
        className: "normal"
    };
}


function updateStockBadge(id, quantity) {

    const element =
        document.getElementById(id);

    if (!element) return;

    const status =
        getStockStatus(quantity);

    element.textContent =
        status.text;

    element.className =
        `stock-badge ${status.className}`;
}


// ======================================================
// INVENTORY BARS
// ======================================================

function renderInventoryBars() {

    const container =
        document.getElementById("inventoryBars");

    if (!container) return;

    const food =
        getInventoryQuantity("Food");

    const water =
        getInventoryQuantity("Water");

    const blankets =
        getInventoryQuantity("Blankets");


    const items = [
        {
            name: "Food",
            quantity: food
        },
        {
            name: "Water",
            quantity: water
        },
        {
            name: "Blankets",
            quantity: blankets
        }
    ];


    const max =
        Math.max(
            ...items.map(item =>
                Number(item.quantity)
            ),
            1
        );


    container.innerHTML =
        items.map(item => {

            const percentage =
                Math.min(
                    (item.quantity / max) * 100,
                    100
                );

            return `
                <div class="bar-row">

                    <div class="bar-label">
                        <span>${item.name}</span>
                        <b>${item.quantity}</b>
                    </div>

                    <div class="bar">
                        <i style="width:${percentage}%"></i>
                    </div>

                </div>
            `;

        }).join("");
}


// ======================================================
// INVENTORY SECTION
// ======================================================

function renderInventory() {

    const container =
        document.getElementById("inventoryList");

    if (!container) return;

    if (currentInventory.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No supplies available for this camp.
            </div>
        `;

        return;
    }


    container.innerHTML =
        currentInventory.map(supply => {

            const quantity =
                Number(supply.quantity || 0);

            const status =
                getStockStatus(quantity);

            return `
                <div class="list-row">

                    <div>
                        <b>${escapeHtml(supply.type)}</b>
                        <span>Available stock</span>
                    </div>

                    <div>
                        <b>${quantity}</b>

                        <span
                            class="stock-badge ${status.className}">
                            ${status.text}
                        </span>
                    </div>

                </div>
            `;

        }).join("");
}


// ======================================================
// FAMILIES
// ======================================================

function renderFamilies() {

    const container =
        document.getElementById("familyList");

    if (!container) return;

    setText(
        "familyCount2",
        currentFamilies.length
    );


    if (currentFamilies.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No families currently housed.
            </div>
        `;

        return;
    }


    container.innerHTML =
        currentFamilies.map(family => {

            const headcount =
                Number(family.headcount || 0);

            return `
                <div class="list-row">

                    <div>
                        <b>${escapeHtml(family.name)}</b>
                        <span>Family registered</span>
                    </div>

                    <div>
                        <b>${headcount}</b>
                        <span>
                            ${headcount === 1
                                ? "person"
                                : "people"}
                        </span>
                    </div>

                </div>
            `;

        }).join("");
}


// ======================================================
// FAMILY SELECT
// ======================================================

function renderFamilySelect() {

    const select =
        document.getElementById("familySelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select family
        </option>
    `;


    currentFamilies.forEach(family => {

        const option =
            document.createElement("option");

        option.value =
            family.id;

        option.textContent =
            `${family.name} · ${family.headcount} people`;

        select.appendChild(option);
    });
}


// ======================================================
// SUPPLY SELECT
// ======================================================

function renderSupplySelect() {

    const select =
        document.getElementById("supplySelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select supply
        </option>
    `;


    currentInventory.forEach(supply => {

        const quantity =
            Number(supply.quantity || 0);

        if (quantity <= 0) return;

        const option =
            document.createElement("option");

        option.value =
            supply.id;

        option.textContent =
            `${supply.type} · ${quantity} available`;

        select.appendChild(option);
    });
}


// ======================================================
// ACTIVITIES
// ======================================================

function addActivity(type, title, description) {

    activities.unshift({
        type,
        title,
        description,
        time: new Date()
    });


    // Keep only recent 8
    activities =
        activities.slice(0, 8);

    renderActivities();
}


function renderActivities() {

    const container =
        document.getElementById("activityList");

    if (!container) return;


    if (activities.length === 0) {

        container.innerHTML = `
            <div class="activity-empty">

                <span>◷</span>

                <div>
                    <b>System monitoring active</b>

                    <small>
                        Live camp data is being monitored.
                    </small>
                </div>

            </div>
        `;

        return;
    }


    container.innerHTML =
        activities.map(activity => {

            return `
                <div class="activity-item">

                    <div class="activity-icon">
                        ${getActivityIcon(activity.type)}
                    </div>

                    <div>
                        <b>${escapeHtml(activity.title)}</b>

                        <small>
                            ${escapeHtml(activity.description)}
                        </small>
                    </div>

                    <div class="activity-time">
                        ${formatActivityTime(activity.time)}
                    </div>

                </div>
            `;

        }).join("");
}


// ======================================================
// ACTIVITY ICONS
// ======================================================

function getActivityIcon(type) {

    const icons = {

        camp: "⌂",

        supply: "▣",

        family: "♙",

        distribution: "⇄"

    };

    return icons[type] || "●";
}


function formatActivityTime(date) {

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ======================================================
// CAMP FORM
// ======================================================

document
    .getElementById("campForm")
    ?.addEventListener("submit", async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("campNameInput")
                .value
                .trim();

        const location =
            document
                .getElementById("campLocationInput")
                .value
                .trim();

        const capacity =
            Number(
                document
                    .getElementById("campCapacityInput")
                    .value
            );


        if (!name || !location || capacity <= 0) {

            showToast(
                "Please enter valid camp details."
            );

            return;
        }


        try {

            const created =
                await api("/camps", {

                    method: "POST",

                    body: JSON.stringify({
                        name,
                        location,
                        capacity
                    })

                });


            showToast(
                "Relief camp registered successfully."
            );


            addActivity(
                "camp",
                "New camp registered",
                `${name} · ${location}`
            );


            this.reset();

            await loadCamps();


            if (created?.id) {
                selectedCampId = created.id;

                const selector =
                    document.getElementById(
                        "campSelector"
                    );

                if (selector) {
                    selector.value =
                        created.id;
                }

                await loadSelectedCamp();
            }

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Unable to register camp."
            );
        }

    });


// ======================================================
// SUPPLY FORM
// ======================================================

document
    .getElementById("supplyForm")
    ?.addEventListener("submit", async function (event) {

        event.preventDefault();


        if (!selectedCampId) {

            showToast(
                "Please select a camp first."
            );

            return;
        }


        const type =
            document
                .getElementById("supplyType")
                .value;

        const quantity =
            Number(
                document
                    .getElementById("supplyQuantity")
                    .value
            );


        if (!type || quantity <= 0) {

            showToast(
                "Please select a supply and enter quantity."
            );

            return;
        }


        try {

            await api("/supplies", {

                method: "POST",

                body: JSON.stringify({

                    type,
                    quantity,
                    campId: selectedCampId

                })

            });


            showToast(
                `${type} supply added successfully.`
            );


            addActivity(
                "supply",
                "Supply received",
                `${quantity} units of ${type}`
            );


            this.reset();

            await loadSelectedCamp();

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Unable to add supply."
            );
        }

    });


// ======================================================
// FAMILY FORM
// ======================================================

document
    .getElementById("familyForm")
    ?.addEventListener("submit", async function (event) {

        event.preventDefault();


        if (!selectedCampId) {

            showToast(
                "Please select a camp first."
            );

            return;
        }


        const name =
            document
                .getElementById("familyNameInput")
                .value
                .trim();

        const headcount =
            Number(
                document
                    .getElementById("familyHeadcountInput")
                    .value
            );


        if (!name || headcount <= 0) {

            showToast(
                "Please enter valid family details."
            );

            return;
        }


        // Frontend capacity check
        const capacity =
            Number(currentCamp?.capacity || 0);

        const occupancy =
            Number(
                currentCamp?.currentOccupancy || 0
            );

        const available =
            capacity - occupancy;


        if (headcount > available) {

            showToast(
                `Only ${available} spaces are available in this camp.`
            );

            return;
        }


        try {

            await api("/families", {

                method: "POST",

                body: JSON.stringify({

                    name,
                    headcount,
                    campId: selectedCampId

                })

            });


            showToast(
                "Family registered successfully."
            );


            addActivity(
                "family",
                "Family registered",
                `${name} · ${headcount} people`
            );


            this.reset();

            await loadSelectedCamp();

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Unable to register family."
            );
        }

    });


// ======================================================
// DISTRIBUTION FORM
// ======================================================

document
    .getElementById("distributionForm")
    ?.addEventListener("submit", async function (event) {

        event.preventDefault();


        if (!selectedCampId) {

            showToast(
                "Please select a camp first."
            );

            return;
        }


        const familyId =
            Number(
                document
                    .getElementById("familySelect")
                    .value
            );

        const supplyId =
            Number(
                document
                    .getElementById("supplySelect")
                    .value
            );

        const quantity =
            Number(
                document
                    .getElementById("distributionQuantity")
                    .value
            );


        if (
            !familyId ||
            !supplyId ||
            quantity <= 0
        ) {

            showToast(
                "Please complete all distribution fields."
            );

            return;
        }


        // Frontend inventory validation
        const supply =
            currentInventory.find(
                item =>
                    Number(item.id) === supplyId
            );


        if (!supply) {

            showToast(
                "Selected supply was not found."
            );

            return;
        }


        const available =
            Number(supply.quantity || 0);


        if (quantity > available) {

            showToast(
                `Only ${available} units are available.`
            );

            return;
        }


        const family =
            currentFamilies.find(
                item =>
                    Number(item.id) === familyId
            );


        if (!family) {

            showToast(
                "Selected family was not found."
            );

            return;
        }


        try {

            await api("/distributions", {

                method: "POST",

                body: JSON.stringify({

                    quantity,
                    familyId,
                    supplyId

                })

            });


            showToast(
                "Distribution completed successfully."
            );


            addActivity(
                "distribution",
                "Resource distributed",
                `${quantity} ${supply.type} → ${family.name}`
            );


            this.reset();

            await loadSelectedCamp();

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Distribution failed. Check available inventory."
            );
        }

    });


// ======================================================
// NAVIGATION
// ======================================================

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const section =
                    this.dataset.section;

                // Remove active from all buttons
                document
                    .querySelectorAll(".nav-item")
                    .forEach(item =>
                        item.classList.remove("active")
                    );


                // Activate clicked button
                this.classList.add("active");


                // Hide all sections
                document
                    .querySelectorAll(".section")
                    .forEach(item =>
                        item.classList.remove("active")
                    );


                // Show selected section
                const target =
                    document.getElementById(section);

                if (target) {
                    target.classList.add("active");
                }


                // Page title
                const titles = {

                    overview: "Command Overview",

                    camps: "Relief Camps",

                    inventory: "Inventory Control",

                    families: "Family Registry",

                    distribution: "Supply Distribution"

                };


                setText(
                    "pageTitle",
                    titles[section] || "Command Overview"
                );

            }
        );

    });


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// SET TEXT
// ======================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ======================================================
// START APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "ReliefCamp Command Center started."
        );

        await loadCamps();

    }
);