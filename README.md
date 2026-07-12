# Apple Harvest Advisor

사과 출하시기 추천 AI - 경북 사과 농가 의사결정 지원 시스템

## 🚀 빠른 시작

### 사전 요구사항
- Docker & Docker Compose (권장)
- 또는 Node.js 20+, Python 3.11+

### 로컬 개발 환경 실행
```bash
# 1. 저장소 클론
git clone https://github.com/your-org/apple-harvest-advisor.git
cd apple-harvest-advisor

# 2. 환경 변수 설정
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
# 각각 값 채우기 (아래 환경변수 참조)

# 3. Docker로 전체 스택 실행
docker-compose up --build

# 접속
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Backend Health: http://localhost:8000/health
```

### 개별 실행 (개발용)
```bash
# 백엔드
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# 프론트엔드 (새 터미널)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## ☁️ 배포 가이드

### 프론트엔드 (Vercel)
1. Vercel에서 GitHub 저장소 연결
2. Root Directory: `frontend`
3. Environment Variables 설정:
   - `NEXT_PUBLIC_API_URL`: 백엔드 프로덕션 URL (예: `https://your-api.onrender.com/api/v1`)
4. 배포 완료

### 백엔드 (Render)
1. Render에서 New Web Service → Docker
2. Repository 연결, Dockerfile Path: `backend/Dockerfile`
3. PostgreSQL 데이터베이스 생성 및 연결
4. Environment Variables 설정:
   - `DATABASE_URL`: Render PostgreSQL 내부 연결 문자열
   - `OPENAI_API_KEY`: (선택)
   - `SECRET_KEY`: 자동 생성
   - `FRONTEND_URL`: Vercel 배포 URL
   - `ALLOWED_ORIGINS`: Vercel 배포 URL
5. 배포 완료

### 백엔드 (Railway)
1. Railway에서 New Project → Dockerfile
2. `backend/Dockerfile` 지정
3. PostgreSQL 플러그인 추가
4. Variables 탭에서 환경변수 설정 (Render와 동일)
5. 배포 완료

## 📁 프로젝트 구조
```
apple-harvest-advisor/
├── frontend/          # Next.js 14 (Vercel 배포)
│   ├── src/
│   │   ├── app/       # App Router 페이지
│   │   ├── components/ # UI 컴포넌트
│   │   ├── lib/       # 유틸리티, API 클라이언트
│   │   └── types/     # TypeScript 타입
│   ├── vercel.json    # Vercel 설정
│   └── Dockerfile
├── backend/           # FastAPI (Render/Railway 배포)
│   ├── app/
│   │   ├── api/       # API 라우터
│   │   ├── core/      # 설정, DB
│   │   ├── models/    # Pydantic, SQLAlchemy 모델
│   │   └── services/  # 비즈니스 로직
│   ├── data/          # Mock 데이터 (JSON)
│   ├── Dockerfile
│   ├── render.yaml    # Render 설정
│   └── railway.json   # Railway 설정
├── docker-compose.yml # 로컬 전체 스택
└── README.md
```

## 🛠 개발 가이드

### 코드 스타일
```bash
# 프론트엔드
cd frontend
npm run lint        # ESLint
npm run typecheck   # TypeScript

# 백엔드
cd backend
ruff check .        # 린트
ruff format .       # 포맷
mypy app/           # 타입 체크
pytest              # 테스트
```

### Git 워크플로우
- `main`: 프로덕션 배포 브랜치 (보호)
- `develop`: 개발 브랜치
- `feature/*`: 기능 브랜치 → PR → develop
- `release/*`: 릴리스 준비 → main
- `hotfix/*`: 긴급 수정 → main

### 커밋 컨벤션 (Conventional Commits)
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 변경
style: 포맷팅, 세미콜론 등
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드, 설정, 의존성
```

## 🧪 테스트
```bash
# 전체 테스트
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# 개별
cd backend && pytest -v --cov=app
cd frontend && npm run test
```

## 📄 라이선스
MIT License

## 🤝 기여하기
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request



## 🎯 MVP 핵심 기능

1. **출하 정보 입력** - 품종, 수확일, 저장기간, 품질(당도/경도/외관), 출하량
2. **AI 분석** - 규칙 기반 엔진 + LLM 설명 생성
3. **결과 대시보드** - 추천일/등급/가격/근거 + 품질/가격 그래프
4. **히스토리** - 과거 분석 내역 조회

## 📊 시연 시나리오

| 시나리오 | 품종 | 저장일 | 저장방식 | 품질 | 결과 |
|---------|------|--------|----------|------|------|
| 즉시 출하 | 부사 | 45일 | CA | 당도 14.5, 경도 7.2 | IMMEDIATE |
| 가격 관망 | 홍로 | 60일 | 일반 | 당도 13.8, 경도 6.8 | MONITOR |
| 장기 저장 | 부사 | 20일 | CA | 당도 15.2, 경도 8.5 | LONG_TERM |

---

**Apple Harvest Advisor MVP** - 경북 사과 농가의 스마트한 출하 결정을 돕습니다. 🍎
