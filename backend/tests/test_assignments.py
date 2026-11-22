from datetime import UTC, datetime, timedelta

from tests.test_lifecycle import create_user_with_role


def test_authority_officer_assignment_and_resolution_flow(client):
    from tests.conftest import TestingSessionLocal

    with TestingSessionLocal() as session:
        citizen_token, _citizen_id = create_user_with_role(
            client, session, "citizen.assign@example.com", "COMMUNITY", "ഗിരിജ വത്സൻ"
        )
        authority_token, _authority_id = create_user_with_role(
            client, session, "authority.assign@example.com", "AUTHORITY", "മുനിസിപ്പൽ സെക്രട്ടറി"
        )
        officer_token, officer_id = create_user_with_role(
            client, session, "officer.assign@example.com", "OFFICER", "ജയൻ കെ. (ഹെൽത്ത് ഇൻസ്പെക്ടർ)"
        )

    # 1. Authority lists available officers
    officers_res = client.get(
        "/api/v1/complaints/officers/available",
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert officers_res.status_code == 200
    officers_list = officers_res.json()
    assert len(officers_list) >= 1
    officer_ids = [str(o["id"]) for o in officers_list]
    assert str(officer_id) in officer_ids

    # 2. Citizen files complaint
    comp_res = client.post(
        "/api/v1/complaints",
        json={
            "title": "കമ്പോളത്തിന് പിന്നിലെ കരിങ്കൽ ചാലിൽ മാലിന്യം",
            "description": "മത്സ്യ-മാംസ അവശിഷ്ടങ്ങൾ അടിഞ്ഞുകൂടി ദുർഗന്ധം വമിക്കുന്നു.",
            "category": "WASTE",
            "severity": "HIGH",
            "location": {
                "latitude": 9.9816,
                "longitude": 76.2999,
                "district": "Ernakulam",
                "lsgd_type": "MUNICIPALITY",
                "lsgd_name": "Aluva Municipality",
                "ward_number": "14",
            },
        },
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert comp_res.status_code == 201
    complaint_id = comp_res.json()["id"]

    # 3. Citizen attempting to assign fails with 403 Forbidden
    unauth_assign = client.post(
        f"/api/v1/complaints/{complaint_id}/assign",
        json={"assigned_to_id": str(officer_id)},
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert unauth_assign.status_code == 403

    # 4. Authority assigns complaint to Field Officer with deadline
    deadline_iso = (datetime.now(UTC) + timedelta(days=2)).isoformat()
    assign_res = client.post(
        f"/api/v1/complaints/{complaint_id}/assign",
        json={
            "assigned_to_id": str(officer_id),
            "deadline": deadline_iso,
            "instructions": "സ്ഥലം ഉടൻ സന്ദർശിച്ച് ശുചീകരണ സംഘത്തെ നിയോഗിക്കുക.",
        },
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert assign_res.status_code == 200
    assigned_data = assign_res.json()
    assert assigned_data["current_status"] == "ASSIGNED"
    assert len(assigned_data["assignments"]) == 1
    assert assigned_data["assignments"][0]["assigned_to_name"] == "ജയൻ കെ. (ഹെൽത്ത് ഇൻസ്പെക്ടർ)"

    # 5. Field Officer checks their assigned tasks inbox
    tasks_res = client.get(
        "/api/v1/complaints/officer/tasks",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert any(t["id"] == complaint_id for t in tasks)

    # 6. Field Officer updates status to IN_PROGRESS
    progress_res = client.post(
        f"/api/v1/complaints/{complaint_id}/status",
        json={"new_status": "IN_PROGRESS", "remarks": "സ്ഥലത്തെത്തി പരിശോധന ആരംഭിച്ചു."},
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert progress_res.status_code == 200
    assert progress_res.json()["current_status"] == "IN_PROGRESS"

    # 7. Field Officer submits resolution proof
    resolve_payload = {
        "resolution_notes": "ഹരിതകർമ്മസേനയുമായി സഹകരിച്ച് മുഴുവൻ മാലിന്യങ്ങളും നീക്കം ചെയ്ത് ബ്ലീച്ചിംഗ് പൗഡർ വിതറി.",
        "evidence_photos": [
            {
                "file_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
                "file_type": "image/jpeg",
                "file_size_bytes": 1048576,
                "evidence_type": "FIELD_RESOLUTION_PROOF",
            }
        ],
    }
    resolve_res = client.post(
        f"/api/v1/complaints/{complaint_id}/resolve",
        json=resolve_payload,
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert resolve_res.status_code == 200
    resolved_data = resolve_res.json()
    assert resolved_data["current_status"] == "RESOLVED"
    assert any(e["evidence_type"] == "FIELD_RESOLUTION_PROOF" for e in resolved_data["evidence"])

    # 8. Verify timeline reflects assignment, progress, and resolution
    timeline_res = client.get(
        f"/api/v1/complaints/{complaint_id}/timeline",
        headers={"Authorization": f"Bearer {authority_token}"},
    )
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    statuses = [t["new_status"] for t in timeline]
    assert "ASSIGNED" in statuses
    assert "IN_PROGRESS" in statuses
    assert "RESOLVED" in statuses
