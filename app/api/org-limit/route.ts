import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

// ! GET ORG_LIMIT BY ORG_ID
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
    const getOrgLimit = await db.orgLimit.findUnique({
      where: {
        orgId,
      },
    });

    if (!getOrgLimit) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(getOrgLimit);
  } catch (error) {
    return new NextResponse("Failed to fetch org-limit", { status: 500 });
  }
}

// ! CREATE NEW ORG_LIMIT
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
    const { count } = await req.json();
    if (!count) {
      return new NextResponse("Invalid body", { status: 400 });
    }
    const createOrgLimit = await db.orgLimit.create({
      data: {
        orgId,
        count,
      },
    });

    return NextResponse.json(createOrgLimit);
  } catch (error) {
    return new NextResponse("Failed to create org-limit", { status: 500 });
  }
}

// ! UPDATE ORG_LIMIT
export async function PATCH(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  try {
    const { count } = await req.json();
    if (!count) {
      return new NextResponse("Invalid Body", { status: 400 });
    }

    const updateOrgLimit = await db.orgLimit.update({
      where: {
        orgId,
      },
      data: {
        count,
      },
    });

    return NextResponse.json(updateOrgLimit);
  } catch (error) {
    return new NextResponse("Failed to update org-limit", { status: 500 });
  }
}

// ! DELETE ORG_LIMIT
export async function DELETE(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  try {
    const deleteOrgLimit = await db.orgLimit.delete({
      where: {
        orgId,
      },
    });

    return NextResponse.json(deleteOrgLimit);
  } catch (error) {
    return new NextResponse("Failed to delete org-limit", { status: 500 });
  }
}
