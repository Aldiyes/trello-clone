"use client";

import { useQuery } from "@tanstack/react-query";

import { useCardModal } from "@/hooks/use-card-modal";

import { TAuditLog, TCardWithList } from "@/data/types";

import { GET } from "@/lib/actions";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Actions } from "./actions";
import { Activity } from "./activity";
import { Description } from "./description";
import { Header } from "./header";

export const CardModal = () => {
	const listId = useCardModal((state) => state.listId);
	const id = useCardModal((state) => state.id);
	const isOpen = useCardModal((state) => state.isOpen);
	const onClose = useCardModal((state) => state.onClose);

	const { data: cardData } = useQuery<TCardWithList>({
		queryKey: ["card", id],
		queryFn: () =>
			GET(`/card?listId=${listId!}&id=${id!}`, {
				cache: "no-store",
				next: { tags: ["card"] },
			}),
		enabled: isOpen,
	});

	const { data: auditLogsData } = useQuery<TAuditLog[]>({
		queryKey: ["card-logs", id],
		queryFn: () =>
			GET(`/audit-log/card?cardId=${id!}`, {
				cache: "no-store",
				next: { tags: ["card-logs"] },
			}),
		enabled: isOpen,
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogTitle>
					{!cardData ? <Header.Skeleton /> : <Header data={cardData} />}
				</DialogTitle>
				<DialogDescription></DialogDescription>
				<div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
					<div className="col-span-3">
						<div className="w-full space-y-6">
							{!cardData ? (
								<Description.Skeleton />
							) : (
								<Description data={cardData} />
							)}
							{!auditLogsData ? (
								<Activity.Skeleton />
							) : (
								<Activity items={auditLogsData} />
							)}
						</div>
					</div>
					{!cardData ? <Actions.Skeleton /> : <Actions data={cardData} />}
				</div>
			</DialogContent>
		</Dialog>
	);
};
