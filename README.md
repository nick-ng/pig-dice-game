# pig-dice-game

Pig is a simple dice game first described in print in John Scarne in 1945. Players take turns to roll a single dice as many times as they wish, adding all roll results to a running total, but losing their gained score for the turn if they roll a 1.

## Development

1. `npm install`
2. `docker-compose up -d` - For local redis environment
3. `npm start`
4. Navigate to one of the following:
   - http://localhost:3232/test.html

## Forking (on same GitHub account)

1. Create new empty repository on GitHub (or whatever)
2. `mkdir <new-repo> && cd <new-repo>`
3. `git init`
4. `git fetch --depth=1 -n https://github.com/nick-ng/pig-dice-game.git`
5. `git reset --hard $(git commit-tree FETCH_HEAD^{tree} -m "forked https://github.com/nick-ng/pig-dice-game")`

## ToDos

- ~~Make basic game functions in backend~~
- ~~Use Redis to store game state~~
- ~~Make front=end game lobby~~
- ~~Make front-end game play~~
- ~~GitHub build action & Heroku host~~
- Redis streams & Websocket
  - https://redis.io/docs/manual/data-types/streams/
- Work on a new game (probably rock-paper-scissors)

## Notes

On the server

```json
{
  "id": "1234-12345-12345-1234",
  "host": "some-player's-uuid",
  "maxPlayers": 2,
  "players": [
    { "id": "some-player's-uuid", "name": "Alice" },
    { "id": "player-two's-uuid", "name": "Bob" }
  ],
  // Things about the game that don't change once it's started.
  "gameSettings": {
    "gameSetting1": 3,
    "gameSetting2": "hello"
  },
  // Secret information, only available to some players
  "gameSecrets": {
    "some-player's-uuid": {
      "password": "asdf", // Used to prevent other players performing actions on your behalf.
      "secret1": "world"
    },
    "player-two's-uuid": {
      "password": "bsdf",
      "secret1": "!"
    }
  },
  // Everything else about the game
  "gameState": {
    "state": "main", // "lobby", "upkeep", "draw", "main", "combat", etc.
    "activePlayer": "player-two's-uuid",
    "turnOrder": ["player-two's-uuid", "some-player's-uuid"],
    "score": "etc"
  }
}
```

Sent to Alice

```json
{
  "id": "1234-12345-12345-1234",
  "host": "some-player's-uuid",
  "maxPlayers": 2,
  "players": [
    { "id": "some-player's-uuid", "name": "Alice" },
    { "id": "player-two's-uuid", "name": "Bob" }
  ],
  "gameSettings": {
    "gameSetting1": 3,
    "gameSetting2": "hello"
  },
  "gameSecrets": {
    "password": "asdf",
    "secret1": "world"
  },
  "gameState": {
    "activePlayer": "player-two's-uuid",
    "score": "etc"
  }
}
```
