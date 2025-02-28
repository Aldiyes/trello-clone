import { Medal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="boder mb-4 flex items-center rounded-full bg-amber-100 p-4 uppercase text-amber-700 shadow-sm">
          <Medal className="mr-2 h-6 w-6" />
          No 1 task management
        </div>
        <h1 className="text-3-xl mb-6 text-center text-neutral-800 md:text-6xl">
          Next Trello helps team move
        </h1>
        <div className="w-fit rounded-md bg-gradient-to-r from-fuchsia-600 to-pink-600 p-2 px-4 pb-4">
          <span className="text-3xl text-white md:text-6xl">work forward</span>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-xs text-center text-sm text-neutral-400 md:max-w-2xl md:text-xl">
        Collaborate, manage projects, and react new productivity peaks. From
        high rises to the home office, the way your team work is unique -
        accomplish it all with Next Trello.
      </p>
      <Button className="mt-6" size="lg" asChild>
        <Link href="/sign-up">Get Next Trello for free</Link>
      </Button>
    </div>
  );
}
