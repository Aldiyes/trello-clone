"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { TListWithCard } from "@/data/types";

import { PATCH } from "@/lib/actions";

import { ListForm } from "./list-form";
import { ListItem } from "./list-item";

type Props = {
  data: TListWithCard[];
  boardId: string;
};

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export const ListContainer = ({ data, boardId }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [orderedData, setOrderedData] = useState(data);

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // User move a list
    if (type === "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index }),
      );

      setOrderedData(items);
      // TODO: Trigger server action
      startTransition(() => {
        PATCH(`/list/${boardId}`, items, {}, "board")
          .then(() => toast.success(`List reordered`))
          .catch((error) => toast.error(error.message));
      });
    }

    // User move a card
    if (type === "card") {
      let newOrderedData = [...orderedData];

      // Source and destination list
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId,
      );
      const destinationList = newOrderedData.find(
        (list) => list.id === destination.droppableId,
      );

      if (!sourceList || !destinationList) {
        return;
      }

      // Check if cards exists on the source list
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // Check if cards exists in destination list
      if (!destinationList.cards) {
        destinationList.cards = [];
      }

      // Moving the card in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index,
        );

        reorderedCards.forEach((card, index) => {
          card.order = index;
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData);
        // TODO: Trigger server action
        startTransition(() => {
          PATCH(`/card/${boardId}`, reorderedCards, {}, "board")
            .then(() => toast.success("Card reordered"))
            .catch((error) => toast.error(error.message));
        });
      } else {
        // User move the card to another list

        // remove card from sourcelist
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // assing the new listId to the moved card
        movedCard.listId = destination.droppableId;

        // Add the card to the destination list
        destinationList.cards.splice(destination.index, 0, movedCard);

        // Change the order
        sourceList.cards.forEach((card, index) => {
          card.order = index;
        });

        // Update the order for each card in the destination list
        destinationList.cards.forEach((card, index) => {
          card.order = index;
        });

        setOrderedData(newOrderedData);
        // TODO: Trigger server action
        startTransition(() => {
          PATCH(`/card/${boardId}`, destinationList.cards, {}, "board")
            .then(() => toast.success("Card reordered"))
            .catch((error) => toast.error(error.message));
        });
      }
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-full gap-x-3"
          >
            {orderedData &&
              orderedData.map((list, index) => {
                return <ListItem key={list.id} index={index} data={list} />;
              })}
            {provided.placeholder}
            <ListForm />
            <div className="w-1 flex-shrink-0" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
