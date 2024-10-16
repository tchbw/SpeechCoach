import type { Session } from "lucia";

import type { SystemActor, UserActor } from "../authorization/types";

abstract class AbstractContext {}

export class SystemContext extends AbstractContext {
  public actor: SystemActor = {
    type: `System`,
    jobId: `system`,
    id: `system`,
  };

  getActor(): SystemActor {
    return this.actor;
  }
}

export class UserSessionContext extends AbstractContext {
  public session: Session;
  public userId: string;

  constructor({ session, userId }: { session: Session; userId: string }) {
    super();
    this.session = session;
    this.userId = userId;
  }

  getActor(): UserActor {
    return {
      type: `User`,
      id: this.userId,
    };
  }
}

export type AuthenticationContext = UserSessionContext | SystemContext;
