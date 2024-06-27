"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { ElementRef, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { TListWithCard } from "@/data/types";

import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";

type Props = {
  index: number;
  data: TListWithCard;
};

export const ListItem = ({ index, data }: Props) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };
  return (
    <Draggable draggableId={data.id!} index={index}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="h-full w-[272px] shrink-0 select-none"
        >
          <div
            {...provided.dragHandleProps}
            className="w-full rounded-md bg-[#f1f2f4] pb-2 shadow-md"
          >
            <ListHeader onAddCard={enableEditing} data={data} />
            <Droppable droppableId={data.id!} type="card">
              {(provided) => (
                <ol
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "mx-1 flex flex-col gap-y-2 px-1 py-0.5",
                    data.cards.length > 0 && "mt-2",
                  )}
                >
                  {data.cards.map((card, index) => (
                    <CardItem key={card.id} index={index} data={card} />
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
            <CardForm
              listId={data.id!}
              ref={textareaRef}
              isEditing={isEditing}
              enableEditing={enableEditing}
              disableEditing={disableEditing}
            />
          </div>
        </li>
      )}
    </Draggable>
  );
};
