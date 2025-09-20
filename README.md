# Backend Coding Exercise Project Template

This project is a template for a backend system using TypeScript, Node.js, Express, PostgreSQL, and Prisma ORM. It
provides a foundation for building a robust API with database integration, perfect for handling job applications and
candidate information.

## Creating a New Project from This Template

To create a new project using this template:

1. Navigate to the GitHub
   repository: [https://github.com/AtlasNft/popp-backend-coding-exercise](https://github.com/AtlasNft/popp-backend-coding-exercise)

2. Click on the "Use this template" button near the top-right of the page.

3. Choose a name for your new repository and select where you want to create it.

4. Click "Create repository from template".

5. Once created, clone your new repository to your local machine:
   ```
   git clone https://github.com/<your-username>/<your-new-repo-name>.git
   cd <your-new-repo-name>
   ```

6. Follow the "Getting Started" instructions below to set up your new project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Docker and Docker Compose
- Git
- Node.js (v14 or later)
- Yarn

## Getting Started

1. If you haven't already, clone your repository:
   ```
   git clone https://github.com/<your-username>/<your-new-repo-name>.git
   cd <your-new-repo-name>
   ```

2. Install dependencies:
   ```
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
   Note: The `DATABASE_URL` format is `postgresql://username:password@host:port/database_name`

4. Start the PostgreSQL database using Docker:
   ```
   docker-compose up -d db
   ```

5. Run database migrations and generate Prisma client:
   ```
   yarn prisma:migrate:deploy
   ```

6. Start the development server:
   ```
   yarn dev
   ```

The application should now be running at `http://localhost:3000`. You can verify this by accessing the hello world
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
- `yarn dev`: Start the development server with hot-reloading
- `yarn build`: Build the project using Webpack
- `yarn build:start`: Build and start the Docker containers
- `yarn test`: Run the test suite
- `yarn test:watch`: Run tests in watch mode
- `yarn prisma:generate`: Generate Prisma client
- `yarn prisma:migrate`: Run Prisma migrations in development (also generates the client)
- `yarn prisma:migrate:deploy`: Run Prisma migrations in production (also generates the client)
- `yarn prisma:studio`: Open Prisma Studio for database management

## API Endpoints

1. Hello World
    - **URL:** `/api/hello`
    - **Method:** GET
    - **Response:** Returns a simple string

## Database Schema

The project uses Prisma ORM with a PostgreSQL database. Here's an overview of the main models:

### Conversation

- Fields: `id`, `candidateId`, `jobId`, `status`, `createdAt`, `updatedAt`
- Status can be: `CREATED`, `ONGOING`, `COMPLETED`
- Unique constraint on `candidateId` and `jobId` combination

### Candidate

- Fields: `id`, `phoneNumber`, `firstName`, `lastName`, `emailAddress`
- Has a one-to-many relationship with `Conversation`

For the full schema details, refer to the `prisma/schema.prisma` file in the project.

### Making Changes to the Schema

If you make changes to the `schema.prisma` file, follow these steps:

1. Update the `schema.prisma` file with your changes.
2. Run the migration command:
   ```
   yarn prisma:migrate
   ```
   This command will generate a new migration, apply it to your database, and generate the updated Prisma client.

## Development with Docker

If you prefer to run the entire application using Docker:

1. Build and start the Docker containers:
   ```
   yarn build:start
   ```

2. Run the database migrations:
   ```
   docker-compose exec app yarn prisma:migrate:deploy
   ```

The application will be available at `http://localhost:3000`, and the PostgreSQL database will be accessible on port
5432.

## Managing the PostgreSQL Volume

The PostgreSQL data is persisted in a Docker volume. If you need to delete this volume and start fresh, you can use the
following command:

```
docker volume remove <your-new-repo-name>_postgres-data
```

Note: This will delete all data in the database. Use with caution.

## Troubleshooting

- If you encounter connection issues with the database, ensure that the PostgreSQL container is running and that the
  `DATABASE_URL` in your `.env` file is correct.
- If you see Prisma-related errors, try running `yarn prisma:generate` to ensure your Prisma client is up-to-date with
  your schema.
- For Docker-related issues, ensure Docker is running on your machine and try rebuilding the containers with
  `docker-compose up --build`.

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
- Tests can be added to the `tests/` directory.
- The project uses Webpack for bundling, configured in `webpack.config.js`.
- Phone number validation now supports international formats and can be configured for specific countries.
- API key validation can be disabled via environment variables for testing and development.

## License

This project is licensed under the MIT License.