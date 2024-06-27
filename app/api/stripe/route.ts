import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { userId, orgId } = auth();
  const user = await currentUser();

  if (!user || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!orgId) {
    return new NextResponse("Organization not selected", { status: 400 });
  }

  const settingsUrl = absoluteUrl(`/organization/${orgId}`);

  try {
    let url = "";
    const orgSubs = await db.orgSubscription.findUnique({
      where: {
        orgId,
      },
    });

    if (orgSubs && orgSubs.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: orgSubs.stripeCustomerId,
        return_url: settingsUrl,
      });

      url = stripeSession.url;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.emailAddresses[0].emailAddress as string,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Next Trello Pro",
                description: "unlimited boards for your organization",
              },
              unit_amount: 2000,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orgId: orgId as string,
        },
      });

      url = stripeSession.url ?? "";
    }

    return NextResponse.json(url);
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
