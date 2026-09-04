const calculateDistance = require("./distance");

function findNearestResource(
    incident,
    resources,
    requiredType
) {
    const eligibleResources = resources.filter(
        resource =>
            resource.status === "available" &&
            resource.type === requiredType
    );

    if (eligibleResources.length === 0) {
        return null;
    }

    const resourcesWithDistance =
        eligibleResources.map(resource => ({
            ...resource,

            distance: calculateDistance(
                incident.latitude,
                incident.longitude,
                resource.latitude,
                resource.longitude
            )
        }));

    resourcesWithDistance.sort(
        (a, b) => a.distance - b.distance
    );

    return resourcesWithDistance[0];
}


function findNearestResources(
    incident,
    resources,
    requiredType,
    count
) {
    const eligibleResources = resources
        .filter(
            resource =>
                resource.status === "available" &&
                resource.type === requiredType
        )
        .map(resource => ({
            ...resource,

            distance: calculateDistance(
                incident.latitude,
                incident.longitude,
                resource.latitude,
                resource.longitude
            )
        }))
        .sort(
            (a, b) =>
                a.distance - b.distance
        );

    return eligibleResources.slice(0, count);
}


module.exports = {
    findNearestResource,
    findNearestResources
};