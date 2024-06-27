"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import {
  ElementRef,
  KeyboardEventHandler,
  forwardRef,
  useRef,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";

import { TCard } from "@/data/types";

import { POST } from "@/lib/actions";
import { CreateCardSchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  listId: string;
  enableEditing: () => void;
  disableEditing: () => void;
  isEditing: boolean;
};

export const CardForm = forwardRef<HTMLTextAreaElement, Props>(
  ({ listId, enableEditing, disableEditing, isEditing }, ref) => {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<ElementRef<"form">>(null);

    const form = useForm<z.infer<typeof CreateCardSchema>>({
      resolver: zodResolver(CreateCardSchema),
      defaultValues: {
        listId: listId,
        title: "",
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    useOnClickOutside(formRef, disableEditing);
    useEventListener("keydown", onKeyDown);

    const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      e,
    ) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const onSubmit = (values: z.infer<typeof CreateCardSchema>) => {
      startTransition(() => {
        POST(`/card?listId=${values.listId}`, values, {}, "card")
          .then((res: TCard) => {
            toast.success(`Card "${res.title}" created`);
            form.reset();
            disableEditing();
          })
          .catch((error) => toast.error(error.message));
      });
    };

    return (
      <>
        {isEditing ? (
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
                      <Textarea
                        onKeyDown={onTextareaKeyDown}
                        disabled={isPending}
                        placeholder="Enter a title for this card..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-1">
                <Button type="submit" variant="primary" disabled={isPending}>
                  Add card
                </Button>
                <Button variant="ghost" size="sm" onClick={disableEditing}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="px-2 pt-2">
            <Button
              onClick={enableEditing}
              className="h-auto w-full justify-start px-2 py-1.5 text-sm text-muted-foreground"
              size="sm"
              variant="ghost"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          </div>
        )}
      </>
    );
  },
);

CardForm.displayName = "CardForm";
