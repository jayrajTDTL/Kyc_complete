# OCR Integration Guide - Real API Service

## Overview

Your KYC application is now fully integrated with the real OCR service running on **`http://192.168.0.200:8000`** with three specialized endpoints for different document types.

---

## OCR Service Endpoints

### 1. **POST /ocr/pan** - Extract PAN Card Data

```
Endpoint: http://192.168.0.200:8000/ocr/pan
Method: POST
Content-Type: multipart/form-data

Request Parameters:
  - file (required): PAN card image (JPEG/PNG/WebP)
  - provider (optional): groq | ollama | auto (defaults to: auto)

Response: JSON with extracted PAN fields
```

### 2. **POST /ocr/aadhaar** - Extract Aadhaar Card Data

```
Endpoint: http://192.168.0.200:8000/ocr/aadhaar
Method: POST
Content-Type: multipart/form-data

Request Parameters:
  - file (required): Aadhaar card image (JPEG/PNG/WebP)
  - provider (optional): groq | ollama | auto (defaults to: auto)

Response: JSON with extracted Aadhaar fields
```

### 3. **POST /ocr/bank** - Extract Bank Document Data

```
Endpoint: http://192.168.0.200:8000/ocr/bank
Method: POST
Content-Type: multipart/form-data

Request Parameters:
  - file (required): Bank passbook/cheque image (JPEG/PNG/WebP)
  - provider (optional): groq | ollama | auto (defaults to: auto)

Response: JSON with extracted bank fields
```

---

## Java Integration - OcrClient

The `OcrClient` component handles all communication with the OCR service.

### Available Methods

```java
// PAN Card Extraction
OcrResponseDto ocrResponse = ocrClient.callPanOcrApi(MultipartFile panFile);
OcrResponseDto ocrResponse = ocrClient.callPanOcrApi(MultipartFile panFile, String provider);

// Aadhaar Card Extraction (future use)
OcrResponseDto ocrResponse = ocrClient.callAadhaarOcrApi(MultipartFile file);

// Bank Document Extraction (future use)
OcrResponseDto ocrResponse = ocrClient.callBankOcrApi(MultipartFile file);
```

### Current Integration

Currently, only **PAN extraction** is enabled in `KycServiceImpl.processKyc()`:

```java
// STEP 3: SPECIALIZED AI EXTRACTION
OcrResponseDto ocrResponse = ocrClient.callPanOcrApi(panFile);
```

---

## Processing Flow

### **Java → OCR Service → Database**

```
┌─────────────────────┐
│  Java Client (REST) │
│  POST /api/kyc/     │
│      process        │
└──────────┬──────────┘
           │ panFile (multipart)
           ▼
┌─────────────────────┐
│   KycServiceImpl     │
│  STEP 1: INGESTION  │
│  STEP 2: ID         │
│  STEP 3: EXTRACTION │   ─────────────────────────────┐
│  STEP 4: NORM       │                                 │
│  STEP 5: DELIVERY   │         HTTP POST              │
└──────────┬──────────┘         multipart               │
           │                                            │
           │              ┌────────────────────────────▼────────┐
           │              │  OCR Service (port 8000)            │
           │              │  POST /ocr/pan                       │
           │              │                                      │
           │              │  - File ingestion                   │
           │              │  - Groq Vision API calls            │
           │              │  - Field extraction & parsing       │
           │              │  - Response generation              │
           │              │                                      │
           │              │  Returns: JSON response             │
           │              └────────────┬─────────────────────────┘
           │                           │
           │         JSON response     │
           └───────────────────────────┘
                ▼
        ┌─────────────────────────┐
        │  OcrResponseDto          │
        │  - panNumber             │
        │  - name                  │
        │  - fathersName          │
        │  - dob                   │
        │  - documentType          │
        │  - confidenceScore       │
        │  - extractedAt           │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  Database Persistence     │
        │  - KycCase: status, risk  │
        │  - KycData: extracted     │
        │  - AuditLog: 5 steps      │
        └──────────────────────────┘
```

---

## Audit Logging - 5-Step Pipeline

Every KYC processing request creates **5 detailed audit log entries**:

