PRODUCT REQUIREMENTS DOCUMENT (PRD)
AD COMPUTER – SERVICE KOMPUTER & IT SERVICES PLATFORM

Versi dokumen: 1.0
Status: Draft berdasarkan implementasi aplikasi saat ini
Tanggal: 07 November 2026
Pemilik produk: AD Computer
Lokasi bisnis: Cirebon

======================================================================

1. RINGKASAN EKSEKUTIF

AD Computer adalah platform web untuk mengelola layanan perbaikan komputer, instalasi sistem operasi dan software, networking, maintenance, serta IT support. Platform menghubungkan customer dengan tim administrasi dan teknisi melalui alur digital mulai dari konsultasi masalah, booking, penanganan tiket, penugasan teknisi, pembaruan status, pembayaran, hingga notifikasi.

Produk memiliki dua pengalaman utama:

1. Portal Customer
   Customer dapat melihat layanan, berkonsultasi dengan AI, membuat service request, memantau status tiket, mengelola profil, dan melakukan konfirmasi pembayaran.

2. Executive Console Admin
   Admin dapat memonitor operasional, mengelola customer, service request, teknisi, katalog layanan, pembayaran, laporan, pengaturan, dan bantuan AI untuk membuat draft balasan customer.

Nilai utama produk:

- Proses booking service lebih terstruktur.
- Harga awal dan estimasi durasi lebih transparan.
- Customer dapat memantau status tiket.
- Admin memiliki satu pusat kendali operasional.
- AI membantu diagnosis awal dan penyusunan balasan.
- Notifikasi Telegram membantu mempercepat respons internal.

======================================================================

2. LATAR BELAKANG DAN MASALAH

2.1 Masalah bisnis

- Permintaan service masuk melalui kanal yang tidak terstruktur.
- Admin kesulitan mengetahui antrean dan status tiap pekerjaan.
- Customer harus bertanya berulang kali mengenai progres service.
- Data customer, teknisi, layanan, dan pembayaran tidak berada dalam satu alur.
- Estimasi biaya sering tidak konsisten sebelum perangkat diperiksa.
- Notifikasi perubahan status dapat terlambat.
- Admin membutuhkan waktu untuk menjawab pertanyaan diagnosis dan membuat balasan customer.

2.2 Masalah customer

- Tidak mengetahui layanan yang sesuai dengan masalah perangkat.
- Tidak memperoleh estimasi biaya awal.
- Tidak memiliki nomor tiket dan status pekerjaan yang jelas.
- Tidak mengetahui kapan harus melakukan pembayaran.
- Tidak mendapatkan informasi yang konsisten mengenai layanan dan kontak bisnis.

2.3 Kesempatan produk

Dengan satu platform terpadu, AD Computer dapat meningkatkan transparansi proses, mengurangi pekerjaan manual admin, mempercepat komunikasi, serta membangun data operasional yang dapat digunakan untuk evaluasi bisnis.

======================================================================

3. TUJUAN PRODUK

3.1 Tujuan utama

- Menyediakan kanal digital untuk konsultasi dan booking service.
- Mengelola seluruh siklus service request dari dibuat hingga dibayar.
- Menyediakan dashboard operasional untuk Admin.
- Mengotomatisasi notifikasi event penting melalui Telegram.
- Memberikan bantuan AI untuk diagnosis awal dan penyusunan balasan.
- Menyediakan katalog layanan dan estimasi tarif yang mudah diperbarui.

3.2 Tujuan customer experience

- Customer dapat memahami layanan sebelum booking.
- Customer dapat membuat tiket kurang dari beberapa menit.
- Customer dapat melihat status tiket tanpa menghubungi admin berulang kali.
- Customer dapat melakukan konsultasi awal secara mandiri.
- Customer mendapat informasi harga sebagai estimasi, bukan janji harga final.

3.3 Tujuan operasional

- Admin dapat melihat antrean dan prioritas tiket.
- Admin dapat menugaskan teknisi.
- Admin dapat mengubah status dengan histori yang tercatat.
- Admin dapat memvalidasi pembayaran.
- Admin dapat mengelola customer, teknisi, layanan, dan konfigurasi.

3.4 Di luar ruang lingkup versi saat ini

