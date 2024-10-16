export type GenAIReportSectionCreate = {
  sectionHeading: string;
  subSections: {
    subSectionHeading: string;
    paragraphs: string[];
  }[];
};

export type ChatMessage = {
  id: string;
  role: `user` | `assistant` | `system`;
  content: string;
};
