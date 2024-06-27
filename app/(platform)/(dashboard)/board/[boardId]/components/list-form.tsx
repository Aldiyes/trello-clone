"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { ElementRef, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";

import { TList } from "@/data/types";

import { POST } from "@/lib/actions";
import { CreateListSchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ListWrapper } from "./list-wrapper";

export const ListForm = () => {
  const params = useParams();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const form = useForm<z.infer<typeof CreateListSchema>>({
    resolver: zodResolver(CreateListSchema),
    defaultValues: {
      boardId: params.boardId as string,
      title: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CreateListSchema>) => {
    startTransition(() => {
      POST(`/list?boardId=${values.boardId}`, values, {}, "list")
        .then((res: TList) => {
          toast.success(`List "${res.title}" created`);
          form.reset();
          disableEditing();
        })
        .catch((error) => toast.error(error.message));
    });
  };

  return (
    <>
      {isEditing ? (
        <ListWrapper>
          <Form {...form}>
            <form
              ref={formRef}
              className="w-full space-y-4 rounded-md bg-white p-3 shadow-md"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        className="h-7 border-transparent px-2 py-1 text-sm font-medium transition hover:border-input focus:border-input"
                        placeholder="enter list title..."
                        ref={inputRef}
                        onChange={field.onChange}
                        value={field.value}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input hidden value={params.boardId} name="boardId" />
              <div className="flex items-center gap-x-1">
                <Button type="submit" variant="primary">
                  Add list
                </Button>
                <Button variant="ghost" size="sm" onClick={disableEditing}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </ListWrapper>
      ) : (
        <ListWrapper>
          <button
            onClick={enableEditing}
            className="flex w-full items-center rounded-md bg-white/80 p-3 text-sm font-medium transition hover:bg-white/50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a list
          </button>
        </ListWrapper>
      )}
    </>
  );
};
