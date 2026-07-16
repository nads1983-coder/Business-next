import "server-only";

export type CompaniesHouseErrorCode =
  | "missing_api_key"
  | "invalid_company_number"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "timeout";

export class CompaniesHouseError extends Error {
  constructor(
    public code: CompaniesHouseErrorCode,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "CompaniesHouseError";
  }
}

export type CompaniesHouseCompanyProfile = {
  company_name: string;
  company_number: string;
  company_status?: string;
  type?: string;
  date_of_creation?: string;
  sic_codes?: string[];
  registered_office_address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  accounts?: {
    accounting_reference_date?: {
      day?: string;
      month?: string;
    };
    next_due?: string;
    overdue?: boolean;
  };
  confirmation_statement?: {
    next_due?: string;
    overdue?: boolean;
  };
};

export type CompaniesHouseFilingItem = {
  category?: string;
  type?: string;
  date?: string;
  description?: string;
  description_values?: Record<string, string>;
};

export type CompaniesHouseFilingHistory = {
  items?: CompaniesHouseFilingItem[];
};

const baseUrl = "https://api.company-information.service.gov.uk";
const timeoutMs = 8000;

export function normaliseCompanyNumber(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function validateCompanyNumber(value: string) {
  const normalised = normaliseCompanyNumber(value);
  return /^[A-Z0-9]{2,8}$/.test(normalised) ? normalised : null;
}

function authHeader(apiKey: string) {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

async function requestCompaniesHouse<T>(path: string, apiKey = process.env.COMPANIES_HOUSE_API_KEY) {
  if (!apiKey) {
    throw new CompaniesHouseError("missing_api_key", "Companies House lookup is not configured yet.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        authorization: authHeader(apiKey),
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (response.status === 404) {
      throw new CompaniesHouseError("not_found", "We could not find that company number.", response.status);
    }
    if (response.status === 429) {
      throw new CompaniesHouseError("rate_limited", "Companies House is receiving too many requests. Please try again shortly.", response.status);
    }
    if (!response.ok) {
      throw new CompaniesHouseError("unavailable", "Companies House is unavailable right now.", response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof CompaniesHouseError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new CompaniesHouseError("timeout", "Companies House did not respond in time.");
    }
    throw new CompaniesHouseError("unavailable", "Companies House is unavailable right now.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupCompanyProfile(companyNumber: string) {
  const normalised = validateCompanyNumber(companyNumber);
  if (!normalised) {
    throw new CompaniesHouseError("invalid_company_number", "Enter a valid company number.");
  }

  return requestCompaniesHouse<CompaniesHouseCompanyProfile>(`/company/${encodeURIComponent(normalised)}`);
}

export async function lookupCompanyFilingHistory(companyNumber: string) {
  const normalised = validateCompanyNumber(companyNumber);
  if (!normalised) {
    throw new CompaniesHouseError("invalid_company_number", "Enter a valid company number.");
  }

  return requestCompaniesHouse<CompaniesHouseFilingHistory>(
    `/company/${encodeURIComponent(normalised)}/filing-history?items_per_page=50`
  );
}
