"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { API_BASE_URL } from "@/data/constants";

import { errorMessage } from "@/lib/utils";

export async function POST(
	url: string,
	data: any,
	options: RequestInit = {},
	tag?: string,
) {
	const { getToken } = auth();

	const defaultOptions: RequestInit = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${await getToken()}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	};

	const mergedOptions = { ...defaultOptions, ...options };

	const res = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

	return res.ok
		? res.status === 204
			? null
			: (tag && revalidateTag(tag), await res.json())
		: errorMessage(await res.text());
}

export async function GET(url: string, options: RequestInit = {}) {
	const { getToken } = auth();

	const defaultOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${await getToken()}`,
			"Content-Type": "application/json",
		},
	};

	const mergedOptions = { ...defaultOptions, ...options };

	const res = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

	return res.ok
		? res.status === 204
			? null
			: await res.json()
		: errorMessage(await res.text());
}

export async function PATCH(
	url: string,
	data: any,
	options: RequestInit = {},
	tag?: string,
) {
	const { getToken } = auth();

	const defaultOptions: RequestInit = {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${await getToken()}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	};

	const mergedOptions = { ...defaultOptions, ...options };

	const res = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

	return res.ok
		? res.status === 204
			? null
			: (tag && revalidateTag(tag), await res.json())
		: errorMessage(await res.text());
}

export async function DELETE(
	url: string,
	options: RequestInit = {},
	tag?: string,
) {
	const { getToken } = auth();

	const defaultOptions: RequestInit = {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${await getToken()}`,
			"Content-Type": "application/json",
		},
	};

	const mergedOptions = { ...defaultOptions, ...options };

	const res = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

	return res.ok
		? res.status === 204
			? null
			: (tag && revalidateTag(tag), await res.json())
		: errorMessage(await res.text());
}
