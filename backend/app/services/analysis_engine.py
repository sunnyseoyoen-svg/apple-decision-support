from datetime import datetime, timedelta
from typing import Dict, Any


VARIETY_STORAGE_LIMITS = {
    "busa": {"CA": 150, "NORMAL": 90},
    "hongro": {"CA": 90, "NORMAL": 60},
    "gamhong": {"CA": 120, "NORMAL": 75},
    "yangkwang": {"CA": 100, "NORMAL": 65},
    "sinano": {"CA": 110, "NORMAL": 70},
}

VARIETY_NAMES = {
    "busa": "부사(후지)",
    "hongro": "홍로",
    "gamhong": "감홍",
    "yangkwang": "양광",
    "sinano": "시나노스위트",
}

BRIX_THRESHOLDS = {"excellent": 15.0, "good": 13.5, "fair": 12.0}
FIRMNESS_THRESHOLDS = {"excellent": 8.0, "good": 7.0, "fair": 6.0}

MOCK_MONTHLY_PRICES = {
    "busa": {
        10: {"min": 2800, "max": 3200, "avg": 3000},
        11: {"min": 3000, "max": 3500, "avg": 3250},
        12: {"min": 3200, "max": 3800, "avg": 3500},
        1: {"min": 3500, "max": 4200, "avg": 3850},
        2: {"min": 3800, "max": 4500, "avg": 4150},
        3: {"min": 3500, "max": 4000, "avg": 3750},
    },
    "hongro": {
        9: {"min": 2500, "max": 3000, "avg": 2750},
        10: {"min": 2800, "max": 3300, "avg": 3050},
        11: {"min": 3000, "max": 3500, "avg": 3250},
        12: {"min": 3200, "max": 3700, "avg": 3450},
    },
    "gamhong": {
        10: {"min": 3200, "max": 3800, "avg": 3500},
        11: {"min": 3500, "max": 4200, "avg": 3850},
        12: {"min": 3800, "max": 4500, "avg": 4150},
        1: {"min": 4000, "max": 4800, "avg": 4400},
    },
    "yangkwang": {
        9: {"min": 2600, "max": 3100, "avg": 2850},
        10: {"min": 2900, "max": 3400, "avg": 3150},
        11: {"min": 3100, "max": 3600, "avg": 3350},
    },
    "sinano": {
        10: {"min": 3000, "max": 3600, "avg": 3300},
        11: {"min": 3300, "max": 4000, "avg": 3650},
        12: {"min": 3600, "max": 4300, "avg": 3950},
    },
}


def calculate_quality_score(brix: float, firmness: float, appearance: str) -> float:
    brix_score = 0
    if brix >= BRIX_THRESHOLDS["excellent"]:
        brix_score = 40
    elif brix >= BRIX_THRESHOLDS["good"]:
        brix_score = 30
    elif brix >= BRIX_THRESHOLDS["fair"]:
        brix_score = 20
    else:
        brix_score = 10

    firmness_score = 0
    if firmness >= FIRMNESS_THRESHOLDS["excellent"]:
        firmness_score = 35
    elif firmness >= FIRMNESS_THRESHOLDS["good"]:
        firmness_score = 25
    elif firmness >= FIRMNESS_THRESHOLDS["fair"]:
        firmness_score = 15
    else:
        firmness_score = 5

    appearance_score = {"excellent": 25, "good": 18, "fair": 10}.get(appearance, 10)

    return min(100, brix_score + firmness_score + appearance_score)


def get_monthly_price(variety: str, month: int) -> Dict[str, int]:
    return MOCK_MONTHLY_PRICES.get(variety, MOCK_MONTHLY_PRICES["busa"]).get(
        month, {"min": 3000, "max": 3500, "avg": 3250}
    )


def calculate_price_simulation(
    variety: str,
    recommended_date: str,
    expected_volume: float,
    quality_score: float,
) -> tuple:
    rec_date = datetime.fromisoformat(recommended_date)
    month = rec_date.month

    base_price = get_monthly_price(variety, month)

    quality_multiplier = 0.8 + (quality_score / 100) * 0.4
    volume_factor = 1.0
    if expected_volume > 20:
        volume_factor = 0.95
    elif expected_volume > 10:
        volume_factor = 0.98

    min_price = int(base_price["min"] * quality_multiplier * volume_factor)
    max_price = int(base_price["max"] * quality_multiplier * volume_factor)

    return min_price, max_price


def determine_grade(
    remaining_ratio: float,
    quality_score: float,
    remaining_days: int,
) -> str:
    if remaining_ratio < 0.2 or quality_score < 60 or remaining_days <= 7:
        return "IMMEDIATE"
    elif remaining_ratio < 0.4 or quality_score < 75 or remaining_days <= 14:
        return "SOON"
    elif remaining_ratio < 0.7 or quality_score < 85:
        return "MONITOR"
    else:
        return "LONG_TERM"


def find_peak_price_month(variety: str, current_month: int) -> int:
    prices = MOCK_MONTHLY_PRICES.get(variety, MOCK_MONTHLY_PRICES["busa"])
    future_months = [m for m in prices.keys() if m > current_month] or list(prices.keys())
    return max(future_months, key=lambda m: prices[m]["avg"])


def analyze_harvest(
    variety: str,
    harvest_date: str,
    storage_days: int,
    storage_type: str,
    brix: float,
    firmness: float,
    appearance: str,
    expected_volume: float,
    preferred_period: str = None,
) -> Dict[str, Any]:
    harvest_dt = datetime.fromisoformat(harvest_date)
    today = datetime.now()
    elapsed_days = (today - harvest_dt).days

    storage_limit = VARIETY_STORAGE_LIMITS.get(variety, {}).get(storage_type, 90)
    remaining_days = max(0, storage_limit - storage_days)
    remaining_ratio = remaining_days / storage_limit if storage_limit > 0 else 0

    quality_score = calculate_quality_score(brix, firmness, appearance)

    grade = determine_grade(remaining_ratio, quality_score, remaining_days)

    if grade == "IMMEDIATE":
        recommended_date = today + timedelta(days=3)
    elif grade == "SOON":
        recommended_date = today + timedelta(days=7)
    elif grade == "MONITOR":
        recommended_date = today + timedelta(days=14)
    else:
        peak_month = find_peak_price_month(variety, today.month)
        target_year = today.year if peak_month > today.month else today.year + 1
        recommended_date = datetime(target_year, peak_month, 15)

    min_price, max_price = calculate_price_simulation(
        variety, recommended_date.isoformat(), expected_volume, quality_score
    )

    price_data = get_monthly_price(variety, recommended_date.month)
    price_trend = "rising" if price_data["avg"] > get_monthly_price(variety, today.month)["avg"] else "stable"

    return {
        "variety_name": VARIETY_NAMES.get(variety, variety),
        "storage_limit": storage_limit,
        "remaining_days": remaining_days,
        "remaining_ratio": remaining_ratio,
        "quality_score": round(quality_score, 1),
        "grade": grade,
        "recommended_date": recommended_date.strftime("%Y-%m-%d"),
        "min_price": min_price,
        "max_price": max_price,
        "price_trend": price_trend,
    }