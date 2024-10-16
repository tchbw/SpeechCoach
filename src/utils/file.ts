import mime from "mime-types";

/**
 * Get the MIME type from an S3 key (file path)
 * @param s3Key The S3 key (file path)
 * @returns The MIME type of the file, or null if it can't be determined
 */
export function getMimeTypeFromS3Key(s3Key: string): string | null {
  const extension = s3Key.split(`.`).pop();
  if (!extension) {
    return null;
  }

  const mimeType = mime.lookup(extension);
  return mimeType || null;
}

/**
 * Check if a given MIME type represents an image
 * @param mimeType The MIME type to check
 * @returns True if the MIME type represents an image, false otherwise
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith(`image/`);
}

/**
 * Get the file extension from a file path or S3 key
 * @param filePath The file path or S3 key
 * @returns The file extension (lowercase) or null if no extension is found
 */
export function getFileExtension(filePath: string): string | null {
  const extension = filePath.split(`.`).pop()?.toLowerCase();
  return extension || null;
}