- Pembayaran online otomatis melalui payment gateway.
- Upload file ke object storage khusus.
- Akun login khusus teknisi.
- Aplikasi mobile native.
- Integrasi WhatsApp/Fonnte; implementasi saat ini menggunakan Telegram.
- Sistem stok sparepart.
- Penjadwalan kalender teknisi secara otomatis.
- Multi-cabang dan multi-tenant.

======================================================================

4. TARGET PENGGUNA DAN PERSONA

4.1 Customer individu

Profil:
Pemilik laptop atau komputer yang membutuhkan perbaikan, instalasi software, troubleshooting, atau bantuan jaringan.

Kebutuhan:
- Mendapat informasi layanan dan kisaran harga.
- Berkonsultasi sebelum membawa perangkat.
- Booking service dengan mudah.
- Mengetahui progres pekerjaan.
- Mendapat informasi pembayaran dan penyelesaian.

4.2 Customer bisnis atau kantor

Profil:
Perusahaan, startup, kantor, sekolah, atau organisasi yang membutuhkan maintenance berkala, jaringan, dan IT support.

Kebutuhan:
- Layanan yang dapat dijadwalkan.
- Penanganan tiket yang terdokumentasi.
- Teknisi dengan spesialisasi sesuai kebutuhan.
- Riwayat pekerjaan dan biaya.
- Komunikasi yang dapat dilacak.

4.3 Admin atau operator

Profil:
Petugas internal AD Computer yang menerima request, mengatur layanan, berkomunikasi dengan customer, menugaskan teknisi, dan memverifikasi pembayaran.

Kebutuhan:
- Dashboard KPI dan antrean.
- Pencarian dan pagination.
- Kontrol perubahan status.
- Manajemen harga dan layanan.
- Notifikasi event penting.
- Bantuan AI untuk respons customer.

4.4 Teknisi

Pada versi saat ini teknisi merupakan entitas yang dikelola Admin, bukan akun login mandiri.

Data teknisi:
- Nama.
- Email.
- Nomor telepon.
- Spesialisasi.
- Status aktif/nonaktif.
- Tiket yang ditugaskan.

======================================================================

5. RUANG LINGKUP PRODUK

5.1 Modul publik

- Landing page.
- Hero section dan value proposition.
- Katalog layanan aktif.
- Estimasi tarif.
- Estimasi durasi.
- Link konsultasi AI.
- Link booking service.
- Informasi bisnis dan kontak.

5.2 Modul autentikasi

- Registrasi customer.
- Login customer/admin.
- Logout.
- Validasi session.
- JWT dengan cookie HttpOnly.
- Pembatasan akses berdasarkan role.

5.3 Modul customer

- Profil customer.
- Booking service.
- Riwayat service request.
- Detail tiket dan status.
- Konsultasi AI diagnosis.
- Halaman pembayaran per tiket.
- Konfirmasi metode dan pembayaran.

5.4 Modul admin

- Dashboard executive.
- Daftar dan pencarian customer.
- Service request management.
- Penugasan teknisi.
- Katalog layanan dan harga.
- Manajemen teknisi.
- Manajemen pembayaran.
- Laporan bisnis.
- AI assistant untuk draft balasan.
- Pengaturan sistem.
- Profil admin.
- Uji notifikasi Telegram.

5.5 Modul integrasi

- Prisma ORM.
- SQLite development database.
- Google Gemini, dengan fallback lokal jika API key tidak tersedia.
- Telegram Bot API untuk notifikasi.

======================================================================

6. USER JOURNEY UTAMA

6.1 Customer booking service

1. Customer membuka landing page.
2. Customer melihat katalog layanan.
3. Customer login atau registrasi.
4. Customer membuka halaman Booking Service.
5. Customer memilih layanan, bila sudah mengetahui kebutuhannya.
6. Customer mengisi deskripsi masalah.
7. Customer memilih tipe layanan: onsite, drop off, atau remote.
8. Customer mengisi tanggal/waktu pilihan dan lampiran bila diperlukan.
9. Sistem menghitung estimasi biaya dari layanan atau deskripsi masalah.
10. Sistem membuat nomor tiket unik.
11. Sistem mencatat histori awal REQUESTED.
12. Sistem mengirim notifikasi booking kepada Admin melalui Telegram.
13. Customer melihat tiket pada portalnya.

6.2 Customer konsultasi AI

