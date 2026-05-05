import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "./auth";

/**
 * Retrieves the current server-side session.
 *
 * @returns The active {@link Session} object.
 * @throws {Error} If no session exists for the current request.
 */
async function generateSession(): Promise<Session>  {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) throw new Error();
  return session;
}

export default generateSession;