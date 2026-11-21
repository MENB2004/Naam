# NAAM (നാം) — Comprehensive User Manual

**NAAM (നാം)** is a Malayalam-first community environmental communication and governance platform connecting citizens with the Local Self-Government Department (LSGD), Kerala State Pollution Control Board (KSPCB), Suchitwa Mission, and the Irrigation Department.

---

## 1. Community Portal (Citizen)
**Route:** `/community` or `/login/community`

### Key Capabilities:
1. **Grievance Submission Wizard (`/community/report`):**
   - **Step 1 (Category):** Choose between Waste Dumping, Water Pollution, Drainage Clogging, Flooding, Air Pollution, Deforestation, or Illegal Mining.
   - **Step 2 (Location):** Pinpoint exact location on the Kerala-bounded interactive map (GPS coordinates captured automatically).
   - **Step 3 (Evidence):** Add description, upload up to 5 field photographs, and optionally record a voice note in Malayalam.
   - **Step 4 (Submit):** Review details and submit to obtain a unique tracking code formatted as **`NAAM-YYYY-XXXXX`**.
2. **My Reports (`/community/my-reports`):**
   - Track live lifecycle status across all submitted complaints.
3. **Public Complaint Tracker (`/track`):**
   - Publicly track any complaint using its tracking code without requiring login.

---

## 2. Department Authority Portal
**Route:** `/authority` or `/login/authority`

### Key Capabilities:
1. **Triage Queue:**
   - Real-time review of incoming community grievances filtered by district and category.
   - Transition valid reports to `VERIFIED`.
2. **Officer Assignment Modal:**
   - Delegate verified grievances to designated field officers with specific inspection instructions and target completion deadlines.
3. **Emergency Alert Broadcast:**
   - Issue public warning tickers to citizens across selected districts during environmental hazards.

---

## 3. Field Officer Portal (Mobile Desk)
**Route:** `/officer` or `/login/officer`

### Key Capabilities:
1. **Assigned Task Queue:**
   - Review prioritized field assignments with severity indicators and SLA countdowns.
2. **Turn-by-Turn GPS Navigation:**
   - 1-Click Google Maps turn-by-turn routing directly to the citizen's reported coordinates.
3. **Photographic Resolution Proof Modal:**
   - Upload mandatory photographic evidence proving site remediation, append inspector notes, and transition complaint to `RESOLVED`.

---

## 4. Super Admin Console
**Route:** `/admin` or `/login/admin`

### Key Capabilities:
1. **System Telemetry:**
   - Live KPI cards tracking platform users, total reports, resolution rate %, active alerts, and audit logs.
2. **User Governance:**
   - Manage user profiles, reassign RBAC roles, and toggle account activation.
3. **Department Master Management:**
   - Configure participating government bodies (LSGD, KSPCB, Suchitwa Mission, Irrigation).
4. **Security Audit Log Viewer:**
   - Immutable audit trail capturing user actions, IP addresses, timestamps, and JSON metadata.

---

## 5. Environmental Analytics & Intelligence
**Route:** `/analytics`
- Kerala 14-district performance comparisons and SLA compliance rates.
- Recharts category distribution donut chart and daily intake vs. resolution trend graphs.
- 1-Click live CSV export with UTF-8 BOM encoding for Microsoft Excel and spreadsheet analysis.
