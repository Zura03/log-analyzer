# Log Analyzer

A web app to upload, parse, filter, and visualize log files. Built with FastAPI, React, SQLite, and Docker Compose.

## Quick Start

1. Build and run with Docker Compose:
   ```sh
   docker-compose up --build
   ```
2. Access the frontend at [http://localhost:3000](http://localhost:3000)
3. The backend API runs at [http://localhost:8000](http://localhost:8000)

## Features
- Upload `.log` files
- Parse and filter logs (by level, timestamp, etc.)
- Store parsed data in SQLite
- View analytics and charts

## Project Structure
- `backend/` — FastAPI + SQLite
- `frontend/` — React + Material UI + Recharts
- `docker-compose.yml` — Orchestrates both services

## Customization
- Extend log parsing logic in `backend/main.py`
- Add more charts/components in `frontend/src/`
