import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Allow `python scripts/seed_sample_complaints.py` from the backend directory.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.models import Complaint, ComplaintAssignment, ComplaintUpdate, Department, Evidence, Location, User

SAMPLE_COMPLAINTS = [
    {
        "tracking_code": "NAAM-2026-10001",
        "title": "കനോലി കനാലിന് സമീപം പ്ലാസ്റ്റിക് മാലിന്യം തള്ളൽ (Plastic Dumping near Connolly Canal)",
        "description": "കോഴിക്കോട് കനോലി കനാലിൻ്റെ തീരത്ത് വ്യാപകമായി പ്ലാസ്റ്റിക് കവറുകളും കുപ്പികളും അടിഞ്ഞുകൂടിയിരിക്കുന്നു. ഇത് കനാലിലെ സ്വാഭാവിക നീരൊഴുക്ക് തടസ്സപ്പെടുത്തുന്നു.",
        "category": "WASTE",
        "severity": "HIGH",
        "current_status": "RESOLVED",
        "dept_code": "SUCHITWA",
        "district": "Kozhikode",
        "lsgd_type": "CORPORATION",
        "lsgd_name": "Kozhikode Corporation",
        "ward_number": "24",
        "landmark": "Near Connolly Canal Bridge, Eranhipalam",
        "lat": 11.2721,
        "lon": 75.7892,
        "evidence": [
            {"file_url": "/sample-data/field_photos/kozhikode_connolly_canal_before.jpg", "type": "CITIZEN_SUBMISSION"},
            {"file_url": "/sample-data/field_photos/kozhikode_connolly_canal_after.jpg", "type": "OFFICER_RESOLUTION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "പരാതി പരിശോധിക്കുകയും മാലിന്യത്തിന്റെ തീവ്രത സ്ഥിരീകരിക്കുകയും ചെയ്തു."),
            ("VERIFIED", "ASSIGNED", "കോഴിക്കോട് ശുചിത്വ സ്ക്വാഡിന് ക്ലീനിംഗ് ചുമതല കൈമാറി."),
            ("ASSIGNED", "IN_PROGRESS", "ഹരിതകർമ്മസേന മാലിന്യം നീക്കം ചെയ്യുന്ന പ്രവൃത്തി ആരംഭിച്ചു."),
            ("IN_PROGRESS", "RESOLVED", "കനാൽ തീരത്തെ മാലിന്യങ്ങൾ പൂർണ്ണമായി നീക്കം ചെയ്തു, ജാഗ്രതാ ബോർഡുകൾ സ്ഥാപിച്ചു."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10002",
        "title": "പെരിയാർ നദിയിലേക്ക് വ്യാവസായിക മലിനജലം ഒഴുക്കൽ (Chemical Effluent in Periyar River)",
        "description": "ആലുവ ഏലൂർ വ്യാവസായിക മേഖലയ്ക്ക് സമീപം പെരിയാർ നദിയിലേക്ക് രാസമാലിന്യങ്ങൾ ഒഴുക്കിവിടുന്നത് കണ്ടെത്തി. മത്സ്യങ്ങൾ ചത്തുപൊങ്ങുന്നു.",
        "category": "WATER_POLLUTION",
        "severity": "CRITICAL",
        "current_status": "IN_PROGRESS",
        "dept_code": "KSPCB",
        "district": "Ernakulam",
        "lsgd_type": "MUNICIPALITY",
        "lsgd_name": "Eloor Municipality",
        "ward_number": "08",
        "landmark": "Near Eloor Industrial Estate Outfall",
        "lat": 10.0765,
        "lon": 76.2984,
        "evidence": [
            {"file_url": "/sample-data/field_photos/periyar_river_effluent.jpg", "type": "CITIZEN_SUBMISSION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "മലിനീകരണ നിയന്ത്രണ ബോർഡ് ഉദ്യോഗസ്ഥർ വെള്ളത്തിന്റെ സാമ്പിളുകൾ ശേഖരിച്ചു."),
            ("VERIFIED", "ASSIGNED", "ഫീൽഡ് എൻവയോൺമെന്റൽ എൻജിനീയറെ പരിശോധനയ്ക്കായി ചുമതലപ്പെടുത്തി."),
            ("ASSIGNED", "IN_PROGRESS", "രാസപരിശോധനാ റിപ്പോർട്ട് തയ്യാറാക്കുന്നു, കാരണം കാണിക്കൽ നോട്ടീസ് അയച്ചു."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10003",
        "title": "പാലക്കാട് മുനിസിപ്പൽ മാർക്കറ്റിലെ ഡ്രെയിനേജ് തടസ്സം (Silted Storm Drain Clogging)",
        "description": "പാലക്കാട് വലിയങ്ങാടി മാർക്കറ്റിലെ മഴവെള്ള ഡ്രെയിനേജ് ചെളിയും അവശിഷ്ടങ്ങളും നിറഞ്ഞ് അടഞ്ഞിരിക്കുന്നു. റോഡിലേക്ക് ദുർഗന്ധം വമിക്കുന്ന മലിനജലം ഒഴുകുന്നു.",
        "category": "DRAINAGE",
        "severity": "MEDIUM",
        "current_status": "SUBMITTED",
        "dept_code": "LSGD",
        "district": "Palakkad",
        "lsgd_type": "MUNICIPALITY",
        "lsgd_name": "Palakkad Municipality",
        "ward_number": "15",
        "landmark": "Near Valiyangadi Vegetable Market",
        "lat": 10.7745,
        "lon": 76.6543,
        "evidence": [
            {"file_url": "/sample-data/field_photos/palakkad_drain_clog.jpg", "type": "CITIZEN_SUBMISSION"},
        ],
        "timeline": [
            ("SUBMITTED", "SUBMITTED", "പരാതി സിസ്റ്റത്തിൽ സമർപ്പിച്ചു, തദ്ദേശ ഭരണകൂടത്തിന്റെ അനുമതി കാക്കുന്നു."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10004",
        "title": "മറൈൻ ഡ്രൈവ് വാക്ക് വേയിൽ ഖരമാലിന്യ നിക്ഷേപം (Marine Drive Walkway Waste)",
        "description": "കൊച്ചി മറൈൻ ഡ്രൈവ് വാക്ക് വേയിൽ പ്ലാസ്റ്റിക് ഭക്ഷ്യ പാക്കേജിംഗ് മാലിന്യങ്ങൾ വലിച്ചെറിഞ്ഞിരിക്കുന്നു.",
        "category": "WASTE",
        "severity": "MEDIUM",
        "current_status": "ACTION_TAKEN",
        "dept_code": "SUCHITWA",
        "district": "Ernakulam",
        "lsgd_type": "CORPORATION",
        "lsgd_name": "Kochi Corporation",
        "ward_number": "62",
        "landmark": "Near Rainbow Bridge, Marine Drive",
        "lat": 9.9785,
        "lon": 76.2764,
        "evidence": [
            {"file_url": "/sample-data/field_photos/marine_drive_waste.jpg", "type": "CITIZEN_SUBMISSION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "ഹെൽത്ത് ഇൻസ്പെക്ടർ പരിശോധന നടത്തി."),
            ("VERIFIED", "ACTION_TAKEN", "താൽക്കാലിക ശുചീകരണം നടത്തി, സ്ഥിരം വേസ്റ്റ് ബിന്നുകൾ ആവശ്യപ്പെട്ടു."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10005",
        "title": "പാർവ്വതി പുത്തനാർ കനാലിൽ പോളയും മലിനജലവും (Parvathi Puthanar Canal Weed Accumulation)",
        "description": "തിരുവനന്തപുരം പാർവ്വതി പുത്തനാർ കനാലിൽ ആഫ്രിക്കൻ പായലും മലിനജലവും നിറഞ്ഞ് കൊതുകുശല്യം രൂക്ഷമായിരിക്കുന്നു.",
        "category": "WATER_POLLUTION",
        "severity": "HIGH",
        "current_status": "ASSIGNED",
        "dept_code": "IRRIGATION",
        "district": "Thiruvananthapuram",
        "lsgd_type": "CORPORATION",
        "lsgd_name": "Trivandrum Corporation",
        "ward_number": "78",
        "landmark": "Near Vallakkadavu Boat House",
        "lat": 8.4823,
        "lon": 76.9245,
        "evidence": [
            {"file_url": "/sample-data/field_photos/trivandrum_canal_weed.jpg", "type": "CITIZEN_SUBMISSION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "ജലസേചന വകുപ്പ് ഉദ്യോഗസ്ഥർ സ്ഥിതിഗതികൾ വിലയിരുത്തി."),
            ("VERIFIED", "ASSIGNED", "മെക്കാനിക്കൽ വീഡ് ഹാർവെസ്റ്റർ വിന്യസിക്കാൻ കരാറുകാരനെ ചുമതലപ്പെടുത്തി."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10006",
        "title": "കുട്ടനാട് കൈനകരിയിൽ കനാൽ ബണ്ട് തകർന്ന് വെള്ളപ്പൊക്കം (Kuttanad Canal Bund Breach)",
        "description": "തുടർച്ചയായ മഴയിൽ തോടിന്റെ ബണ്ട് തകർന്ന് പാടശേഖരങ്ങളിലേക്കും വീടുകളിലേക്കും വെള്ളം കയറുന്നു.",
        "category": "FLOODING",
        "severity": "CRITICAL",
        "current_status": "VERIFIED",
        "dept_code": "IRRIGATION",
        "district": "Alappuzha",
        "lsgd_type": "GRAMA_PANCHAYAT",
        "lsgd_name": "Kainakary Grama Panchayat",
        "ward_number": "04",
        "landmark": "Near Kainakary Puncha Bund",
        "lat": 9.5124,
        "lon": 76.3842,
        "evidence": [
            {"file_url": "/sample-data/field_photos/kuttanad_bund_breach.jpg", "type": "CITIZEN_SUBMISSION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "അടിയന്തര മണൽചാക്കുകൾ സ്ഥാപിക്കാൻ ദുരന്തനിവാരണ വിഭാഗം നിർദ്ദേശം നൽകി."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10007",
        "title": "വൈത്തിരിയിൽ അനധികൃത മലയിടിക്കലും മണ്ണെടുപ്പും (Illegal Hill Cutting in Vythiri)",
        "description": "പരിസ്ഥിതിലോല പ്രദേശമായ വൈത്തിരിയിൽ കനത്ത മഴയ്ക്കിടെ മണ്ണിടിച്ചിൽ സാധ്യത അവഗണിച്ച് മലയിടിക്കുന്നു.",
        "category": "DEFORESTATION",
        "severity": "CRITICAL",
        "current_status": "IN_PROGRESS",
        "dept_code": "LSGD",
        "district": "Wayanad",
        "lsgd_type": "GRAMA_PANCHAYAT",
        "lsgd_name": "Vythiri Grama Panchayat",
        "ward_number": "09",
        "landmark": "Near Vythiri Ghat Road Cut",
        "lat": 11.5389,
        "lon": 76.0378,
        "evidence": [
            {"file_url": "/sample-data/field_photos/wayanad_hill_cutting.jpg", "type": "CITIZEN_SUBMISSION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "വില്ലേജ് ഓഫീസറും പഞ്ചായത്ത് സെക്രട്ടറിയും പരിശോധന നടത്തി സ്റ്റോപ്പ് മെമ്മോ നൽകി."),
            ("VERIFIED", "IN_PROGRESS", "തുടർനടപടികൾക്കായി ജിയോളജി വകുപ്പിന് റിപ്പോർട്ട് കൈമാറി."),
        ],
    },
    {
        "tracking_code": "NAAM-2026-10008",
        "title": "ശക്തൻ മാർക്കറ്റിൽ ജൈവമാലിന്യ കൂമ്പാരം (Shakthan Market Organic Waste Pile)",
        "description": "തൃശ്ശൂർ ശക്തൻ മാർക്കറ്റിൽ പച്ചക്കറി അവശിഷ്ടങ്ങൾ കൃത്യസമയത്ത് നീക്കം ചെയ്യാത്തതിനാൽ ദുർഗന്ധം പരക്കുന്നു.",
        "category": "WASTE",
        "severity": "HIGH",
        "current_status": "RESOLVED",
        "dept_code": "SUCHITWA",
        "district": "Thrissur",
        "lsgd_type": "CORPORATION",
        "lsgd_name": "Thrissur Corporation",
        "ward_number": "31",
        "landmark": "Near Shakthan Thampuran Bus Stand",
        "lat": 10.5184,
        "lon": 76.2167,
        "evidence": [
            {"file_url": "/sample-data/field_photos/thrissur_shakthan_before.jpg", "type": "CITIZEN_SUBMISSION"},
            {"file_url": "/sample-data/field_photos/thrissur_shakthan_after.jpg", "type": "OFFICER_RESOLUTION"},
        ],
        "timeline": [
            ("SUBMITTED", "VERIFIED", "കോർപ്പറേഷൻ ഹെൽത്ത് വിങ് നേരിൽ കണ്ട് പരിശോധിച്ചു."),
            ("VERIFIED", "ASSIGNED", "വിൻഡ്രോ കമ്പോസ്റ്റിംഗ് യൂണിറ്റിലേക്ക് മാലിന്യം കൊണ്ടുപോകാൻ വാഹനം ക്രമീകരിച്ചു."),
            ("ASSIGNED", "RESOLVED", "മാലിന്യം പൂർണ്ണമായി നീക്കം ചെയ്തു, സ്ഥലം ബ്ലീച്ചിംഗ് പൗഡർ വിതറി അണുവിമുക്തമാക്കി."),
        ],
    },
]


def seed_sample_complaints():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print(f"Connecting to database: {settings.DATABASE_URL.split('@')[-1]}")
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        # Get demo reporter
        reporter = db.scalars(select(User).where(User.email == "anjali.nair@example.com")).first()
        if not reporter:
            print("Demo reporter anjali.nair@example.com not found. Please run seed_demo_users.py first.")
            return

        # Get officer for assignment
        officer = db.scalars(select(User).where(User.email == "field.kochi@kerala.gov.in")).first()
        authority = db.scalars(select(User).where(User.email == "officer.lsgd@kerala.gov.in")).first()

        departments = {d.code: d for d in db.scalars(select(Department)).all()}

        seeded_count = 0
        for item in SAMPLE_COMPLAINTS:
            # Check if exists
            existing = db.scalars(select(Complaint).where(Complaint.tracking_code == item["tracking_code"])).first()
            if existing:
                print(f"  * Complaint already exists: {item['tracking_code']}")
                continue

            dept = departments.get(item["dept_code"])
            dept_id = dept.id if dept else None

            # Create Location
            loc_id = uuid.uuid4()
            location = Location(
                id=loc_id,
                latitude=item["lat"],
                longitude=item["lon"],
                geom=ST_SetSRID(ST_MakePoint(item["lon"], item["lat"]), 4326) if "sqlite" not in settings.DATABASE_URL else None,
                district=item["district"],
                lsgd_type=item["lsgd_type"],
                lsgd_name=item["lsgd_name"],
                ward_number=item["ward_number"],
                landmark=item["landmark"],
            )
            db.add(location)
            db.flush()

            # Create Complaint
            comp_id = uuid.uuid4()
            complaint = Complaint(
                id=comp_id,
                tracking_code=item["tracking_code"],
                title=item["title"],
                description=item["description"],
                category=item["category"],
                severity=item["severity"],
                current_status=item["current_status"],
                reporter_id=reporter.id,
                department_id=dept_id,
                location_id=loc_id,
                is_public=True,
            )
            db.add(complaint)
            db.flush()

            # Add Evidence
            for ev in item.get("evidence", []):
                evidence = Evidence(
                    id=uuid.uuid4(),
                    complaint_id=comp_id,
                    uploaded_by=reporter.id if ev["type"] == "CITIZEN_SUBMISSION" else (officer.id if officer else reporter.id),
                    file_url=ev["file_url"],
                    file_type="image/jpeg",
                    file_size_bytes=245760,
                    evidence_type=ev["type"],
                )
                db.add(evidence)

            # Add Timeline Updates
            for prev_s, new_s, rem in item.get("timeline", []):
                update = ComplaintUpdate(
                    id=uuid.uuid4(),
                    complaint_id=comp_id,
                    changed_by=authority.id if authority else reporter.id,
                    previous_status=prev_s,
                    new_status=new_s,
                    remarks=rem,
                )
                db.add(update)

            # Add Assignment if in progress/assigned
            if item["current_status"] in ["ASSIGNED", "IN_PROGRESS", "ACTION_TAKEN", "RESOLVED"] and officer:
                assignment = ComplaintAssignment(
                    id=uuid.uuid4(),
                    complaint_id=comp_id,
                    assigned_to=officer.id,
                    assigned_by=authority.id if authority else officer.id,
                    instructions="ഫീൽഡ് പരിശോധന നടത്തി റിപ്പോർട്ട് നൽകുക.",
                    status="RESOLVED" if item["current_status"] == "RESOLVED" else "ACTIVE",
                )
                db.add(assignment)

            seeded_count += 1
            print(f"  + Seeded complaint: {item['tracking_code']} ({item['current_status']}) - {item['district']}")

        db.commit()
        print(f"\n✅ Seeded {seeded_count} sample Kerala complaints into Neon database.")


if __name__ == "__main__":
    seed_sample_complaints()
