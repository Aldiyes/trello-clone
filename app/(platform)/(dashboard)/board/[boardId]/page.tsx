import { GET } from "@/lib/actions";

import { ListContainer } from "./components/list-container";

type Props = {
  params: {
    boardId: string;
  };
};

export default async function BoardIdPage({ params }: Props) {
  return GET(`/list?boardId=${params.boardId}`, {
    cache: "no-store",
    next: { tags: ["list"] },
  }).then((listData) => (
    <div className="h-full overflow-x-auto p-4">
      <ListContainer boardId={params.boardId} data={listData} />
    </div>
  ));
}
