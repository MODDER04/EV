from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
import uvicorn
import os

from database import init_db, get_db, create_sample_data, SessionLocal
from models import ClientCode, Client, Vehicle, ServiceRecord as DBServiceRecord, InspectionReport, InspectionItem, FAQ
from admin_routes import admin_router

app = FastAPI(
    title="EvMaster Workshop API",
    description="API for EvMaster car workshop client portal",
    version="1.0.0"
)

# CORS middleware for Flutter app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin routes
app.include_router(admin_router)

# Serve static files for admin panel
try:
    app.mount("/admin-static", StaticFiles(directory="admin_panel"), name="admin_static")
except Exception:
    pass  # Admin panel static files not found, will create them

security = HTTPBearer()

# Helper function to extract client ID from token
def get_client_id_from_token(token: str) -> Optional[int]:
    """Extract client ID from the access token."""
    try:
        # Token format: "token_{client_code}_{client_id}"
        parts = token.split('_')
        if len(parts) >= 3 and parts[0] == 'token':
            return int(parts[-1])  # Last part is the client ID
        return None
    except (ValueError, IndexError):
        return None

# Helper function to get current client from token
async def get_current_client(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> Client:
    """Get the current authenticated client from the token."""
    token = credentials.credentials
    client_id = get_client_id_from_token(token)
    
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )
    
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client or not client.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Client not found or inactive"
        )
    
    return client

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    print("🚀 Initializing database...")
    init_db()
    
    # Create sample data
    db = SessionLocal()
    try:
        create_sample_data(db)
    finally:
        db.close()

# Pydantic models
class ClientAuth(BaseModel):
    client_code: str

class ClientInfo(BaseModel):
    client_id: str
    name: str
    phone: str
    email: Optional[str] = None

class CarRecord(BaseModel):
    car_id: str
    make: str
    model: str
    year: int
    license_plate: str

class ServiceRecord(BaseModel):
    service_id: str
    car_id: str
    date: str
    service_type: str
    description: str
    cost: float
    status: str

# Root endpoint
@app.get("/")
async def root():
    return {"message": "EvMaster Workshop API", "status": "running"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Admin panel route
@app.get("/admin")
async def admin_panel():
    admin_panel_path = os.path.join(os.path.dirname(__file__), "admin_panel", "index.html")
    if os.path.exists(admin_panel_path):
        return FileResponse(admin_panel_path)
    else:
        raise HTTPException(status_code=404, detail="Admin panel not found")

# Authentication endpoints
@app.post("/auth/login")
async def login(auth: ClientAuth, db: Session = Depends(get_db)):
    # Find client code in database
    client_code = db.query(ClientCode).filter(
        ClientCode.code == auth.client_code,
        ClientCode.is_active == True
    ).first()
    
    if not client_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid client code"
        )
    
    # Get client information
    client = db.query(Client).filter(Client.id == client_code.client_id).first()
    if not client or not client.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Client account is inactive"
        )
    
    # Update code usage
    from datetime import datetime
    client_code.used_at = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": f"token_{auth.client_code}_{client.id}",
        "token_type": "bearer", 
        "client_id": str(client.id)
    }

# Client endpoints
@app.get("/client/profile")
async def get_client_profile(current_client: Client = Depends(get_current_client)):
    """Get current client's profile information."""
    return {
        "client_id": str(current_client.id),
        "name": current_client.name,
        "phone": current_client.phone,
        "email": current_client.email,
        "address": current_client.address
    }

@app.get("/client/cars")
async def get_client_cars(current_client: Client = Depends(get_current_client), db: Session = Depends(get_db)):
    """Get all vehicles owned by the current client."""
    vehicles = db.query(Vehicle).filter(Vehicle.client_id == current_client.id).all()
    
    return [
        {
            "car_id": str(vehicle.id),
            "make": vehicle.make,
            "model": vehicle.model,
            "year": vehicle.year,
            "license_plate": vehicle.license_plate,
            "vin": vehicle.vin,
            "color": vehicle.color
        }
        for vehicle in vehicles
    ]

