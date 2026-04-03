# WAHA VPS Setup

Tujuan dokumen ini adalah memindahkan WAHA dari laptop lokal ke VPS Linux agar fitur WhatsApp tidak bergantung pada Docker Desktop lokal.

## Arsitektur minimum

- WAHA berjalan di VPS pada port `3001`
- Aplikasi web tetap berjalan di Vercel
- Backend data tetap di InsForge
- `WAHA_BASE_URL` production diarahkan ke `http://<ip-vps>:3001`

Catatan:
- Setup minimum ini belum memakai domain dan TLS khusus WAHA
- Untuk MVP ini cukup, tetapi untuk jangka lebih aman sebaiknya nanti ditambah reverse proxy + HTTPS

## Prasyarat VPS

- OS Linux dengan Docker dan Docker Compose
- Port `3001/tcp` terbuka dari internet
- Akses SSH dari mesin lokal ini

## File deploy

- Compose server: `deploy/waha/docker-compose.yml`
- Script upload dan start: `scripts/deploy-waha-vps.ps1`
- Script sinkron env production: `scripts/sync-waha-production-env.ps1`

## Langkah eksekusi

1. Deploy WAHA ke VPS

```powershell
.\scripts\deploy-waha-vps.ps1 -Host <ip-vps> -User root
```

2. Update env production app dan function reminder

```powershell
.\scripts\sync-waha-production-env.ps1 -WahaBaseUrl http://<ip-vps>:3001
```

3. Buka halaman production WhatsApp settings

```text
https://catat-wang.vercel.app/settings/whatsapp
```

4. Klik `Siapkan / Refresh QR`

5. Scan QR untuk menghubungkan nomor bot

## Verifikasi cepat

- `http://<ip-vps>:3001/api/sessions`
- `https://catat-wang.vercel.app/api/whatsapp/webhook`
- Kirim pesan `jajan 25rb` ke bot
