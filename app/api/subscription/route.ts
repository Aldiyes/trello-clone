import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

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
    const orgSubscription = await db.orgSubscription.findUnique({
      where: {
        orgId,
      },
      select: {
        stripeCustomerId: true,
        stripePriceId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!orgSubscription) {
      return new NextResponse("No subscription found", { status: 404 });
    }

    return NextResponse.json(orgSubscription);
  } catch (error) {
    return new NextResponse("Failed to fetch organization subscription", {
      status: 500,
    });
  }
}
