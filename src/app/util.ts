import { Religion } from "@/app/types";

export const religionConfig: ReligionConfig = {
  [Religion.CHRISTIANITY]: {
    name: `Christianity`,
    persona: `/christianity_persona_loop.mp4`,
  },
  [Religion.ISLAM]: {
    name: `Islam`,
    persona: `/islam_persona_loop.mp4`,
  },
  // [Religion.HINDUISM]: {
  //   name: `Hinduism`,
  //   persona: `/christianity_persona.mp4`,
  // },
  [Religion.BUDDHISM]: {
    name: `Buddhism`,
    persona: `/buddhism_persona_loop.mp4`,
  },
  //   [Religion.JEWISH]: {
  //     name: `Jewish`,
  //     persona: `/christianity_persona.mp4`,
  //   },
} as const;

export type ReligionConfig = Record<
  Religion,
  { name: string; persona: string }
>;
