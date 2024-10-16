// Args: projectId, documentId, startPage, endPage, prompt

async function main() {
  // async function main({
  //   projectId,
  //   documentId,
  //   startPage,
  //   endPage,
  //   prompt,
  // }: {
  //   projectId: string;
  //   documentId: string;
  //   startPage: number;
  //   endPage: number;
  //   prompt: string;
  // }) {
  // LLAMA
  // const path = `/Users/thomaschang/Projects/Degrom/PLYMOUTH-4239000-ASR-2013.pdf`;
  // const reader = new LlamaParseReader({
  //   apiKey: env.LLAMA_CLOUD_API_KEY,
  //   resultType: `markdown`,
  //   targetPages: `63`,
  //   // targetPages: `62,63,64,65,66,67,68,69,70,71,72,73,74,75`,
  // });
  // const documents = await reader.loadData(path);
  // console.log(
  //   `PARSING OUTPUT\n`,
  //   documents.map((d) => d.getContent()).join(`===\n\n`)
  // );
  // UNSTRUCTURED
  // const client = new UnstructuredClient({
  //   serverURL: `https://api.unstructuredapp.io/general/v0/general`,
  //   security: {
  //     apiKeyAuth: env.UNSTRUCTURED_API_KEY,
  //   },
  // });
  // const filename = `/Users/thomaschang/Projects/Degrom/PLYMOUTH-4239000-ASR-2013.pdf`;
  // const data = fs.readFileSync(
  //   `/Users/thomaschang/Projects/Degrom/PLYMOUTH-4239000-ASR-2013.pdf`
  // );
  // const res = await client.general.partition({
  //   partitionParameters: {
  //     files: {
  //       content: data,
  //       fileName: filename,
  //     },
  //     strategy: Strategy.HiRes,
  //     splitPdfPage: true,
  //     splitPdfAllowFailed: true,
  //     splitPdfConcurrencyLevel: 15,
  //     languages: [`eng`],
  //   },
  // });
  // const jsonElements = JSON.stringify(res.elements, null, 2);
  // // Print the processed data.
  // console.log(`PARSING OUTPUT\n`, jsonElements);
  // // Write the processed data to a local file.
  // fs.writeFileSync(
  //   `/Users/thomaschang/Projects/Degrom/PLYMOUTH-Unstructured-parse-output2.md`,
  //   jsonElements
  // );
  // // ${documents.map((d) => d.getContent()).join(`===\n\n`)}
  // //
  // const systemPrompt = `These are very important to follow:
  // You are "Degrom AI", a professional but friendly AI chatbot working as an assitant to the user.
  // Your current task is to help the user based on all of the information available to you shown below.
  // Answer informally, directly, and concisely without a heading or greeting but include everything relevant.
  // Use richtext Markdown when appropriate including bold, italic, paragraphs, and lists when helpful.
  // If using LaTeX, use double $$ as delimiter instead of single $. Use $$...$$ instead of parentheses.
  // Organize information into multiple sections or points when appropriate.
  // Don't include raw item IDs or other raw fields from the source.
  // Don't use XML or other markup unless requested by the user.
  // Here is all of the information available to answer the user:
  // ===
  // ${jsonElements}
  // ===
  // If the user asked for a search and there are no results, make sure to let the user know that you couldn't find anything,
  // and what they might be able to do to find the information they need.
  // END SYSTEM INSTRUCTIONS`;
  // const results = await GptUtil.getCompletion({
  //   model: `gpt-4o`,
  //   messages: [
  //     {
  //       role: `system`,
  //       content: systemPrompt,
  //     },
  //     {
  //       role: `user`,
  //       content: `Get me all data in a formatted table`,
  //     },
  //   ],
  // });
  // console.log(`RESULTS\n`, results.content);
}

// assert(process.argv[2], `projectId is required`);
// assert(process.argv[3], `documentId is required`);
// assert(process.argv[4], `startPage is required`);
// assert(process.argv[5], `endPage is required`);
// assert(process.argv[6], `prompt is required`);

// await main({
//   projectId: process.argv[2],
//   documentId: process.argv[3],
//   startPage: parseInt(process.argv[4], 10),
//   endPage: parseInt(process.argv[5], 10),
//   prompt: process.argv[6],
// });

await main();

