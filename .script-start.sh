#!/bin/bash

# nvm use
#nohup pnpm run start > ./.run.log 2>&1 & echo $! > ./.run.pid
# TODO temp 临时这么干
nohup pnpm run dev > ./.run.log 2>&1 & echo $! > ./.run.pid
