"use client";

import { Draggable } from "@hello-pangea/dnd";

import { useCardModal } from "@/hooks/use-card-modal";

import { TCard } from "@/data/types";

type Props = {
	index: number;
	data: TCard;
};

export const CardItem = ({ index, data }: Props) => {
	const cardModal = useCardModal();
	return (
		<Draggable draggableId={data.id!} index={index}>
			{(provided) => (
				<div
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
					role="button"
					onClick={() => cardModal.onOpen(data.listId, data.id!)}
					className="truncate rounded-md border-2 border-transparent bg-white px-3 py-2 text-sm shadow-sm hover:border-black"
				>
					{data.title}
				</div>
			)}
		</Draggable>
	);
};
