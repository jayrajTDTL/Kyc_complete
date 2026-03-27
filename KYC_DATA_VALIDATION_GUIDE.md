# KYC Data Validation & Response Flow Guide

## Overview

Updated KYC system to validate that **all required PAN fields are extracted** before storing in database. If extraction is incomplete, data is NOT stored and a **REJECTED** status is returned.

---

## Key Changes

### 1. **Data Validation (STEP 4)**

All required PAN fields must be extracted:

- ✅ PAN Number
- ✅ Full Name
- ✅ Father's Name
- ✅ Date of Birth

```java
// Validation checks if ALL fields are present
ValidationResult validation = validatePanExtraction(ocrResponse);
if (!validation.isComplete) {
    log.warn("Missing Field(s): {}", validation.missingFields);
}
```

### 2. **Conditional Data Storage (STEP 5)**

Data is **ONLY stored if validation passes**:

```
IF all fields extracted → Store to database (APPROVED/REJECTED based on validity)
ELSE missing fields    → Do NOT store, return rejection message
```

**Database Logic:**

```java
if (validation.isComplete) {
    kycDataRepository.save(kycData);  // ✓ Store to database
    finalStatus = "APPROVED";         // ✓ Valid & Complete
} else {
    // ✗ Do NOT store incomplete data
    finalStatus = "REJECTED";         // ✗ Missing fields
}
```

### 3. **Enhanced Response DTO**

`KycResultResponseDto` now includes extracted field details:

```json
{
  "caseId": "KYC202503251711001",
  "status": "APPROVED",
  "pan": "ABCDE1234F",
  "name": "John Doe",
  "fathersName": "James Doe",
  "dob": "1990-05-15",
  "confidenceScore": 0.87,
  "dataComplete": true,
  "riskScore": 15,
  "displayMessage": "KYC verification successful. All required documents extracted and validated."
}
```

### 4. **Status Values**

- **APPROVED** - All fields extracted, valid + low risk
- **REJECTED** - Missing fields OR invalid format OR high risk
- **FAILED** - System/API error during processing

### 5. **User-Friendly Messages**

Return descriptive messages showing what went wrong:

```
✓ APPROVED: "KYC verification successful. All required documents extracted and validated."

✗ REJECTED (incomplete): "KYC verification failed. Missing required fields: PAN Number, Date of Birth.
                         Please submit a clear document."

✗ REJECTED (invalid): "KYC verification failed. The submitted document could not be fully validated.
                      Please resubmit."
```

---

## API Response Examples

### Example 1: Complete Extraction (APPROVED)

```bash
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_document.jpg"
```

**Response:**

```json
{
  "caseId": "KYC202503251711001",
  "status": "APPROVED",
  "processingStartTime": "2026-03-25T17:11:39",
  "pipelinePhase": "COMPLETED",
  "expectedProcessingTimeSeconds": 2.453
}
```

**Then retrieve full details:**

```bash
curl http://localhost:8080/api/kyc/result/KYC202503251711001
```

**Response with extracted data:**

```json
{
  "caseId": "KYC202503251711001",
  "status": "APPROVED",
  "pan": "ABCDE1234F",
  "name": "John Doe",
  "fathersName": "James Doe",
  "dob": "1990-05-15",
  "confidenceScore": 0.87,
  "dataComplete": true,
  "riskScore": 15,
  "displayMessage": "KYC verification successful. All required documents extracted and validated."
}
```

### Example 2: Incomplete Extraction (REJECTED)

**Document is missing Date of Birth field**

**Console Output:**

```
[KYC202503251711002] STEP 4: RESULT NORMALIZATION - Cleaning & Validating data
[KYC202503251711002] - Data Completeness Check: INCOMPLETE DATA
[KYC202503251711002] - Missing Field(s): [Date of Birth]
[KYC202503251711002] STEP 5: JSON PAYLOAD DELIVERY - Preparing response
[KYC202503251711002] - ✗ Data incomplete - NOT storing to database. Missing: [Date of Birth]
[KYC202503251711002] - Final Status: REJECTED
```

**API Response:**

```json
{
  "caseId": "KYC202503251711002",
  "status": "REJECTED",
  "pan": null,
  "name": null,
  "fathersName": null,
  "dob": null,
  "confidenceScore": null,
  "dataComplete": false,
  "riskScore": null,
  "displayMessage": "KYC verification failed. Missing required fields: Date of Birth. Please submit a clear document."
}
```

**Database State:**

- ✗ NO record in `kyc_data` (incomplete data not stored)
- ✓ Audit logs created showing missing fields

---

## Console Logging Output

### Complete Extraction Flow

