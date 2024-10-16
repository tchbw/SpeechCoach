import type { RefObject } from "react";
import { useEffect, useState } from "react";

export function useAvailableHeight(ref: RefObject<HTMLElement>) {
  const [availableHeight, setAvailableHeight] = useState(0);

  useEffect(() => {
    const updateAvailableHeight = () => {
      const element = ref.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        const availableSpace = window.innerHeight - rect.top;
        setAvailableHeight(availableSpace);
      }
    };

    updateAvailableHeight();
    window.addEventListener(`resize`, updateAvailableHeight);

    return () => {
      window.removeEventListener(`resize`, updateAvailableHeight);
    };
  }, [ref]);

  return availableHeight;
}