### STEP 1: BINARY_INGESTION

**What:** File upload via WiFi → temporary storage
**Logs:** Filename, file size, temporary file path
**Duration:** ~200-300ms

```sql
INSERT INTO audit_logs
  (case_id, step, step_status, step_details, duration_ms, sequence_order)
VALUES
  ('KYC-20260325-123456', 'BINARY_INGESTION', 'SUCCESS',
   'File ingested: pan_document.jpg (245KB)', 215, 1);
```

### STEP 2: AI_IDENTIFICATION

**What:** Groq Vision API analyzes document type
**Logs:** Detected document type, confidence level
**Duration:** ~400-600ms

```sql
INSERT INTO audit_logs
  (case_id, step, step_status, step_details, duration_ms, sequence_order)
VALUES
  ('KYC-20260325-123456', 'AI_IDENTIFICATION', 'SUCCESS',
   'Document type identified: PAN', 420, 2);
```

### STEP 3: AI_EXTRACTION

**What:** Deep extraction of specific fields based on document type
**Logs:** PAN number, name, father's name, DOB
**Duration:** ~400-700ms

```sql
INSERT INTO audit_logs
  (case_id, step, step_status, step_details, duration_ms, sequence_order)
VALUES
  ('KYC-20260325-123456', 'AI_EXTRACTION', 'SUCCESS',
   'Extracted PAN: ABCDE1234F, Name: JOHN DOE, DOB: 1990-05-15', 550, 3);
```

### STEP 4: RESULT_NORMALIZATION

**What:** Data cleaning, validation, confidence scoring
**Logs:** PAN validation result, confidence score, risk score
**Duration:** ~100-200ms

```sql
INSERT INTO audit_logs
  (case_id, step, step_status, step_details, duration_ms, sequence_order)
VALUES
  ('KYC-20260325-123456', 'RESULT_NORMALIZATION', 'SUCCESS',
   'PAN Valid: true, Confidence: 0.93, Risk Score: 10', 120, 4);
```

### STEP 5: PAYLOAD_DELIVERY

**What:** Response preparation, database save, file cleanup
**Logs:** Final status, response sent, temporary file deleted
**Duration:** ~50-100ms

```sql
INSERT INTO audit_logs
  (case_id, step, step_status, step_details, duration_ms, sequence_order)
VALUES
  ('KYC-20260325-123456', 'PAYLOAD_DELIVERY', 'SUCCESS',
   'Response prepared. Final status: APPROVED', 85, 5);
```

---

## Console Output Example

When you run `mvn spring-boot:run` and send a PAN file:

