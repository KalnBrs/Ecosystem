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
        name: {label: "Name", type: "name"}
      },
      /**
       * Validates the supplied credentials against the database.
       *
       * @param credentials - The raw credential fields from the sign-in form.
       * @returns An object containing the user's `id` and `email` on success,
       *   or `null` if validation fails.
       */
      async authorize(credentials): Promise<{ id: string; email: string } | null> {
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

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || "";
        session.user.id = (token.id as string) || "";
        session.user.name = (token.name as string) || "";
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login"
  }
};

export default NextAuth(authOptions);
