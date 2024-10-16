import type { ChatMessageRow } from "@prisma/client";
import assert from "assert";

import type { ChatMessage } from "@/server/services/project/types";

export const ChatMessageDBMapper = {
  fromDb: (message: ChatMessageRow): ChatMessage => {
    const role = message.role;
    assert(
      role === `user` || role === `assistant` || role === `system`,
      `Invalid role: ${role}`
    );
    return {
      ...message,
      role,
    };
  },
};
