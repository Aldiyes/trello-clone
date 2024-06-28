"use client";

import { MoreHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { TBoard } from "@/data/types";

import { DELETE } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  id: string;
};

export const BoardOptions = ({ id }: Props) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const onDelete = () => {
    startTransition(() => {
      DELETE(`/board?id=${id}`, {}, "board")
        .then((res: TBoard) => {
          toast.success(`Board ${res.title} deleted`);
          router.push(`/organization/${res.orgId}`);
        })
        .catch((error) => toast.error(error.message));
    });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="transparent">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 py-3" side="bottom" align="start">
        <div className="pb-4 text-center text-sm font-medium text-neutral-600">
          Board Actions
        </div>
        <PopoverClose asChild>
          <Button
            className="text-netural-600 absolute right-2 top-2 h-auto w-auto p-2"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          variant="ghost"
          disabled={isPending}
          onClick={onDelete}
          className="h-auto w-full justify-start rounded-none p-2 px-2 text-sm font-normal"
        >
          Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  );
};
