import { User } from "@/generated/prisma";
import prisma from "@/lib/prisma";

type UserPayload = {
  name: string,
  email: string,
  passwordHash: string
}

async function signUp(user: UserPayload): Promise<User | null> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { name: user.name },
        { email: user.email },
      ],
    },
  });

  if (existing) {
    return null;
  }

  const retUser: User | null = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash
    }
  })

  return retUser;
}

export default signUp;