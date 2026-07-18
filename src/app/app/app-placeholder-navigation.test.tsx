import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(async () => ({ id: "user_1" })),
  findUnique: vi.fn(async () => ({ role: "USER" })),
  requireProductAccess: vi.fn(async () => ({
    user: { id: "user_1" },
    access: { allowed: true, source: "FOUNDER", message: "Founder access is active." }
  }))
}));

vi.mock("@/lib/session", () => ({
  requireUser: mocks.requireUser
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    user: {
      findUnique: mocks.findUnique
    }
  })
}));

vi.mock("@/lib/billing", () => ({
  requireProductAccess: mocks.requireProductAccess
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
  usePathname: () => "/app"
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn()
}));

describe("authenticated placeholder navigation", () => {
  beforeEach(() => {
    mocks.requireUser.mockClear();
    mocks.findUnique.mockClear();
  });

  it("marks protected placeholder navigation items as coming soon", async () => {
    const { default: AppLayout } = await import("./layout");

    render(await AppLayout({ children: <div>Private app content</div> }));

    const moneyStatus = screen.getByLabelText("Money status: Coming soon");
    const askStatus = screen.getByLabelText("Ask status: Coming soon");
    const calendarStatus = screen.getByLabelText("Calendar status: Coming soon");

    expect(moneyStatus).toHaveTextContent("Coming soon");
    expect(askStatus).toHaveTextContent("Coming soon");
    expect(calendarStatus).toHaveTextContent("Coming soon");
    expect(moneyStatus.closest("a")).toHaveAttribute("href", "/app/money");
    expect(askStatus.closest("a")).toHaveAttribute("href", "/app/ask");
    expect(calendarStatus.closest("a")).toHaveAttribute("href", "/app/calendar");
  });
});

describe("protected placeholder pages", () => {
  beforeEach(() => {
    mocks.requireProductAccess.mockClear();
  });

  it("keeps the money route gated and renders its feature-preview state", async () => {
    const { default: MoneyPage } = await import("./money/page");

    render(await MoneyPage());

    expect(mocks.requireProductAccess).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 1, name: "Money tools are coming soon" })).toBeInTheDocument();
    expect(screen.getByText(/upcoming financial obligations/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review my tasks" })).toHaveAttribute("href", "/app/tasks");
  });

  it("keeps the ask route gated and renders its feature-preview state", async () => {
    const { default: AskPage } = await import("./ask/page");

    render(await AskPage());

    expect(mocks.requireProductAccess).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 1, name: "Ask Business Sorted is coming soon" })).toBeInTheDocument();
    expect(screen.getByText(/will not replace professional legal, accounting or tax advice/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open my task list" })).toHaveAttribute("href", "/app/tasks");
  });

  it("keeps the calendar route gated and renders its feature-preview state", async () => {
    const { default: CalendarPage } = await import("./calendar/page");

    render(await CalendarPage());

    expect(mocks.requireProductAccess).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { level: 1, name: "Calendar view is coming soon" })).toBeInTheDocument();
    expect(screen.getByText(/visual view of upcoming deadlines and tasks/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute("href", "/app");
  });
});
