// ============================================
// RESQ - EMERGENCY MAP
// ============================================


// ============================================
// MOCK DEPARTMENT VEHICLES
// ============================================

const resources = [
    {
        id: 1,
        name: "Ambulance 01",
        type: "ambulance",
        latitude: 17.4559,
        longitude: 78.6662,
        status: "available",
        capacity: 4
    },

    {
        id: 2,
        name: "Ambulance 02",
        type: "ambulance",
        latitude: 17.4500,
        longitude: 78.6700,
        status: "available",
        capacity: 4
    },

    {
        id: 3,
        name: "Ambulance 03",
        type: "ambulance",
        latitude: 17.4540,
        longitude: 78.6650,
        status: "busy",
        capacity: 4
    },

    {
        id: 4,
        name: "Police 01",
        type: "police",
        latitude: 17.4520,
        longitude: 78.6680,
        status: "available",
        capacity: 2
    },

    {
        id: 5,
        name: "Police 02",
        type: "police",
        latitude: 17.4580,
        longitude: 78.6620,
        status: "available",
        capacity: 2
    },

    {
        id: 6,
        name: "Fire Unit 01",
        type: "fire",
        latitude: 17.4600,
        longitude: 78.6610,
        status: "available",
        capacity: 5
    },

    {
        id: 7,
        name: "Fire Unit 02",
        type: "fire",
        latitude: 17.4480,
        longitude: 78.6710,
        status: "busy",
        capacity: 5
    }
];


// ============================================
// DEMO ASSIGNED VEHICLES
// ============================================

const assignedResources = [
    "Ambulance 01",
    "Police 01",
    "Fire Unit 01"
];


// ============================================
// DEFAULT MAP LOCATION
// ============================================

const defaultLocation = [
    17.4559,
    78.6662
];


// ============================================
// CREATE MAP
// ============================================

const map = L.map("map").setView(
    defaultLocation,
    14
);


// ============================================
// OPEN STREET MAP
// ============================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ============================================
// INCIDENT VARIABLES
// ============================================

let incidentMarker = null;

let incidentLocation = null;


// ============================================
// VEHICLE MARKERS
// ============================================

const vehicleMarkers = {};


// ============================================
// VEHICLE MOVEMENT TIMERS
// ============================================

const movementTimers = {};


// ============================================
// VEHICLE STATUS
// ============================================

const vehicleStatuses = {};

assignedResources.forEach(
    function(resourceName) {

        vehicleStatuses[resourceName] =
            "Assigned";
    }
);


// ============================================
// DISTANCE CALCULATION
// ============================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


// ============================================
// RESOURCE ICON
// ============================================

function getResourceIcon(type) {

    let emoji = "📍";

    if (type === "ambulance") {
        emoji = "🚑";
    }

    if (type === "police") {
        emoji = "🚓";
    }

    if (type === "fire") {
        emoji = "🚒";
    }

    return L.divIcon({

        className: "resource-marker",

        html:
            `<div class="vehicle-icon">
                ${emoji}
            </div>`,

        iconSize: [
            40,
            40
        ],

        iconAnchor: [
            20,
            20
        ]
    });
}


// ============================================
// ASSIGNED RESOURCE ICON
// ============================================

function getAssignedResourceIcon(type) {

    let emoji = "📍";

    if (type === "ambulance") {
        emoji = "🚑";
    }

    if (type === "police") {
        emoji = "🚓";
    }

    if (type === "fire") {
        emoji = "🚒";
    }

    return L.divIcon({

        className: "assigned-marker",

        html:
            `<div class="assigned-vehicle-icon">
                ${emoji}
            </div>`,

        iconSize: [
            50,
            50
        ],

        iconAnchor: [
            25,
            25
        ]
    });
}


// ============================================
// GET VEHICLE STATUS TEXT
// ============================================

function getStatusText(resourceName) {

    return vehicleStatuses[resourceName]
        || "Available";
}


// ============================================
// CREATE VEHICLE POPUP
// ============================================

function createVehiclePopup(resource) {

    const isAssigned =
        assignedResources.includes(
            resource.name
        );


    let assignmentText = "";


    if (isAssigned) {

        assignmentText = `

            <p class="assigned-text">

                🚨 Assigned to this incident

            </p>

            <p>

                <b>Response Status:</b>

                <span id="status-${resource.id}">
                    ${getStatusText(resource.name)}
                </span>

            </p>

        `;
    }


    return `

        <div class="vehicle-popup">

            <h3>
                ${resource.name}
            </h3>

            <p>
                <b>Department:</b>
                ${resource.type}
            </p>

            <p>
                <b>Vehicle Status:</b>
                ${resource.status}
            </p>

            <p>
                <b>Capacity:</b>
                ${resource.capacity}
            </p>

            ${assignmentText}

        </div>

    `;
}


