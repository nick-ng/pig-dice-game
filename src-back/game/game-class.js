import { v4 as uuid } from "uuid";

import { performAction } from "./game-actions.js";

const defaultGame = {
  maxPlayers: 2,
  players: [],
  gameSettings: {},
  gameSecrets: {},
  gameState: {
    state: "lobby",
  },
};

export default class Game {
  constructor(initial = {}) {
    if (!initial.host) {
      return {
        type: "error",
        message:
          "Game needs a host. Initiate with at least { host: hostPlayerId }",
      };
    }

    const temp = { ...defaultGame, ...initial };

    if (!temp.id) {
      this.id = uuid();
    } else {
      this.id = temp.id;
    }

    this.host = temp.host;
    this.maxPlayers = temp.maxPlayers;

    this.players = temp.players;
    this.gameSettings = temp.gameSettings;
    this.gameSecrets = temp.gameSecrets;
    this.gameState = temp.gameState;
  }

  getGameObject() {
    return {
      id: this.id,
      host: this.host,
      maxPlayers: this.maxPlayers,
      players: this.players,
      gameSettings: this.gameSettings,
      gameSecrets: this.gameSecrets,
      gameState: this.gameState,
    };
  }

  getGameObjectForPlayer(playerId, playerPassword) {
    if (
      !playerPassword ||
      this.gameSecrets[playerId].password !== playerPassword
    ) {
      return {
        type: "error",
        message: "Wrong password",
      };
    }

    return {
      id: this.id,
      host: this.host,
      maxPlayers: this.maxPlayers,
      players: this.players,
      gameSettings: this.gameSettings,
      gameSecrets: this.gameSecrets[playerId],
      gameState: this.gameState,
    };
  }

  // Game lobby stuff
  addPlayer(playerId, playerName, playerPassword) {
    if (this.gameState.state !== "lobby") {
      return {
        type: "error",
        message: "Game is already in progress",
      };
    }

    if (this.game.players.length >= this.game.maxPlayers) {
      return {
        type: "error",
        message: "Can't add more players.",
      };
    }

    if (!playerPassword) {
      return {
        type: "error",
        message: "Can't have a blank password",
      };
    }

    if (this.game.players.filter((a) => a.id === playerId).length > 0) {
      return {
        type: "error",
        message: "Player already in the game",
      };
    }

    this.game.players.push({
      id: playerId,
      name: playerName,
    });
    this.game.gameSecrets[playerId].password = playerPassword;

    return {
      type: "success",
    };
  }

  // Game play stuff
  gameAction(playerId, playerPassword, action) {
    if (this.players.filter((a) => a.id === playerId).length === 0) {
      return {
        type: "error",
        message: "You aren't in this game",
      };
    }

    if (this.gameSecrets[playerId].password !== playerPassword) {
      return {
        type: "error",
        message: "Wrong password",
      };
    }

    const { newState, newSecrets, message } = performAction(
      this.getGameObject(),
      { ...action, playerId }
    );

    this.gameState = newState;
    this.gameSecrets = newSecrets;

    return message;
  }
}
