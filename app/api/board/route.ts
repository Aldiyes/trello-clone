import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

// ! CREATE NEW BOARD
export async function POST(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  try {
    const { title, image } = await req.json();

    const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
      image.split("|");

    if (
      !imageId ||
      !imageThumbUrl ||
      !imageFullUrl ||
      !imageLinkHTML ||
      !imageUserName
    ) {
      return new NextResponse("Missing fields, Failed to create board", {
        status: 400,
      });
    }

    const createBoard = await db.board.create({
      data: {
        orgId,
        title,
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: createBoard.id,
          entityTitle: createBoard.title,
          entityType: ENTITY_TYPE.BOARD,
          action: ACTION.CREATE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(createBoard);
  } catch (error) {
    console.error("Failed to create board ", error);
    return new NextResponse("Failed to create board", { status: 500 });
  }
}

// ! GET ALL BOARD
export async function GET(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  try {
    const boards = await db.board.findMany({
      where: {
        orgId,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    if (!boards) {
      return new NextResponse("Board does not exists", { status: 204 });
    }

    return NextResponse.json(boards);
  } catch (error) {
    console.log("Failed to get boards ", error);
    return new NextResponse("Error to get boards", { status: 500 });
  }
}

// ! RENAME BOARD TITLE
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
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Invalid Board ID", { status: 422 });
  }

  const boardExists = await db.board.findUnique({
    where: {
      id,
      orgId,
    },
  });

  if (!boardExists) {
    return new NextResponse("Board does not exist", { status: 404 });
  }

  try {
    const { title } = await req.json();
    const updateBoard = await db.board.update({
      where: {
        id,
        orgId,
      },
      data: {
        title,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: updateBoard.id,
          entityTitle: updateBoard.title,
          entityType: ENTITY_TYPE.BOARD,
          action: ACTION.UPDATE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(updateBoard);
  } catch (error) {
    console.error("Failed to rename board ", error);
    return new NextResponse("Failed to rename board", { status: 500 });
  }
}

// ! DELETE BOARD
export async function DELETE(req: NextRequest) {
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
    return new NextResponse("Invalid Board ID", { status: 422 });
  }

  const boardExists = await db.board.findUnique({
    where: {
      id,
      orgId,
    },
  });

  if (!boardExists) {
    return new NextResponse("Board does not exist", { status: 404 });
  }
  try {
    const deleteBoard = await db.board.delete({
      where: {
        orgId,
        id,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: deleteBoard.id,
          entityTitle: deleteBoard.title,
          entityType: ENTITY_TYPE.BOARD,
          action: ACTION.DELETE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }
    return NextResponse.json(deleteBoard);
  } catch (error) {
    console.log("Failed to delete board ", error);
    return new NextResponse("Failed to delete board", { status: 500 });
  }
}
