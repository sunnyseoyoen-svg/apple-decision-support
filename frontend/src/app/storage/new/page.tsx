"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, ArrowLeft, Calendar, Thermometer, Droplets, Gauge, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  STORAGE_SYSTEM_OPTIONS, 
  VARIETY_OPTIONS,
  VARIETY_STORAGE_LIMITS,
} from "@/lib/constants";
import { createStorage } from "@/lib/api";
import type { CreateStorageInput } from "@/types";

export default function StorageNewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateStorageInput>({
    name: "",
    systemType: "CA",
    capacity: 100,
    appleVariety: "busa",
    harvestDate: "",
    temperature: 1.0,
    humidity: 90,
    co2: 2.0,
    o2: 2.5,
  });

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const payload = {
        ...formData,
        storageStartDate: todayStr,
      };
      
      await createStorage(payload);
      router.push("/storage");
      router.refresh();
    } catch (err) {
      console.error("저장고 등록 실패:", err);
      setError("저장고 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getVarietyName = (variety: string) => {
    const v = VARIETY_OPTIONS.find(opt => opt.value === variety);
    return v?.label || variety;
  };

  const getStorageLimit = (variety: string, systemType: "CA" | "NORMAL"): number => {
    return VARIETY_STORAGE_LIMITS[variety as keyof typeof VARIETY_STORAGE_LIMITS]?.[systemType] || 90;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/storage" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">뒤로</span>
            </Link>
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Apple Harvest Advisor</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">새 저장고 등록</h1>
          <p className="text-gray-500 mt-1">새로운 저장고 정보를 입력하고 등록하세요.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">저장고 이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="예: 1호 저장고 (CA)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemType">저장 방식</Label>
                  <Select
                    value={formData.systemType}
                    onValueChange={(value) => handleChange("systemType", value as "CA" | "NORMAL")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="저장 방식 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {STORAGE_SYSTEM_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="capacity">최대 용량 (톤)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="500"
                    step="0.1"
                    value={formData.capacity}
                    onChange={(e) => handleChange("capacity", parseFloat(e.target.value) || 0)}
                    placeholder="예: 100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appleVariety">사과 품종</Label>
                  <Select
                    value={formData.appleVariety}
                    onValueChange={(value) => handleChange("appleVariety", value || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="품종 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIETY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">수확일</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  max={today}
                  value={formData.harvestDate}
                  onChange={(e) => handleChange("harvestDate", e.target.value)}
                  required
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">선택한 품종의 저장 한계일: {getStorageLimit(formData.appleVariety, formData.systemType)}일</p>
              </div>
            </CardContent>
          </Card>

          {/* 저장 환경 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-600" />
                저장 환경 설정 (초기값)
              </CardTitle>
              <p className="text-sm text-gray-500">저장 시작 시 환경 조건입니다. 추후 수정 가능합니다.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">온도 (℃)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="-5"
                    max="10"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleChange("temperature", parseFloat(e.target.value) || 0)}
                    placeholder="예: 1.0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity">습도 (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    min="50"
                    max="100"
                    step="1"
                    value={formData.humidity}
                    onChange={(e) => handleChange("humidity", parseInt(e.target.value) || 0)}
                    placeholder="예: 90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="co2">CO₂ 농도 (%)</Label>
                  <Input
                    id="co2"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.co2}
                    onChange={(e) => handleChange("co2", parseFloat(e.target.value) || 0)}
                    placeholder="예: 2.0"
                    required
                  />
                  <p className="text-xs text-gray-500">CA 저장 시만 적용 (일반: 0.04)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="o2">O₂ 농도 (%)</Label>
                  <Input
                    id="o2"
                    type="number"
                    min="0"
                    max="21"
                    step="0.1"
                    value={formData.o2}
                    onChange={(e) => handleChange("o2", parseFloat(e.target.value) || 0)}
                    placeholder="예: 2.5"
                    required
                  />
                  <p className="text-xs text-gray-500">CA 저장 시만 적용 (일반: 20.9)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 저장 한계일 안내 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📋 저장 한계일 안내</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-blue-700 font-medium">선택 품종: {getVarietyName(formData.appleVariety)}</p>
                <p className="text-blue-700 font-medium">저장 방식: {formData.systemType === 'CA' ? 'CA 저장' : '일반 저온'}</p>
              </div>
              <div>
                <p className="text-blue-900 font-bold">저장 한계일: {getStorageLimit(formData.appleVariety, formData.systemType)}일</p>
                <p className="text-blue-600">수확일로부터 해당 일수 이후 품질 급격 저하 예상</p>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/storage">
              <Button type="button" variant="outline">취소</Button>
            </Link>
            <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "등록 중..." : "저장고 등록"}
            </Button>
          </div>
        </form>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Apple Harvest Advisor MVP - 경북 사과 농가 의사결정 지원 시스템</p>
          <p className="mt-1">해커톤 데모용 | 실제 농업 의사결정 시 전문가 상담 필수</p>
        </div>
      </footer>
    </div>
  );
}