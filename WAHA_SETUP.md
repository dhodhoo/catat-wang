# WAHA Setup

## 1. Jalankan WAHA

```bash
docker compose -f docker-compose.waha.yml up -d
```

WAHA akan tersedia di `http://localhost:3001`.

## 2. Isi env aplikasi

Tambahkan ke `.env.local`:

```bash
WAHA_BASE_URL=http://localhost:3001
WAHA_API_KEY=your-local-waha-api-key
WAHA_SESSION_NAME=default
WAHA_WEBHOOK_URL=http://host.docker.internal:3000
WAHA_WEBHOOK_SECRET=your-local-webhook-secret
```

`WAHA_WEBHOOK_URL` penting saat WAHA berjalan di Docker lokal. Dari dalam container, `localhost:3000` akan mengarah ke container sendiri, bukan ke app Next.js di host.

## 3. Start aplikasi

```bash
npm install
npm run dev
```

## 4. Siapkan session WAHA

1. Buka `/settings/whatsapp`
2. Klik `Siapkan / Refresh QR`
3. Scan QR dengan akun WhatsApp yang akan menjadi nomor bot

## 5. Hubungkan user app ke nomor WhatsApp

1. Login ke web
2. Panggil `POST /api/whatsapp/link/initiate`
3. Kirim kode `LINK-xxxxxx` ke nomor bot WAHA

## 6. Testing

Kirim pesan seperti:

```text
jajan 25rb
gaji masuk 5jt
kemarin parkir 10rb
```

Kirim foto struk ke nomor bot untuk menguji OCR.