```
[KYC-20260325-123456] ===== KYC PROCESSING STARTED =====
[KYC-20260325-123456] Java Client Request - PAN file upload via REST API

[KYC-20260325-123456] STEP 1: BINARY INGESTION - Starting file upload
[KYC-20260325-123456] - File name: pan_document.jpg
[KYC-20260325-123456] - File size: 245632 bytes
[KYC-20260325-123456] - Temporary file path: storage/uploads/kyc_KYC-20260325_uuid.jpg
[KYC-20260325-123456] - INGESTION COMPLETE (215ms)

[KYC-20260325-123456] STEP 2: AI_IDENTIFICATION - Analyzing document type
[KYC-20260325-123456] - AI Result: PAN IDENTIFIED with HIGH CONFIDENCE
[KYC-20260325-123456] - IDENTIFICATION COMPLETE (420ms)

[KYC-20260325-123456] STEP 3: SPECIALIZED AI EXTRACTION - Extracting PAN fields
[KYC-20260325-123456] - Calling external OCR service at: http://192.168.0.200:8000/ocr/pan
[KYC-20260325-123456] - Sending PAN image file over network...
[KYC-20260325-123456] - Extracted fields:
[KYC-20260325-123456]   - PAN Number: ABCDE1234F
[KYC-20260325-123456]   - Name: JOHN MICHAEL DOE
[KYC-20260325-123456]   - Father's Name: JAMES ROBERT DOE
[KYC-20260325-123456]   - DOB: 1990-05-15
[KYC-20260325-123456] - EXTRACTION COMPLETE (550ms)

[KYC-20260325-123456] STEP 4: RESULT NORMALIZATION - Cleaning & Validating data
[KYC-20260325-123456] - PAN Validation: VALID
[KYC-20260325-123456] - Confidence Score: 0.93
[KYC-20260325-123456] - Data normalization: Standardizing dates, stripping OCR noise
[KYC-20260325-123456] - Risk Score Assigned: 10
[KYC-20260325-123456] - NORMALIZATION COMPLETE (120ms)

[KYC-20260325-123456] STEP 5: JSON PAYLOAD DELIVERY - Preparing response
[KYC-20260325-123456] - Structured data saved to database
[KYC-20260325-123456] - Final Status: APPROVED
[KYC-20260325-123456] - Temporary file deleted from disk (security/privacy)
[KYC-20260325-123456] - PAYLOAD DELIVERY COMPLETE (85ms)

[KYC-20260325-123456] =====================================================
[KYC-20260325-123456] KYC PROCESSING COMPLETED SUCCESSFULLY
[KYC-20260325-123456] =====================================================
[KYC-20260325-123456] PIPELINE EXECUTION SUMMARY
[KYC-20260325-123456] ├─ STEP 1 (Binary Ingestion):     ✓ COMPLETE
[KYC-20260325-123456] ├─ STEP 2 (AI Identification):    ✓ COMPLETE
[KYC-20260325-123456] ├─ STEP 3 (AI Extraction):        ✓ COMPLETE
[KYC-20260325-123456] ├─ STEP 4 (Normalization):        ✓ COMPLETE
[KYC-20260325-123456] └─ STEP 5 (Payload Delivery):     ✓ COMPLETE
[KYC-20260325-123456] TIMING: Total Processing: 1390ms / 1.39s
[KYC-20260325-123456] EXTRACTED: PAN=ABCDE1234F, Name=JOHN MICHAEL DOE, DOB=1990-05-15
[KYC-20260325-123456] CONFIDENCE: 0.93, RISK_SCORE: 10, STATUS: APPROVED
[KYC-20260325-123456] DATABASE: 5 Audit logs saved, Data persisted
[KYC-20260325-123456] =====================================================
```

---

## OcrResponseDto Mapping

Response from OCR service is automatically parsed and mapped to Java DTO:

| Field             | Type          | Source                                   | Example                    |
| ----------------- | ------------- | ---------------------------------------- | -------------------------- |
| `panNumber`       | String        | JSON: pan_number, pan_no, panNumber, pan | "ABCDE1234F"               |
| `name`            | String        | JSON: name                               | "JOHN MICHAEL DOE"         |
| `fathersName`     | String        | JSON: fathers_name                       | "JAMES ROBERT DOE"         |
| `dob`             | String        | JSON: dob                                | "1990-05-15"               |
| `documentType`    | String        | Auto-assigned                            | "PAN"                      |
| `confidenceScore` | Double        | JSON: confidence                         | 0.93                       |
| `extractedAt`     | LocalDateTime | Server time                              | "2026-03-25T12:15:43.660Z" |

---

## Field Name Variations Handled

The OcrClient automatically handles different field naming conventions from the OCR service:

**PAN Fields:**

- `panNumber` / `pan_number` / `pan` / `pan_no`
- `name` / `full_name` / `fullName`
- `fathersName` / `fathers_name` / `father_name`
- `dob` / `date_of_birth` / `dateOfBirth`

**Aadhaar Fields (Future):**

- `aadhaarNumber` / `aadhaar_number` / `aadhaar`
- `name` / `full_name`
- `address`

**Bank Fields (Future):**

- `accountNumber` / `account_number` / `account_no`
- `accountHolderName` / `account_holder_name`
- `ifscCode` / `ifsc_code`
- `bankName` / `bank_name`

---

## Database Schema

### audit_logs Table

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  case_id VARCHAR(255),
  step VARCHAR(100),                    -- BINARY_INGESTION, AI_IDENTIFICATION, etc.
  step_status VARCHAR(20),              -- SUCCESS, FAILURE, SKIPPED
  step_details TEXT,                    -- JSON details of each step
  duration_ms BIGINT,                   -- Execution time in milliseconds
  sequence_order INT,                   -- 1, 2, 3, 4, 5 for pipeline order
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### kyc_data Table

