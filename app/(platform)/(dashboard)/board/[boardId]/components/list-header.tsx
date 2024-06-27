"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ElementRef, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import * as z from "zod";

import { TList } from "@/data/types";

import { PATCH } from "@/lib/actions";
import { UpdateListSchema } from "@/lib/schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ListOptions } from "./list-options";

type Props = {
  data: TList;
  onAddCard: () => void;
};

export const ListHeader = ({ data, onAddCard }: Props) => {
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      formRef.current?.requestSubmit();
    }
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  useEventListener("keydown", onKeyDown);

  const form = useForm<z.infer<typeof UpdateListSchema>>({
    resolver: zodResolver(UpdateListSchema),
    defaultValues: {
      id: data.id,
      boardId: data.boardId,
      title: data.title,
    },
  });

  const onSubmit = (values: z.infer<typeof UpdateListSchema>) => {
    if (values.title === data.title) {
      disableEditing();
    } else {
      startTransition(() => {
        PATCH(
          `/list?boardId=${values.boardId}&id=${values.id}`,
          values,
          {},
          "list",
        )
          .then((res: TList) => {
            toast.success(`Renamed to "${res.title}"`);
            disableEditing();
          })
          .catch((error) => {
            toast.error(error.message);
            form.reset();
          });
      });
    }
  };

  return (
    <div className="flex items-start justify-between gap-x-2 px-2 pt-2 text-sm font-semibold">
      {isEditing ? (
        <Form {...form}>
          <form
            ref={formRef}
            className="flex-1 px-[2px]"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      ref={inputRef}
                      name={field.name}
                      onChange={field.onChange}
                      onBlur={onBlur}
                      disabled={isPending}
                      className="h-7 truncate border-transparent bg-transparent px-[7px] py-1 text-sm font-medium transition hover:border-input focus:border-input focus:bg-white"
                      placeholder="enter list title..."
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <div
          onClick={enableEditing}
          className="h-7 w-full border-transparent px-2.5 py-1 text-sm font-medium"
        >
          {data.title}
        </div>
      )}
      <ListOptions data={data} onAddCard={onAddCard} />
    </div>
  );
};
