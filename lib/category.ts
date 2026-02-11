import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getOrCreateCategory(
  userId: string,
  name: string,
  type: TransactionType
) {
  const existing = await prisma.category.findUnique({
    where: {
      userId_name_type: { userId, name, type },
    },
  });
  if (existing) return existing;
  return prisma.category.create({
    data: { userId, name, type },
  });
}
