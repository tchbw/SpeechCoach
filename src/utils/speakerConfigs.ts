export type SpeakerConfig = {
  name: `J.D. Vance`;
  avgWordsPerMinute: number;
  gradeLevel: number;
};

export const speakerConfigs: Record<SpeakerConfig[`name`], SpeakerConfig> = {
  [`J.D. Vance`]: {
    name: `J.D. Vance`,
    avgWordsPerMinute: 212,
    gradeLevel: 12,
  },
};
