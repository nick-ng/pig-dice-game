import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { GameData, PlayerDetails } from "../../dist-common/game-types";
import { prevPlayer } from "../../dist-common/utils";
import { useGameData } from "../hooks/use-game-data";
import { useGameSocket } from "../hooks/use-game-socket";
import Loading from "../loading";
import Lobby from "./lobby";
import GameOver from "./game-over";

interface GameProps {
  playerDetails: PlayerDetails;
}

const Container = styled.div``;

export default function Game({ playerDetails }: GameProps) {
  const { gameId } = useParams();
  const { gameData, sendViaWebSocket } = useGameSocket(
    gameId!,
    playerDetails,
    true
  );

  if (typeof gameData === "undefined") {
    return <Loading />;
  }

  const { gameState, players } = gameData;

  switch (gameState.state) {
    case "lobby":
      return <Lobby gameData={gameData} playerDetails={playerDetails} />;
    case "over":
      return <GameOver gameData={gameData} playerDetails={playerDetails} />;

    default:
  }

  const { activePlayer, scores, turnScore, lastRoll, turnOrder } = gameState;

  const isActivePlayer = activePlayer === playerDetails.playerId;
  const playerMap = players.reduce((prev: { [key: string]: string }, curr) => {
    prev[curr.id] = curr.name;
    return prev;
  }, {});
  const activePlayerName = playerMap[activePlayer];
  const prevPlayerId = prevPlayer(turnOrder, activePlayer);
  const prevPlayerName = playerMap[prevPlayerId];

  return (
    <Container>
      <div>
        Scores:
        <ul>
          {Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map((entry) => {
              const [id, score] = entry;
              return <li key={id}>{`${playerMap[id]}: ${score}`}</li>;
            })}
        </ul>
      </div>
      <div>
        It's{" "}
        {isActivePlayer ? (
          <span>your</span>
        ) : (
          <span>{playerMap[activePlayer]}'s</span>
        )}{" "}
        turn
      </div>
      <div>
        {turnScore === 0 && lastRoll === 1 && (
          <div>
            {isActivePlayer ? prevPlayerName : "You"} rolled a 1 so it's{" "}
            {isActivePlayer ? "your" : `${activePlayerName}'s`} turn
          </div>
        )}
        <div>
          <div>
            {isActivePlayer ? "Your points" : `${activePlayerName}'s points`}
          </div>
          <div>This turn {turnScore}</div>
          <div>Total {scores[activePlayer]}</div>
        </div>
      </div>
      {isActivePlayer && (
        <div>
          <button
            onClick={async () => {
              const res = await fetch(`/api/game/${gameId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json;charset=utf-8",
                  "x-player-id": playerDetails.playerId,
                  "x-player-password": playerDetails.playerPassword,
                },
                body: JSON.stringify({
                  action: "roll",
                }),
              });

              const { message, gameData } = (await res.json()) as {
                message: string;
                gameData: GameData;
              };
            }}
          >
            Roll Dice
          </button>
          <button
            onClick={async () => {
              const res = await fetch(`/api/game/${gameId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json;charset=utf-8",
                  "x-player-id": playerDetails.playerId,
                  "x-player-password": playerDetails.playerPassword,
                },
                body: JSON.stringify({
                  action: "bank",
                }),
              });

              const { message, gameData } = (await res.json()) as {
                message: string;
                gameData: GameData;
              };
            }}
          >
            Bank {turnScore} Points
          </button>
        </div>
      )}
      {turnScore > 0 && typeof lastRoll === "number" && (
        <div>
          {isActivePlayer ? "You" : activePlayerName} rolled a {lastRoll}
        </div>
      )}
    </Container>
  );
}