1. Customer login.
2. Customer membuka AI Consultation.
3. Customer memasukkan jenis perangkat dan deskripsi masalah.
4. Sistem membangun konteks bisnis dan konteks akun customer.
5. Sistem menjawab menggunakan Gemini bila tersedia.
6. Jika Gemini tidak tersedia, sistem memakai FAQ/template fallback lokal.
7. Percakapan disimpan ke AIConversation.
8. Customer diarahkan untuk booking jika membutuhkan pemeriksaan teknisi.

6.3 Admin memproses tiket

1. Admin melihat dashboard dan antrean pending.
2. Admin membuka daftar request.
3. Admin mencari tiket atau customer.
4. Admin mengonfirmasi tiket.
5. Admin memilih teknisi.
6. Admin mengubah status menjadi CONFIRMED atau IN_PROGRESS.
7. Sistem mencatat perubahan pada histori.
8. Sistem mengirim notifikasi status.
9. Admin mengisi biaya final dan catatan bila diperlukan.
10. Admin mengubah status menjadi COMPLETED.

6.4 Proses pembayaran

1. Customer membuka halaman pembayaran berdasarkan tiket.
2. Customer memilih metode pembayaran.
3. Customer mengirim konfirmasi pembayaran.
4. Payment berstatus PENDING.
5. Admin melihat daftar pembayaran.
6. Admin memverifikasi pembayaran.
7. Payment menjadi PAID.
8. Tiket menjadi PAID bila aturan alur terpenuhi.
9. Sistem mencatat waktu pembayaran dan mengirim notifikasi.

======================================================================

7. STATUS DAN STATE MACHINE TIKET

Status yang tersedia:

- REQUESTED: tiket baru dibuat customer.
- CONFIRMED: request telah dikonfirmasi Admin.
- IN_PROGRESS: pekerjaan sedang berlangsung.
- WAITING_CUSTOMER: pekerjaan menunggu informasi atau tindakan customer.
- COMPLETED: pekerjaan selesai dan menunggu proses pembayaran/penutupan.
- CANCELLED: tiket dibatalkan sebelum lunas sesuai aturan bisnis.
- PAID: pembayaran telah diverifikasi.

Aturan bisnis:

- Tiket baru selalu dimulai dari REQUESTED.
- Perubahan status harus dilakukan melalui server.
- Setiap perubahan status menyimpan oldStatus, newStatus, user yang mengubah, catatan, dan waktu.
- CANCELLED tidak boleh digunakan setelah tiket berstatus PAID.
- Pembayaran harus memiliki nominal yang valid.
- Tiket dapat ditugaskan ke teknisi aktif.
- Jika status menjadi PAID, sistem memastikan pembayaran PAID tersedia atau membuat/memperbarui pembayaran terkait.

======================================================================

8. KATALOG LAYANAN AWAL

Data seed saat ini mencakup:

1. Service Laptop Overhaul & Thermal Paste
   Kategori: COMPUTER_REPAIR
   Harga dasar: Rp150.000
   Durasi: 1–2 Jam

2. Install Windows 11 Original & Software Suite
   Kategori: SOFTWARE
   Harga dasar: Rp100.000
   Durasi: 1 Jam

3. Setup Network Router & Mikrotik Office
   Kategori: NETWORKING
   Harga dasar: Rp350.000
   Durasi: 3–5 Jam

4. Maintenance Komputer Bulanan Kantor
   Kategori: MAINTENANCE
   Harga dasar: Rp500.000
   Durasi: Kontrak Bulanan

5. On-Site IT Troubleshooting & Support
   Kategori: IT_SUPPORT
   Harga dasar: Rp200.000
   Durasi: 2 Jam

Catatan: Harga katalog adalah harga dasar/estimasi. Harga final dapat berubah setelah pemeriksaan Admin dan pertimbangan sparepart.

======================================================================

9. FITUR FUNGSIONAL DETAIL

9.1 Landing page

Kebutuhan:
- Menampilkan identitas dan positioning AD Computer.
- Menjelaskan layanan utama.
- Menampilkan CTA Konsultasi AI dan Booking Service.
- Menampilkan katalog layanan aktif dari database.
- Menampilkan harga dan durasi.
- Menyediakan tautan ke halaman booking.

Acceptance criteria:
- Hanya layanan aktif yang tampil.
- Harga diformat dalam Rupiah.
- CTA dapat diakses dari perangkat mobile dan desktop.

9.2 Registrasi dan login

