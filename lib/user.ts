import { prisma } from "@/lib/prisma";

export async function getOrCreateUser(telegramId: string | number) {
  const id = BigInt(telegramId);
  let user = await prisma.user.findUnique({ where: { telegramId: id } });
  if (!user) {
    user = await prisma.user.create({ data: { telegramId: id } });
  }
  return user;
}

export async function getUserByTelegramId(telegramId: string | number) {
  return prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
}
