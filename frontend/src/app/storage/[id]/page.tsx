"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Truck, ArrowLeft, Calendar, Thermometer, Droplets, 
  Gauge, AlertCircle, AlertTriangle, CheckCircle, 
  Trash2, Edit, Clock, Target, Warehouse,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { 
  MOCK_QUALITY_STATUS, 
  MOCK_QUALITY_TRENDS, 
  MOCK_AI_RECOMMENDATIONS,
  MOCK_PRIORITY_ALERTS,
  VARIETY_OPTIONS,
  VARIETY_STORAGE_LIMITS,
  STORAGE_SYSTEM_OPTIONS,
  STORAGE_STATUS_COLORS,
  PRIORITY_LEVELS,
  RIPENING_STAGE_LABELS,
  MOCK_STORAGE_ROOMS,
} from "@/lib/constants";
import { getStorageDetail } from "@/lib/api";
import type { StorageInfo, StorageDetail } from "@/types";

function QualityScoreCard({ label, value, thresholds, unit, reverse = false }: {
  label: string;
  value: number;
  thresholds: { excellent: number; good: number; fair: number };
  unit: string;
  reverse?: boolean;
}) {
  let grade = 'poor';
  let gradeLabel = '나쁨';
  let gradeColor = 'bg-red-100 text-red-700 border-red-200';
  
  if (reverse) {
    if (value <= thresholds.excellent) { grade = 'excellent'; gradeLabel = '우수'; gradeColor = 'bg-green-100 text-green-700 border-green-200'; }
    else if (value <= thresholds.good) { grade = 'good'; gradeLabel = '양호'; gradeColor = 'bg-blue-100 text-blue-700 border-blue-200'; }
    else if (value <= thresholds.fair) { grade = 'fair'; gradeLabel = '보통'; gradeColor = 'bg-yellow-100 text-yellow-700 border-yellow-200'; }
  } else {
    if (value >= thresholds.excellent) { grade = 'excellent'; gradeLabel = '우수'; gradeColor = 'bg-green-100 text-green-700 border-green-200'; }
    else if (value >= thresholds.good) { grade = 'good'; gradeLabel = '양호'; gradeColor = 'bg-blue-100 text-blue-700 border-blue-200'; }
    else if (value >= thresholds.fair) { grade = 'fair'; gradeLabel = '보통'; gradeColor = 'bg-yellow-100 text-yellow-700 border-yellow-200'; }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
      <Badge className={cn("mt-2", gradeColor)}>{gradeLabel}</Badge>
    </div>
  );
}

