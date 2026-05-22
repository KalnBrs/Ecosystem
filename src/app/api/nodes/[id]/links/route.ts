import { authOptions } from "@/lib/auth";
import { createLink, deleteLink } from "@/services/NodeService";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";


const LinkBodySchema = z.object({
  targetNodeId: z.uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing or invalid session." }, { status: 401 });
    }

    const { targetNodeId } = LinkBodySchema.parse(await request.json());

    const links = await createLink(id, targetNodeId, userId);
    if (!links) {
      return NextResponse.json({ error: "Node not found." }, { status: 404 });
    }

    return NextResponse.json({ data: links }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Incorect body for wanted type" }, { status: 400 })
    } else if (error instanceof Error) {
      return NextResponse.json({ message: "An error occurred: " + error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing or invalid session." }, { status: 401 });
    }

    const { targetNodeId } = LinkBodySchema.parse(await request.json());

    const links = await deleteLink(id, targetNodeId, userId);
    if (!links) {
      return NextResponse.json({ error: "Node not found." }, { status: 404 });
    }

    return NextResponse.json({ data: links }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: "An error occurred: " + error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
