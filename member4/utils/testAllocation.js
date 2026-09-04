const {
    resources,
    incidents
} = require("../data/mockData");

const {
    findNearestResources
} = require("./resourceMatcher");


// Use first incident
const incident = incidents[0];

console.log("INCIDENT:");
console.log(incident.description);
console.log(
    incident.latitude,
    incident.longitude
);


// Example:
// AI/backend says 2 ambulances are needed

const ambulances =
    findNearestResources(
        incident,
        resources,
        "ambulance",
        2
    );


console.log("\nASSIGNED AMBULANCES:");

ambulances.forEach(
    function(resource) {

        console.log(
            resource.name,
            "-",
            resource.distance.toFixed(2),
            "km"
        );
    }
);


// Example:
// AI/backend says 1 police vehicle is needed

const police =
    findNearestResources(
        incident,
        resources,
        "police",
        1
    );


console.log("\nASSIGNED POLICE:");

police.forEach(
    function(resource) {

        console.log(
            resource.name,
            "-",
            resource.distance.toFixed(2),
            "km"
        );
    }
);