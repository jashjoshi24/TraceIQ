# SentinelX — SOC Dashboard

This is the first implementation pass of the SentinelX SOC Dashboard module.

## How to Run the Preview

Because of system permission limits in my environment, I generated the codebase files manually. You will need to run the standard installation commands in your own terminal to start the preview.

### 1. Start the Backend (FastAPI)
Open a new terminal window in your IDE and run:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The backend API will run at http://localhost:8000. It serves mock data for the dashboard.*

### 2. Start the Frontend (Next.js)
Open a second terminal window and run:
```bash
cd frontend
npm install
npm run dev
```
*The Next.js dashboard will run at http://localhost:3000.*

### 3. Start Infrastructure (Optional for Preview)
If you have Docker installed and want to run the Postgres and Redis instances:
```bash
docker-compose up -d
```
*(The current mock backend does not strictly require the DB to show the preview UI, but the infra is ready).*

---

### What's Included in this Preview
- **Enterprise Dark Theme:** Custom CSS variables for standard SOC severity colors.
- **Data Integration:** The Next.js frontend fetches real data from the FastAPI backend using standard `fetch` calls.
- **Widgets:**
  - KPI Strip (Risk Score, Alerts, Incidents)
  - Recent Alerts Table (Styled to be dense and readable)
  - AI Threat Summary (Simulated generative text analysis)
- **Layout:** Top nav bar, collapsible sidebar placeholder, and main widget grid area.

Enjoy the preview! Let me know if you want me to expand on specific charts or tables next.
