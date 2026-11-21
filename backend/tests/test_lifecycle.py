import uuid

from app.models.auth import Role, User


def create_user_with_role(client, session, email, role_name, full_name):
    from app.models.auth import UserRole

    # Check if role exists
    role = session.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(
            id=uuid.uuid4(),
            name=role_name,
            display_name_ml="റോൾ",
            display_name_en="Role",
        )
        session.add(role)
        session.flush()

    user = session.query(User).filter(User.email == email).first()
    if not user:
        from app.core.security import get_password_hash

        user = User(
            id=uuid.uuid4(),
            full_name=full_name,
            email=email,
            phone=f"+91{str(abs(hash(email)))[:10]}",
            password_hash=get_password_hash("Password123!"),
            is_active=True,
        )
        session.add(user)
        session.flush()

        user_role = UserRole(user_id=user.id, role_id=role.id)
        session.add(user_role)
        session.commit()

    # Login to obtain token
    res = client.post("/api/v1/auth/login", json={"identifier": email, "password": "Password123!"})
    return res.json()["access_token"], user.id


def test_full_complaint_lifecycle(client):
    from tests.conftest import TestingSessionLocal

    with TestingSessionLocal() as session:
        citizen_token, _citizen_id = create_user_with_role(
            client, session, "citizen.lifecycle@example.com", "COMMUNITY", "ലളിത കുമാരി"
        )
        authority_token, _ = create_user_with_role(
            client, session, "authority.lifecycle@example.com", "AUTHORITY", "എക്സിക്യൂട്ടീവ് എൻജിനീയർ"
        )
        officer_token, _ = create_user_with_role(
            client, session, "officer.lifecycle@example.com", "OFFICER", "വാർഡ് ഫീൽഡ് ഇൻസ്പെക്ടർ"
        )

    # 1. Citizen creates complaint -> SUBMITTED
    create_payload = {
        "title": "കനത്ത മഴയിൽ കാന നിറഞ്ഞൊഴുകുന്നു",
        "description": "റോഡിലേക്ക് മലിനജലം കയറുന്നു. ഗതാഗത തടസ്സവും ആരോഗ്യ ഭീഷണിയും.",
        "category": "DRAINAGE",
        "severity": "HIGH",
        "location": {
            "latitude": 9.9816,
            "longitude": 76.2999,
            "district": "Ernakulam",
            "lsgd_type": "CORPORATION",
            "lsgd_name": "Kochi Corporation",
        },
    }
    create_res = client.post(
        "/api/v1/complaints",
        json=create_payload,
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert create_res.status_code == 201
    complaint_data = create_res.json()
    complaint_id = complaint_data["id"]
    assert complaint_data["current_status"] == "SUBMITTED"

    # 2. Authority verifies complaint -> VERIFIED
    verify_payload = {
        "new_status": "VERIFIED",
        "remarks": "പ്രാഥമിക പരിശോധനയിൽ പരാതി കൃത്യമാണെന്ന് ബോധ്യപ്പെട്ടു.",
    }
    verify_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json=verify_payload,
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["current_status"] == "VERIFIED"

    # 3. Authority assigns / marks IN_PROGRESS -> IN_PROGRESS
    progress_payload = {
        "new_status": "IN_PROGRESS",
        "remarks": "ഫീൽഡ് സംഘത്തെ ഡ്രെയിനേജ് ക്ലീനിംഗിനായി നിയോഗിച്ചു.",
    }
    progress_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json=progress_payload,
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert progress_res.status_code == 200
    assert progress_res.json()["current_status"] == "IN_PROGRESS"

    # 4. Field Officer executes and marks ACTION_TAKEN
    action_payload = {
        "new_status": "ACTION_TAKEN",
        "remarks": "ഓടയിലെ മാലിന്യങ്ങൾ സക്ഷൻ യന്ത്രം ഉപയോഗിച്ച് നീക്കം ചെയ്തു.",
    }
    action_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json=action_payload,
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert action_res.status_code == 200
    assert action_res.json()["current_status"] == "ACTION_TAKEN"

    # 5. Field Officer or Authority marks RESOLVED
    resolve_payload = {
        "new_status": "RESOLVED",
        "remarks": "പ്രശ്നം പൂർണ്ണമായും പരിഹരിച്ചു. ഒഴുക്ക് പുനഃസ്ഥാപിച്ചു.",
    }
    resolve_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json=resolve_payload,
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["current_status"] == "RESOLVED"

    # 6. Verify audit timeline history
    timeline_res = client.get(f"/api/v1/complaints/{complaint_id}/timeline")
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline) >= 5
    statuses = [t["new_status"] for t in timeline]
    assert "SUBMITTED" in statuses
    assert "VERIFIED" in statuses
    assert "IN_PROGRESS" in statuses
    assert "ACTION_TAKEN" in statuses
    assert "RESOLVED" in statuses


