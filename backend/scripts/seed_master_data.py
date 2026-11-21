import uuid
from sqlalchemy import select
from app.core.database import SessionLocal, engine, Base
from app.models.auth import Role
from app.models.department import Department

INITIAL_ROLES = [
    {
        "name": "COMMUNITY",
        "display_name_ml": "പൗരൻ / സമൂഹം",
        "display_name_en": "Community / Citizen",
        "description": "General citizens reporting and tracking local environmental issues."
    },
    {
        "name": "AUTHORITY",
        "display_name_ml": "തദ്ദേശ / വകുപ്പ് അധികാരി",
        "display_name_en": "LSGD & Department Authority",
        "description": "Ward members, Panchayat Secretaries, and departmental triage officers."
    },
    {
        "name": "OFFICER",
        "display_name_ml": "ഫീൽഡ് ഓഫീസർ / ഹരിതകർമ്മസേന",
        "display_name_en": "Field Officer / Haritha Karma Sena",
        "description": "Sanitation workers, health inspectors, and field engineers executing resolution work."
    },
    {
        "name": "SUPER_ADMIN",
        "display_name_ml": "സിസ്റ്റം അഡ്മിനിസ്ട്രേറ്റർ",
        "display_name_en": "System Administrator",
        "description": "Master platform governance, role permissions, and system oversight."
    }
]

INITIAL_DEPARTMENTS = [
    {
        "code": "LSGD",
        "name_ml": "തദ്ദേശ സ്വയംഭരണ വകുപ്പ്",
        "name_en": "Local Self-Government Department",
        "contact_email": "lsgd@kerala.gov.in",
        "contact_phone": "+91-471-2321234"
    },
    {
        "code": "SUCHITWA",
        "name_ml": "ശുചിത്വ മിഷൻ & ഹരിതകർമ്മസേന",
        "name_en": "Suchitwa Mission & Haritha Karma Sena",
        "contact_email": "suchitwa@kerala.gov.in",
        "contact_phone": "+91-471-2555666"
    },
    {
        "code": "KSPCB",
        "name_ml": "കേരള സംസ്ഥാന മലിനീകരണ നിയന്ത്രണ ബോർഡ്",
        "name_en": "Kerala State Pollution Control Board",
        "contact_email": "kspcb@kerala.gov.in",
        "contact_phone": "+91-471-2318153"
    },
    {
        "code": "IRRIGATION",
        "name_ml": "ജലസേചന & ജലവിഭവ വകുപ്പ്",
        "name_en": "Irrigation and Water Resources Department",
        "contact_email": "irrigation@kerala.gov.in",
        "contact_phone": "+91-471-2322322"
    }
]


def seed_master_data():
    print("🌱 Connecting to database and creating tables...")
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        # Seed Roles
        for role_data in INITIAL_ROLES:
            stmt = select(Role).where(Role.name == role_data["name"])
            existing = session.scalars(stmt).first()
            if not existing:
                new_role = Role(
                    id=uuid.uuid4(),
                    name=role_data["name"],
                    display_name_ml=role_data["display_name_ml"],
                    display_name_en=role_data["display_name_en"],
                    description=role_data["description"]
                )
                session.add(new_role)
                print(f"  + Added Role: {role_data['name']} ({role_data['display_name_ml']})")
            else:
                print(f"  * Role exists: {role_data['name']}")

        # Seed Departments
        for dept_data in INITIAL_DEPARTMENTS:
            stmt = select(Department).where(Department.code == dept_data["code"])
            existing = session.scalars(stmt).first()
            if not existing:
                new_dept = Department(
                    id=uuid.uuid4(),
                    code=dept_data["code"],
                    name_ml=dept_data["name_ml"],
                    name_en=dept_data["name_en"],
                    contact_email=dept_data["contact_email"],
                    contact_phone=dept_data["contact_phone"]
                )
                session.add(new_dept)
                print(f"  + Added Department: {dept_data['code']} ({dept_data['name_ml']})")
            else:
                print(f"  * Department exists: {dept_data['code']}")

        session.commit()
        print("✅ Master data seeding completed successfully.")


if __name__ == "__main__":
    seed_master_data()
