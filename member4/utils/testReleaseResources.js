const { resources, incidents } = require("../data/mockData");
const ResourceManager = require("./resourceManager");

const manager = new ResourceManager(resources);

console.log("ALLOCATING INCIDENT 1:");

manager.allocate(
    incidents[0],
    {
        ambulance: 1,
        police: 1,
        fire: 0
    }
);

console.log("\nBefore release:");

resources.forEach(resource => {
    console.log(resource.name, "-", resource.status);
});

console.log("\nReleasing Incident 1 resources...");

manager.releaseResources(incidents[0].id);

console.log("\nAfter release:");

resources.forEach(resource => {
    console.log(resource.name, "-", resource.status);
});