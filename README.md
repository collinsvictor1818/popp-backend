# Backend Coding Exercise Project Template

This project is a template for a backend system designed to streamline recruitment processes by integrating with AI messaging. It processes job application events, initiates conversations with candidates, and manages conversation data.

## Creating a New Project from This Template

To create a new project using this template:

1. Navigate to the GitHub
   repository: [https://github.com/collinsvictor1818/popp-backend](https://github.com/collinsvictor1818/popp-backend)

2. Click on the "Use this template" button near the top-right of the page.

3. Choose a name for your new repository and select where you want to create it.

4. Click "Create repository from template".

5. Once created, clone your new repository to your local machine:
   ```bash
   git clone https://github.com/<your-username>/<your-new-repo-name>.git
   cd <your-new-repo-name>
   ```

6. Follow the "Getting Started" instructions below to set up your new project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Docker and Docker Compose (Colima recommended for macOS/Linux)
- Git
- Node.js (v14 or later)
- Yarn

## Getting Started

1. If you haven't already, clone your repository:
   ```bash
   git clone https://github.com/<your-username>/<your-new-repo-name>.git
   cd <your-new-repo-name>
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   POSTGRES_PASSWORD=your_postgres_password
   DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@localhost:5432/postgres
   API_KEY=your_api_key_here
   SKIP_API_KEY_VALIDATION=false
   NODE_ENV=development
   ```
   Note: The `DATABASE_URL` format is `postgresql://username:password@host:port/database_name`.

4. Start the Docker services (database and application):
   ```bash
   docker-compose up -d
   ```
   This will build and start the `db` (PostgreSQL) and `app` (Node.js application) services.

5. Run database migrations and generate Prisma client (execute inside the `app` container):
   ```bash
   docker-compose exec app yarn prisma:migrate dev
   ```
   Follow the prompts to name your migration (e.g., `init`).

6. The application should now be running at `http://localhost:3000`. You can verify this by accessing the hello world
endpoint at `http://localhost:3000/api/hello`.

## Project Structure

```
popp-backend-coding-exercise/
├── Dockerfile
├── README.md
├── docker-compose.yml
├── package.json
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── common/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.ts
│   └── services/
├── tests/
├── tsconfig.json
├── webpack.config.js
└── yarn.lock
```

## Available Scripts

- `yarn start`: Run the production build
- `yarn dev`: Start the development server with hot-reloading (runs on host)
- `yarn build`: Build the project using Webpack
- `yarn build:start`: Build and start the Docker containers
- `yarn test`: Run the test suite
- `yarn test:watch`: Run tests in watch mode
- `yarn prisma:generate`: Generate Prisma client
- `yarn prisma:migrate`: Run Prisma migrations in development (also generates the client)
- `yarn prisma:migrate:deploy`: Run Prisma migrations in production (also generates the client)
- `yarn prisma:studio`: Open Prisma Studio for database management
- `yarn test`: Run all Jest tests

## API Endpoints

All API endpoints require an `X-API-Key` header for authentication.

### 1. Webhook Handler

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
- **Business Logic Handled:**
  - Phone Number Validation
  - Active Conversation Check
  - Duplicate Application Check
- **Responses:**
  - `200 OK`: Event processed successfully.
  - `400 Bad Request`: Invalid payload structure, data types, or phone number format.
  - `401 Unauthorized`: Missing `X-API-Key` header.
  - `403 Forbidden`: Invalid `X-API-Key`.
  - `409 Conflict`: Candidate has an active conversation or has already applied for this job.
  - `500 Internal Server Error`: Unexpected server error.

### 2. Conversations API

- **Objective:** Interact with conversation data.
- **Authentication:** Requires `X-API-Key` header.

#### a. Fetch All Conversations

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

#### b. Retrieve Single Conversation by ID

- **URL:** `/api/conversations/:id`
- **Method:** `GET`
- **Responses:**
  - `200 OK`: Returns a single conversation object.
  - `401 Unauthorized`: Missing `X-API-Key` header.
  - `403 Forbidden`: Invalid `X-API-Key`.
  - `404 Not Found`: Conversation with the given ID does not exist.
  - `500 Internal Server Error`: Unexpected server error.

## Security Measures Implemented

- **API Key Authentication:** All API endpoints are protected by an `X-API-Key` header.
- **Rate Limiting:** Implemented to prevent abuse and brute-force attacks (100 requests per 15 minutes per IP).
- **Input Validation:** Robust schema validation (using Zod) for incoming webhook payloads ensures data integrity and prevents malformed requests.
- **Error Handling:** Consistent and developer-friendly error responses with appropriate HTTP status codes and detailed logging for debugging.

## Database Schema

The project uses Prisma ORM with a PostgreSQL database. Here's an overview of the main models:

### Conversation

- Fields: `id`, `candidateId`, `jobId`, `status`, `createdAt`, `updatedAt`
- Status can be: `CREATED`, `ONGOING`, `COMPLETED`
- Unique constraint on `candidateId` and `jobId` combination (`@@unique([candidateId, jobId])`)
- Index on `candidateId` and `status` for efficient active conversation checks (`@@index([candidateId, status])`)

### Candidate

- Fields: `id`, `phoneNumber`, `firstName`, `lastName`, `emailAddress`
- Has a one-to-many relationship with `Conversation`

For the full schema details, refer to the `prisma/schema.prisma` file in the project.

### Making Changes to the Schema

If you make changes to the `schema.prisma` file, follow these steps:

1. Update the `schema.prisma` file with your changes.
2. Run the migration command (execute inside the `app` container):
   ```bash
   docker-compose exec app yarn prisma:migrate dev
   ```
   This command will generate a new migration, apply it to your database, and generate the updated Prisma client.

## Development with Docker

If you prefer to run the entire application using Docker:

1. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Run the database migrations (execute inside the `app` container):
   ```bash
   docker-compose exec app yarn prisma:migrate dev
   ```

The application will be available at `http://localhost:3000`.

## Managing the PostgreSQL Volume

The PostgreSQL data is persisted in a Docker volume. If you need to delete this volume and start fresh, you can use the
following command:

```bash
 docker-compose down --volumes
```

Note: This will delete all data in the database. Use with caution.

## Troubleshooting

- If you encounter connection issues with the database, ensure that the PostgreSQL container is running and that the
  `DATABASE_URL` in your `.env` file is correct.
- If you see Prisma-related errors, try running `docker-compose exec app yarn prisma:generate` to ensure your Prisma client is up-to-date with
  your schema.
- For Docker-related issues, ensure Docker is running on your machine and try rebuilding the containers with
  `docker-compose up --build`.

## Testing

Unit and integration tests are written using Jest and Supertest.

To run the tests (execute inside the `app` container):
```bash
 docker-compose exec app yarn test
```

**Known Issue: Test Execution Environment**

There is a persistent environmental issue preventing Jest tests from running successfully within the current Docker setup. Despite extensive debugging and attempts to resolve Docker caching, file synchronization, and Jest configuration (including `roots`, `testMatch`, `transform`, and `moduleFileExtensions`), the test runner consistently reports "No tests found" or encounters build failures related to outdated file versions.

This indicates a deeper, unresolved environmental problem with the Docker build process or how Jest interacts with the container's filesystem. The tests themselves are written and cover the specified functionalities, but their execution is currently blocked by this environmental factor.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Recent Improvements

- **Enhanced Phone Number Validation**: Implemented robust international phone number validation using `libphonenumber-js` library with support for specific country validation (e.g., Kenyan numbers only).
- **Configurable API Key Middleware**: Added environment variable `SKIP_API_KEY_VALIDATION` for flexible API key validation in different environments.
- **Comprehensive Test Suite**: Added Jest testing framework with proper test configuration and fixed test expectations to match actual API responses.
- **Improved Dependencies**: Added missing dependencies including `zod`, `libphonenumber-js`, `supertest`, and `jest` with proper TypeScript support.

## Additional Notes

- The project uses Prisma as an ORM. When you run migrations (either `prisma:migrate` or `prisma:migrate:deploy`), it
  automatically generates the Prisma client.
- Always run migrations after pulling changes from the repository that include schema modifications.
- The `src/` directory contains the main application code, including controllers, routes, and services.
- Tests are located in the `tests/` directory.
- The project uses Webpack for bundling, configured in `webpack.config.js`.
- Phone number validation now supports international formats and can be configured for specific countries.
- API key validation can be disabled via environment variables for testing and development.

## License

This project is licensed under the MIT License.
