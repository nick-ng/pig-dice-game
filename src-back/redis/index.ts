import { createClient } from "redis";

export type RedisClient2 = ReturnType<typeof createClient> & {
  id?: string;
};

export const createClient2 = (name: string) => {
  const newClient = createClient({
    url: process.env.REDIS_URL,
  }) as RedisClient2;

  newClient.id = undefined;

  newClient.connect();
  newClient.on("error", (err) => {
    console.error(`${new Date().toLocaleTimeString()}: ${name} Error`, err);
    if (err.code === "ECONNREFUSED") {
      newClient.id = undefined;
    }
  });
  newClient.on("connect", async () => {
    newClient.id = (await newClient.clientId()).toString(10);
    console.info(
      `${new Date().toLocaleTimeString()}: ${name} Connected. ID: ${
        newClient.id
      }`
    );
  });

  return newClient;
};
