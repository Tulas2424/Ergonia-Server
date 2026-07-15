import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const code = await prisma.qrCode.findUnique({
    where: { codeValue: 'ERG-QR-1784010635444' },
    include: { product: true }
  });
  console.log(code);
}
main().catch(console.error).finally(() => prisma.$disconnect());
