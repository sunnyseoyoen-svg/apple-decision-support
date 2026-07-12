from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.storage import Storage, QualityStatus, StorageRecommendation, StorageAlert

router = APIRouter(prefix="/v1/storage", tags=["storage"])


# Pydantic 모델들
class StorageBase(BaseModel):
    name: str
    system_type: str = Field(..., description="CA 또는 NORMAL")
    capacity: float
    apple_variety: str
    harvest_date: str
    storage_start_date: str
    temperature: float
    humidity: float
    co2: float = 0.0
    o2: float = 20.9


class StorageCreate(StorageBase):
    pass


class StorageUpdate(BaseModel):
    name: Optional[str] = None
    current_volume: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    co2: Optional[float] = None
    o2: Optional[float] = None


class StorageResponse(StorageBase):
    id: str
    current_volume: float = 0
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class QualityStatusBase(BaseModel):
    brix: float
    firmness: float
    appearance: str
    acidity: float
    internal_browning: str
    weight_loss: float


class QualityStatusResponse(QualityStatusBase):
    id: int
    storage_id: str
    measured_at: str

    class Config:
        from_attributes = True


class QualityTrendPoint(BaseModel):
    date: str
    brix: float
    firmness: float
    weight_loss: float


class AIRecommendationResponse(BaseModel):
    storage_id: str
    priority: str
    action: str
    title: str
    description: str
    expected_outcome: str
    estimated_date: Optional[str] = None
    price_impact: Optional[dict] = None
    created_at: str


class StorageAlertResponse(BaseModel):
    storage_id: str
    storage_name: str
    level: str
    message: str
    action_required: bool


class StorageDetailResponse(BaseModel):
    storage: StorageResponse
    quality_status: Optional[QualityStatusResponse] = None
    quality_trend: List[QualityTrendPoint] = []
    ai_recommendation: Optional[AIRecommendationResponse] = None
    priority_alert: Optional[StorageAlertResponse] = None
    utilization_rate: float
    remaining_days: int
    ripening_stage: str
    status: str


# 목업 데이터 (실제로는 DB에서 조회)
MOCK_STORAGES = {
    "STG-001": {
        "id": "STG-001",
        "name": "1호 저장고 (CA)",
        "system_type": "CA",
        "capacity": 100,
        "current_volume": 85,
        "apple_variety": "busa",
        "harvest_date": "2024-10-25",
        "storage_start_date": "2024-10-28",
        "temperature": 1.2,
        "humidity": 92,
        "co2": 2.1,
        "o2": 2.3,
        "created_at": "2024-10-28T09:00:00",
        "updated_at": "2024-12-10T14:30:00",
    },
    "STG-002": {
        "id": "STG-002",
        "name": "2호 저장고 (일반)",
        "system_type": "NORMAL",
        "capacity": 80,
        "current_volume": 60,
        "apple_variety": "hongro",
        "harvest_date": "2024-09-20",
        "storage_start_date": "2024-09-22",
        "temperature": 3.5,
        "humidity": 88,
        "co2": 0.04,
        "o2": 20.9,
        "created_at": "2024-09-22T10:00:00",
        "updated_at": "2024-12-10T14:25:00",
    },
    "STG-003": {
        "id": "STG-003",
        "name": "3호 저장고 (CA)",
        "system_type": "CA",
        "capacity": 120,
        "current_volume": 95,
        "apple_variety": "gamhong",
        "harvest_date": "2024-10-15",
        "storage_start_date": "2024-10-18",
        "temperature": 0.8,
        "humidity": 94,
        "co2": 1.9,
        "o2": 2.0,
        "created_at": "2024-10-18T08:30:00",
        "updated_at": "2024-12-10T14:20:00",
    },
    "STG-004": {
        "id": "STG-004",
        "name": "4호 저장고 (일반)",
        "system_type": "NORMAL",
        "capacity": 60,
        "current_volume": 15,
        "apple_variety": "yangkwang",
        "harvest_date": "2024-09-25",
        "storage_start_date": "2024-09-28",
        "temperature": 4.2,
        "humidity": 85,
        "co2": 0.04,
        "o2": 20.9,
        "created_at": "2024-09-28T11:00:00",
        "updated_at": "2024-12-10T14:15:00",
    },
}

