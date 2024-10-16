import type {
  Actor,
  SystemActor,
  UserActor,
} from "@/server/services/authorization/types";

export function isSystemActor(actor: Actor): actor is SystemActor {
  return `type` in actor && actor.type === `System`;
}

export function isUserActor(actor: Actor): actor is UserActor {
  return (
    (`type` in actor && actor.type === `User`) ||
    (`personalEmail` in actor && `firstName` in actor) // duck type the User type
  );
}
