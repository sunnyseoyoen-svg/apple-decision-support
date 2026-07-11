"use client";

import { useState } from "react";
import { HarvestForm } from "@/components/forms/HarvestForm";
import { ResultCard } from "@/components/dashboard/ResultCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Truck, Calendar, Target } from "lucide-react";
import type { HarvestInput, AnalysisResult } from "@/types";
import { analyzeHarvest } from "@/lib/api";

const mockResult: AnalysisResult = {
  recommendedDate: "2024-12-15",
  grade: "SOON",
  minPrice: 3200,
  maxPrice: 3500,
  reasoning: "현재 저장 45일차로 CA저장 조건에서 품질 유지 한계(약 50~55일)에 근접했습니다. 당도 14.5°Brix로 상품성 우수하나 경도가 7.2kg로 연화 진행 중입니다. 12월 중순 도매시장 반입량 감소로 가격 상승 기대되며, 12월 하순 이후 품질 저하 폭이 커질 것으로 예상됩니다. 금주 출하 시 최고가 수취 가능합니다.",
  qualityScore: 78,
  remainingDays: 7,
  priceTrend: "rising",
};

export default function HomePage() {
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: HarvestInput) => {
    setIsLoading(true);
    try {
      const analysisResult = await analyzeHarvest(data);
      setResult(analysisResult);
      setShowResult(true);
    } catch (error) {
      console.error("분석 실패:", error);
      // Fallback to mock for demo
      setResult(mockResult);
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setResult(null);
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                다시 입력하기
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">AI 출하 분석 결과</h1>
            <p className="text-gray-500 mt-1">입력하신 데이터를 기반으로 최적의 출하 시점을 분석했습니다.</p>
          </div>

          <ResultCard result={result} />

          <div className="mt-8 text-center">
            <Button onClick={handleBack} variant="outline" size="lg">
              새로운 분석 시작
            </Button>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>Apple Harvest Advisor MVP - 경북 사과 농가 의사결정 지원 시스템</p>
            <p className="mt-1">해커톤 데모용 | 실제 농업 의사결정 시 전문가 상담 필수</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Apple Harvest Advisor</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Target className="h-4 w-4" /> MVP Demo</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> 경북 사과 특화</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-2xl">AI 기반 출하 시기 분석</CardTitle>
                </div>
                <p className="text-gray-500 mt-1">
                  사과 품종, 수확일, 저장 기간, 품질 상태를 입력하면 AI가 최적의 출하 시점과 예상 가격을 추천합니다.
                </p>
              </CardHeader>
              <CardContent>
                <HarvestForm onSubmit={handleSubmit} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  분석 항목
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="font-medium text-green-900">추천 출하일</p>
                  <p className="text-sm text-green-700">D+X일 후 최적 출하 시점</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-medium text-blue-900">예상 가격대</p>
                  <p className="text-sm text-blue-700">kg당 도매가격 범위</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-900">추천 등급</p>
                  <p className="text-sm text-purple-700">지금 출하 / 관망 / 장기 저장</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-900">AI 추천 근거</p>
                  <p className="text-sm text-amber-700">자연어 설명 제공</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  MVP 시연 시나리오
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="font-medium text-red-900">시나리오 1: 즉시 출하</p>
                  <p className="text-red-700">저장 한계 임박, 품질 저하 전 출하</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="font-medium text-yellow-900">시나리오 2: 가격 관망</p>
                  <p className="text-yellow-700">저장 여유 있으나 가격 상승 대기</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="font-medium text-green-900">시나리오 3: 장기 저장</p>
                  <p className="text-green-700">CA 저장 활용, 명절 성수기 노림</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 text-center">
                  <strong className="text-gray-900">지원 품종:</strong> 부사(후지), 홍로, 감홍, 양광, 시나노스위트<br />
                  <strong className="text-gray-900">저장 방식:</strong> CA 저장(제어대기), 일반 저온 저장<br />
                  <strong className="text-gray-900">데이터 소스:</strong> Mock 데이터 (실제 연동 시 KAMIS API 등)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Apple Harvest Advisor MVP - 경북 사과 농가 의사결정 지원 시스템</p>
          <p className="mt-1">해커톤 데모용 | 실제 농업 의사결정 시 전문가 상담 필수</p>
        </div>
      </footer>
    </div>
  );
}