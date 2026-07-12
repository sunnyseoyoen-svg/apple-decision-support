"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, AlertCircle, CheckCircle, AlertTriangle, Plus, Warehouse, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  MOCK_STORAGE_ROOMS, 
  MOCK_PRIORITY_ALERTS, 
  PRIORITY_LEVELS, 
  STORAGE_STATUS_COLORS,
  STORAGE_SYSTEM_OPTIONS,
  VARIETY_OPTIONS,
  VARIETY_STORAGE_LIMITS,
  RIPENING_STAGE_LABELS,
} from "@/lib/constants";
import { getStorages, getStorageAlerts } from "@/lib/api";
import type { StorageInfo, StorageAlert } from "@/types";

interface StorageWithAlert extends StorageInfo {
  utilizationRate: number;
  storageDays: number;
  remainingDays: number;
  status: 'active' | 'warning' | 'critical' | 'empty';
  ripeningStage: 'early' | 'progressing' | 'fast';
  alertLevel?: 'critical' | 'warning' | 'info';
  alertMessage?: string;
  actionRequired?: boolean;
}

export default function StorageListPage() {
  const [storages, setStorages] = useState<StorageWithAlert[]>([]);
  const [alerts, setAlerts] = useState<StorageAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSystem, setFilterSystem] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const getVarietyName = (variety: string) => {
    const v = VARIETY_OPTIONS.find(opt => opt.value === variety);
    return v?.label || variety;
  };

  const getStatus = (storage: StorageInfo): StorageWithAlert['status'] => {
    if (storage.currentVolume === 0) return 'empty';
    
    const varietyLimit = VARIETY_STORAGE_LIMITS[storage.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS];
    const limit = varietyLimit ? varietyLimit[storage.systemType] : 90;
    
    const startDate = new Date(storage.storageStartDate);
    const today = new Date();
    const storageDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const remainingDays = limit - storageDays;
    const utilizationRate = (storage.currentVolume / storage.capacity) * 100;
    
    if (remainingDays <= 0 || utilizationRate > 95) return 'critical';
    if (remainingDays <= 7 || utilizationRate > 85) return 'warning';
    return 'active';
  };

  const calculateStorageDays = (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRemainingDays = (storage: StorageInfo): number => {
    const varietyLimit = VARIETY_STORAGE_LIMITS[storage.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS];
    const limit = varietyLimit ? varietyLimit[storage.systemType] : 90;
    const storageDays = calculateStorageDays(storage.storageStartDate);
    return Math.max(0, limit - storageDays);
  };

  const getRipeningStage = (storage: StorageInfo): 'early' | 'progressing' | 'fast' => {
    const varietyLimit = VARIETY_STORAGE_LIMITS[storage.appleVariety as keyof typeof VARIETY_STORAGE_LIMITS];
    const limit = varietyLimit ? varietyLimit[storage.systemType] : 90;
    const storageDays = calculateStorageDays(storage.storageStartDate);
    const ratio = storageDays / limit;
    
    if (ratio < 0.3) return 'early';
    if (ratio < 0.7) return 'progressing';
    return 'fast';
  };

  const enrichStorages = (storages: readonly StorageInfo[]): StorageWithAlert[] => {
    return storages.map(storage => {
      const status = getStatus(storage);
      const utilizationRate = (storage.currentVolume / storage.capacity) * 100;
      const storageDays = calculateStorageDays(storage.storageStartDate);
      const remainingDays = getRemainingDays(storage);
      const ripeningStage = getRipeningStage(storage);
      
      // 알림 매칭
      const alert = MOCK_PRIORITY_ALERTS.find(a => a.storageId === storage.id);
      
      return {
        ...storage,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        storageDays,
        remainingDays,
        status,
        ripeningStage,
        alertLevel: alert?.level,
        alertMessage: alert?.message,
        actionRequired: alert?.actionRequired,
      };
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      // 목업 데이터 사용 (실제로는 API 호출)
      const enriched = enrichStorages(MOCK_STORAGE_ROOMS);
      setStorages(enriched);
      setAlerts(MOCK_PRIORITY_ALERTS);
    } catch (error) {
      console.error("저장고 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStorages = storages.filter(storage => {
    const matchesSearch = storage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVarietyName(storage.appleVariety).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = !filterSystem || storage.systemType === filterSystem;
    const matchesStatus = !filterStatus || storage.status === filterStatus;
    return matchesSearch && matchesSystem && matchesStatus;
  });

  const getStatusLabel = (status: StorageWithAlert['status']) => {
    switch (status) {
      case 'active': return '정상';
      case 'warning': return '주의';
      case 'critical': return '위험';
      case 'empty': return '비어있음';
    }
  };

  const getStatusBadge = (status: StorageWithAlert['status']) => {
    const labels = { active: '정상', warning: '주의', critical: '위험', empty: '비어있음' };
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      critical: 'bg-red-100 text-red-700 border-red-200',
      empty: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
      <Badge className={cn("text-sm", colors[status])}>
        {labels[status]}
      </Badge>
    );
  };

  const getSystemBadge = (systemType: 'CA' | 'NORMAL') => {
    const option = STORAGE_SYSTEM_OPTIONS.find(opt => opt.value === systemType);
    if (!option) return <Badge variant="outline">{systemType}</Badge>;
    return (
      <Badge variant="outline" className="gap-1">
        <span>{option.icon}</span>
        {option.label}
      </Badge>
    );
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Apple Harvest Advisor</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">출하시기 추천</Link>
              <span className="font-medium text-gray-900">저장고 관리</span>
              <Link href="/history" className="hover:text-gray-900 transition-colors">히스토리</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">저장고 관리</h1>
              <p className="text-gray-500 mt-1">전체 저장고 현황을 한눈에 확인하고 관리하세요.</p>
            </div>
            <Link href="/storage/new">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                저장고 추가
              </Button>
            </Link>
          </div>
        </div>

        {/* 우선 확인 필요 저장고 알림 */}
        {alerts.filter(a => a.actionRequired).length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">오늘 우선 확인 필요</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.filter(a => a.actionRequired).map((alert, index) => (
                  <div key={alert.storageId} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                    <span className="text-lg">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.storageName} <span className="text-red-600 font-bold">({alert.level === 'critical' ? '위험' : '주의'})</span></p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <Link href={`/storage/${alert.storageId}`}>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        상세 확인
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색/필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="저장고명, 품종 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSystem} onValueChange={(value) => setFilterSystem(value || "")}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="저장 방식" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="CA">CA 저장</SelectItem>
                  <SelectItem value="NORMAL">일반 저온</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value || "")}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="active">정상</SelectItem>
                  <SelectItem value="warning">주의</SelectItem>
                  <SelectItem value="critical">위험</SelectItem>
                  <SelectItem value="empty">비어있음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 저장고 그리드 */}
        {filteredStorages.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <Warehouse className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">저장고가 없습니다</h3>
              <p className="text-gray-500 mb-6">첫 번째 저장고를 등록해보세요.</p>
              <Link href="/storage/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  저장고 추가하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStorages.map((storage) => (
              <Link key={storage.id} href={`/storage/${storage.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderColor: STORAGE_STATUS_COLORS[storage.status] }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{storage.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{getVarietyName(storage.appleVariety)} · {storage.systemType === 'CA' ? 'CA 저장' : '일반 저온'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(storage.status)}
                        {getSystemBadge(storage.systemType)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">저장량</p>
                        <p className="font-medium text-gray-900">{storage.currentVolume.toLocaleString()} / {storage.capacity} 톤</p>
                      </div>
                      <div>
                        <p className="text-gray-500">가동률</p>
                        <p className="font-medium text-gray-900">{storage.utilizationRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">저장 일수</p>
                        <p className="font-medium text-gray-900">{storage.storageDays}일</p>
                      </div>
                      <div>
                        <p className="text-gray-500">잔여 가능일</p>
                        <p className="font-medium text-gray-900" style={{ color: storage.remainingDays <= 7 ? '#ef4444' : storage.remainingDays <= 30 ? '#f59e0b' : '#22c55e' }}>
                          {storage.remainingDays}일
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">후숙 단계: <span className="font-medium text-gray-700">
                        {RIPENING_STAGE_LABELS[storage.ripeningStage as keyof typeof RIPENING_STAGE_LABELS]}
                      </span></p>
                    </div>
                    {storage.alertMessage && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        ⚠ {storage.alertMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
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