MOCK_QUALITY = {
    "STG-001": {"brix": 14.8, "firmness": 7.5, "appearance": "good", "acidity": 0.32, "internal_browning": "none", "weight_loss": 2.1, "measured_at": "2024-12-10T08:00:00"},
    "STG-002": {"brix": 13.5, "firmness": 6.8, "appearance": "fair", "acidity": 0.38, "internal_browning": "slight", "weight_loss": 3.5, "measured_at": "2024-12-10T08:00:00"},
    "STG-003": {"brix": 15.2, "firmness": 8.1, "appearance": "excellent", "acidity": 0.28, "internal_browning": "none", "weight_loss": 1.8, "measured_at": "2024-12-10T08:00:00"},
    "STG-004": {"brix": 12.8, "firmness": 6.2, "appearance": "fair", "acidity": 0.42, "internal_browning": "moderate", "weight_loss": 4.2, "measured_at": "2024-12-10T08:00:00"},
}

MOCK_QUALITY_TRENDS = {
    "STG-001": [{"date": "2024-11-01", "brix": 13.5, "firmness": 8.5, "weight_loss": 0.8}, {"date": "2024-11-15", "brix": 14.0, "firmness": 8.2, "weight_loss": 1.2}, {"date": "2024-12-01", "brix": 14.5, "firmness": 7.8, "weight_loss": 1.7}, {"date": "2024-12-10", "brix": 14.8, "firmness": 7.5, "weight_loss": 2.1}],
    "STG-002": [{"date": "2024-10-15", "brix": 13.0, "firmness": 7.5, "weight_loss": 1.5}, {"date": "2024-11-01", "brix": 13.3, "firmness": 7.2, "weight_loss": 2.2}, {"date": "2024-11-15", "brix": 13.4, "firmness": 6.9, "weight_loss": 2.8}, {"date": "2024-12-10", "brix": 13.5, "firmness": 6.8, "weight_loss": 3.5}],
    "STG-003": [{"date": "2024-11-01", "brix": 14.5, "firmness": 8.5, "weight_loss": 0.9}, {"date": "2024-11-15", "brix": 15.0, "firmness": 8.3, "weight_loss": 1.3}, {"date": "2024-12-01", "brix": 15.1, "firmness": 8.2, "weight_loss": 1.6}, {"date": "2024-12-10", "brix": 15.2, "firmness": 8.1, "weight_loss": 1.8}],
    "STG-004": [{"date": "2024-10-15", "brix": 12.5, "firmness": 7.0, "weight_loss": 2.0}, {"date": "2024-11-01", "brix": 12.6, "firmness": 6.7, "weight_loss": 2.8}, {"date": "2024-11-15", "brix": 12.7, "firmness": 6.4, "weight_loss": 3.5}, {"date": "2024-12-10", "brix": 12.8, "firmness": 6.2, "weight_loss": 4.2}],
}

MOCK_AI_RECOMMENDATIONS = {
    "STG-001": {"priority": "medium", "action": "monitor", "title": "품질 양호 - 모니터링 지속", "description": "당도 14.8°Bx, 경도 7.5kg로 품질 양호. CA 조건 안정적이나 경도 감소 추세 관찰 필요.", "expected_outcome": "현재 추세 유지 시 1월 중순까지 품질 유지 가능", "estimated_date": "2025-01-15", "price_impact": {"current": 3200, "predicted": 3800}},
    "STG-002": {"priority": "high", "action": "ship_now", "title": "즉시 출하 권장", "description": "홍로 일반저장 79일차로 저장 한계(60일) 초과. 내부 갈변 시작, 경도 급감 중.", "expected_outcome": "금주 내 출하 시 상품성 확보 가능, 지연 시 부패 위험 급증", "estimated_date": "2024-12-13", "price_impact": {"current": 2800, "predicted": 2600}},
    "STG-003": {"priority": "low", "action": "extend_storage", "title": "장기 저장 유리 - 설 명절 노림", "description": "감홍 CA저장 53일차, 당도 15.2°Bx, 경도 8.1kg로 최상급 품질. 저장 여유 67일.", "expected_outcome": "설 명절(1월 말) 출하 시 최고가 형성 예상", "estimated_date": "2025-01-25", "price_impact": {"current": 3500, "predicted": 4500}},
    "STG-004": {"priority": "high", "action": "ship_now", "title": "긴급 출하 필요", "description": "양광 일반저장 73일차로 저장 한계(65일) 초과. 내부 갈변 중등도, 무게 감소 4.2%.", "expected_outcome": "즉시 선별 출하 필수, 지연 시 전량 폐기 위험", "estimated_date": "2024-12-12", "price_impact": {"current": 2600, "predicted": 2300}},
}

