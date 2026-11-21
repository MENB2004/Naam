# 19. NAAM (നാം) — Sample Data and Field Photographs Management

## 1. Directory Structure

```text
sample-data/
├── field_photos/
│   ├── waste_management/        # Roadside dump sites, plastic accumulation in canals
│   ├── water_pollution/         # Industrial effluents, algae blooms, well contamination
│   ├── drainage/                 # Silted urban storm drains, clogged culverts
│   ├── flooding/                 # Waterlogged junctions, monsoon overflow points
│   └── other/                    # Soil erosion, illegal quarrying, tree falls
├── metadata/
│   └── field_photos.csv          # Metadata ledger with authentic Kerala coordinates
└── demo_data/
    ├── demo_users.json           # Seed users for Community, Authority, Officer, and Admin
    ├── demo_departments.json     # LSGD, Suchitwa Mission, KSPCB, Irrigation
    ├── demo_complaints.json      # Structured complaints across Kerala districts
    └── demo_alerts.json          # Official warnings and community notices
```

---

## 2. Field Photograph Metadata Schema (`metadata/field_photos.csv`)
Each sample photo is indexed with rigorous metadata to distinguish genuine field observations from simulated records:

| Field | Description | Example |
|---|---|---|
| `photo_id` | Unique identifier | `PHT-KL-EKM-001` |
| `filename` | File path | `waste_management/ekm_vyttila_plastic.jpg` |
| `category` | Environmental category | `SOLID_WASTE` |
| `district` | Kerala district | `Ernakulam` |
| `lsgd_name` | Local Self-Government unit | `Kochi Municipal Corporation` |
| `latitude` | Accurate coordinate | `9.9675` |
| `longitude` | Accurate coordinate | `76.3184` |
| `caption_ml` | Malayalam description | വൈറ്റില ജംഗ്ഷനിലെ പ്ലാസ്റ്റിക് മാലിന്യക്കൂമ്പാരം |
| `caption_en` | English description | Plastic waste accumulation near Vyttila junction |
| `data_type` | Data classification | `REAL_FIELD_OBSERVATION` or `SIMULATED_DEMO` |
| `consent_verified` | Privacy verification | `YES` |
