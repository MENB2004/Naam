# 24. NAAM (നാം) — API Testing Guide and Recipes

## 1. Authentication Flow Testing

### 1.1 Citizen Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "citizen@naam.kerala.gov.in", "password": "TestPassword123!"}'
```

### 1.2 Submit Environmental Complaint
```bash
curl -X POST http://localhost:8000/api/v1/complaints \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Roadside plastic waste accumulation",
    "description": "Large pile of unsegregated plastic waste blocking pedestrian pathway.",
    "category": "SOLID_WASTE",
    "severity": "HIGH",
    "latitude": 9.9675,
    "longitude": 76.3184,
    "district": "Ernakulam",
    "lsgd_name": "Kochi Municipal Corporation",
    "ward_number": "42",
    "landmark": "Near Vyttila Mobility Hub"
  }'
```
