#!/usr/bin/env bash
# find-local.sh — Search skills already installed on this machine.
#
# Usage:
#   find-local.sh <keyword>     # match skill name or description (case-insensitive)
#   find-local.sh --list        # list every skill with its description
#   find-local.sh               # same as --list
#
# Roots searched:
#   ~/.claude*/skills                                   Claude Code (per route)
#   ~/.agents/skills                                    Codex CLI / AGENTS.md standard
#   ~/.config/opencode/skills, ~/.codex/skills          opencode, Codex legacy
#   $CLAUDE_PROJECT_DIR/.claude/skills
#   ./.claude/skills, ./.agents/skills, ./.opencode/skills
#   ~/.claude/plugins/cache/**/SKILL.md, ~/.codex/plugins/cache/**/SKILL.md
#
# CLI built-in skills live inside the binary and are not visible here.
# Symlinked skills (the usual project-scoped setup) are shown once, at the
# first real location found.

set -euo pipefail

TERM=""
LIST=0
for arg in "$@"; do
  case "$arg" in
    --list|-l) LIST=1 ;;
    -h|--help) sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) TERM="$arg" ;;
  esac
done
[[ -z "$TERM" ]] && LIST=1

desc_of() {
  awk '
    /^description:[[:space:]]*/ {
      sub(/^description:[[:space:]]*/, "")
      if ($0 !~ /^[|>][+-]?$/) { buf = $0; have = 1 }
      collecting = 1
      next
    }
    collecting {
      if ($0 ~ /^[A-Za-z_][A-Za-z0-9_-]*:/ || $0 ~ /^---/) { collecting = 0; next }
      if ($0 ~ /^[[:space:]]*$/) next
      gsub(/^[[:space:]]+/, "")
      buf = (have ? buf " " : "") $0
      have = 1
    }
    END { gsub(/[[:space:]]+/, " ", buf); print buf }
  ' "$1" | cut -c1-110
}

real_dir_of() {
  (cd "$(dirname "$1")" && pwd -P)
}

roots=()
for d in "$HOME"/.claude*/skills; do
  [[ -d "$d" ]] && roots+=("$d")
done
for d in "$HOME/.agents/skills" "$HOME/.config/opencode/skills" "$HOME/.codex/skills"; do
  [[ -d "$d" ]] && roots+=("$d")
done
[[ -n "${CLAUDE_PROJECT_DIR:-}" && -d "$CLAUDE_PROJECT_DIR/.claude/skills" ]] &&
  roots+=("$CLAUDE_PROJECT_DIR/.claude/skills")
for d in ./.claude/skills ./.agents/skills ./.opencode/skills; do
  [[ -d "$d" ]] && roots+=("$d")
done

count=0
seen="|"
maybe_emit() {
  local f="$1" name real desc key
  name="$(basename "$(dirname "$f")")"
  desc="$(desc_of "$f")"
  if [[ $LIST -eq 0 ]]; then
    printf '%s %s\n' "$name" "$desc" | grep -qi -- "$TERM" || return 0
  fi
  real="$(real_dir_of "$f")"
  # Same skill installed in several roots (global copy + project symlink) is
  # reported once; same name with different content is reported for each copy.
  key="$name|$(shasum -a 1 < "$f" | cut -d' ' -f1)"
  [[ "$seen" == *"|$key|"* ]] && return 0
  seen="$seen$key|"
  printf '%-30s %s\n' "$name" "$desc"
  printf '%-30s %s\n' "" "$real"
  count=$((count + 1))
}

for root in "${roots[@]}"; do
  for f in "$root"/*/SKILL.md; do
    [[ -f "$f" ]] || continue
    maybe_emit "$f"
  done
done

while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  maybe_emit "$f"
done < <(find "$HOME/.claude/plugins/cache" -name SKILL.md -not -path "*/.git/*" 2>/dev/null)

if [[ $count -eq 0 ]]; then
  if [[ $LIST -eq 1 ]]; then
    echo "No installed skills found (roots: ${roots[*]:-none})"
  else
    echo "No installed skill matches: $TERM"
    echo "Not installed is not missing — check the external sources in the find-skill SKILL.md."
  fi
else
  echo "---"
  echo "$count skill(s)"
fi
