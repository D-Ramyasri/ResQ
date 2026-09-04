from fastapi import FastAPI
from pydantic import BaseModel
from database import get_connection, init_db

app = FastAPI(title="RESQ Backend")

init_db()


class Incident(BaseModel):
    incident_type: str
    description: str = ""
    latitude: float
    longitude: float
    severity: str = "medium"


@app.get("/")
def root():
    return {"message": "RESQ Backend is running"}


@app.post("/incidents")
def create_incident(incident: Incident):

    conn = get_connection()

    cursor = conn.execute(
        """
        INSERT INTO incidents
        (incident_type, description, latitude, longitude, severity)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            incident.incident_type,
            incident.description,
            incident.latitude,
            incident.longitude,
            incident.severity
        )
    )

    conn.commit()

    incident_id = cursor.lastrowid
    conn.close()

    return {
        "success": True,
        "incident_id": incident_id,
        "message": "Emergency reported successfully"
    }
@app.get("/incidents")
def get_incidents():

    conn = get_connection()
    conn.row_factory = __import__("sqlite3").Row

    rows = conn.execute(
        "SELECT * FROM incidents ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return [dict(row) for row in rows]