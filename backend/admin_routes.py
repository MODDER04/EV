from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import secrets
import string

from database import get_db, generate_client_code
from models import Client, ClientCode, Vehicle, ServiceRecord, InspectionReport

# Create admin router
admin_router = APIRouter(prefix="/admin", tags=["admin"])

# Pydantic models for requests/responses
class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class VehicleCreate(BaseModel):
    client_id: int
    make: str
    model: str
    year: int
    license_plate: str
    vin: Optional[str] = None
    color: Optional[str] = None

class VehicleResponse(BaseModel):
    id: int
    client_id: int
    make: str
    model: str
    year: int
    license_plate: str
    vin: Optional[str]
    color: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClientCodeCreate(BaseModel):
    client_id: int
    code: Optional[str] = None  # If not provided, will be auto-generated
    expires_at: Optional[datetime] = None

class ClientCodeResponse(BaseModel):
    id: int
    code: str
    client_id: int
    is_active: bool
    expires_at: Optional[datetime]
    created_at: datetime
    used_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_clients: int
    active_clients: int
    total_vehicles: int
    total_codes: int
    active_codes: int
    recent_clients: List[ClientResponse]
    recent_vehicles: List[VehicleResponse]

# Dashboard endpoint
@admin_router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    
    # Count statistics
    total_clients = db.query(Client).count()
    active_clients = db.query(Client).filter(Client.is_active == True).count()
    total_vehicles = db.query(Vehicle).count()
    total_codes = db.query(ClientCode).count()
    active_codes = db.query(ClientCode).filter(ClientCode.is_active == True).count()
    
    # Recent data
    recent_clients = db.query(Client).order_by(Client.created_at.desc()).limit(5).all()
    recent_vehicles = db.query(Vehicle).order_by(Vehicle.created_at.desc()).limit(5).all()
    
    return DashboardStats(
        total_clients=total_clients,
        active_clients=active_clients,
        total_vehicles=total_vehicles,
        total_codes=total_codes,
        active_codes=active_codes,
        recent_clients=recent_clients,
        recent_vehicles=recent_vehicles
    )

# Client management endpoints
@admin_router.get("/clients", response_model=List[ClientResponse])
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all clients"""
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients

@admin_router.post("/clients", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    db_client = Client(
        name=client.name,
        phone=client.phone,
        email=client.email,
        address=client.address,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@admin_router.get("/clients/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a specific client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@admin_router.put("/clients/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client: ClientCreate, db: Session = Depends(get_db)):
    """Update a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_client.name = client.name
    db_client.phone = client.phone
    db_client.email = client.email
    db_client.address = client.address
    
    db.commit()
    db.refresh(db_client)
    return db_client

@admin_router.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Deactivate instead of deleting to preserve data integrity
    client.is_active = False
    db.commit()
    return {"message": "Client deactivated successfully"}

# Vehicle management endpoints
@admin_router.get("/vehicles", response_model=List[VehicleResponse])
def get_vehicles(client_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all vehicles, optionally filtered by client"""
    query = db.query(Vehicle)
    if client_id:
        query = query.filter(Vehicle.client_id == client_id)
    vehicles = query.offset(skip).limit(limit).all()
    return vehicles

@admin_router.post("/vehicles", response_model=VehicleResponse)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Create a new vehicle"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == vehicle.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_vehicle = Vehicle(
        client_id=vehicle.client_id,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        license_plate=vehicle.license_plate,
        vin=vehicle.vin,
        color=vehicle.color,
        created_at=datetime.utcnow()
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@admin_router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Get a specific vehicle"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@admin_router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Update a vehicle"""
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_vehicle.make = vehicle.make
    db_vehicle.model = vehicle.model
    db_vehicle.year = vehicle.year
    db_vehicle.license_plate = vehicle.license_plate
    db_vehicle.vin = vehicle.vin
    db_vehicle.color = vehicle.color
    
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@admin_router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Delete a vehicle"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}

# Client code management endpoints
@admin_router.get("/client-codes", response_model=List[ClientCodeResponse])
def get_client_codes(client_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all client codes, optionally filtered by client"""
    query = db.query(ClientCode)
    if client_id:
        query = query.filter(ClientCode.client_id == client_id)
    codes = query.offset(skip).limit(limit).all()
    return codes

@admin_router.post("/client-codes", response_model=ClientCodeResponse)
def create_client_code(code_request: ClientCodeCreate, db: Session = Depends(get_db)):
    """Create a new client code"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == code_request.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Generate code if not provided
    code = code_request.code or generate_client_code()
    
    # Check if code already exists
    existing_code = db.query(ClientCode).filter(ClientCode.code == code).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Code already exists")
    
    db_code = ClientCode(
        code=code,
        client_id=code_request.client_id,
        is_active=True,
        expires_at=code_request.expires_at,
        created_at=datetime.utcnow()
    )
    db.add(db_code)
    db.commit()
    db.refresh(db_code)
    return db_code

@admin_router.put("/client-codes/{code_id}/toggle")
def toggle_client_code(code_id: int, db: Session = Depends(get_db)):
    """Toggle client code active status"""
    code = db.query(ClientCode).filter(ClientCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Client code not found")
    
    code.is_active = not code.is_active
    db.commit()
    return {"message": f"Code {'activated' if code.is_active else 'deactivated'} successfully"}

@admin_router.delete("/client-codes/{code_id}")
def delete_client_code(code_id: int, db: Session = Depends(get_db)):
    """Delete a client code"""
    code = db.query(ClientCode).filter(ClientCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Client code not found")
    
    db.delete(code)
    db.commit()
    return {"message": "Client code deleted successfully"}

# Generate new code endpoint
@admin_router.post("/generate-code")
def generate_new_code():
    """Generate a new unique client code"""
    return {"code": generate_client_code()}