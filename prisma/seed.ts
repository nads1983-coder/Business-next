import { hash } from "bcryptjs";
import { getPrisma } from "../src/lib/prisma";
import { buildInitialTasks } from "../src/lib/task-engine";

const checkedAt = new Date("2026-07-13T00:00:00.000Z");

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
        title: "Running a limited company: your responsibilities",
        url: "https://www.gov.uk/running-a-limited-company",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for director responsibility and company accounts prompts."
      },
      {
        title: "File your confirmation statement with Companies House",
        url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for company details confirmation tasks."
      },
      {
        title: "Register for VAT",
        url: "https://www.gov.uk/register-for-vat",
        publisher: "GOV.UK",
        checkedAt,
        notes: "Used for VAT registration review prompts."
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
        key: "vat-registration-review",
        plainName: "Check whether VAT registration may be needed",
        description:
          "Review sales against current official VAT registration guidance. Business Next stores the source and checked date instead of hardcoding a permanent rule.",
        effectiveFrom: new Date("2026-04-01T00:00:00.000Z"),
        sourceUrl: "https://www.gov.uk/register-for-vat",
        checkedAt,
        metadata: {
          displayOnly: true,
          plainEnglishTerm: "Sales level where VAT registration may be needed"
        }
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
      update: {},
      create: {
        email: demo.email,
        name: demo.name,
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
            worksAlone: "YES",
            startedTradingOn: new Date("2026-04-06T00:00:00.000Z"),
            companyRegisteredOn:
              demo.businessType === "LIMITED_COMPANY"
                ? new Date("2026-04-10T00:00:00.000Z")
                : null,
            paysSelfThroughCompany:
              demo.businessType === "LIMITED_COMPANY" ? "NOT_SURE" : "NO",
            registeredForVat: "NOT_SURE",
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

    if (business.profile && business.tasks.length === 0) {
      await prisma.task.createMany({
        data: buildInitialTasks(business.profile).map((task) => ({
          businessId: business.id,
          ...task
        }))
      });
    }
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
