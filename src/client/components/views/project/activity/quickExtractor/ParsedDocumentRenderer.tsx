import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/client/components/ui/resizable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import ParsedBlock from "@/client/components/views/project/activity/quickExtractor/ParsedBlock";
import { useAvailableHeight } from "@/client/hooks/use-available-height";
import type { ReductoParseResult } from "@/server/services/document-parser/providers/types";
import { isImageMimeType } from "@/utils/file";

const UploadedDocumentViewer = dynamic(
  () =>
    import(
      `@/client/components/views/project/activity/quickExtractor/UploadedDocumentViewer`
    ),
  { ssr: false }
);

function ParsedDocumentRenderer({
  parsedDocument,
  documentUrl,
  documentMimeType,
}: {
  parsedDocument: ReductoParseResult;
  documentUrl: string;
  documentMimeType: string | null;
}) {
  const combinedContent = parsedDocument
    .map((item) => item.content)
    .join(`\n\n`);
  const tables = parsedDocument.flatMap((item) =>
    item.blocks.filter((block) => block.type === `Table`)
  );

  const [pdfViewerWidth, setPdfViewerWidth] = useState<number>(0);

  const tabsContentRef = useRef<HTMLDivElement>(null);
  const availableHeight = useAvailableHeight(tabsContentRef);

  return (
    <>
      <Tabs
        defaultValue="tables"
        ref={tabsContentRef}
        style={{ height: availableHeight }}
        className="flex flex-col overflow-hidden"
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full flex-1 overflow-hidden"
        >
          <ResizablePanel
            className="flex flex-col overflow-hidden"
            onResize={setPdfViewerWidth}
          >
            <div className="h-full w-full flex-1 overflow-auto">
              {documentMimeType && isImageMimeType(documentMimeType) ? (
                <img src={documentUrl} alt="Uploaded document" />
              ) : (
                <UploadedDocumentViewer
                  documentUrl={documentUrl}
                  containerWidthPercent={pdfViewerWidth}
                />
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            minSize={20}
            className="flex flex-col overflow-hidden"
          >
            <TabsList
              className="grid w-full grid-cols-2 rounded-none"
              defaultValue="tables"
            >
              <TabsTrigger
                value="tables"
                className="overflow-hidden text-ellipsis text-sm"
              >
                Extracted tables
              </TabsTrigger>
              <TabsTrigger
                value="parsedDocument"
                className="overflow-hidden text-ellipsis text-sm"
              >
                Parsed Document
              </TabsTrigger>
            </TabsList>
            <div className="h-full flex-1 overflow-auto">
              <TabsContent value="tables" className="h-full overflow-auto">
                {tables.map((table, index) => (
                  <ParsedBlock key={index} parsedMd={table.content} />
                ))}
              </TabsContent>
              <TabsContent
                value="parsedDocument"
                className="h-full overflow-auto"
              >
                <ParsedBlock parsedMd={combinedContent} />
              </TabsContent>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Tabs>
    </>
  );
}

export default ParsedDocumentRenderer;
