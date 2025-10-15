from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import secrets
import string

from database import get_db, generate_client_code
from models import Client, ClientCode, Vehicle, ServiceRecord, ServiceItem, InspectionReport, InspectionItem

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
    mileage: Optional[int] = None

class VehicleResponse(BaseModel):
    id: int
    client_id: int
    make: str
    model: str
    year: int
    license_plate: str
    vin: Optional[str]
    color: Optional[str]
    mileage: Optional[int]
    created_at: datetime
    client: Optional[ClientResponse] = None
    
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
@admin_router.get("/vehicles")
def get_vehicles(client_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all vehicles, optionally filtered by client"""
    query = db.query(Vehicle).options(joinedload(Vehicle.owner))
    if client_id:
        query = query.filter(Vehicle.client_id == client_id)
    vehicles = query.offset(skip).limit(limit).all()
    
    # Manually construct the response with client information
    result = []
    for vehicle in vehicles:
        vehicle_dict = {
            "id": vehicle.id,
            "client_id": vehicle.client_id,
            "make": vehicle.make,
            "model": vehicle.model,
            "year": vehicle.year,
            "license_plate": vehicle.license_plate,
            "vin": vehicle.vin,
            "color": vehicle.color,
            "mileage": vehicle.mileage,
            "created_at": vehicle.created_at,
            "client": {
                "id": vehicle.owner.id,
                "name": vehicle.owner.name,
                "phone": vehicle.owner.phone,
                "email": vehicle.owner.email,
                "address": vehicle.owner.address,
                "is_active": vehicle.owner.is_active,
                "created_at": vehicle.owner.created_at
            } if vehicle.owner else None
        }
        result.append(vehicle_dict)
    
    return result

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
        mileage=vehicle.mileage,
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
    db_vehicle.mileage = vehicle.mileage
    
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

# Service Records Management
class ServiceItemCreate(BaseModel):
    service_type: str
    service_name: str
    description: Optional[str] = None
    price: float

class ServiceItemResponse(BaseModel):
    id: int
    service_record_id: int
    service_type: str
    service_name: str
    description: Optional[str]
    price: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ServiceRecordCreate(BaseModel):
    vehicle_id: int
    service_date: datetime
    status: Optional[str] = "completed"
    technician_notes: Optional[str] = None
    service_items: List[ServiceItemCreate]
    linked_inspection_id: Optional[int] = None

class ServiceRecordResponse(BaseModel):
    id: int
    vehicle_id: int
    service_date: datetime
    status: str
    technician_notes: Optional[str]
    total_cost: float
    created_at: datetime
    vehicle: Optional[VehicleResponse] = None
    service_items: List[ServiceItemResponse] = []
    
    class Config:
        from_attributes = True

@admin_router.get("/service-records", response_model=List[ServiceRecordResponse])
def get_service_records(vehicle_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all service records, optionally filtered by vehicle"""
    query = db.query(ServiceRecord).options(
        joinedload(ServiceRecord.vehicle),
        joinedload(ServiceRecord.service_items)
    )
    if vehicle_id:
        query = query.filter(ServiceRecord.vehicle_id == vehicle_id)
    records = query.offset(skip).limit(limit).all()
    return records

@admin_router.post("/service-records", response_model=ServiceRecordResponse)
def create_service_record(record: ServiceRecordCreate, db: Session = Depends(get_db)):
    """Create a new service record with service items"""
    try:
        # Verify vehicle exists
        vehicle = db.query(Vehicle).filter(Vehicle.id == record.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Calculate total cost
        total_cost = sum(item.price for item in record.service_items)
        
        # Handle inspection linking
        linked_inspection_id = None
        inspection_report = None
        
        if record.linked_inspection_id:
            # Link to existing inspection
            existing_inspection = db.query(InspectionReport).filter(
                InspectionReport.id == record.linked_inspection_id,
                InspectionReport.vehicle_id == record.vehicle_id
            ).first()
            if not existing_inspection:
                raise HTTPException(status_code=404, detail="Inspection not found or doesn't belong to this vehicle")
            
            # If inspection is already linked to another service, unlink it first
            existing_link = db.query(ServiceRecord).filter(
                ServiceRecord.linked_inspection_id == record.linked_inspection_id
            ).first()
            if existing_link:
                # Unlink from previous service
                existing_link.linked_inspection_id = None
            
            linked_inspection_id = existing_inspection.id
            inspection_report = existing_inspection
        else:
            # Check if any service item is an inspection and create new one if needed
            has_inspection = any(item.service_type == "inspection" for item in record.service_items)
            
            if has_inspection:
                # Create new inspection report
                inspection_report = InspectionReport(
                    vehicle_id=record.vehicle_id,
                    inspection_date=record.service_date,
                    overall_condition="good",  # Default, can be updated later
                    technician_notes=record.technician_notes,
                    recommendations="Standard inspection completed as part of service.",
                    created_at=datetime.utcnow()
                )
                db.add(inspection_report)
                db.flush()  # Get the inspection ID
                linked_inspection_id = inspection_report.id
                
                # Create default inspection items
                default_inspection_items = [
                    {"item_name": "Engine Oil", "status": "good", "notes": "Oil level and condition checked"},
                    {"item_name": "Tire Condition", "status": "good", "notes": "Tire wear and pressure checked"},
                    {"item_name": "Brake System", "status": "good", "notes": "Brake pads and fluid inspected"},
                    {"item_name": "Battery", "status": "good", "notes": "Battery health verified"},
                    {"item_name": "Lights", "status": "good", "notes": "All lights functioning properly"}
                ]
                
                for item_data in default_inspection_items:
                    inspection_item = InspectionItem(
                        inspection_id=inspection_report.id,
                        item_name=item_data["item_name"],
                        status=item_data["status"],
                        notes=item_data["notes"]
                    )
                    db.add(inspection_item)
        
        # Create service record
        db_record = ServiceRecord(
            vehicle_id=record.vehicle_id,
            service_date=record.service_date,
            status=record.status,
            technician_notes=record.technician_notes,
            total_cost=total_cost,
            linked_inspection_id=linked_inspection_id,
            created_at=datetime.utcnow()
        )
        db.add(db_record)
        db.flush()  # Get the service ID
        
        # Update inspection to link back to service if we created one
        if linked_inspection_id:
            inspection_report.linked_service_record_id = db_record.id
        
        # Create service items
        service_items = []
        for item_data in record.service_items:
            service_item = ServiceItem(
                service_record_id=db_record.id,
                service_type=item_data.service_type,
                service_name=item_data.service_name,
                description=item_data.description,
                price=item_data.price,
                created_at=datetime.utcnow()
            )
            service_items.append(service_item)
            db.add(service_item)
        
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.get("/service-records/{record_id}", response_model=ServiceRecordResponse)
def get_service_record(record_id: int, db: Session = Depends(get_db)):
    """Get a specific service record"""
    record = db.query(ServiceRecord).options(
        joinedload(ServiceRecord.vehicle),
        joinedload(ServiceRecord.service_items)
    ).filter(ServiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Service record not found")
    return record

@admin_router.put("/service-records/{record_id}", response_model=ServiceRecordResponse)
def update_service_record(record_id: int, record: ServiceRecordCreate, db: Session = Depends(get_db)):
    """Update a service record with service items"""
    try:
        db_record = db.query(ServiceRecord).filter(ServiceRecord.id == record_id).first()
        if not db_record:
            raise HTTPException(status_code=404, detail="Service record not found")
        
        # Verify vehicle exists if changing vehicle_id
        if record.vehicle_id != db_record.vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.id == record.vehicle_id).first()
            if not vehicle:
                raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Calculate new total cost
        total_cost = sum(item.price for item in record.service_items)
        
        # Update service record
        db_record.vehicle_id = record.vehicle_id
        db_record.service_date = record.service_date
        db_record.status = record.status
        db_record.technician_notes = record.technician_notes
        db_record.total_cost = total_cost
        
        # Delete existing service items and create new ones
        db.query(ServiceItem).filter(ServiceItem.service_record_id == record_id).delete()
        
        # Create new service items
        for item_data in record.service_items:
            service_item = ServiceItem(
                service_record_id=db_record.id,
                service_type=item_data.service_type,
                service_name=item_data.service_name,
                description=item_data.description,
                price=item_data.price,
                created_at=datetime.utcnow()
            )
            db.add(service_item)
        
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@admin_router.delete("/service-records/{record_id}")
def delete_service_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a service record and its service items"""
    record = db.query(ServiceRecord).filter(ServiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    # Service items will be deleted automatically due to cascade
    db.delete(record)
    db.commit()
    return {"message": "Service record deleted successfully"}

# Get available service types
@admin_router.get("/service-types")
def get_service_types():
    """Get available service types"""
    return {
        "service_types": [
            {
                "type": "oil_change",
                "name": "Oil Change",
                "description": "Engine oil and filter replacement",
                "base_price": 120.0
            },
            {
                "type": "inspection",
                "name": "Vehicle Inspection",
                "description": "Comprehensive safety and maintenance inspection",
                "base_price": 80.0
            },
            {
                "type": "tire_rotation",
                "name": "Tire Rotation",
                "description": "Rotate tires for even wear",
                "base_price": 60.0
            },
            {
                "type": "brake_check",
                "name": "Brake Inspection",
                "description": "Check brake pads, rotors, and brake fluid",
                "base_price": 90.0
            },
            {
                "type": "battery_check",
                "name": "Battery Test",
                "description": "Test battery health and charging system",
                "base_price": 50.0
            },
            {
                "type": "air_filter",
                "name": "Air Filter Replacement",
                "description": "Replace engine and cabin air filters",
                "base_price": 40.0
            },
            {
                "type": "coolant_service",
                "name": "Coolant Service",
                "description": "Check and replace engine coolant",
                "base_price": 100.0
            },
            {
                "type": "transmission_service",
                "name": "Transmission Service",
                "description": "Transmission fluid check and replacement",
                "base_price": 150.0
            }
        ]
    }
