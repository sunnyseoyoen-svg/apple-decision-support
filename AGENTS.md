# 사과 출하시기 추천 AI MVP - 개발 계획서

## 프로젝트 개요
- **프로젝트명**: Apple Harvest Advisor (사과 출하시기 추천 AI)
- **목적**: 경북 사과 농가의 저장 품질과 시장 상황 기반 출하 시점 의사결정 지원
- **대상**: 사과 생산 농가, 농협/유통 관계자
- **형태**: 해커톤 MVP 수준 (시연 가능 데모)
- **협업/배포**: GitHub 공유, Vercel(Frontend) + Render/Railway(Backend) 배포 고려

---

## 1. 전체 시스템 아키텍처 (배포 고려)

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (농가/농협)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Vercel)                           │
│  Next.js 14 + Tailwind + TypeScript                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  입력 폼      │  │  결과 대시보드 │  │  히스토리/설정        │  │
│  │  (품종, 수확일,│  │  (추천 카드,   │  │                      │  │
│  │   품질, 저장)  │  │   그래프, 근거) │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘  │
└─────────│─────────────────│──────────────────────│───────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Gateway (Next.js API Routes)                   │
│  /api/analyze/harvest → Backend /api/v1/analyze/harvest         │
│  /api/history         → Backend /api/v1/history                 │
│  /api/mock            → Backend /api/v1/mock                    │
└─────────────────────────────────────────────────────────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Render/Railway)                    │
│  FastAPI + SQLite/PostgreSQL                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  분석 엔진        │  │  LLM 설명 생성    │  │  데이터 레이어 │  │
│  │  - 규칙 기반 로직 │  │  - 추천 근거 텍스트│  │  - PostgreSQL  │  │
│  │  - 품질 예측 모델 │  │  - 자연어 응답    │  │  - Mock JSON   │  │
│  │  - 가격 시뮬레이션│  │                   │  │  - 가격/품종 DB  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 배포 환경 변수 전략
| 환경 | Frontend (Vercel) | Backend (Render/Railway) |
|------|-------------------|--------------------------|
| Local | `.env.local` | `.env` |
| Preview | Vercel Preview Env | Render Preview Env |
| Production | Vercel Production Env | Render Production Env |

---

## 2. 추천 폴더 구조 (Monorepo 스타일)

```
apple-harvest-advisor/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI: lint, typecheck, test
│   │   ├── deploy-frontend.yml # Vercel 배포
│   │   └── deploy-backend.yml  # Render/Railway 배포
│   └── dependabot.yml
│
├── frontend/                    # Next.js 14 App Router (독립 배포 가능)
│   ├── .env.example
│   ├── .env.local              # gitignore
│   ├── .vercelignore
│   ├── vercel.json             # Vercel 설정
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/            # Next.js API Routes (프록시)
│   │   │   │   └── analyze/
│   │   │   │       └── harvest/route.ts
│   │   │   ├── dashboard/      # 결과 대시보드 페이지
│   │   │   │   └── page.tsx
│   │   │   ├── history/        # 분석 히스토리 페이지
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # 랜딩/입력 페이지
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui 기본 컴포넌트
│   │   │   ├── forms/          # 입력 폼 컴포넌트
│   │   │   ├── dashboard/      # 결과 카드, 차트 컴포넌트
│   │   │   └── layout/         # 헤더, 푸터, 네비게이션
│   │   ├── lib/
│   │   │   ├── api.ts          # 백엔드 API 클라이언트
│   │   │   ├── utils.ts        # 유틸리티 (날짜, 포맷팅)
│   │   │   ├── constants.ts    # 품종, 저장방식 등 상수
│   │   │   └── env.ts          # 환경변수 검증 (zod)
│   │   ├── hooks/              # 커스텀 훅 (useAnalysis, useHistory)
│   │   ├── types/              # TypeScript 타입 정의
│   │   └── styles/             # 글로벌 스타일
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── README.md               # 프론트엔드 실행 가이드
│
├── backend/                     # FastAPI (독립 배포 가능)
│   ├── .env.example
│   ├── .env                    # gitignore
│   ├── .dockerignore
│   ├── Dockerfile              # 컨테이너 배포용
│   ├── render.yaml             # Render 배포 설정
│   ├── railway.json            # Railway 배포 설정
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── analyze.py      # POST /analyze/harvest
│   │   │   │   ├── history.py      # GET /history
│   │   │   │   └── mock.py         # GET /mock/data
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py       # 설정 관리 (pydantic-settings)
│   │   │   └── database.py     # DB 연결 (SQLAlchemy)
│   │   ├── models/
│   │   │   ├── request.py      # 요청 스키마 (Pydantic)
│   │   │   ├── response.py     # 응답 스키마
│   │   │   └── database.py     # SQLAlchemy 모델
│   │   ├── services/
│   │   │   ├── analysis_engine.py    # 핵심 분석 로직
│   │   │   ├── price_simulator.py    # 가격 시뮬레이션
│   │   │   ├── quality_predictor.py  # 품질 변화 예측
│   │   │   └── llm_generator.py      # LLM 설명 생성
│   │   ├── utils/
│   │   │   ├── date_utils.py
│   │   │   └── constants.py
│   │   └── main.py             # FastAPI 앱 진입점
│   ├── data/
│   │   ├── mock_prices.json    # 모의 가격 데이터
│   │   ├── varieties.json      # 품종별 특성 데이터
│   │   └── storage_rules.json  # 저장 방식별 규칙
│   ├── tests/                  # pytest 테스트
│   ├── alembic/                # DB 마이그레이션
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml          # 프로젝트 메타데이터
│   ├── pytest.ini
│   └── README.md               # 백엔드 실행 가이드
│
├── docker-compose.yml          # 로컬 전체 스택 실행용
├── Makefile                    # 공통 명령어
├── .gitignore
├── .pre-commit-config.yaml     # pre-commit 훅
├── README.md                   # 메인 문서 (실행/배포/기여 가이드)
└── AGENTS.md                   # 이 파일
```

