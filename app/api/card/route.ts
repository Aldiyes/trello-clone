import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

// ! CREATE NEW CARD
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

  const listId = searchParams.get("listId");

  if (!listId) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  try {
    const list = await db.list.findUnique({
      where: {
        id: listId,
        board: {
          orgId,
        },
      },
    });

    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    const lastCard = await db.card.findFirst({
      where: {
        listId,
      },
      orderBy: {
        order: "desc",
      },
      select: { order: true },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const { title } = await req.json();

    const createNewCard = await db.card.create({
      data: {
        title,
        listId,
        order: newOrder,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: createNewCard.id,
          entityTitle: createNewCard.title,
          entityType: ENTITY_TYPE.CARD,
          action: ACTION.CREATE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(createNewCard);
  } catch (error) {
    return new NextResponse("Failed to create card", { status: 500 });
  }
}

// ! GET CARD BY ID
export async function GET(req: NextRequest) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const listId = searchParams.get("listId");
  if (!listId) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Invalid Card ID", { status: 422 });
  }

  try {
    const cardExists = await db.card.findUnique({
      where: {
        id,
        listId,
        list: {
          board: {
            orgId,
          },
        },
      },
      include: {
        list: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!cardExists) {
      return new NextResponse("Card does not exists in database", {
        status: 404,
      });
    }

    return NextResponse.json(cardExists);
  } catch (error) {
    console.error("Failed to fetch card ", error);
    return new NextResponse("Failed to fetch card", { status: 500 });
  }
}

// ! UPDATE TITLE AND DESC CARD
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

  const listId = searchParams.get("listId");
  if (!listId) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Invalid Card ID", { status: 422 });
  }

  try {
    const { title, description } = await req.json();

    const updatedCard = await db.card.update({
      where: {
        id,
        list: {
          board: {
            orgId,
          },
        },
      },
      data: {
        title,
        description,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: updatedCard.id,
          entityTitle: updatedCard.title,
          entityType: ENTITY_TYPE.CARD,
          action: ACTION.UPDATE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Failed to update card ", error);
    return new NextResponse("Failed to update card", { status: 500 });
  }
}

// ! DELETE CARD
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

  const listId = searchParams.get("listId");
  if (!listId) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Invalid Card ID", { status: 422 });
  }

  try {
    const cardExists = await db.card.findUnique({
      where: {
        id,
        listId,
        list: {
          board: {
            orgId,
          },
        },
      },
    });

    if (!cardExists) {
      return new NextResponse("Card does not exists in database", {
        status: 404,
      });
    }

    const deleteCard = await db.card.delete({
      where: {
        id,
        listId,
        list: {
          board: {
            orgId,
          },
        },
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: deleteCard.id,
          entityTitle: deleteCard.title,
          entityType: ENTITY_TYPE.CARD,
          action: ACTION.DELETE,
          userId: user.id,
          userImage: user?.imageUrl,
          userName: user?.firstName + " " + user?.lastName,
        },
      });
    } catch (error) {
      return new NextResponse("Failed to create log", { status: 400 });
    }

    return NextResponse.json(deleteCard);
  } catch (error) {
    console.error("Failed to delete card ", error);
    return new NextResponse("Failed to delete card", { status: 500 });
  }
}
