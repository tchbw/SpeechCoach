import { openai } from "@/server/init/openai";

export const AIUtil = {
  async transcribeAudio(audioFile: File) {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: `whisper-1`,
    });

    return transcription.text;
  },
};
