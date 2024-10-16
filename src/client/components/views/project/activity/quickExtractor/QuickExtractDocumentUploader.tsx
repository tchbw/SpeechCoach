import React from "react";

import FileUploader, {
  MimeType,
} from "@/client/components/views/common/FileUploader";
import SimulatedProgressBar from "@/client/components/views/common/SimulatedProgressBar";
import type { ReductoParseResult } from "@/server/services/document-parser/providers/types";
import { api } from "@/utils/api";

function QuickExtractDocumentUploader({
  companyId,
  projectId,
  onDocumentSubmit,
}: {
  companyId: string;
  projectId: string;
  onDocumentSubmit?: ({
    parsedDocument,
    documentUrl,
    s3Key,
  }: {
    parsedDocument: ReductoParseResult;
    documentUrl: string;
    s3Key: string;
  }) => void;
}) {
  const getPresignedUrlMutation =
    api.file.getPresignedUrlForQuickDocumentUpload.useMutation();
  const quickExtractDocumentMutation =
    api.project.quickExtractDocument.useMutation();
  const [documentUrl, setDocumentUrl] = React.useState<string | null>(null);

  return (
    <>
      <FileUploader
        dropzoneCopy="Drop an image or PDF here to extract data (max 2MB)"
        maxFiles={1}
        allowedMimeTypes={[MimeType.PDF, MimeType.JPEG, MimeType.PNG]}
        maxFileSize={2 * 1024 * 1024} // 2MB in bytes
        getPresignedUrlMutation={async ({ filename, contentType }) => {
          const result = await getPresignedUrlMutation.mutateAsync({
            companyId,
            filename,
            contentType,
          });
          setDocumentUrl(result.presignedGetUrl);
          return {
            presignedPutUrl: result.presignedPutUrl,
            key: result.key,
          };
        }}
        onSubmit={async (uploadedFiles) => {
          const file = uploadedFiles[0]!;
          const parsedDocument = await quickExtractDocumentMutation.mutateAsync(
            {
              projectId,
              documentKey: file.s3Key,
              companyId,
              documentName: file.name,
            }
          );
          if (onDocumentSubmit) {
            onDocumentSubmit({
              parsedDocument,
              documentUrl: documentUrl!,
              s3Key: file.s3Key,
            });
          }
        }}
        submitCopy="Extract document"
      />
      {quickExtractDocumentMutation.isPending && <SimulatedProgressBar />}
    </>
  );
}

export default QuickExtractDocumentUploader;
