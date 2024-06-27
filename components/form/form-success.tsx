import { CircleCheck } from "lucide-react";

type Props = {
  message?: string;
};

export const FormSuccess = ({ message }: Props) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CircleCheck className="h-5 w-5" />
      <p>{message}</p>
    </div>
  );
};
