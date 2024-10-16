import clsx from "clsx";
import { BookA, BookMarked, FileText, MessageSquareMore } from "lucide-react";

import {
  enabledProjectActivities,
  ProjectActivity,
  useCurrentProjectActivity,
} from "@/client/hooks/project/useProjectActivity";
import { assertUnreachable } from "@/server/util/types";
import { ProjectFormatter } from "@/utils/formatting/project";

export function ProjectActivitySelector() {
  const { currentProjectActivity, changeActivity } =
    useCurrentProjectActivity();

  return (
    <nav className="flex flex-col items-start gap-1 px-2 py-2 text-sm font-medium lg:px-4">
      <div className="text-muted-foreground/80">Toolbox</div>
      {Object.values(enabledProjectActivities).map((activity) => (
        <button
          key={activity}
          className={clsx(
            `flex items-center gap-2 self-stretch py-1 text-muted-foreground`,
            {
              "text-primary": currentProjectActivity === activity,
            }
          )}
          onClick={() => changeActivity(activity)}
        >
          <ProjectActivityIcon activity={activity} />
          {ProjectFormatter.activity.name(activity)}
        </button>
      ))}
    </nav>
  );
}

function ProjectActivityIcon({ activity }: { activity: ProjectActivity }) {
  switch (activity) {
    case ProjectActivity.CHAT:
      return <MessageSquareMore className="h-4 w-4 flex-none" />;
    case ProjectActivity.GENERATED_SECTIONS:
      return <BookA className="h-4 w-4 flex-none" />;
    case ProjectActivity.PRESET_QUESTIONS:
      return <BookMarked className="h-4 w-4 flex-none" />;
    case ProjectActivity.QUICK_EXTRACT:
      return <FileText className="h-4 w-4 flex-none" />;
    default:
      assertUnreachable(activity, `Unknown project activity`);
  }
}
