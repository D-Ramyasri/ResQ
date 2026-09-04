const { resources, incidents } = require("../data/mockData");
const allocateResources = require("./allocationEngine");
const formatAssignments = require("./assignmentFormatter");

const incident = incidents[0];

const requirements = {
    ambulance: 3,
    police: 1,
    fire: 0
};

const result = allocateResources(
    incident,
    resources,
    requirements
);

const assignments = formatAssignments(result.allocation);

console.log("INCIDENT:");
console.log(incident.description);

console.log("\nASSIGNMENTS:");

console.log(JSON.stringify(assignments, null, 2));

console.log("\nUNFULFILLED:");

console.log(result.unfulfilled);