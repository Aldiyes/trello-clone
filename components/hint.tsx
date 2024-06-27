import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  children: React.ReactNode;
  description: string;
  side?: "left" | "right" | "top" | "bottom";
  sideOffset?: number;
};

export const Hint = ({
  children,
  description,
  side = "bottom",
  sideOffset = 0,
}: Props) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          sideOffset={sideOffset}
          side={side}
          className="max-w-[200px] break-words text-sm"
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
