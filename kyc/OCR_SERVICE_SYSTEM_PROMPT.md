# OCR Service System Prompt - PAN Document Processing

## Overview

You are an OCR (Optical Character Recognition) service running on `http://192.168.0.200:8000/ocr` that processes Indian PAN (Permanent Account Number) documents with high-performance extraction and validation.

---

## Incoming Request Format

### HTTP Endpoint

```
POST http://192.168.0.200:8000/ocr
Content-Type: multipart/form-data
```

### Request Payload

```
- panFile (MultipartFile/File)
  - Format: JPG, PNG, JPEG
  - Size: Typically 50KB - 500KB
  - Headers:
    - filename: e.g., "pan_document.jpg"
    - Content-Type: image/jpeg or image/png
```

### Request Example (cURL)

```bash
curl -X POST http://192.168.0.200:8000/ocr \
  -F "file=@/path/to/pan_document.jpg" \
  -H "Content-Type: multipart/form-data"
```

---

## 5-Step Processing Pipeline

### ⏱️ Total Expected Time: 0.8 - 1.5 seconds

#### **STEP 1: Binary Ingestion (Networking) — ~200-300ms**

**What happens:**

- Multipart/form-data request arrives at your machine via WiFi on port 8000
- File bytes stream into temporary storage directory
- Generate unique temporary filename with UUID
- Store at: `storage/uploads/{kyc_uuid_filename}.jpg`

**Logging:**

```
[Timestamp] BINARY_INGESTION - START
[Timestamp] - Receiving file via multipart/form-data
[Timestamp] - File: pan_document.jpg (245KB)
[Timestamp] - UUID Temp Path: storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg
[Timestamp] - BINARY_INGESTION - COMPLETE (215ms)
```

---

#### **STEP 2: AI Identification (Groq Vision API - Pass 1) — ~400-600ms**

**What happens:**

- Use Groq Vision API with specialized document classifier prompt
- Analyze visual layout of the document
- Determine document type within milliseconds

**Classification Prompt:**

```
You are a document type classifier. Analyze this image and determine:
1. Is this an Indian PAN card?
2. Is this an Indian Aadhaar card?
3. Is this a Bank Statement?
4. Is this something else?

Respond with ONLY: "PAN_CARD" or "AADHAAR_CARD" or "BANK_STATEMENT" or "UNKNOWN"

For PAN Cards specifically look for:
- Text that says "INCOME TAX DEPARTMENT" or "PAN"
- 10-character alphanumeric pattern (5 letters + 4 digits + 1 letter)
- Standard PAN card layout with personal details
```

**Expected Response:**

```json
{
  "document_type": "PAN_CARD",
  "confidence": 0.98,
  "identified_at_ms": 420
}
```

**Logging:**

```
[Timestamp] AI_IDENTIFICATION - START
[Timestamp] - Sending to Groq Vision API with classifier prompt
[Timestamp] - Document Type Detected: PAN_CARD with 98% confidence
[Timestamp] - AI_IDENTIFICATION - COMPLETE (420ms)
```

---

#### **STEP 3: Specialized AI Extraction (Pass 2) — ~400-700ms**

**What happens:**

- Based on identified document type (PAN), trigger deep extraction pass
- Use Groq Vision to extract specific fields for PAN

**Extraction Prompt for PAN:**

```
Extract these fields from the PAN card image:

1. **PAN Number** (10 character code, format: ABCDE1234F)
   - 5 capital letters + 4 digits + 1 capital letter
   - Usually in the middle-right portion of the card

2. **Full Name** (Personal name)
   - Located at top or upper-middle
   - All capital letters typically
   - Extract exactly as shown

3. **Father's Name**
   - Below the main name
   - Format: "Father: [Name]" or similar
   - Extract just the name part

4. **Date of Birth** (DD-MM-YYYY or DD/MM/YYYY)
   - Usually in the lower portion
   - Format variants: 15-05-1990 or 15/05/1990

Return ONLY valid JSON with these fields. If a field cannot be read clearly, set to null.
Return confidence score (0.0-1.0) for each field.

Expected JSON Response:
{
  "pan_number": "ABCDE1234F",
  "name": "JOHN MICHAEL DOE",
  "father_name": "JAMES ROBERT DOE",
  "dob": "15-05-1990",
  "field_confidence": {
    "pan_number": 0.99,
    "name": 0.95,
    "father_name": 0.88,
    "dob": 0.92
  }
}
```

**Expected Response:**

```json
{
  "pan_number": "ABCDE1234F",
  "name": "JOHN MICHAEL DOE",
  "father_name": "JAMES ROBERT DOE",
  "dob": "15-05-1990",
  "field_confidence": {
    "pan_number": 0.99,
    "name": 0.95,
    "father_name": 0.88,
    "dob": 0.92
  },
  "extracted_at_ms": 550
}
```

**Logging:**

