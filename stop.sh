#!/usr/bin/env bash

# KubeMastery - Stop Local Web Server
# Usage: ./stop.sh

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

PID_FILE="$DIR/.server.pid"
PORT_FILE="$DIR/.server.port"
PORT="3080"
if [ -f "$PORT_FILE" ]; then
    PORT=$(cat "$PORT_FILE")
fi

STOPPED=false

# Method 1: Check PID from PID_FILE
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "🛑 Stopping KubeMastery server (PID: $PID)..."
        kill "$PID" 2>/dev/null
        
        # Wait up to 3 seconds for graceful shutdown
        for i in {1..6}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                STOPPED=true
                break
            fi
            sleep 0.5
        done

        # Force kill if still running
        if kill -0 "$PID" 2>/dev/null; then
            echo "⚠️  Force stopping process $PID..."
            kill -9 "$PID" 2>/dev/null
            STOPPED=true
        fi
    else
        echo "ℹ️  Process $PID is not running."
    fi
    rm -f "$PID_FILE"
fi

# Method 2: Check if any process is still listening on the server port
PORT_PIDS=$(lsof -ti :"$PORT" 2>/dev/null)
if [ -n "$PORT_PIDS" ]; then
    for P in $PORT_PIDS; do
        echo "🛑 Stopping process on port $PORT (PID: $P)..."
        kill "$P" 2>/dev/null
        sleep 0.5
        if kill -0 "$P" 2>/dev/null; then
            kill -9 "$P" 2>/dev/null
        fi
        STOPPED=true
    done
fi

rm -f "$PORT_FILE"

if [ "$STOPPED" = true ]; then
    echo "✅ KubeMastery server stopped successfully."
else
    echo "ℹ️  No running KubeMastery server found on port $PORT."
fi