// ============================================
// SHOW DEPARTMENT VEHICLES
// ============================================

function showResources() {

    resources.forEach(
        function(resource) {

            const isAssigned =
                assignedResources.includes(
                    resource.name
                );


            let icon;


            if (isAssigned) {

                icon =
                    getAssignedResourceIcon(
                        resource.type
                    );

            } else {

                icon =
                    getResourceIcon(
                        resource.type
                    );
            }


            const marker =
                L.marker(

                    [
                        resource.latitude,
                        resource.longitude
                    ],

                    {
                        icon: icon
                    }

                ).addTo(map);


            marker.bindPopup(
                createVehiclePopup(resource)
            );


            vehicleMarkers[resource.name] =
                marker;
        }
    );
}


// ============================================
// SHOW VEHICLES
// ============================================

showResources();


// ============================================
// UPDATE VEHICLE STATUS
// ============================================

function updateVehicleStatus(
    resource,
    status
) {

    vehicleStatuses[resource.name] =
        status;


    const statusElement =
        document.getElementById(
            "status-" + resource.id
        );


    if (statusElement) {

        statusElement.textContent =
            status;
    }


    // Update information panel

    const resourceElement =
        document.getElementById(
            "resource-status-" +
            resource.id
        );


    if (resourceElement) {

        resourceElement.textContent =
            status;
    }


    console.log(
        resource.name +
        " status: " +
        status
    );
}


// ============================================
// FIND ASSIGNED RESOURCES
// ============================================

function findAssignedResources() {

    if (incidentLocation === null) {
        return;
    }


    const resourceInfo =
        document.getElementById(
            "resourceInfo"
        );


    resourceInfo.innerHTML = `

        <h3>
            Assigned Resources
        </h3>

    `;


    const types = [
        "ambulance",
        "police",
        "fire"
    ];


    const resourceNames = {

        ambulance:
            "🚑 Ambulance",

        police:
            "🚓 Police",

        fire:
            "🚒 Fire"
    };


    types.forEach(
        function(type) {

            const assigned =
                resources.find(
                    function(resource) {

                        return (
                            resource.type === type &&
                            assignedResources.includes(
                                resource.name
                            )
                        );
                    }
                );


            if (assigned === undefined) {

                resourceInfo.innerHTML += `

                    <p class="no-resource">

                        ${resourceNames[type]}:
                        No vehicle assigned

                    </p>

                `;

                return;
            }


            const distance =
                calculateDistance(

                    incidentLocation.latitude,
                    incidentLocation.longitude,

                    assigned.latitude,
                    assigned.longitude
                );


            resourceInfo.innerHTML += `

                <div class="resource-result">

                    <div class="resource-name">

                        ${resourceNames[type]}

                        <b>
                            ${assigned.name}
                        </b>

                    </div>

                    <div>

                        <div class="resource-distance">

                            ${distance.toFixed(2)}
                            km away

                        </div>

                        <div
                            id="resource-status-${assigned.id}"
                            class="response-status"
                        >
                            Assigned
                        </div>

                    </div>

                </div>

            `;


            console.log(
                "Assigned " +
                type +
                ": " +
                assigned.name +
                " (" +
                distance.toFixed(2) +
                " km)"
            );
        }
    );
}


// ============================================
// SIMULATE VEHICLE MOVEMENT
// ============================================

