const { findNearestResources } = require("./resourceMatcher");

function allocateResources(incident, resources, requirements) {
    const allocation = {};
    const unfulfilled = {};

    // Keep track of resources already assigned
    const assignedResourceIds = new Set();

    for (const type in requirements) {
        const requestedCount = requirements[type];

        allocation[type] = [];

        if (requestedCount <= 0) {
            unfulfilled[type] = 0;
            continue;
        }

        // Only use resources that have not already been assigned
        const availableResources = resources.filter(
            resource =>
                !assignedResourceIds.has(resource.id)
        );

        const assigned = findNearestResources(
            incident,
            availableResources,
            type,
            requestedCount
        );

        allocation[type] = assigned;

        // Remember assigned resources
        assigned.forEach(resource => {
            assignedResourceIds.add(resource.id);
        });

        unfulfilled[type] =
            requestedCount - assigned.length;
    }

    return {
        allocation,
        unfulfilled
    };
}

module.exports = allocateResources;