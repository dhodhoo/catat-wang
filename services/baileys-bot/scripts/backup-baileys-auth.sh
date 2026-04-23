#!/usr/bin/env sh
set -eu

AUTH_DIR="${BAILEYS_AUTH_DIR:-/home/container/.baileys-auth}"
BACKUP_DIR="${BAILEYS_AUTH_BACKUP_DIR:-/home/container/backups/baileys-auth}"
RETENTION_DAYS="${BAILEYS_AUTH_BACKUP_RETENTION_DAYS:-14}"

LOCK_DIR="${BACKUP_DIR}/.backup.lock"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
ARCHIVE="${BACKUP_DIR}/baileys-auth-${STAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  echo "Backup sedang berjalan, skip."
  exit 0
fi

cleanup() {
  rmdir "${LOCK_DIR}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if [ ! -d "${AUTH_DIR}" ]; then
  echo "Auth dir tidak ditemukan: ${AUTH_DIR}"
  exit 1
fi

if [ -z "$(ls -A "${AUTH_DIR}" 2>/dev/null || true)" ]; then
  echo "Auth dir kosong, tidak membuat backup."
  exit 0
fi

tar -czf "${ARCHIVE}" -C "${AUTH_DIR}" .
echo "Backup dibuat: ${ARCHIVE}"

find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'baileys-auth-*.tar.gz' -mtime +"${RETENTION_DAYS}" -delete
echo "Cleanup selesai (retensi ${RETENTION_DAYS} hari)."
