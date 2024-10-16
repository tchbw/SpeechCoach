import { CircleX } from "lucide-react";
import mime from "mime-types";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { Button } from "@/client/components/ui/button";
import { CardDescription } from "@/client/components/ui/card";
import { logger } from "@/init/logger";

export enum MimeType {
  PDF = `application/pdf`,
  JPEG = `image/jpeg`,
  PNG = `image/png`,
}

type FileUploaderProps = {
  getPresignedUrlMutation: (args: {
    filename: string;
    contentType: string;
  }) => Promise<{ presignedPutUrl: string; key: string }>;
  onSubmit: (
    uploadedFiles: Array<{ name: string; s3Key: string }>
  ) => void | Promise<void>;
  submitCopy: string;
  allowedMimeTypes?: MimeType[];
  dropzoneCopy?: string;
};

function FileUploader({
  getPresignedUrlMutation,
  onSubmit,
  submitCopy,
  maxFiles = 10,
  maxFileSize,
  allowedMimeTypes,
  dropzoneCopy = `Drop some files here, or click to select files`,
}: FileUploaderProps & { maxFiles?: number; maxFileSize?: number }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      name: string;
      s3Key: string;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      setIsUploading(true);

      const uploadPromises = acceptedFiles
        .slice(0, maxFiles - files.length)
        .map(async (file) => {
          if (maxFileSize && file.size > maxFileSize) {
            toast.error(`File ${file.name} exceeds the maximum file size.`);
            return null;
          }

          try {
            const { presignedPutUrl, key } = await getPresignedUrlMutation({
              filename: file.name,
              contentType: file.type,
            });

            const uploadResponse = await fetch(presignedPutUrl, {
              method: `PUT`,
              body: file,
              headers: {
                "Content-Type": file.type,
              },
            });

            if (uploadResponse.ok) {
              return { name: file.name, s3Key: key };
            } else {
              throw new Error(`Upload failed`);
            }
          } catch (error) {
            logger.error({ error }, `Error uploading file`);
            toast.error(`Something went wrong uploading your file. Try again?`);
            return null;
          }
        });

      const uploadedResults = await Promise.all(uploadPromises);
      setUploadedFiles([
        ...uploadedFiles,
        ...uploadedResults.filter(
          (result): result is { name: string; s3Key: string } => result !== null
        ),
      ]);
      setIsUploading(false);
    },
    [getPresignedUrlMutation, files, uploadedFiles, maxFiles, maxFileSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => void onDrop(acceptedFiles),
    maxFiles: maxFiles - files.length,
    maxSize: maxFileSize,
    disabled: isSubmitting || isUploading,
    accept: allowedMimeTypes?.reduce<{ [mimeType: string]: string[] }>(
      (acc, mimeType) => {
        const ext = mime.extension(mimeType);
        if (ext) {
          acc[mimeType] = [`.${ext}`];
        }
        return acc;
      },
      {}
    ),
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((file) => {
        if (maxFileSize && file.file.size > maxFileSize) {
          toast.error(
            `File ${file.file.name} exceeds the maximum file size of ${maxFileSize / (1024 * 1024)}MB.`
          );
        }
      });
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    logger.info({ uploadedFiles }, `Submitted files:`);

    try {
      await onSubmit(uploadedFiles);
      setUploadedFiles([]);
      setFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = (s3Key: string) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.s3Key !== s3Key)
    );
    setFiles((prevFiles) =>
      prevFiles.filter(
        (file) =>
          file.name !== uploadedFiles.find((uf) => uf.s3Key === s3Key)?.name
      )
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        style={dropzoneStyles}
        className="bg-muted text-muted-foreground"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : isUploading ? (
          <p>Uploading files...</p>
        ) : isSubmitting ? (
          <p>
            <span className="spinner" />
          </p>
        ) : (
          <p>{dropzoneCopy}</p>
        )}
      </div>
      <div>
        <ul>
          {uploadedFiles.map((file) => (
            <li key={file.s3Key}>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <span>{file.name}</span>
                  <CircleX
                    className={`h-4 w-4 ${isSubmitting ? `` : `cursor-pointer`}`}
                    onClick={() =>
                      !isSubmitting && handleRemoveFile(file.s3Key)
                    }
                  />
                </div>
              </CardDescription>
            </li>
          ))}
        </ul>
      </div>

      {/* {files.length > 0 && (
        <div>
          <TypographyH4>Uploaded files:</TypographyH4>
          <ul>
            {files.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )} */}
      <Button
        onClick={handleSubmit}
        disabled={uploadedFiles.length === 0 || isSubmitting || isUploading}
      >
        {isUploading ? `Uploading...` : submitCopy}
      </Button>
    </div>
  );
}

const dropzoneStyles = {
  border: `2px dashed #cccccc`,
  borderRadius: `4px`,
  padding: `20px`,
  textAlign: `center`,
  cursor: `pointer`,
} as const;

export default FileUploader;
