export interface Scores {
  [index: string]: number;
}

export interface GameState {
  state: "lobby" | string;
  activePlayer?: string;
  turnOrder?: string[];
  score?: Scores;
}

export interface GameSecret {
  password: string;
  [key: string]: string;
}

export interface GameSecrets {
  [key: string]: GameSecret;
}

export interface GameSettings {
  [key: string]: string | number;
}

interface Player {
  id: string;
  name: string;
}

export type Players = Player[];

export interface GameData {
  id: string;
  host: string;
  maxPlayers: number;
  players: Players;
  gameSettings: GameSettings;
  gameSecrets: GameSecrets;
  gameState: GameState;
}

export interface Game {
  id: string;
  host: string;
  maxPlayers: number;
  players: Players;
  gameSettings: GameSettings;
  gameSecrets: GameSecrets;
  gameState: GameState;
}

export interface InitObject {
  id?: string;
  host: string;
  maxPlayers?: number;
  players?: Players;
  gameSettings?: GameSettings;
  gameSecrets?: GameSecrets;
  gameState?: GameState;
}
