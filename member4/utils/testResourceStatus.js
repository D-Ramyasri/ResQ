const { resources } = require("../data/mockData");

const {
    updateResourceStatus,
    releaseResource
} = require("./resourceStatus");

const ambulance = resources[0];

console.log("Initial status:");
console.log(ambulance.name, "-", ambulance.status);

console.log("\nAssigning resource:");
updateResourceStatus(ambulance, "assigned");
console.log(ambulance.name, "-", ambulance.status);

console.log("\nVehicle en route:");
updateResourceStatus(ambulance, "en_route");
console.log(ambulance.name, "-", ambulance.status);

console.log("\nVehicle arrived:");
updateResourceStatus(ambulance, "arrived");
console.log(ambulance.name, "-", ambulance.status);

console.log("\nEmergency completed:");
releaseResource(ambulance);
console.log(ambulance.name, "-", ambulance.status);