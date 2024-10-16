import * as React from "react";

export type useCopyToClipboardProps = {
  timeout?: number;
};

export function useCopyToClipboard({
  timeout = 2000,
}: useCopyToClipboardProps) {
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  const copyToClipboard = async (value: string) => {
    if (typeof window === `undefined` || !navigator.clipboard?.writeText) {
      return;
    }

    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, timeout);
  };

  return { isCopied, copyToClipboard };
}
