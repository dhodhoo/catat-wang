#!/usr/bin/env bash
set -euo pipefail

WAHA_DIR="${WAHA_DIR:-/opt/catatwang-waha}"
BACKUP_DIR="${BACKUP_DIR:-$PWD}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_NAME="${ARCHIVE_NAME:-waha-backup-$TIMESTAMP.tar.gz}"
ARCHIVE_PATH="$BACKUP_DIR/$ARCHIVE_NAME"
SHA_PATH="$ARCHIVE_PATH.sha256"
NO_STOP="${NO_STOP:-0}"

usage() {
  cat <<'EOF'
Usage:
  ./backup-waha.sh

Optional environment variables:
  WAHA_DIR=/opt/catatwang-waha
  BACKUP_DIR=/root/backups
  ARCHIVE_NAME=waha-backup.tar.gz
  NO_STOP=1

Notes:
  - Run this on the old/source VPS.
  - By default the script stops WAHA briefly for a consistent session backup.
  - Set NO_STOP=1 if you accept a live backup risk.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ ! -d "$WAHA_DIR" ]]; then
  echo "WAHA_DIR not found: $WAHA_DIR" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

if [[ "$NO_STOP" != "1" && -f "$WAHA_DIR/docker-compose.yml" ]]; then
  echo "Stopping WAHA for a consistent backup..."
  (
    cd "$WAHA_DIR"
    docker compose stop >/dev/null 2>&1 || true
  )
fi

cleanup() {
  if [[ "$NO_STOP" != "1" && -f "$WAHA_DIR/docker-compose.yml" ]]; then
    echo "Starting WAHA again..."
    (
      cd "$WAHA_DIR"
      docker compose up -d >/dev/null 2>&1 || true
    )
  fi
}

trap cleanup EXIT

echo "Creating archive: $ARCHIVE_PATH"

tar -C "$WAHA_DIR" -czf "$ARCHIVE_PATH" \
  --warning=no-file-changed \
  docker-compose.yml \
  .env \
  .waha \
  2>/dev/null || {
  echo "Backup failed. Make sure docker-compose.yml, .env, and .waha exist in $WAHA_DIR." >&2
  exit 1
}

sha256sum "$ARCHIVE_PATH" > "$SHA_PATH"

echo
echo "Backup complete."
echo "Archive: $ARCHIVE_PATH"
echo "Checksum: $SHA_PATH"
echo
echo "Next step examples:"
echo "  scp $ARCHIVE_PATH user@NEW_VPS_IP:/root/"
echo "  scp $SHA_PATH user@NEW_VPS_IP:/root/"
