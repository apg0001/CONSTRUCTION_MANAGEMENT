import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app.models.user import Base as UserBase
from app.models.team import Base as TeamBase
from app.models.worker import Base as WorkerBase
from app.models.work_record import Base as WorkRecordBase
from app.models.equipment_record import Base as EquipmentRecordBase
from app.routers import auth, users, teams, workers, work_records, equipment_records
from app.init_data import init_default_data
from app.migrations import migrate_add_notes_column

# Create tables
UserBase.metadata.create_all(bind=engine)
TeamBase.metadata.create_all(bind=engine)
WorkerBase.metadata.create_all(bind=engine)
WorkRecordBase.metadata.create_all(bind=engine)
EquipmentRecordBase.metadata.create_all(bind=engine)

# Run migrations
try:
    migrate_add_notes_column()
except Exception as e:
    print(f"마이그레이션 실행 중 오류 (무시 가능): {e}")

# Initialize default data
db = SessionLocal()
try:
    init_default_data(db)
finally:
    db.close()

app = FastAPI(
    title="Construction Site Management API",
    description="API for managing construction work records and equipment",
    version="1.0.0",
)

# CORS middleware
# Get allowed origins from environment variable, default to localhost for development
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(teams.router)
app.include_router(workers.router)
app.include_router(work_records.router)
app.include_router(equipment_records.router)


@app.get("/")
def read_root():
    return {
        "message": "Construction Site Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
