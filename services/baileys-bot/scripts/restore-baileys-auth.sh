#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Usage: sh restore-baileys-auth.sh /path/to/baileys-auth-YYYYMMDD-HHMMSS.tar.gz"
  exit 1
fi

ARCHIVE="$1"
AUTH_DIR="${BAILEYS_AUTH_DIR:-/home/container/.baileys-auth}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
SAFETY_BACKUP="${AUTH_DIR}.pre-restore-${STAMP}"

if [ ! -f "${ARCHIVE}" ]; then
  echo "File backup tidak ditemukan: ${ARCHIVE}"
  exit 1
fi

mkdir -p "${AUTH_DIR}"

if [ -n "$(ls -A "${AUTH_DIR}" 2>/dev/null || true)" ]; then
  mv "${AUTH_DIR}" "${SAFETY_BACKUP}"
  mkdir -p "${AUTH_DIR}"
  echo "Auth lama dipindahkan ke: ${SAFETY_BACKUP}"
fi

tar -xzf "${ARCHIVE}" -C "${AUTH_DIR}"
echo "Restore selesai dari: ${ARCHIVE}"
echo "Direktori auth aktif: ${AUTH_DIR}"
