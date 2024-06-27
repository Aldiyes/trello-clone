import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
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
    const boardExists = await db.board.findUnique({
      where: {
        id: params.id,
        orgId,
      },
    });

    if (!boardExists) {
      return new NextResponse("Board does not exist", { status: 404 });
    }

    return NextResponse.json(boardExists);
  } catch (error) {
    console.error("Failed to fetch board ", error);
    return new NextResponse("Failed to fetch baord", { status: 500 });
  }
}
