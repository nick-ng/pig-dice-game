import { Router } from "express";

import { newGame } from "./game-runner";

const router = Router();

router.post("/", (req, res, next) => {
  const { playerId, playerName, playerPassword } = req.body;
  const gameData = newGame(playerId, playerName, playerPassword);
  res.json(gameData);
});

export default router;
