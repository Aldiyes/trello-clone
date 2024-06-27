import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!userId || !orgId) {
    return new NextResponse("Organization not selected", { status: 401 });
  }

  const { entityId, entityType, entityTitle, action } = await req.json();
  try {
    const createAuditLog = await db.auditLog.create({
      data: {
        orgId,
        entityId,
        entityTitle,
        entityType,
        action,
        userId: user.id,
        userImage: user?.imageUrl,
        userName: user?.firstName + " " + user?.lastName,
      },
    });

    return new NextResponse(JSON.stringify(createAuditLog));
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const logs = await db.auditLog.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!logs) {
      return new NextResponse("Audit log does not exists in database", {
        status: 404,
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch audit logs ", error);
    return new NextResponse("Failed to fetch audit logs", { status: 500 });
  }
}