export default function StorageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storageId = params.id as string;
  
  const [storage, setStorage] = useState<StorageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "quality" | "ai">("overview");
  const [isDeleting, setIsDeleting] = useState(false);

  const getVarietyName = (variety: string) => {
    const v = VARIETY_OPTIONS.find(opt => opt.value === variety);
    return v?.label || variety;
  };

  const getSystemLabel = (type: "CA" | "NORMAL") => {
    const opt = STORAGE_SYSTEM_OPTIONS.find(o => o.value === type);
    return opt?.label || type;
  };

  const getSystemIcon = (type: "CA" | "NORMAL") => {
    const opt = STORAGE_SYSTEM_OPTIONS.find(o => o.value === type);
    return opt?.icon || "";
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      // 목업 데이터 사용 (실제로는 API 호출)
      const storageInfo = MOCK_STORAGE_ROOMS.find(s => s.id === storageId);
      if (!storageInfo) throw new Error("저장고를 찾을 수 없습니다");

      const quality = MOCK_QUALITY_STATUS[storageId];
      const trends = MOCK_QUALITY_TRENDS[storageId] || [];
      const aiRec = MOCK_AI_RECOMMENDATIONS[storageId];
      const alert = MOCK_PRIORITY_ALERTS.find(a => a.storageId === storageId);

      // 상태 계산
      const varietyLimit = VARIETY_STORAGE_LIMITS[storageInfo.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS];
      const limit = varietyLimit ? varietyLimit[storageInfo.systemType] : 90;
      const storageDays = Math.floor((Date.now() - new Date(storageInfo.storageStartDate).getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, limit - storageDays);
      const utilizationRate = Math.round((storageInfo.currentVolume / storageInfo.capacity) * 100 * 10) / 10;

      let status: 'active' | 'warning' | 'critical' | 'empty' = 'active';
      if (storageInfo.currentVolume === 0) status = 'empty';
      else if (remainingDays <= 0 || utilizationRate > 95) status = 'critical';
      else if (remainingDays <= 7 || utilizationRate > 85) status = 'warning';

      let ripeningStage: 'early' | 'progressing' | 'fast' = 'early';
      const ratio = storageDays / limit;
      if (ratio < 0.3) ripeningStage = 'early';
      else if (ratio < 0.7) ripeningStage = 'progressing';
      else ripeningStage = 'fast';

      const detail: StorageDetail = {
        storage: {
          ...storageInfo,
          utilizationRate,
          storageDays,
          remainingDays,
          ripeningStage,
        } as any,
        qualityStatus: quality ? { storageId, ...quality } : undefined,
        qualityTrend: trends,
        aiRecommendation: aiRec ? { storageId, createdAt: new Date().toISOString(), ...aiRec } : undefined,
        priorityAlert: alert ? { storageId: alert.storageId, storageName: alert.storageName, level: alert.level, message: alert.message, actionRequired: alert.actionRequired } : undefined,
        utilizationRate,
        remainingDays,
        ripeningStage,
        status,
      };

      setStorage(detail);
      setError("");
    } catch (err) {
      console.error("상세 정보 로드 실패:", err);
      setError("저장고 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storageId]);

  const handleDelete = async () => {
    if (!confirm("정말 이 저장고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setIsDeleting(true);
    try {
      // 실제로는 deleteStorage(storageId) 호출
      window.alert("삭제되었습니다 (목업 데이터에서는 실제 삭제되지 않습니다)");
      router.push("/storage");
      router.refresh();
    } catch (err) {
      console.error("삭제 실패:", err);
      window.alert("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const labels = { active: '정상', warning: '주의', critical: '위험', empty: '비어있음' };
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      critical: 'bg-red-100 text-red-700 border-red-200',
      empty: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
      <Badge className={cn("text-sm", colors[status as keyof typeof colors])}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const info = PRIORITY_LEVELS[priority as keyof typeof PRIORITY_LEVELS];
    if (!info) return <Badge variant="outline">{priority}</Badge>;
    return (
      <Badge className={cn("gap-1", info.color)}>
        <span>{info.icon}</span>
        {info.label}
      </Badge>
    );
  };

  const getActionLabel = (action: string) => {
    const labels = {
      ship_now: '즉시 출하',
      monitor: '모니터링',
      adjust_env: '환경 조절',
      extend_storage: '장기 저장',
    };
    return labels[action as keyof typeof labels] || action;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/storage">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!storage) return null;

  const s = storage.storage;
  const q = storage.qualityStatus;
  const trends = storage.qualityTrend || [];
  const ai = storage.aiRecommendation;
  const alert = storage.priorityAlert;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/storage" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">목록으로</span>
            </Link>
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Apple Harvest Advisor</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{s.name}</h1>
<div className="flex items-center gap-2">
                  {getStatusBadge(storage.status)}
                  <Badge variant="outline" className="gap-1">
                    <span>{getSystemIcon(s.systemType)}</span>
                    {getSystemLabel(s.systemType)}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-500">{getVarietyName(s.appleVariety)} · 저장 시작: {formatDate(s.storageStartDate)}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href={`/storage/${storageId}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  수정
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </div>

        {/* 우선 알림 표시 */}
        {alert && alert.actionRequired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">⚠ {alert.level === 'critical' ? '위험' : '주의'} - 즉시 조치 필요</h3>
                <p className="text-red-700 mt-1">{alert.message}</p>
                <Link href="#ai-recommendation" className="text-red-600 underline text-sm mt-2 inline-block">
                  AI 추천 확인하기 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 핵심 현황 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">현재 저장량</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.currentVolume.toLocaleString()} / {s.capacity} 톤</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Warehouse className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 transition-all duration-300" 
                  style={{ width: `${storage.utilizationRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">가동률 {storage.utilizationRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">저장 기간</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.storageDays}일</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (s.storageDays! / (VARIETY_STORAGE_LIMITS[s.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS]?.[s.systemType] || 90)) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">한계일 대비 진행률</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">잔여 가능일</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color: storage.remainingDays <= 7 ? '#ef4444' : storage.remainingDays <= 30 ? '#f59e0b' : '#22c55e' }}>
                    {storage.remainingDays}일
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {storage.remainingDays <= 7 ? '즉시 조치 필요' : storage.remainingDays <= 30 ? '출하 준비 필요' : '여유 있음'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">후숙 단계</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{RIPENING_STAGE_LABELS[storage.ripeningStage as keyof typeof RIPENING_STAGE_LABELS]}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">저장 진행도 {Math.round((s.storageDays! / (VARIETY_STORAGE_LIMITS[s.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS]?.[s.systemType] || 90)) * 100)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* 탭 메뉴 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">현재 저장 현황</TabsTrigger>
            <TabsTrigger value="quality">품질 추이</TabsTrigger>
            <TabsTrigger value="ai">AI 추천</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 저장 환경 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                  저장 환경 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">온도</p>
                    <p className="text-2xl font-bold text-gray-900">{s.temperature}℃</p>
                    <p className="text-xs text-gray-500 mt-1">권장: {s.systemType === 'CA' ? '0~1℃' : '0~5℃'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">습도</p>
                    <p className="text-2xl font-bold text-gray-900">{s.humidity}%</p>
                    <p className="text-xs text-gray-500 mt-1">권장: 90~95%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">CO₂ 농도</p>
                    <p className="text-2xl font-bold text-gray-900">{s.co2}%</p>
                    <p className="text-xs text-gray-500 mt-1">{s.systemType === 'CA' ? '권장: 1~3%' : '일반: 0.04%'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">O₂ 농도</p>
                    <p className="text-2xl font-bold text-gray-900">{s.o2}%</p>
                    <p className="text-xs text-gray-500 mt-1">{s.systemType === 'CA' ? '권장: 1~3%' : '일반: 20.9%'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 품질 상태 */}
            {q && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    품질 측정 현황 (최근 측정: {formatDate(q.measuredAt)})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">당도 (Brix)</p>
                      <p className="text-2xl font-bold text-gray-900">{q.brix}°Bx</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">경도 (kg)</p>
                      <p className="text-2xl font-bold text-gray-900">{q.firmness}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">외관</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{q.appearance}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">산도</p>
                      <p className="text-2xl font-bold text-gray-900">{q.acidity}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">내부 갈변</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{q.internalBrowning}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">무게 감소율</p>
                      <p className="text-2xl font-bold text-gray-900">{q.weightLoss}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 저장 한계일 안내 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 mb-2">저장 한계일 안내</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="font-medium text-blue-700">품종:</span> {getVarietyName(s.appleVariety)}</p>
                      <p><span className="font-medium text-blue-700">저장 방식:</span> {getSystemLabel(s.systemType)}</p>
                      <p><span className="font-medium text-blue-700">저장 한계일:</span> <span className="font-bold text-blue-900">{VARIETY_STORAGE_LIMITS[s.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS]?.[s.systemType] || 90}일</span></p>
                      <p><span className="font-medium text-blue-700">현재 저장일:</span> {s.storageDays ?? 0}일</p>
                      <p><span className="font-medium text-blue-700">잔여 가능일:</span> <span className="font-bold" style={{ color: (s.remainingDays ?? 0) <= 7 ? 'red' : (s.remainingDays ?? 0) <= 30 ? 'orange' : 'green' }}>{s.remainingDays ?? 0}일</span></p>
                      <p><span className="font-medium text-blue-700">후숙 단계:</span> {RIPENING_STAGE_LABELS[s.ripeningStage as keyof typeof RIPENING_STAGE_LABELS]}</p>
                    </div>
                    { (s.remainingDays ?? 0) <= 7 && (
                      <p className="mt-3 text-red-700 font-medium">⚠ 저장 한계일 임박! 즉시 출하 검토 필요</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* 당도/경도/무게감소 추이 차트 */}
            {trends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-blue-600" />
                    품질 지표 추이
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis
                          yAxisId="left"
                          stroke="#6b7280"
                          fontSize={12}
                          label={{ value: '당도 (Brix)', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 11 }}
                          domain={[11, 16]}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#6b7280"
                          fontSize={12}
                          label={{ value: '경도 (kg) / 무게감소(%)', angle: 90, position: 'insideRight', offset: -10, fill: '#6b7280', fontSize: 11 }}
                          domain={[0, 10]}
                        />
                        <Tooltip
                          formatter={(value: any) => value === undefined ? '' : value.toFixed(1)}
                          labelFormatter={(label) => `측정일: ${label}`}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="brix"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#22c55e' }}
                          name="당도"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="firmness"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#3b82f6' }}
                          name="경도"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="weight_loss"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 4, fill: '#f59e0b' }}
                          name="무게감소"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-green-500"></span> 당도</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-blue-500"></span> 경도</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-yellow-500" style={{ borderTop: '2px dashed #f59e0b' }}></span> 무게감소</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 품질 상태 평가 */}
            {q && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    종합 품질 평가
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <QualityScoreCard 
                      label="당도" 
                      value={q.brix} 
                      thresholds={{ excellent: 15, good: 13.5, fair: 12 }}
                      unit="°Bx"
                    />
                    <QualityScoreCard 
                      label="경도" 
                      value={q.firmness} 
                      thresholds={{ excellent: 8, good: 7, fair: 6 }}
                      unit="kg"
                    />
                    <QualityScoreCard 
                      label="무게 감소" 
                      value={q.weightLoss} 
                      thresholds={{ excellent: 2, good: 3, fair: 4 }} 
                      reverse={true}
                      unit="%"
                    />
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">종합 평가</h4>
                    <p className="text-gray-700">
                      {q.brix >= 14.5 && q.firmness >= 7.5 && q.weightLoss <= 2.5 
                        ? '전반적으로 품질이 우수합니다. 현재 저장 조건 유지 권장.'
                        : q.brix < 13 || q.firmness < 6.5 || q.weightLoss > 3.5
                        ? '품질 저하 징후가 보입니다. 출하 시기 조정 또는 환경 조절 검토 필요.'
                        : '품질이 양호하나 일부 지표 주의 관찰 필요. 주기적 측정 권장.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-6" id="ai-recommendation">
            {ai && (
              <>
                {/* AI 추천 카드 */}
                <Card className="border-l-4" style={{ borderColor: ai.priority === 'high' ? '#ef4444' : ai.priority === 'medium' ? '#f59e0b' : '#22c55e' }}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{ai.title}</CardTitle>
                        <p className="text-gray-500 mt-1">{ai.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={PRIORITY_LEVELS[ai.priority as keyof typeof PRIORITY_LEVELS]?.color || ''}>
                          <span>{PRIORITY_LEVELS[ai.priority as keyof typeof PRIORITY_LEVELS]?.icon || ''}</span>
                          {PRIORITY_LEVELS[ai.priority as keyof typeof PRIORITY_LEVELS]?.label || ai.priority}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                          <ChevronRight className="h-3 w-3 mr-1" />
                          {getActionLabel(ai.action)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">🎯 예상 결과</h4>
                      <p className="text-purple-700">{ai.expectedOutcome}</p>
                    </div>
                    
                    {ai.estimatedDate && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">📅 추천 출하일</h4>
                        <p className="text-blue-700 text-lg font-medium">{formatDate(ai.estimatedDate)}</p>
                        <p className="text-blue-600 text-sm mt-1">이 시기에 출하 시 최적의 품질과 가격 형성 예상</p>
                      </div>
                    )}

                    {ai.priceImpact && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">💰 가격 영향 예측</h4>
                        <div className="flex gap-8 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500">현재 예상가</p>
                            <p className="font-bold text-gray-900">{formatPrice(ai.priceImpact.current)}/kg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">출하 시 예상가</p>
                            <p className="font-bold text-green-700">{formatPrice(ai.priceImpact.predicted)}/kg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">차이</p>
                            <p className="font-bold" style={{ color: ai.priceImpact.predicted > ai.priceImpact.current ? '#22c55e' : '#ef4444' }}>
                              {ai.priceImpact.predicted > ai.priceImpact.current ? '+' : ''}{formatPrice(ai.priceImpact.predicted - ai.priceImpact.current)}/kg
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">🤖 AI 분석 근거</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>현재 저장일 {s.storageDays!}일, 품종별 한계일 대비 {Math.round((s.storageDays! / (VARIETY_STORAGE_LIMITS[s.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS]?.[s.systemType] || 90)) * 100)}% 진행</li>
                        <li>당도 {q?.brix}°Bx, 경도 {q?.firmness}kg로 품질 {(q?.brix || 0) >= 14.5 && (q?.firmness || 0) >= 7.5 ? '우수' : '보통'}</li>
                        <li>무게 감소율 {q?.weightLoss}%, 내부 갈변 {q?.internalBrowning === 'none' ? '없음' : q?.internalBrowning}</li>
                        <li>저장 환경: 온도 {s.temperature}℃, 습도 {s.humidity}%, CO₂ {s.co2}%, O₂ {s.o2}%</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* 품질 상태 판정 가이드 */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  품질 상태 판정 기준
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-semibold text-green-800">정상</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                      <li>당도 ≥ 15.0°Bx, 경도 ≥ 8.0kg</li>
                      <li>무게 감소율 ≤ 2.0%</li>
                      <li>내부 갈변 없음, 외관 우수</li>
                      <li>저장 환경 적정 범위 내 유지</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="font-semibold text-yellow-800">주의</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li>당도 13.5~15.0°Bx, 경도 7.0~8.0kg</li>
                      <li>무게 감소율 2.0~3.0%</li>
                      <li>미세 갈변 또는 외관 미세 상처</li>
                      <li>저장 환경 미세 편차</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-semibold text-red-800">위험</span>
                    </div>
<ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                       <li>당도 13.5°Bx 미만, 경도 7.0kg 미만</li>
                       <li>무게 감소율 3.0% 초과</li>
                       <li>내부 갈변 중등도 이상, 외관 불량</li>
                       <li>저장 한계일 초과 또는 환경 이탈</li>
                     </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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