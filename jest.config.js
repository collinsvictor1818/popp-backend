console.log("Loading jest.config.js...");

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
