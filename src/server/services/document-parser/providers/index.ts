import reductoProvider from "@/server/services/document-parser/providers/reducto/provider";
import type { ReductoParseResponse } from "@/server/services/document-parser/providers/types";
import { DocumentParserProviderEnum } from "@/server/services/document-parser/types";
import { assertUnreachable } from "@/server/util/types";

export abstract class DocumentParserProvider {
  static getProvider(provider: DocumentParserProviderEnum) {
    switch (provider) {
      case DocumentParserProviderEnum.Reducto:
        return reductoProvider;
      default:
        assertUnreachable(provider, `Invalid Document Parser provider`);
    }
  }

  abstract parse({
    documentUrl,
    pageRange,
    tableOutputFormat,
  }: {
    documentUrl: string;
    pageRange?: {
      pageRangeStart: number;
      pageRangeEnd: number;
    };
    tableOutputFormat?: `md` | `html`;
  }): Promise<ReductoParseResponse>;
}
