# KYC Service Testing - Data Validation & Response Flow

## Quick Start - Test the New Validation Logic

### Prerequisites

1. ✅ Spring Boot application running on `http://localhost:8080`
2. ✅ PostgreSQL database `kyc_db` with tables created
3. ✅ Test PAN image file (e.g., `pan_document.jpg`) or any image file

---

## Test Scenarios

### Test 1: Full Data Extraction (APPROVED)

**Scenario:** Upload a PAN image where OCR successfully extracts all fields

```bash
# Step 1: Upload PAN document
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_document.jpg" \
  -H "Accept: application/json" \
  -v

# Expected Response (HTTP 200):
{
  "caseId": "KYC202503251712001",
  "status": "APPROVED",
  "processingStartTime": "2026-03-25T17:12:00.123",
  "pipelinePhase": "COMPLETED",
  "expectedProcessingTimeSeconds": 2.456
}

# Console Output Should Show:
# [KYC202503251712001] STEP 4: RESULT NORMALIZATION
# [KYC202503251712001] - Data Completeness Check: ALL FIELDS EXTRACTED
# [KYC202503251712001] STEP 5: JSON PAYLOAD DELIVERY
# [KYC202503251712001] - ✓ Extracted data saved to database
# [KYC202503251712001] - Final Status: APPROVED
# [KYC202503251712001] DATABASE: Data STORED
```

**Step 2: Retrieve full extracted data**

```bash
curl http://localhost:8080/api/kyc/result/KYC202503251712001 \
  -H "Accept: application/json" \
  -v

# Expected Response (HTTP 200):
{
  "caseId": "KYC202503251712001",
  "status": "APPROVED",
  "pan": "ABCDE1234F",
  "name": "John Doe",
  "fathersName": "James Doe",
  "dob": "1990-05-15",
  "confidenceScore": 0.87,
  "dataComplete": true,
  "riskScore": 15,
  "fraudFlags": null,
  "displayMessage": "KYC verification successful. All required documents extracted and validated."
}
```

**Step 3: Verify data in database**

```sql
-- Check kyc_data table (should have 1 row)
SELECT * FROM kyc_data WHERE case_id = 'KYC202503251712001';

-- Check audit_log table (should have 5 rows)
SELECT step, step_status, step_details FROM audit_log
WHERE case_id = 'KYC202503251712001' ORDER BY sequence_order;

-- Expected audit logs:
-- STEP 1: BINARY_INGESTION         SUCCESS
-- STEP 2: AI_IDENTIFICATION        SUCCESS
-- STEP 3: AI_EXTRACTION            SUCCESS
-- STEP 4: RESULT_NORMALIZATION     SUCCESS  (Data Complete: true)
-- STEP 5: PAYLOAD_DELIVERY         SUCCESS  (Status: APPROVED)
```

---

### Test 2: Incomplete Extraction (REJECTED - Missing DOB)

**Scenario:** OCR fails to extract Date of Birth

**To Simulate:** The OCR service needs to return incomplete data. For testing:

```bash
# Upload again (with same or different image)
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_document.jpg" \
  -H "Accept: application/json" \
  -v

# If OCR returns incomplete data:
```

**Expected Console Output:**

```
[KYC202503251712002] STEP 3: SPECIALIZED AI EXTRACTION
[KYC202503251712002] - Extracted fields:
[KYC202503251712002]   - PAN Number: ABCDE1234F
[KYC202503251712002]   - Name: John Doe
[KYC202503251712002]   - Father's Name: null
[KYC202503251712002]   - DOB: null

[KYC202503251712002] STEP 4: RESULT NORMALIZATION
[KYC202503251712002] - Data Completeness Check: INCOMPLETE DATA
[KYC202503251712002] - Missing Field(s): [Father's Name, Date of Birth]

[KYC202503251712002] STEP 5: JSON PAYLOAD DELIVERY
[KYC202503251712002] - ✗ Data incomplete - NOT storing to database. Missing: [Father's Name, Date of Birth]
[KYC202503251712002] - Final Status: REJECTED

[KYC202503251712002] DATABASE: Data NOT STORED, Audit logs saved
```

**API Response (HTTP 200):**

```json
{
  "caseId": "KYC202503251712002",
  "status": "REJECTED",
  "pan": null,
  "name": null,
  "fathersName": null,
  "dob": null,
  "confidenceScore": null,
  "dataComplete": false,
  "riskScore": null,
  "fraudFlags": null,
  "displayMessage": "KYC verification failed. Missing required fields: Father's Name, Date of Birth. Please submit a clear document."
}
```

**Verify Database:**

```sql
-- NO row in kyc_data (data not stored)
SELECT * FROM kyc_data WHERE case_id = 'KYC202503251712002';
-- Returns: (empty)

-- But audit logs ARE created (for debugging)
SELECT * FROM audit_log WHERE case_id = 'KYC202503251712002';
-- Returns: 5 rows showing complete pipeline execution
```

---

### Test 3: Invalid PAN Format (REJECTED)

**Scenario:** All fields extracted but PAN format invalid

**Expected Behavior:**

