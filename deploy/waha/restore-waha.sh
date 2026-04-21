#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_PATH="${1:-}"
TARGET_DIR="${TARGET_DIR:-/opt/catatwang-waha}"
NO_START="${NO_START:-0}"

usage() {
  cat <<'EOF'
Usage:
  ./restore-waha.sh /path/to/waha-backup.tar.gz

Optional environment variables:
  TARGET_DIR=/opt/catatwang-waha
  NO_START=1

Notes:
  - Run this on the new/target VPS.
  - This restores docker-compose.yml, .env, and .waha into TARGET_DIR.
  - If NO_START is not set, the script starts WAHA after restore.
EOF
}

if [[ -z "$ARCHIVE_PATH" || "$ARCHIVE_PATH" == "-h" || "$ARCHIVE_PATH" == "--help" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "Archive not found: $ARCHIVE_PATH" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

if [[ -f "${ARCHIVE_PATH}.sha256" ]]; then
  echo "Verifying archive checksum..."
  sha256sum -c "${ARCHIVE_PATH}.sha256"
fi

if [[ -f "$TARGET_DIR/docker-compose.yml" ]]; then
  echo "Stopping existing WAHA stack..."
  (
    cd "$TARGET_DIR"
    docker compose down >/dev/null 2>&1 || true
  )
fi

echo "Extracting backup into $TARGET_DIR"
tar -C "$TARGET_DIR" -xzf "$ARCHIVE_PATH"

chmod 600 "$TARGET_DIR/.env" 2>/dev/null || true

if [[ "$NO_START" != "1" ]]; then
  echo "Starting WAHA..."
  (
    cd "$TARGET_DIR"
    docker compose up -d
  )
fi

echo
echo "Restore complete."
echo "Target directory: $TARGET_DIR"
echo
echo "Post-restore checklist:"
echo "  1. Test WAHA: docker compose -f $TARGET_DIR/docker-compose.yml ps"
echo "  2. Check session: curl -H 'X-Api-Key: ...' http://127.0.0.1:3001/api/sessions/default"
echo "  3. Recreate HTTPS if the VPS IP/domain changed."
echo "  4. Update WAHA_BASE_URL in Vercel if needed."
