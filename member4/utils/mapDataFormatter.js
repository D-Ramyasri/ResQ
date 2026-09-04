function formatMapData(incident, assignments) {
    return {
        incident: {
            id: incident.id,
            latitude: incident.latitude,
            longitude: incident.longitude
        },

        resources: assignments.map(resource => ({
            resource_id: resource.resource_id,
            name: resource.resource_name,
            type: resource.type,
            latitude: resource.latitude,
            longitude: resource.longitude,
            status: resource.status
        }))
    };
}

module.exports = formatMapData;