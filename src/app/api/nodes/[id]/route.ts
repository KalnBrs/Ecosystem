import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { deleteNode, getNodeById, updateNode } from "@/services/NodeService";
import { UpdateNodeSchema } from "@/lib/schemas/node.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid session." },
        { status: 401 } 
      )
    }

    const node = await getNodeById(id, userId);

    if (!node) {
      return NextResponse.json(
        {message: "Could not find the node for the user"},
        {status: 404}
      )
    }

    return NextResponse.json(
      {message: `Retrived the node with id of ${id} and a user id of ${userId}`, data: node},
      {status: 200}
    )

  } catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json(
          {message: `An error occurred while retriving a node` + error.message},
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const parsed = UpdateNodeSchema.parse(request.body);

    const { id } = await params;
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid session." },
        { status: 401 } 
      )
    }

    const updatedNode = await updateNode(id, userId, parsed);

    if (!updatedNode) {
      return NextResponse.json(
        {message: "Could not find the node for the user"},
        {status: 404}
      )
    }

    return NextResponse.json(
      {message: `Updated node with node id of ${id} with userId of ${userId}`, data: updatedNode},
      {status: 200}
    )

  } catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json(
          {message: `An error occurred while updating a node` + error.message},
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid session." },
        { status: 401 } 
      )
    }

    const deleted = deleteNode(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Could not find the node for the user" },
        { status: 404 } 
      )
    }

    return NextResponse.json(
      {message: `Successfully deleted the node with the id of ${id}`},
      {status: 204}
    )

  } catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json(
          {message: `An error occurred while updating a node` + error.message},
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

