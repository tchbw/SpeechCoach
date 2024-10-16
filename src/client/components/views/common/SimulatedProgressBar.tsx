import React, { useEffect, useState } from "react";

import { Progress } from "@/client/components/ui/progress";

function SimulatedProgressBar({
  estimatedTotalTime = 8000,
}: {
  estimatedTotalTime?: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalTime = estimatedTotalTime / 100;
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 95) {
          clearInterval(timer);
          return 95;
        }
        let increment = 1;
        if (oldProgress >= 60) {
          increment = 0.5; // Slow down after 60%
        }
        if (oldProgress >= 80) {
          increment = 0.2; // Slow down even more after 80%
        }
        const newProgress = oldProgress + increment;
        return Math.min(newProgress, 95);
      });
    }, intervalTime);

    return () => {
      clearInterval(timer);
    };
  }, [estimatedTotalTime]);

  return (
    <div className="mx-auto w-full max-w-md">
      <Progress value={progress} className="w-full" />
      <p className="mt-2 text-center text-muted-foreground">
        Extracting... {Math.round(progress)}%
      </p>
    </div>
  );
}

export default SimulatedProgressBar;
