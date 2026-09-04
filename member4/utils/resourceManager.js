const allocateResources = require("./allocationEngine");

class ResourceManager {
    constructor(resources) {
        this.resources = resources;
        this.activeAssignments = {};
    }

    allocate(incident, requirements) {
        const availableResources = this.resources.filter(
            resource => resource.status === "available"
        );

        const result = allocateResources(
            incident,
            availableResources,
            requirements
        );

        for (const type in result.allocation) {
            result.allocation[type].forEach(resource => {
                const actualResource = this.resources.find(
                    item => item.id === resource.id
                );

                if (actualResource) {
                    actualResource.status = "assigned";

                    this.activeAssignments[actualResource.id] =
                        incident.id;
                }
            });
        }

        return result;
    }

    releaseResources(incidentId) {
        for (const resourceId in this.activeAssignments) {
            if (this.activeAssignments[resourceId] === incidentId) {
                const resource = this.resources.find(
                    item => item.id === Number(resourceId)
                );

                if (resource) {
                    resource.status = "available";
                }

                delete this.activeAssignments[resourceId];
            }
        }
    }
}

module.exports = ResourceManager;