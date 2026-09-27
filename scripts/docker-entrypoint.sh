#!/bin/sh
set -e

# Runs the server as the owner of the data directory, so files written to a
# bind mount stay editable on the host. A root-owned directory (created by
# Docker, or written by older images that ran as root) is handed to `node`.
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$MT_HOME"

  uid="$(stat -c %u "$MT_HOME")"
  gid="$(stat -c %g "$MT_HOME")"
  if [ "$uid" = "0" ]; then
    uid="$(id -u node)"
    gid="$(id -g node)"
  fi

  find "$MT_HOME" ! -user "$uid" -exec chown "$uid:$gid" {} + ||
    echo "MindThis: could not change ownership of $MT_HOME; some files may be read-only" >&2

  exec su-exec "$uid:$gid" "$@"
fi

exec "$@"
