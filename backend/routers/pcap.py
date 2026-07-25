from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Capture, ProcessingJob, ProcessingJobEvent, JobStatus, AuditLog
from services.storage import StorageService
from typing import List

router = APIRouter(prefix="/api/pcap", tags=["PCAP Manager"])

@router.post("/uploads")
async def upload_pcap(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.pcap', '.pcapng')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only .pcap or .pcapng allowed.")
        
    content = await file.read()
    
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
    
    # TODO: Enqueue job in Redis
    
    return {"capture_id": new_capture.id, "job_id": new_job.id, "message": "Upload successful, queued for processing."}

@router.get("/uploads")
def get_uploads(db: Session = Depends(get_db)):
    captures = db.query(Capture).order_by(Capture.created_at.desc()).all()
    return {"data": captures}
    
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
    return {"data": active_jobs}
