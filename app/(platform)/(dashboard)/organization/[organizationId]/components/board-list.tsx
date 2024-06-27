import { HelpCircle, User2 } from "lucide-react";
import Link from "next/link";

import { TBoard } from "@/data/types";

import { GET } from "@/lib/actions";

import { FormPopover } from "@/components/form/form-popover";
import { Hint } from "@/components/hint";
import { Skeleton } from "@/components/ui/skeleton";

export const BoardList = async () => {
  const boardList: TBoard[] = await GET("/board");
  return (
    <div className="space-y-4">
      <div className="flex items-center text-lg font-semibold text-neutral-700">
        <User2 className="mr-2 h-6 w-6" />
        <h1>Your boards</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {boardList.map((board: TBoard) => (
          <Link
            href={`/board/${board.id}`}
            key={board.id}
            className="group relative aspect-video h-full w-full overflow-hidden rounded-sm bg-sky-700 bg-cover bg-center bg-no-repeat p-2"
            style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
          >
            <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
            <p className="relative font-semibold text-white">{board.title}</p>
          </Link>
        ))}
        <FormPopover side="right" sideOffset={10}>
          <div
            role="button"
            className="relative flex aspect-video h-full w-full flex-col items-center justify-center gap-y-1 rounded-sm bg-muted transition hover:opacity-75"
          >
            <p className="text-sm">Create new board</p>
            <span className="text-xs">Unlimited</span>
            <Hint
              sideOffset={40}
              description={`Free Workspaces can have up to 5 open boards. for unlimited boards upgrade this workspace`}
            >
              <HelpCircle className="absolute bottom-2 right-2 h-4 w-4 text-muted-foreground" />
            </Hint>
          </div>
        </FormPopover>
      </div>
    </div>
  );
};

BoardList.Skeleton = function SkeletonBoardList() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
    </div>
  );
};
