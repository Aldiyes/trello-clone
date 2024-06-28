import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { ACTION, Card, ENTITY_TYPE } from "@prisma/client";

// ! COPY CARD
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

  const listId = searchParams.get("listId");
  if (!listId) {
    return new NextResponse("Invalid List ID", { status: 422 });
  }

  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Invalid Card ID", { status: 422 });
  }

  try {
    const cardToCopy = await db.card.findUnique({
      where: {
        id,
        listId,
        list: {
          board: {
            id: params.boardId,
            orgId,
          },
        },
      },
    });

    if (!cardToCopy) {
      return new NextResponse("Card does not exists in database", {
        status: 404,
      });
    }

    const lastCard = await db.card.findFirst({
      where: {
        listId: cardToCopy.listId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const copyCard = await db.card.create({
      data: {
        title: `${cardToCopy.title} - Copy`,
        description: cardToCopy.description,
        order: newOrder,
        listId: cardToCopy.listId,
      },
    });

    try {
      await db.auditLog.create({
        data: {
          orgId,
          entityId: copyCard.id,
          entityTitle: copyCard.title,
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

    return NextResponse.json(copyCard);
  } catch (error) {
    console.error("Failed to copy card ", error);
    return new NextResponse("Failed to copy card", { status: 500 });
  }
}

// ! REORDER CARD
export async function PATCH(
  req: NextRequest,
  { params }: { params: { boardId: string } },
) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const values = await req.json();

    const transaction = values.map((card: Card) =>
      db.card.update({
        where: {
          id: card.id!,
          list: {
            board: {
              id: params.boardId,
              orgId,
            },
          },
        },
        data: {
          order: card.order,
          listId: card.listId,
        },
      }),
    );
    const reorderCard = await db.$transaction(transaction);

    return NextResponse.json(reorderCard);
  } catch (error) {
    console.error("Failed to reorder card ", error);
    return new NextResponse("Failed to reorder card", { status: 500 });
  }
}
