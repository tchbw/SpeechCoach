import { ProjectActivity } from "@/client/hooks/project/useProjectActivity";
import { assertUnreachable } from "@/server/util/types";

export const ProjectFormatter = {
  activity: {
    name: (activity: ProjectActivity) => {
      switch (activity) {
        case ProjectActivity.CHAT:
          return `Report assistant`;
        case ProjectActivity.PRESET_QUESTIONS:
          return `Report writer`;
        case ProjectActivity.GENERATED_SECTIONS:
          return `Section generator`;
        case ProjectActivity.QUICK_EXTRACT:
          return `Quick extractor`;
        default:
          assertUnreachable(activity, `Unknown project activity`);
      }
    },
  },
};
