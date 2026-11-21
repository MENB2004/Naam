# 14. NAAM (നാം) — Image and File Management Specification

## 1. Evidentiary Image Lifecycle
Photographic evidence is central to environmental complaint verification. NAAM enforces strict integrity, size, and privacy controls.

```mermaid
graph LR
    Input["Citizen/Officer selects photo"] --> ClientCompress["Client-Side Compression<br/>(Max 1920x1080, WebP/JPEG)"]
    ClientCompress --> Upload["Multipart POST to /api/v1/complaints/evidence"]
    Upload --> Validation["Server-Side Validation<br/>(MIME check, Magic Bytes, Max 5MB)"]
    Validation --> Storage["Store in Object Storage / Media Directory"]
    Storage --> DB["Record in `evidence` table with UUID & metadata"]
```

---

## 2. File Upload Restrictions & Validation
- **Permitted MIME Types:** `image/jpeg`, `image/png`, `image/webp`. Executable files, PDFs, and archives are rejected.
- **Magic Bytes Verification:** Server inspects file header bytes (e.g. `ÿØÿ` for JPEG) to prevent malicious extension spoofing.
- **Maximum File Size:** 5 MB per image (up to 5 images per complaint).
- **Privacy & Sanitization:** EXIF metadata containing camera serial numbers is stripped. GPS coordinates embedded in EXIF are extracted only with user consent to confirm location accuracy.
