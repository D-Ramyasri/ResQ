const { resources, incidents } = require("../data/mockData");
const allocateResources = require("./allocationEngine");

const incident = incidents[0];

const requirements = {
    ambulance: 2,
    police: 1,
    fire: 0
};

const allocation = allocateResources(
    incident,
    resources,
    requirements
);

console.log("INCIDENT:");
console.log(incident.description);

console.log("\nALLOCATED RESOURCES:");

for (const type in allocation) {
    console.log("\n" + type.toUpperCase() + ":");

    allocation[type].forEach(resource => {
        console.log(
            resource.name,
            "-",
            resource.distance.toFixed(2),
            "km"
        );
    });
}