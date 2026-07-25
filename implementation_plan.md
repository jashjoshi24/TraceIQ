# TraceIQ — PCAP Manager Module Implementation Plan

This document outlines the architectural changes and implementation steps to rebrand SentinelX to TraceIQ and build the new PCAP Manager module.

## User Review Required
> [!IMPORTANT]
> **Database & Cache Infrastructure:** This plan introduces PostgreSQL and Redis to the backend stack, which currently only relies on in-memory mock data. You will need to ensure you have a running PostgreSQL and Redis instance locally (e.g., via Docker Compose) when we execute this, as the background processing queue and WebSocket pub/sub rely heavily on them.
> 
> **App Layout Refactoring:** The existing Next.js dashboard has the Top Navigation and Sidebar hardcoded into `app/page.tsx`. To support the new PCAP Manager page without duplicating code, we will refactor the frontend to extract the shell into `app/layout.tsx`.

## Open Questions
- Since RBAC (Authentication & Roles) is mentioned but the current mock backend has no actual JWT implementation, should I build a stubbed/mock user context that we inject (e.g. hardcoding the "Analyst" role), or do you want me to implement a basic mock JWT flow?
- Do you want to use a specific Redis-based queue library in Python (like `Celery` or `RQ`), or a lightweight AsyncIO background task + Redis pub-sub for this stub implementation?

---

## Proposed Changes

### 1. Global Refactoring & Rebranding
Search and replace "SentinelX" with "TraceIQ" across the entire repository.
#### [MODIFY] README.md
#### [MODIFY] package.json
#### [MODIFY] backend/main.py
#### [MODIFY] frontend/src/app/layout.tsx
#### [MODIFY] frontend/src/app/page.tsx

***

### 2. Frontend: App Shell & Routing
Extract the layout shell from the dashboard to share it across multiple views.
#### [MODIFY] frontend/src/app/layout.tsx
- Move the `header` (Top Navigation) and `aside` (Sidebar) into this root layout.
- Update the sidebar to include a new navigation item for "PCAP Manager".
#### [MODIFY] frontend/src/app/page.tsx
- Remove the duplicated layout shell components.

***

### 3. Frontend: PCAP Manager Module
Create the new frontend UI module inside `frontend/src/app/pcap`.
#### [NEW] frontend/src/app/pcap/page.tsx
- Main page container combining all PCAP manager widgets.
#### [NEW] frontend/src/components/pcap/UploadZone.tsx
- Drag-and-drop component, `.pcap/.pcapng` validation, chunk/progress state handling.
#### [NEW] frontend/src/components/pcap/UploadStats.tsx
- KPI widgets matching the style of the SOC Dashboard.
#### [NEW] frontend/src/components/pcap/ProcessingQueue.tsx
- Live table connecting to WebSockets to display in-flight job states.
#### [NEW] frontend/src/components/pcap/UploadsTable.tsx
- Recent uploads and full history table with sorting and filtering.
#### [NEW] frontend/src/components/pcap/FileDetails.tsx
- Drill-down drawer/modal showing comprehensive metadata and audit logs for a single capture.
#### [NEW] frontend/src/lib/usePcapWebSocket.ts
- Custom React hook for connecting to the WebSocket topic and buffering/syncing job state.

***

### 4. Backend: Database Setup (PostgreSQL)
Set up SQLAlchemy ORM and Alembic migrations.
#### [MODIFY] backend/requirements.txt
- Add `sqlalchemy`, `alembic`, `psycopg2-binary`, `redis`, `python-multipart`.
#### [NEW] backend/database/connection.py
- Engine, session maker, and Base declarative mapping.
#### [NEW] backend/database/models.py
- Define `Capture`, `ProcessingJob`, `ProcessingJobEvent`, and `AuditLog` models.
#### [NEW] backend/alembic/versions/...
- Migration script for initial schema creation.

***

### 5. Backend: API Routes & Storage
Build the PCAP REST endpoints and abstract the local storage mechanism.
#### [NEW] backend/services/storage.py
- Local disk abstraction for saving PCAP files (e.g. into a `storage/` directory), preventing duplicate storage via SHA-256.
#### [NEW] backend/routers/pcap.py
- `POST /api/pcap/uploads`: File upload and job creation.
- `GET /api/pcap/uploads`, `GET /api/pcap/uploads/{id}`: Fetch data.
- `DELETE /api/pcap/uploads/{id}`: Soft delete + audit.
- `POST /api/pcap/jobs/{id}/cancel` & `POST /api/pcap/jobs/{id}/retry`.
#### [MODIFY] backend/main.py
- Include the new API router.

***

### 6. Backend: WebSockets & Job Queue
Introduce the live processing simulation.
#### [NEW] backend/routers/websocket.py
- `WS /ws/pcap`: Endpoint for clients to listen to pub/sub events.
#### [NEW] backend/services/queue.py
- Redis interface to enqueue jobs and publish updates.
#### [NEW] backend/worker/stub_pipeline.py
- Background async task that simulates pipeline stages (`Validating -> Parsing -> Extracting Sessions -> Detecting Threats -> Generating Evidence -> AI Analysis -> Completed`), writes `ProcessingJobEvent` rows to Postgres, and pushes state over Redis pub/sub.

## Verification Plan

### Automated Tests
- None specified, but basic sanity checks on the API endpoints can be verified via curl/Postman.

### Manual Verification
1. Start PostgreSQL and Redis via Docker Compose.
2. Run backend API, Frontend UI, and verify the UI connects to the WebSocket successfully.
3. Upload a sample `.pcap` file through the Upload Zone.
4. Verify the hash is generated, the file rejects invalid formats, and the progress bar updates live as the background worker steps through the stubbed processing stages.
5. Verify duplicate uploads correctly error out by referencing the existing hash.
