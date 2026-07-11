import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const response = await fetch(`${apiUrl}/history/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "삭제 실패" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("히스토리 삭제 실패:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}