const { resources, incidents } = require("../data/mockData");
const allocateResources = require("./allocationEngine");

function printAssignments(result) {
    for (const type in result.allocation) {
        result.allocation[type].forEach(resource => {
            console.log(resource.name);
        });
    }
}

console.log("INCIDENT 1");
console.log(incidents[0].description);

const requirements1 = {
    ambulance: 1,
    police: 1,
    fire: 0
};

const result1 = allocateResources(
    incidents[0],
    resources,
    requirements1
);

console.log("\nASSIGNED TO INCIDENT 1:");
printAssignments(result1);

console.log("\nINCIDENT 2");
console.log(incidents[1].description);

const requirements2 = {
    ambulance: 1,
    police: 0,
    fire: 1
};

const result2 = allocateResources(
    incidents[1],
    resources,
    requirements2
);

console.log("\nASSIGNED TO INCIDENT 2:");
printAssignments(result2);

console.log("\nUNFULFILLED INCIDENT 1:");
console.log(result1.unfulfilled);

console.log("\nUNFULFILLED INCIDENT 2:");
console.log(result2.unfulfilled);