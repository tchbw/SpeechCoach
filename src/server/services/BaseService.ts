import {
  type AuthenticationContext,
  SystemContext,
} from "./authentication/context";

export abstract class BaseService {
  public ctx: AuthenticationContext;

  constructor(context: AuthenticationContext) {
    this.ctx = context;
  }

  public static withContext<T extends BaseService>(
    this: new (context: AuthenticationContext) => T,
    ctx: AuthenticationContext
  ): T {
    const service = new this(ctx);
    return service;
  }

  public static withSystemContext<T extends BaseService>(
    this: new (context: AuthenticationContext) => T
  ): T {
    const service = new this(new SystemContext());
    return service;
  }
}
