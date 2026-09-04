const { resources, incidents } = require("../data/mockData");
const ResourceManager = require("./resourceManager");

const manager = new ResourceManager(resources);

console.log("INCIDENT 1:");

const result1 = manager.allocate(
    incidents[0],
    {
        ambulance: 1,
        police: 1,
        fire: 0
    }
);

console.log("Assigned:");

for (const type in result1.allocation) {
    result1.allocation[type].forEach(resource => {
        console.log(resource.name);
    });
}

console.log("\nResource statuses after Incident 1:");

resources.forEach(resource => {
    console.log(resource.name, "-", resource.status);
});

console.log("\nINCIDENT 2:");

const result2 = manager.allocate(
    incidents[1],
    {
        ambulance: 1,
        police: 0,
        fire: 1
    }
);

console.log("Assigned:");

for (const type in result2.allocation) {
    result2.allocation[type].forEach(resource => {
        console.log(resource.name);
    });
}

console.log("\nUNFULFILLED INCIDENT 2:");
console.log(result2.unfulfilled);

console.log("\nResource statuses after Incident 2:");

resources.forEach(resource => {
    console.log(resource.name, "-", resource.status);
});