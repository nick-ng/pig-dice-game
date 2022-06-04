import Game from "./game-class";

let allGames: Game[] = [];

export const newGame = (
  playerId: string,
  playerName: string,
  playerPassword: string
) => {
  const game = new Game({ host: playerId });
  game.addPlayer(playerId, playerName, playerPassword);
  allGames.push(game);

  console.log("gameData", game.getGameData());

  return game.getGameDataForPlayer(playerId, playerPassword);
};
