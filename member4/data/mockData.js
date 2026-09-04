const resources = [
    {
        id: 1,
        name: "Ambulance 01",
        type: "ambulance",
        latitude: 17.4559,
        longitude: 78.6662,
        status: "available",
        capacity: 4
    },
    {
        id: 2,
        name: "Ambulance 02",
        type: "ambulance",
        latitude: 17.4500,
        longitude: 78.6700,
        status: "available",
        capacity: 4
    },
    {
        id: 3,
        name: "Ambulance 03",
        type: "ambulance",
        latitude: 17.4540,
        longitude: 78.6650,
        status: "busy",
        capacity: 4
    },
    {
        id: 4,
        name: "Police 01",
        type: "police",
        latitude: 17.4520,
        longitude: 78.6680,
        status: "available",
        capacity: 2
    },
    {
        id: 5,
        name: "Police 02",
        type: "police",
        latitude: 17.4580,
        longitude: 78.6620,
        status: "available",
        capacity: 2
    },
    {
        id: 6,
        name: "Fire Unit 01",
        type: "fire",
        latitude: 17.4600,
        longitude: 78.6610,
        status: "available",
        capacity: 5
    },
    {
        id: 7,
        name: "Fire Unit 02",
        type: "fire",
        latitude: 17.4480,
        longitude: 78.6710,
        status: "busy",
        capacity: 5
    }
];

const incidents = [
    {
        id: 101,
        type: "accident",
        description: "Road accident near SNIST gate",
        latitude: 17.4535,
        longitude: 78.6645,
        severity: "high",
        priority_score: 92,
        status: "reported",
        people_affected: 4
    },
    {
        id: 102,
        type: "fire",
        description: "Fire reported in a building",
        latitude: 17.4585,
        longitude: 78.6635,
        severity: "critical",
        priority_score: 98,
        status: "reported",
        people_affected: 10
    }
];

module.exports = {
    resources,
    incidents
};