def test_invalid_lifecycle_transition_fails(client):
    from tests.conftest import TestingSessionLocal

    with TestingSessionLocal() as session:
        citizen_token, _ = create_user_with_role(
            client, session, "citizen.jump@example.com", "COMMUNITY", "സുരേഷ്"
        )
        authority_token, _ = create_user_with_role(
            client, session, "authority.jump@example.com", "AUTHORITY", "സെക്രട്ടറി"
        )

    # Create complaint (starts in SUBMITTED)
    create_res = client.post(
        "/api/v1/complaints",
        json={
            "title": "അനധികൃത മാലിന്യ നിക്ഷേപം",
            "description": "റോഡരികിൽ ചാക്കുകളിൽ മാലിന്യം തള്ളിയിരിക്കുന്നു.",
            "category": "WASTE",
            "location": {
                "latitude": 9.9816,
                "longitude": 76.2999,
                "district": "Ernakulam",
                "lsgd_type": "GRAMA_PANCHAYAT",
                "lsgd_name": "Kumbalangi",
            },
        },
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    complaint_id = create_res.json()["id"]

    # Attempt illegal transition: SUBMITTED directly to RESOLVED without verification or action
    illegal_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "RESOLVED", "remarks": "നേരിട്ട് പരിഹരിക്കാൻ ശ്രമിക്കുന്നു"},
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert illegal_res.status_code == 400
    assert "അസാധുവായ സ്റ്റാറ്റസ് മാറ്റം" in illegal_res.json()["detail"]


def test_role_authorization_rejection(client):
    from tests.conftest import TestingSessionLocal

    with TestingSessionLocal() as session:
        citizen_token, _ = create_user_with_role(
            client, session, "citizen.unauth@example.com", "COMMUNITY", "ബിന്ദു"
        )

    create_res = client.post(
        "/api/v1/complaints",
        json={
            "title": "കണ്ടൽക്കാടുകൾ വെട്ടിനശിപ്പിക്കുന്നു",
            "description": "തീരദേശ നിയന്ത്രണ മേഖലയിൽ മണ്ണടിച്ച് നികത്തുന്നു.",
            "category": "DEFORESTATION",
            "location": {
                "latitude": 9.9816,
                "longitude": 76.2999,
                "district": "Ernakulam",
                "lsgd_type": "MUNICIPALITY",
                "lsgd_name": "Maradu",
            },
        },
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    complaint_id = create_res.json()["id"]

    # Citizen tries to mark complaint as VERIFIED (forbidden)
    forbidden_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "VERIFIED", "remarks": "പൗരൻ സ്വയം വെരിഫൈ ചെയ്യുന്നു"},
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert forbidden_res.status_code == 403
    assert "അനുമതിയില്ല" in forbidden_res.json()["detail"]


def test_rejection_and_citizen_appeal(client):
    from tests.conftest import TestingSessionLocal

    with TestingSessionLocal() as session:
        citizen_token, _ = create_user_with_role(
            client, session, "citizen.appeal@example.com", "COMMUNITY", "മനോജ്"
        )
        authority_token, _ = create_user_with_role(
            client, session, "authority.appeal@example.com", "AUTHORITY", "തഹസിൽദാർ"
        )

    create_res = client.post(
        "/api/v1/complaints",
        json={
            "title": "അനധികൃത ചെങ്കൽ ക്വാറി",
            "description": "അനുമതിയില്ലാതെ കുന്നിടിച്ച് ചെങ്കല്ല് കടത്തുന്നു.",
            "category": "ILLEGAL_MINING",
            "location": {
                "latitude": 11.2588,
                "longitude": 75.7804,
                "district": "Kozhikode",
                "lsgd_type": "GRAMA_PANCHAYAT",
                "lsgd_name": "Koduvally",
            },
        },
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    complaint_id = create_res.json()["id"]

    # 1. Authority rejects complaint
    reject_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "REJECTED", "remarks": "സ്ഥലം സ്വകാര്യ വ്യക്തിയുടേതാണ്, കോടതി ഉത്തരവുണ്ട്."},
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["current_status"] == "REJECTED"

    # 2. Citizen appeals rejected complaint
    appeal_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json={
            "new_status": "APPEALED",
            "remarks": "കോടതി ഉത്തരവ് ലംഘിച്ചാണ് പ്രവർത്തനം നടക്കുന്നത്. പുനഃപരിശോധിക്കണം.",
        },
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert appeal_res.status_code == 200
    assert appeal_res.json()["current_status"] == "APPEALED"
