"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { formatDate, formatPrice, getDaysFromNow, cn } from "@/lib/utils";
import { GRADE_LABELS } from "@/lib/constants";
import { getHistory } from "@/lib/api";
import type { AnalysisHistory } from "@/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error("히스토리 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 분석 기록을 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setHistory(history.filter((h) => h.id !== id));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Apple Harvest Advisor</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                메인으로
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">분석 히스토리</h1>
          <p className="text-gray-500 mt-1">과거 출하 분석 내역을 확인하고 관리하세요.</p>
        </div>

        {history.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">분석 기록이 없습니다</h3>
              <p className="text-gray-500 mb-6">첫 번째 출하 분석을 시작해보세요.</p>
              <Link href="/">
                <Button className="w-full md:w-auto">
                  <Truck className="h-4 w-4 mr-2" />
                  분석 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const gradeInfo = GRADE_LABELS[item.result.grade] || GRADE_LABELS.IMMEDIATE;
              const daysAgo = getDaysFromNow(item.createdAt);

              return (
                <Card key={item.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Truck className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.input.variety === "busa" ? "부사(후지)" : 
                               item.input.variety === "hongro" ? "홍로" :
                               item.input.variety === "gamhong" ? "감홍" :
                               item.input.variety === "yangkwang" ? "양광" : "시나노스위트"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              수확일: {formatDate(item.input.harvestDate)} · 저장 {item.input.storageDays}일 · {item.input.storageType} 저장
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-sm px-3 py-1", gradeInfo.color)}>
                            {gradeInfo.label}
                          </Badge>
                          <span className="text-sm text-gray-500">{daysAgo}일 전</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:ml-auto">
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-gray-900">{formatPrice(item.result.minPrice)} ~ {formatPrice(item.result.maxPrice)}</p>
                          <p className="text-sm text-gray-500">kg당 예상 도매가</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700">추천 출하일</p>
                        <p className="font-semibold text-green-900">{formatDate(item.result.recommendedDate)}</p>
                        <p className="text-xs text-green-600">D+{item.result.remainingDays}일 후</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">예상 가격대</p>
                        <p className="font-semibold text-blue-900">{formatPrice(item.result.minPrice)} ~ {formatPrice(item.result.maxPrice)}</p>
                        <p className="text-xs text-blue-600">kg당 도매가</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-700">품질 점수</p>
                        <p className="font-semibold text-purple-900">{item.result.qualityScore}/100</p>
                        <p className="text-xs text-purple-600">종합 평가</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-xs text-amber-700">잔여 저장일</p>
                        <p className="font-semibold text-amber-900">{item.result.remainingDays}일</p>
                        <p className="text-xs text-amber-600">품질 한계까지</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{item.result.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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