function startVehicleMovement() {

    if (incidentLocation === null) {
        return;
    }


    console.log(
        "Vehicle movement simulation started."
    );


    assignedResources.forEach(
        function(resourceName) {

            const resource =
                resources.find(
                    function(item) {

                        return item.name ===
                            resourceName;
                    }
                );


            if (!resource) {
                return;
            }


            const marker =
                vehicleMarkers[
                    resource.name
                ];


            if (!marker) {
                return;
            }


            // Clear previous movement
            if (
                movementTimers[
                    resource.name
                ]
            ) {

                clearInterval(
                    movementTimers[
                        resource.name
                    ]
                );
            }


            // Initial status
            updateVehicleStatus(
                resource,
                "Assigned"
            );


            // Start moving after 2 seconds
            setTimeout(
                function() {

                    updateVehicleStatus(
                        resource,
                        "En Route"
                    );


                    movementTimers[
                        resource.name
                    ] =
                        setInterval(
                            function() {

                                const currentLat =
                                    resource.latitude;

                                const currentLon =
                                    resource.longitude;


                                const targetLat =
                                    incidentLocation.latitude;

                                const targetLon =
                                    incidentLocation.longitude;


                                const distance =
                                    calculateDistance(

                                        currentLat,
                                        currentLon,

                                        targetLat,
                                        targetLon
                                    );


                                // Vehicle arrived
                                if (
                                    distance < 0.05
                                ) {

                                    clearInterval(
                                        movementTimers[
                                            resource.name
                                        ]
                                    );


                                    resource.latitude =
                                        targetLat;

                                    resource.longitude =
                                        targetLon;


                                    marker.setLatLng([

                                        targetLat,

                                        targetLon

                                    ]);


                                    updateVehicleStatus(
                                        resource,
                                        "Arrived"
                                    );


                                    return;
                                }


                                // Move 5% toward incident
                                const newLat =
                                    currentLat +
                                    (
                                        targetLat -
                                        currentLat
                                    ) * 0.05;


                                const newLon =
                                    currentLon +
                                    (
                                        targetLon -
                                        currentLon
                                    ) * 0.05;


                                resource.latitude =
                                    newLat;

                                resource.longitude =
                                    newLon;


                                marker.setLatLng([

                                    newLat,

                                    newLon

                                ]);

                            },

                            1000
                        );

                },

                2000
            );
        }
    );
}


// ============================================
// GET INCIDENT LOCATION
// ============================================

function getIncidentLocation() {

    const status =
        document.getElementById(
            "status"
        );


    if (!navigator.geolocation) {

        status.textContent =
            "Geolocation is not supported by this browser.";

        return;
    }


    status.textContent =
        "Getting incident location...";


    // ========================================
    // GET LOCATION ONLY ONCE
    // ========================================

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            // ========================================
            // SAVE INCIDENT LOCATION
            // ========================================

            incidentLocation = {

                latitude:
                    latitude,

                longitude:
                    longitude
            };


            console.log(
                "INCIDENT LOCATION"
            );

            console.log(
                "Latitude:",
                latitude
            );

            console.log(
                "Longitude:",
                longitude
            );


            const location = [

                latitude,

                longitude
            ];


            // ========================================
            // MOVE MAP TO INCIDENT
            // ========================================

            map.setView(
                location,
                16
            );


            // ========================================
            // REMOVE OLD INCIDENT MARKER
            // ========================================

            if (
                incidentMarker !== null
            ) {

                map.removeLayer(
                    incidentMarker
                );
            }


            // ========================================
            // CREATE FIXED INCIDENT MARKER
            // ========================================

            incidentMarker =
                L.marker(
                    location
                ).addTo(map);


            incidentMarker
                .bindPopup(`

                    <div class="incident-popup">

                        <h3>
                            📍 Incident Location
                        </h3>

                        <p>
                            <b>Latitude:</b>
                            ${latitude.toFixed(6)}
                        </p>

                        <p>
                            <b>Longitude:</b>
                            ${longitude.toFixed(6)}
                        </p>

                    </div>

                `)
                .openPopup();


            // ========================================
            // UPDATE INCIDENT PANEL
            // ========================================

            const incidentInfo =
                document.getElementById(
                    "incidentInfo"
                );


            incidentInfo.innerHTML = `

                <p>
                    <b>
                        📍 Incident Location
                    </b>
                </p>

                <p>
                    Latitude:
                    ${latitude.toFixed(6)}
                </p>

                <p>
                    Longitude:
                    ${longitude.toFixed(6)}
                </p>

            `;


            // ========================================
            // FIND ASSIGNED VEHICLES
            // ========================================

            findAssignedResources();


            // ========================================
            // START VEHICLE MOVEMENT
            // ========================================

            startVehicleMovement();


            // ========================================
            // STATUS
            // ========================================

            status.textContent =
                "Incident identified. Assigned vehicles are moving toward the incident.";


            console.log(
                "Incident location saved."
            );

            console.log(
                "GPS tracking is NOT active."
            );
        },


        // ========================================
        // LOCATION ERROR
        // ========================================

        function(error) {

            let message =
                "Unable to get incident location.";


            if (
                error.code === 1
            ) {

                message =
                    "Location permission was denied.";
            }


            if (
                error.code === 2
            ) {

                message =
                    "Incident location is unavailable.";
            }


            if (
                error.code === 3
            ) {

                message =
                    "Location request timed out.";
            }


            status.textContent =
                message;
        }
    );
}


// ============================================
// BUTTON
// ============================================

document
    .getElementById("locateButton")
    .addEventListener(
        "click",
        getIncidentLocation
    );