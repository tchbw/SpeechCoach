import ChatSection from "@/client/components/views/project/activity/assistant/ChatAssistantActivity";
import GeneratedReportSectionsActivity from "@/client/components/views/project/activity/genAIReportSections/GeneratedSectionsActivity";
import PresetQuestionsActivity from "@/client/components/views/project/activity/presetQuestions/PresetQuestionsActivity";
import QuickExtractorActivity from "@/client/components/views/project/activity/quickExtractor/QuickExtractorActivity";
import {
  ProjectActivity,
  useCurrentProjectActivity,
} from "@/client/hooks/project/useProjectActivity";
import { logger } from "@/init/logger";

type ProjectActivityRendererProps = {
  starterQuestions: string[];
};

export function ProjectActivityRenderer({
  starterQuestions,
}: ProjectActivityRendererProps) {
  const { currentProjectActivity } = useCurrentProjectActivity();

  switch (currentProjectActivity) {
    case ProjectActivity.CHAT:
      return <ChatSection starterQuestions={starterQuestions} />;
    case ProjectActivity.PRESET_QUESTIONS:
      return <PresetQuestionsActivity />;
    case ProjectActivity.GENERATED_SECTIONS:
      return <GeneratedReportSectionsActivity />;
    case ProjectActivity.QUICK_EXTRACT:
      return <QuickExtractorActivity />;
    default:
      const neverActivity: never = currentProjectActivity;
      logger.error({ neverActivity }, `Unknown project activity`);
      return <div>Unknown Activity</div>;
  }
}
