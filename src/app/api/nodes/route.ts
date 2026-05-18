import { authOptions } from "@/lib/auth";
import { listNodes } from "@/services/NodeService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid session." },
        { status: 401 } 
      )
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const nodes = await listNodes(userId, type);

    return NextResponse.json(
      {message: `Retrived all the nodes for user id of ${userId} and type ${type}`, data: nodes},
      {status: 200}
    )

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {message: 'An error occurred while retriving nodes: ' + error.message},
        {status: 500}
      )
    } else {
      return NextResponse.json(
        {message: 'An unexpected error occurred' + error},
        {status: 500}
      )
    }
  }
}