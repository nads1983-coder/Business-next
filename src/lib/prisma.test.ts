import { describe, expect, it } from "vitest";
import { normalizePostgresConnectionString } from "./prisma";

describe("normalizePostgresConnectionString", () => {
  it("keeps Neon SSL behavior explicit", () => {
    const normalized = normalizePostgresConnectionString(
      "postgresql://user:pass@example.neon.tech/neondb?sslmode=require"
    );

    expect(normalized).toContain("sslmode=verify-full");
  });

  it("leaves unparseable values unchanged", () => {
    expect(normalizePostgresConnectionString("not a url")).toBe("not a url");
  });
});
