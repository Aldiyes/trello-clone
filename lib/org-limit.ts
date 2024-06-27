"use server";

import { MAX_FREE_BOARDS } from "@/data/constants/boards";
import { GET, PATCH, POST } from "./actions";

export const hasAvailableCount = async () => {
  const orgLimit = await GET(`/org-limit`, {
    cache: "no-store",
    next: { tags: ["org-limit"] },
  });

  if (!orgLimit || orgLimit.count < MAX_FREE_BOARDS) {
    return true;
  } else {
    return false;
  }
};

export const getAvailableCount = async () => {
  const orgLimit = await GET(`/org-limit`, {
    cache: "no-store",
    next: { tags: ["org-limit"] },
  });

  return orgLimit ? orgLimit.count : 0;
};
