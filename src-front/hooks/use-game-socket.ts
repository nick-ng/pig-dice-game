import { useState, useEffect, useRef } from "react";
import { isEqual } from "lodash-es";

import { sleep } from "../../dist-common/utils";

import { GameData, PlayerDetails } from "../../src-common/game-types";

const dataFetcher = async (gameId: string, playerDetails: PlayerDetails) => {
  const res = await fetch(`/api/game/${gameId}`, {
    method: "GET",
    headers: {
      "x-player-id": playerDetails.playerId,
      "x-player-password": playerDetails.playerPassword,
    },
  });

  return res.json();
};

const WEBSOCKET_URL = location.origin.replace(/^http/i, "ws");

const isNewWebSocketNeeded = (webSocket: WebSocket | null): boolean =>
  !webSocket ||
  [WebSocket.CLOSING, WebSocket.CLOSED].includes(webSocket.readyState);

export const useGameSocket = (
  gameId: string,
  playerDetails: PlayerDetails,
  repeat: boolean = false
): {
  gameData: GameData | undefined;
  sendViaWebSocket(messageObject: any): void;
} => {
  const ranOnceRef = useRef(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const getNewWebSocketRef = useRef(async () => {});
  const sendViaWebSocketRef = useRef(async (messageObject: any) => {
    console.log("messageObject", JSON.stringify(messageObject));
    console.log("webSocketRef.current", webSocketRef.current);
    if (isNewWebSocketNeeded(webSocketRef.current)) {
      await getNewWebSocketRef.current();
    }
    webSocketRef.current?.send(JSON.stringify(messageObject));
  });
  const [gameData, setGameData] = useState<GameData>();

  useEffect(() => {
    if (ranOnceRef.current) {
      return;
    }

    ranOnceRef.current = true;

    getNewWebSocketRef.current = async () => {
      if (!isNewWebSocketNeeded(webSocketRef.current)) {
        return;
      }

      console.info("Getting a new WebSocket connection");
      webSocketRef.current = new WebSocket(WEBSOCKET_URL);

      const onOpenWebSocketMessage = {
        playerId: playerDetails.playerId,
        playerPassword: playerDetails.playerPassword,
        gameId,
        type: "listen",
      };

      webSocketRef.current.addEventListener("open", () => {
        console.info("WebSocket connection opened");
        webSocketRef.current?.send(JSON.stringify(onOpenWebSocketMessage));
      });

      webSocketRef.current.addEventListener(
        "message",
        (webSocketMessageEvent) => {
          const { data } = webSocketMessageEvent;
          if (typeof data !== "string") {
            console.error("Unexpected data from WebSocket", data);
            return;
          }
          try {
            const dataObject = JSON.parse(data);
            if (
              dataObject.type === "game-data" &&
              dataObject.payload.id === gameId
            ) {
              setGameData(dataObject.payload);
            }
          } catch (e) {
            console.error("Other error from WebSocket", e);
          }
        }
      );

      webSocketRef.current.addEventListener("close", () => {
        console.info("WebSocket connection lost");
        getNewWebSocketRef.current();
      });
    };

    getNewWebSocketRef.current();

    return () => {};
  }, []);

  return { gameData, sendViaWebSocket: sendViaWebSocketRef.current };
};
