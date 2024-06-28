"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft } from "lucide-react";
import { ElementRef, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";

import { TCard, TCardWithList } from "@/data/types";

import { PATCH } from "@/lib/actions";
import { UpdateCardSchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Props = {
	data: TCardWithList;
};

export const Description = ({ data }: Props) => {
	const queryClient = useQueryClient();

	const [isPending, startTransition] = useTransition();

	const [isEditing, setIsEditing] = useState(false);

	const formRef = useRef<ElementRef<"form">>(null);

	const enableEditing = () => {
		setIsEditing(true);
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

	const form = useForm<z.infer<typeof UpdateCardSchema>>({
		resolver: zodResolver(UpdateCardSchema),
		defaultValues: {
			listId: data.listId,
			id: data.id,
			description: data.description || undefined,
		},
	});

	const onSubmit = (values: z.infer<typeof UpdateCardSchema>) => {
		startTransition(() => {
			PATCH(`/card?listId=${values.listId}&id=${values.id}`, values, {}, "card")
				.then((res: TCard) => {
					toast.success(`Card "${res.title}" updated`);
					queryClient.invalidateQueries({
						queryKey: ["card", res.id],
					});
					queryClient.invalidateQueries({
						queryKey: ["card-logs", res.id],
					});
					disableEditing();
				})
				.catch((error) => {
					toast.error(error.message);
					form.reset();
				});
		});
	};

	return (
		<div className="flex w-full items-start gap-x-3">
			<AlignLeft className="mt-0.5 h-5 w-5 text-neutral-700" />
			<div className="w-full">
				<p className="mb-2 font-semibold text-neutral-700">Description</p>
				{isEditing ? (
					<Form {...form}>
						<form
							ref={formRef}
							className="space-y-2"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Textarea
												className="resize-none"
												placeholder="Add a more details description..."
												disabled={isPending}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="flex items-center gap-x-2">
								<Button
									type="submit"
									variant="primary"
									size="sm"
									disabled={isPending}
								>
									Save
								</Button>
								<Button onClick={disableEditing} size="sm" variant="ghost">
									Cancle
								</Button>
							</div>
						</form>
					</Form>
				) : (
					<div
						onClick={enableEditing}
						role="button"
						className="min-h-[78px] rounded-md bg-neutral-200 px-3.5 py-3 text-sm font-medium"
					>
						{data.description || "Add a more detailed description..."}
					</div>
				)}
			</div>
		</div>
	);
};

Description.Skeleton = function DescriptionSkeleton() {
	return (
		<div className="flex w-full items-center gap-x-3">
			<Skeleton className="h-6 w-6 bg-neutral-200" />
			<div className="w-full">
				<Skeleton className="mb-2 h-6 w-24 bg-neutral-200" />
				<Skeleton className="h-[78px] w-full bg-neutral-200" />
			</div>
		</div>
	);
};
