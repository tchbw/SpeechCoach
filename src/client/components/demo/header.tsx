import Image from "next/image";

import { env } from "@/env";

export default function Header() {
  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <div className="fixed bottom-0 left-0 mb-4 flex h-auto w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:mb-0 lg:w-auto lg:bg-none">
        <a
          href={env.NEXT_PUBLIC_APP_URL}
          className="font-nunito flex items-center justify-center gap-2 text-lg font-bold"
        >
          <span>Peterson’s and Sons and Friends Bits and Parts Limited</span>
          <Image
            className="rounded-xl"
            src="/ai_profile_pic.jpeg"
            alt="Llama Logo"
            width={40}
            height={40}
            priority
          />
        </a>
      </div>
    </div>
  );
}
