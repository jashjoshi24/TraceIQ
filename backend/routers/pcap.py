import datetime
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Capture, ProcessingJob, ProcessingJobEvent, JobStatus, AuditLog
from services.storage import StorageService
from services.queue import enqueue_job

router = APIRouter(prefix="/api/pcap", tags=["PCAP Manager"])


# --- Response schemas -------------------------------------------------------
# Returning raw SQLAlchemy ORM objects from a FastAPI endpoint breaks JSON
# serialization (jsonable_encoder trips over SQLAlchemy's internal
# `_sa_instance_state` attribute and recurses into it). These schemas convert
# ORM rows into plain, JSON-safe objects before they're returned.

class CaptureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    original_filename: str
    size_bytes: int
    sha256_hash: str
    format: str
    status: JobStatus
    packet_count: Optional[int] = None
    capture_duration_seconds: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ProcessingJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    capture_id: uuid.UUID
    current_stage: JobStatus
    progress_percent: int
    error_message: Optional[str] = None
    started_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None


@router.post("/uploads")
async def upload_pcap(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.pcap', '.pcapng')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only .pcap or .pcapng allowed.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Simple magic byte check could go here

    # Store file and get hash
    file_path, file_hash = await StorageService.save_file(content, file.filename)

    # Check for duplicates in DB
    existing_capture = db.query(Capture).filter(Capture.sha256_hash == file_hash).first()
    if existing_capture:
        raise HTTPException(status_code=409, detail=f"File already uploaded on {existing_capture.created_at}")

    # Create Capture record
    new_capture = Capture(
        filename=file.filename,
        original_filename=file.filename,
        size_bytes=len(content),
        sha256_hash=file_hash,
        format="pcapng" if file.filename.endswith(".pcapng") else "pcap",
        uploader_id="current_user_stub", # Replace with actual JWT user id
        storage_path=file_path,
        status=JobStatus.QUEUED
    )
    db.add(new_capture)
    db.commit()
    db.refresh(new_capture)

    # Create Job record
    new_job = ProcessingJob(capture_id=new_capture.id, current_stage=JobStatus.QUEUED)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Push onto the (in-memory, for now) processing queue so the background
    # worker actually picks it up. Without this the job just sits in the DB
    # forever as "Queued".
    await enqueue_job(str(new_job.id))

    return {
        "capture_id": str(new_capture.id),
        "job_id": str(new_job.id),
        "message": "Upload successful, queued for processing.",
    }


@router.get("/uploads")
def get_uploads(db: Session = Depends(get_db)):
    captures = db.query(Capture).order_by(Capture.created_at.desc()).all()
    return {"data": [CaptureOut.model_validate(c) for c in captures]}


@router.get("/uploads/{capture_id}")
def get_upload_detail(capture_id: uuid.UUID, db: Session = Depends(get_db)):
    capture = db.query(Capture).filter(Capture.id == capture_id).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")
    return CaptureOut.model_validate(capture)


@router.get("/queue")
def get_queue(db: Session = Depends(get_db)):
    # Returns active jobs for initial sync
    active_jobs = db.query(ProcessingJob).filter(
        ProcessingJob.current_stage.in_([
            JobStatus.QUEUED, JobStatus.UPLOADING, JobStatus.VALIDATING,
            JobStatus.PARSING, JobStatus.EXTRACTING_SESSIONS,
            JobStatus.DETECTING_THREATS, JobStatus.GENERATING_EVIDENCE, JobStatus.AI_ANALYSIS
        ])
    ).all()
    return {"data": [ProcessingJobOut.model_validate(j) for j in active_jobs]}
