import { GameData, Scores } from "./game-types";
import { GameAction } from "./game-action-types";

const startGame = (gameData: GameData, action: GameAction) => {
  const { gameState, gameSecrets, players, host } = gameData;
  if (gameState.state !== "lobby") {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Game is already in progress.",
    };
  }

  if (action.playerId !== host) {
    return {
      newState: gameState,
      newSecrets: gameSecrets,
      message: "Only the host can start the game.",
    };
  }

  const turnOrder = players
    .map((a) => ({ ...a, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((a) => a.id);

  const scores: Scores = {};
  turnOrder.forEach((playerId) => {
    scores[playerId] = 0;
  });

  return {
    newState: {
      ...gameState,
      state: "main",
      activePlayer: turnOrder[0],
      turnOrder,
      scores,
    },
    newSecrets: gameSecrets,
    message: "OK",
  };
};

const exampleAction = (gameData: GameData, action: GameAction) => {
  return {
    newState: gameData.gameState,
    newSecrets: gameData.gameSecrets,
    message: "OK",
  };
};

export const performAction = (gameData: GameData, action: GameAction) => {
  switch (action.type) {
    case "start":
      return startGame(gameData, action);
    case "example":
      return exampleAction(gameData, action);
    default:
      return {
        newState: gameData.gameState,
        newSecrets: gameData.gameSecrets,
        message: "No action",
      };
  }
};
