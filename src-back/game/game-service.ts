import Game from "./game-class";

let allGames: Game[] = [];

export const newGame = async (
  playerId: string,
  playerName: string,
  playerPassword: string
) => {
  const game = new Game({ host: playerId });
  game.addPlayer(playerId, playerName, playerPassword);
  allGames.push(game);

  // 10. Save game on Redis with 1 hour ttl
  // console.debug("gameData", game.getGameData());

  return {
    code: 200,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const joinGame = async (
  gameId: string,
  playerId: string,
  playerName: string,
  playerPassword: string
) => {
  const game = allGames.find((a) => a.id === gameId);

  if (!game) {
    // 10. try and get the game from Redis

    // 15. if you still can't find the game, return 404
    return { code: 404 };
  }

  const result = game.addPlayer(playerId, playerName, playerPassword);
  if (result.type !== "success") {
    return {
      code: 400,
      message: result.message,
    };
  }
  // 30. Save game to Redis with new 1 hour ttl
  // console.debug("gameData1", game.getGameData());

  return {
    code: 200,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const playGame = async (
  gameId: string,
  playerId: string,
  playerPassword: string,
  action: string,
  payload: any
) => {
  const game = allGames.find((a) => a.id === gameId);

  if (!game) {
    return { code: 404 };
  }

  const result = game.gameAction(playerId, playerPassword, {
    type: action,
    payload,
  });

  if (result.type !== "success") {
    return {
      code: 400,
      message: result.message,
    };
  }

  // 20. Save game to Redis with new 36 hour ttl
  console.debug("gameData", game.getGameData());

  return {
    code: 200,
    message: result.message,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};

export const getGame = async (
  gameId: string,
  playerId: string,
  playerPassword: string
) => {
  const game = allGames.find((a) => a.id === gameId);

  if (!game) {
    // 10. try and get the game from Redis

    // 15. if you still can't find the game, return 404
    return { code: 404 };
  }

  return {
    code: 200,
    gameData: game.getGameDataForPlayer(playerId, playerPassword),
  };
};
