# PRD Final
**Produk:** Aplikasi web pencatatan keuangan pribadi via WhatsApp  
**Nama sementara:** CatatUang WA  
**Versi:** v1.0  
**Fokus:** Personal finance, Indonesia, gratis, WhatsApp-first

## 1. Ringkasan Produk
CatatUang WA adalah aplikasi web untuk membantu individu mencatat pemasukan dan pengeluaran pribadi melalui WhatsApp. Pengguna cukup mengirim pesan teks atau foto struk, lalu sistem otomatis mencatat transaksi tanpa perlu konfirmasi manual terlebih dahulu. Dashboard web dipakai untuk melihat cashflow, mengelola kategori, serta input dan edit transaksi secara manual.

Produk ini ditujukan untuk pengguna yang ingin mencatat keuangan dengan cara yang cepat, ringan, dan tidak terasa seperti “mengisi aplikasi keuangan”.

## 2. Keputusan Produk yang Sudah Final
Berdasarkan jawaban Anda, produk ini akan dibuat dengan arah berikut:

- Target utama: **individu**
- Fokus: **keuangan pribadi**
- Kanal input: **WhatsApp teks dan foto struk**
- Pola pencatatan: **auto-save**
- Tipe pengguna: **single user**
- Akun/dompet terpisah: **tidak ada di MVP**
- Laporan utama: **cashflow**
- Dashboard web: **lihat, tambah, edit transaksi**
- Gaya bot: **singkat dan fungsional**
- Integrasi eksternal: **tidak ada**
- Wilayah: **Indonesia**
- Mata uang: **Rupiah**
- Model bisnis awal: **gratis**
- Kategori: **fleksibel**
- Reminder: **via WhatsApp**
- Insight via WhatsApp: **tidak perlu**

## 3. Latar Belakang Masalah
Banyak orang ingin mencatat keuangan pribadi, tetapi gagal konsisten karena prosesnya terasa merepotkan. Mereka harus membuka aplikasi khusus, memilih menu, lalu mengisi form transaksi. Dalam praktik sehari-hari, pengguna jauh lebih sering membuka WhatsApp daripada aplikasi finance.

Masalah utama yang ingin diselesaikan:
- proses input transaksi terlalu panjang
- pengguna malas mencatat pengeluaran kecil
- data keuangan pribadi tidak terkumpul secara konsisten
- aplikasi pencatatan terasa formal dan berat untuk penggunaan harian

## 4. Tujuan Produk
Produk ini dibuat untuk mencapai tujuan berikut:

- Memudahkan pengguna mencatat transaksi keuangan harian secepat mungkin.
- Menjadikan WhatsApp sebagai jalur input utama yang natural.
- Menyediakan dashboard web sederhana untuk memantau cashflow.
- Meningkatkan konsistensi pencatatan harian.
- Mengurangi hambatan penggunaan dibanding aplikasi finance tradisional.

## 5. Non-Goal
Fitur berikut **tidak termasuk** dalam MVP:

- multi-user atau akun keluarga
- pemisahan dompet/bank/e-wallet
- sinkronisasi bank otomatis
- budgeting kompleks
- laporan akuntansi
- integrasi Google Sheets, POS, e-commerce, atau software akuntansi
- insight finansial canggih via chat
- multi-currency atau multi-country

## 6. Persona Utama
### Persona: Individu sibuk yang ingin serba cepat
Ciri utama:
- sering memakai WhatsApp
- ingin mencatat pengeluaran/pemasukan pribadi
- tidak suka aplikasi yang terlalu banyak langkah
- ingin tahu cashflow bulanan tanpa repot

Kebutuhan:
- input transaksi kurang dari 10 detik
- cukup kirim chat biasa
- tetap bisa koreksi bila hasil auto-save salah
- bisa melihat rekap yang rapi di web

