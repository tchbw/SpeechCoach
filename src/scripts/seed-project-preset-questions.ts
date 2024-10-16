// import assert from "assert";
// import { argv } from "process";

// import { prisma } from "@/server/init/db";
// import { openai } from "@/server/init/openai";
// import { RagService } from "@/server/services/rag/service";

// const QUESTIONS = [
//   `What is the surface elevation of the site? What is the general slope of the site (if any)? What map was reviewed for the topography?`,
//   `What is the geological condition of the site? What type of soil is it? What survey was referenced for this information?`,
//   `What is the groundwater depth and flow direction for the target property? What source was referenced for this information?`,
//   // `List all the entities that occupied the target property in chronological order`,
//   // `List all the entities that occupied its adjoining properties in chronological order`,
//   // `List the years when aerial photography was available in chronological order`,
//   // `List the years when topographic maps was available in chronological order`,
//   // `List the years when Sanborn fire insurance maps were available in chronological order`,
//   // `Tabulated all the environmental databases reviewed, associated search radii, whether target property is listed for each database, and how many surrounding sites are listed for each database `,
//   `Was the target property listed in any of the environmental databases?`,
//   // `Tabulate all the listings within 250 feet of the target properties, its distance and direction away from the target property, regulatory status, and listed database`,
// ];

// async function main({ projectId }: { projectId: string }) {
//   const ragService = RagService.withSystemContext();

//   for (const question of QUESTIONS) {
//     const documents = await ragService.retrieveDocuments({
//       projectId,
//       query: question,
//     });

//     const chunkText = documents.map((chunk) => chunk.text).join(`\n\n`);
//     const systemPrompt = `You are an AI assistant. Please answer the following question based on the provided context:\n\n${chunkText}`;

//     const response = await openai.chat.completions.create({
//       model: `gpt-4o-mini`,
//       messages: [
//         { role: `system`, content: systemPrompt },
//         { role: `user`, content: question },
//       ],
//     });

//     const [choice] = response.choices;
//     assert(choice, `No choice in response`);
//     const answer = choice.message.content;
//     assert(answer, `No answer in response`);

//     // Save the result in the ProjectPresetQuestion table
//     await prisma.projectPresetQuestion.upsert({
//       where: {
//         projectId_question: {
//           projectId,
//           question,
//         },
//       },
//       update: {
//         answer,
//       },
//       create: {
//         projectId,
//         question,
//         answer,
//       },
//     });
//   }
// }

// assert(argv[2], `Missing arguments`);
// await main({
//   projectId: argv[2],
// });
