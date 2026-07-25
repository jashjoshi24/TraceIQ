import asyncio
from database.connection import SessionLocal
from database.models import ProcessingJob, Capture, JobStatus, ProcessingJobEvent
from services.queue import dequeue_job
from routers.websocket import manager

STAGES = [
    JobStatus.VALIDATING,
    JobStatus.PARSING,
    JobStatus.EXTRACTING_SESSIONS,
    JobStatus.DETECTING_THREATS,
    JobStatus.GENERATING_EVIDENCE,
    JobStatus.AI_ANALYSIS,
    JobStatus.COMPLETED
]

async def run_pipeline_worker():
    print("Worker started...")
    while True:
        try:
            job_id = await dequeue_job()
            print(f"Worker picked up job {job_id}")
            
            db = SessionLocal()
            try:
                job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
                if not job:
                    continue
                capture = job.capture
                
                # Simulate the pipeline steps
                for i, stage in enumerate(STAGES):
                    await asyncio.sleep(2) # Simulate processing time
                    
                    job.current_stage = stage
                    job.progress_percent = int((i + 1) / len(STAGES) * 100)
                    if stage == JobStatus.COMPLETED:
                        capture.status = JobStatus.COMPLETED
                        
                    # Create event log
                    event = ProcessingJobEvent(
                        job_id=job.id,
                        stage=stage,
                        status="success",
                        message=f"Transitioned to {stage.value}"
                    )
                    db.add(event)
                    db.commit()
                    
                    # Push via WS
                    await manager.broadcast({
                        "job_id": str(job.id),
                        "capture_id": str(capture.id),
                        "stage": stage.value,
                        "progress": job.progress_percent
                    })
                    
            finally:
                db.close()
        except Exception as e:
            print(f"Worker error: {e}")
            await asyncio.sleep(5)
