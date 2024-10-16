import type { ParsedDocument } from "@prisma/client";
import React from "react";

import { reductoParseResultSchema } from "@/server/services/document-parser/providers/types";
import { api } from "@/utils/api";
import { getMimeTypeFromS3Key } from "@/utils/file";

import ParsedDocumentRenderer from "./ParsedDocumentRenderer";

type PastParsedDocumentProps = {
  parsedDocument: ParsedDocument;
  companyId: string;
};

const PastParsedDocument: React.FC<PastParsedDocumentProps> = ({
  parsedDocument,
  companyId,
}) => {
  const { data, isLoading } = api.file.getPresignedDownloadUrlForKey.useQuery(
    { key: parsedDocument.s3Key, companyId },
    { refetchOnWindowFocus: false, refetchOnMount: false }
  );

  if (isLoading) {
    return <div>Loading document...</div>;
  }

  if (!data) {
    return <div>Error loading document</div>;
  }

  return (
    <ParsedDocumentRenderer
      parsedDocument={reductoParseResultSchema.parse(
        JSON.parse(parsedDocument.parsedDocument as unknown as string)
      )}
      documentUrl={data.presignedGetUrl}
      documentMimeType={getMimeTypeFromS3Key(parsedDocument.s3Key)}
    />
  );
};

export default PastParsedDocument;