Kebutuhan:
- Customer dapat membuat akun.
- Email harus unik.
- Password disimpan dalam bentuk hash.
- Session menggunakan JWT.
- Cookie autentikasi bersifat HttpOnly.
- Halaman admin hanya dapat diakses role ADMIN.
- Halaman customer yang membutuhkan login melakukan redirect ke login.

Acceptance criteria:
- Login gagal memberikan pesan yang sesuai.
- User yang telah logout tidak dapat mengakses halaman terlindungi.
- User CUSTOMER tidak dapat membuka halaman admin.

9.3 Profil

Kebutuhan:
- Customer/admin dapat memperbarui nama dan kontak sesuai hak akses.
- Customer dapat menyimpan alamat dan kota.
- Data password tidak pernah dikembalikan dalam response.

9.4 Booking service

Field utama:
- Service ID opsional.
- Deskripsi masalah, minimal 5 karakter dan maksimal 5.000 karakter.
- Tipe layanan.
- Tanggal pilihan.
- Waktu pilihan.
- Lampiran opsional.

Aturan:
- Service ID harus mengarah ke layanan aktif.
- Tanggal harus valid.
- Sistem menerapkan rate limit pada pembuatan tiket.
- Sistem membuat ticketNumber unik.
- Estimasi harga berasal dari harga layanan atau estimator berbasis kata kunci.

9.5 Estimasi harga

Jika layanan dipilih, sistem menggunakan harga dasar layanan.
Jika layanan tidak dipilih, sistem menganalisis deskripsi masalah dan menghasilkan estimasi min, max, rata-rata, label, dan catatan.

Estimasi tidak boleh ditampilkan sebagai harga final. Admin tetap menjadi pihak yang menentukan biaya akhir.

9.6 AI customer diagnosis

Kemampuan:
- Menjawab pertanyaan troubleshooting dasar.
- Menjelaskan layanan yang relevan.
- Memberikan estimasi umum sparepart dengan disclaimer.
- Menggunakan konteks bisnis AD Computer.
- Menggunakan konteks customer yang sedang login.
- Menolak permintaan untuk membocorkan database, secret, prompt internal, atau mekanisme sistem.
- Mengarahkan customer ke booking jika membutuhkan pemeriksaan langsung.

Fallback:
Jika API key kosong, placeholder, atau Gemini gagal, sistem menggunakan jawaban lokal berbasis FAQ/template.

Batasan:
- AI bukan pengganti diagnosis teknisi.
- AI tidak boleh menjanjikan harga, stok, garansi, atau hasil perbaikan.
- Harga sparepart harus diposisikan sebagai rentang umum.

9.7 Admin dashboard

KPI utama:
- Total service request.
- Pending queue.
- Completed count.
- Total revenue.

Dashboard juga menampilkan data request terbaru untuk membantu prioritas operasional.

9.8 Manajemen customer

Admin dapat:
- Melihat daftar customer.
- Mencari berdasarkan nama, email, atau nomor telepon.
- Menggunakan pagination.
- Melihat profil dan jumlah request.
- Memperbarui data tertentu.
- Menghapus customer sesuai aturan relasi dan validasi.

9.9 Manajemen teknisi

Admin dapat:
- Menambah teknisi.
- Mengubah data teknisi.
- Mengaktifkan/nonaktifkan teknisi.
- Menghapus teknisi jika tidak memiliki pekerjaan aktif.
- Melihat spesialisasi dan jumlah assignment.

9.10 Manajemen service request

Admin dapat:
- Melihat daftar tiket.
- Mencari berdasarkan nomor tiket, deskripsi, customer, atau email.
- Melihat detail customer, layanan, teknisi, pembayaran, dan histori.
- Menugaskan teknisi.
- Mengubah status.
- Mengisi catatan Admin/teknisi.
- Mengatur biaya final.

9.11 Manajemen service catalog

Admin dapat:
- Membuat layanan.
- Mengubah nama, slug, deskripsi, kategori, harga, dan durasi.
- Mengaktifkan/nonaktifkan layanan.
- Menghapus layanan jika tidak melanggar relasi tiket.

9.12 Pembayaran

Payment memiliki status:
- UNPAID
- PENDING
- PARTIAL
- PAID

Admin dapat melihat tiket, customer, metode pembayaran, nominal, status, waktu lunas, dan melakukan verifikasi pembayaran.

9.13 Laporan

