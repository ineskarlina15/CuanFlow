<div align="center">

# 💰 CUANFLOW
### *Intelligent Personal Finance & Accounting Management System*
**Platform Sistem Manajemen Keuangan Pribadi & Pembukuan Kas Digital Terintegrasi**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java 17](https://img.shields.io/badge/Java-17%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-0052CC?style=for-the-badge&logo=docker&logoColor=white)](#-arsitektur-sistem)
[![License](https://img.shields.io/badge/License-Academic%20Project-green?style=for-the-badge)](https://github.com/ineskarlina15/CuanFlow)

<br/>

> 🎯 **Projekan Program Studi S1, dari Program Beasiswa PUB**  
> 👩‍💻 **Pengembang Tunggal:** **Ines Karlina**  
> 🏡 **Asal:** Kota Banjar, Jawa Barat, Indonesia  
> 📍 **Domisili / Lokasi:** Kota Bandung, Jawa Barat, Indonesia  
> 🌐 **Repositori GitHub:** [ineskarlina15/CuanFlow](https://github.com/ineskarlina15/CuanFlow)

---

</div>

## 📑 Daftar Isi

- [📖 Tentang CuanFlow](#-tentang-cuanflow)
- [🏛️ Arsitektur Sistem (Microservices)](#️-arsitektur-sistem-microservices)
- [✨ Fitur Unggulan](#-fitur-unggulan)
- [🛠️ Teknologi yang Digunakan](#️-teknologi-yang-digunakan)
- [📁 Struktur Direktori Monorepo](#-struktur-direktori-monorepo)
- [🚀 Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
- [🔑 Kredensial Akun Demo Pengujian](#-kredensial-akun-demo-pengujian)
- [📊 Desain Skema Basis Data](#-desain-skema-basis-data)
- [📡 Dokumentasi API (Postman Collection)](#-dokumentasi-api-postman-collection)
- [📜 Standar Akademik & Hak Cipta](#-standar-akademik--hak-cipta)

---

## 📖 Tentang CuanFlow

**CuanFlow** adalah platform sistem informasi akuntansi dan manajemen keuangan modern berbasis arsitektur **Fullstack Microservices**. Aplikasi ini menjembatani kebutuhan pencatatan keuangan sehari-hari bagi individu dan pelaku UMKM dengan standar akuntansi yang baku, mencakup:

1. **Arus Kas Terkendali**: Pencatatan mutasi kas masuk (*cash inflow*) dan kas keluar (*cash outflow*) secara sistematis dengan bukti bayar digital.
2. **Pengendalian Anggaran 80% (*Budget Control*)**: Membatasi kebocoran dana melalui plafon pengeluaran per kategori yang dilengkapi sistem peringatan dini otomatis ketika pemakaian telah mencapai 80%.
3. **Internal Control & Audit Trail (COSO Framework)**: Merekam seluruh jejak audit pengguna dan transaksi untuk transparansi serta mitigasi risiko fraud.
4. **Pelaporan Finansial Siap Cetak**: Mendukung ekspor laporan rekapitulasi keuangan ke format **PDF resmi** dan **Excel (.xlsx)** dalam 1x klik.
5. **Dukungan Multi-Mata Uang**: Konversi dinamis nilai buku ke Rupiah (**IDR**), US Dollar (**USD**), dan Euro (**EUR**).

---

## 🏛️ Arsitektur Sistem (Microservices)

CuanFlow dibangun menggunakan pola arsitektur **Microservices** terdesentralisasi yang tangguh dan mudah di-*scale*:

```text
                                 ┌───────────────────────────┐
                                 │   Klien Peramban Web      │
                                 │   React 19 + Vite (5173)  │
                                 └─────────────┬─────────────┘
                                               │
                                               ▼ (HTTP REST API / JSON)
                                 ┌───────────────────────────┐
                                 │    API Gateway Service    │
                                 │   Spring Cloud (Port 8024)│
                                 └─────────────┬─────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               │                               │                               │
               ▼                               ▼                               ▼
  ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
  │      Auth Service       │     │     Finance Service     │     │  Notification Service   │
  │       (Port 8021)       │     │       (Port 8022)       │     │       (Port 8023)       │
  ├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤
  │ • Autentikasi JWT       │     │ • Buku Kas Transaksi    │     │ • Peringatan Anggaran   │
  │ • Registrasi & Profil   │     │ • Batas Anggaran 80%    │     │ • Notifikasi Realtime   │
  │ • Lupa & Reset Password │     │ • Tujuan Keuangan       │     │ • Siaran Admin          │
  │ • Jejak Audit (COSO)    │     │ • Kategori & Tag        │     │ • Riwayat Pesan         │
  │ • Manajemen User (Admin)│     │ • Ekspor PDF & Excel    │     │                         │
  └────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
               │                               │                               │
               └───────────────────────────────┼───────────────────────────────┘
                                               ▼
                                 ┌───────────────────────────┐
                                 │    PostgreSQL Database    │
                                 │       (Port 5432)         │
                                 │ 12 Tabel, Relasi 3NF,     │
                                 │ Soft Delete & Indexing    │
                                 └───────────────────────────┘
```

---

## ✨ Fitur Unggulan

<div align="center">

| Modul | Ikon | Deskripsi Fungsionalitas |
| :--- | :---: | :--- |
| **Autentikasi Lengkap** | 🔐 | Login JWT, Register, Logout, Lupa Password, Reset Password, & Proteksi Rute Klien (RBAC). |
| **Dashboard Real-Time** | 📈 | Card summary saldo kas, grafik tren batang bulanan, diagram alokasi pai, dan mutasi terkini. |
| **Pencatatan Buku Kas** | 💳 | Transaksi masuk/keluar, upload nota/struk (Gambar & PDF), multi-filter, multi-sort, & pagination. |
| **Pagu Anggaran 80%** | 🎯 | Plafon pengeluaran bulanan per kategori dengan indikator progres visual & notifikasi peringatan 80%. |
| **Target Tabungan (Goals)** | 🏆 | Perencanaan tabungan impian, kalkulasi akumulasi dana, progres bar, dan status otomatis. |
| **Kategori & Label (Tags)** | 🏷️ | Master kategori kustom (Income/Expense) dan sistem tag transaksi fleksibel Many-to-Many. |
| **Ekspor Laporan Keuangan**| 📄 | Unduh laporan kas bulanan resmi langsung ke dalam format **PDF** dan **Excel (.xlsx)**. |
| **Multi-Mata Uang** | 🌍 | Konversi dinamis nilai nominal otomatis ke mata uang Rupiah (**IDR**), Dollar (**USD**), dan Euro (**EUR**). |
| **Audit Trail (SIA)** | 🛡️ | Rekam jejak audit keamanan berstandar COSO (*user action, IP, user-agent, severity*). |
| **Broadcast Massal** | 📢 | Fasilitas bagi administrator untuk mengirim pesan pengumuman ke seluruh pengguna. |

</div>

---

## 🛠️ Teknologi yang Digunakan

### 🌐 Sisi Klien (Frontend)
- **Core Library**: [React.js 19](https://react.dev/) (Functional Components & Hooks Modern)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/) (Hot Module Replacement super cepat)
- **Styling & Desain**: [Tailwind CSS 4](https://tailwindcss.com/) (Responsive, Mobile-First Design)
- **Navigasi Rute**: [React Router DOM 7](https://reactrouter.com/) (Public, Private & Admin Routes)
- **Ikon Antarmuka**: [Lucide React](https://lucide.dev/) (Koleksi ikon SVG vektor modern)
- **Format Mata Uang**: Intl NumberFormat & Custom Currency Utility Helper

### ⚙️ Sisi Server (Backend Microservices)
- **Platform**: Java 17 LTS + [Spring Boot 3.3.x](https://spring.io/)
- **API Gateway**: Spring Cloud Gateway (Port 8024) dengan sentralisasi CORS
- **Keamanan & Otorisasi**: Spring Security 6 + JSON Web Token (JWT) + BCrypt Hashing
- **Object Relational Mapping**: Spring Data JPA / Hibernate 6 (Soft Delete via `@SQLDelete`)
- **Validasi Data**: Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Email`)
- **Ekspor Dokumen**: Apache POI (Excel `.xlsx`) & OpenPDF / iText (Dokumen `.pdf`)

### 🗄️ Basis Data (Database)
- **RDBMS**: [PostgreSQL](https://www.postgresql.org/) (Version 14 / 15 / 16)
- **Struktur**: 12 Tabel Normalisasi 3NF, Foreign Key Cascading, Indexing, dan Soft Delete (`deleted_at`)

---

## 📁 Struktur Direktori Monorepo

```text
CuanFlow/
├── backend/                                  # Layanan Backend Microservices (Spring Boot)
│   ├── api_gateway/                          # API Gateway Routing & CORS (Port 8024)
│   │   ├── src/main/java/com/example/api_gateway/
│   │   └── pom.xml
│   ├── auth_service/                         # Autentikasi, Profil & Audit Log (Port 8021)
│   │   ├── src/main/java/com/example/auth_service/
│   │   │   ├── config/                       # SecurityConfig & JwtAuthenticationFilter
│   │   │   ├── controller/                   # Auth, User, Profile, AuditLog Controller
│   │   │   ├── entity/                       # User, Profile, AuditLog
│   │   │   ├── repository/                   # JPA Repositories
│   │   │   └── service/                      # Business Logic Implementations
│   │   └── pom.xml
│   ├── finance_service/                      # Transaksi, Anggaran, Goal & Laporan (Port 8022)
│   │   ├── src/main/java/com/example/finance_service/
│   │   │   ├── controller/                   # Transaction, Budget, Goal, Category, Report
│   │   │   ├── entity/                       # Transaction, Budget, FinancialGoal, Category, Tag
│   │   │   ├── service/                      # Logic Keuangan & Report Exporter (PDF/Excel)
│   │   │   └── utility/                      # FileUploadHelper & GlobalExceptionHandler
│   │   └── pom.xml
│   └── notification_service/                 # Notifikasi & Broadcast Admin (Port 8023)
│       ├── src/main/java/com/example/notification_service/
│       │   ├── controller/                   # Notification & Broadcast Controller
│       │   └── entity/                       # Notification & SystemBroadcast
│       └── pom.xml
├── database/                                 # Skrip Database Relasional PostgreSQL
│   ├── ddl.sql                               # Data Definition Language (12 Tabel, Enum, PK/FK)
│   └── seed_data.sql                         # Data Awal Pengujian (20+ Data Riil per Tabel Utama)
├── flowchart/                                # Dokumentasi Diagram Alir Sistem
│   └── FLOWCHART_SISTEM.md                   # Spesifikasi Alur Bisnis, Autentikasi & Akuntansi
├── frontend/                                 # Klien Web SPA (React 19 + Vite)
│   ├── public/                               # Aset Statis & Favicon
│   ├── src/
│   │   ├── components/                       # Navbar, Sidebar, Modal Dialog, Toast Container
│   │   ├── contexts/                         # AuthContext (Sesi JWT) & ToastContext
│   │   ├── pages/                            # Seluruh Halaman Aplikasi (Landing, Dashboard, dll)
│   │   ├── services/                         # Axios / Fetch API Wrapper
│   │   ├── utils/                            # Helper Pemformat Mata Uang & Tanggal
│   │   ├── App.jsx                           # Manajemen Rute Klien & Pelindung Hak Akses
│   │   └── index.css                         # Setup Desain Tailwind CSS
│   ├── package.json                          # Manifest Dependensi Node.js
│   └── vite.config.js                        # Konfigurasi Build Vite
├── CuanFlow_Postman_Collection.json          # Dokumentasi Pengujian Endpoint API Lengkap
└── README.md                                 # Berkas Dokumentasi Resmi Proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Perangkat Lunak
- **Java**: OpenJDK 17 LTS atau lebih baru (`java -version`)
- **Node.js**: Versi 18+ dan NPM / PNPM (`node -v` & `npm -v`)
- **PostgreSQL**: Server aktif berjalan pada port default `5432`

---

### 2. Konfigurasi Basis Data PostgreSQL

1. Buka DBeaver, pgAdmin 4, atau terminal SQL, lalu buat database:
   ```sql
   CREATE DATABASE db_cuanflow;
   ```
2. Jalankan skrip DDL untuk membangun skema tabel:
   * Buka file [**`database/ddl.sql`**](file:///database/ddl.sql) ➡️ **Execute All Script** (`Alt + X` atau `F5`).
3. Jalankan skrip Seed Data untuk memasukkan 20+ data uji coba awal:
   * Buka file [**`database/seed_data.sql`**](file:///database/seed_data.sql) ➡️ **Execute All Script**.

---

### 3. Menjalankan Layanan Backend Microservices

Buka 4 terminal terpisah di root direktori project, lalu jalankan masing-masing microservice:

```bash
# Terminal 1: API Gateway (Port 8024)
cd backend/gateway_service/gateway_service
./mvnw spring-boot:run

# Terminal 2: Auth Service (Port 8021)
cd backend/auth_service/auth_service
./mvnw spring-boot:run

# Terminal 3: Finance Service (Port 8022)
cd backend/finance_service/finance_service
./mvnw spring-boot:run

# Terminal 4: Notification Service (Port 8023)
cd backend/notification_service/notification_service
./mvnw spring-boot:run
```
> *(Untuk sistem operasi Windows PowerShell, gunakan `.\mvnw.cmd spring-boot:run`)*

---

### 4. Menjalankan Frontend Web Client

Buka terminal baru untuk menjalankan antarmuka pengguna:

```bash
# Masuk ke folder frontend
cd frontend

# Pasang paket dependensi (hanya pertama kali)
npm install

# Jalankan server pengembangan Vite
npm run dev
```

Buka peramban (*browser*) dan buka alamat:
👉 **`http://localhost:5173/`**

---

## 🔑 Kredensial Akun Demo Pengujian

Aplikasi telah terisi dengan data awal yang siap diuji menggunakan akun-akun demo berikut:

| Peran (*Role*) | Username | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **USER (Utama)** | `galang` | `galang@gmail.com` | `password123` | Akses penuh dashboard keuangan, mutasi kas, anggaran 80%, goals, dan ekspor laporan PDF/Excel. |
| **USER (Alternatif)** | `ines` | `ines@gmail.com` | `password123` | Akun pembukuan bisnis pribadi dengan data terisolasi. |
| **ADMIN** | `admin` | `admin@cuanflow.id` | `admin123` | Akses panel kontrol admin, manajemen user, log audit COSO, dan pengiriman siaran massal. |

---

## 📊 Desain Skema Basis Data

Basis data dirancang memenuhi kaidah normalisasi **Bentuk Normal Ketiga (3NF)** dengan integritas referensial penuh:

| No | Nama Tabel | Deskripsi Data | Relasi Utama | Soft Delete |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `users` | Akun pengguna & kredensial terenkripsi | Relasi ke `profiles`, `transactions`, `budgets` | ✅ |
| 2 | `profiles` | Biodata pengguna, kontak, pekerjaan, & foto | One-to-One dengan `users` | - |
| 3 | `categories` | Master kategori transaksi (Income/Expense) | One-to-Many ke `transactions` & `budgets` | ✅ |
| 4 | `tags` | Label kustom transaksi | Many-to-Many via `transaction_tags` | - |
| 5 | `transactions` | Buku kas pencatatan mutasi keuangan | Many-to-One ke `users` & `categories` | ✅ |
| 6 | `transaction_tags`| Tabel penghubung (*junction table*) | Many-to-Many antara Transaksi dan Tag | - |
| 7 | `budgets` | Plafon pagu anggaran bulanan & ambang 80% | Many-to-One ke `users` & `categories` | - |
| 8 | `financial_goals`| Sasaran target tabungan finansial | Many-to-One ke `users` | - |
| 9 | `notifications` | Notifikasi riwayat peringatan & pengingat | Many-to-One ke `users` | - |
| 10 | `attachments` | File bukti transaksi (JPG, PNG, PDF) | One-to-Many dengan `transactions` | - |
| 11 | `audit_logs` | Jejak audit keamanan sistem (COSO) | Many-to-One ke `users` (Nullable) | - |
| 12 | `system_broadcasts` | Siaran pengumuman massal administrator | Many-to-One ke `users` (Sender) | - |

---

## 📡 Dokumentasi API (Postman Collection)

Repositori ini menyertakan berkas dokumentasi pengujian endpoint API berstandar OpenAPI/Postman yang siap diimpor:
📄 [**`CuanFlow_Postman_Collection.json`**](file:///CuanFlow_Postman_Collection.json)

**Cara Menggunakan:**
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di sudut kiri atas.
3. Seret dan lepas berkas `CuanFlow_Postman_Collection.json`.
4. Seluruh koleksi endpoint (Autentikasi, Transaksi, Anggaran, Tujuan Keuangan, Kategori, Notifikasi, Audit Log, dan Ekspor) siap diuji langsung.

---

## 📜 Standar Akademik & Hak Cipta

Proyek ini dirancang dan dikembangkan sebagai pemenuhan syarat akademis kelulusan **Program Studi S1 Akuntansi**.

- **Judul Proyek**: *CuanFlow — Personal Finance & Accounting Management System*
- **Tahun**: 2026
- **Pengembang**: **Ines Karlina**
- **Asal**: Kota Banjar, Jawa Barat, Indonesia
- **Lokasi Pengembangan**: Kota Bandung, Jawa Barat, Indonesia
- **Hak Cipta**: Seluruh hak cipta dilindungi undang-undang. Diperuntukkan untuk tujuan evaluasi akademis dan portofolio profesional.

<div align="center">
  <sub>Dibuat dengan ❤️ dan dedikasi oleh Ines Karlina • CuanFlow © 2026</sub>
</div>