## 7. Nilai Utama Produk
Produk ini harus terasa:
- **cepat** untuk dipakai setiap hari
- **natural** karena berbasis chat
- **ringan** karena fokus pada kebutuhan pribadi
- **praktis** karena auto-save
- **mudah dikoreksi** bila sistem salah membaca pesan atau struk

## 8. Scope MVP
### Dalam scope
- registrasi dan login web
- koneksi nomor WhatsApp ke akun
- input transaksi lewat pesan teks WhatsApp
- input transaksi lewat foto struk WhatsApp
- auto-save transaksi
- notifikasi singkat setelah transaksi tercatat
- edit dan hapus transaksi melalui web
- edit transaksi terakhir atau hapus transaksi terakhir via WhatsApp
- dashboard cashflow
- daftar histori transaksi
- filter transaksi berdasarkan tanggal dan kategori
- kategori default + kategori custom
- input manual transaksi dari web
- reminder pencatatan via WhatsApp
- pencatatan pemasukan dan pengeluaran

### Di luar scope
- transfer antar dompet
- saldo per akun
- laporan laba rugi
- analisis pengeluaran via bot
- chatbot percakapan panjang
- item-level parsing detail dari semua baris struk

## 9. Prinsip Produk
Beberapa prinsip desain produk untuk MVP:

1. **WhatsApp adalah pintu masuk utama**, web adalah tempat review dan kontrol.
2. **Auto-save lebih penting daripada konfirmasi**, tetapi harus ada jalur koreksi cepat.
3. **Output bot harus pendek**, misalnya 1 balasan ringkas per transaksi.
4. **Sistem harus toleran terhadap bahasa sehari-hari Indonesia**, termasuk “rb”, “ribu”, “jt”, “ceban”, “gocap”.
5. **Dashboard fokus pada cashflow**, bukan pembukuan lengkap.

## 10. User Flow Utama
### A. Onboarding
1. Pengguna mendaftar di web.
2. Pengguna memverifikasi akun.
3. Pengguna menghubungkan nomor WhatsApp.
4. Sistem menampilkan contoh cara mencatat transaksi.
5. Pengguna mulai mengirim pesan ke nomor WhatsApp produk.

### B. Input transaksi lewat teks WhatsApp
1. Pengguna mengirim pesan seperti:
   - “jajan 25rb”
   - “makan siang 35 ribu”
   - “gaji masuk 5jt”
2. Sistem memproses isi pesan.
3. Sistem mendeteksi minimal:
   - tipe transaksi
   - nominal
   - tanggal
   - kategori
   - catatan bila ada
4. Jika field minimum terpenuhi, sistem langsung menyimpan transaksi.
5. Sistem mengirim balasan singkat, misalnya:
   - “Tercatat: Pengeluaran Rp25.000, kategori Jajan, 2 Apr. Balas UBAH atau HAPUS bila perlu.”
6. Transaksi tampil di dashboard web.

### C. Input transaksi lewat foto struk
1. Pengguna mengirim foto struk melalui WhatsApp.
2. Sistem menjalankan OCR untuk membaca struk.
3. Sistem mencoba mengekstrak:
   - merchant/toko
   - tanggal transaksi
   - total pembayaran
4. Jika total berhasil ditemukan, transaksi langsung disimpan sebagai pengeluaran.
5. Sistem mengirim balasan singkat, misalnya:
   - “Tercatat dari struk: Pengeluaran Rp72.500 di Indomaret. Balas UBAH atau HAPUS bila perlu.”
6. Foto struk dilampirkan ke transaksi untuk referensi di web.

### D. Review dan edit di web
1. Pengguna login ke web.
2. Pengguna melihat ringkasan cashflow.
3. Pengguna membuka histori transaksi.
4. Pengguna dapat tambah, edit, hapus, dan ubah kategori transaksi.
5. Pengguna dapat melihat transaksi yang ditandai “perlu review”.

### E. Reminder WhatsApp
1. Pengguna mengaktifkan reminder dari web.
2. Sistem mengirim pesan pengingat harian atau mingguan.
3. Pengguna bisa langsung membalas reminder dengan transaksi baru.