```
[KYC202503251711001] ===== KYC PROCESSING STARTED =====
[KYC202503251711001] STEP 1: BINARY INGESTION - Starting file upload
[KYC202503251711001] - File name: pan_document.jpg
[KYC202503251711001] - File size: 245632 bytes
[KYC202503251711001] STEP 2: AI IDENTIFICATION - Analyzing document type
[KYC202503251711001] - AI Result: PAN IDENTIFIED with HIGH CONFIDENCE
[KYC202503251711001] STEP 3: SPECIALIZED AI EXTRACTION - Extracting PAN fields
[KYC202503251711001] - Extracted fields:
[KYC202503251711001]   - PAN Number: ABCDE1234F
[KYC202503251711001]   - Name: John Doe
[KYC202503251711001]   - Father's Name: James Doe
[KYC202503251711001]   - DOB: 1990-05-15
[KYC202503251711001] STEP 4: RESULT NORMALIZATION - Cleaning & Validating data
[KYC202503251711001] - Data Completeness Check: ALL FIELDS EXTRACTED
[KYC202503251711001] - PAN Format Validation: VALID
[KYC202503251711001] - Confidence Score: 0.87
[KYC202503251711001] - Risk Score Assigned: 15
[KYC202503251711001] STEP 5: JSON PAYLOAD DELIVERY - Preparing response
[KYC202503251711001] - ✓ Extracted data saved to database
[KYC202503251711001] - Final Status: APPROVED
[KYC202503251711001] =====================================================
[KYC202503251711001] KYC PROCESSING COMPLETED
[KYC202503251711001] =====================================================
[KYC202503251711001] DATA EXTRACTION
[KYC202503251711001] ├─ PAN Number: ABCDE1234F
[KYC202503251711001] ├─ Name: John Doe
[KYC202503251711001] ├─ Father's Name: James Doe
[KYC202503251711001] └─ DOB: 1990-05-15
[KYC202503251711001] DATA QUALITY
[KYC202503251711001] ├─ Completeness: COMPLETE
[KYC202503251711001] ├─ Confidence: 87.00%
[KYC202503251711001] ├─ Risk Score: 15
[KYC202503251711001] └─ Final Status: APPROVED
[KYC202503251711001] DATABASE: Data STORED, Audit logs saved
```

### Incomplete Extraction Flow

```
[KYC202503251711002] STEP 3: SPECIALIZED AI EXTRACTION - Extracting PAN fields
[KYC202503251711002] - Extracted fields:
[KYC202503251711002]   - PAN Number: ABCDE1234F
[KYC202503251711002]   - Name: John Doe
[KYC202503251711002]   - Father's Name: null
[KYC202503251711002]   - DOB: null
[KYC202503251711002] STEP 4: RESULT NORMALIZATION - Cleaning & Validating data
[KYC202503251711002] - Data Completeness Check: INCOMPLETE DATA
[KYC202503251711002] - Missing Field(s): [Father's Name, Date of Birth]
[KYC202503251711002] STEP 5: JSON PAYLOAD DELIVERY - Preparing response
[KYC202503251711002] - ✗ Data incomplete - NOT storing to database. Missing: [Father's Name, Date of Birth]
[KYC202503251711002] - Final Status: REJECTED
[KYC202503251711002] DATABASE: Data NOT STORED, Audit logs saved
```

---

## Database Changes

### kyc_data Table

- Data is **only** inserted if extraction is complete
- Each row represents a successfully extracted PAN
- `Confidence Score` helps identify quality issues for future audits

### audit_log Table

- Always created (even if final storage fails)
- 5 entries per KYC request showing each pipeline step
- Includes step duration and detailed status (`SUCCESS`/`FAILURE`/`SKIPPED`)
- Helpful for debugging partial/failed extractions

**Audit Log Example (Incomplete Extraction):**

```
stepNumber | step                    | status  | details
-----------|-------------------------|---------|----------------------------------
1          | BINARY_INGESTION        | SUCCESS | File ingested: pan.jpg (245632 bytes)
2          | AI_IDENTIFICATION       | SUCCESS | Document type identified: PAN
3          | AI_EXTRACTION           | SUCCESS | Fields extracted (missing DOB)
4          | RESULT_NORMALIZATION    | SUCCESS | Data Complete: false, ...
5          | PAYLOAD_DELIVERY        | SUCCESS | Response prepared. Status: REJECTED
```

---

## Implementation Details

### New Helper Methods

#### `validatePanExtraction(OcrResponseDto ocr)`

Checks if all required PAN fields are non-null and non-empty:

- Returns `ValidationResult` with `isComplete` flag and list of `missingFields`
- Used in STEP 4 to decide whether to store data

#### `calculateRiskScore(boolean complete, boolean panValid, double confidence)`

Calculates risk score (0-100) based on:

- Data completeness (most important)
- PAN format validity
- Confidence score

#### `determineFinalStatus(boolean complete, boolean panValid, int risk)`

Returns appropriate status:

- `APPROVED` if complete + valid + low risk
- `REJECTED` if incomplete OR invalid OR high risk
- `FAILED` for system errors

#### `generateDisplayMessage(String status, ValidationResult)`

Creates user-friendly response messages explaining:

- What went wrong (if rejected)
- Which fields are missing
- What to do next

---

## Migration Note

If you have existing uploaded documents without complete extraction, they will NOT be stored. The system will return:

- Status: `REJECTED`
- Display: "Missing required fields: [list]"
- Database: No record in `kyc_data`
- Audit: Full pipeline logged in `audit_log` for review

This is **intentional** to ensure data quality - only verified, complete extractions are stored.

---

## Testing with curl

### Upload & Check Full Details

```bash
# 1. Upload PAN document
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_document.jpg" \
  -v

# Response will include caseId, e.g., KYC202503251711001

# 2. Retrieve full details with extracted data
curl http://localhost:8080/api/kyc/result/KYC202503251711001 \
  -v
```

### Check Console Output

The console will show:

```
- What data was extracted
- Which fields were missing (if any)
- Confidence score calculated
- Risk score assigned
- Final status (APPROVED/REJECTED)
- Database storage decision
```

---

## Summary of Changes

| Component     | Change                             | Benefit                              |
| ------------- | ---------------------------------- | ------------------------------------ |
| Validation    | Added `validatePanExtraction()`    | Ensures complete data before storage |
| Storage       | Made conditional (`if (complete)`) | Prevents incomplete data pollution   |
| Risk Scoring  | Enhanced with completeness check   | Prioritizes data quality             |
| Response DTO  | Added extracted fields + message   | Clients see full extracted data      |
| Logging       | Added "INCOMPLETE DATA" messages   | Easy debugging of failures           |
| Status Values | APPROVED/REJECTED/FAILED           | Clear user feedback                  |
