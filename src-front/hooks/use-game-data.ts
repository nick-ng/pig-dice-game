import { useState, useEffect, useRef } from "react";
import { isEqual } from "lodash-es";

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

export const useGameData = (
  gameId: string,
  playerDetails: PlayerDetails,
  repeat: boolean = false
): [
  GameData | undefined,
  React.Dispatch<React.SetStateAction<GameData | undefined>>
] => {
  const ranOnceRef = useRef(false);
  const timeoutIdRef = useRef<number | null>(null);
  const prevGameDataRef = useRef({});
  const [gameData, setGameData] = useState<GameData>();

  useEffect(() => {
    if (ranOnceRef.current) {
      return;
    }

    ranOnceRef.current = true;

    const fetchGameData = async () => {
      try {
        const result = await dataFetcher(gameId, playerDetails);

        if (
          result.gameData &&
          !isEqual(result.gameData, prevGameDataRef.current)
        ) {
          setGameData(result.gameData);
          prevGameDataRef.current = result.gameData;
        }

        if (repeat && result.refreshDelayMS) {
          timeoutIdRef.current = window.setTimeout(() => {
            fetchGameData();
          }, result.refreshDelayMS);
        }
      } catch (e) {
        console.error("Error when fetching game data", e);
        console.info("Waiting 3 seconds before continuing.");
        timeoutIdRef.current = window.setTimeout(() => {
          fetchGameData();
        }, 3000);
      }
    };

    fetchGameData();

    return () => {
      if (typeof timeoutIdRef.current === "number") {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return [gameData, setGameData];
};
