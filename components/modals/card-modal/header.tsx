"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "lucide-react";
import { ElementRef, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { TCard, TCardWithList } from "@/data/types";

import { UpdateCardSchema } from "@/lib/schemas";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PATCH } from "@/lib/actions";

type Props = {
	data: TCardWithList;
};

export const Header = ({ data }: Props) => {
	const queryClient = useQueryClient();

	const [isPending, startTransition] = useTransition();

	const inputRef = useRef<ElementRef<"input">>(null);

	const form = useForm<z.infer<typeof UpdateCardSchema>>({
		resolver: zodResolver(UpdateCardSchema),
		defaultValues: {
			listId: data.listId,
			id: data.id,
			title: data.title || undefined,
		},
	});

	const onBlur = () => {
		inputRef.current?.form?.requestSubmit();
	};

	const onSubmit = (values: z.infer<typeof UpdateCardSchema>) => {
		if (values.title === data.title) return;
		startTransition(() => {
			PATCH(`/card?listId=${values.listId}&id=${values.id}`, values, {}, "card")
				.then((res: TCard) => {
					toast.success(`Renamed to "${res.title}"`);
					queryClient.invalidateQueries({
						queryKey: ["card", res.id],
					});
					queryClient.invalidateQueries({
						queryKey: ["card-logs", res.id],
					});
				})
				.catch((error) => {
					toast.error(error.message);
					form.reset();
				});
		});
	};

	return (
		<div className="mb-6 flex w-full items-start gap-x-3">
			<Layout className="mt-1 h-5 w-5 text-neutral-700" />
			<div className="w-full">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
											value={field.value}
											type="text"
											className="bg-tranparent tuncate relative -left-1.5 mb-0.5 w-[95%] px-1 text-xl font-semibold text-neutral-700 focus-visible:border-input focus-visible:bg-white"
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<p className="text-sm text-muted-foreground">
					in list <span className="underline">{data.list.title}</span>
				</p>
			</div>
		</div>
	);
};

Header.Skeleton = function HeaderSkeleton() {
	return (
		<div className="mb-6 flex items-start gap-x-3">
			<Skeleton className="mt-1 h-6 w-6 bg-neutral-200" />
			<div>
				<Skeleton className="mb-1 h-6 w-24 bg-neutral-200" />
				<Skeleton className="h-4 w-12 bg-neutral-200" />
			</div>
		</div>
	);
};
