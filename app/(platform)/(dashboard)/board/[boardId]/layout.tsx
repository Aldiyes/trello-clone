import { auth } from "@clerk/nextjs/server";

import { GET } from "@/lib/actions";

import { BoardNavbar } from "./components/board-navbar";

export async function generateMetadata({
	params,
}: {
	params: { boardId: string };
}) {
	const { orgId } = auth();

	if (!orgId)
		return {
			title: "Board",
		};

	const getBoard = await GET(`/board/${params.boardId}`);

	return {
		title: getBoard.title || "Board",
	};
}

export default async function BoardIdLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { boardId: string };
}) {
	return GET(`/board/${params.boardId}`, {
		cache: "no-store",
		next: { tags: ["board"] },
	}).then((res) => (
		<div
			className="relative h-full bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: `url(${res.imageFullUrl})` }}
		>
			<div className="absolute inset-0 bg-black/20" />
			<BoardNavbar board={res} />
			<main className="relative h-full pt-28">{children}</main>
		</div>
	));
}
