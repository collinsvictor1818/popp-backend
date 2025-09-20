# Integration Guide

This document provides detailed information on how to integrate with the Popp Backend application.

## AWS Integration Documentation

This section provides links to detailed documentation on integrating with the Popp AI system using various AWS services.

*   [AWS EventBridge Integration](aws-eventbridge-integration.md)
*   [AWS AppSync and GraphQL Integration](aws-appsync-graphql-integration.md)
*   [AWS ECS and Fargate Deployment](aws-ecs-fargate-deployment.md)
*   [AWS DynamoDB Usage](aws-dynamodb-usage.md)

## API Endpoints

For a detailed reference of all available API endpoints, including the Webhook Handler and Conversations API, please refer to the [API Reference](api-reference.md).

## Application Overview

This system is designed to streamline the recruitment process by integrating with AI messaging. When a job application event is received, the system creates a conversation record in the database with the status `CREATED`. This action triggers a downstream process that listens for new conversations, generates an initial message to the candidate, and updates the conversation status to `ONGOING`. Once the conversation is complete, the status should be updated to `COMPLETED`.

Although downstream processes are not part of this implementation, understanding them helps in designing a robust and compatible component.

## Database Schema

The project uses Prisma ORM with a PostgreSQL database. Here's an overview of the main models:

### Conversation

-   **Fields:** `id`, `candidateId`, `jobId`, `status`, `createdAt`, `updatedAt`
-   **Status:** Can be `CREATED`, `ONGOING`, `COMPLETED`
-   **Constraints:**
    *   Unique constraint on `candidateId` and `jobId` combination (`@@unique([candidateId, jobId])`)
    *   Index on `candidateId` and `status` for efficient active conversation checks (`@@index([candidateId, status])`)

### Candidate

-   **Fields:** `id`, `phoneNumber`, `firstName`, `lastName`, `emailAddress`
-   **Relationships:** Has a one-to-many relationship with `Conversation`

For the full schema details, refer to the `prisma/schema.prisma` file in the project.