```sql
CREATE TABLE kyc_data (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  case_id VARCHAR(255),
  name VARCHAR(255),
  pan_number VARCHAR(20),
  fathers_name VARCHAR(255),
  dob DATE,
  document_type VARCHAR(50),           -- PAN, AADHAAR, BANK
  confidence_score DECIMAL(3,2),       -- 0.0 - 1.0
  extraction_timestamp TIMESTAMP
);
```

### kyc_case Table

```sql
CREATE TABLE kyc_case (
  case_id VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50),                  -- PROCESSING, COMPLETED, FAILED
  risk_score INT,
  created_at TIMESTAMP,
  processing_start_time TIMESTAMP,
  processing_end_time TIMESTAMP,
  total_processing_time_ms BIGINT,
  current_pipeline_phase VARCHAR(100)  -- Current step name
);
```

---

## Future Expansion

### Enable Aadhaar Support

To enable Aadhaar card extraction, update `KycServiceImpl.processKyc()`:

```java
// Update to accept aadhaarFile parameter
public KycProcessResponseDto processKyc(MultipartFile panFile, MultipartFile aadhaarFile) {

    // For Aadhaar:
    OcrResponseDto ocrResponse = ocrClient.callAadhaarOcrApi(aadhaarFile);
}
```

### Enable Bank Document Support

```java
// For Bank documents:
OcrResponseDto ocrResponse = ocrClient.callBankOcrApi(bankFile);
```

### Custom OCR Provider

```java
// Override default provider:
OcrResponseDto response = ocrClient.callPanOcrApi(panFile, "groq");    // Force Groq
OcrResponseDto response = ocrClient.callPanOcrApi(panFile, "ollama");  // Force Ollama
```

---

## Configuration

### OCR Service Configuration

File: `application.properties`

```properties
# OCR Service (external)
ocr.service.url=http://192.168.0.200:8000
ocr.service.pan.endpoint=/ocr/pan
ocr.service.aadhaar.endpoint=/ocr/aadhaar
ocr.service.bank.endpoint=/ocr/bank
ocr.service.provider=auto            # groq | ollama | auto
ocr.service.timeout=30000            # 30 seconds
ocr.service.max-file-size=5MB
```

---

## Error Handling

If OCR service fails, you'll get:

```java
RuntimeException: Error calling PAN OCR API: [error details]
```

Errors are logged and the KYC case is marked as FAILED:

```
[case_id] ERROR during KYC processing: Connection refused
[case_id] Step: PROCESSING_FAILED, Status: FAILURE
```

The associated audit log entry will show:

```sql
INSERT INTO audit_logs
  (case_id, step, step_status, step_details)
VALUES
  ('KYC-20260325-123456', 'PROCESSING_FAILED', 'FAILURE',
   'Error: Connection refused to OCR service');
```

---

## Testing the Integration

### cURL Command

```bash
curl -X POST http://192.168.0.200:8000/ocr/pan \
  -F "file=@pan_document.jpg" \
  -F "provider=auto"
```

### Java REST Call

```bash
curl -X POST http://localhost:8080/api/kyc/process \
  -F "panFile=@pan_document.jpg" \
  -H "Content-Type: multipart/form-data"
```

### Expected Response

```json
{
  "caseId": "KYC-20260325-123456",
  "status": "APPROVED",
  "processingStartTime": "2026-03-25T12:15:42.100Z",
  "pipelinePhase": "COMPLETED",
  "expectedProcessingTimeSeconds": 1.39
}
```

### Query Audit Logs

```sql
SELECT * FROM audit_logs
WHERE case_id = 'KYC-20260325-123456'
ORDER BY sequence_order;
```

---

## Summary

✅ **Fully Integrated** with external OCR service on port 8000  
✅ **5-Step Pipeline** with complete audit logging  
✅ **Automatic Field Mapping** from multiple naming conventions  
✅ **Real-time Console Logging** for all processing steps  
✅ **Database Persistence** of all extracted data and audit trails  
✅ **Ready for Production** deployment
