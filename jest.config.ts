import nextJest from "next/jest";
import path from "path";

const createJestConfig = nextJest({
  dir: `./`,
});

export default createJestConfig({
  moduleDirectories: [`node_modules`, `src`],
  preset: `ts-jest`,
  setupFilesAfterEnv: [`./jest.setup.ts`],
  testEnvironment: path.join(__dirname, `./jest.test-environment.ts`),
  testPathIgnorePatterns: [
    `.next/`,
    // `__fixtures__/`,
  ],
  moduleNameMapper: {
    "^@app/(.*)$": `<rootDir>/src/$1`,
    "^@/(.*)$": `<rootDir>/src/$1`,
  },
});
