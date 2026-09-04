function getAvailableResources(resources) {
    return resources.filter(
        resource => resource.status === "available"
    );
}

function getResourcesByType(resources, type) {
    return resources.filter(
        resource => resource.type === type
    );
}

module.exports = {
    getAvailableResources,
    getResourcesByType
};