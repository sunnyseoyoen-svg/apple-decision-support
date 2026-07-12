from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class StorageSystemType(str, enum.Enum):
    CA = "CA"
    NORMAL = "NORMAL"


class StorageStatus(str, enum.Enum):
    ACTIVE = "active"
    WARNING = "warning"
    CRITICAL = "critical"
    EMPTY = "empty"


class Storage(Base):
    __tablename__ = "storages"
    
    id = Column(String(20), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    system_type = Column(SQLEnum(StorageSystemType), nullable=False)
    capacity = Column(Float, nullable=False)
    current_volume = Column(Float, default=0)
    apple_variety = Column(String(50), nullable=False)
    harvest_date = Column(DateTime, nullable=False)
    storage_start_date = Column(DateTime, nullable=False)
    temperature = Column(Float, default=0)
    humidity = Column(Float, default=0)
    co2 = Column(Float, default=0)
    o2 = Column(Float, default=20.9)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class QualityStatus(Base):
    __tablename__ = "quality_status"
    
    id = Column(Integer, primary_key=True, index=True)
    storage_id = Column(String(20), index=True, nullable=False)
    brix = Column(Float, nullable=False)
    firmness = Column(Float, nullable=False)
    appearance = Column(String(20), nullable=False)
    acidity = Column(Float, default=0)
    internal_browning = Column(String(20), default="none")
    weight_loss = Column(Float, default=0)
    measured_at = Column(DateTime(timezone=True), server_default=func.now())


class StorageRecommendation(Base):
    __tablename__ = "storage_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    storage_id = Column(String(20), index=True, nullable=False)
    priority = Column(String(20), nullable=False)  # high, medium, low
    action = Column(String(30), nullable=False)  # ship_now, monitor, adjust_env, extend_storage
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    expected_outcome = Column(Text, nullable=False)
    estimated_date = Column(DateTime, nullable=True)
    price_current = Column(Float, nullable=True)
    price_predicted = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StorageAlert(Base):
    __tablename__ = "storage_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    storage_id = Column(String(20), index=True, nullable=False)
    storage_name = Column(String(100), nullable=False)
    level = Column(String(20), nullable=False)  # critical, warning, info
    message = Column(Text, nullable=False)
    action_required = Column(Float, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)