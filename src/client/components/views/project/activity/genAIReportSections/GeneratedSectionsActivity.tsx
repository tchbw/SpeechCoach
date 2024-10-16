import { CardDescription } from "@/client/components/ui/card";
import { TypographyH3 } from "@/client/components/ui/typography/H3";
import ProjectActivityContainer from "@/client/components/views/project/activity/ProjectActivityContainer";

export default function GeneratedReportSectionsActivity() {
  return (
    <ProjectActivityContainer>
      <div className="flex h-full flex-col items-center justify-center">
        <TypographyH3>Coming soon</TypographyH3>
        <CardDescription className="mt-2 text-center">
          Email founders@degrom.co for early access.
        </CardDescription>
      </div>
      {/* <div className="flex w-full flex-col gap-4 p-8">
        <TypographyH3>Section generator</TypographyH3>
        <CardDescription>
          Copy and paste auto-generated report sections into your report.
        </CardDescription>
        {project.GenAIReportSections.map((section, sectionIndex) => (
          <GeneratedSection key={sectionIndex} section={section} />
        ))}
      </div> */}
    </ProjectActivityContainer>
  );
}
