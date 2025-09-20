# API Reference

This document provides a detailed reference for the Popp AI system's API endpoints, including the Webhook Handler and Conversations API.

## Authentication

All API endpoints are protected by an `X-API-Key` header. You must include a valid API key in this header for all requests.

## 1. Webhook Handler

- **Objective:** Process incoming job application events and create conversation records.
- **URL:** `/api/webhook/application`
- **Method:** `POST`
- **Authentication:** Requires `X-API-Key` header.
- **Payload Example:**
  ```json
  {
    "id": "application-id-123",
    "job_id": "associated-job-id-abc",
    "candidate_id": "candidate-id-xyz",
    "candidate": {
      "phone_number": "+1234567890",
      "first_name": "Jane",
      "last_name": "Doe",
      "email_address": "jane.doe@example.com"
    }
  }
  ```
- **Key Business Logic Handled:**
  - **Phone Number Validation:** Validates the phone number format, ensuring it has a valid country code, appropriate length, and no invalid characters.
  - **Active Conversation Check:** Ensures that a candidate does not have any active conversations (status `CREATED` or `ONGOING`) before creating a new one for the same job.
  - **Duplicate Application Check:** Prevents the creation of a new conversation if the candidate has already applied for the same job, even if the previous conversation was marked as `COMPLETED`.
- **Responses:**
  - `200 OK`: Event processed successfully.
  - `400 Bad Request`: Invalid payload structure, data types, or phone number format.
  - `401 Unauthorized`: Missing `X-API-Key` header.
  - `403 Forbidden`: Invalid `X-API-Key`.
  - `409 Conflict`: Candidate has an active conversation or has already applied for this job.
  - `500 Internal Server Error`: Unexpected server error.

## 2. Conversations API

- **Objective:** Interact with conversation data.
- **Authentication:** Requires `X-API-Key` header.

### a. Fetch All Conversations

- **URL:** `/api/conversations`
- **Method:** `GET`
- **Query Parameters:**
  - `status`: Optional. Filter conversations by status (`CREATED`, `ONGOING`, `COMPLETED`).
- **Responses:**
  - `200 OK`: Returns an array of conversation objects.
  - `400 Bad Request`: Invalid `status` query parameter.
  - `401 Unauthorized`: Missing `X-API-Key` header.
  - `403 Forbidden`: Invalid `X-API-Key`.
  - `500 Internal Server Error`: Unexpected server error.

### b. Retrieve Single Conversation by ID

- **URL:** `/api/conversations/:id`
- **Method:** `GET`
- **Responses:**
  - `200 OK`: Returns a single conversation object.
  - `401 Unauthorized`: Missing `X-API-Key` header.
  - `403 Forbidden`: Invalid `X-API-Key`.
  - `404 Not Found`: Conversation with the given ID does not exist.
  - `500 Internal Server Error`: Unexpected server error.