## 11. Kebutuhan Fungsional
### FR-01. Registrasi dan autentikasi
Sistem harus menyediakan:
- pendaftaran akun web
- login dan logout
- reset password
- penghubungan satu nomor WhatsApp ke satu akun

### FR-02. Pencatatan transaksi via teks WhatsApp
Sistem harus bisa membaca pesan teks dalam Bahasa Indonesia sehari-hari dan mengubahnya menjadi transaksi.

Field minimum:
- tipe transaksi: pemasukan atau pengeluaran
- nominal
- tanggal transaksi

Field tambahan:
- kategori
- catatan
- sumber input: WhatsApp teks

Contoh yang harus didukung:
- “jajan 20rb”
- “beli kopi 18.000”
- “makan siang 35rb”
- “gaji masuk 5jt”
- “kemarin parkir 10rb”
- “bayar listrik 450rb”

### FR-03. Pencatatan transaksi via foto struk
Sistem harus bisa menerima foto struk dan menjalankan OCR.

Minimum hasil ekstraksi:
- total pembayaran
- merchant bila tersedia
- tanggal bila tersedia

Aturan MVP:
- fokus pada struk cetak yang jelas dan satu transaksi per foto
- yang dicari adalah **grand total / total bayar**
- item per baris tidak wajib diparse
- bila total tidak ditemukan, sistem meminta pengguna mengirim nominal secara manual

### FR-04. Auto-save
Sistem harus menyimpan transaksi secara otomatis tanpa langkah konfirmasi.

Aturan:
- bila field minimum berhasil dideteksi, transaksi langsung dibuat
- sistem mengirim acknowledgement singkat setelah save
- pengguna tetap harus bisa mengoreksi transaksi dengan cepat

### FR-05. Koreksi transaksi
Karena modelnya auto-save, sistem harus menyediakan koreksi cepat.

Lewat WhatsApp minimal mendukung:
- ubah transaksi terakhir
- hapus transaksi terakhir
- ubah kategori transaksi terakhir
- ubah nominal transaksi terakhir
- ubah tanggal transaksi terakhir

Lewat web:
- edit transaksi apa pun
- hapus transaksi
- ubah kategori
- ubah catatan
- ubah tanggal dan nominal

### FR-06. Dashboard cashflow
Dashboard web harus menampilkan:
- total pemasukan periode berjalan
- total pengeluaran periode berjalan
- cashflow bersih periode berjalan
- grafik cashflow per hari / per minggu / per bulan
- kategori pengeluaran terbesar
- daftar transaksi terbaru

Catatan: karena tidak ada pemisahan dompet/akun, dashboard tidak perlu menampilkan saldo per akun.

### FR-07. Histori transaksi
Pengguna harus bisa:
- melihat semua transaksi
- mencari transaksi
- filter berdasarkan tanggal
- filter berdasarkan kategori
- buka detail transaksi
- melihat apakah transaksi berasal dari teks, foto struk, atau input manual

### FR-08. Input manual di web
Web app harus menyediakan form transaksi manual dengan field:
- tipe transaksi
- nominal
- tanggal
- kategori
- catatan opsional
- lampiran foto struk opsional

### FR-09. Kategori fleksibel
Sistem harus menyediakan:
- kategori default saat awal penggunaan
- tambah kategori custom
- ubah nama kategori
- arsipkan kategori
- assign transaksi ke kategori apa pun

Kategori default awal dapat mencakup:
- Makan & Minum
- Transportasi
- Belanja
- Tagihan
- Hiburan
- Kesehatan
- Pendidikan
- Hadiah
- Gaji
- Bonus
- Lainnya

### FR-10. Reminder via WhatsApp
Sistem harus mendukung reminder pencatatan via WhatsApp.

MVP minimal:
- reminder harian
- reminder mingguan
- pilihan jam reminder
- on/off reminder dari web

Contoh pesan:
- “Sudah ada pengeluaran hari ini? Balas langsung di sini untuk mencatat.”
- “Jangan lupa catat transaksi minggu ini.”

