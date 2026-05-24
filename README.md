# VehiTrack Pro

Intelligent vehicle access management and analytics platform.

## Architecture
- **Backend**: FastAPI, SQLAlchemy (async), Alembic, Celery, Redis, Kafka, MinIO, TimescaleDB.
- **Frontend**: React, Vite, Zustand, Tailwind CSS, Recharts.
- **DevOps**: Docker, Nginx.

## Setup
1. Copy `.env.example` to `.env` and fill in the values.
2. Run `docker-compose up --build`.

## API Documentation
Once running, visit `http://localhost:8000/docs` (or via Nginx reverse proxy).
