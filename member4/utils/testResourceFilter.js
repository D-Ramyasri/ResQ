const {
    getAvailableResources,
    getResourcesByType
} = require("./resourceFilter");

const resources = [
    {
        id: 1,
        name: "Ambulance 01",
        type: "ambulance",
        status: "available"
    },
    {
        id: 2,
        name: "Ambulance 02",
        type: "ambulance",
        status: "busy"
    },
    {
        id: 3,
        name: "Police 01",
        type: "police",
        status: "available"
    },
    {
        id: 4,
        name: "Fire Unit 01",
        type: "fire",
        status: "offline"
    }
];

const available =
    getAvailableResources(resources);

console.log("Available resources:");
console.log(available);

const ambulances =
    getResourcesByType(
        resources,
        "ambulance"
    );

console.log("Ambulances:");
console.log(ambulances);