### FR-11. Status review
Sistem harus dapat menandai transaksi tertentu sebagai **Perlu Review** bila:
- OCR confidence rendah
- kategori tidak yakin
- tanggal tidak jelas
- ada potensi duplikasi

Tujuannya agar auto-save tetap berjalan, tetapi pengguna tetap tahu transaksi mana yang perlu dicek.

## 12. Aturan Bisnis
1. Sistem hanya mendukung **pemasukan** dan **pengeluaran**.
2. Sistem default menggunakan mata uang **IDR**.
3. Satu pesan atau satu foto struk maksimal menjadi satu transaksi pada MVP.
4. Jika nominal tidak ditemukan, transaksi tidak dibuat dan sistem meminta input ulang.
5. Jika kategori tidak jelas, transaksi tetap bisa dibuat dengan kategori **Lainnya**.
6. Jika tanggal tidak jelas, sistem menggunakan tanggal saat pesan diterima.
7. Jika OCR menemukan total dengan confidence rendah, transaksi dibuat dengan status **Perlu Review**.
8. Jika pesan yang sama masuk berulang dalam waktu singkat, sistem harus mengecek kemungkinan duplikat.
9. Semua transaksi dari WhatsApp harus menyimpan **raw message** atau referensi file aslinya untuk audit dan koreksi.

## 13. Contoh Percakapan WhatsApp
### Teks
**User:** jajan 25rb  
**System:** Tercatat: Pengeluaran Rp25.000, kategori Jajan, hari ini. Balas UBAH atau HAPUS bila perlu.

**User:** gaji masuk 5jt  
**System:** Tercatat: Pemasukan Rp5.000.000, kategori Gaji, hari ini.

**User:** kemarin parkir 10rb  
**System:** Tercatat: Pengeluaran Rp10.000, kategori Transportasi, tanggal kemarin.

### Foto struk
**User:** [mengirim foto struk]  
**System:** Tercatat dari struk: Pengeluaran Rp72.500 di Indomaret. Balas UBAH atau HAPUS bila perlu.

### Koreksi
**User:** ubah terakhir jadi 35rb  
**System:** Transaksi terakhir diperbarui menjadi Rp35.000.

**User:** kategori terakhir transportasi  
**System:** Kategori transaksi terakhir diubah ke Transportasi.

**User:** hapus transaksi terakhir  
**System:** Transaksi terakhir berhasil dihapus.

## 14. Kebutuhan Non-Fungsional
### Performa
- Balasan WhatsApp untuk teks target di bawah 5 detik pada kondisi normal.
- OCR struk target di bawah 10 detik pada kondisi normal.
- Dashboard web target memuat halaman utama di bawah 3 detik untuk volume data personal standar.

### Keamanan
- autentikasi aman untuk web
- password di-hash
- data terenkripsi saat transit
- akses foto struk hanya untuk pemilik akun
- audit log untuk edit dan delete transaksi

### Reliabilitas
- webhook WhatsApp tidak boleh kehilangan pesan
- proses OCR dan parsing harus punya retry mechanism
- transaksi tidak boleh tercatat dua kali akibat retry provider

### Usability
- bot harus memberi balasan singkat
- dashboard harus mobile-friendly
- form edit harus sederhana
- kategori harus mudah ditambah dan diubah

### Privasi
- data transaksi pribadi tidak dibagikan ke pihak ketiga selain penyedia infrastruktur yang dibutuhkan
- foto struk dan isi transaksi diperlakukan sebagai data sensitif

## 15. Struktur Data Inti
### User
- id
- nama
- email
- nomor_whatsapp
- timezone
- reminder_enabled
- reminder_frequency
- reminder_time

### Category
- id
- user_id
- nama_kategori
- tipe: income atau expense
- is_default
- is_archived

### Transaction
- id
- user_id
- type
- amount
- transaction_date
- category_id
- note
- source_channel: whatsapp_text, whatsapp_receipt, web_manual
- review_status
- raw_input_reference
- created_at
- updated_at

