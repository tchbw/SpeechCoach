import { useRef, useState } from "react";

import { Button } from "@/client/components/ui/button";
import { CardDescription } from "@/client/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import ProjectActivityContainer from "@/client/components/views/project/activity/ProjectActivityContainer";
import ParsedDocumentRenderer from "@/client/components/views/project/activity/quickExtractor/ParsedDocumentRenderer";
import PastExtractions from "@/client/components/views/project/activity/quickExtractor/PastExtractions";
import QuickExtractDocumentUploader from "@/client/components/views/project/activity/quickExtractor/QuickExtractDocumentUploader";
import { useProjectContext } from "@/client/context/ProjectContext";
import type { ReductoParseResult } from "@/server/services/document-parser/providers/types";
import { api } from "@/utils/api";
import { getMimeTypeFromS3Key } from "@/utils/file";

export default function QuickExtractorActivity() {
  const { project, company } = useProjectContext();
  const tabsContentRef = useRef<HTMLDivElement>(null);

  const pastExtractionsQuery = api.project.getPastQuickExtractions.useQuery(
    { projectId: project.id, companyId: company.id },
    { refetchOnWindowFocus: false, refetchOnMount: false }
  );

  return (
    <ProjectActivityContainer>
      <div className="flex h-full w-full flex-col gap-4 p-8">
        <CardDescription>
          Upload an image or PDF and automatically extract all tables and text.
        </CardDescription>
        <Tabs defaultValue="extract">
          <TabsList>
            <TabsTrigger value="extract">Quick extract</TabsTrigger>
            <TabsTrigger value="history">Past extractions</TabsTrigger>
          </TabsList>
          <TabsContent
            value="extract"
            ref={tabsContentRef}
            className=" flex flex-1 flex-col gap-4 overflow-y-auto"
          >
            <ExtractDocumentTab
              project={project}
              onExtraction={() => void pastExtractionsQuery.refetch()}
            />
          </TabsContent>
          <TabsContent value="history">
            <PastExtractions
              companyId={company.id}
              pastExtractions={pastExtractionsQuery.data}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProjectActivityContainer>
  );
}

type ExtractDocumentTabProps = {
  project: { id: string; companyId: string };
  onExtraction: () => void;
};

function ExtractDocumentTab({
  project,
  onExtraction,
}: ExtractDocumentTabProps) {
  const [parsedDocumentResult, setParsedDocumentResult] = useState<{
    parsedDocument: ReductoParseResult;
    documentUrl: string;
    s3Key: string;
  } | null>(null);

  if (parsedDocumentResult) {
    return (
      <>
        <Button onClick={() => setParsedDocumentResult(null)}>
          Start new extraction
        </Button>
        <div>
          <ParsedDocumentRenderer
            parsedDocument={parsedDocumentResult.parsedDocument}
            documentUrl={parsedDocumentResult.documentUrl}
            documentMimeType={getMimeTypeFromS3Key(parsedDocumentResult.s3Key)}
          />
        </div>
      </>
    );
  }

  return (
    <QuickExtractDocumentUploader
      companyId={project.companyId}
      projectId={project.id}
      onDocumentSubmit={({ parsedDocument, documentUrl, s3Key }) => {
        setParsedDocumentResult({
          parsedDocument,
          documentUrl,
          s3Key,
        });
        onExtraction();
      }}
    />
  );
}
