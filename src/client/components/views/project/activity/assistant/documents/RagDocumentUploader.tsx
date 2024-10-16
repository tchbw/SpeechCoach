import FileUploader from "@/client/components/views/common/FileUploader";
import { useProjectContext } from "@/client/context/ProjectContext";
import { api } from "@/utils/api";

function RagDocumentUploader({
  companyId,
  projectId,
  onDocumentSubmit,
}: {
  companyId: string;
  projectId: string;
  onDocumentSubmit?: () => void;
}) {
  const getPresignedUrlMutation =
    api.file.getPresignedUrlForRagDocumentUpload.useMutation();
  const ingestRagDocumentMutation = api.rag.ingestRagDocument.useMutation();
  const { project, setProject } = useProjectContext();

  return (
    <FileUploader
      getPresignedUrlMutation={async ({ filename, contentType }) => {
        const result = await getPresignedUrlMutation.mutateAsync({
          companyId,
          filename,
          contentType,
        });
        return {
          presignedPutUrl: result.presignedPutUrl,
          key: result.key,
        };
      }}
      onSubmit={async (uploadedFiles) => {
        const { projectDocuments } =
          await ingestRagDocumentMutation.mutateAsync({
            companyId,
            documents: uploadedFiles,
            projectId,
          });
        setProject({
          ...project,
          documents: [...project.documents, ...projectDocuments],
        });
        if (onDocumentSubmit) {
          onDocumentSubmit();
        }
      }}
      submitCopy="Upload documents"
    />
  );
}

export default RagDocumentUploader;
