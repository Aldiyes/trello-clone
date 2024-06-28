import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/">
      <div className="hidden items-center gap-x-2 transition hover:opacity-75 md:flex">
        <Image
          src="/logo.svg"
          alt="logo"
          height="30"
          width="30"
          className="h-auto w-8"
        />
        <p className="pb-1 text-lg font-bold text-neutral-700">Next Trello</p>
      </div>
    </Link>
  );
};
