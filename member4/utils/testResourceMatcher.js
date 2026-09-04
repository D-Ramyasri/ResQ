const {
    findNearestResource,
    findNearestResources
} = require("./resourceMatcher");

const resources = [
    {
        id: 1,
        name: "Ambulance 01",
        type: "ambulance",
        latitude: 17.4559,
        longitude: 78.6662,
        status: "available"
    },

    {
        id: 2,
        name: "Ambulance 02",
        type: "ambulance",
        latitude: 17.4500,
        longitude: 78.6700,
        status: "available"
    },

    {
        id: 3,
        name: "Ambulance 03",
        type: "ambulance",
        latitude: 17.4540,
        longitude: 78.6650,
        status: "busy"
    },

    {
        id: 4,
        name: "Police 01",
        type: "police",
        latitude: 17.4520,
        longitude: 78.6680,
        status: "available"
    }
];

const incident = {
    id: 101,
    latitude: 17.4535,
    longitude: 78.6645
};


// TEST 1
// Find nearest available ambulance

const nearestAmbulance =
    findNearestResource(
        incident,
        resources,
        "ambulance"
    );

console.log(
    "TEST 1 - Nearest ambulance:"
);

console.log(nearestAmbulance);


// TEST 2
// Find two nearest available ambulances

const twoAmbulances =
    findNearestResources(
        incident,
        resources,
        "ambulance",
        2
    );

console.log(
    "\nTEST 2 - Two nearest ambulances:"
);

console.log(twoAmbulances);


// TEST 3
// Find nearest police

const nearestPolice =
    findNearestResource(
        incident,
        resources,
        "police"
    );

console.log(
    "\nTEST 3 - Nearest police:"
);

console.log(nearestPolice);


// TEST 4
// Request three ambulances
// but only two are available

const threeAmbulances =
    findNearestResources(
        incident,
        resources,
        "ambulance",
        3
    );

console.log(
    "\nTEST 4 - Request three ambulances:"
);

console.log(threeAmbulances);