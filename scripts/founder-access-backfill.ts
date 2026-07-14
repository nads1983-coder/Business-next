import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const mode = process.argv[2] ?? "preview";
const SOURCE = "stage-3-production-founder-backfill";
const REASON = "Existing production account protected during Stage 3 subscription access launch.";

function normalizePostgresConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");

    if (!sslMode || ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: normalizePostgresConnectionString(databaseUrl) })
});

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      entitlements: { where: { kind: "FOUNDER", source: SOURCE } }
    }
  });

  if (users.length !== 4) {
    throw new Error(`Expected exactly 4 existing production users, found ${users.length}.`);
  }

  return users;
}

async function preview() {
  const users = await getUsers();
  const rows = users.map((user) => ({
    userId: user.id,
    role: user.role,
    action: user.entitlements.length ? "preserve-existing-founder-access" : "grant-founder-access",
    source: SOURCE
  }));

  return {
    mode: "preview",
    expectedUserCount: 4,
    users: rows,
    totals: {
      grant: rows.filter((row) => row.action === "grant-founder-access").length,
      preserve: rows.filter((row) => row.action === "preserve-existing-founder-access").length
    }
  };
}

async function apply() {
  const before = await preview();
  const result = await prisma.$transaction(async (tx) => {
    let granted = 0;
    let preserved = 0;

    for (const user of before.users) {
      await tx.userEntitlement.upsert({
        where: {
          userId_kind_source: {
            userId: user.userId,
            kind: "FOUNDER",
            source: SOURCE
          }
        },
        create: {
          userId: user.userId,
          kind: "FOUNDER",
          status: "ACTIVE",
          reason: REASON,
          source: SOURCE
        },
        update: {
          status: "ACTIVE",
          reason: REASON,
          endsAt: null
        }
      });

      if (user.action === "grant-founder-access") {
        await tx.billingEvent.create({
          data: {
            userId: user.userId,
            type: "ENTITLEMENT_GRANTED",
            summary: "Founder access confirmed for existing production account.",
            metadata: { source: SOURCE }
          }
        });
        granted += 1;
      } else {
        preserved += 1;
      }
    }

    return { granted, preserved };
  });
  const after = await preview();

  return { mode: "apply", before: before.totals, result, after: after.totals };
}

async function main() {
  if (mode === "preview") {
    console.log(JSON.stringify(await preview(), null, 2));
  } else if (mode === "apply") {
    console.log(JSON.stringify(await apply(), null, 2));
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
