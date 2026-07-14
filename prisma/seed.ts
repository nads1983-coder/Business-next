import { hash } from "bcryptjs";
import { getPrisma } from "../src/lib/prisma";
import { syncBusinessTasks, RULE_CHECKED_AT } from "../src/lib/task-engine";

const checkedAt = RULE_CHECKED_AT;

async function main() {
  const prisma = getPrisma();

  await prisma.officialSource.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Become a sole trader",
        url: "https://www.gov.uk/become-sole-trader",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for plain-English record keeping and Self Assessment prompts."
      },
      {
        title: "Accounts and tax returns for private limited companies",
        url: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for limited-company accounts, Corporation Tax and Company Tax Return dates."
      },
      {
        title: "File your confirmation statement with Companies House",
        url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for company details confirmation tasks."
      },
      {
        title: "Sending a VAT Return",
        url: "https://www.gov.uk/submit-vat-return",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for VAT Return deadline calculation."
      },
      {
        title: "Register as an employer",
        url: "https://www.gov.uk/register-employer",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for PAYE employer registration prompts."
      }
    ]
  });

  await prisma.glossaryTerm.createMany({
    skipDuplicates: true,
    data: [
      {
        officialTerm: "Confirmation Statement",
        simpleExplanation: "A yearly check that your company details are still correct.",
        whyItMatters: "Companies House can use it to keep the public company record up to date.",
        whereYouMaySeeIt: "Companies House letters, emails and online filing pages.",
        example: "You confirm your company address and director details.",
        officialSourceUrl:
          "https://www.gov.uk/file-your-confirmation-statement-with-companies-house"
      },
      {
        officialTerm: "VAT threshold",
        simpleExplanation:
          "The sales level at which VAT registration may become compulsory.",
        whyItMatters:
          "If your sales reach the official level, you may need to register for VAT.",
        whereYouMaySeeIt: "HMRC VAT guidance and accountant emails.",
        example: "You check your sales for the last 12 months.",
        officialSourceUrl: "https://www.gov.uk/register-for-vat"
      }
    ]
  });

  await prisma.complianceRule.createMany({
    skipDuplicates: true,
    data: [
      {
        key: "limited-company-first-accounts",
        plainName: "File first company accounts",
        description:
          "First private limited company accounts are due 21 months after Companies House registration.",
        effectiveFrom: new Date("2026-07-14T00:00:00.000Z"),
        sourceUrl: "https://www.gov.uk/prepare-file-annual-accounts-for-limited-company",
        checkedAt,
        metadata: {
          ruleVersion: "stage-2-2026-07-14"
        }
      },
      {
        key: "sole-trader-self-assessment-return",
        plainName: "Send online Self Assessment tax return",
        description:
          "Online Self Assessment tax returns are due by 31 January after the relevant tax year.",
        effectiveFrom: new Date("2026-07-14T00:00:00.000Z"),
        sourceUrl: "https://www.gov.uk/self-assessment-tax-returns/deadlines",
        checkedAt,
        metadata: { ruleVersion: "stage-2-2026-07-14" }
      },
      {
        key: "vat-return",
        plainName: "Send VAT Return",
        description:
          "VAT Returns are usually due one calendar month and 7 days after the VAT accounting period ends.",
        effectiveFrom: new Date("2026-07-14T00:00:00.000Z"),
        sourceUrl: "https://www.gov.uk/submit-vat-return",
        checkedAt,
        metadata: { ruleVersion: "stage-2-2026-07-14" }
      }
    ]
  });

  const passwordHash = await hash("BusinessNextDemo1!", 12);

  for (const demo of [
    {
      email: "sole-trader@example.com",
      name: "Sole Trader Demo",
      businessName: "Demo sole trader",
      businessType: "SOLE_TRADER" as const
    },
    {
      email: "limited-company@example.com",
      name: "Limited Company Demo",
      businessName: "Demo limited company",
      businessType: "LIMITED_COMPANY" as const
    }
  ]) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        role: demo.email === "limited-company@example.com" ? "ADMIN" : "USER"
      },
      create: {
        email: demo.email,
        name: demo.name,
        role: demo.email === "limited-company@example.com" ? "ADMIN" : "USER",
        passwordHash,
        emailVerified: new Date(),
        subscriptions: {
          create: { tier: "FREE" }
        }
      }
    });

    const business = await prisma.business.upsert({
      where: {
        id: `${demo.businessType.toLowerCase()}-demo`
      },
      update: {},
      create: {
        id: `${demo.businessType.toLowerCase()}-demo`,
        userId: user.id,
        name: demo.businessName,
        type: demo.businessType,
        profile: {
          create: {
            businessType: demo.businessType,
            legalBusinessName: demo.businessName,
            worksAlone: "YES",
            employsPeople: "NO",
            startedTradingOn: new Date("2026-04-06T00:00:00.000Z"),
            companyRegisteredOn:
              demo.businessType === "LIMITED_COMPANY"
                ? new Date("2026-04-10T00:00:00.000Z")
                : null,
            firstAccountingPeriodEnd:
              demo.businessType === "LIMITED_COMPANY"
                ? new Date("2027-04-30T00:00:00.000Z")
                : null,
            paysSelfThroughCompany:
              demo.businessType === "LIMITED_COMPANY" ? "NOT_SURE" : "NO",
            registeredForVat: "NO",
            usesAccountant: "NO",
            businessYearEndMonth: 3,
            wantsEmailReminders: true,
            salesSoFarPence: 1800000,
            costsSoFarPence: 420000,
            onboardingCompletedAt: new Date()
          }
        }
      },
      include: {
        profile: true,
        tasks: true
      }
    });

    await syncBusinessTasks(business.id, user.id);
  }
}

main()
  .then(async () => {
    await getPrisma().$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await getPrisma().$disconnect();
    process.exit(1);
  });
