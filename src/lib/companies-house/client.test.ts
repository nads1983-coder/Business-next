import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CompaniesHouseError,
  lookupCompanyProfile,
  normaliseCompanyNumber,
  validateCompanyNumber
} from "./client";

const originalKey = process.env.COMPANIES_HOUSE_API_KEY;

afterEach(() => {
  process.env.COMPANIES_HOUSE_API_KEY = originalKey;
  vi.restoreAllMocks();
});

describe("Companies House client", () => {
  it("normalises company numbers while preserving leading zeroes", () => {
    expect(normaliseCompanyNumber(" 0123 ab ")).toBe("0123AB");
    expect(validateCompanyNumber(" 00001234 ")).toBe("00001234");
  });

  it("rejects invalid company numbers before making a request", async () => {
    process.env.COMPANIES_HOUSE_API_KEY = "test-key";
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(lookupCompanyProfile("not a company number")).rejects.toMatchObject({
      code: "invalid_company_number"
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a successful company lookup", async () => {
    process.env.COMPANIES_HOUSE_API_KEY = "test-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        company_name: "DEMO LIMITED",
        company_number: "01234567"
      })
    } as Response);

    await expect(lookupCompanyProfile("01234567")).resolves.toMatchObject({
      company_name: "DEMO LIMITED",
      company_number: "01234567"
    });
  });

  it("maps not found, rate limited and API failures safely", async () => {
    process.env.COMPANIES_HOUSE_API_KEY = "test-key";
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    fetchSpy.mockResolvedValueOnce({ ok: false, status: 404 } as Response);
    await expect(lookupCompanyProfile("01234567")).rejects.toMatchObject({ code: "not_found" });

    fetchSpy.mockResolvedValueOnce({ ok: false, status: 429 } as Response);
    await expect(lookupCompanyProfile("01234567")).rejects.toMatchObject({ code: "rate_limited" });

    fetchSpy.mockResolvedValueOnce({ ok: false, status: 503 } as Response);
    await expect(lookupCompanyProfile("01234567")).rejects.toMatchObject({ code: "unavailable" });
  });

  it("fails safely when the server-side API key is missing", async () => {
    delete process.env.COMPANIES_HOUSE_API_KEY;

    await expect(lookupCompanyProfile("01234567")).rejects.toBeInstanceOf(CompaniesHouseError);
    await expect(lookupCompanyProfile("01234567")).rejects.toMatchObject({ code: "missing_api_key" });
  });
});
