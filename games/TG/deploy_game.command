#!/bin/sh
DIR=$(dirname "$0")
cd "$DIR"

# 開發完成後自行改為遊戲專案資料夾
game=TG

rm -rf ../H5-MiniGame-Lobby/games/$game/src
rm -rf ../H5-MiniGame-Lobby/games/$game/res
rsync -avh src/ ../H5-MiniGame-Lobby/games/$game/src
rsync -avh res/ ../H5-MiniGame-Lobby/games/$game/res