import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import path from "path";
import http from "http";

import gameRouter from "./game/game-router";

dotenv.config();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3232;
app.set("port", port);

if (process.env.NODE_ENV === "dev") {
  app.use((req, res, next) => {
    console.debug(new Date().toLocaleTimeString(), req.method, req.url);
    next();
  });
}

app.use(compression());
app.use(express.json());

app.use("/game", gameRouter);

// serve static files
app.use(express.static(path.resolve(process.cwd(), "dist-front")));
app.use(express.static(path.resolve(process.cwd(), "static")));

// redirect all other requests to index.html
app.use((_req, res) => {
  res.sendFile(path.resolve(process.cwd(), "dist-front", "index.html"));
});

// starting listening
server.listen(app.get("port"), () => {
  console.info(
    `${new Date().toLocaleTimeString()} Website server listening on ${app.get(
      "port"
    )}.`
  );
});
