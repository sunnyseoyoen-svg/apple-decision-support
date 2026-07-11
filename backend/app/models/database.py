from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AnalysisGrade(str, enum.Enum):
    IMMEDIATE = "IMMEDIATE"
    SOON = "SOON"
    MONITOR = "MONITOR"
    LONG_TERM = "LONG_TERM"


class AnalysisRequest(Base):
    __tablename__ = "analysis_requests"

    id = Column(Integer, primary_key=True, index=True)
    variety = Column(String(50), nullable=False)
    harvest_date = Column(DateTime, nullable=False)
    storage_days = Column(Integer, nullable=False)
    storage_type = Column(String(20), nullable=False)
    brix = Column(Float, nullable=False)
    firmness = Column(Float, nullable=False)
    appearance = Column(String(20), nullable=False)
    expected_volume = Column(Float, nullable=False)
    preferred_period = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    result = relationship("AnalysisResult", back_populates="request", uselist=False)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("analysis_requests.id"), nullable=False)

    recommended_date = Column(DateTime, nullable=False)
    grade = Column(SQLEnum(AnalysisGrade), nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=False)
    quality_score = Column(Float)
    remaining_days = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("AnalysisRequest", back_populates="result")