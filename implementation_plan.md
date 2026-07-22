# Implementation Plan: Full SentinelX SOC Dashboard

This plan covers implementing the *complete* set of widgets, tables, charts, and backend APIs requested in your original prompt. Since the scope is large, we will break the Next.js `page.tsx` monolith into a modular widget-based architecture and expand the FastAPI backend to serve robust mock data for all required endpoints.

## User Review Required

Because of the scale of this update, I will need to generate a significant amount of code across multiple files in the frontend and backend. 

- **Frontend Architecture:** I will use the feature-sliced directory structure you seem to have started (`frontend/src/features/dashboard/widgets/...`, `components/...`).
- **Data Tables:** I will use `@tanstack/react-table` to build a reusable, paginated, sortable, and filterable data table component. We will use this for Alerts, Incidents, Investigations, and Devices.
- **Charts:** I will use `recharts` for Threat Trends, Alert Distributions, etc.
- **Backend Mock Data:** I will heavily expand `backend/main.py` to provide rich mock data for *all* the new dashboard widgets and implement query parameter parsing for the data tables (sorting, pagination).

## Proposed Changes

### 1. Backend Expansion (FastAPI)
- **`backend/main.py`**:
  - Add comprehensive mock data generators for Alerts, Incidents, Investigations, and Devices (100+ items each).
  - Implement `/api/alerts`, `/api/incidents`, `/api/investigations`, `/api/devices` with full pagination (`page`, `size`), sorting (`sort_by`, `order`), and filtering (`severity`, `status`) logic using Python list comprehensions.
  - Add endpoints for charts: `/api/charts/threat-trends`, `/api/charts/alert-distribution`, `/api/charts/incident-trends`, etc.
  - Add endpoints for specialized widgets: `/api/threat-intel`, `/api/mitre-coverage`, `/api/system/health`.

### 2. Frontend Infrastructure
- **`frontend/src/components/ui/`**: Implement generic UI components like `Card`, `Badge`, `Button`, `Input`, `Select` (using tailwind).
- **`frontend/src/components/DataTable.tsx`**: A reusable wrapper around `@tanstack/react-table` supporting server-side pagination and sorting.
- **`frontend/src/lib/api.ts`**: API client helper for fetching from `http://localhost:8000`.

### 3. Frontend Dashboard Layout & Widgets
- **`frontend/src/app/page.tsx`**: Refactor into a CSS Grid layout importing individual widget components.
- **KPI Widgets**: Create separate components for Security, Threat, Incident, Investigation, and Evidence Overviews.
- **Chart Widgets**: Implement `ThreatTrendsChart`, `AlertDistributionChart`, etc.
- **Table Widgets**: Implement `RecentAlertsWidget`, `IncidentsWidget`, `DevicesWidget`.
- **Specialty Widgets**: Implement `LiveActivityFeed` (using polling/intervals to simulate WebSocket for now), `MitreCoverageMap`, `SystemHealthGrid`.

## Verification Plan

1. **Verify Backend**: Test the expanded FastAPI endpoints using `curl` or browser to ensure pagination and sorting work.
2. **Verify Frontend Widgets**: Ensure the Next.js app compiles successfully.
3. **Verify Data Tables**: Click column headers to sort, change pages, and verify the mock backend responds correctly.
4. **Verify Charts**: Ensure recharts renders cleanly with the dark theme colors.

---
**Please review and approve this plan by saying "Proceed" and I will begin the massive code generation phase!**
