# Makefile
.PHONY: help install dev build test lint format clean db-init db-migrate

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