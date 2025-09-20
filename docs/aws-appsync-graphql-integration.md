# AWS AppSync and GraphQL Integration

This document details how to interact with the Popp AI system's GraphQL API via AWS AppSync. AWS AppSync is a managed service that makes it easy to develop GraphQL APIs, enabling applications to securely access, manipulate, and combine data from one or more data sources with a single network request.

## GraphQL Schema

The Popp AI system exposes a GraphQL API to allow flexible querying and manipulation of conversation and candidate data. A simplified example of the schema might look like this:

```graphql
type Candidate {
  id: ID!
  phoneNumber: String!
  firstName: String
  lastName: String
  emailAddress: String
  conversations: [Conversation]
}

type Conversation {
  id: ID!
  candidateId: ID!
  jobId: ID!
  status: ConversationStatus!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
  candidate: Candidate
}

enum ConversationStatus {
  CREATED
  ONGOING
  COMPLETED
}

type Query {
  getConversation(id: ID!): Conversation
  listConversations(status: ConversationStatus, limit: Int, nextToken: String): ConversationConnection
  getCandidate(id: ID!): Candidate
}

type Mutation {
  createConversation(input: CreateConversationInput!): Conversation
  updateConversationStatus(id: ID!, status: ConversationStatus!): Conversation
}

input CreateConversationInput {
  candidateId: ID!
  jobId: ID!
  status: ConversationStatus = CREATED
}

type ConversationConnection {
  items: [Conversation]
  nextToken: String
}
```

## API Endpoints

The AppSync API endpoint will be provided upon deployment. It typically follows the format:
`https://xxxxxxxxxxxx.appsync-api.aws-region.amazonaws.com/graphql`

You will also need the AWS region where the AppSync API is deployed.

## Authentication

AppSync supports multiple authentication modes. For integration with the Popp AI system, common methods include:

*   **API Key:** A simple, long-lived key for public APIs or development environments.
*   **AWS IAM:** Recommended for secure, fine-grained access control, especially for AWS services or applications running within AWS. You would configure IAM roles and policies to grant access to the AppSync API.
*   **Amazon Cognito User Pools:** If user authentication is managed via Cognito, this method allows users to authenticate and receive tokens to access the GraphQL API.

The specific authentication method will be configured during the AppSync API setup.

## Example Queries and Mutations

Here are some examples of how to interact with the GraphQL API:

### Get a single conversation

```graphql
query GetConversation {
  getConversation(id: "conv-123") {
    id
    status
    candidate {
      firstName
      lastName
    }
  }
}
```

### List conversations by status

```graphql
query ListCreatedConversations {
  listConversations(status: CREATED, limit: 10) {
    items {
      id
      jobId
      candidate {
        phoneNumber
      }
    }
    nextToken
  }
}
```

### Create a new conversation

```graphql
mutation CreateNewConversation {
  createConversation(input: { candidateId: "cand-456", jobId: "job-789" }) {
    id
    status
    createdAt
  }
}
```

### Update conversation status

```graphql
mutation UpdateConversation {
  updateConversationStatus(id: "conv-123", status: ONGOING) {
    id
    status
    updatedAt
  }
}
```
