import { useState, useEffect, useRef } from "react";
import { isEqual } from "lodash-es";

import { GameData } from "../../src-common/game-types";

const dataFetcher = async (gameId: string) => {
  const res = await fetch(`/api/game/${gameId}`, {
    method: "GET",
    headers: {
      "x-player-id": "asdf",
      "x-player-password": "bsdf",
    },
  });

  return res.json();
};

export const useGameData = (
  gameId: string,
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
      const result = await dataFetcher(gameId);

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
