import { User } from "@/generated/prisma";
import prisma from "@/lib/prisma";

async function signUp(user: User): Promise<User | null> {
  const retUser: User | null = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  })

  return retUser;
}

export default signUp;