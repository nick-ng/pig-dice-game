export interface InputAction {
  type: string;
  payload?: any;
}

export interface GameAction extends InputAction {
  playerId: string;
}
