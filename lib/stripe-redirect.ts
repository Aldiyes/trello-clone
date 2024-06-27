import { API_URL } from "@/data/constants/api";
import { auth } from "@clerk/nextjs/server";
import { errorMessage } from "./utils";

export const stripeRedirect = async () => {
  const { getToken } = auth();

  const res = await fetch(`${API_URL}/stripe`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  return res.ok ? await res.json() : errorMessage(await res.text());
};