---

## 3. 필요한 라이브러리 및 설정

### Frontend (Next.js)
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-tooltip": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest",
    "recharts": "2.x",
    "date-fns": "3.x",
    "axios": "1.x",
    "zod": "3.x",
    "react-hook-form": "7.x",
    "@hookform/resolvers": "3.x"
  },
  "devDependencies": {
    "@types/node": "20.x",
    "@types/react": "18.x",
    "@types/react-dom": "18.x",
    "eslint": "8.x",
    "eslint-config-next": "14.x",
    "prettier": "3.x",
    "prettier-plugin-tailwindcss": "0.5.x",
    "@typescript-eslint/eslint-plugin": "7.x",
    "@typescript-eslint/parser": "7.x"
  }
}
```

### Backend (FastAPI)
```txt
# requirements.txt (Production)
fastapi==0.109.*
uvicorn[standard]==0.27.*
gunicorn==21.2.*
pydantic==2.6.*
pydantic-settings==2.2.*
sqlalchemy==2.0.*
alembic==1.13.*
asyncpg==0.29.*           # PostgreSQL 드라이버 (Production)
python-multipart==0.0.*
python-dotenv==1.0.*
httpx==0.26.*
openai==1.12.*            # LLM 호출용
pandas==2.2.*
numpy==1.26.*
scikit-learn==1.4.*
apscheduler==3.10.*
email-validator==2.1.*    # Pydantic v2 이메일 검증

# requirements-dev.txt (Development)
pytest==7.4.*
pytest-asyncio==0.23.*
pytest-cov==4.1.*
httpx==0.26.*
ruff==0.3.*               # 빠른 린터/포맷터
mypy==1.8.*
types-python-dotenv==1.0.*
```

---

## 4. 환경 변수 관리 전략

### Frontend (.env.example)
```bash
# Frontend - .env.example
# NEXT_PUBLIC_ 프리픽스 필수 (클라이언트 노출)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Apple Harvest Advisor
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Backend (.env.example)
```bash
# Backend - .env.example
# 절대 커밋하지 않음 (.gitignore 필수)

# Database
# Local: SQLite, Production: PostgreSQL
DATABASE_URL=sqlite:///./harvest_advisor.db
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# LLM (선택: OpenAI 또는 Ollama 로컬)
OPENAI_API_KEY=sk-...
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.1:8b

# Server
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app

# Security
SECRET_KEY=your-secret-key-min-32-chars
```

