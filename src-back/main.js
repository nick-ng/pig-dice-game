import dotenv from "dotenv";
import express from "express";
import path from "path";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3423;
app.set("port", port);

app.use(express.json());

// serve static files
app.use(express.static("dist"));

// redirect all other requests to index.html
app.use((req, res) => {
  res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
});

// starting listening
server.listen(app.get("port"), () => {
  console.info(`${new Date()} Website server listening on ${app.get("port")}.`);
});
