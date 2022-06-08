import { RedisClientType } from "redis";

export interface listener {
  streamKey: string;
  id: string;
  updateHandler(message: { [key: string]: string }): void;
}

export default class StreamHelper {
  regularClient: RedisClientType;
  xReadClient: RedisClientType;
  listeners: listener[];
  listening: boolean;
  lastIds: {
    [name: string]: string;
  };

  constructor(regularClient: RedisClientType, xReadClient: RedisClientType) {
    this.regularClient = regularClient;
    this.xReadClient = xReadClient;
    this.lastIds = {};

    this.listeners = [];
    this.listening = false;
  }

  addListener = (newListener: listener): void => {
    this.listeners.push(newListener);

    if (!this.listening) {
      this.listen();
    }
  };

  removeListener = (id: string): void => {
    this.listeners = this.listeners.filter((a) => a.id !== id);
  };

  xRead = async () => {
    return this.xReadClient.xRead(
      this.listeners.map((listener) => {
        if (!this.lastIds[listener.streamKey]) {
          this.lastIds[listener.streamKey] = "$";
        }

        return {
          key: listener.streamKey,
          id: this.lastIds[listener.streamKey],
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

        interestedListeners.forEach((listener) =>
          listener.updateHandler(lastMessage.message)
        );
      });
    }

    this.listening = false;
  };
}
