"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ElementRef, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { TBoard } from "@/data/types";

import { PATCH } from "@/lib/actions";
import { RenameBoardTitleSchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Props = {
  board: TBoard;
};

export const BoardTitleForm = ({ board }: Props) => {
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

  const form = useForm<z.infer<typeof RenameBoardTitleSchema>>({
    resolver: zodResolver(RenameBoardTitleSchema),
    defaultValues: {
      id: board.id,
      title: board.title,
    },
  });

  const onSubmit = (values: z.infer<typeof RenameBoardTitleSchema>) => {
    if (values.title === board.title) return;
    startTransition(() => {
      PATCH(`/board?id=${values.id}`, values, {}, "board")
        .then((res: TBoard) => {
          toast.success(`Renamed board to "${res.title}"`);
          disableEditing();
        })
        .catch((error) => {
          toast.error(error.message);
          form.reset();
        });
    });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <>
      {isEditing ? (
        <Form {...form}>
          <form
            ref={formRef}
            className="flex items-center gap-x-2"
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
                      className="h-7 border-none bg-transparent px-[7px] py-1 text-lg font-bold focus-visible:outline-none focus-visible:ring-transparent"
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <Button
          onClick={enableEditing}
          className="h-auto w-auto p-1 px-2 text-lg font-bold"
          variant="transparent"
        >
          {board.title}
        </Button>
      )}
    </>
  );
};
