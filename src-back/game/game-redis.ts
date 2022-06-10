import { createClient2 } from "../redis";
import { GameData } from "../../src-common/game-types";
import { DefaultStreamMessageType } from "../../dist-common/redis-types";
import Game from "./game-class";
import StreamHelper from "../redis/stream-helper";

const SHORT_TTL = 60 * 60; // 1 hour in seconds
const LONG_TTL = 36 * 60 * 60; // 36 hours in seconds

export const getRedisKeys = (gameId: string) => {
  const baseKey = `game:${gameId.replaceAll(/[^a-z0-9\-]/g, "-")}`.slice(0, 45);
  return {
    state: `${baseKey}-state`,
    action: `${baseKey}-action`,
  };
};

const client = createClient2("Redis Client");
const xReadClient = createClient2("xRead Client");

export const streamHelper = new StreamHelper(client, xReadClient);

export const saveGame = async (gameData: GameData, useLongTTL?: boolean) => {
  await client.xAdd(getRedisKeys(gameData.id).state, "*", {
    data: JSON.stringify(gameData),
  });
  if (useLongTTL) {
    await client.expire(getRedisKeys(gameData.id).state, LONG_TTL);
  } else {
    await client.expire(getRedisKeys(gameData.id).state, SHORT_TTL);
  }
};

export const findGame = async (gameId: string) => {
  const res = (await client.xRevRange(getRedisKeys(gameId).state, "+", "-", {
    COUNT: 1,
  })) as DefaultStreamMessageType[];

  if (res.length > 0) {
    return new Game(JSON.parse(res[0].message.data));
  }

  return null;
};

let lastId = "$";

export const findGame2 = async (gameId: string) => {
  const res = await xReadClient.xRead(
    [{ key: getRedisKeys(gameId).state, id: lastId }],
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
