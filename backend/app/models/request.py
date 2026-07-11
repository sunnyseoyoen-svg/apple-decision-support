from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class AppleVariety(str, Enum):
    BUSA = "busa"
    HONGRO = "hongro"
    GAMHONG = "gamhong"
    YANGKWANG = "yangkwang"
    SINANO = "sinano"


class StorageType(str, Enum):
    CA = "CA"
    NORMAL = "NORMAL"


class AppearanceGrade(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"


class RecommendationGrade(str, Enum):
    IMMEDIATE = "IMMEDIATE"
    SOON = "SOON"
    MONITOR = "MONITOR"
    LONG_TERM = "LONG_TERM"


class HarvestInput(BaseModel):
    variety: AppleVariety
    harvestDate: str = Field(..., alias="harvestDate")
    storageDays: int = Field(..., alias="storageDays", ge=0, le=200)
    storageType: StorageType = Field(..., alias="storageType")
    brix: float = Field(..., ge=8.0, le=20.0)
    firmness: float = Field(..., ge=3.0, le=12.0)
    appearance: AppearanceGrade
    expectedVolume: float = Field(..., alias="expectedVolume", gt=0, le=100)
    preferredPeriod: Optional[str] = Field(None, alias="preferredPeriod")

    @field_validator("harvestDate")
    @classmethod
    def validate_harvest_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("수확일은 YYYY-MM-DD 형식이어야 합니다")
        return v

    class Config:
        populate_by_name = True


class AnalysisResult(BaseModel):
    recommendedDate: str = Field(..., alias="recommendedDate")
    grade: RecommendationGrade
    minPrice: int = Field(..., alias="minPrice")
    maxPrice: int = Field(..., alias="maxPrice")
    reasoning: str
    qualityScore: int = Field(..., alias="qualityScore", ge=0, le=100)
    remainingDays: int = Field(..., alias="remainingDays", ge=0)
    priceTrend: str = Field(..., alias="priceTrend")

    class Config:
        populate_by_name = True


class MockPriceData(BaseModel):
    variety: str
    month: int
    minPrice: int
    maxPrice: int
    avgPrice: int


class VarietyInfo(BaseModel):
    id: str
    name: str
    harvestSeason: str
    storageLimitCA: int
    storageLimitNormal: int
    typicalBrix: dict
    typicalFirmness: dict