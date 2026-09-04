function updateResourceStatus(resource, newStatus) {
    const validStatuses = [
        "available",
        "assigned",
        "en_route",
        "arrived"
    ];

    if (!validStatuses.includes(newStatus)) {
        return false;
    }

    resource.status = newStatus;
    return true;
}

function releaseResource(resource) {
    resource.status = "available";
    return resource;
}

module.exports = {
    updateResourceStatus,
    releaseResource
};