import { createApi } from "unsplash-js";

import { NEXT_PUBLIC_UNSPLASH_ACCESS_KEY } from "@/data/constants";

export const unsplash = createApi({
  accessKey: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
  fetch: fetch,
});
