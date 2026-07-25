import asyncio
from database.models import JobStatus

# For this initial stub version, we will use a simple in-memory asyncio queue
# to avoid hard dependency on Redis for the very first run. 
# A real implementation would push to a Redis list or Celery here.
job_queue = asyncio.Queue()

async def enqueue_job(job_id: str):
    await job_queue.put(job_id)

async def dequeue_job() -> str:
    return await job_queue.get()
