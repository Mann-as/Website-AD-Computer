NAMA	: Ahmad Firmansyah
NIM	: 41257086
KELOMPOK: RPL 3
TEMA	: WEBSITE LAYANAN IT "AD COMPUTER"


# AD Computer - Service Komputer & IT Services Platform

Sistem web manajemen perbaikan komputer, instalasi OS/software, networking, dan IT Support yang dilengkapi dengan **AI Assistant (Google Gemini)** untuk diagnosis hardware/software serta pembuatan draft balasan customer otomatis.

---

## 🚀 Fitur Utama System

### 1. Customer Experience
* **Landing Page Modern:** Katalog layanan transparan (harga dasar & estimasi durasi).
* **AI Diagnosis Assistant:** Konsultasi masalah laptop/komputer 24/7, menjawab identitas sesuai akun yang login, informasi layanan/lokasi/kontak secara profesional, estimasi harga umum sparepart dengan disclaimer, serta menolak pertanyaan database atau sistem internal.
* **Autentikasi & Portal Customer:** Registrasi, login JWT, profil customer, dan daftar riwayat permintaan service.
* **Tracking Status Realtime:** Pantau posisi pengerjaan service (`REQUESTED` -> `CONFIRMED` -> `IN_PROGRESS` -> `WAITING_CUSTOMER` -> `COMPLETED` -> `PAID`).
* **Konfirmasi Pembayaran:** Customer mengonfirmasi metode pembayaran, lalu Admin memverifikasi pembayaran menjadi `PAID`.

### 2. Admin Executive Console
* **Executive Dashboard:** KPI Metrics (Total Service, Pending Queue, Completed Count, Total Revenue).
* **Service Request Management:** Monitoring order, pencarian/pagination, penugasan teknisi, dan validasi transisi status.
* **Katalog Layanan & Tarif:** Pengelolaan harga, daftar jasa IT, serta aktivasi/nonaktivasi layanan.
* **AI Diagnostic & Reply Assistant:** Fitur AI untuk admin dalam menyusun balasan pesan customer secara otomatis.
* **Manajemen User & Pembayaran:** Pengelolaan daftar customer, teknisi, serta verifikasi transaksi pembayaran.
* **Notifikasi WhatsApp:** Notifikasi otomatis ke nomor WhatsApp admin saat ada registrasi customer, booking baru, konfirmasi pembayaran, verifikasi pembayaran, dan perubahan status tiket.

---

## 🛠️ Stack Teknologi

* **Framework:** Next.js 14+ (App Router, TypeScript)
* **Styling:** Tailwind CSS, Lucide Icons
* **Database & ORM:** Prisma ORM dengan SQLite (Development) / PostgreSQL (Production)
* **Autentikasi:** Custom JWT (`jose` + `bcryptjs`) berbasis Cookie `HttpOnly` & Middleware RBAC
* **AI Engine:** Google Gemini AI / `@google/generative-ai`

---

## ⚙️ Panduan Instalasi & Jalankan Proyek

### 1. Install Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` ke `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="ganti-dengan-secret-acak-yang-panjang"
GEMINI_API_KEY="your-gemini-api-key-here"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
TELEGRAM_API_BASE="https://api.telegram.org"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> `GEMINI_API_KEY` opsional untuk development. Jika kosong atau masih placeholder, sistem memakai fallback lokal (FAQ + template balasan) tanpa memanggil Gemini.

### 3. Konfigurasi Notifikasi Telegram
1. Buat bot melalui `@BotFather` di Telegram.
2. Isi token bot ke `TELEGRAM_BOT_TOKEN`.
3. Isi chat ID admin ke `TELEGRAM_CHAT_ID`.
4. Restart server development setelah mengubah `.env`.

Notifikasi dikirim ke Telegram admin untuk event registrasi, booking baru, konfirmasi pembayaran, verifikasi pembayaran, dan perubahan status tiket. Jika token atau chat ID belum diisi, notifikasi dilewati dan alur utama aplikasi tetap berjalan.

Untuk menguji koneksi Telegram, login sebagai Admin lalu kirim request:
```bash
curl -X POST http://localhost:3000/api/telegram/test
```

### 4. Push Database Schema & Seed Data Awal
```bash
npx prisma db push
npm run db:seed
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🔑 Kredensial Default Seed Data

* **Admin Portal (Ahmad):**
  * Email: `ahmad@adcomputer.com`
  * Password: `admin123`

* **Customer Portal:**
  * Email: `customer@gmail.com`
  * Password: `user123`

> Teknisi bukan akun login. Data teknisi merupakan entitas yang dikelola Admin melalui menu **Admin > Teknisi**.

---

## 🔄 Alur Status & Pembayaran

1. Customer membuat tiket -> status `REQUESTED`.
2. Admin mengonfirmasi dan menugaskan teknisi -> `CONFIRMED` / `IN_PROGRESS`.
3. Admin menyelesaikan pengerjaan -> `COMPLETED`.
4. Customer menekan konfirmasi pembayaran -> payment berstatus `PENDING`.
5. Admin memverifikasi pembayaran -> payment `PAID` dan tiket `PAID`.

Status `CANCELLED` hanya dapat dilakukan sebelum tiket berstatus `PAID`. Transisi status divalidasi di server, bukan hanya di UI.

---

## 🧪 Perintah Pengujian & Quality Check

* **Type Check (TypeScript):**
  ```bash
  npm run typecheck
  ```
* **Linting Code:**
  ```bash
  npm run lint
  ```
* **Build Project:**
  ```bash
  npm run build
  ```