### ReceiptAttachment
- id
- transaction_id
- image_url
- ocr_text
- merchant_name
- detected_total
- detected_date
- ocr_confidence

### MessageLog
- id
- user_id
- whatsapp_message_id
- raw_text
- parsed_payload
- processing_status
- created_at

## 16. Metrik Keberhasilan
Untuk MVP gratis, metrik utama berfokus pada adopsi dan kualitas penggunaan.

### Aktivasi
- persentase user yang berhasil menghubungkan WhatsApp
- persentase user yang berhasil mencatat transaksi pertama dalam 1 hari pertama

### Engagement
- jumlah transaksi rata-rata per user per minggu
- persentase user aktif mingguan
- persentase user yang membuka dashboard minimal 1 kali per minggu

### Kualitas parsing
- persentase pesan teks yang berhasil jadi transaksi tanpa edit
- persentase foto struk yang berhasil menghasilkan total pembayaran
- edit rate setelah auto-save
- delete rate setelah auto-save

### Reminder effectiveness
- persentase reminder yang direspons dengan transaksi
- jumlah transaksi yang masuk dari reminder thread

## 17. Risiko dan Mitigasi
### Risiko 1: Auto-save mencatat transaksi yang salah
Mitigasi:
- balasan acknowledgement yang jelas
- perintah UBAH dan HAPUS yang mudah
- status Perlu Review untuk confidence rendah

### Risiko 2: OCR struk tidak akurat
Mitigasi:
- batasi scope ke struk cetak jelas
- fokus hanya ke merchant, tanggal, dan grand total
- fallback ke input nominal manual

### Risiko 3: Pengguna berharap bisa membaca semua format bahasa
Mitigasi:
- dukung pola Bahasa Indonesia paling umum terlebih dahulu
- simpan raw input untuk perbaikan parser
- tampilkan kategori default “Lainnya” saat ambigu

### Risiko 4: Data ganda
Mitigasi:
- deduplication berbasis message id, timestamp, nominal, dan similarity input

### Risiko 5: Tanpa dompet/akun, user tidak mendapat saldo akurat
Mitigasi:
- produk diposisikan jelas sebagai **cashflow tracker**, bukan balance tracker

## 18. Rekomendasi Implementasi
Agar risikonya rendah, saya sarankan delivery internal dibagi dua milestone walaupun tetap berada dalam satu payung MVP:

### Milestone 1
- registrasi dan login web
- koneksi WhatsApp
- input teks WhatsApp
- auto-save
- dashboard cashflow
- histori transaksi
- kategori fleksibel
- input/edit manual di web
- reminder WhatsApp

### Milestone 2
- foto struk
- OCR
- lampiran struk di transaksi
- status Perlu Review untuk hasil OCR

Alasannya sederhana: fitur foto struk membawa kompleksitas paling besar, sementara value tercepat untuk pengguna datang dari input teks.

## 19. Definition of Done untuk MVP
MVP dianggap selesai bila:

- user bisa daftar dan login ke web
- user bisa menghubungkan nomor WhatsApp
- user bisa mencatat pemasukan dan pengeluaran lewat teks WhatsApp
- user bisa mencatat pengeluaran lewat foto struk
- transaksi otomatis tersimpan tanpa konfirmasi manual
- user menerima balasan singkat setelah save
- user bisa edit dan hapus transaksi dari web
- user bisa koreksi transaksi terakhir lewat WhatsApp
- user bisa menambah kategori custom
- user bisa melihat cashflow harian, mingguan, dan bulanan di web
- user bisa mengaktifkan reminder pencatatan via WhatsApp

## 20. Ringkasan Satu Kalimat
Produk ini adalah **web app pencatatan keuangan pribadi yang memakai WhatsApp sebagai jalur input tercepat, dengan auto-save, dukungan teks dan foto struk, serta dashboard cashflow yang sederhana.**
