"use client";

import { MoreHorizontal, X } from "lucide-react";
import { ElementRef, useRef, useTransition } from "react";
import { toast } from "sonner";

import { TList } from "@/data/types";

import { DELETE, POST } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type Props = {
  data: TList;
  onAddCard: () => void;
};

export const ListOptions = ({ data, onAddCard }: Props) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const [isPending, startTransition] = useTransition();

  const onDeleteList = () => {
    DELETE(`/list/${data.boardId}?id=${data.id}`, {}, "list")
      .then((res: TList) => {
        toast.success(`List "${res.title}" deleted`);
      })
      .catch((error) => toast.error(error.message));
  };

  const onCopyList = () => {
    startTransition(() => {
      POST(`/list/${data.boardId}?id=${data.id}`, null, {}, "list")
        .then(() => {
          toast.success(`List "${data.title}" copied`);
          closeRef.current?.click();
        })
        .catch((error) => toast.error(error.message));
    });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pb-3 pt-3" side="bottom" align="start">
        <div className="pb-6 text-center text-sm font-medium text-neutral-600">
          List Actions
        </div>
        <PopoverClose ref={closeRef} asChild>
          <Button
            className="absolute right-2 top-2 h-auto w-auto p-2 text-neutral-600"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          onClick={onAddCard}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          variant="ghost"
        >
          Add card...
        </Button>
        <Button
          onClick={onCopyList}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          variant="ghost"
        >
          Copy list...
        </Button>
        <Separator />
        <Button
          onClick={onDeleteList}
          disabled={isPending}
          className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal"
          variant="ghost"
        >
          Delete this list...
        </Button>
      </PopoverContent>
    </Popover>
  );
};
