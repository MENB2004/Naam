"""Create or refresh the local-only portal demo accounts.

Run from the backend directory with its configured SQLite development database:
    .venv/Scripts/python.exe scripts/seed_demo_users.py

This script deliberately refuses non-SQLite databases so demo passwords cannot
be seeded into a production PostgreSQL database by accident.
"""

import uuid
import sys

from sqlalchemy import select

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models import Department, Role, User, UserRole  # noqa: F401
from seed_master_data import seed_master_data


DEMO_USERS = [
    {
        "email": "anjali.nair@example.com",
        "full_name": "Anjali Nair (Demo Citizen)",
        "phone": "+919876543210",
        "password": "StrongPassword123!",
        "role": "COMMUNITY",
        "department": None,
    },
    {
        "email": "officer.lsgd@kerala.gov.in",
        "full_name": "Demo LSGD Authority",
        "phone": "+919876543211",
        "password": "AuthorityPass2026!",
        "role": "AUTHORITY",
        "department": "LSGD",
    },
    {
        "email": "field.kochi@kerala.gov.in",
        "full_name": "Demo Kochi Field Officer",
        "phone": "+919876543212",
        "password": "OfficerPass2026!",
        "role": "OFFICER",
        "department": "SUCHITWA",
    },
    {
        "email": "admin@naam.kerala.gov.in",
        "full_name": "Demo System Administrator",
        "phone": "+919876543213",
        "password": "AdminPass2026!",
        "role": "SUPER_ADMIN",
        "department": None,
    },
]


def seed_demo_users() -> None:
    if not settings.DATABASE_URL.startswith("sqlite"):
        raise SystemExit("Demo users may only be seeded into a local SQLite database.")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    seed_master_data()
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        for account in DEMO_USERS:
            role = session.scalars(select(Role).where(Role.name == account["role"])).first()
            if role is None:
                raise RuntimeError(f"Missing required role: {account['role']}")

            department_id = None
            if account["department"]:
                department = session.scalars(
                    select(Department).where(Department.code == account["department"])
                ).first()
                if department is None:
                    raise RuntimeError(f"Missing required department: {account['department']}")
                department_id = department.id

            user = session.scalars(
                select(User).where(User.email == account["email"])
            ).first()
            if user is None:
                user = User(id=uuid.uuid4(), email=account["email"])
                session.add(user)

            user.full_name = account["full_name"]
            user.phone = account["phone"]
            user.password_hash = get_password_hash(account["password"])
            user.department_id = department_id
            user.is_active = True
            user.is_verified = True
            user.roles = [UserRole(user_id=user.id, role_id=role.id)]
            print(f"Seeded {account['role']}: {account['email']}")

        session.commit()
    print("Demo portal accounts are ready in the local SQLite database.")


if __name__ == "__main__":
    seed_demo_users()
