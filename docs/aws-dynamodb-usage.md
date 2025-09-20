# AWS DynamoDB Usage

This document describes how the Popp AI system utilizes AWS DynamoDB for data storage and management. Amazon DynamoDB is a fast and flexible NoSQL database service for all applications that need consistent, single-digit-millisecond latency at any scale.

## Table Structures

DynamoDB tables are schema-less in the traditional sense, but require a primary key. The Popp AI system would typically use DynamoDB for storing data that requires high performance and scalability, such as:

*   **Conversation State:** Storing the current state of ongoing conversations.
*   **Candidate Profiles:** Potentially caching or storing candidate-specific data for quick retrieval.
*   **Event Logs:** Recording events for auditing or analytics.

**Example Table: `PoppAIChatConversations`**

*   **Primary Key:** `conversationId` (Partition Key)
*   **Attributes:** `candidateId`, `jobId`, `status`, `lastUpdated`, `messages` (list of objects), etc.
*   **Global Secondary Indexes (GSIs):** Might include `candidateId-status-index` to efficiently query conversations by candidate and status.

## Data Models

The data models stored in DynamoDB are designed for efficient access based on the application's access patterns.

*   **Conversation Model:**
    *   `conversationId` (String): Unique identifier for the conversation.
    *   `candidateId` (String): ID of the candidate involved.
    *   `jobId` (String): ID of the job associated with the conversation.
    *   `status` (String): Current status (e.g., `CREATED`, `ONGOING`, `COMPLETED`).
    *   `lastUpdated` (String - ISO 8601): Timestamp of the last update.
    *   `messages` (List of Maps): Array of message objects, each containing `sender`, `timestamp`, `content`.

*   **Candidate Profile Model (if used):**
    *   `candidateId` (String): Unique identifier for the candidate.
    *   `phoneNumber` (String): Candidate's phone number.
    *   `firstName` (String): Candidate's first name.
    *   `lastName` (String): Candidate's last name.
    *   `emailAddress` (String): Candidate's email address.

## Access Patterns

Typical access patterns for DynamoDB in the Popp AI system might include:

*   **Get Conversation by ID:** Direct lookup using `conversationId`.
*   **Query Conversations by Candidate and Status:** Using a GSI (e.g., `candidateId-status-index`) to find all active conversations for a specific candidate.
*   **Update Conversation Status:** Updating the `status` attribute of a conversation item.
*   **Append Messages to Conversation:** Updating the `messages` list within a conversation item.

## Permissions

IAM policies are used to control access to DynamoDB tables. The Popp AI system's IAM role (e.g., associated with an ECS task or Lambda function) will require specific permissions:

*   `dynamodb:GetItem`
*   `dynamodb:PutItem`
*   `dynamodb:UpdateItem`
*   `dynamodb:Query`
*   `dynamodb:BatchGetItem`
*   `dynamodb:BatchWriteItem`

Permissions should be scoped to the specific tables and actions required to follow the principle of least privilege.
