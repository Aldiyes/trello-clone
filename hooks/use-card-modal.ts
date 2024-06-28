import { create } from "zustand";

type CardModalStore = {
  listId?: string;
  id?: string;
  isOpen: boolean;
  onOpen: (listId: string, id: string) => void;
  onClose: () => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  listId: undefined,
  id: undefined,
  isOpen: false,
  onOpen: (listId: string, id: string) => set({ isOpen: true, listId, id }),
  onClose: () => set({ isOpen: false, listId: undefined, id: undefined }),
}));
