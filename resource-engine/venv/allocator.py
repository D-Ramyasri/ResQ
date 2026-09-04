from math import radians, sin, cos, sqrt, atan2


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometres."""

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    return 2 * R * atan2(sqrt(a), sqrt(1 - a))


def recommend_resource(
    incident_type,
    incident_latitude,
    incident_longitude,
    resources
):
    """Find the best available resource for an incident."""

    # Match resource type to incident
    type_mapping = {
        "accident": "ambulance",
        "medical": "ambulance",
        "fire": "fire",
        "crime": "police",
        "security": "police"
    }

    required_type = type_mapping.get(
        incident_type.lower(),
        None
    )

    candidates = [
        resource for resource in resources
        if resource["status"] == "available"
        and (
            required_type is None
            or resource["type"] == required_type
        )
    ]

    if not candidates:
        return {
            "success": False,
            "message": "No suitable available resource found"
        }

    # Calculate distance for every candidate
    for resource in candidates:
        resource["distance_km"] = round(
            calculate_distance(
                incident_latitude,
                incident_longitude,
                resource["latitude"],
                resource["longitude"]
            ),
            2
        )

    # Nearest suitable resource
    best = min(
        candidates,
        key=lambda resource: resource["distance_km"]
    )

    return {
        "success": True,
        "recommended_resource": best
    }