import { GameAction } from "./game-action-types";

interface BasicIncomingMessageObject {
  playerId: string;
  playerPassword: string;
  gameId: string;
  type: string;
}

interface ListenIncomingMessageObject extends BasicIncomingMessageObject {
  type: "listen";
}

interface JoinIncomingMessageObject extends BasicIncomingMessageObject {
  type: "join";
}

interface ActionIncomingMessageObject extends BasicIncomingMessageObject {
  type: "action";
  action: GameAction;
}

export type WebsocketIncomingMessageObject =
  | BasicIncomingMessageObject
  | ListenIncomingMessageObject
  | JoinIncomingMessageObject
  | ActionIncomingMessageObject;