### 환경 변수 검증 (Backend: pydantic-settings)
```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, field_validator
from typing import List, Optional
import secrets

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./harvest_advisor.db"
    OPENAI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"
    
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @property
    def is_production(self) -> bool:
        return "postgresql" in self.DATABASE_URL or "render.com" in self.FRONTEND_URL

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

---

## 5. 배포 설정 파일

### Frontend: vercel.json
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### Backend: Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 복사
COPY ./app ./app
COPY ./data ./data
COPY ./alembic ./alembic
COPY alembic.ini .

# 비루트 유저
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# 포트
EXPOSE 8000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 실행
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Backend: render.yaml
```yaml
# backend/render.yaml
services:
  - type: web
    name: apple-harvest-advisor-api
    runtime: docker
    dockerfilePath: ./Dockerfile
    plan: free
    region: oregon
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: harvest-advisor-db
          property: connectionString
      - key: OPENAI_API_KEY
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: FRONTEND_URL
        value: https://your-vercel-app.vercel.app
      - key: ALLOWED_ORIGINS
        value: https://your-vercel-app.vercel.app
    healthCheckPath: /health

databases:
  - name: harvest-advisor-db
    databaseName: harvest_advisor
    user: harvest_user
    plan: free
```

### Backend: railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 6. CI/CD 워크플로우

### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend-lint-typecheck:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build

  backend-lint-typecheck-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: backend/requirements.txt
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: ruff check .
      - run: mypy app/
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v4
        with:
          files: ./backend/coverage.xml
```

### .github/workflows/deploy-frontend.yml
```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

---

## 7. 기능 구현 우선순위 (배포 고려)

### 🔴 P0 - MVP 필수 (시연 핵심 + 배포 기초)

| 순번 | 기능 | 상세 | 예상 소요 |
|------|------|------|-----------|
| 1 | **레포지토리 초기화** | Git init, .gitignore, README, 라이선스 | 0.5일 |
| 2 | **모노레포 구조 생성** | 폴더 구조, 공통 설정 파일 | 0.5일 |
| 3 | **프론트엔드 셋업** | Next.js + Tailwind + shadcn/ui + ESLint/Prettier | 0.5일 |
| 4 | **백엔드 셋업** | FastAPI + SQLAlchemy + Alembic + Pytest + Ruff | 0.5일 |
| 5 | **DB 설계/마이그레이션** | 분석 요청/결과 테이블, Alembic 초기 마이그레이션 | 0.5일 |
| 6 | **입력 폼** | 품종/수확일/품질/저장방식/출하량/희망시기 입력 + 유효성 검사 | 0.5일 |
| 7 | **분석 API** | FastAPI `/api/v1/analyze/harvest` 엔드포인트 | 0.5일 |
| 8 | **규칙 엔진** | 저장기간+품질 → 잔여일/추천일/등급 계산 로직 | 1일 |
| 9 | **가격 시뮬레이션** | 품종+시기+출하량 → 예상 가격대 (Mock 데이터) | 0.5일 |
| 10 | **LLM 설명 생성** | 분석 결과 → 자연어 추천 근거 텍스트 생성 | 0.5일 |
| 11 | **결과 대시보드** | 추천 카드 + 품질/가격 그래프 + 근거 표시 | 1일 |
| 12 | **프론트-백 연동** | API 클라이언트, 로딩/에러 상태, 타입 공유 | 0.5일 |
| 13 | **Docker/로컬 전체 스택** | docker-compose.yml로 원커맨드 실행 | 0.5일 |
| 14 | **환경변수/배포 설정** | .env.example, vercel.json, Dockerfile, render.yaml | 0.5일 |
| 15 | **README 작성** | 로컬 실행, 배포, 기여 가이드 문서화 | 0.5일 |

### 🟡 P1 - 시연 품질 향상
- 히스토리 기능 (SQLite/PostgreSQL)
- Mock 데이터 확장 (품종별/월별 가격, 품종 특성 DB)
- 반응형 UI (모바일/태블릿)
- 에러 바운더리, 친화적 에러 메시지, 재시도
- 단위/통합 테스트 커버리지 확보

### 🟢 P2 - 향후 확장
- KAMIS 농산물 가격 API 연동
- IoT 센서 데이터 연동
- 시계열 예측 모델
- 다중 농가 비교/벤치마킹
- 알림 기능

---

## 8. 개발 시작 명령어 (원커맨드 목표)

```bash
# 1. 저장소 클론 후
git clone https://github.com/your-org/apple-harvest-advisor.git
cd apple-harvest-advisor

# 2. 환경 변수 설정
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
# 각각 값 채우기

# 3. 원커맨드 로컬 실행 (Docker Compose)
docker-compose up --build

# 또는 개별 실행:
# 터미널 1: 백엔드
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# 터미널 2: 프론트엔드
cd frontend && npm install && npm run dev

# 4. 접속
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Backend Health: http://localhost:8000/health
```

---

## 9. README.md 구조 (작성 예정)

```markdown
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

# 3. Docker로 전체 스택 실행
docker-compose up --build

