import clsx from "clsx";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { PartialReligionQAResponse, Religion } from "@/app/types";
import { religionConfig } from "@/app/util";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import Markdown from "@/client/components/views/project/activity/assistant/message/markdown";

function QAResponseCard({
  qaResponses,
  religion,
}: {
  qaResponses: Array<PartialReligionQAResponse | undefined> | undefined;
  religion: Religion;
}) {
  const qaResponse = qaResponses?.find((q) => q?.religion === religion);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (qaResponse && videoRef.current && videoRef.current.paused) {
      void videoRef.current.play();
    }
  }, [qaResponse]);

  let cardContent: ReactNode;
  if (!qaResponse) {
    cardContent = null;
  } else {
    cardContent = (
      <CardContent>
        {qaResponse?.message ? (
          <div className="text-foreground/80">
            <Markdown
              content={qaResponse.message}
              components={{
                strong: ({ children }) => (
                  <span className="font-medium text-pink-400 ">{children}</span>
                ),
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500">SOURCES</h3>
          {qaResponse?.sources && qaResponse.sources.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {qaResponse.sources.map((source, index) => (
                <li key={index}>
                  {source?.quote ? (
                    <>
                      <span className="text-gray-300">{source.quote}</span>
                      {source?.sourceDescription && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({source.sourceDescription})
                        </span>
                      )}
                    </>
                  ) : (
                    <Skeleton className="h-4 w-full" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="mt-2 h-4 w-full" />
          )}
        </div>
      </CardContent>
    );
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{religionConfig[religion].name}</CardTitle>
        <CardDescription>Response to the question</CardDescription>
        <video
          ref={videoRef}
          src={`${religionConfig[religion].persona}`}
          loop
          muted
          playsInline
          className={clsx(
            `mb-4 w-full rounded-lg transition-all duration-300`,
            {
              [`brightness-50`]: !qaResponse,
            }
          )}
        />
      </CardHeader>
      {cardContent}
    </Card>
  );
}

export default QAResponseCard;
