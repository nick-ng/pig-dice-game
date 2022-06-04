const startGame = (gameObject, action) => {
  const { gameState, gameSecrets, players, host } = gameObject;
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

  const scores = {};
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

const actionA = (gameObject, action) => {
  return {
    newState: gameObject.gameState,
    newSecrets: gameObject.gameSecrets,
    message: "OK",
  };
};

export const performAction = (gameObject, action) => {
  switch (action.type) {
    case "start":
      return startGame(initialState, initialSecrets, action);
    case "a":
      return actionA(initialState, initialSecrets, action);
    default:
      return {
        newState: gameObject.gameState,
        newSecrets: gameObject.gameSecrets,
        message: "No action",
      };
  }
};