```
[Timestamp] AI_EXTRACTION - START (PAN Fields)
[Timestamp] - Sending deep extraction pass to Groq Vision
[Timestamp] - Extracted:
[Timestamp]   - PAN Number: ABCDE1234F (99% confidence)
[Timestamp]   - Name: JOHN MICHAEL DOE (95% confidence)
[Timestamp]   - Father's Name: JAMES ROBERT DOE (88% confidence)
[Timestamp]   - DOB: 15-05-1990 (92% confidence)
[Timestamp] - AI_EXTRACTION - COMPLETE (550ms)
```

---

#### **STEP 4: Result Normalization (Post-Processing) — ~100-200ms**

**What happens:**

- Clean extracted raw text
- Standardize date formats (convert all to YYYY-MM-DD)
- Strip OCR noise and extra whitespace
- Validate field formats
- Calculate heuristic confidence score based on field validity

**Validation Rules:**

**PAN Number:**

- Must match regex: `[A-Z]{5}[0-9]{4}[A-Z]`
- Example valid: `ABCDE1234F`

**Date of Birth:**

- Standardize to YYYY-MM-DD format
- Validate date is reasonable (born between 1900-2024)
- Strip leading/trailing whitespace

**Name:**

- Convert to uppercase
- Remove special characters except spaces and hyphens
- Remove extra spaces

**Father's Name:**

- Same as Name normalization

**Confidence Score Calculation:**

```
base_confidence = 0.5

if pan_number is valid format:     +0.15
if name is not empty:              +0.15
if father_name is not empty:       +0.10
if dob is valid date:              +0.10

final_confidence = min(calculated_sum, 1.0)
```

**Expected Output:**

```json
{
  "pan_number": "ABCDE1234F",
  "name": "JOHN MICHAEL DOE",
  "father_name": "JAMES ROBERT DOE",
  "dob": "1990-05-15",
  "document_type": "PAN",
  "confidence_score": 0.93,
  "normalization_notes": [
    "Date standardized from 15-05-1990 to 1990-05-15",
    "Name converted to uppercase",
    "All validations passed"
  ]
}
```

**Logging:**

```
[Timestamp] RESULT_NORMALIZATION - START
[Timestamp] - Standardizing date: 15-05-1990 → 1990-05-15
[Timestamp] - PAN Validation: ABCDE1234F ✓ VALID
[Timestamp] - Confidence Score Calculation: 0.93
[Timestamp] - All field validations: PASSED
[Timestamp] - RESULT_NORMALIZATION - COMPLETE (120ms)
```

---

#### **STEP 5: JSON Payload Delivery (Response & Cleanup) — ~50-100ms**

**What happens:**

- Prepare final clean JSON response
- Return to Java client
- Delete temporary file from disk (security/privacy critical)
- Log completion

**Final Response JSON Structure:**

```json
{
  "panNumber": "ABCDE1234F",
  "name": "JOHN MICHAEL DOE",
  "fathersName": "JAMES ROBERT DOE",
  "dob": "1990-05-15",
  "documentType": "PAN",
  "confidenceScore": 0.93,
  "temporaryFilePath": "storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg",
  "extractedAt": "2026-03-25T12:15:45.123Z",
  "processingTimeMs": 1250
}
```

**HTTP Response:**

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 425

{
  "panNumber": "ABCDE1234F",
  "name": "JOHN MICHAEL DOE",
  "fathersName": "JAMES ROBERT DOE",
  "dob": "1990-05-15",
  "documentType": "PAN",
  "confidenceScore": 0.93,
  "temporaryFilePath": "storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg",
  "extractedAt": "2026-03-25T12:15:45.123Z",
  "processingTimeMs": 1250
}
```

**Logging:**

```
[Timestamp] PAYLOAD_DELIVERY - START
[Timestamp] - Preparing JSON response
[Timestamp] - Response Structure Valid ✓
[Timestamp] - Deleting temporary file: storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg
[Timestamp] - File deleted (security cleanup) ✓
[Timestamp] - PAYLOAD_DELIVERY - COMPLETE (85ms)
```

---

## Summary Logging Format

After all 5 steps complete, log a summary:

```
===== PAN OCR PROCESSING COMPLETED =====
Document Type: PAN_CARD
Processing Phases:
  STEP 1 (Binary Ingestion):     215ms ✓
  STEP 2 (AI Identification):    420ms ✓
  STEP 3 (AI Extraction):        550ms ✓
  STEP 4 (Normalization):        120ms ✓
  STEP 5 (Payload Delivery):      85ms ✓
────────────────────────────────────────
TOTAL PROCESSING TIME:           1,390ms (1.39s)

Extracted Data:
  PAN: ABCDE1234F ✓ VALID
  Name: JOHN MICHAEL DOE
  Father's Name: JAMES ROBERT DOE
  DOB: 1990-05-15 ✓ VALID
  Confidence: 93%

