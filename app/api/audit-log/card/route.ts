import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ENTITY_TYPE } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get("cardId");

  if (!cardId) {
    return new NextResponse("Invalid Crad ID", {
      status: 422,
    });
  }

  try {
    const auditLogs = await db.auditLog.findMany({
      where: {
        orgId,
        entityId: cardId,
        entityType: ENTITY_TYPE.CARD,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
