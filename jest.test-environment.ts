import type { EnvironmentContext } from "@jest/environment";
import type { JestEnvironmentConfig } from "@jest/environment";
import { randomUUID } from "crypto";
import NodeEnvironment from "jest-environment-node";

declare global {
  const JEST_TEST_PATH: string;
  const JEST_TEST_ID: string;
}

class TestEnvironment extends NodeEnvironment {
  testPath: string;
  testId: string;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.testPath = context.testPath;
    this.testId = `test_${randomUUID()}`;
  }

  async setup() {
    await super.setup();
    this.global.JEST_TEST_PATH = this.testPath;
    this.global.JEST_TEST_ID = this.testId;
  }

  async teardown() {
    return super.teardown();
  }
}

module.exports = TestEnvironment;
