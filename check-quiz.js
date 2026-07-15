const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const q = await prisma.quiz.findUnique({ where: { id: 1 } });
  console.log("QUIZ:", q);
}
main().catch(console.error).finally(() => prisma.$disconnect());
