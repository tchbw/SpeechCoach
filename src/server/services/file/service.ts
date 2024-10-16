import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";
import dayjs from "@/init/dayjs";
import { assertUnreachable } from "@/server/util/types";

export type SignedFileType = {
  path: string;
  expires?: number;
  expiresUnit?: dayjs.ManipulateType;
  action: `read` | `write` | `delete`;
  contentType?: string;
  bucket: string;
};

export class FileService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async getPresignedUrlForFile({
    path,
    expires = 15,
    expiresUnit = `minutes`,
    action,
    contentType,
    bucket,
  }: SignedFileType): Promise<string> {
    const expiresAt: dayjs.Dayjs = dayjs().add(expires, expiresUnit);

    let command;
    switch (action) {
      case `read`:
        command = new GetObjectCommand({
          Bucket: bucket,
          Key: path,
        });
        break;
      case `write`:
        command = new PutObjectCommand({
          Bucket: bucket,
          Key: path,
          ContentType: contentType,
        });
        break;
      case `delete`:
        command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: path,
        });
        break;
      default:
        assertUnreachable(action, `Invalid action`);
    }

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresAt.diff(dayjs(), `seconds`),
    });

    return url;
  }

  async downloadFromS3(s3Key: string): Promise<Uint8Array> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: s3Key,
    });

    const { Body } = await this.s3Client.send(getObjectCommand);
    if (!Body) throw new Error(`Failed to fetch file from S3`);

    return await Body.transformToByteArray();
  }
}

export const fileService = new FileService();
