#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/projects/mt"
PIDFILE="$APP_DIR/mt.pid"
LOGFILE="$APP_DIR/mt.log"
SERVER_SCRIPT="$APP_DIR/server/dist/index.js"
MT_PORT=${MT_PORT:-8042}

cmd="${1:-start}"

is_running() {
  if [[ -f "$PIDFILE" ]]; then
    local pid
    pid="$(cat "$PIDFILE" 2>/dev/null || true)"
    [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null
  else
    return 1
  fi
}

start() {
  if [[ ! -f $SERVER_SCRIPT ]]; then
    echo "Error: Server not built. Run 'npm run build' first"
    return 1
  fi

  if is_running; then
    echo "mt is already running (pid $(cat "$PIDFILE"))"
    return 0
  fi

  cd "$APP_DIR"

  # Start detached, log to file
  MT_PORT=$MT_PORT NODE_ENV=production nohup node server/dist/index.js >>"$LOGFILE" 2>&1 &

  local pid="$!"
  echo "$pid" > "$PIDFILE"

  # quick sanity check (process exists right after start)
  if kill -0 "$pid" 2>/dev/null; then
    echo "started (pid $pid)"
  else
    rm -f "$PIDFILE"
    echo "failed to start"
    return 1
  fi
}

stop() {
  if ! is_running; then
    echo "mt is not running"
    rm -f "$PIDFILE" 2>/dev/null || true
    return 0
  fi

  local pid
  pid="$(cat "$PIDFILE")"

  kill "$pid"

  # wait up to ~10s for graceful exit
  for _ in {1..100}; do
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$PIDFILE"
      echo "stopped"
      return 0
    fi
    sleep 0.1
  done

  # force kill if still alive
  # kill -9 "$pid" 2>/dev/null || true
  rm -f "$PIDFILE"
  echo "stopped (forced)"
}

status() {
  if is_running; then
    echo "mt is running (pid $(cat "$PIDFILE"))"
  else
    echo "mt is stopped"
    return 1
  fi
}


restart() {
  stop || true
  start
}

case "$cmd" in
  start)   start ;;
  stop)    stop ;;
  restart) restart ;;
  status)  status ;;
  *)
    echo "usage: mt [start|stop|restart|status]"
    exit 2
    ;;
esac
