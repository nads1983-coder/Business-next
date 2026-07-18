import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CompaniesHouseLookup } from "./companies-house-lookup";
import type { CompaniesHousePreview } from "@/lib/companies-house/sync";

const companiesHouse = vi.hoisted(() => ({
  lookupCompaniesHouseAction: vi.fn(),
  connectCompaniesHouseAction: vi.fn(),
  refreshCompaniesHouseAction: vi.fn()
}));

vi.mock("@/app/app/companies-house/actions", () => companiesHouse);

const preview: CompaniesHousePreview = {
  companyName: "NADINE PIERRE LTD",
  companyNumber: "17235708",
  companyStatus: "active",
  companyType: "ltd",
  incorporatedOn: "2026-05-21",
  accountsNextDue: "2028-02-21",
  confirmationNextDue: "2027-06-03",
  accountsOverdue: false,
  confirmationOverdue: false,
  registeredOffice: "128 City Road, London, United Kingdom",
  sicCodes: ["62012"],
  accountingReferenceDay: 21,
  accountingReferenceMonth: 2,
  snapshot: {}
};

describe("CompaniesHouseLookup", () => {
  beforeEach(() => {
    companiesHouse.lookupCompaniesHouseAction.mockReset();
    companiesHouse.connectCompaniesHouseAction.mockReset();
    companiesHouse.refreshCompaniesHouseAction.mockReset();
  });

  it("syncs the lookup input when the onboarding draft company number loads after mount", () => {
    const { rerender } = render(<CompaniesHouseLookup initialCompanyNumber="" onCompanyNumberChange={vi.fn()} />);

    expect(screen.getByLabelText("Company number")).toHaveValue("");

    rerender(<CompaniesHouseLookup initialCompanyNumber="17235708" onCompanyNumberChange={vi.fn()} />);

    expect(screen.getByLabelText("Company number")).toHaveValue("17235708");
  });

  it("keeps the onboarding company number answer in sync with lookup edits and lookup results", async () => {
    const onCompanyNumberChange = vi.fn();
    companiesHouse.lookupCompaniesHouseAction.mockResolvedValue({ ok: true, preview });

    function ControlledLookup() {
      const [companyNumber, setCompanyNumber] = useState("");
      return (
        <CompaniesHouseLookup
          initialCompanyNumber={companyNumber}
          onCompanyNumberChange={(nextCompanyNumber) => {
            onCompanyNumberChange(nextCompanyNumber);
            setCompanyNumber(nextCompanyNumber);
          }}
        />
      );
    }

    render(<ControlledLookup />);

    fireEvent.change(screen.getByLabelText("Company number"), { target: { value: "17235708" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => expect(companiesHouse.lookupCompaniesHouseAction).toHaveBeenCalledWith({ companyNumber: "17235708" }));
    await screen.findByText("NADINE PIERRE LTD");

    expect(onCompanyNumberChange).toHaveBeenCalledWith("17235708");
    expect(screen.getByLabelText("Company number")).toHaveValue("17235708");
  });

  it("shows a clear applied state after using preview details in onboarding", async () => {
    const onConfirm = vi.fn();
    companiesHouse.lookupCompaniesHouseAction.mockResolvedValue({ ok: true, preview });

    render(<CompaniesHouseLookup initialCompanyNumber="17235708" onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByText("NADINE PIERRE LTD");

    fireEvent.click(screen.getByRole("button", { name: "Use these details" }));

    expect(onConfirm).toHaveBeenCalledWith(preview);
    expect(screen.getByText("Companies House details added to this setup draft.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Details added" })).toBeDisabled();
  });
});
