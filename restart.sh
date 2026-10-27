#!/usr/bin/env bash

# KubeMastery - Restart Local Web Server
# Usage: ./restart.sh [PORT]

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

PORT="${1:-}"

"$DIR/stop.sh"
echo ""
if [ -n "$PORT" ]; then
    "$DIR/start.sh" "$PORT"
else
    "$DIR/start.sh"
fi

