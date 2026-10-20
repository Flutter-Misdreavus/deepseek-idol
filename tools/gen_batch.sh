#!/usr/bin/env bash
# Run tools/gen_image.sh over a jobs file with N in parallel; skips outputs that already exist.
# jobs file: one job per line, TAB separated: <out.png> <TAB> <refs (space separated, or -)> <TAB> <prompt>
# usage: tools/gen_batch.sh jobs.tsv [N=4]
set -uo pipefail
jobs_file="$1"; N="${2:-4}"
cd "$(dirname "$0")/.."
while IFS=$'\t' read -r out refs prompt; do
  [ -z "$out" ] || [ "${out:0:1}" = "#" ] && continue
  [ -f "$out" ] && { echo "skip $out"; continue; }
  while [ "$(jobs -rp | wc -l)" -ge "$N" ]; do sleep 5; done
  [ "$refs" = "-" ] && refs=""
  # shellcheck disable=SC2086
  tools/gen_image.sh "$out" "$prompt" $refs &
  sleep 2
done < "$jobs_file"
wait
echo "batch done"
