# 19. NAAM (നാം) — Sample Data and Demonstration Credentials

## 1. Official Demonstration Accounts
To evaluate the platform across all four role-based access portals, use the following pre-configured demonstration accounts:

| Role | Portal Route | Email / Identifier | Password | Description |
|---|---|---|---|---|
| **Citizen (പൗരൻ)** | `/login/community` | `anjali.nair@example.com` *(or `+919876543210`)* | `StrongPassword123!` | Submits grievances, uploads photos, tracks progress |
| **Authority (അധികാരി)** | `/login/authority` | `officer.lsgd@kerala.gov.in` | `AuthorityPass2026!` | Reviews triage queue, assigns tasks, broadcasts alerts |
| **Field Officer (ഫീൽഡ് ഓഫീസർ)** | `/login/officer` | `field.kochi@kerala.gov.in` | `OfficerPass2026!` | Inspects sites, uses GPS routing, submits resolution proof |
| **Super Admin (സിസ്റ്റം അഡ്മിൻ)** | `/login/admin` | `admin@naam.kerala.gov.in` | `AdminPass2026!` | Telemetry KPIs, role management, department config, audit logs |

---

## 2. Sample Demonstration Workflows & Tracking Codes

### Live Public Tracking Codes
* **`NAAM-2026-10001`**: Plastic Dumping near Connolly Canal, Kozhikode (`RESOLVED` with before/after evidence photos).
* **`NAAM-2026-10002`**: Chemical Effluent in Periyar River, Aluva, Ernakulam (`IN_PROGRESS` - inspection assigned).
* **`NAAM-2026-10003`**: Silted Storm Drain Clogging, Palakkad Municipal Market (`SUBMITTED` - awaiting triage).

---

## 3. Curated Sample Field Photos & Kerala Coordinates
All demonstration records utilize authentic geographical coordinates within Kerala's administrative boundaries (`Lat 8.0°–13.0° N`, `Lon 74.5°–77.8° E`):

| District | LSGD Name | Coordinates | Category | Sample Issue |
|---|---|---|---|---|
| **Ernakulam** | Kochi Corporation | `9.9312° N, 76.2673° E` | `SOLID_WASTE` | Packaging waste pile in Marine Drive walkway |
| **Thiruvananthapuram** | Trivandrum Corporation | `8.5241° N, 76.9366° E` | `WATER_POLLUTION` | Parvathi Puthanar canal weed and sewage accumulation |
| **Kozhikode** | Kozhikode Corporation | `11.2588° N, 75.7804° E` | `DRAINAGE` | Blocked culvert causing monsoon street waterlogging |
| **Alappuzha** | Alappuzha Municipality | `9.4981° N, 76.3388° E` | `FLOODING` | Low-lying canal bund breach near Kuttanad border |
| **Wayanad** | Vythiri Grama Panchayat | `11.5524° N, 76.0435° E` | `DEFORESTATION` | Illegal slope cutting and soil dumping |
| **Thrissur** | Thrissur Corporation | `10.5276° N, 76.2144° E` | `SOLID_WASTE` | Shakthan Thampuran vegetable market organic waste |

---

## 4. Seeding Demo Data
To seed these demonstration accounts and baseline departments into a fresh development database:

```powershell
cd backend
.\.venv\Scripts\python.exe scripts/seed_demo_users.py
```