Laporan menyediakan ringkasan:
- Jumlah pekerjaan selesai.
- Total pendapatan dari pembayaran PAID.
- Metrik operasional terkait request.

9.14 Notifikasi Telegram

Notifikasi admin dikirim untuk:
- Registrasi customer baru.
- Booking baru.
- Konfirmasi pembayaran.
- Pembayaran diverifikasi.
- Perubahan status tiket.

Notifikasi customer dikirim jika customer memiliki telegramChatId.

Jika konfigurasi Telegram belum lengkap, notifikasi dilewati dan proses utama tetap berjalan.

9.15 Pengaturan sistem

Pengaturan yang dapat dikelola:
- Nama aplikasi.
- URL aplikasi.
- Gemini API key.
- Gemini model.
- Deskripsi setting.

API settings menggunakan whitelist key dan memask API key saat dibaca kembali oleh browser.

======================================================================

10. MODEL DATA

User
- id
- name
- email unik
- password hash
- phone
- telegramChatId
- role
- createdAt
- updatedAt

CustomerProfile
- userId unik
- address
- city
- notes
- timestamps

Technician
- name
- email unik
- phone
- specialization
- isActive
- timestamps

Service
- name
- slug unik
- description
- category
- price
- estimatedDuration
- isActive
- timestamps

ServiceRequest
- ticketNumber unik
- customer
- technician opsional
- service opsional
- problemDescription
- attachment opsional
- serviceType
- preferredDate
- preferredTime
- status
- estimatedCost
- finalCost
- adminNotes
- technicianNotes
- timestamps

ServiceRequestStatusHistory
- serviceRequest
- oldStatus
- newStatus
- changedBy
- note
- createdAt

Payment
- serviceRequest
- amount
- status
- paymentMethod
- paidAt
- createdAt

AIConversation
- user
- prompt
- response
- context
- createdAt

Setting
- key unik
- value
- description
- timestamps

======================================================================

11. KEBUTUHAN NON-FUNGSIONAL

11.1 Keamanan

- Password wajib di-hash.
- JWT secret wajib dikonfigurasi pada production.
- Cookie autentikasi menggunakan HttpOnly.
- API wajib melakukan authorization di sisi server.
- Jangan mengandalkan pembatasan UI sebagai kontrol keamanan.
- Secret tidak boleh dikirim ke client.
- API key Gemini tidak boleh ditulis ke log.
- Input request harus divalidasi.
- Endpoint sensitif harus memiliki rate limiting atau proteksi tambahan.

11.2 Performa

- Query list menggunakan pagination.
- Halaman statis dapat menggunakan revalidation.
- Endpoint dinamis menggunakan no-store/force-dynamic bila diperlukan.
- Gunakan index database untuk foreign key dan status.
- Notifikasi eksternal tidak boleh memblokir proses bisnis utama lebih lama dari timeout yang ditentukan.

11.3 Ketersediaan

- Kegagalan Telegram tidak menggagalkan pembuatan tiket.
- Kegagalan Gemini memiliki fallback lokal.
- Database production direkomendasikan PostgreSQL.
- Perlu backup database dan strategi pemulihan.

11.4 Usability

- Antarmuka responsif.
- Bahasa utama Indonesia.
- Status tiket menggunakan label yang mudah dipahami.
- Format harga menggunakan Rupiah.
- Error message harus dapat dipahami pengguna non-teknis.

11.5 Maintainability

- TypeScript harus melewati typecheck.
- ESLint harus bersih.
- Build production harus berhasil.
- Logic bisnis besar, terutama AI, sebaiknya dipecah menjadi modul lebih kecil.
- Status, role, dan kategori sebaiknya menggunakan konstanta/enum terpusat.

======================================================================

12. ARSITEKTUR TEKNOLOGI

Frontend dan server:
- Next.js 14 App Router.
- React 18.
- TypeScript.
- Tailwind CSS.
- Lucide React.

Backend:
- Next.js Route Handlers.
- Prisma ORM.
- SQLite untuk lokal.
- PostgreSQL yang direkomendasikan untuk production.

Authentication:
- jose untuk JWT.
- bcryptjs untuk password.
- Cookie HttpOnly.
- Middleware untuk proteksi route.

AI:
- @google/generative-ai.
- Gemini model yang dikonfigurasi melalui environment variable.
- Fallback lokal.

Messaging:
- Telegram Bot API.

======================================================================

13. API REQUIREMENTS RINGKAS

