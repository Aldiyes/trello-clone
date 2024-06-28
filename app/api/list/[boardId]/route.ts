import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ACTION, ENTITY_TYPE, List } from "@prisma/client";

import { db } from "@/lib/db";

// ! DELETE LIST
export async function DELETE(
  req: NextRequest,
  { params }: { params: { boardId: string } },
) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  try {
    const listExists = await db.list.findUnique({
      where: {
        id,
        boardId: params.boardId,
        board: {
          orgId,
        },
      },
    });

    if (!listExists) {
      return new NextResponse("List not found", { status: 404 });
    }

    const deleteList = await db.list.delete({
      where: {
        id,
        boardId: params.boardId,
        board: {
          orgId,
        },
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: deleteList.id,
          entityTitle: deleteList.title,
          entityType: ENTITY_TYPE.LIST,
          action: ACTION.DELETE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(deleteList);
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to delete list", { status: 500 });
  }
}

// ! COPY LIST
export async function POST(
  req: NextRequest,
  { params }: { params: { boardId: string } },
) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  try {
    const listToCopy = await db.list.findUnique({
      where: {
        id,
        boardId: params.boardId,
        board: {
          orgId,
        },
      },
      include: {
        cards: true,
      },
    });

    if (!listToCopy) {
      return new NextResponse("List not found", { status: 404 });
    }

    const lastList = await db.list.findFirst({
      where: {
        boardId: params.boardId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    const createCopyList = await db.list.create({
      data: {
        boardId: listToCopy.boardId,
        title: `${listToCopy.title} - Copy`,
        order: newOrder,
        cards: {
          createMany: {
            data: listToCopy.cards.map((card) => ({
              title: card.title,
              description: card.description,
              order: card.order,
            })),
          },
        },
      },
      include: {
        cards: true,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: createCopyList.id,
          entityTitle: createCopyList.title,
          entityType: ENTITY_TYPE.LIST,
          action: ACTION.DELETE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(createCopyList);
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to copy list", { status: 500 });
  }
}

// ! REORDER LIST
export async function PATCH(
  req: NextRequest,
  { params }: { params: { boardId: string } },
) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  try {
    const values: List[] = await req.json();

    const transaction = values.map((list) =>
      db.list.update({
        where: {
          id: list.id!,
          boardId: params.boardId,
          board: {
            orgId,
          },
        },
        data: {
          order: list.order,
        },
      }),
    );

    const updatedLists = await db.$transaction(transaction);

    return NextResponse.json(updatedLists, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to reorder list", { status: 500 });
  }
}