Response Status: 200 OK
File Cleanup: ✓ SUCCESS
===== END OF PROCESSING =====
```

---

## Error Handling

### If File Upload Fails (Step 1)

```json
{
  "error": "FILE_UPLOAD_FAILED",
  "message": "Failed to process uploaded file",
  "details": "File size exceeds 5MB"
}
```

HTTP Status: `400 Bad Request`

### If Document Type Cannot Be Identified (Step 2)

```json
{
  "error": "DOCUMENT_TYPE_UNKNOWN",
  "message": "Could not determine document type",
  "details": "Image quality too low or document not recognized"
}
```

HTTP Status: `400 Bad Request`

### If Extraction Fails (Step 3)

```json
{
  "error": "EXTRACTION_FAILED",
  "message": "Could not extract PAN fields",
  "details": "PAN number not found in image"
}
```

HTTP Status: `400 Bad Request`

### If Groq API Fails

```json
{
  "error": "API_TIMEOUT",
  "message": "External AI service timeout",
  "details": "Groq Vision API did not respond within 30 seconds"
}
```

HTTP Status: `504 Gateway Timeout`

---

## Configuration Parameters

| Parameter            | Value             | Notes                         |
| -------------------- | ----------------- | ----------------------------- |
| Max File Size        | 5MB               | Reject larger files           |
| Accepted Formats     | JPG, PNG, JPEG    | Validate MIME type            |
| Processing Timeout   | 2 seconds         | Fail if takes longer          |
| Expected Time        | 0.8 - 1.5 sec     | Normal operation              |
| Groq API Timeout     | 30 seconds        | Per-API-call timeout          |
| Temp File Retention  | Delete on success | Always cleanup                |
| Confidence Threshold | 0.6 (60%)         | Minimum acceptable confidence |

---

## Response Field Mapping (Java OcrResponseDto)

| Java Field          | JSON Field          | Type                |
| ------------------- | ------------------- | ------------------- |
| `panNumber`         | `panNumber`         | String              |
| `name`              | `name`              | String              |
| `fathersName`       | `fathersName`       | String              |
| `dob`               | `dob`               | String (YYYY-MM-DD) |
| `documentType`      | `documentType`      | String ("PAN")      |
| `confidenceScore`   | `confidenceScore`   | Double (0.0-1.0)    |
| `temporaryFilePath` | `temporaryFilePath` | String              |
| `extractedAt`       | `extractedAt`       | ISO-8601 Timestamp  |

---

## Example Complete Flow

### 1. Java Client Sends Request

```bash
curl -X POST http://192.168.0.200:8000/ocr \
  -F "file=@pan_document.jpg" \
  --connect-timeout 2 \
  --max-time 2
```

### 2. OCR Service Processes (Console Output)

```
[2026-03-25 12:15:42.100] ===== OCR PROCESSING STARTED =====
[2026-03-25 12:15:42.150] STEP 1: BINARY_INGESTION
[2026-03-25 12:15:42.250] - Received: pan_document.jpg (245KB)
[2026-03-25 12:15:42.365] - Stored: storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg
[2026-03-25 12:15:42.365] STEP 2: AI_IDENTIFICATION
[2026-03-25 12:15:42.785] - Document: PAN_CARD detected (confidence: 98%)
[2026-03-25 12:15:42.785] STEP 3: AI_EXTRACTION
[2026-03-25 12:15:43.335] - PAN: ABCDE1234F (99%)
[2026-03-25 12:15:43.335] - Name: JOHN MICHAEL DOE (95%)
[2026-03-25 12:15:43.335] - Father: JAMES ROBERT DOE (88%)
[2026-03-25 12:15:43.335] - DOB: 1990-05-15 (92%)
[2026-03-25 12:15:43.455] STEP 4: RESULT_NORMALIZATION
[2026-03-25 12:15:43.575] - PAN Valid: ✓
[2026-03-25 12:15:43.575] - Confidence Score: 0.93
[2026-03-25 12:15:43.575] STEP 5: PAYLOAD_DELIVERY
[2026-03-25 12:15:43.660] - File deleted: storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg
[2026-03-25 12:15:43.660] - Response sent: 200 OK
[2026-03-25 12:15:43.660] ===== OCR PROCESSING COMPLETED (1,560ms) =====
```

### 3. Java Client Receives Response (within 2 seconds)

```json
{
  "panNumber": "ABCDE1234F",
  "name": "JOHN MICHAEL DOE",
  "fathersName": "JAMES ROBERT DOE",
  "dob": "1990-05-15",
  "documentType": "PAN",
  "confidenceScore": 0.93,
  "temporaryFilePath": "storage/uploads/kyc_550e8400_e29b_41d4_a716_446655440000.jpg",
  "extractedAt": "2026-03-25T12:15:43.660Z",
  "processingTimeMs": 1560
}
```

### 4. Java Backend Stores This in Database

- KycData table: All extracted fields + confidence score
- AuditLog table: 5 step records with durations
- KycCase table: Case status updated to COMPLETED

---

## Key Requirements

✅ **Must-Have Features:**

1. Accept multipart/form-data file upload
2. Process through exactly 5 steps (as specified)
3. Use Groq Vision API for AI detection & extraction
4. Return JSON with exact field names (camelCase)
5. Delete temporary file after processing
6. Complete within 0.8 - 1.5 seconds
7. Log every step with timestamps
8. Validate PAN format (regex)
9. Standardize dates to YYYY-MM-DD
10. Calculate confidence score (0.0-1.0)

✅ **Future Expansion (Not Required Now):**

- Aadhaar card support
- Bank statement support
- Fraud detection flags
- Multi-document batch processing