Authentication:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

Profile:
- GET /api/profile
- PUT /api/profile

Customer:
- GET /api/customers
- PATCH /api/customers/[id]
- DELETE /api/customers/[id]

Service request:
- GET /api/service-requests
- POST /api/service-requests
- PATCH /api/service-requests/[id]

Services:
- GET /api/services
- POST /api/services
- PUT/PATCH/DELETE /api/services/[id]

Technicians:
- GET /api/technicians
- POST /api/technicians
- PATCH/DELETE /api/technicians/[id]

Payments:
- POST /api/payments
- PATCH /api/payments/[id]

AI:
- POST /api/ai/diagnose
- POST /api/ai/reply

Settings:
- GET /api/settings
- POST /api/settings

Notifications:
- POST /api/telegram/test

======================================================================

14. VALIDASI DAN ACCEPTANCE CRITERIA PRODUK

AC-01 Landing page
- Customer dapat melihat service aktif, harga dasar, dan durasi.
- Tombol booking dan konsultasi dapat digunakan.

AC-02 Registrasi
- Email duplikat ditolak.
- Password di-hash.
- Customer berhasil diarahkan ke pengalaman yang sesuai setelah registrasi/login.

AC-03 Authorization
- CUSTOMER tidak dapat membuka route admin.
- User tanpa session diarahkan ke login untuk route terlindungi.
- API menolak akses tanpa role yang sesuai.

AC-04 Booking
- Deskripsi kurang dari 5 karakter ditolak.
- Service nonaktif tidak dapat dipilih.
- Ticket number unik terbentuk.
- Status awal REQUESTED.
- Histori awal tersimpan.

AC-05 Estimasi
- Layanan terpilih menggunakan harga dasar.
- Tanpa layanan, sistem menggunakan estimator berdasarkan deskripsi.
- Estimasi diberi disclaimer sebagai harga awal.

AC-06 Status tiket
- Perubahan status tervalidasi di server.
- Histori perubahan tersimpan.
- Catatan perubahan dapat ditambahkan.

AC-07 Pembayaran
- Customer hanya dapat mengonfirmasi pembayaran untuk tiketnya.
- Admin dapat memverifikasi pembayaran.
- Payment PAID memiliki paidAt.
- Tiket dapat ditandai PAID sesuai aturan.

AC-08 AI
- AI dapat menjawab pertanyaan layanan/troubleshooting.
- AI tidak membocorkan secret atau data internal.
- Fallback lokal tersedia ketika Gemini tidak aktif.
- Percakapan tersimpan.

AC-09 Notifikasi
- Event utama memanggil Telegram bila konfigurasi tersedia.
- Kegagalan Telegram tidak membatalkan transaksi utama.

AC-10 Quality gate
- npm run typecheck berhasil.
- npm run lint berhasil.
- npm run build berhasil.

======================================================================

15. METRIK KEBERHASILAN

Operasional:
- Waktu rata-rata dari booking ke konfirmasi Admin.
- Persentase tiket yang memiliki teknisi terassign.
- Waktu rata-rata penyelesaian tiket.
- Persentase tiket yang selesai tanpa pembatalan.
- Persentase pembayaran yang diverifikasi tepat waktu.

Customer:
- Jumlah registrasi customer.
- Jumlah booking per periode.
- Conversion rate dari landing page ke booking.
- Jumlah penggunaan AI consultation.
- Persentase customer yang kembali menggunakan layanan.
- Kepuasan customer.

Bisnis:
- Total revenue dari payment PAID.
- Revenue per kategori layanan.
- Jumlah layanan terpopuler.
- Nilai rata-rata transaksi.
- Rasio customer baru dan customer berulang.

Teknis:
- Uptime aplikasi.
- Error rate API.
- Waktu respons endpoint.
- Keberhasilan notifikasi Telegram.
- Persentase fallback AI.

======================================================================

16. RISIKO DAN MITIGASI

Risiko: AI memberikan diagnosis atau harga yang tidak akurat.
Mitigasi: disclaimer, batasan prompt, fallback, dan keputusan final oleh Admin/teknisi.

Risiko: API key atau JWT secret bocor.
Mitigasi: environment secret manager, masking, rotasi key, tidak mengembalikan secret ke client.

Risiko: Status tiket tidak konsisten.
Mitigasi: validasi state transition di server dan status history.

