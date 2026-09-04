const { resources, incidents } = require("../data/mockData");
const allocateResources = require("./allocationEngine");
const formatAssignments = require("./assignmentFormatter");
const formatMapData = require("./mapDataFormatter");

const incident = incidents[0];

const requirements = {
    ambulance: 2,
    police: 1,
    fire: 0
};

const result = allocateResources(
    incident,
    resources,
    requirements
);

const assignments = formatAssignments(result.allocation);

const mapData = formatMapData(
    incident,
    assignments
);

console.log(JSON.stringify(mapData, null, 2));