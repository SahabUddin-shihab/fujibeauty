module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  // Integration tests need Docker (Testcontainers) and take much longer —
  // excluded from the default `npm test` smoke run, run explicitly via
  // `npm run test:integration`.
  testPathIgnorePatterns: ["<rootDir>/tests/integration/"],
};
