import { ParsedDocumentType } from "@prisma/client";

import { env } from "@/env";
import { logger } from "@/init/logger";
import { prisma } from "@/server/init/db";
import { hasProjectPerm } from "@/server/services/authorization/service";
import { ProjectAction } from "@/server/services/authorization/types";
import { BaseService } from "@/server/services/BaseService";
import { DocumentParserProvider } from "@/server/services/document-parser/providers";
import {
  reductoParseResponseSchema,
  reductoParseResultSchema,
} from "@/server/services/document-parser/providers/types";
import type { DocumentParserProviderEnum } from "@/server/services/document-parser/types";
import { fileService } from "@/server/services/file/service";
import { getFileExtension } from "@/utils/file";

export class DocumentParserService extends BaseService {
  async parseProjectDocument({
    documentKey,
    documentName,
    projectId,
    provider,
  }: {
    documentKey: string;
    documentName: string;
    projectId: string;
    provider: DocumentParserProviderEnum;
  }) {
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    });
    await hasProjectPerm(this.ctx, [ProjectAction.UPLOAD_DOCUMENT], project);

    const documentParser = DocumentParserProvider.getProvider(provider);

    const presignedGetUrl = await fileService.getPresignedUrlForFile({
      path: documentKey,
      action: `read`,
      bucket: env.AWS_S3_BUCKET,
      expires: 1,
      expiresUnit: `days`,
    });

    const resp = await documentParser.parse({
      documentUrl: presignedGetUrl,
    });
    logger.info(`Document parsing response:`, JSON.stringify(resp, null, 2));
    const result = reductoParseResponseSchema.parse(resp);
    const response = await fetch(result.result.url);
    // const response = await fetch(
    //   `https://v1-reducto-processing-bucket.s3.amazonaws.com/dbe20b40-f4c7-42b2-899e-3bce30e734d2.json?AWSAccessKeyId=ASIA2UOK6OVBHODJ5TLW&Signature=FwEUVPWqxwh2ct%2BvYe5QVnQp7Dc%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEJ7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQDWu%2B4NgWbZKAa8QqM%2BKBF15E6vNuHCm8uwjwbvPWgLqgIgLsXi3Hk55oJjfjomk08usuJCbHfu892qX9Nn%2F6qWWgYq8QIIt%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw3MzExMDY5MzIwMzQiDD3b%2B4Vsz3a38nG0hSrFAihNWLTHZeYz%2FssQcne8mdiP0xyRKV5p%2FctWlq41SHPDlPIztajnbk8szAd2At9eQ03yf5HwYY7GznwNFRcYo3CC2nb8wY8wTmyFxW9pQFWeIhc0W1beTJLKLYUpJnPFrQcgh1o7xkUFTNtA09VUuWIS6PV5%2FQx3Gjpe%2B9muczApiECYvkY43ZKxHLA1ZidtFsFHsnhYM5MTINpCJhPfV%2BUEaCEEGh8OkVuwTB1DraCPALOyzecW9UQAHkBhBkCdMKQmItMi%2FSAZcRgHAskRWrHr00gXQRz2gCr97LYOQHk2kUtqQ%2FOctIM1J2RJzM13e%2Bp24b%2FmLttZCbTVwNoymvGz4SpBwwia0unkoqG%2Fp7VaEAMPaLagoK26vnpOpKVdWK1KfRoj9Fyo9SyqDweRW5Bo4bL2DBjZ%2F%2BjvRpqIUkUnwEssV40w0cDatgY6ngHofo7hh%2BzF9VN3cQXS5BT8JY5gD8vO%2FE9GcqAMwhKPkauk%2FOXEZW5EtgR8TVpqZNbTki1B9wWFl2frnJOPKmEatBUcCtfUVoDUGTBDD%2FxpyTglxcZyow%2FBtNLDPtpo2okkfjHXTQRcq9AA65CRljvxSYLELa43Ll%2F8ZR7VbIhLCj8xSA3YLiLOH6g68YVMbzTpow%2BYn9z%2BTqHazgWtYg%3D%3D&Expires=1725346132`
    // );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch parsed document: ${response.statusText}`
      );
    }
    const reductoParseResult = reductoParseResultSchema.parse(
      await response.json()
    );
    // Determine document type based on file extension
    const fileExtension = getFileExtension(documentKey);
    let documentType: ParsedDocumentType;
    if (fileExtension === `pdf`) {
      documentType = ParsedDocumentType.PDF;
    } else if (
      [`jpg`, `jpeg`, `png`, `gif`, `bmp`, `tiff`].includes(fileExtension || ``)
    ) {
      documentType = ParsedDocumentType.IMAGE;
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    await prisma.parsedDocument.create({
      data: {
        projectId,
        parsedDocument: JSON.stringify(reductoParseResult),
        s3Key: documentKey,
        // parserResultId: reductoParseResult.id,
        parserResultId: `reductoParseResult.id`,
        documentType,
        documentName,
      },
    });
    return reductoParseResult;
  }
}
