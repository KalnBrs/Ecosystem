import NextAuth, { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import { z } from "zod";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Validates the supplied credentials against the database.
       *
       * @param credentials - The raw credential fields from the sign-in form.
       * @returns An object containing the user's `id` and `email` on success,
       *   or `null` if validation fails.
       */
      async authorize(credentials): Promise<{ id: string; email: string; image: string | null } | null> {
        const parsed = z
          .object({ email: z.email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        });
        if (!user || !user.passwordHash) return null;

        const passwordsMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordsMatch) return null;

        return { id: user.id, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.id = user.id;
        token.image = (user as { image: string | null }).image ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || "";
        session.user.id = (token.id as string) || "";
        session.user.image = (token.image as string | null) ?? null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    // Extend session lifetime outside production so local/dev testing doesn't require frequent re-logins.
    maxAge: process.env.NODE_ENV === "production" ? 30 * 24 * 60 * 60 : 365 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login"
  }
};

export default NextAuth(authOptions);
