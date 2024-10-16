import { randomUUID } from "crypto";

export const FileUtil = {
  getRagDocumentKey: (companyId: string, filename: string) => {
    return `company/${companyId}/rag/${filename}-${randomUUID()}/${filename}`;
  },

  parseCompanyIdFromRagDocumentKey: (key: string): string => {
    return key.split(`/`)[1]!;
  },
};
