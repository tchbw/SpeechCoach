import type { ChatRequestOptions, Message } from "ai";

export type ChatHandler = {
  messages: Message[];
  input: string;
  isLoading: boolean;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reload?: () => void;
  stop?: () => void;
  onFileUpload?: (file: File) => Promise<void>;
  onFileError?: (errMsg: string) => void;
  setInput: (input: string) => void;
  append?: (
    message: Message | Omit<Message, `id`>,
    chatRequestOptions?: ChatRequestOptions
    // ops?: {
    //   data: unknown;
    // }
  ) => Promise<string | null | undefined>;
  starterQuestions?: string[];
};
