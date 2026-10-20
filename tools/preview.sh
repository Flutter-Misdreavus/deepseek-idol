#!/usr/bin/env bash
# Render a frame range of the MV and a contact sheet of it.
# usage: [ENTRY=src/entries/S3.ts] [CONC=4] tools/preview.sh <name> <from> <to> [every=6]
#   -> out/preview/<name>.mp4 + <name>.png
# ENTRY bundles a single section (see mv/src/entries); bundle cache is off so parallel renders can't clash.
set -euo pipefail
cd "$(dirname "$0")/.."
name="$1"; a="$2"; b="$3"; every="${4:-6}"
entry="${ENTRY:-src/index.ts}"; conc="${CONC:-4}"
mkdir -p out/preview
(cd mv && npx remotion render "$entry" MV "../out/preview/$name.mp4" --frames="$a-$b" --props='{"debug":false}' \
  --concurrency="$conc" --bundle-cache=false --log=error)
python3 -I tools/sheet.py "out/preview/$name.mp4" "out/preview/$name.png" "$every" "$a"
