# TraceIQ — Identity Access Management (IAM) & Role-Based Access Control (RBAC) System

TraceIQ is a production-grade, enterprise security operations identity foundation built with **FastAPI**, **Async SQLAlchemy**, **Alembic**, **Pydantic v2**, **React + TypeScript**, **Zustand**, and **Vanilla CSS**.

---

## 🚀 Quick Start (Single Sequence to Run Locally)

### 1. Backend Server (FastAPI on Port 8001)
From the project root directory:
```powershell
# Activate Python Virtual Environment & Start Server
.\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload --app-dir backend
```

### 2. Frontend Application (Vite React on Port 5173)
In a second terminal window from the project root:
```powershell
# Start Vite Development Server
npm run dev
```

Open your browser at **`http://localhost:5173`** to access TraceIQ!

---

## 🔑 Initial Admin Seed Credentials

An initial Super Admin account is pre-seeded in the database:
- **Username**: `admin`
- **Password**: `adminpassword`
- **Assigned Role**: `Admin` (Holds all permissions)

---

## 🛠️ Database Setup, Migrations & Seeding

If you need to reset or re-seed the database:

```powershell
# 1. Apply Alembic Migrations
.\venv\Scripts\alembic upgrade head

# 2. Seed Default Roles, Permissions, and Admin User
.\venv\Scripts\python backend/app/db/seed.py
```

### Seeded Roles & Permissions Matrix
- **Admin**: `view_dashboard`, `upload_pcap`, `view_cases`, `manage_users`, `view_reports`
- **SOC Analyst**: `view_dashboard`, `upload_pcap`, `view_cases`
- **Investigator**: `view_dashboard`, `view_cases`
- **Manager**: `view_dashboard`, `view_cases`, `view_reports`

---

## 🌐 Environment Variables (`.env`)

```env
# Database Connection (Async)
DATABASE_URL=sqlite+aiosqlite:///./traceiq.db

# Security & JWT Configuration
JWT_SECRET_KEY=94c8b0fb6029f636cc6b7a2d8d85fef109594f86d84a7e3d1c9ef26759c25603
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Backend Server Config
PORT=8001
```

---

## 🧪 Automated API Test Suite

You can test all 10 authentication and RBAC endpoints anytime using our zero-dependency verification script:

```powershell
.\venv\Scripts\python scripts/test_apis.py
```

---

## 📡 API Surface Summary

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | User Registration | Public |
| `POST` | `/auth/login` | Login & Issue Access/HttpOnly Refresh Tokens | Public |
| `POST` | `/auth/refresh` | Silent Refresh Token Rotation | HttpOnly Cookie |
| `POST` | `/auth/logout` | Revoke Refresh Token & Clear Cookie | Auth |
| `GET` | `/auth/me` | Current Authenticated User Details | Auth (`get_current_user`) |
| `GET` | `/users/profile` | Own Profile Details | Auth |
| `PUT` | `/users/profile` | Update Own Profile | Auth |
| `PUT` | `/users/change-password` | Verified Password Update | Auth |
| `GET` | `/users` | Paginated User Directory & Search | Admin / `manage_users` |
| `GET` | `/users/{id}` | Get Single User Details | Admin |
| `PUT` | `/users/{id}` | Update User / Toggle Active Status | Admin |
| `DELETE`| `/users/{id}` | Soft Delete / Deactivate User | Admin |
| `GET` | `/roles` | List System Roles & Permissions | Admin |
| `POST` | `/roles` | Create New System Role | Admin |
| `PUT` | `/roles/{id}` | Update Role & Permission Binding | Admin |
| `DELETE`| `/roles/{id}` | Delete System Role | Admin |
| `GET` | `/permissions` | List System Permissions | Admin |
| `POST` | `/permissions` | Create System Permission | Admin |
| `POST` | `/users/{id}/roles` | Assign Roles to User | Admin |
