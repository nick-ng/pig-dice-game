import { createClient } from "redis";

export interface listener {
  streamKey: string;
  id: string;
  updateHandler(message: { [key: string]: string }): void;
}

export default class StreamHelper {
  regularClient: ReturnType<typeof createClient>;
  xReadClient: ReturnType<typeof createClient>;
  xReadClientId: string | null;
  listeners: listener[];
  listening: boolean;
  lastIds: {
    [name: string]: string;
  };

  constructor(
    regularClient: ReturnType<typeof createClient>,
    xReadClient: ReturnType<typeof createClient>
  ) {
    if (regularClient === xReadClient) {
      throw new Error("regularClient and xReadClient have to be different");
    }
    this.regularClient = regularClient;
    this.xReadClient = xReadClient;
    this.xReadClientId = null;

    this.lastIds = {};

    this.listeners = [];
    this.listening = false;

    (async () => {
      this.xReadClientId = (await xReadClient.clientId()).toString(10);
    })();
  }

  addListener = (newListener: listener): void => {
    this.listeners.push(newListener);

    if (!this.listening) {
      this.listen();
    } else if (this.xReadClientId !== null) {
      this.regularClient.sendCommand(["CLIENT", "UNBLOCK", this.xReadClientId]);
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
