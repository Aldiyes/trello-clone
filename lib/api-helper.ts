import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { API_URL } from "@/data/constants/api";

import { errorMessage } from "@/lib/utils";

type RequestMethod = "POST" | "GET" | "PATCH" | "DELETE";

class API {
  private async request(
    method: RequestMethod,
    url: string,
    data?: any,
    options: RequestInit = {},
    tag?: string,
  ) {
    const { getToken } = auth();

    const defaultOptions: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const res = await fetch(`${API_URL}${url}`, mergedOptions);

    if (res.ok) {
      if (res.status === 204) return null;
      if (tag) revalidateTag(tag);
      return await res.json();
    } else {
      return errorMessage(await res.text());
    }
  }

  async post(url: string, data: any, options: RequestInit = {}, tag?: string) {
    return this.request("POST", url, data, options, tag);
  }

  async get(url: string, options: RequestInit = {}) {
    return this.request("GET", url, undefined, options);
  }

  async patch(url: string, data: any, options: RequestInit = {}, tag?: string) {
    return this.request("PATCH", url, data, options, tag);
  }

  async delete(url: string, options: RequestInit = {}, tag?: string) {
    return this.request("DELETE", url, undefined, options, tag);
  }
}

const api = new API();

export default api;
