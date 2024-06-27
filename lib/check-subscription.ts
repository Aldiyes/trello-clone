import { GET } from "./actions";

const DATE_IN_MS = 84_000_000;

export const checkSubscription = async () => {
  const orgSubscription = await GET("/subscription", {
    cache: "no-store",
    next: { tags: ["subs"] },
  });

  if (!orgSubscription) {
    return false;
  }

  const isValid =
    orgSubscription.stripePriceId &&
    orgSubscription.stripeCurrentPeriodEnd?.getTime() + DATE_IN_MS > Date.now();

  return !!isValid;
};