Risiko: Notifikasi Telegram gagal.
Mitigasi: timeout, error handling, retry terukur, dan proses bisnis tidak bergantung pada notifikasi.

Risiko: Database SQLite tidak sesuai untuk beban production.
Mitigasi: gunakan PostgreSQL production dan backup berkala.

Risiko: Admin menggunakan kredensial default.
Mitigasi: wajib ganti password setelah instalasi/seed, nonaktifkan akun demo production.

Risiko: Lampiran disimpan sebagai string tanpa storage pipeline.
Mitigasi: implementasikan object storage, validasi tipe file, batas ukuran, dan antivirus scanning.

Risiko: Data pribadi customer terekspos.
Mitigasi: authorization server-side, minimisasi response, audit log, enkripsi backup, dan kebijakan retensi.

======================================================================

17. KETERBATASAN IMPLEMENTASI SAAT INI

- Teknisi belum memiliki portal atau login mandiri.
- Belum ada payment gateway.
- Belum ada upload storage khusus.
- Notifikasi menggunakan Telegram, bukan WhatsApp.
- SQLite masih digunakan sebagai database development.
- Belum ditemukan automated unit test, integration test, atau end-to-end test.
- Data seed menggunakan password demo yang harus diganti sebelum production.
- Pengaturan Gemini masih perlu ditinjau ulang agar secret idealnya hanya berada di secret manager.
- Laporan masih bersifat ringkasan dan belum menjadi modul analitik mendalam.
- Belum ada audit log terpisah untuk aktivitas admin selain histori status tiket.

======================================================================

18. ROADMAP REKOMENDASI

Fase 1 – Stabilitas dan keamanan
- Pastikan CI menjalankan typecheck, lint, dan build.
- Tambahkan unit test untuk estimator, auth, status transition, dan payment.
- Terapkan secret management production.
- Ganti kredensial seed default.
- Tambahkan audit log admin.
- Pastikan .env dan database lokal tidak masuk repository.

Fase 2 – Operasional
- Tambahkan filter status, tanggal, teknisi, dan prioritas.
- Tambahkan SLA dan reminder tiket.
- Tambahkan template pesan Admin.
- Tambahkan export laporan CSV/PDF.
- Tambahkan dashboard teknisi.

Fase 3 – Customer experience
- Tambahkan upload foto/video kerusakan.
- Tambahkan timeline tiket yang lebih detail.
- Tambahkan rating dan ulasan.
- Tambahkan notifikasi email/push.
- Tambahkan payment gateway.

Fase 4 – Scale dan intelligence
- Migrasi production ke PostgreSQL.
- Tambahkan observability dan monitoring.
- Tambahkan analisis revenue dan performa teknisi.
- Tambahkan rekomendasi layanan berbasis histori.
- Tambahkan multi-cabang atau multi-tenant bila diperlukan.

======================================================================

19. DEFINISI SELESAI PRODUK VERSI PRODUCTION

Produk dapat dianggap siap untuk pilot production jika:

- Semua quality gate lulus.
- Database production menggunakan PostgreSQL atau infrastruktur setara.
- JWT_SECRET production telah diganti dengan secret acak.
- Password demo telah dinonaktifkan atau diganti.
- Secret Gemini tidak terekspos ke client.
- Backup dan restore database telah diuji.
- Authorization seluruh route sudah diuji.
- Test booking, perubahan status, pembayaran, dan notifikasi berhasil.
- Monitoring error dasar tersedia.
- Kebijakan privasi dan ketentuan layanan tersedia.
- Admin mendapat panduan operasional.

======================================================================

20. CATATAN SUMBER DOKUMEN

Dokumen ini disusun berdasarkan struktur dan implementasi aktual pada proyek AD Computer, termasuk halaman Next.js, API route, Prisma schema, seed data, autentikasi, AI, notifikasi Telegram, dan konfigurasi proyek.

Dokumen ini adalah baseline PRD teknis-produk. Sebelum dijadikan dokumen final, pemilik bisnis perlu mengonfirmasi:

- Harga dan katalog resmi.
- SLA operasional.
- Kebijakan pembatalan dan refund.
- Metode pembayaran resmi.
- Kebijakan privasi data.
- Retensi data customer.
- Peran dan kewenangan Admin.
- Apakah teknisi akan memperoleh akun mandiri.
- Apakah Telegram akan tetap digunakan atau diganti dengan kanal lain.
