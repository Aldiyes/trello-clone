import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

// ! CREATE NEW LIST
export async function POST(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return new NextResponse("Invalid Board ID", { status: 422 });
  }

  const boardExists = await db.board.findUnique({
    where: {
      orgId,
      id: boardId,
    },
  });

  if (!boardExists) {
    return new NextResponse("Board does not exist in database", {
      status: 404,
    });
  }
  try {
    const values = await req.json();
    const lastList = await db.list.findFirst({
      where: {
        boardId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    const createdList = await db.list.create({
      data: {
        order: newOrder,
        ...values,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: createdList.id,
          entityTitle: createdList.title,
          entityType: ENTITY_TYPE.LIST,
          action: ACTION.CREATE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(createdList);
  } catch (error) {
    return new NextResponse("Failed to create list", { status: 500 });
  }
}

// ! GET ALL LIST IN BOARD_ID
export async function GET(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return new NextResponse("Invalid Board ID", { status: 422 });
  }

  try {
    const lists = await db.list.findMany({
      where: {
        boardId,
        board: {
          orgId,
        },
      },
      include: {
        cards: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!lists) {
      return new NextResponse("List does not exists", { status: 204 });
    }

    return NextResponse.json(lists);
  } catch (error) {
    return new NextResponse("Failed to fetch list", { status: 500 });
  }
}

// ! UPDATE LIST TITLE
export async function PATCH(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  const { searchParams } = new URL(req.url);

  const boardId = searchParams.get("boardId");
  if (!boardId) {
    return new NextResponse("Invalid Board ID", { status: 422 });
  }

  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  try {
    const { title } = await req.json();

    const list = await db.list.findFirst({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
    });

    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    const updateList = await db.list.update({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
      data: {
        title,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: updateList.id,
          entityTitle: updateList.title,
          entityType: ENTITY_TYPE.LIST,
          action: ACTION.UPDATE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(updateList);
  } catch (error) {
    console.error("Error updating list:", error);
    return new NextResponse("Error updating list", { status: 500 });
  }
}
