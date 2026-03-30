# KYC Flow - Quick Reference Card

## The 5-Step Pipeline with New Validation

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: BINARY INGESTION                     │
│                   File upload to storage                        │
│          ✓ panFile received from multipart request             │
│          ✓ File streamed to temporary storage                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 2: AI IDENTIFICATION                     │
│               Document type detection (Groq Vision)            │
│          ✓ Uses Vision AI to detect: PAN / AADHAAR / BANK      │
│          ✓ Confidence check                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 3: AI EXTRACTION                          │
│              Field extraction from document image              │
│          ✓ Calls OCR service at 192.168.0.200:8000             │
│          ✓ Sends image file → Gets JSON with fields           │
│          ✓ Handles flexible field names (pan_number/pan_no/panNumber)│
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: RESULT NORMALIZATION (NEW VALIDATION LOGIC)            │
│         Data Cleaning & Validation                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ VALIDATION CHECK:                                         │ │
│  │ Are ALL required fields present?                          │ │
│  │                                                           │ │
│  │ Required for PAN:                                         │ │
│  │ ✓ PAN Number      ✓ Name                                  │ │
│  │ ✓ Father's Name   ✓ Date of Birth                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  COMPLETE ──→ PAN Format Check ──→ Risk Score Calculation      │
│  (All fields) ✓/✗              PASS/FAIL                       │
│     │                                                           │
│     └──→ Confidence Score: 0.0 - 1.0                           │
│                                                                 │
│  INCOMPLETE ──→ Collect missing fields ──→ Mark as REJECTED    │
│  (Any null)                                                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         STEP 5: JSON PAYLOAD DELIVERY (CONDITIONAL STORAGE)    │
│                                                                 │
│  IF DATA IS COMPLETE:                                           │
│  ├─ ✓ Save to kyc_data table                                   │
│  ├─ ✓ Set status = APPROVED (if valid & low risk)             │
│  ├─ ✓ Return extracted fields in response                      │
│  └─ ✓ Show success message                                     │
│                                                                 │
│  ELSE (DATA INCOMPLETE):                                        │
│  ├─ ✗ DO NOT save to kyc_data table                            │
│  ├─ ✗ Set status = REJECTED                                    │
│  ├─ ✗ Return null values in response                           │
│  └─ ✗ Show which fields are missing                            │
│                                                                 │
│  ALWAYS:                                                        │
│  ├─ Create 5 audit_log entries (STEPS 1-5)                     │
│  ├─ Update kyc_case with status and timings                    │
│  └─ Return JSON response with case summary                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
         Response to Client
         (With extracted data OR rejection reason)
```

---

## Decision Points

### Data Complete? (STEP 4 & 5)

```
┌─────────────┐
│ Validation  │      All 4 Fields      ┌──────────┐
│   Check     │─────────────────────→  │ COMPLETE │
│             │      Present           └──────────┘
│             │                              │
│             │        Any Field            │
│             │─────────────────────→  ┌──────────────┐
│             │        Missing         │  INCOMPLETE  │
└─────────────┘                        └──────────────┘
                                              │
                                              ▼
                                    Don't Store in DB
                                    Return REJECTED
```

### Status Decision (STEP 5)

```
Data Complete? ──→ NO  ──→ REJECTED (Missing fields)
        │
        YES
        │
        ▼
Format Valid? ──→ NO  ──→ REJECTED (Invalid PAN)
        │
        YES
        │
        ▼
Risk Low?    ──→ NO  ──→ REJECTED (High Risk)
        │
        YES
        │
        ▼
             APPROVED ✓
```

---

## API Endpoints

### 1. Process KYC (Submit PAN)

```
POST /api/kyc/process
Content-Type: multipart/form-data

Request:
  panFile: [image file]

Response (200 OK):
{
  "caseId": "KYC202503251712001",
  "status": "APPROVED|REJECTED|FAILED",
  "processingStartTime": "2026-03-25T17:12:00",
  "pipelinePhase": "COMPLETED",
  "expectedProcessingTimeSeconds": 2.456
}
```

### 2. Get Result (Retrieve Extracted Data)

```
GET /api/kyc/result/{caseId}

