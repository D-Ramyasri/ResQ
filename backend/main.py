from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Incident, Resource, Assignment


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="RESQ Emergency Response API",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# ROOT / HEALTH
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "RESQ Backend is running",
        "status": "ok"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ---------------------------------------------------------
# INCIDENTS
# ---------------------------------------------------------

@app.post("/incidents")
def create_incident(
    description: str,
    latitude: float,
    longitude: float,
    priority: str = "medium",
    db: Session = Depends(get_db)
):
    incident = Incident(
        description=description,
        latitude=latitude,
        longitude=longitude,
        priority=priority,
        status="pending"
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


@app.get("/incidents")
def get_incidents(
    db: Session = Depends(get_db)
):
    return db.query(Incident).all()


@app.get("/incidents/{incident_id}")
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident


@app.patch("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident.status = status

    db.commit()
    db.refresh(incident)

    return incident


# ---------------------------------------------------------
# RESOURCES
# ---------------------------------------------------------

@app.post("/resources")
def create_resource(
    name: str,
    resource_type: str,
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
    resource = Resource(
        name=name,
        resource_type=resource_type,
        latitude=latitude,
        longitude=longitude,
        status="available"
    )

    db.add(resource)
    db.commit()
    db.refresh(resource)

    return resource


@app.get("/resources")
def get_resources(
    db: Session = Depends(get_db)
):
    return db.query(Resource).all()


@app.get("/resources/available")
def get_available_resources(
    db: Session = Depends(get_db)
):
    return (
        db.query(Resource)
        .filter(Resource.status == "available")
        .all()
    )


@app.patch("/resources/{resource_id}/status")
def update_resource_status(
    resource_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    resource = (
        db.query(Resource)
        .filter(Resource.id == resource_id)
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    resource.status = status

    db.commit()
    db.refresh(resource)

    return resource


# ---------------------------------------------------------
# ASSIGN RESOURCE
# ---------------------------------------------------------

@app.post("/assign")
def assign_resource(
    incident_id: int,
    resource_id: int,
    db: Session = Depends(get_db)
):
    # Find incident
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Find resource
    resource = (
        db.query(Resource)
        .filter(Resource.id == resource_id)
        .first()
    )

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    # Check resource availability
    if resource.status != "available":
        raise HTTPException(
            status_code=400,
            detail="Resource is not available"
        )

    # Create assignment
    assignment = Assignment(
        incident_id=incident_id,
        resource_id=resource_id,
        status="assigned"
    )

    # Update statuses
    resource.status = "assigned"
    incident.status = "assigned"

    # Save to database
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {
        "message": "Resource assigned successfully",
        "assignment_id": assignment.id,
        "incident_id": incident_id,
        "resource_id": resource_id,
        "incident_status": incident.status,
        "resource_status": resource.status
    }