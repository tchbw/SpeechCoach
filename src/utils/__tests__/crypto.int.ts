import { createSaltedHash } from "@/utils/crypto";

describe(`src/utils/crypto`, () => {
  describe(`createSaltedHash`, () => {
    it(`should not equal the input`, () => {
      expect(createSaltedHash(`test`, `test`)).not.toBe(`test`);
    });
  });
});
