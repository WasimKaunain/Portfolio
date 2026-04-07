import { prisma } from "../src/lib/prisma";

async function main() {
  // Seed projects (idempotent by slug)
  await prisma.project.upsert({
    where: { slug: "control-os" },
    update: {
      title: "Control OS",
      description: "Personal OS-like portfolio with terminal UX",
      tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    },
    create: {
      slug: "control-os",
      title: "Control OS",
      description: "Personal OS-like portfolio with terminal UX",
      tech: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    },
  });

  await prisma.project.upsert({
    where: { slug: "analytics" },
    update: {
      title: "Analytics Engine",
      description: "Privacy-first analytics and usage tracking",
      tech: ["Node", "Postgres", "Prisma"],
    },
    create: {
      slug: "analytics",
      title: "Analytics Engine",
      description: "Privacy-first analytics and usage tracking",
      tech: ["Node", "Postgres", "Prisma"],
    },
  });

  // Seed a sample billing record
  await prisma.billingRecord.create({
    data: {
      userId: "owner",
      usage: 12480,
      costCents: 492,
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
