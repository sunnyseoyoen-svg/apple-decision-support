import os
from typing import Dict, Any
from openai import OpenAI


SYSTEM_PROMPT = """당신은 경북 사과 농가를 위한 출하시기 추천 AI 어시스턴트입니다.
분석 결과를 바탕으로 농가가 이해하기 쉬운 자연어 추천 근거를 작성하세요.

작성 원칙:
1. 존댓말 사용 (높임말)
2. 구체적인 수치 제시 (저장 일수, 당도, 경도, 예상 가격 등)
3. 품종별 특성 반영
4. 저장 방식(CA/일반)에 따른 차이 설명
5. 시장 상황(가격 추이, 성수기 등) 고려
6. 실행 가능한 행동 제안 (언제, 어떻게 출하할지)
7. 3-5문장 내외로 간결하게"""


USER_PROMPT_TEMPLATE = """다음 분석 데이터를 바탕으로 사과 농가에게 제공할 추천 근거 텍스트를 작성해주세요.

[입력 데이터]
- 품종: {variety_name}
- 수확일: {harvest_date}
- 현재 저장일수: {storage_days}일
- 저장 방식: {storage_type}
- 당도: {brix}°Brix
- 경도: {firmness}kg
- 외관: {appearance}
- 예상 출하량: {expected_volume}톤
- 품질 점수: {quality_score}/100
- 잔여 저장 가능일: {remaining_days}일
- 저장 한계일: {storage_limit}일

[분석 결과]
- 추천 등급: {grade}
- 추천 출하일: {recommended_date}
- 예상 가격대: {min_price}~{max_price}원/kg
- 가격 추이: {price_trend}

위 정보를 종합하여 농가가 바로 이해할 수 있는 추천 이유를 3-5문장으로 작성하세요."""


def generate_reasoning(analysis: Dict[str, Any], input_data: Dict[str, Any]) -> str:
    variety_name = analysis.get("variety_name", input_data.get("variety", ""))
    grade = analysis.get("grade", "")
    recommended_date = analysis.get("recommended_date", "")
    min_price = analysis.get("min_price", 0)
    max_price = analysis.get("max_price", 0)
    price_trend = analysis.get("price_trend", "stable")
    quality_score = analysis.get("quality_score", 0)
    remaining_days = analysis.get("remaining_days", 0)
    storage_limit = analysis.get("storage_limit", 90)

    storage_days = input_data.get("storageDays", input_data.get("storage_days", 0))
    storage_type = input_data.get("storageType", input_data.get("storage_type", "CA"))
    brix = input_data.get("brix", 0)
    firmness = input_data.get("firmness", 0)
    appearance = input_data.get("appearance", "good")
    expected_volume = input_data.get("expectedVolume", input_data.get("expected_volume", 0))
    harvest_date = input_data.get("harvestDate", input_data.get("harvest_date", ""))

    appearance_kr = {"excellent": "우수", "good": "양호", "fair": "보통"}.get(appearance, "양호")
    storage_type_kr = "CA 저장(제어대기)" if storage_type == "CA" else "일반 저온 저장"
    grade_desc = {
        "IMMEDIATE": "지금 출하 강력 추천",
        "SOON": "1~2주 내 출하 권장",
        "MONITOR": "가격 관망 후 출하",
        "LONG_TERM": "장기 저장 후 출하",
    }.get(grade, "")

    trend_text = "상승" if price_trend == "rising" else "하락" if price_trend == "falling" else "보합"

    if grade == "IMMEDIATE":
        return (
            f"현재 {storage_days}일차로 {storage_type_kr} 조건에서 품질 유지 한계({storage_limit}일 내외)에 "
            f"근접했습니다. 당도 {brix}°Brix로 상품성 우수하나 경도가 {firmness}kg로 연화 진행 중입니다. "
            f"{recommended_date[:10]} 도매시장 반입량 감소로 가격 {trend_text} 기대되며, "
            f"이후 품질 저하 폭이 커질 것으로 예상됩니다. 금주 출하 시 최고가 수취 가능합니다."
        )
    elif grade == "SOON":
        return (
            f"{storage_type_kr} {storage_days}일차로 품종 저장 한계({storage_limit}일) 대비 "
            f"잔여 {remaining_days}일 확보되었으나 품질 저하가 시작되었습니다. "
            f"당도 {brix}°Brix, 경도 {firmness}kg로 현재 품질 점수 {quality_score}점입니다. "
            f"{recommended_date[:10]}까지 출하 시 가격 {trend_text} 가능하나, "
            f"이후 급격한 품질 저하 예상되어 1주일 내 선별 출하 권장합니다."
        )
    elif grade == "MONITOR":
        return (
            f"{storage_type_kr} {storage_days}일차로 저장 여유({remaining_days}일 잔여)가 충분합니다. "
            f"당도 {brix}°Brix, 경도 {firmness}kg로 품질 상태 양호({quality_score}점)합니다. "
            f"{recommended_date[:10]} 이후 성수기 진입으로 가격 {trend_text} 가능성이 높으나, "
            f"물량 집중 시 가격 하락 리스크도 존재합니다. 시장 동향 주시하며 "
            f"{recommended_date[:10]} 전후 분할 출하 전략을 권장합니다."
        )
    else:
        return (
            f"CA 저장 {storage_days}일차로 품질 우수(당도 {brix}°Brix, 경도 {firmness}kg, {quality_score}점). "
            f"부사 CA 저장 가능 기간 120~150일로 잔여 {remaining_days}일 이상 확보되어 장기 저장 유리합니다. "
            f"{recommended_date[:10]} 설 명절 수요와 저장 물량 소진기 맞물려 최고가 형성 예상됩니다. "
            f"단, 저장비용(월 ~5만원/톤) 대비 가격 상승분 검토 필요합니다. "
            f"1월 중순 1차 출하, 2월 초 2차 분할 출하 전략을 권장합니다."
        )


async def generate_reasoning_llm(
    analysis: Dict[str, Any],
    input_data: Dict[str, Any],
    openai_api_key: str = None,
) -> str:
    api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return generate_reasoning(analysis, input_data)

    client = OpenAI(api_key=api_key)

    prompt = USER_PROMPT_TEMPLATE.format(
        variety_name=analysis.get("variety_name", input_data.get("variety", "")),
        harvest_date=input_data.get("harvestDate", input_data.get("harvest_date", "")),
        storage_days=input_data.get("storageDays", input_data.get("storage_days", 0)),
        storage_type="CA 저장(제어대기)" if input_data.get("storageType") == "CA" else "일반 저온 저장",
        brix=input_data.get("brix", 0),
        firmness=input_data.get("firmness", 0),
        appearance={"excellent": "우수", "good": "양호", "fair": "보통"}.get(
            input_data.get("appearance", "good"), "양호"
        ),
        expected_volume=input_data.get("expectedVolume", input_data.get("expected_volume", 0)),
        quality_score=analysis.get("quality_score", 0),
        remaining_days=analysis.get("remaining_days", 0),
        storage_limit=analysis.get("storage_limit", 90),
        grade=analysis.get("grade", ""),
        recommended_date=analysis.get("recommended_date", ""),
        min_price=analysis.get("min_price", 0),
        max_price=analysis.get("max_price", 0),
        price_trend=analysis.get("price_trend", "stable"),
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"LLM 생성 실패, 템플릿 사용: {e}")
        return generate_reasoning(analysis, input_data)