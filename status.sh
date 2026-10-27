#!/usr/bin/env bash

# KubeMastery - Check Server Status
# Usage: ./status.sh

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

PID_FILE="$DIR/.server.pid"
PORT_FILE="$DIR/.server.port"
PORT="3080"
if [ -f "$PORT_FILE" ]; then
    PORT=$(cat "$PORT_FILE")
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    PID=$(cat "$PID_FILE")
    echo "🟢 KubeMastery server is RUNNING"
    echo "----------------------------------------"
    echo "🌐 Local URL : http://localhost:$PORT"
    echo "🆔 PID       : $PID"
    echo "📄 Log file  : $DIR/server.log"
    echo "----------------------------------------"
    if [ -f "$DIR/server.log" ]; then
        echo "📋 Recent logs (last 5 lines):"
        tail -n 5 "$DIR/server.log"
    fi
else
    echo "🔴 KubeMastery server is STOPPED"
    echo "💡 Start with: ./start.sh"
fi

