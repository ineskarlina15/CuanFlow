# 💰 CuanFlow — Personal Finance Management System

CuanFlow adalah platform sistem manajemen keuangan pribadi & pembukuan kas pintar berbasis arsitektur **Microservices Fullstack** yang dirancang untuk membantu pengguna mencatat transaksi harian, mengendalikan anggaran bulanan, mengidentifikasi pola pengeluaran melalui grafik analitik, serta mendapatkan peringatan otomatis saat batas anggaran tercapai.

---

## 📌 Fitur Utama

- **Authentication Complete Flow**: Registrasi Akun, Login JWT, Logout, Lupa Password (`/forgot-password`), & Reset Password (`/reset-password`).
- **Dashboard Real-Time**: Ringkasan Pemasukan & Pengeluaran, Grafik Analitik Bar Chart (Income vs Expense), Pie Chart Kategori, & Peringatan Dini Anggaran (Threshold Alert 80%).
- **Manajemen Transaksi (Buku Kas)**: Pencatatan Transaksi Pemasukan/Pengeluaran, Pencarian Keyword, Filter Kategori/Tanggal/Status, Pengurutan (Terbaru, Terlama, A-Z, Z-A), & Pagination.
- **Manajemen Anggaran (Budgets)**: Pengaturan batas batas anggaran bulanan per kategori dengan indikator persentase penggunaan real-time.
- **Kelola Kategori & Tag**: Organisasi transaksi berdasarkan kategori kustom dan tag pendukung.
- **Laporan & Ekspor**: Rekapitulasi laporan keuangan dengan ekspor data.
- **Multi-Mata Uang & Settings**: Konversi tampilan nilai rupiah (IDR), US Dollar (USD), dan Euro (EUR) secara dinamis.
- **Notifikasi Toast Real-Time**: Umpan balik notifikasi sukses, error, warning, dan info untuk setiap proses data.

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Client Side)
- **Framework**: React.js 19 + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Routing**: React Router DOM (Public & Private Protected Routes)
- **HTTP Client**: Fetch API dengan autentikasi Bearer JWT Token

### Backend (Server Side)
- **Framework**: Java 17 + Spring Boot 3
- **Microservices Architecture**:
  - `gateway_service` (Port 8024): API Gateway & Cross-Origin Resource Sharing (CORS)
  - `auth_service` (Port 8021): Autentikasi User, Registrasi, JWT Token, Lupa & Reset Password
  - `finance_service` (Port 8022): Transaksi, Anggaran, Kategori, Tag, & Laporan Keuangan
  - `notification_service` (Port 8023): Manajemen & Riwayat Notifikasi Sistem
- **Keamanan**: Spring Security, BCrypt Password Hashing, JWT Authentication
- **Database**: PostgreSQL (Relational Database dengan Soft Delete & Normatif 3NF)

---

## 📁 Struktur Folder Proyek (Monorepo)

```text
CuanFlow/
├── backend/
│   ├── auth_service/         # Microservice Autentikasi & Pengguna (Port 8021)
│   ├── finance_service/      # Microservice Manajemen Keuangan (Port 8022)
│   ├── gateway_service/      # API Gateway Centralized Routing (Port 8024)
│   └── notification_service/ # Microservice Notifikasi (Port 8023)
├── frontend/
│   ├── public/               # Asset Publik
│   └── src/
│       ├── components/       # Komponen UI Reusable (Navbar, Sidebar, Logo)
│       ├── contexts/         # React Context (AuthContext, ToastContext)
│       ├── pages/            # Halaman Aplikasi (Landing, Login, Dashboard, dll)
│       └── utils/            # Utility Helper (Currency Formatter, API Fetcher)
└── README.md                 # Dokumentasi Resmi Proyek S1
```

---

## 🔑 Akun Demo Pengujian

Anda dapat menggunakan akun demo berikut untuk menguji seluruh fitur sistem:

| Role | Username / Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **USER** | `galang` / `galang@gmail.com` | `password123` | Akses Lengkap Dashboard Keuangan |
| **ADMIN** | `admin` / `admin@cuanflow.id` | `admin123` | Akses Manajemen Sistem |

---

## 🔄 Flowchart & Dokumentasi Sistem

Dokumentasi diagram alir (*flowchart*) sistem lengkap tersedia di berkas [**`flowchart/FLOWCHART_SISTEM.md`**](file:///flowchart/FLOWCHART_SISTEM.md), yang mencakup:
1. **Alur Autentikasi & Keamanan**: Registrasi, Login JWT, Lupa & Reset Password.
2. **Alur Transaksi Keuangan & Bukti Struk**: CRUD, Upload Gambar/PDF, Multi-Filter, Sorting, dan Soft Delete.
3. **Alur Pengawasan Anggaran**: Perhitungan rasio pengeluaran riil dan notifikasi overbudget.
4. **Alur Target Finansial**: Perencanaan tabungan, penambahan saldo bertahap (PATCH progress), hingga status selesai.
5. **Alur Manajemen Pengguna Khusus Admin**: Proteksi RBAC, pergantian peran (*role*), aktivasi status, dan penghapusan akun.

```text
[ User / Web Client (React + Vite) ]
                │
                ▼ (HTTP Requests via Port 8024)
    ┌───────────────────────────┐
    │     gateway_service       │
    └─────────────┬─────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────────────────┐
│  Auth    │ │ Finance  │ │ Notification Service │
│ Service  │ │ Service  │ │    (Port 8023)       │
│(Port 8021)│ (Port 8022)│ └──────────────────────┘
└────┬─────┘ └────┬─────┘
     │            │
     └──────┬─────┘
            ▼
┌───────────────────────────────┐
│     PostgreSQL Database       │
│ (Users, Budgets, Transactions)│
└───────────────────────────────┘
```

---

## 🗄️ Inisialisasi Database & Data Awal (Seed Data)

Untuk memenuhi ketentuan pengujian akademik minimal **20 data per tabel utama**, telah disediakan berkas SQL DML siap pakai [**`seed_data.sql`**](file:///seed_data.sql).

**Cara Menjalankan Seed Data di DBeaver / pgAdmin:**
1. Buka DBeaver atau pgAdmin 4 dan hubungkan ke database `db_cuanflow`.
2. Buka berkas `seed_data.sql`.
3. Jalankan skrip (*Execute Script* / `Alt + X` atau `F5`).
4. Seluruh tabel (`users`, `profiles`, `categories`, `tags`, `transactions`, `budgets`, `financial_goals`, `notifications`, `attachments`) akan otomatis terisi dengan 20+ baris data realistis dan sequence identity akan ter-sinkronisasi otomatis.

---

## 🚀 Cara Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- Java 17 / JDK 17
- Node.js (v18+) & `pnpm` atau `npm`
- PostgreSQL Server terinstal dan berjalan di local

### 2. Menjalankan Backend Microservices
Jalankan Maven Spring Boot di setiap direktori backend atau melalui script otomatis:

```bash
# Gateway Service
cd backend/gateway_service/gateway_service
./mvnw spring-boot:run

# Auth Service
cd backend/auth_service/auth_service
./mvnw spring-boot:run

# Finance Service
cd backend/finance_service/finance_service
./mvnw spring-boot:run

# Notification Service
cd backend/notification_service/notification_service
./mvnw spring-boot:run
```

### 3. Menjalankan Frontend Web Client
```bash
cd frontend
pnpm install
pnpm dev
```
Akses aplikasi melalui browser di **`http://localhost:5173/`**.

---

© 2026 CuanFlow — Proyekan S1 Akuntansi & Sistem Informasi.