@app.get("/client/cars/{car_id}/history")
async def get_car_service_history(
    car_id: str, 
    current_client: Client = Depends(get_current_client), 
    db: Session = Depends(get_db)
):
    """Get service history for a specific vehicle owned by the current client."""
    # First verify the vehicle belongs to the current client
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == int(car_id),
        Vehicle.client_id == current_client.id
    ).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Get service records for this vehicle
    service_records = db.query(DBServiceRecord).filter(
        DBServiceRecord.vehicle_id == vehicle.id
    ).order_by(DBServiceRecord.service_date.desc()).all()
    
    return [
        {
            "service_id": str(record.id),
            "car_id": str(record.vehicle_id),
            "date": record.service_date.isoformat(),
            "service_type": record.service_type,
            "description": record.description,
            "cost": float(record.cost),
            "status": record.status,
            "technician_notes": record.technician_notes
        }
        for record in service_records
    ]

@app.get("/client/cars/{car_id}/visits")
async def get_car_visit_history(
    car_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get complete visit history (services and inspections) for a specific vehicle."""
    # First verify the vehicle belongs to the current client
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == int(car_id),
        Vehicle.client_id == current_client.id
    ).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    visits = []
    
    # Get service records
    service_records = db.query(DBServiceRecord).filter(
        DBServiceRecord.vehicle_id == vehicle.id
    ).all()
    
    for record in service_records:
        visits.append({
            "visit_id": str(record.id),
            "visit_type": "service",
            "date": record.service_date.isoformat(),
            "title": record.service_type,
            "description": record.description,
            "status": record.status,
            "cost": float(record.cost) if record.cost else None,
            "technician_notes": record.technician_notes
        })
    
    # Get inspection reports
    inspection_reports = db.query(InspectionReport).filter(
        InspectionReport.vehicle_id == vehicle.id
    ).all()
    
    for inspection in inspection_reports:
        visits.append({
            "visit_id": str(inspection.id),
            "visit_type": "inspection",
            "date": inspection.inspection_date.isoformat(),
            "title": f"Vehicle Inspection",
            "description": f"Overall condition: {inspection.overall_condition}",
            "status": "completed",
            "cost": None,
            "technician_notes": inspection.technician_notes
        })
    
    # Sort by date (most recent first)
    visits.sort(key=lambda x: x['date'], reverse=True)
    
    return visits

@app.get("/client/visits/{visit_type}/{visit_id}")
async def get_visit_details(
    visit_type: str,
    visit_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific visit (service or inspection)."""
    if visit_type == "service":
        # Get service record
        service_record = db.query(DBServiceRecord).filter(
            DBServiceRecord.id == int(visit_id)
        ).first()
        
        if not service_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service record not found"
            )
        
        # Verify the vehicle belongs to the current client
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == service_record.vehicle_id,
            Vehicle.client_id == current_client.id
        ).first()
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        return {
            "visit_id": str(service_record.id),
            "visit_type": "service",
            "vehicle": {
                "make": vehicle.make,
                "model": vehicle.model,
                "year": vehicle.year,
                "license_plate": vehicle.license_plate
            },
            "date": service_record.service_date.isoformat(),
            "service_type": service_record.service_type,
            "description": service_record.description,
            "cost": float(service_record.cost),
            "status": service_record.status,
            "technician_notes": service_record.technician_notes,
            "created_at": service_record.created_at.isoformat()
        }
    
    elif visit_type == "inspection":
        # Get inspection report
        inspection = db.query(InspectionReport).filter(
            InspectionReport.id == int(visit_id)
        ).first()
        
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection report not found"
            )
        
        # Verify the vehicle belongs to the current client
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == inspection.vehicle_id,
            Vehicle.client_id == current_client.id
        ).first()
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        # Get inspection items
        items = db.query(InspectionItem).filter(
            InspectionItem.inspection_id == inspection.id
        ).all()
        
        return {
            "visit_id": str(inspection.id),
            "visit_type": "inspection",
            "vehicle": {
                "make": vehicle.make,
                "model": vehicle.model,
                "year": vehicle.year,
                "license_plate": vehicle.license_plate
            },
            "date": inspection.inspection_date.isoformat(),
            "overall_condition": inspection.overall_condition,
            "technician_notes": inspection.technician_notes,
            "recommendations": inspection.recommendations,
            "items": [
                {
                    "item_name": item.item_name,
                    "status": item.status,
                    "notes": item.notes
                }
                for item in items
            ],
            "created_at": inspection.created_at.isoformat()
        }
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid visit type. Must be 'service' or 'inspection'"
        )

