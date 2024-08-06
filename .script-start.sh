#!/bin/bash

# nvm use
nohup pnpm run start > ./.run.log 2>&1 & echo $! > ./.run.pid
