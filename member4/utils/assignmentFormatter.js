function formatAssignments(allocation) {
    const assignments = [];

    for (const type in allocation) {
        allocation[type].forEach(resource => {
            assignments.push({
                resource_id: resource.id,
                resource_name: resource.name,
                type: resource.type,
                latitude: resource.latitude,
                longitude: resource.longitude,
                status: "assigned"
            });
        });
    }

    return assignments;
}

module.exports = formatAssignments;