MOCK_ALERTS = [
    {"storage_id": "STG-002", "storage_name": "2호 저장고 (일반)", "level": "critical", "message": "홍로 일반저장 79일차 - 저장 한계 19일 초과, 즉시 출하 필요", "action_required": True},
    {"storage_id": "STG-004", "storage_name": "4호 저장고 (일반)", "level": "critical", "message": "양광 일반저장 73일차 - 저장 한계 8일 초과, 내부 갈변 진행 중", "action_required": True},
    {"storage_id": "STG-001", "storage_name": "1호 저장고 (CA)", "level": "warning", "message": "경도 감소 추세 관찰 필요 - 주 1회 품질 측정 권장", "action_required": False},
]

VARIETY_LIMITS = {"busa": {"CA": 150, "NORMAL": 90}, "hongro": {"CA": 90, "NORMAL": 60}, "gamhong": {"CA": 120, "NORMAL": 75}, "yangkwang": {"CA": 100, "NORMAL": 65}, "shinano-sweet": {"CA": 110, "NORMAL": 70}}
QUALITY_THRESHOLDS = {"brix": {"excellent": 15.0, "good": 13.5, "fair": 12.0, "poor": 10.0}, "firmness": {"excellent": 8.0, "good": 7.0, "fair": 6.0, "poor": 5.0}, "weight_loss": {"excellent": 2.0, "good": 3.0, "fair": 4.0, "poor": 5.0}}


def calculate_remaining_days(variety: str, system_type: str, storage_days: int) -> int:
    limits = VARIETY_LIMITS.get(variety, {"CA": 150, "NORMAL": 90})
    limit = limits.get(system_type, 90)
    return max(0, limit - storage_days)


def calculate_ripening_stage(quality: dict, storage_days: int) -> str:
    brix = quality.get("brix", 13)
    firmness = quality.get("firmness", 7)
    if storage_days < 30:
        return "early"
    elif brix >= 14.5 and firmness >= 7.5:
        return "early"
    elif brix >= 14 and firmness >= 6.5:
        return "progressing"
    else:
        return "fast"


def determine_storage_status(storage: dict, quality: dict, remaining_days: int) -> str:
    if remaining_days <= 0:
        return "critical"
    if remaining_days <= 7:
        return "critical"
    if remaining_days <= 14:
        return "warning"
    if quality.get("firmness", 7) < 6.5 or quality.get("weight_loss", 0) > 3.5:
        return "warning"
    if storage.get("current_volume", 0) == 0:
        return "empty"
    return "active"


def calculate_utilization(storage: dict) -> float:
    if storage["capacity"] == 0:
        return 0
    return round((storage["current_volume"] / storage["capacity"]) * 100, 1)


@router.get("", response_model=List[StorageResponse])
async def list_storages(
    status: Optional[str] = Query(None, description="필터: active, warning, critical, empty"),
    variety: Optional[str] = Query(None, description="품종 필터"),
    system_type: Optional[str] = Query(None, description="CA 또는 NORMAL"),
    db: Session = Depends(get_db),
):
    storages = list(MOCK_STORAGES.values())
    
    if status:
        filtered = []
        for s in storages:
            quality = MOCK_QUALITY.get(s["id"], {})
            storage_days = (datetime.now() - datetime.fromisoformat(s["storage_start_date"])).days
            remaining = calculate_remaining_days(s["apple_variety"], s["system_type"], storage_days)
            s_status = determine_storage_status(s, quality, remaining)
            if s_status == status:
                filtered.append(s)
        storages = filtered
    
    if variety:
        storages = [s for s in storages if s["apple_variety"] == variety]
    if system_type:
        storages = [s for s in storages if s["system_type"] == system_type]
    
    return [StorageResponse(**s) for s in storages]


