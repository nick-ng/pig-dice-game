import http from "http";
import { v4 as uuid } from "uuid";
import { WebSocketServer, ServerOptions, WebSocket as WebSocketType } from "ws";

import { WebsocketIncomingMessageObject } from "../../dist-common/websocket-message-types";
import { decodeGameData } from "../../dist-common/decoders/game";

import StreamHelper from "../redis/stream-helper";
import { getRedisKeys } from "./game-redis";
import Game from "./game-class";

interface WebSocketServerOptionsWithServer extends ServerOptions {
  server: ReturnType<typeof http.createServer>;
}

interface Connection {
  webSocketConnection: WebSocketType;
  id: string;
  playerId: string;
  playerPassword: string;
  gameId: string;
}

const makeUpdateHandler =
  (connection: Connection) =>
  (
    _message: string | null,
    messageObject: { [key: string]: string } | null
  ) => {
    if (typeof messageObject?.host !== "string") {
      return;
    }

    const gameData = decodeGameData(messageObject);

    if (!gameData) {
      return;
    }

    const game = new Game(gameData);

    connection.webSocketConnection.send(
      JSON.stringify(
        game.getGameDataForPlayer(
          connection.playerId,
          connection.playerPassword
        )
      )
    );
  };

export default class GameWebSocketServer {
  webSocketServer: WebSocketServer;
  connections: Connection[];
  streamHelper: StreamHelper;

  constructor(
    options: WebSocketServerOptionsWithServer,
    streamHelper: StreamHelper
  ) {
    this.webSocketServer = new WebSocketServer(options);
    this.connections = [];
    this.streamHelper = streamHelper;

    this.webSocketServer.on("connection", (webSocketConnection) => {
      webSocketConnection.on("message", (buffer) => {
        try {
          const data = JSON.parse(
            buffer.toString()
          ) as WebsocketIncomingMessageObject;
          this.messageHandler(data, webSocketConnection);
        } catch (e) {
          webSocketConnection.send("All messages must be JSON strings.");
          webSocketConnection.close(400, "All messages must be JSON strings.");
        }
      });
    });
  }

  messageHandler = (
    data: WebsocketIncomingMessageObject,
    webSocketConnection: WebSocketType
  ) => {
    if (data.type === "listen") {
      this.registerListener(data, webSocketConnection);
      return;
    }

    const playerGameListener = this.connections.find((connection) => {
      return (
        connection.playerId === data.playerId &&
        connection.gameId &&
        data.gameId
      );
    });

    if (!playerGameListener) {
      webSocketConnection.send("You need to listen to the game first.");
      return;
    }

    switch (data.type) {
      case "join":
        break;
      default:
        console.debug(JSON.stringify(data, null, "  "));
    }
  };

  registerListener = (
    data: WebsocketIncomingMessageObject,
    webSocketConnection: WebSocketType
  ) => {
    const id = uuid();

    const connection: Connection = {
      id,
      webSocketConnection,
      playerId: data.playerId,
      playerPassword: data.playerPassword,
      gameId: data.gameId,
    };

    this.connections.push(connection);

    const { state: gameStateKey } = getRedisKeys(data.gameId);

    this.streamHelper.addListener({
      id,
      streamKey: gameStateKey,
      updateHandler: makeUpdateHandler(connection),
    });

    webSocketConnection.onclose = () => {
      this.connections = this.connections.filter(
        (connection) => connection.id !== id
      );
      this.streamHelper.removeListener(id);
    };
  };
}
