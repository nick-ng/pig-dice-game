import { createClient } from "redis";

import { GameData } from "../../src-common/game-types";
import Game from "./game-class";
import StreamHelper from "../redis/stream-helper";

const SHORT_TTL = 60 * 60; // 1 hour in seconds
const LONG_TTL = 36 * 60 * 60; // 36 hours in seconds

const createClient2 = (name: string) => {
  const newClient = createClient({
    url: process.env.REDIS_URL,
  });

  newClient.connect();
  newClient.on("error", (err) =>
    console.error(`${new Date().toLocaleTimeString()}: ${name} Error`, err)
  );
  newClient.on("connect", () =>
    console.info(`${new Date().toLocaleTimeString()}: ${name} Connected`)
  );

  return newClient;
};

const getRedisKey = (gameId: string) => {
  return `game:${gameId.replaceAll(/[^a-z0-9\-]/g, "-")}`.slice(0, 45);
};

const client = createClient2("Redis Client");
const xReadClient = createClient2("xRead Client");

export const streamHelper = new StreamHelper(client, xReadClient);

export const saveGame = async (gameData: GameData, longTTL?: boolean) => {
  await client.xAdd(getRedisKey(gameData.id), "*", {
    gameData: JSON.stringify(gameData),
  });
  if (longTTL) {
    await client.expire(getRedisKey(gameData.id), LONG_TTL);
  } else {
    await client.expire(getRedisKey(gameData.id), SHORT_TTL);
  }
};

export const findGame = async (gameId: string) => {
  const res = (await client.xRevRange(getRedisKey(gameId), "+", "-", {
    COUNT: 1,
  })) as { id: string; message: { gameData: string } }[];

  if (res.length > 0) {
    return new Game(JSON.parse(res[0].message.gameData));
  }

  return null;
};

let lastId = "$";

export const findGame2 = async (gameId: string) => {
  const res = await xReadClient.xRead(
    [{ key: getRedisKey(gameId), id: lastId }],
    {
      BLOCK: 0,
      COUNT: 2,
    }
  );

  console.log("res findGame2", res);
  console.log("res findGame2 j", JSON.stringify(res));
  res?.forEach((event) => {
    const { name, messages } = event;
    console.log("name", name);
    console.log("message", messages);
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    lastId = lastMessage.id;
    console.log("lastId", lastId);
  });

  return res;
};

export const findGame3 = async (gameId: string) => {
  console.log("hi");
  const res = await client.xRead(
    { key: getRedisKey(gameId), id: "$" },
    {
      BLOCK: 0,
      COUNT: 1,
    }
  );

  console.log("res", res);

  // if (res.length > 0) {
  //   return new Game(JSON.parse(res[0].message.gameData));
  // }

  return null;
};
