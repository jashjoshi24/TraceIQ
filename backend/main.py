import asyncio
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import random
from datetime import datetime, timedelta

from pcap_auth import get_current_user_id

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("traceiq")

_worker_task: Optional[asyncio.Task] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    # Create any tables that don't exist yet. This is a pragmatic stand-in for a
    # proper Alembic migration (see task.md - "Generate Alembic migration" is
    # still open). Safe to run every time: create_all() is a no-op for tables
    # that already exist.
    try:
        from database.connection import Base, engine
        import database.models  # noqa: F401  (registers models on Base.metadata)

        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created.")
    except Exception:
        logger.exception(
            "Could not create database tables. Is PostgreSQL running and is "
            "DATABASE_URL set correctly? PCAP upload/list endpoints will fail "
            "until this is fixed."
        )

    global _worker_task
    try:
        from worker.stub_pipeline import run_pipeline_worker

        _worker_task = asyncio.create_task(run_pipeline_worker())
        logger.info("PCAP pipeline worker started.")
    except Exception:
        logger.exception("Could not start the PCAP pipeline worker.")

    yield

    # --- Shutdown ---
    if _worker_task:
        _worker_task.cancel()
        try:
            await _worker_task
        except (asyncio.CancelledError, Exception):
            pass


app = FastAPI(title="TraceIQ API Full", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers after initializing app to avoid circular imports.
# NOTE: this used to silently swallow ImportError, which meant a broken DB
# driver or bad import would make /api/pcap/* routes vanish with no error
# anywhere. Fail loudly instead so a misconfigured environment shows up in the
# startup logs instead of as mystery 404s in the UI.
from routers import pcap
from routers import websocket as pcap_websocket

app.include_router(pcap.router)
# Deliberately NOT protected with get_current_user_id: browsers can't attach
# an Authorization header to a WebSocket handshake, so the same header-based
# JWT check used on the REST routes doesn't apply here. It only streams job
# stage/progress updates for jobs whose IDs came from the authenticated REST
# endpoints above - see PROGRESS.md / integration report for follow-up if
# stricter websocket auth (token-in-query-string) is wanted later.
app.include_router(pcap_websocket.router)


# Helpers
def generate_mock_alerts(n=50):
    severities = ["Critical", "High", "Medium", "Low", "Info"]
    statuses = ["Open", "Investigating", "Resolved"]
    names = ["Suspicious PowerShell Execution", "Multiple Failed Logins", "Unusual Data Transfer", "Malware Blocked", "RDP Brute Force", "SQL Injection Attempt", "Excessive DNS Queries"]
    return [{"id": f"ALT-{1000+i}", "severity": random.choice(severities), "name": random.choice(names), "source_ip": f"10.0.{random.randint(1,255)}.{random.randint(1,255)}", "status": random.choice(statuses), "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(1, 1440))).isoformat() + "Z"} for i in range(n)]

def generate_mock_incidents(n=30):
    severities = ["Critical", "High", "Medium"]
    statuses = ["New", "Triage", "Active", "Contained", "Closed"]
    names = ["Ransomware Outbreak", "Compromised Credentials", "Data Exfiltration", "Phishing Campaign", "Unauthorized Access"]
    return [{"id": f"INC-{100+i}", "severity": random.choice(severities), "name": random.choice(names), "assigned_to": random.choice(["Jash Joshi", "Alice Smith", "Bob Jones", "Unassigned"]), "status": random.choice(statuses), "created_at": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).isoformat() + "Z"} for i in range(n)]

def generate_mock_devices(n=40):
    types = ["Workstation", "Server", "Firewall", "Router", "Mobile"]
    statuses = ["Healthy", "Warning", "Critical", "Offline"]
    return [{"id": f"DEV-{100+i}", "name": f"host-{random.randint(100,999)}", "ip_address": f"192.168.1.{random.randint(1,254)}", "type": random.choice(types), "status": random.choice(statuses), "alerts_count": random.randint(0, 15)} for i in range(n)]

def generate_mock_investigations(n=20):
    statuses = ["Open", "Pending Evidence", "Closed"]
    return [{"id": f"INV-{100+i}", "title": f"Investigation of INC-{100+i}", "analyst": random.choice(["Jash Joshi", "Alice Smith"]), "status": random.choice(statuses), "last_updated": (datetime.utcnow() - timedelta(hours=random.randint(1, 48))).isoformat() + "Z"} for i in range(n)]

# Data stores
ALERTS = generate_mock_alerts(120)
INCIDENTS = generate_mock_incidents(60)
DEVICES = generate_mock_devices(80)
INVESTIGATIONS = generate_mock_investigations(25)

def paginate_and_sort(data, page, size, sort_by, order):
    if sort_by and sort_by in data[0]:
        data.sort(key=lambda x: x[sort_by], reverse=(order == "desc"))
    start = (page - 1) * size
    end = start + size
    return {"data": data[start:end], "total": len(data), "page": page, "size": size}

# All SOC dashboard endpoints below require a valid TraceIQ session, just
# like the PCAP Manager routes. `_user` is unused in the handler bodies - the
# Depends() call itself is what rejects unauthenticated requests with a 401.

@app.get("/api/dashboard/overview")
def get_overview(_user: str = Depends(get_current_user_id)):
    return {
        "security": {"risk_score": 82, "trend": "up", "total_assets": 1250, "vulnerable_assets": 45},
        "threat": {"active_threats": 14, "new_detections_24h": 56, "top_category": "Credential Access"},
        "incident": {"open": 24, "in_progress": 8, "mtta_mins": 14, "mttr_hours": 4.5},
        "investigation": {"active": 12, "unassigned": 3, "avg_age_days": 2.1},
        "evidence": {"total_items": 432, "pending_action": 15, "storage_gb": 105.4}
    }

@app.get("/api/dashboard/ai-summary")
def get_ai_summary(_user: str = Depends(get_current_user_id)):
    return {
        "narrative": "Over the last 24 hours, the threat landscape has been dominated by a coordinated credential stuffing attack targeting external-facing VPN gateways. AI correlation has tied 45 separate alerts to a single threat actor profile matching APT29 TTPs. Recommendation: Rotate compromised credentials immediately and enforce geo-blocking on the 104.x.x.x subnet."
    }

@app.get("/api/alerts")
def get_alerts_endpoint(page: int = 1, size: int = 10, sort_by: str = "timestamp", order: str = "desc", severity: Optional[str] = None, _user: str = Depends(get_current_user_id)):
    filtered = ALERTS
    if severity:
        filtered = [a for a in filtered if a["severity"].lower() == severity.lower()]
    return paginate_and_sort(filtered, page, size, sort_by, order)

@app.get("/api/incidents")
def get_incidents_endpoint(page: int = 1, size: int = 10, sort_by: str = "created_at", order: str = "desc", _user: str = Depends(get_current_user_id)):
    return paginate_and_sort(INCIDENTS, page, size, sort_by, order)

@app.get("/api/investigations")
def get_investigations_endpoint(page: int = 1, size: int = 10, sort_by: str = "last_updated", order: str = "desc", _user: str = Depends(get_current_user_id)):
    return paginate_and_sort(INVESTIGATIONS, page, size, sort_by, order)

@app.get("/api/devices")
def get_devices_endpoint(page: int = 1, size: int = 10, sort_by: str = "alerts_count", order: str = "desc", _user: str = Depends(get_current_user_id)):
    return paginate_and_sort(DEVICES, page, size, sort_by, order)

@app.get("/api/charts/threat-trends")
def get_threat_trends(_user: str = Depends(get_current_user_id)):
    return [{"time": f"{i:02d}:00", "Critical": random.randint(0,5), "High": random.randint(2,10), "Medium": random.randint(5,20)} for i in range(24)]

@app.get("/api/charts/alert-distribution")
def get_alert_dist(_user: str = Depends(get_current_user_id)):
    return [{"name": "Malware", "value": 35}, {"name": "Intrusion", "value": 25}, {"name": "Anomaly", "value": 20}, {"name": "Policy", "value": 20}]

@app.get("/api/charts/severity-distribution")
def get_severity_dist(_user: str = Depends(get_current_user_id)):
    return [{"name": "Critical", "value": len([a for a in ALERTS if a['severity']=='Critical'])},
            {"name": "High", "value": len([a for a in ALERTS if a['severity']=='High'])},
            {"name": "Medium", "value": len([a for a in ALERTS if a['severity']=='Medium'])},
            {"name": "Low", "value": len([a for a in ALERTS if a['severity']=='Low'])}]

@app.get("/api/system/health")
def get_system_health(_user: str = Depends(get_current_user_id)):
    return [
        {"service": "Threat Engine", "status": "Healthy", "uptime": "99.9%", "latency": "45ms"},
        {"service": "Log Ingestion", "status": "Warning", "uptime": "99.5%", "latency": "120ms"},
        {"service": "AI Correlator", "status": "Healthy", "uptime": "100%", "latency": "200ms"},
        {"service": "PostgreSQL", "status": "Healthy", "uptime": "99.9%", "latency": "5ms"},
        {"service": "Redis Queue", "status": "Healthy", "uptime": "100%", "latency": "1ms"}
    ]

@app.get("/api/network/health")
def get_network_health(_user: str = Depends(get_current_user_id)):
    return {"packet_volume": "14.5 TB", "error_rate": "0.02%", "throughput": "4.5 Gbps", "trend": "stable"}

@app.get("/api/threat-intel")
def get_threat_intel(_user: str = Depends(get_current_user_id)):
    return [
        {"ioc": "104.21.34.12", "type": "IP", "actor": "APT29", "severity": "Critical", "source": "CrowdStrike"},
        {"ioc": "winword.exe_payload", "type": "File Hash", "actor": "Unknown", "severity": "High", "source": "AlienVault"},
        {"ioc": "login-microsoft-secure.com", "type": "Domain", "actor": "Scattered Spider", "severity": "Critical", "source": "Internal"}
    ]

@app.get("/api/mitre-coverage")
def get_mitre_coverage(_user: str = Depends(get_current_user_id)):
    return [
        {"tactic": "Initial Access", "score": 85},
        {"tactic": "Execution", "score": 92},
        {"tactic": "Persistence", "score": 78},
        {"tactic": "Privilege Escalation", "score": 65},
        {"tactic": "Defense Evasion", "score": 70},
        {"tactic": "Credential Access", "score": 95},
        {"tactic": "Lateral Movement", "score": 88},
        {"tactic": "Exfiltration", "score": 60}
    ]
