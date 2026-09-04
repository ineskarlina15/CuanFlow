# 📊 DOKUMENTASI FLOWCHART SISTEM CUANFLOW
**Personal Finance Management System**  
*Program Studi S1 Akuntansi & Sistem Informasi*

---

## 📑 Daftar Isi
1. [Flowchart 1: Alur Autentikasi & Keamanan (Auth Flow)](#1-alur-autentikasi--keamanan-auth-flow)
2. [Flowchart 2: Alur Transaksi Keuangan & Bukti Struk (Transaction CRUD & Upload)](#2-alur-transaksi-keuangan--bukti-struk-transaction-crud--upload)
3. [Flowchart 3: Alur Pengawasan Anggaran & Notifikasi Overbudget](#3-alur-pengawasan-anggaran--notifikasi-overbudget)
4. [Flowchart 4: Alur Target Finansial (Financial Goal & Savings Progress)](#4-alur-target-finansial-financial-goal--savings-progress)
5. [Flowchart 5: Alur Manajemen Pengguna Khusus Admin (RBAC Admin User Management)](#5-alur-manajemen-pengguna-khusus-admin-rbac-admin-user-management)

---

## 1. Alur Autentikasi & Keamanan (Auth Flow)

Diagram alir ini menggambarkan proses pendaftaran akun baru, login dengan validasi JWT token, persistensi session, dan penanganan pemulihan kata sandi (*Forgot Password*).

```mermaid
flowchart TD
    Start([Mulai]) --> Form[Pilih: Login / Register / Lupa Password]
    
    %% Register Flow
    Form -->|Register| InputReg[Input: Nama, Username, Email, No HP, Password, Konfirmasi Password]
    InputReg --> ValReg{Validasi Form Realtime: Format Email, No HP, & Password Match?}
    ValReg -->|Tidak Valid| ErrReg[Tampilkan Pesan Error di Bawah Input Field] --> InputReg
    ValReg -->|Valid| PostReg[POST /authSvc/api/v1/auth/register]
    PostReg --> CheckReg{Email / Username Sudah Terdaftar?}
    CheckReg -->|Ya| ErrRegDup[Status 400: Email/Username sudah digunakan] --> InputReg
    CheckReg -->|Tidak| SuccReg[Status 200: Akun Berhasil Dibuat] --> RedirLogin[Arahkan ke Halaman Login]
    
    %% Login Flow
    Form -->|Login| InputLogin[Input: Username/Email & Password]
    RedirLogin --> InputLogin
    InputLogin --> PostLogin[POST /authSvc/api/v1/auth/login]
    PostLogin --> VerifyPass{Kredensial Cocok & Akun Aktif?}
    VerifyPass -->|Salah| ErrLogin[Status 401: Kredensial Salah / Akun Nonaktif] --> InputLogin
    VerifyPass -->|Benar| GenJWT[Generate JWT Token & User Data]
    GenJWT --> SaveLocal[Simpan JWT Token di LocalStorage]
    SaveLocal --> CheckRole{Cek Hak Akses / Role}
    CheckRole -->|ADMIN| DashAdmin[Arahkan ke Dashboard Admin /admin/users]
    CheckRole -->|USER| DashUser[Arahkan ke Dashboard User /dashboard]
    
    %% Forgot Password Flow
    Form -->|Lupa Password| InputForgot[Input Alamat Email Terdaftar]
    InputForgot --> PostForgot[POST /authSvc/api/v1/auth/forgot-password]
    PostForgot --> CheckMail{Email Ditemukan?}
    CheckMail -->|Tidak| ErrForgot[Status 404: Email tidak terdaftar] --> InputForgot
    CheckMail -->|Ya| GenToken[Generate Reset Token & Kirim Notifikasi/Link]
    GenToken --> InputNewPass[Buka Link: Input Password Baru & Konfirmasi]
    InputNewPass --> PostReset[POST /authSvc/api/v1/auth/reset-password]
    PostReset --> SuccReset[Password Berhasil Diperbarui] --> InputLogin

    DashUser --> Selesai([Selesai])
    DashAdmin --> Selesai
```

---

## 2. Alur Transaksi Keuangan & Bukti Struk (Transaction CRUD & Upload)

Diagram alir proses penambahan, penelaahan rincian (*detail*), filter/sorting simultan, pengunggahan bukti bayar (gambar/PDF), dan penghapusan transaksi (*soft delete*).

```mermaid
flowchart TD
    Start([Mulai]) --> ViewTx[Buka Halaman Transaksi]
    ViewTx --> FetchTx[GET /financeSvc/api/v1/transactions]
    FetchTx --> RenderTable[Tampilkan Tabel Transaksi, Pagination, & Total Data]
    
    %% Filter & Search
    RenderTable --> FilterAction[Terapkan Search Keyword / Kategori / Status Tipe / Tanggal / Sorting]
    FilterAction --> FetchFiltered[GET /financeSvc/api/v1/transactions?keyword=...&type=...&page=0]
    FetchFiltered --> RenderTable
    
    %% Detail Modal
    RenderTable -->|Klik Ikon Mata Detail| ModalDetail[Buka Modal Detail Transaksi: Rincian Lengkap & Tag]
    ModalDetail --> DownloadAttach{Ada Lampiran Struk?}
    DownloadAttach -->|Ya| Preview[Pratinjau / Unduh File Struk Gambar atau PDF]
    DownloadAttach -->|Tidak| CloseDetail[Tutup Modal]
    
    %% Tambah / Edit
    RenderTable -->|Klik Tambah / Edit| FormTx[Isi Formulir: Judul, Tipe, Nominal, Kategori, Tag, Metode, & File]
    FormTx --> ValidateTx{Nominal > 0 & Field Wajib Lengkap?}
    ValidateTx -->|Tidak| ToastWarn[Tampilkan Toast Warning Validasi] --> FormTx
    ValidateTx -->|Ya| HasFile{Melampirkan File Struk?}
    HasFile -->|Ya| UploadFile[Upload File Bukti Struk: Gambar / PDF]
    UploadFile --> SaveTx[POST / PUT /financeSvc/api/v1/transactions]
    HasFile -->|Tidak| SaveTx
    SaveTx --> SuccTx[Toast Success: Transaksi Berhasil Disimpan]
    SuccTx --> RefreshList[Muat Ulang Transaksi & Update Saldo Kas] --> RenderTable
    
    %% Hapus (Soft Delete)
    RenderTable -->|Klik Ikon Hapus| ConfirmDel[Buka Modal Konfirmasi Hapus Transaksi]
    ConfirmDel --> DoDelete{Pengguna Konfirmasi Hapus?}
    DoDelete -->|Batal| RenderTable
    DoDelete -->|Hapus| CallDel[DELETE /financeSvc/api/v1/transactions/id]
    CallDel --> BackendSoft[Backend: UPDATE transactions SET deleted_at = NOW()]
    BackendSoft --> ToastInfo[Toast Info: Transaksi Berhasil Dihapus]
    ToastInfo --> RefreshList

    RenderTable --> Selesai([Selesai])
```

---

## 3. Alur Pengawasan Anggaran & Notifikasi Overbudget

Diagram alir pengawasan pagu belanja bulanan. Menghitung akumulasi pengeluaran riil terhadap pagu dan menerbitkan peringatan (*warning*) bila mendekati/melebihi limit.

```mermaid
flowchart TD
    Start([Mulai]) --> OpenBudget[User Buka Menu Anggaran / Budget]
    OpenBudget --> SetBudget[Buat Anggaran: Pilih Kategori, Pagu Nominal, & Ambang Alert %]
    SetBudget --> SaveBudget[POST /financeSvc/api/v1/budgets]
    SaveBudget --> ActiveBudget[Anggaran Aktif Disimpan di Database]
    
    %% Trigger Transaksi
    UserTrx[User Mencatat Pengeluaran Baru di Kategori Terkait] --> CalcUsed[Sistem Menghitung Total Pengeluaran Bulan Berjalan]
    ActiveBudget --> CalcUsed
    
    CalcUsed --> CalcRatio[Hitung Rasio: Pengeluaran / Pagu Anggaran * 100%]
    CalcRatio --> CheckRatio{Rasio >= Alert Percentage?}
    
    CheckRatio -->|Tidak, Belanja Aman| StatusNormal[Progress Bar Hijau: Status Anggaran Aman]
    
    CheckRatio -->|Ya, >= Ambang Batas| CheckOver{Rasio >= 100%?}
    
    CheckOver -->|Mendekati Batas 80% - 99%| TriggerWarn[Buat Notifikasi Peringatan: Hampir Melampaui Batas]
    CheckOver -->|Melebihi Batas >= 100%| TriggerDanger[Buat Notifikasi Bahaya: Anggaran Overbudget!]
    
    TriggerWarn --> InsertNotif[Simpan Notifikasi ke Tabel notifications]
    TriggerDanger --> InsertNotif
    
    InsertNotif --> ShowAlert[Tampilkan Badge Lonceng & Banner Peringatan di Dashboard]
    StatusNormal --> Selesai([Selesai])
    ShowAlert --> Selesai
```

---

## 4. Alur Target Finansial (Financial Goal & Savings Progress)

Diagram alir perencanaan tabungan target finansial (seperti DP Rumah, Umroh, Pendidikan), pengalokasian dana secara bertahap (*PATCH progress*), hingga status target tercapai (*COMPLETED*).

```mermaid
flowchart TD
    Start([Mulai]) --> OpenGoal[User Membuka Halaman Financial Goals]
    OpenGoal --> InputGoal[Buat Target: Nama Target, Nominal Sasaran, & Batas Waktu]
    InputGoal --> SaveGoal[POST /financeSvc/api/v1/goals]
    SaveGoal --> DisplayCard[Tampilkan Kartu Target Tabungan: Current vs Target]
    
    %% Nabung Bertahap
    DisplayCard -->|Klik Tambah Tabungan| InputDeposit[Input Nominal Tambahan Tabungan]
    InputDeposit --> PatchProgress[PATCH /financeSvc/api/v1/goals/id/progress]
    PatchProgress --> UpdateCurrent[Backend: current_amount = current_amount + nominal]
    UpdateCurrent --> CalcGoalPercent[Hitung Persentase: current_amount / target_amount * 100%]
    
    CalcGoalPercent --> CheckDone{current_amount >= target_amount?}
    CheckDone -->|Belum, Masih Berjalan| StatusActive[Status: ACTIVE, Progress Bar Terupdate]
    CheckDone -->|Tercapai 100%| StatusDone[Status Diubah: COMPLETED]
    
    StatusDone --> GenCongrat[Buat Notifikasi Sistem: Selamat! Target Finansial Tercapai]
    GenCongrat --> DisplayCard
    StatusActive --> DisplayCard

    DisplayCard --> Selesai([Selesai])
```

---

## 5. Alur Manajemen Pengguna Khusus Admin (RBAC Admin User Management)

Diagram alir proteksi halaman admin berbasis *Role-Based Access Control* (RBAC), pengaturan hak akses pengguna, status penonaktifan akun, dan penghapusan data akun pengguna.

```mermaid
flowchart TD
    Start([Mulai]) --> ReqAdmin[User Mengakses Halaman /admin/users]
    ReqAdmin --> CheckAuth{Apakah Sudah Login & Punya Token JWT?}
    CheckAuth -->|Tidak| Redir401[Arahkan ke Halaman 401 Unauthorized / Login]
    CheckAuth -->|Ya| CheckRBAC{Apakah Role Pengguna == 'ADMIN'?}
    CheckRBAC -->|Bukan, Role = USER| Redir403[Arahkan ke Halaman 403 Forbidden: Akses Ditolak]
    
    CheckRBAC -->|Ya, Role = ADMIN| FetchAllUsers[GET /authSvc/api/v1/users]
    FetchAllUsers --> RenderAdminTable[Tampilkan Daftar Seluruh Pengguna Sistem]
    
    %% Aksi Ubah Role
    RenderAdminTable -->|Klik Ubah Peran| ModalRole[Pilih Peran Baru: USER / ADMIN]
    ModalRole --> CallRoleAPI[PUT /authSvc/api/v1/users/id/role]
    CallRoleAPI --> ToastRole[Toast: Peran Pengguna Berhasil Diperbarui] --> FetchAllUsers
    
    %% Aksi Toggle Status Akun
    RenderAdminTable -->|Klik Badge Status Aktif/Nonaktif| CallStatusAPI[PATCH /authSvc/api/v1/users/id/status]
    CallStatusAPI --> UpdateStatus[Backend Mengubah is_active: true <-> false]
    UpdateStatus --> ToastStatus[Toast: Status Akun Pengguna Diperbarui] --> FetchAllUsers
    
    %% Aksi Hapus User
    RenderAdminTable -->|Klik Hapus Pengguna| ModalConfirm[Modal Konfirmasi Hapus Akun]
    ModalConfirm --> CallDeleteUser[DELETE /authSvc/api/v1/users/id]
    CallDeleteUser --> SoftDelUser[Backend: Set deleted_at = NOW & is_active = false]
    SoftDelUser --> ToastDel[Toast: Akun Pengguna Berhasil Dihapus] --> FetchAllUsers

    RenderAdminTable --> Selesai([Selesai])
```

---

## 💡 Panduan Penggunaan untuk Laporan Sidang / Skripsi

1. **Mermaid Rendering**:
   Diagram di atas ditulis dalam format standar **Mermaid**. Diagram ini otomatis ter-render menjadi diagram alir grafis visual yang rapi ketika dibuka di GitHub, GitLab, atau VS Code (dengan ekstensi Markdown Preview Mermaid Support).
2. **Ekspor Gambar**:
   Anda dapat menyalin (*copy*) kode mermaid dari masing-masing flowchart dan menempelkannya ke [Mermaid Live Editor (mermaid.live)](https://mermaid.live) untuk mengunduhnya langsung dalam resolusi tinggi (**PNG** atau **SVG**) untuk disisipkan ke dokumen Microsoft Word laporan skripsi Anda.
