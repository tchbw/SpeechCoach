import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

import { assertUnreachable } from "@/server/util/types";

export enum ProjectActivity {
  PRESET_QUESTIONS = `PRESET_QUESTIONS`,
  CHAT = `CHAT`,
  GENERATED_SECTIONS = `GENERATED_SECTIONS`,
  QUICK_EXTRACT = `QUICK_EXTRACT`,
}

export const enabledProjectActivities = [
  ProjectActivity.CHAT,
  ProjectActivity.QUICK_EXTRACT,
  ProjectActivity.PRESET_QUESTIONS,
  ProjectActivity.GENERATED_SECTIONS,
];

export function useCurrentProjectActivity(): {
  currentProjectActivity: ProjectActivity;
  changeActivity: (activity: ProjectActivity) => void;
} {
  const router = useRouter();

  const currentProjectActivity = useMemo(() => {
    const activityParam = router.query.activity;

    if (typeof activityParam !== `string`) {
      return ProjectActivity.CHAT;
    }

    const activity = activityParam.toUpperCase() as ProjectActivity;
    switch (activity) {
      case ProjectActivity.GENERATED_SECTIONS:
        return ProjectActivity.GENERATED_SECTIONS;
      case ProjectActivity.CHAT:
        return ProjectActivity.CHAT;
      case ProjectActivity.QUICK_EXTRACT:
        return ProjectActivity.QUICK_EXTRACT;
      case ProjectActivity.PRESET_QUESTIONS:
        return ProjectActivity.PRESET_QUESTIONS;
      default:
        assertUnreachable(activity, `Invalid project activity`);
    }
  }, [router.query.activity]);

  const changeActivity = useCallback(
    (activity: ProjectActivity) => {
      void router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, activity: activity.toLowerCase() },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  return { currentProjectActivity, changeActivity };
}
