#!/usr/bin/env bash

# KubeMastery - Start Local Web & CKAD Lab Server
# Usage: ./start.sh [PORT] (default: 3080)

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

PORT="${1:-3080}"
PID_FILE="$DIR/.server.pid"
PORT_FILE="$DIR/.server.port"
LOG_FILE="$DIR/server.log"

NODE_BIN="$(command -v node 2>/dev/null || echo "/home/nopakun-sangon/.local/node-v20.18.0-linux-x64/bin/node")"

# Check if port is already in use by any process
RUNNING_PID=$(lsof -ti :"$PORT" 2>/dev/null | head -n 1)
if [ -n "$RUNNING_PID" ]; then
    echo "⚠️  KubeMastery server is already running on port $PORT (PID: $RUNNING_PID)"
    echo "🌐 URL: http://localhost:$PORT"
    echo "📄 Logs: $LOG_FILE"
    echo "💡 Use './stop.sh' to stop the server or './restart.sh' to restart."
    echo "$RUNNING_PID" > "$PID_FILE"
    echo "$PORT" > "$PORT_FILE"
    exit 0
fi

# Clean stale PID file if present
rm -f "$PID_FILE" "$PORT_FILE"

echo "🚀 Starting KubeMastery web & CKAD lab server on port $PORT..."

if command -v setsid >/dev/null 2>&1; then
    setsid -f "$NODE_BIN" "$DIR/server.js" "$PORT" > "$LOG_FILE" 2>&1
else
    nohup "$NODE_BIN" "$DIR/server.js" "$PORT" < /dev/null > "$LOG_FILE" 2>&1 & disown
fi

# Give server time to bind port
sleep 0.8

SERVER_PID=$(lsof -ti :"$PORT" 2>/dev/null | head -n 1)

if [ -n "$SERVER_PID" ]; then
    echo "$SERVER_PID" > "$PID_FILE"
    echo "$PORT" > "$PORT_FILE"
    echo "✅ KubeMastery server started successfully!"
    echo "----------------------------------------"
    echo "🌐 Local URL      : http://localhost:$PORT"
    echo "🔧 CKAD Workspace : ~/ckad-workspace"
    echo "🆔 PID            : $SERVER_PID"
    echo "📄 Log file       : $LOG_FILE"
    echo "----------------------------------------"
    echo "💡 Run './stop.sh' to stop the server."
else
    echo "❌ Failed to start server on port $PORT."
    if [ -f "$LOG_FILE" ]; then
        echo "📋 Log output:"
        tail -n 10 "$LOG_FILE"
    fi
    exit 1
fi
