require('dotenv').config({ path: '.env' });

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/postgres";

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
