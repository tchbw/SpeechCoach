import type { DocumentParserProvider } from "@/server/services/document-parser/providers";
import reductoApi from "@/server/services/document-parser/providers/reducto/api";

class ReductoProvider implements DocumentParserProvider {
  async parse({
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
  }) {
    return await reductoApi.parse({
      documentUrl: documentUrl,
      pageRange,
      tableOutputFormat,
    });
  }
}

const reductoProvider = new ReductoProvider();

export default reductoProvider;
