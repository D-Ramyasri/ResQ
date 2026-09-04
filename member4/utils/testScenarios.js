const { resources, incidents } = require("../data/mockData");
const allocateResources = require("./allocationEngine");

function testScenario(incident, requirements) {
    console.log("\n==============================");
    console.log("INCIDENT:", incident.description);
    console.log("REQUIREMENTS:", requirements);

    const result = allocateResources(
        incident,
        resources,
        requirements
    );

    console.log("\nASSIGNED:");

    for (const type in result.allocation) {
        result.allocation[type].forEach(resource => {
            console.log(
                resource.name,
                "-",
                resource.distance.toFixed(2),
                "km"
            );
        });
    }

    console.log("\nUNFULFILLED:");
    console.log(result.unfulfilled);
}

// Accident
testScenario(incidents[0], {
    ambulance: 2,
    police: 1,
    fire: 0
});

// Fire
testScenario(incidents[1], {
    ambulance: 1,
    police: 0,
    fire: 1
});

// Critical emergency with insufficient ambulances
testScenario(incidents[0], {
    ambulance: 3,
    police: 2,
    fire: 1
});