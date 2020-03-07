#!/usr/bin/env bash

cd ~/email-printer

rm -f ./tmp/current.pdf

node index.js

if [[ -e ./tmp/current.pdf ]]; then
  lp ./tmp/current.pdf
fi