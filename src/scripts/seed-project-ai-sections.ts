import assert from "assert";
import { argv } from "process";

import { openai } from "@/server/init/openai";
import { ProjectService } from "@/server/services/project/service";
import type { GenAIReportSectionCreate } from "@/server/services/project/types";
import { RagService } from "@/server/services/rag/service";

const sections = [
  {
    sectionHeading: `SITE AND VICINITY CHARACTERISTICS`,
    subSections: [
      {
        subSectionHeading: `Physical setting`,
        paragraphPrompts: [
          `What is the surface elevation of the site? What is the general slope of the site (if any)? What map was reviewed for the topography?`,
          `What is the geological condition of the site? What type of soil is it? What survey was referenced for this information?`,
          `What is the groundwater depth and flow direction for the target property? What source was referenced for this information?`,
        ],
      },
      {
        subSectionHeading: `Site improvements`,
        paragraphPrompts: [
          `Describe the improvements present onsite in detail`,
        ],
      },
    ],
  },
  {
    sectionHeading: `HISTORICAL RECORDS REVIEW`,
    subSections: [
      {
        subSectionHeading: `Historical Site Use Summary`,
        paragraphPrompts: [
          `Describe the usage of the target property in chronological order`,
        ],
      },
      {
        subSectionHeading: `Historical Adjoining Properties Use Summary`,
        paragraphPrompts: [
          `Describe the usage of the adjoining properties in chronological order`,
        ],
      },
      {
        subSectionHeading: `City Directories`,
        paragraphPrompts: [
          `List all the entities that occupied the target property in chronological order`,
          `List all the entities that occupied target property's adjoining properties in chronological order`,
        ],
      },
      // {
      //   subSectionHeading: `Aerial Photography`,
      //   paragraphPrompts: [
      //     `List the years when aerial photography was available in chronological order`,
      //   ],
      // },
      // {
      //   subSectionHeading: `Topographical Maps`,
      //   paragraphPrompts: [
      //     `List the years when topographic maps was available in chronological order`,
      //   ],
      // },
      // {
      //   subSectionHeading: `Sanborn Fire Insurance Maps`,
      //   paragraphPrompts: [
      //     `List the years when Sanborn fire insurance maps were available in chronological order`,
      //   ],
      // },
    ],
  },
];

async function main({
  projectId,
  companyId,
}: {
  projectId: string;
  companyId: string;
}) {
  const ragService = RagService.withSystemContext();

  const aiWrittenSections: GenAIReportSectionCreate[] = [];

  for (const section of sections) {
    const aiSection: GenAIReportSectionCreate = {
      sectionHeading: section.sectionHeading,
      subSections: [],
    };

    for (const subSection of section.subSections) {
      const aiSubSection: GenAIReportSectionCreate[`subSections`][number] = {
        subSectionHeading: subSection.subSectionHeading,
        paragraphs: [],
      };

      for (const prompt of subSection.paragraphPrompts) {
        const documents = await ragService.retrieveDocuments({
          projectId,
          query: prompt,
        });

        const chunkText = documents.map((chunk) => chunk.text).join(`\n\n`);
        const systemPrompt = `You are an AI assistant that helps engineers write technical reports. Please answer the following question based on the provided context:\n\n${chunkText}`;
        const userPrompt = `Please write a paragraph for an ESA Phase 1 report. This paragraph is in the section ${section.sectionHeading} under subsection ${subSection.subSectionHeading}.
        
        The contents of the paragraph should follow this prompt: "${prompt}"
        
        Do not output anything except the suggested paragraph. Only output the suggest paragraph and nothing else.
        `;

        const response = await openai.chat.completions.create({
          model: `gpt-4o-mini`,
          messages: [
            { role: `system`, content: systemPrompt },
            { role: `user`, content: userPrompt },
          ],
        });

        const [choice] = response.choices;
        assert(choice, `No choice in response`);
        const paragraph = choice.message.content;
        assert(paragraph, `No paragraph in response`);

        aiSubSection.paragraphs.push(paragraph);
      }

      aiSection.subSections.push(aiSubSection);
    }

    aiWrittenSections.push(aiSection);
  }

  // Save the AI-written sections to the database
  await ProjectService.withSystemContext().createGenAIReportSections({
    projectId,
    sections: aiWrittenSections,
    companyId,
  });
}

assert(argv[2] && argv[3], `Missing arguments`);
await main({
  projectId: argv[2],
  companyId: argv[3],
});
