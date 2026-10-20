#!/usr/bin/env bash
# Generate one image with codex's built-in image tool.
# usage: tools/gen_image.sh <out.png> "<prompt>" [ref1.png ref2.png ...]
# The art-style references (gen/ref/style_mv_*.png, frames of the official Idol MV) and the STYLE brief are always
# attached first, so every image matches the official MV's look; the given refs are character refs.
# Only characters / props are generated, on a flat green screen: cut them out with tools/cutout.py, backgrounds are code.
# Every call is logged to gen/prompts.md.
set -euo pipefail
out="$1"; prompt="$2"; shift 2
root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$(dirname "$out")"
out_abs="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")"

style_refs=("$root/gen/ref/style_mv_1.png" "$root/gen/ref/style_mv_2.png" "$root/gen/ref/style_mv_3.png")
refs=()
for r in "${style_refs[@]}" "$@"; do refs+=(-i "$r"); done

STYLE="TV-anime key frame matching reference images 1-3 exactly: clean thin dark line art with a thin white rim line along the \
character silhouette; FLAT cel colors with exactly one hard-edged shadow tone, no gradients on skin or clothes, no glossy or glittery surfaces; \
hair as a few big dark color shapes with sharp strand lines and one thin highlight line; matte skin with a soft blush; big eyes whose pupils \
hold a bright white six/eight-pointed star highlight. Saturated, clean, high-contrast colors (not pastel, not washed out), faint chromatic \
aberration on the line art. The character is large and fills most of the frame. \
NOT glossy, NOT oily: no specular shine on hair, skin, clothes or shoes, no metallic gold, no airbrushed or painterly rendering, no rim glow, \
no sparkles; few details and simple clean shapes, like a TV anime production frame, not a gacha/VTuber illustration. \
Background: a perfectly FLAT, uniform pure green screen (#00B140) and nothing else - no scenery, no shapes, no shadows, no gradient, \
no effects - so the figure can be cut out; keep green out of the character itself."

task="Use your image generation tool to create exactly one image for the brief below, then save the final PNG to: ${out_abs}
Do not write any code or other files.
Reference images 1-3 are ART STYLE references only: copy their rendering, line quality, lighting and color treatment, \
but do NOT copy their characters, faces, hair, outfits or composition.
Any further reference images are CHARACTER references: follow them closely for character DESIGN only (hair, ears, outfit, colors, accessories), NOT for their rendering style. \
Her eyes stay blue (with the star highlight), her hair stays navy-to-sky-blue. Never draw any text, letters or subtitles.

STYLE: ${STYLE}

BRIEF:
${prompt}"

{
  echo "## $(date '+%F %T') → ${out_abs#$root/}"
  [ $# -gt 0 ] && echo "refs: $*"
  echo '```'; echo "$prompt"; echo '```'; echo
} >> "$root/gen/prompts.md"

# prompt goes through stdin: -i is greedy and would swallow a positional prompt
printf '%s' "$task" | codex exec -s workspace-write -C "$(dirname "$out_abs")" --skip-git-repo-check "${refs[@]}" > "${out_abs%.png}.log" 2>&1
[ -f "$out_abs" ] && echo "ok $out_abs" || { echo "FAILED, see ${out_abs%.png}.log"; exit 1; }
