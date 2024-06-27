"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProModal } from "@/hooks/use-pro-modal";
import { GET } from "@/lib/actions";
import { stripeRedirect } from "@/lib/stripe-redirect";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

export const ProModal = () => {
  const proModal = useProModal();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(() => {
      GET("/stripe")
        .then((res) => (window.location.href = res))
        .catch((error) => toast.error(error.message));
    });
  };
  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent
        className="max-w-md overflow-hidden p-0"
        aria-describedby="pro-modal"
      >
        <div className="relative flex aspect-video items-center justify-center">
          <Image
            src="/pro-modals.jpeg"
            alt="img-pro-modal"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="mx-auto space-y-6 p-6 text-neutral-700">
          <h2 className="text-xl font-semibold">
            Upgrade to Next Trello Pro Today!
          </h2>
          <p className="text-xs font-semibold text-neutral-600">
            Explore the best of Next Trello
          </p>
          <div className="pl-3">
            <ul className="list-disc text-sm">
              <li>Unlimited boards</li>
              <li>Advance checklists</li>
              <li>Admin and security features</li>
              <li>And more!</li>
            </ul>
          </div>
          <Button
            onClick={onClick}
            disabled={isPending}
            className="w-full"
            variant="primary"
          >
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
