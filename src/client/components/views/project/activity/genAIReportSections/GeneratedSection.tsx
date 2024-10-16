import { GeneratedSubsection } from "@/client/components/views/project/activity/genAIReportSections/GeneratedSubsection";
import type { ProjectWithDefaults } from "@/server/services/project/model";

export function GeneratedSection({
  section,
}: {
  section: ProjectWithDefaults[`GenAIReportSections`][number];
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">{section.sectionHeading}</h3>
      {section.subSections.map((subSection, index) => (
        <GeneratedSubsection key={index} subSection={subSection} />
      ))}
    </div>
  );
}
