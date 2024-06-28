import { TriangleAlertIcon } from "lucide-react";

type Props = {
  message?: string;
};

export const FormError = ({ message }: Props) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-x-2 rounded-md bg-rose-500/15 p-3 text-sm text-rose-500">
      <TriangleAlertIcon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
