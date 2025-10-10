from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class ClientCode(Base):
    __tablename__ = "client_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    used_at = Column(DateTime, nullable=True)
    
    client = relationship("Client", back_populates="codes")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    codes = relationship("ClientCode", back_populates="client")
    vehicles = relationship("Vehicle", back_populates="owner")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    license_plate = Column(String, unique=True, nullable=False)
    vin = Column(String, nullable=True)
    color = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("Client", back_populates="vehicles")
    services = relationship("ServiceRecord", back_populates="vehicle")
    inspections = relationship("InspectionReport", back_populates="vehicle")

class ServiceRecord(Base):
    __tablename__ = "service_records"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Float, nullable=False)
    service_date = Column(DateTime, nullable=False)
    status = Column(String, default="completed")  # pending, in_progress, completed
    technician_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    vehicle = relationship("Vehicle", back_populates="services")

class InspectionReport(Base):
    __tablename__ = "inspection_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    inspection_date = Column(DateTime, nullable=False)
    overall_condition = Column(String, nullable=False)  # excellent, good, fair, poor
    technician_notes = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    vehicle = relationship("Vehicle", back_populates="inspections")
    items = relationship("InspectionItem", back_populates="report")

class InspectionItem(Base):
    __tablename__ = "inspection_items"
    
    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspection_reports.id"), nullable=False)
    item_name = Column(String, nullable=False)  # Engine Oil, Tire Pressure, etc.
    status = Column(String, nullable=False)  # good, needs_attention, replace
    notes = Column(Text, nullable=True)
    
    report = relationship("InspectionReport", back_populates="items")

class FAQ(Base):
    __tablename__ = "faqs"
    
    id = Column(Integer, primary_key=True, index=True)
    question_en = Column(Text, nullable=False)  # Question in English
    question_ar = Column(Text, nullable=False)  # Question in Arabic
    answer_en = Column(Text, nullable=False)    # Answer in English
    answer_ar = Column(Text, nullable=False)    # Answer in Arabic
    category = Column(String, nullable=False)   # Category (Services, Booking, etc.)
    display_order = Column(Integer, default=0)  # Order for display
    is_active = Column(Boolean, default=True)   # Enable/disable FAQ
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
