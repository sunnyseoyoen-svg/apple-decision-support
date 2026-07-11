from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.request import HarvestInput, AnalysisResult
from app.models.database import AnalysisRequest, AnalysisResult as DBAnalysisResult, AnalysisGrade
from app.services.analysis_engine import analyze_harvest
from app.services.llm_generator import generate_reasoning

router = APIRouter(prefix="/v1")


@router.post("/analyze/harvest", response_model=AnalysisResult)
async def analyze_harvest_endpoint(
    input_data: HarvestInput,
    db: Session = Depends(get_db),
):
    try:
        analysis = analyze_harvest(
            variety=input_data.variety.value,
            harvest_date=input_data.harvestDate,
            storage_days=input_data.storageDays,
            storage_type=input_data.storageType.value,
            brix=input_data.brix,
            firmness=input_data.firmness,
            appearance=input_data.appearance.value,
            expected_volume=input_data.expectedVolume,
            preferred_period=input_data.preferredPeriod,
        )

        reasoning = generate_reasoning(analysis, input_data.model_dump())

        db_request = AnalysisRequest(
            variety=input_data.variety.value,
            harvest_date=datetime.fromisoformat(input_data.harvestDate),
            storage_days=input_data.storageDays,
            storage_type=input_data.storageType.value,
            brix=input_data.brix,
            firmness=input_data.firmness,
            appearance=input_data.appearance.value,
            expected_volume=input_data.expectedVolume,
            preferred_period=input_data.preferredPeriod,
        )
        db.add(db_request)
        db.flush()

        db_result = DBAnalysisResult(
            request_id=db_request.id,
            recommended_date=datetime.fromisoformat(analysis["recommended_date"]),
            grade=AnalysisGrade(analysis["grade"]),
            min_price=analysis["min_price"],
            max_price=analysis["max_price"],
            reasoning=reasoning,
            quality_score=analysis["quality_score"],
            remaining_days=analysis["remaining_days"],
        )
        db.add(db_result)
        db.commit()

        return AnalysisResult(
            recommendedDate=analysis["recommended_date"],
            grade=analysis["grade"],
            minPrice=analysis["min_price"],
            maxPrice=analysis["max_price"],
            reasoning=reasoning,
            qualityScore=analysis["quality_score"],
            remainingDays=analysis["remaining_days"],
            priceTrend=analysis["price_trend"],
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")


@router.get("/history", response_model=List[dict])
async def get_history(db: Session = Depends(get_db)):
    results = (
        db.query(AnalysisRequest, DBAnalysisResult)
        .join(DBAnalysisResult, AnalysisRequest.id == DBAnalysisResult.request_id)
        .order_by(AnalysisRequest.created_at.desc())
        .limit(50)
        .all()
    )

    history = []
    for req, res in results:
        history.append({
            "id": req.id,
            "input": {
                "variety": req.variety,
                "harvestDate": req.harvest_date,
                "storageDays": req.storage_days,
                "storageType": req.storage_type,
                "brix": req.brix,
                "firmness": req.firmness,
                "appearance": req.appearance,
                "expectedVolume": req.expected_volume,
                "preferredPeriod": req.preferred_period,
            },
            "result": {
                "recommendedDate": res.recommended_date,
                "grade": res.grade.value,
                "minPrice": res.min_price,
                "maxPrice": res.max_price,
                "reasoning": res.reasoning,
                "qualityScore": res.quality_score,
                "remainingDays": res.remaining_days,
            },
            "createdAt": req.created_at.isoformat() if req.created_at else None,
        })

    return history


@router.get("/mock/data")
async def get_mock_data():
    import json
    from pathlib import Path

    data_dir = Path(__file__).parent.parent.parent.parent / "data"

    with open(data_dir / "varieties.json", "r", encoding="utf-8") as f:
        varieties = json.load(f)

    with open(data_dir / "mock_prices.json", "r", encoding="utf-8") as f:
        prices = json.load(f)

    return {"varieties": varieties, "prices": prices}


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "apple-harvest-advisor-api"}