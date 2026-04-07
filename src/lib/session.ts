import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Session } from "inspector/promises";

async function generateSession(): Promise<Session | Error>  {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) throw new Error();
  return session;
}

export default generateSession;