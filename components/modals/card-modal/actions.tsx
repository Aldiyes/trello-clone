"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Copy, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { TCard, TCardWithList } from "@/data/types";

import { DELETE, POST } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransition } from "react";

type Props = {
  data: TCardWithList;
};

export const Actions = ({ data }: Props) => {
  const cardModal = useCardModal();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const boardId = params.boardId as string;
  const onCopy = () => {
    startTransition(() => {
      POST(
        `/card/${boardId}?listId=${data.listId}&id=${data.id}`,
        null,
        {},
        "card",
      )
        .then(() => {
          toast.success(`Card "${data.title}" copied`);
          cardModal.onClose();
        })
        .catch((error) => toast.error(error.message));
    });
  };

  const onDelete = () => {
    startTransition(() => {
      DELETE(`/card?listId=${data.listId}&id=${data.id}`, {}, "card")
        .then((res: TCard) => {
          toast.success(`Card "${res.title}" deleted`);
          cardModal.onClose();
        })
        .catch((error) => toast.error(error.message));
    });
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-semibold">Actions</p>
      <Button
        onClick={onCopy}
        disabled={isPending}
        variant="gray"
        className="w-full justify-start"
        size="inline"
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
      <Button
        onClick={onDelete}
        disabled={isPending}
        variant="gray"
        className="w-full justify-start"
        size="inline"
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
};

Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="mt-2 space-y-2">
      <Skeleton className="h-4 w-20 bg-neutral-200" />
      <Skeleton className="h-8 w-full bg-neutral-200" />
      <Skeleton className="h-8 w-full bg-neutral-200" />
    </div>
  );
};
