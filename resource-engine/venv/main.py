from fastapi import FastAPI
from pydantic import BaseModel

from resources import resources
from allocator import recommend_resource


app = FastAPI(title="RESQ Resource Engine")


class Incident(BaseModel):
    incident_type: str
    latitude: float
    longitude: float


@app.get("/")
def root():
    return {"message": "RESQ Resource Engine is running"}


@app.get("/resources")
def get_resources():
    return resources


@app.get("/resources/available")
def get_available_resources():
    return [
        r for r in resources
        if r["status"] == "available"
    ]


@app.post("/resources/recommend")
def recommend(incident: Incident):

    return recommend_resource(
        incident.incident_type,
        incident.latitude,
        incident.longitude,
        resources
    )