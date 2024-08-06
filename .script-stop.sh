#!/bin/bash

lsof -i:3000 | grep next-serv | awk '{print $2}' | xargs kill -9