Response (200 OK):
{
  "caseId": "KYC202503251712001",
  "status": "APPROVED",
  "pan": "ABCDE1234F",           ← Extracted data (if complete)
  "name": "John Doe",             ←
  "fathersName": "James Doe",     ←
  "dob": "1990-05-15",            ←
  "confidenceScore": 0.87,        ← Quality metric
  "dataComplete": true,           ← Was all data extracted?
  "riskScore": 15,
  "displayMessage": "KYC verification successful..."  ← User message
}
```

---

## Response Status Values

| Status     | Meaning                              | Data Stored? | When                        |
| ---------- | ------------------------------------ | ------------ | --------------------------- |
| APPROVED   | ✓ Complete, Valid, Low Risk          | YES ✓        | All criteria met            |
| REJECTED   | ✗ Incomplete OR Invalid OR High Risk | NO ✗         | Failed validation           |
| FAILED     | ✗ System/API Error                   | NO ✗         | Exception during processing |
| PROCESSING | Still in progress                    | NO           | (Intermediate state)        |

---

## Console Output Key Indicators

### Complete Extraction ✓

```
[CASE] STEP 4: Data Completeness Check: ALL FIELDS EXTRACTED
[CASE] STEP 5: - ✓ Extracted data saved to database
[CASE] DATABASE: Data STORED, Audit logs saved
```

### Incomplete Extraction ✗

```
[CASE] STEP 4: Data Completeness Check: INCOMPLETE DATA
[CASE] - Missing Field(s): [Father's Name, Date of Birth]
[CASE] STEP 5: - ✗ Data incomplete - NOT storing to database
[CASE] DATABASE: Data NOT STORED, Audit logs saved
```

---

## Database Impact

### kyc_data Table

- **BEFORE:** Rows could have NULL values for extracted fields
- **AFTER:** Only rows with ALL fields populated (or no row if incomplete)
- **Result:** No garbage/incomplete data in database

### audit_log Table

- **BEFORE:** Same structure, same 5 entries
- **AFTER:** Same structure, same 5 entries, enhanced details
- **Result:** Complete audit trail for debugging

Example:

```
COMPLETE extraction:
  ✓ kyc_data has 1 row (all fields populated)
  ✓ audit_log has 5 rows (all SUCCESS)

INCOMPLETE extraction:
  ✗ kyc_data has 0 rows (no incomplete records)
  ✓ audit_log has 5 rows (showing missing data in STEP 4)
```

---

## Testing Workflow

### Test 1: Complete Extraction

```bash
# 1. Upload clear PAN image
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_clear.jpg"

# Console output:
# [CASE] STEP 4: ALL FIELDS EXTRACTED
# [CASE] STEP 5: - ✓ Extracted data saved

# 2. Retrieve result
curl http://localhost:8080/api/kyc/result/{caseId}

# Response shows:
# "pan": "ABCDE1234F",
# "name": "John Doe",
# "dataComplete": true,
# "status": "APPROVED"

# 3. Database check
SELECT * FROM kyc_data WHERE case_id = '{caseId}';
# Returns: 1 row with all fields
```

### Test 2: Incomplete Extraction

```bash
# 1. Upload blurry or partial image
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_blurry.jpg"

# Console output:
# [CASE] STEP 4: INCOMPLETE DATA
# [CASE] - Missing Field(s): [Date of Birth]
# [CASE] STEP 5: - ✗ Data incomplete - NOT storing

# 2. Retrieve result
curl http://localhost:8080/api/kyc/result/{caseId}

# Response shows:
# "pan": null,
# "name": null,
# "dob": null,
# "dataComplete": false,
# "status": "REJECTED",
# "displayMessage": "Missing required fields: Date of Birth..."

# 3. Database check
SELECT * FROM kyc_data WHERE case_id = '{caseId}';
# Returns: 0 rows (no incomplete data stored)
```

---

## Key Validation Rules

```
Required for APPROVAL:
  ✓ panNumber != null && !empty
  ✓ name != null && !empty
  ✓ fathersName != null && !empty
  ✓ dob != null && !empty
  ✓ Valid PAN format: [A-Z]{5}[0-9]{4}[A-Z]
  ✓ Risk score ≤ 50

Any failure → REJECTED (no database storage)
```

---

## User-Friendly Messages

### Success Message

```
"KYC verification successful. All required documents extracted and validated."
```

### Rejection Due to Missing Fields

```
"KYC verification failed. Missing required fields: Father's Name, Date of Birth.
Please submit a clear document."
```

### Rejection Due to Invalid Format

```
"KYC verification failed. The submitted document could not be fully validated.
Please resubmit."
```

---

## One-Line Summary

**Upload PAN → Extract Fields → Validate Completeness → Store ONLY if Complete → Return Status + Extracted Data**

✅ = Complete data stored, client gets success response  
❌ = Incomplete data NOT stored, client gets rejection reason
