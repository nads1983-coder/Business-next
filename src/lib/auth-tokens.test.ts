import { describe, expect, it } from "vitest";
import { createPlainToken, hashToken } from "./auth-tokens";

describe("auth token helpers", () => {
  it("creates URL-safe tokens and stable hashes", () => {
    const token = createPlainToken();

    expect(token.length).toBeGreaterThan(30);
    expect(token).not.toContain("/");
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });
});
