import uuid
import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from .connection import Base
import enum

class JobStatus(str, enum.Enum):
    QUEUED = "Queued"
    UPLOADING = "Uploading"
    VALIDATING = "Validating"
    PARSING = "Parsing"
    EXTRACTING_SESSIONS = "Extracting Sessions"
    DETECTING_THREATS = "Detecting Threats"
    GENERATING_EVIDENCE = "Generating Evidence"
    AI_ANALYSIS = "AI Analysis"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"

class Capture(Base):
    __tablename__ = "captures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    sha256_hash = Column(String, unique=True, index=True, nullable=False)
    format = Column(String, nullable=False) # pcap | pcapng
    uploader_id = Column(String, nullable=True) # fk to users (stub)
    investigation_id = Column(String, nullable=True) # fk to investigations
    status = Column(Enum(JobStatus), default=JobStatus.QUEUED)
    storage_path = Column(String, nullable=False)
    packet_count = Column(Integer, nullable=True)
    capture_duration_seconds = Column(Integer, nullable=True)
    protocol_summary = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    jobs = relationship("ProcessingJob", back_populates="capture")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    capture_id = Column(UUID(as_uuid=True), ForeignKey("captures.id"), nullable=False)
    current_stage = Column(Enum(JobStatus), default=JobStatus.QUEUED)
    progress_percent = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    retry_count = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    capture = relationship("Capture", back_populates="jobs")
    events = relationship("ProcessingJobEvent", back_populates="job")

class ProcessingJobEvent(Base):
    __tablename__ = "processing_job_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("processing_jobs.id"), nullable=False)
    stage = Column(Enum(JobStatus), nullable=False)
    status = Column(String, nullable=False) # success, error, info
    message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("ProcessingJob", back_populates="events")

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    metadata_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