# 접속
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

### 개별 실행 (개발용)
```bash
# 백엔드
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
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
   - `NEXT_PUBLIC_API_URL`: 백엔드 프로덕션 URL
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
├── backend/           # FastAPI (Render/Railway 배포)
├── docker-compose.yml # 로컬 전체 스택
└── .github/workflows/ # CI/CD
```

## 🛠 개발 가이드

### 코드 스타일
```bash
# 프론트엔드
cd frontend
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run format      # Prettier

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
```

---

## 10. 데이터베이스 스키마 (초기)

```python
# backend/app/models/database.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class AnalysisGrade(str, enum.Enum):
    IMMEDIATE = "IMMEDIATE"      # 지금 출하
    SOON = "SOON"                # 1~2주 내
    MONITOR = "MONITOR"          # 가격 관망
    LONG_TERM = "LONG_TERM"      # 장기 저장

class AnalysisRequest(Base):
    __tablename__ = "analysis_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    variety = Column(String(50), nullable=False)           # 품종
    harvest_date = Column(DateTime, nullable=False)        # 수확일
    storage_days = Column(Integer, nullable=False)         # 저장 일수
    storage_type = Column(String(20), nullable=False)      # CA/NORMAL
    brix = Column(Float, nullable=False)                   # 당도
    firmness = Column(Float, nullable=False)               # 경도
    appearance = Column(String(20), nullable=False)        # 외관
    expected_volume = Column(Float, nullable=False)        # 예상 출하량 (톤)
    preferred_period = Column(String(50))                  # 희망 출하 시기
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("analysis_requests.id"), nullable=False)
    
    recommended_date = Column(DateTime, nullable=False)    # 추천 출하일
    grade = Column(SQLEnum(AnalysisGrade), nullable=False) # 추천 등급
    min_price = Column(Float, nullable=False)              # 최저 예상가
    max_price = Column(Float, nullable=False)              # 최고 예상가
    reasoning = Column(Text, nullable=False)               # 추천 근거 (LLM 생성)
    quality_score = Column(Float)                          # 품질 점수
    remaining_days = Column(Integer)                       # 잔여 저장 가능일
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

---

## 11. 공통 Makefile (루트)

```makefile
# Makefile
.PHONY: help install dev build test lint format clean

help:
	@echo "Apple Harvest Advisor - Development Commands"
	@echo ""
	@echo "  install     Install all dependencies"
	@echo "  dev         Start all services (docker-compose)"
	@echo "  dev-fe      Start frontend only"
	@echo "  dev-be      Start backend only"
	@echo "  build       Build all services"
	@echo "  test        Run all tests"
	@echo "  lint        Lint all code"
	@echo "  format      Format all code"
	@echo "  clean       Clean build artifacts"
	@echo "  db-init     Initialize database"
	@echo "  db-migrate  Run migrations"

install:
	cd frontend && npm install
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt -r requirements-dev.txt

dev:
	docker-compose up --build

dev-fe:
	cd frontend && npm run dev

dev-be:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

build:
	docker-compose build

test:
	cd backend && source venv/bin/activate && pytest -v
	cd frontend && npm run test

lint:
	cd frontend && npm run lint
	cd backend && source venv/bin/activate && ruff check .

format:
	cd frontend && npm run format
	cd backend && source venv/bin/activate && ruff format .

clean:
	docker-compose down -v
	rm -rf frontend/.next frontend/node_modules
	rm -rf backend/venv backend/__pycache__ backend/.pytest_cache

db-init:
	cd backend && source venv/bin/activate && python init_db.py

db-migrate:
	cd backend && source venv/bin/activate && alembic upgrade head

db-revision:
	cd backend && source venv/bin/activate && alembic revision --autogenerate -m "$(msg)"
```

---

## 12. docker-compose.yml (로컬 전체 스택)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
    depends_on:
      - backend
    command: npm run dev

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./backend/data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./harvest_advisor.db
      - FRONTEND_URL=http://localhost:3000
      - ALLOWED_ORIGINS=http://localhost:3000
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

  # ollama (선택: 로컬 LLM 사용 시)
  # ollama:
  #   image: ollama/ollama:latest
  #   ports:
  #     - "11434:11434"
  #   volumes:
  #     - ollama_data:/root/.ollama
  #   profiles:
  #     - llm

# volumes:
#   ollama_data:
```

---

*이 문서는 개발 진행 상황에 따라 업데이트됩니다. 배포/협업 준비는 Day 1부터 병행합니다.*
