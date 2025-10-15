from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Client, ClientCode, Vehicle, ServiceRecord, ServiceItem, InspectionReport, InspectionItem, FAQ
import os
from datetime import datetime
import secrets
import string

# Database URL - use SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evmaster_workshop.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 20,
        "isolation_level": None
    } if "sqlite" in DATABASE_URL else {}
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
        color="Black",
        mileage=45000
    )
    
    vehicle2 = Vehicle(
        client_id=client1.id,
        make="BMW",
        model="3 Series", 
        year=2020,
        license_plate="XYZ789",
        vin="0987654321FEDCBA0",
        color="White",
        mileage=28000
    )
    
    vehicle3 = Vehicle(
        client_id=client2.id,
        make="Tesla",
        model="Model 3",
        year=2022,
        license_plate="EV001",
        vin="TESLA123456789ABC",
        color="Red",
        mileage=15000
    )
    
    db.add_all([vehicle1, vehicle2, vehicle3])
    db.flush()
    
    # Create sample service records with service items
    service1 = ServiceRecord(
        vehicle_id=vehicle1.id,
        service_date=datetime(2023, 12, 1),
        status="completed",
        technician_notes="All systems running smoothly",
        total_cost=200.0
    )
    
    service2 = ServiceRecord(
        vehicle_id=vehicle1.id,
        service_date=datetime(2023, 10, 15),
        status="completed",
        technician_notes="Tires in good condition",
        total_cost=150.0
    )
    
    service3 = ServiceRecord(
        vehicle_id=vehicle2.id,
        service_date=datetime(2023, 11, 20),
        status="completed",
        technician_notes="Comprehensive inspection and service",
        total_cost=350.0
    )
    
    db.add_all([service1, service2, service3])
    db.flush()  # Get service record IDs
    
    # Create service items
    service_items = [
        # Service 1 items
        ServiceItem(
            service_record_id=service1.id,
            service_type="oil_change",
            service_name="Oil Change",
            description="Replace engine oil and filter",
            price=120.0
        ),
        ServiceItem(
            service_record_id=service1.id,
            service_type="inspection",
            service_name="Vehicle Inspection",
            description="Comprehensive vehicle safety inspection",
            price=80.0
        ),
        # Service 2 items
        ServiceItem(
            service_record_id=service2.id,
            service_type="tire_rotation",
            service_name="Tire Rotation",
            description="Rotate tires for even wear",
            price=60.0
        ),
        ServiceItem(
            service_record_id=service2.id,
            service_type="brake_check",
            service_name="Brake Check",
            description="Check brake pads and brake fluid",
            price=90.0
        ),
        # Service 3 items
        ServiceItem(
            service_record_id=service3.id,
            service_type="oil_change",
            service_name="Premium Oil Change",
            description="Premium synthetic oil change with filter",
            price=180.0
        ),
        ServiceItem(
            service_record_id=service3.id,
            service_type="inspection",
            service_name="Full Vehicle Inspection",
            description="Complete 50-point inspection",
            price=120.0
        ),
        ServiceItem(
            service_record_id=service3.id,
            service_type="battery_check",
            service_name="Battery Test",
            description="Test battery health and charging system",
            price=50.0
        )
    ]
    
    db.add_all(service_items)
    
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
    
    # Create sample FAQs with both English and Arabic content
    faqs = [
        FAQ(
            question_en="How do I book a service?",
            question_ar="كيف أحجز خدمة؟",
            answer_en="You can book a service through our app or website. Select your vehicle, choose the service, and pick a date and time.",
            answer_ar="يمكنك حجز خدمة من خلال تطبيقنا أو موقعنا الإلكتروني. اختر مركبتك، اختر الخدمة، واختر التاريخ والوقت.",
            category="Booking",
            display_order=1
        ),
        FAQ(
            question_en="What types of services do you offer?",
            question_ar="ما أنواع الخدمات التي تقدمونها؟",
            answer_en="We offer a comprehensive range of automotive services including oil changes, brake inspections, tire rotations, battery checks, and more.",
            answer_ar="نحن نقدم مجموعة شاملة من الخدمات الآليّة بما في ذلك تغيير الزيت، وفحص الفرامل، ودوران الإطارات، وفحص البطارية، والمزيد.",
            category="Services",
            display_order=2
        ),
        FAQ(
            question_en="How long does a typical service take?",
            question_ar="كم يستغرق وقت الخدمة العادية؟",
            answer_en="A standard service typically takes 1-2 hours depending on the specific services requested. We'll provide you with an estimated completion time when you book.",
            answer_ar="الخدمة القياسية تستغرق عادة من ساعة إلى ساعتين اعتماداً على الخدمات المحددة المطلوبة. سنزودك بوقت مقدر للانتهاء عند الحجز.",
            category="Services",
            display_order=3
        ),
        FAQ(
            question_en="Can I wait while my car is being serviced?",
            question_ar="هل يمكنني الانتظار أثناء صيانة سيارتي؟",
            answer_en="Yes, we have a comfortable waiting area with complimentary WiFi and refreshments. You can also choose to drop off your vehicle and pick it up later.",
            answer_ar="نعم، لدينا منطقة انتظار مريحة مع واي فاي مجاني ومرطبات. يمكنك أيضاً اختيار ترك مركبتك واستلامها لاحقاً.",
            category="General",
            display_order=4
        ),
        FAQ(
            question_en="Do you use genuine parts?",
            question_ar="هل تستخدمون قطع غيار أصلية؟",
            answer_en="Yes, we use only genuine OEM parts and high-quality aftermarket alternatives. All parts come with manufacturer warranties.",
            answer_ar="نعم، نحن نستخدم فقط قطع غيار أصلية من المصنع وبدائل ما بعد البيع عالية الجودة. جميع القطع تأتي مع ضمانات الشركة المصنعة.",
            category="Parts",
            display_order=5
        ),
        FAQ(
            question_en="What's included in a standard service?",
            question_ar="ما الذي يشمله الخدمة القياسية؟",
            answer_en="A standard service includes an oil change, filter replacement, and a general check-up of your vehicle's main components.",
            answer_ar="الخدمة القياسية تشمل تغيير الزيت، واستبدال الفلتر، وفحص عام للمكونات الرئيسية لمركبتك.",
            category="Services",
            display_order=6
        )
    ]
    
    db.add_all(faqs)
    
    # Commit all changes
    db.commit()
    print("✅ Sample data created successfully")
    print(f"   • Created {len([client1, client2])} clients")
    print(f"   • Created {len([code1, code2])} client codes")  
    print(f"   • Created {len([vehicle1, vehicle2, vehicle3])} vehicles")
    print(f"   • Created {len([service1, service2, service3])} service records with {len(service_items)} service items")
    print(f"   • Created 1 inspection report with {len(inspection_items)} items")
    print(f"   • Created {len(faqs)} multilingual FAQs")