@app.get("/client/cars/{car_id}")
async def get_car_details(
    car_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific vehicle owned by the current client."""
    # First verify the vehicle belongs to the current client
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == int(car_id),
        Vehicle.client_id == current_client.id
    ).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Get service records count and latest service
    service_count = db.query(DBServiceRecord).filter(
        DBServiceRecord.vehicle_id == vehicle.id
    ).count()
    
    latest_service = db.query(DBServiceRecord).filter(
        DBServiceRecord.vehicle_id == vehicle.id
    ).order_by(DBServiceRecord.service_date.desc()).first()
    
    # Get inspection reports count and latest inspection
    inspection_count = db.query(InspectionReport).filter(
        InspectionReport.vehicle_id == vehicle.id
    ).count()
    
    latest_inspection = db.query(InspectionReport).filter(
        InspectionReport.vehicle_id == vehicle.id
    ).order_by(InspectionReport.inspection_date.desc()).first()
    
    return {
        "car_id": str(vehicle.id),
        "make": vehicle.make,
        "model": vehicle.model,
        "year": vehicle.year,
        "license_plate": vehicle.license_plate,
        "vin": vehicle.vin,
        "color": vehicle.color,
        "stats": {
            "total_services": service_count,
            "total_inspections": inspection_count,
            "last_service_date": latest_service.service_date.isoformat() if latest_service else None,
            "last_inspection_date": latest_inspection.inspection_date.isoformat() if latest_inspection else None
        }
    }

@app.get("/client/cars/{car_id}/inspection")
async def get_car_inspection(
    car_id: str, 
    current_client: Client = Depends(get_current_client), 
    db: Session = Depends(get_db)
):
    """Get the latest inspection report for a specific vehicle owned by the current client."""
    # First verify the vehicle belongs to the current client
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == int(car_id),
        Vehicle.client_id == current_client.id
    ).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Get the latest inspection report for this vehicle
    inspection = db.query(InspectionReport).filter(
        InspectionReport.vehicle_id == vehicle.id
    ).order_by(InspectionReport.inspection_date.desc()).first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No inspection reports found for this vehicle"
        )
    
    # Get inspection items
    items = db.query(InspectionItem).filter(
        InspectionItem.inspection_id == inspection.id
    ).all()
    
    return {
        "inspection_id": str(inspection.id),
        "car_id": str(inspection.vehicle_id),
        "inspection_date": inspection.inspection_date.isoformat(),
        "overall_condition": inspection.overall_condition,
        "technician_notes": inspection.technician_notes,
        "recommendations": inspection.recommendations,
        "items": [
            {
                "item_name": item.item_name,
                "status": item.status,
                "notes": item.notes
            }
            for item in items
        ]
    }

# Booking endpoints
class BookingRequest(BaseModel):
    date: str
    time: str
    service: str
    vehicle_id: Optional[str] = None

@app.post("/bookings")
async def create_booking(booking: BookingRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # TODO: Implement database booking creation
    return {
        "booking_id": "booking_001",
        "status": "confirmed",
        "date": booking.date,
        "time": booking.time,
        "service": booking.service,
        "message": "Booking confirmed successfully"
    }

@app.get("/bookings")
async def get_client_bookings(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # TODO: Implement database query for client bookings
    return [
        {
            "booking_id": "booking_001",
            "date": "2023-12-15",
            "time": "10:00 AM",
            "service": "Oil Change",
            "status": "confirmed"
        }
    ]

# FAQ endpoints
@app.get("/faq")
async def get_faqs(lang: str = "en", db: Session = Depends(get_db)):
    """Get FAQs with language support (en/ar)."""
    # Get FAQs from database ordered by display_order
    faqs = db.query(FAQ).filter(FAQ.is_active == True).order_by(FAQ.display_order, FAQ.created_at).all()
    
    if not faqs:
        # If no FAQs in database, return default English FAQs for now
        return [
            {
                "id": "1",
                "question": "How do I book a service?",
                "answer": "You can book a service through our app or website. Select your vehicle, choose the service, and pick a date and time.",
                "category": "Booking"
            },
            {
                "id": "2",
                "question": "What types of services do you offer?",
                "answer": "We offer a comprehensive range of automotive services including oil changes, brake inspections, tire rotations, battery checks, and more.",
                "category": "Services"
            },
            {
                "id": "3",
                "question": "How long does a typical service take?",
                "answer": "A standard service typically takes 1-2 hours depending on the specific services requested. We'll provide you with an estimated completion time when you book.",
                "category": "Services"
            },
            {
                "id": "4",
                "question": "Can I wait while my car is being serviced?",
                "answer": "Yes, we have a comfortable waiting area with complimentary WiFi and refreshments. You can also choose to drop off your vehicle and pick it up later.",
                "category": "General"
            },
            {
                "id": "5",
                "question": "Do you use genuine parts?",
                "answer": "Yes, we use only genuine OEM parts and high-quality aftermarket alternatives. All parts come with manufacturer warranties.",
                "category": "Parts"
            },
            {
                "id": "6",
                "question": "What's included in a standard service?",
                "answer": "A standard service includes an oil change, filter replacement, and a general check-up of your vehicle's main components.",
                "category": "Services"
            }
        ]
    
    # Return FAQs in the requested language
    result = []
    for faq in faqs:
        if lang == "ar":
            result.append({
                "id": str(faq.id),
                "question": faq.question_ar,
                "answer": faq.answer_ar,
                "category": faq.category
            })
        else:  # Default to English
            result.append({
                "id": str(faq.id),
                "question": faq.question_en,
                "answer": faq.answer_en,
                "category": faq.category
            })
    
    return result

# ===== ADMIN INSPECTION MANAGEMENT =====

@app.get("/admin/inspections")
async def get_all_inspections(db: Session = Depends(get_db)):
    """Get all inspection reports for admin management"""
    inspections = db.query(InspectionReport).join(
        Vehicle, InspectionReport.vehicle_id == Vehicle.id
    ).join(
        Client, Vehicle.client_id == Client.id
    ).all()
    
    result = []
    for inspection in inspections:
        result.append({
            "id": inspection.id,
            "vehicle_id": inspection.vehicle_id,
            "vehicle_info": f"{inspection.vehicle.make} {inspection.vehicle.model} ({inspection.vehicle.license_plate})",
            "client_name": inspection.vehicle.owner.name,
            "client_id": inspection.vehicle.client_id,
            "inspection_date": inspection.inspection_date.isoformat(),
            "overall_condition": inspection.overall_condition,
            "technician_notes": inspection.technician_notes,
            "recommendations": inspection.recommendations,
            "created_at": inspection.created_at.isoformat()
        })
    
    return result

@app.post("/admin/inspections")
async def create_inspection(inspection_data: dict, db: Session = Depends(get_db)):
    """Create a new inspection report"""
    try:
        # Create inspection report
        inspection = InspectionReport(
            vehicle_id=inspection_data["vehicle_id"],
            inspection_date=datetime.fromisoformat(inspection_data["inspection_date"].replace('Z', '+00:00')),
            overall_condition=inspection_data["overall_condition"],
            technician_notes=inspection_data.get("technician_notes"),
            recommendations=inspection_data.get("recommendations")
        )
        
        db.add(inspection)
        db.flush()  # Get the ID
        
        # Add inspection items if provided
        if "items" in inspection_data:
            for item_data in inspection_data["items"]:
                item = InspectionItem(
                    inspection_id=inspection.id,
                    item_name=item_data["item_name"],
                    status=item_data["status"],
                    notes=item_data.get("notes")
                )
                db.add(item)
        
        db.commit()
        
        return {
            "id": inspection.id,
            "message": "Inspection report created successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin/inspections/{inspection_id}")
async def get_inspection_details(inspection_id: int, db: Session = Depends(get_db)):
    """Get detailed inspection report with items"""
    inspection = db.query(InspectionReport).filter(
        InspectionReport.id == inspection_id
    ).join(Vehicle).join(Client).first()
    
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Get inspection items
    items = db.query(InspectionItem).filter(
        InspectionItem.inspection_id == inspection_id
    ).all()
    
    return {
        "id": inspection.id,
        "vehicle_id": inspection.vehicle_id,
        "vehicle_info": f"{inspection.vehicle.make} {inspection.vehicle.model} ({inspection.vehicle.license_plate})",
        "client_name": inspection.vehicle.owner.name,
        "client_id": inspection.vehicle.client_id,
        "inspection_date": inspection.inspection_date.isoformat(),
        "overall_condition": inspection.overall_condition,
        "technician_notes": inspection.technician_notes,
        "recommendations": inspection.recommendations,
        "created_at": inspection.created_at.isoformat(),
        "items": [{
            "id": item.id,
            "item_name": item.item_name,
            "status": item.status,
            "notes": item.notes
        } for item in items]
    }

@app.delete("/admin/inspections/{inspection_id}")
async def delete_inspection(inspection_id: int, db: Session = Depends(get_db)):
    """Delete an inspection report and its items"""
    inspection = db.query(InspectionReport).filter(
        InspectionReport.id == inspection_id
    ).first()
    
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    # Delete inspection items first (cascade should handle this, but being explicit)
    db.query(InspectionItem).filter(
        InspectionItem.inspection_id == inspection_id
    ).delete()
    
    # Delete inspection report
    db.delete(inspection)
    db.commit()
    
    return {"message": "Inspection deleted successfully"}

# ===== ADMIN SERVICE RECORDS MANAGEMENT =====

@app.get("/admin/services")
async def get_all_service_records(db: Session = Depends(get_db)):
    """Get all service records for admin management"""
    services = db.query(DBServiceRecord).all()
    
    result = []
    for service in services:
        # Get vehicle and client data using relationships
        vehicle = db.query(Vehicle).filter(Vehicle.id == service.vehicle_id).first()
        client = None
        if vehicle:
            client = db.query(Client).filter(Client.id == vehicle.client_id).first()
        
        result.append({
            "id": service.id,
            "vehicle_id": service.vehicle_id,
            "vehicle_info": f"{vehicle.make} {vehicle.model} ({vehicle.license_plate})" if vehicle else "Unknown Vehicle",
            "client_name": client.name if client else "Unknown Client",
            "client_id": vehicle.client_id if vehicle else None,
            "service_type": service.service_type,
            "description": service.description,
            "cost": service.cost,
            "service_date": service.service_date.isoformat(),
            "status": service.status,
            "technician_notes": service.technician_notes,
            "created_at": service.created_at.isoformat()
        })
    
    return result

@app.post("/admin/services")
async def create_service_record(service_data: dict, db: Session = Depends(get_db)):
    """Create a new service record"""
    try:
        service = DBServiceRecord(
            vehicle_id=service_data["vehicle_id"],
            service_type=service_data["service_type"],
            description=service_data.get("description"),
            cost=float(service_data["cost"]),
            service_date=datetime.fromisoformat(service_data["service_date"].replace('Z', '+00:00')),
            status=service_data.get("status", "completed"),
            technician_notes=service_data.get("technician_notes")
        )
        
        db.add(service)
        db.commit()
        
        return {
            "id": service.id,
            "message": "Service record created successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin/services/{service_id}")
async def get_service_details(service_id: int, db: Session = Depends(get_db)):
    """Get detailed service record"""
    service = db.query(DBServiceRecord).filter(
        DBServiceRecord.id == service_id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    # Get vehicle and client data using relationships
    vehicle = db.query(Vehicle).filter(Vehicle.id == service.vehicle_id).first()
    client = None
    if vehicle:
        client = db.query(Client).filter(Client.id == vehicle.client_id).first()
    
    return {
        "id": service.id,
        "vehicle_id": service.vehicle_id,
        "vehicle_info": f"{vehicle.make} {vehicle.model} ({vehicle.license_plate})" if vehicle else "Unknown Vehicle",
        "client_name": client.name if client else "Unknown Client",
        "client_id": vehicle.client_id if vehicle else None,
        "service_type": service.service_type,
        "description": service.description,
        "cost": service.cost,
        "service_date": service.service_date.isoformat(),
        "status": service.status,
        "technician_notes": service.technician_notes,
        "created_at": service.created_at.isoformat()
    }

@app.delete("/admin/services/{service_id}")
async def delete_service_record(service_id: int, db: Session = Depends(get_db)):
    """Delete a service record"""
    service = db.query(DBServiceRecord).filter(
        DBServiceRecord.id == service_id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    db.delete(service)
    db.commit()
    
    return {"message": "Service record deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    print("\n🚗 EvMaster Workshop API Starting...")
    print("📍 Backend will be accessible at:")
    print("   • Localhost: http://localhost:8000")
    print("   • MacBook IP: http://192.168.100.126:8000 (for iPhone/physical devices)")
    print("   • Android Emulator: http://10.0.2.2:8000")
    print("   • API Docs: http://localhost:8000/docs")
    print("   • Health Check: http://localhost:8000/health")
    print("\n📱 iPhone App Configuration:")
    print("   • iOS will automatically use: http://192.168.100.126:8000")
    print("\n🔄 Starting server...\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