```
[KYC202503251712003] STEP 4: RESULT NORMALIZATION
[KYC202503251712003] - Data Completeness Check: ALL FIELDS EXTRACTED
[KYC202503251712003] - PAN Format Validation: INVALID
[KYC202503251712003] - Risk Score Assigned: 60
[KYC202503251712003] STEP 5: JSON PAYLOAD DELIVERY
[KYC202503251712003] - Final Status: REJECTED
```

---

## Expected Database Schema

### After Complete Extraction (Test 1)

```
kyc_case table:
- case_id: KYC202503251712001
- status: APPROVED
- risk_score: 15
- processing_start_time: 2026-03-25 17:12:00
- processing_end_time: 2026-03-25 17:12:03
- total_processing_time_ms: 3456

kyc_data table:
- id: 1
- case_id: KYC202503251712001
- name: John Doe
- pan_number: ABCDE1234F
- fathers_name: James Doe
- dob: 1990-05-15
- confidence_score: 0.87
- extraction_timestamp: 2026-03-25 17:12:02

audit_log table (5 rows):
1. BINARY_INGESTION      - SUCCESS - File ingested: pan_document.jpg (245632 bytes)
2. AI_IDENTIFICATION     - SUCCESS - Document type identified: PAN
3. AI_EXTRACTION         - SUCCESS - PAN extracted successfully
4. RESULT_NORMALIZATION  - SUCCESS - Data Complete: true, Confidence: 0.87, Risk Score: 15
5. PAYLOAD_DELIVERY      - SUCCESS - Response prepared. Status: APPROVED
```

### After Incomplete Extraction (Test 2)

```
kyc_case table:
- case_id: KYC202503251712002
- status: REJECTED
- risk_score: null
- processing_start_time: 2026-03-25 17:12:10
- processing_end_time: 2026-03-25 17:12:13
- total_processing_time_ms: 3456

kyc_data table:
- (NO ROW - data not stored due to incompleteness)

audit_log table (5 rows):
1. BINARY_INGESTION      - SUCCESS
2. AI_IDENTIFICATION     - SUCCESS
3. AI_EXTRACTION         - SUCCESS (incomplete)
4. RESULT_NORMALIZATION  - SUCCESS - Data Complete: false, Missing: [Father's Name, DOB]
5. PAYLOAD_DELIVERY      - SUCCESS - Status: REJECTED
```

---

## Key Differences in This Release

### Before (Old System)

```
- Data stored regardless of completeness ❌
- No validation of required fields ❌
- Response showed only basic info ❌
- Incomplete records polluted database ❌
```

### After (New System)

```
✅ Data ONLY stored if all required fields extracted
✅ Explicit validation with missing field reporting
✅ Response includes extracted fields + confidence + message
✅ Database contains only verified, complete records
✅ Audit log captures all details even for rejections
```

---

## Testing Command Reference

### Using curl (Recommended)

**Upload & Process:**

```bash
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_document.jpg" \
  -H "Accept: application/json" \
  -v
```

**Retrieve Result:**

```bash
curl http://localhost:8080/api/kyc/result/{caseId} \
  -H "Accept: application/json" \
  -v
```

### Using PowerShell

**Upload & Process:**

```powershell
$file = 'pan_document.jpg'
$form = @{
    panFile = Get-Item -Path $file
}
Invoke-WebRequest -Uri 'http://localhost:8080/api/kyc/process' `
  -Method Post -Form $form -Verbose | ConvertTo-Json
```

**Retrieve Result:**

```powershell
Invoke-WebRequest -Uri 'http://localhost:8080/api/kyc/result/KYC202503251712001' `
  -Method Get -Verbose | ConvertTo-Json
```

### Using Postman

1. **Create Request 1: Process KYC**
   - URL: `POST http://localhost:8080/api/kyc/process`
   - Body: form-data
     - key: `panFile`
     - value: select image file
   - Send → Get `caseId` from response

2. **Create Request 2: Get Result**
   - URL: `GET http://localhost:8080/api/kyc/result/{caseId}`
   - Send → View extracted data + status

---

## Troubleshooting

### Issue: Data not storing despite complete extraction

**Check:**

1. Is OCR service running on `http://192.168.0.200:8000`?
2. Is PostgreSQL running with `kyc_db` accessible?
3. Check console logs for error messages
4. Verify `validatePanExtraction()` is marking data as complete

### Issue: Always getting REJECTED status

**Check:**

1. Console logs showing missing fields?
2. OCR service returning null values?
3. Database connectivity issue?
4. Run: `curl http://192.168.0.200:8000/ocr/pan` directly to test OCR service

### Issue: Incomplete data showing in response

**Note:** This is intentional! If fields are missing:

- Response shows `null` for absent fields
- `dataComplete: false` flag
- `displayMessage` explains what's missing
- NO record in `kyc_data` table

---

## Next Steps

1. **Upload a real PAN image** via `/api/kyc/process`
2. **Check console output** to see validation results
3. **Retrieve full details** via `/api/kyc/result/{caseId}`
4. **Query database** to verify storage decision
5. **Review audit logs** for complete pipeline trace

---

## Summary

✅ **Complete Extraction:**

- All fields → Store in `kyc_data` → APPROVED status → Display success message

❌ **Incomplete Extraction:**

- Missing fields → Skip storage → REJECTED status → Display which fields missing

🔍 **Audit Trail:**

- Both cases → 5 audit logs created → Full pipeline history preserved
