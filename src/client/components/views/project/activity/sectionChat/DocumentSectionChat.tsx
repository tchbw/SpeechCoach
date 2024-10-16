import assert from "assert";
import React, { forwardRef, useState } from "react";
import { Document, Thumbnail } from "react-pdf";
import type { GridComponents } from "react-virtuoso";
import { VirtuosoGrid } from "react-virtuoso";

import { useProjectContext } from "@/client/context/ProjectContext";
import { includeReactPdf } from "@/client/util/pdf";
import { api } from "@/utils/api";

includeReactPdf();

type DocumentSectionChatProps = {
  documentId: string;
};

const gridComponents: GridComponents = {
  // eslint-disable-next-line react/display-name
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (
      {
        children,
        ...props
      }: {
        children?: React.ReactNode;
      },
      ref: React.Ref<HTMLDivElement>
    ) => (
      <div ref={ref} {...props} className="flex flex-wrap">
        {children}
      </div>
    )
  ),
  // eslint-disable-next-line react/display-name
  Item: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        className=" flex w-1/5 flex-none content-stretch p-2"
      >
        {children}
      </div>
    )
  ),
};

const DocumentSectionChat: React.FC<DocumentSectionChatProps> = ({
  documentId,
}) => {
  const { company } = useProjectContext();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [startPage, setStartPage] = useState<number | null>(null);
  const [endPage, setEndPage] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const document = api.file.getDocumentFromS3.useQuery(
    {
      companyId: company.id,
      documentId,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  const handleThumbnailClick = (pageNumber: number) => {
    if (startPage === null || (startPage !== null && endPage !== null)) {
      setStartPage(pageNumber);
      setEndPage(null);
    } else if (endPage === null) {
      setEndPage(pageNumber);
    }
  };

  if (document.isLoading) return <div>Loading...</div>;
  if (document.error) return <div>Error: {document.error.message}</div>;

  // TODO: handle this case, which shouldn't technically happen
  assert(document.data, `No document data`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <input
          type="number"
          value={startPage ?? ``}
          onChange={(e) => setStartPage(Number(e.target.value))}
          placeholder="Start Page"
          className="rounded border border-gray-300 px-2 py-1"
        />
        <input
          type="number"
          value={endPage ?? ``}
          onChange={(e) => setEndPage(Number(e.target.value))}
          placeholder="End Page"
          className="rounded border border-gray-300 px-2 py-1"
        />
      </div>
      <Document
        className="h-full w-full"
        file={document.data.documentUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <VirtuosoGrid
          style={{ height: 400 }}
          totalCount={numPages ?? undefined}
          components={gridComponents}
          itemContent={(index) => (
            <div
              className={`flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border p-4 ${
                index + 1 === startPage || index + 1 === endPage
                  ? `border-blue-500`
                  : `border-muted-foreground/20`
              }`}
              onClick={() => handleThumbnailClick(index + 1)}
            >
              <Thumbnail
                pageNumber={index + 1}
                width={100}
                loading={
                  <div className="text-sm text-muted-foreground">
                    loading...
                  </div>
                }
              />
            </div>
          )}
        />
      </Document>
    </div>
  );
};

export default DocumentSectionChat;
