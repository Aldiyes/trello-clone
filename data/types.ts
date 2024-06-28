import { ACTION, ENTITY_TYPE } from "@/data/enums";

export type TOrganization = {
  id: string;
  slug: string;
  imageUrl: string;
  name: string;
};

export type TBoard = {
  id?: string;
  title: string;
  orgId: string;
  imageId: string;
  imageThumbUrl: string;
  imageFullUrl: string;
  imageUserName: string;
  imageLinkHTML: string;
};

export type TList = {
  id?: string;
  title: string;
  order: number;
  boardId: string;
};

export type TCard = {
  id?: string;
  title: string;
  order: number;
  description: string | null;
  listId: string;
};

export type TListWithCard = TList & { cards: TCard[] };
export type TCardWithList = TCard & { list: TList };

export type TAuditLog = {
  id: string;
  orgId: string;
  action: ACTION;
  entityId: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  userId: string;
  userImage: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
};
