"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Check, Loader2 } from "lucide-react";

import { defaultImages } from "@/data/constants/images";

import { POST } from "@/lib/actions";
import { CreateBoardSchema } from "@/lib/schemas";
import { unsplash } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProModal } from "@/hooks/use-pro-modal";
import { hasAvailableCount } from "@/lib/org-limit";

type Props = {
  closeRef: RefObject<HTMLButtonElement>;
};

export const FormInput = ({ closeRef }: Props) => {
  const router = useRouter();
  const proModal = useProModal();
  const [images, setImages] =
    useState<Array<Record<string, any>>>(defaultImages);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof CreateBoardSchema>>({
    resolver: zodResolver(CreateBoardSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const result = await unsplash.photos.getRandom({
          collectionIds: ["317099"],
          count: 9,
        });

        if (result && result.response) {
          const unsplashImages = result.response as Array<Record<string, any>>;
          setImages(unsplashImages);
        } else {
          toast.error("Failed to get images from Unsplash");
        }
      } catch (error) {
        setImages(defaultImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  const onSubmit = (values: z.infer<typeof CreateBoardSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      hasAvailableCount()
        .then((canCreate) => {
          canCreate
            ? POST("/board", values, {}, "board")
                .then((res) => {
                  toast.success(`Board "${res.title}" created`);
                  setSuccess(`Board "${res.title}" created`);
                  closeRef.current?.click();
                  form.reset();
                  router.push(`/board/${res.id}`);
                })
                .catch((error) => toast.error(error.message))
            : (proModal.onOpen(),
              toast.error(
                "You have reached your limit of free boards. Please upgrade to create more.",
              ));
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  if (isLoading) {
    <div className="flex items-center justify-center p-6">
      <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
    </div>;
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="mb-2 grid grid-cols-3 gap-2"
                  >
                    {images.map((image) => (
                      <FormItem key={image.id}>
                        <FormControl>
                          <>
                            <RadioGroupItem
                              className="hidden"
                              id={image.id}
                              disabled={isPending}
                              onClick={() => setSelectedImageId(image.id)}
                              value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
                            />
                            <Label htmlFor={image.id}>
                              <AspectRatio
                                ratio={16 / 9}
                                key={image.id}
                                className={cn(
                                  "group relative aspect-video cursor-pointer bg-muted transition hover:opacity-75",
                                )}
                              >
                                <Image
                                  src={image.urls.thumb}
                                  alt="Unsplash image"
                                  className="rounded-sm object-cover"
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  priority
                                />
                                {selectedImageId === image.id && (
                                  <div className="absolute inset-y-0 flex h-full w-full items-center justify-center bg-black/30">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                                <Link
                                  href={image.links.html}
                                  target="_blank"
                                  className="absolute bottom-0 w-full truncate bg-black/50 p-1 text-[10px] text-white opacity-0 hover:underline group-hover:opacity-100"
                                >
                                  {image.user.name}
                                </Link>
                              </AspectRatio>
                            </Label>
                          </>
                        </FormControl>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Board title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder=""
                    type="text"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          disabled={isPending}
          variant="primary"
          className="w-full"
        >
          Create
        </Button>
      </form>
    </Form>
  );
};
