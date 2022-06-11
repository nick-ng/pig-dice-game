#!/usr/bin/bash

npm run build-front
cp ./dist-front/index.html ./dist-front/404.html
cp ./static/* ./dist-front
echo \"pig-dice-game.pux.one\" > ./dist-front/CNAME

cp ./dist-front/* ./
