import { User } from "@/generated/prisma";
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

/** Fields required to create a new user account. */
type UserPayload = {
  name: string,
  email: string,
  passwordHash: string
}

/**
 * Creates a new user account after verifying uniqueness of name and email.
 *
 * @param user - The payload containing the new user's details.
 * @returns The created {@link User} record, or `null` if a user with the
 *   same name or email already exists.
 */
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

  const retUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash
    }
  }).catch((err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return null;
    }
    throw err;
  });

  return retUser;
}

export default signUp;