@router.get("/alerts")
async def get_priority_alerts(db: Session = Depends(get_db)):
    return MOCK_ALERTS


@router.get("/{storage_id}", response_model=StorageDetailResponse)
async def get_storage_detail(storage_id: str, db: Session = Depends(get_db)):
    storage = MOCK_STORAGES.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="저장고를 찾을 수 없습니다")
    
    quality = MOCK_QUALITY.get(storage_id, {})
    trends = MOCK_QUALITY_TRENDS.get(storage_id, [])
    ai_rec = MOCK_AI_RECOMMENDATIONS.get(storage_id, {})
    alert = next((a for a in MOCK_ALERTS if a["storage_id"] == storage_id), None)
    
    storage_days = (datetime.now() - datetime.fromisoformat(storage["storage_start_date"])).days
    remaining_days = calculate_remaining_days(storage["apple_variety"], storage["system_type"], storage_days)
    ripening_stage = calculate_ripening_stage(quality, storage_days)
    status = determine_storage_status(storage, quality, remaining_days)
    utilization = calculate_utilization(storage)
    
    quality_status = None
    if quality:
        quality_status = QualityStatusResponse(
            id=1,
            storage_id=storage_id,
            **quality
        )
    
    return StorageDetailResponse(
        storage=StorageResponse(**storage),
        quality_status=quality_status,
        quality_trend=[QualityTrendPoint(**t) for t in trends],
        ai_recommendation=AIRecommendationResponse(
            storage_id=storage_id,
            created_at=datetime.now().isoformat(),
            **ai_rec
        ) if ai_rec else None,
        priority_alert=StorageAlertResponse(**alert) if alert else None,
        utilization_rate=utilization,
        remaining_days=remaining_days,
        ripening_stage=ripening_stage,
        status=status,
    )


@router.post("", response_model=StorageResponse, status_code=201)
async def create_storage(storage: StorageCreate, db: Session = Depends(get_db)):
    new_id = f"STG-{len(MOCK_STORAGES) + 1:03d}"
    now = datetime.now().isoformat()
    new_storage = {
        "id": new_id,
        "current_volume": 0,
        "created_at": now,
        "updated_at": now,
        **storage.model_dump()
    }
    MOCK_STORAGES[new_id] = new_storage
    return StorageResponse(**new_storage)


@router.put("/{storage_id}", response_model=StorageResponse)
async def update_storage(storage_id: str, update: StorageUpdate, db: Session = Depends(get_db)):
    storage = MOCK_STORAGES.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="저장고를 찾을 수 없습니다")
    
    update_data = update.model_dump(exclude_unset=True)
    storage.update(update_data)
    storage["updated_at"] = datetime.now().isoformat()
    return StorageResponse(**storage)


@router.delete("/{storage_id}")
async def delete_storage(storage_id: str, db: Session = Depends(get_db)):
    if storage_id not in MOCK_STORAGES:
        raise HTTPException(status_code=404, detail="저장고를 찾을 수 없습니다")
    del MOCK_STORAGES[storage_id]
    return {"success": True, "message": "저장고가 삭제되었습니다"}


@router.get("/{storage_id}/quality-trend", response_model=List[QualityTrendPoint])
async def get_quality_trend(storage_id: str, db: Session = Depends(get_db)):
    if storage_id not in MOCK_QUALITY_TRENDS:
        raise HTTPException(status_code=404, detail="저장고를 찾을 수 없습니다")
    return [QualityTrendPoint(**t) for t in MOCK_QUALITY_TRENDS[storage_id]]


@router.get("/{storage_id}/ai-recommendation", response_model=AIRecommendationResponse)
async def get_ai_recommendation(storage_id: str, db: Session = Depends(get_db)):
    if storage_id not in MOCK_AI_RECOMMENDATIONS:
        raise HTTPException(status_code=404, detail="저장고를 찾을 수 없습니다")
    rec = MOCK_AI_RECOMMENDATIONS[storage_id]
    return AIRecommendationResponse(storage_id=storage_id, created_at=datetime.now().isoformat(), **rec)