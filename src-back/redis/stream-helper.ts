import { Listener } from "../../dist-common/redis-types";

import { RedisClient2 } from "../redis";

export default class StreamHelper {
  regularClient: RedisClient2;
  xReadClient: RedisClient2;
  listeners: Listener[];
  listening: boolean;
  lastIds: {
    [name: string]: string;
  };

  constructor(regularClient: RedisClient2, xReadClient: RedisClient2) {
    if (regularClient === xReadClient) {
      throw new Error("regularClient and xReadClient have to be different");
    }
    this.regularClient = regularClient;
    this.xReadClient = xReadClient;

    this.lastIds = {};

    this.listeners = [];
    this.listening = false;
  }

  addListener = (newListener: Listener): void => {
    this.listeners.push(newListener);

    if (!this.listening) {
      this.listen();
    } else if (typeof this.xReadClient.id === "string") {
      this.regularClient.sendCommand([
        "CLIENT",
        "UNBLOCK",
        this.xReadClient.id,
      ]);
    }
  };

  removeListener = (id: string): void => {
    this.listeners = this.listeners.filter((a) => a.id !== id);
  };

  xRead = async () => {
    const streamKeys = this.listeners.map((listener) => listener.streamKey);
    const uniqueStreamKeys = [...new Set(streamKeys)];

    return this.xReadClient.xRead(
      uniqueStreamKeys.map((streamKey) => {
        if (!this.lastIds[streamKey]) {
          this.lastIds[streamKey] = "$";
        }

        return {
          key: streamKey,
          id: this.lastIds[streamKey],
        };
      }),
      { BLOCK: 10000, COUNT: 100 }
    );
  };

  listen = async () => {
    while (this.listeners.length > 0) {
      this.listening = true;
      const res = await this.xRead();

      res?.forEach((event) => {
        const { name, messages } = event;

        if (messages.length === 0) {
          return;
        }

        const lastMessage = messages[messages.length - 1];
        this.lastIds[name] = lastMessage.id;

        const interestedListeners = this.listeners.filter(
          (listener) => listener.streamKey === name
        );

        let dataObject: { [key: string]: string } | null = null;

        try {
          dataObject = JSON.parse(lastMessage.message.data);
        } catch (_e) {
          dataObject = null;
        }

        interestedListeners.forEach((listener) =>
          listener.updateHandler(lastMessage.message.data, dataObject)
        );
      });
    }

    this.listening = false;
  };
}
