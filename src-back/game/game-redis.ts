import { createClient } from "redis";

import { GameData } from "./game-types";
import Game from "./game-class";

const SHORT_TTL = 60 * 60; // 1 hour in seconds
const LONG_TTL = 36 * 60 * 60; // 36 hours in seconds

const client = createClient({
  url: process.env.REDIS_URL,
});
client.connect();
client.on("error", (err) =>
  console.error(`${new Date().toLocaleTimeString()}: Redis Client Error`, err)
);
client.on("connect", () =>
  console.info(`${new Date().toLocaleTimeString()}: Redis Client Connected`)
);

const getRedisKey = (gameId: string) => {
  return `game:${gameId.replaceAll(/[^a-z0-9\-]/g, "-")}`.slice(0, 45);
};

export const saveGame = async (gameData: GameData, longTTL?: boolean) => {
  await client.set(getRedisKey(gameData.id), JSON.stringify(gameData));
  if (longTTL) {
    await client.expire(getRedisKey(gameData.id), LONG_TTL);
  } else {
    await client.expire(getRedisKey(gameData.id), SHORT_TTL);
  }
};

export const findGame = async (gameId: string) => {
  const res = await client.get(getRedisKey(gameId));

  if (typeof res === "string") {
    return new Game(JSON.parse(res));
  }

  return null;
};

export const allGames = {
  push: saveGame,
  find: findGame,
};
