import { useMemo } from "react";

import { GeneratedParagraph } from "@/client/components/views/project/activity/genAIReportSections/GeneratedParagraph";
import type { ProjectWithDefaults } from "@/server/services/project/model";

export function GeneratedSubsection({
  subSection,
}: {
  subSection: ProjectWithDefaults[`GenAIReportSections`][number][`subSections`][number];
}) {
  const sortedParagraphs = useMemo(() => {
    return [...subSection.Paragraphs].sort((a, b) => {
      if (a.order && b.order) {
        return a.order.comparedTo(b.order);
      }
      return 0;
    });
  }, [subSection.Paragraphs]);

  return (
    <div className="mt-4">
      <h4 className="text-md font-medium">{subSection.subSectionHeading}</h4>
      {sortedParagraphs.map((paragraph, index) => (
        <GeneratedParagraph key={index} paragraph={paragraph} />
      ))}
    </div>
  );
}
