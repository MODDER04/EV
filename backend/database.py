from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Client, ClientCode, Vehicle, ServiceRecord, InspectionReport, InspectionItem
import os
from datetime import datetime
import secrets
import string

# Database URL - use SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evmaster_workshop.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
def init_db():
    """Initialize database with tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions for admin operations
def generate_client_code(length=8):
    """Generate a unique client code"""
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(secrets.choice(characters) for _ in range(length))
        # Ensure code doesn't start with confusing characters
        if code[0] not in ['0', 'O', '1', 'I']:
            return code

def create_sample_data(db):
    """Create sample data for testing"""
    
    # Check if data already exists
    if db.query(Client).first():
        print("📊 Sample data already exists")
        return
    
    print("🔄 Creating sample data...")
    
    # Create sample clients
    client1 = Client(
        name="John Doe",
        phone="+1234567890",
        email="john.doe@email.com",
        address="123 Main Street, Anytown, AT 12345",
        is_active=True
    )
    
    client2 = Client(
        name="Jane Smith", 
        phone="+1987654321",
        email="jane.smith@email.com",
        address="456 Oak Avenue, Somewhere, SW 67890",
        is_active=True
    )
    
    db.add(client1)
    db.add(client2)
    db.flush()  # Get IDs
    
    # Create client codes
    code1 = ClientCode(
        code="DEMO123",
        client_id=client1.id,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    code2 = ClientCode(
        code="ABC123",
        client_id=client2.id,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add(code1)
    db.add(code2)
    
    # Create sample vehicles
    vehicle1 = Vehicle(
        client_id=client1.id,
        make="Mercedes-Benz",
        model="C-Class",
        year=2018,
        license_plate="ABC123",
        vin="1234567890ABCDEF0",
        color="Black"
    )
    
    vehicle2 = Vehicle(
        client_id=client1.id,
        make="BMW",
        model="3 Series", 
        year=2020,
        license_plate="XYZ789",
        vin="0987654321FEDCBA0",
        color="White"
    )
    
    vehicle3 = Vehicle(
        client_id=client2.id,
        make="Tesla",
        model="Model 3",
        year=2022,
        license_plate="EV001",
        vin="TESLA123456789ABC",
        color="Red"
    )
    
    db.add_all([vehicle1, vehicle2, vehicle3])
    db.flush()
    
    # Create sample service records
    service1 = ServiceRecord(
        vehicle_id=vehicle1.id,
        service_type="Oil Change",
        description="Replace engine oil and filter",
        cost=150.0,
        service_date=datetime(2023, 12, 1),
        status="completed",
        technician_notes="All systems running smoothly"
    )
    
    service2 = ServiceRecord(
        vehicle_id=vehicle1.id,
        service_type="Tire Rotation",
        description="Rotate tires for even wear",
        cost=75.0,
        service_date=datetime(2023, 10, 15),
        status="completed",
        technician_notes="Tires in good condition"
    )
    
    db.add_all([service1, service2])
    
    # Create sample inspection report
    inspection = InspectionReport(
        vehicle_id=vehicle1.id,
        inspection_date=datetime(2023, 11, 1),
        overall_condition="good",
        technician_notes="Overall, the vehicle is in good condition. However, the engine oil level is low and needs to be topped up. The brake pads are worn and require replacement. All other systems are functioning properly.",
        recommendations="Top up engine oil, Replace brake pads"
    )
    
    db.add(inspection)
    db.flush()
    
    # Create inspection items
    inspection_items = [
        InspectionItem(
            inspection_id=inspection.id,
            item_name="Engine Oil",
            status="needs_attention", 
            notes="Engine oil level is low. Top up required."
        ),
        InspectionItem(
            inspection_id=inspection.id,
            item_name="Tire Pressure",
            status="good",
            notes="Tire pressure is within recommended range."
        ),
        InspectionItem(
            inspection_id=inspection.id,
            item_name="Brake Pads",
            status="needs_attention",
            notes="Brake pads are worn and need replacement."
        ),
        InspectionItem(
            inspection_id=inspection.id,
            item_name="Battery",
            status="good",
            notes="Battery health is good."
        )
    ]
    
    db.add_all(inspection_items)
    
    # Commit all changes
    db.commit()
    print("✅ Sample data created successfully")
    print(f"   • Created {len([client1, client2])} clients")
    print(f"   • Created {len([code1, code2])} client codes")  
    print(f"   • Created {len([vehicle1, vehicle2, vehicle3])} vehicles")
    print(f"   • Created {len([service1, service2])} service records")
    print(f"   • Created 1 inspection report with {len(inspection_items)} items")