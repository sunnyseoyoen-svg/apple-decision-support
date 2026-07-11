"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { GRADE_LABELS } from "@/lib/constants";
import type { AnalysisResult } from "@/types";

interface ResultCardProps {
  result: AnalysisResult;
}

const qualityChartData = [
  { name: '수확일', brix: 13.0, firmness: 9.0 },
  { name: '10일', brix: 13.5, firmness: 8.5 },
  { name: '20일', brix: 14.0, firmness: 8.0 },
  { name: '30일', brix: 14.5, firmness: 7.5 },
  { name: '40일', brix: 14.8, firmness: 7.0 },
  { name: '50일', brix: 15.0, firmness: 6.5 },
  { name: '60일', brix: 15.0, firmness: 6.0 },
];

const priceChartData = [
  { name: '10월', min: 2500, max: 2800, avg: 2650 },
  { name: '11월', min: 2800, max: 3200, avg: 3000 },
  { name: '12월', min: 3200, max: 3600, avg: 3400 },
  { name: '1월', min: 3500, max: 4000, avg: 3750 },
  { name: '2월', min: 3800, max: 4200, avg: 4000 },
  { name: '3월', min: 3500, max: 3900, avg: 3700 },
];

export function ResultCard({ result }: ResultCardProps) {
  const gradeInfo = GRADE_LABELS[result.grade] || GRADE_LABELS.IMMEDIATE;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">AI 출하 분석 결과</CardTitle>
              <p className="text-gray-500">입력하신 데이터를 기반으로 최적의 출하 시점을 분석했습니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("text-lg px-4 py-2", gradeInfo.color)}>
                {gradeInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-700 font-medium">추천 출하일</p>
              <p className="text-2xl font-bold text-green-900">{formatDate(result.recommendedDate)}</p>
              <p className="text-sm text-green-600">D+{result.remainingDays}일 후</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 font-medium">예상 가격대</p>
              <p className="text-2xl font-bold text-blue-900">{formatPrice(result.minPrice)} ~ {formatPrice(result.maxPrice)}</p>
              <p className="text-sm text-blue-600">kg당 도매가격 기준</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700 font-medium">품질 점수</p>
              <p className="text-2xl font-bold text-purple-900">{result.qualityScore}/100</p>
              <p className="text-sm text-purple-600">당도·경도·외관 종합</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-700 font-medium">잔여 저장 가능일</p>
              <p className="text-2xl font-bold text-amber-900">{result.remainingDays}일</p>
              <p className="text-sm text-amber-600">품질 한계 기준</p>
            </div>
          </div>

          <Tabs defaultValue="quality" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quality">품질 변화 예측</TabsTrigger>
              <TabsTrigger value="price">가격 추이 예측</TabsTrigger>
            </TabsList>

            <TabsContent value="quality" className="space-y-4">
              <h4 className="font-medium text-gray-700">저장 기간별 품질 변화 예측 (당도/경도)</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
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
                      label={{ value: '경도 (kg)', angle: 90, position: 'insideRight', offset: -10, fill: '#6b7280', fontSize: 11 }}
                      domain={[4, 10]}
                    />
                    <Tooltip
                      formatter={(value: any) => [typeof value === 'number' ? value.toFixed(1) : String(value), '']}
                      labelFormatter={(label: any) => `저장 ${label}`}
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
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500">※ 점선: 현재 저장일 / 실선: 품질 변화 추이</p>
            </TabsContent>

            <TabsContent value="price" className="space-y-4">
              <h4 className="font-medium text-gray-700">월별 예상 도매가격 추이</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: '가격 (원/kg)', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => formatPrice(value).replace('원', '')}
                    />
                    <Tooltip
                      formatter={(value: any) => [typeof value === 'number' ? formatPrice(value) : String(value), '예상가']}
                      labelFormatter={(label: any) => `${label} 예상`}
                    />
                    <Bar dataKey="min" name="최저가" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" name="최고가" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg" name="평균가" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500">※ 최근 3년 평균 도매시장 가격 기준 (품종: 부사, 경북 지역)</p>
            </TabsContent>
          </Tabs>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI 추천 근거</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{result.reasoning}</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}