// '| **Source ID** | **Source Name**                  | **Location**                     | **Status** | **Source Availability** | **Withdrawal Units** | **Latitude** | **Longitude** | **Well Type**     | **Well Depth (ft.)** | **Casing Height (ft.)** | **Casing Depth (ft.)** | **Screen Length (ft.)** | **Pump Setting (ft)** | **Approved Daily Pumping Volume (MGD)** | **Total Amount Pumped** | **Date of Meter Installation** | **Total # of Days Pumped** | **Type of Water Metered** | **Max Single Day Pumped Volume** | **Last Meter Calibration** | **Date of Max Amount Pumped** |\n' +
// '|----------------|----------------------------------|----------------------------------|------------|------------------------|----------------------|--------------|---------------|--------------------|-----------------------|--------------------------|-------------------------|--------------------------|------------------------|-------------------------------------|--------------------------|-------------------------------|\n' +
// '| 4239000 03G     | SHIP POND WELL                   | PLYMOUTH 137 SHIP POND ROAD     | A          | ACTIVE                 | GAL                  | 41.87487     | -70.540566    | GRAVEL PACKED      | 100                   | 1                        | 77                      | 30                       | 69                     | 0.864                               | 0                        | N/A                           | 0                             | Protection                | N/A                             | N/A                      | N/A                           |\n' +
// '| 4239000 04G     | FEDERAL FURNACE GP WELL          | PLYMOUTH 254 FEDERAL FURNACE RD  | A          | ACTIVE                 | GAL                  | 41.914765    | -70.703819    | GRAVEL PACKED      | 83.5                  | 0.5                      | 63.5                    | 20                       | 60                     | 0.792                               | 101,756,646              | 11/10/2009                   | 364                           | FINISHED DEPARTMENT       | 515,088                         | 11/13/2013              | 2/11/2013                    |\n' +
// '| 4239000 05G     | NO. PLYMOUTH GP WELL             | PLYMOUTH 80 INDUSTRIAL PARK RD   | A          | ACTIVE                 | GAL                  | 41.955184    | -70.704614    | GRAVEL PACKED      | 120                   | 1.5                      | 95                      | 25                       | 90                     | 1.526                               | 113,148,351              | 9/9/2009                     | 364                           | FINISHED                 | 655,699                         | 11/12/2013              | 4/10/2013                    |\n' +
// '| 4239000 06G     | BRADFORD GP WELL                 | PLYMOUTH 17R NATALIE WAY        | A          | ACTIVE                 | GAL                  | 41.927467    | -70.663176    | GRAVEL PACKED      | 167                   | 3                        | 126                     | 41                       | 80                     | 1.512                               | 86,659,090               | 1/1/2007                     | 363                           | RAW                      | 465,600                         | 11/12/2013              | 4/16/2013                    |\n' +
// '| 4239000 07G     | ELLISVILLE GP WELL               | PLYMOUTH ROUTE 3A 1649 STATE RD | A          | ACTIVE                 | GAL                  | 41.853716    | -70.544032    | GRAVEL PACKED      | 136                   | 1.5                      | 106                     | 30                       | 0                      | 1.123                               | 140,265,478              | 1/1/1982                     | 364                           | FINISHED                 | 1,030,165                       | 11/13/2013              | 2/11/2013                    |\n' +
// '| 4239000 08G     | DARBY POND WELL                  | PLYMOUTH 119 GRAFFAM ROAD       | A          | ACTIVE                 | GAL                  | 41.937126    | -70.742233    | GRAVEL PACKED      | 91                    | 2                        | 65.5                    | 25.5                     | 66                     | 0.8                                 | 140,265,478              | 1/1/1982                     | 364                           | FINISHED                 | 1,030,165                       | 11/13/2013              | 2/11/2013                    |\n' +
// '| 4239000 09G     | SOUTH POND WELL 1                | PLYMOUTH 116 ROCKY POND ROAD    | A          | ACTIVE                 | GAL                  | 41.911122    | -70.675368    | GRAVEL PACKED      | 140                   | 0                        | 116                     | 25                       | 116                   | 1.12                                | 136,545,740              | 1/1/1993                     | 353                           | FINISHED                 | 695,629                         | 11/12/2013              | 7/8/2013                     |\n' +
// '| 4239000 10G     | SOUTH POND WELL 2                | PLYMOUTH                         | A          | ACTIVE                 | GAL                  | 41.912226    | -70.677498    | GRAVEL PACKED      | 114                   | 1.5                      | 84                      | 20                       | 82                     | 1.5                                 | 207,877,288              | 1/1/2007                     | 362                           | PROTECTION               | 1,026,484                       | 11/12/2013              | 7/5/2013                     |\n' +
// '| 4239000 11G     | SAVERY POND WELL                 | PLYMOUTH 61 QUAIL RUN           | A          | ACTIVE                 | GAL                  | 41.844236    | -70.56538     | GRAVEL PACKED      | 116                   | 3                        | 0                       | 30                       | 84                     | N/A                                 | 235,024,503              | 2/1/1998                     | 364                           | PROTECTION               | 1,521,047                       | 11/12/2013              | 2/12/2013                    |\n' +
// '| 4239000 12G     | BRADFORD REPLACEMENT WELL        | PLYMOUTH 17R NATALIE WAY        | A          | ACTIVE                 | GAL                  | 41.927472    | -70.66341     | GRAVEL PACKED      | 116                   | 3                        | 0                       | 30                       | 84                     | 0.94                                | 156,125,605              | 1/1/2002                     | 364                           | PROTECTION               | 1,374,413                       | 11/13/2013              | 7/22/2013                    |\n' +
// '| 4239000 13G     | LOUT POND REPLACEMENT WELL       | PLYMOUTH 262 BILLINGTON STREET   | I          | N/A                    | GAL                  | 41.936398    | -70.667014    | GRAVEL PACKED      | 52                    | 0                        | 0                       | 10                       | 0                      | 0.504                               | 85,913,190               | 1/1/2006                     | 363                           | PROTECTION               | 455,300                         | 11/12/2013              | 4/16/2013                    |\n' +
// '| 4239000 14G     | WANNOS POND REPLACEMENT WELL     | PLYMOUTH 20 ACACIA ROAD         | A          | ACTIVE                 | GAL                  | 41.908039    | -70.559057    | GRAVEL PACKED      | 101                   | 0                        | 0                       | 30                       | 69                     | 0.94                                | 84,066,609               | 10/1/2012                    | 298                           | PROTECTION               | 578,200                         | 11/13/2013              | 5/9/2013                     |\n' +
