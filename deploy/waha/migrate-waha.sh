#!/usr/bin/env bash
set -euo pipefail

OLD_HOST="${OLD_HOST:-${1:-}}"
OLD_WAHA_DIR="${OLD_WAHA_DIR:-/opt/catatwang-waha}"
TARGET_DIR="${TARGET_DIR:-/opt/catatwang-waha}"
TMP_DIR="${TMP_DIR:-/tmp/waha-migration}"
ARCHIVE_NAME="${ARCHIVE_NAME:-waha-migration-$(date +%Y%m%d-%H%M%S).tar.gz}"
ARCHIVE_PATH="$TMP_DIR/$ARCHIVE_NAME"
SSH_OPTS="${SSH_OPTS:-}"
NO_START="${NO_START:-0}"
SKIP_REMOTE_STOP="${SKIP_REMOTE_STOP:-0}"

usage() {
  cat <<'EOF'
Usage:
  ./migrate-waha.sh user@OLD_VPS_IP

Optional environment variables:
  OLD_WAHA_DIR=/opt/catatwang-waha
  TARGET_DIR=/opt/catatwang-waha
  TMP_DIR=/tmp/waha-migration
  ARCHIVE_NAME=waha-migration.tar.gz
  SSH_OPTS="-i ~/.ssh/id_ed25519"
  NO_START=1
  SKIP_REMOTE_STOP=1

What this script does:
  1. Connects to the old VPS over SSH.
  2. Stops WAHA briefly on the old VPS unless SKIP_REMOTE_STOP=1.
  3. Streams docker-compose.yml, .env, and .waha into a local tar.gz.
  4. Restores them into TARGET_DIR on the new VPS.
  5. Starts WAHA on the new VPS unless NO_START=1.

Requirements:
  - Run this on the new VPS.
  - SSH access from the new VPS to the old VPS must already work.
  - Docker and docker compose must be installed on the new VPS.
EOF
}

if [[ -z "$OLD_HOST" || "$OLD_HOST" == "-h" || "$OLD_HOST" == "--help" ]]; then
  usage
  exit 0
fi

mkdir -p "$TMP_DIR" "$TARGET_DIR"

remote_ssh() {
  ssh ${SSH_OPTS} "$OLD_HOST" "$@"
}

remote_cleanup_needed=0

cleanup() {
  if [[ "$remote_cleanup_needed" == "1" && "$SKIP_REMOTE_STOP" != "1" ]]; then
    echo "Restarting WAHA on old VPS..."
    remote_ssh "cd '$OLD_WAHA_DIR' && docker compose up -d >/dev/null 2>&1 || true" || true
  fi
}

trap cleanup EXIT

echo "Checking old VPS access..."
remote_ssh "echo connected-to-\$(hostname)"

if [[ "$SKIP_REMOTE_STOP" != "1" ]]; then
  echo "Stopping WAHA on old VPS for a consistent backup..."
  remote_ssh "cd '$OLD_WAHA_DIR' && docker compose stop >/dev/null 2>&1 || true"
  remote_cleanup_needed=1
fi

echo "Streaming WAHA backup from old VPS..."
remote_ssh "tar -C '$OLD_WAHA_DIR' -czf - docker-compose.yml .env .waha" > "$ARCHIVE_PATH"

if [[ ! -s "$ARCHIVE_PATH" ]]; then
  echo "Migration archive is empty: $ARCHIVE_PATH" >&2
  exit 1
fi

sha256sum "$ARCHIVE_PATH" > "$ARCHIVE_PATH.sha256"
echo "Archive saved to $ARCHIVE_PATH"

if [[ -f "$TARGET_DIR/docker-compose.yml" ]]; then
  echo "Stopping existing WAHA on new VPS..."
  (
    cd "$TARGET_DIR"
    docker compose down >/dev/null 2>&1 || true
  )
fi

echo "Extracting archive to $TARGET_DIR..."
tar -C "$TARGET_DIR" -xzf "$ARCHIVE_PATH"
chmod 600 "$TARGET_DIR/.env" 2>/dev/null || true

if [[ "$NO_START" != "1" ]]; then
  echo "Starting WAHA on new VPS..."
  (
    cd "$TARGET_DIR"
    docker compose up -d
  )
fi

echo
echo "Migration complete."
echo "Archive: $ARCHIVE_PATH"
echo "Checksum: $ARCHIVE_PATH.sha256"
echo
echo "Next steps:"
echo "  1. Check container: docker compose -f $TARGET_DIR/docker-compose.yml ps"
echo "  2. Recreate HTTPS if IP/domain changed."
echo "  3. Update WAHA_BASE_URL in your app if needed."
echo "  4. Test session and bot messaging before shutting down the old VPS."
