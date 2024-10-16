import { PDFDocument } from "pdf-lib";

import { fileService } from "@/server/services/file/service";
export async function extractPdfPages({
  source,
  startPage,
  endPage,
}: {
  source: { s3Key: string } | { fileBytes: Uint8Array };
  startPage: number;
  endPage: number;
}): Promise<Buffer> {
  let pdfBytes: Uint8Array;

  if (`fileBytes` in source) {
    pdfBytes = source.fileBytes;
  } else {
    pdfBytes = await fileService.downloadFromS3(source.s3Key);
  }

  // Load the PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Create a new PDF document
  const newPdfDoc = await PDFDocument.create();

  // Copy the specified pages
  const pages = await newPdfDoc.copyPages(
    pdfDoc,
    Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
  );
  pages.forEach((page) => newPdfDoc.addPage(page));

  // Save the new PDF as a buffer
  const newPdfBytes = await newPdfDoc.save();
  return Buffer.from(newPdfBytes);
}
