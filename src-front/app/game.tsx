import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { PlayerDetails } from "../../src-common/game-types";
import { useGameData } from "../hooks/use-game-data";
import Loading from "../loading";
import Lobby from "./lobby";

interface GameProps {
  playerDetails: PlayerDetails;
}

const Container = styled.div``;

export default function Game({ playerDetails }: GameProps) {
  const { gameId } = useParams();
  const [gameData, setGameData] = useGameData(gameId!, true);

  if (typeof gameData === "undefined") {
    return <Loading />;
  }

  switch (gameData.gameState.state) {
    case "lobby":
      return (
        <Lobby
          gameData={gameData}
          setGameData={setGameData}
          playerDetails={playerDetails}
        />
      );
    case "over":
      <Container>Game Over</Container>;
    default:
  }

  return (
    <Container>
      If game state = lobby, show Lobby component If game state = main, show
      Main component
      <pre>{JSON.stringify(gameData, null, "  ")}</pre>
    </Container>
  );
}
