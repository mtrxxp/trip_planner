from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import date
from sqlalchemy import create_engine, Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

Base.metadata.create_all(bind=engine)

class TripCreate(BaseModel):
    city: str
    start_date: date
    end_date: date

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/trips/")
def get_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    return trips

class TripCreate(BaseModel):
    city: str
    start_date: date
    end_date: date

class TripUpdate(TripCreate):
    pass

@app.post("/trips/")
def create_trip(trip: TripCreate):
    db = SessionLocal()
    try:
        db_trip = Trip(
            city=trip.city,
            start_date=trip.start_date,
            end_date=trip.end_date
        )
        db.add(db_trip)
        db.commit()
        db.refresh(db_trip)
        return {"message": "Trip saved", "trip": {
            "id": db_trip.id,
            "city": db_trip.city,
            "start_date": db_trip.start_date,
            "end_date": db_trip.end_date
        }}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/trips/{trip_id}")
def update_trip(trip_id: int, trip: TripUpdate):
    db = SessionLocal()
    db_trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db_trip.city = trip.city
    db_trip.start_date = trip.start_date
    db_trip.end_date = trip.end_date
    db.commit()
    db.refresh(db_trip)
    return db_trip

@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"detail": "Trip deleted"}
