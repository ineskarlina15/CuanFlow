-- =========================================================
-- CUANFLOW — SEED DATA SCRIPT (DML)
-- Personal Finance Management System
-- Sesuai Ketentuan Tugas S1 Akuntansi & Sistem Informasi:
-- "Minimal 20 data awal (seed) untuk setiap tabel utama"
-- PostgreSQL
-- =========================================================

-- =========================================================
-- 0. BERSIHKAN DATA LAMA & RESET SEQUENCE IDENTITY
-- Mencegah error duplicate key / bentrok email dan ID
-- =========================================================
DO $$
BEGIN
    TRUNCATE TABLE 
        transaction_tags, 
        attachments, 
        transactions, 
        budgets, 
        financial_goals, 
        notifications, 
        tags, 
        categories, 
        profiles, 
        users 
    RESTART IDENTITY CASCADE;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        EXECUTE 'TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_broadcasts') THEN
        EXECUTE 'TRUNCATE TABLE system_broadcasts RESTART IDENTITY CASCADE';
    END IF;
END $$;

-- =========================================================
-- Pastikan kolom reset_password_token tersedia pada tabel users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'reset_password_token'
    ) THEN
        ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'reset_password_token_expiry'
    ) THEN
        ALTER TABLE users ADD COLUMN reset_password_token_expiry TIMESTAMP;
    END IF;
END $$;

-- =========================================================
-- 1. SEED USERS (20 Pengguna)
-- Password untuk semua user non-admin: 'password123'
-- Hash BCrypt: $2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u
-- Password admin: 'admin123'
-- =========================================================
INSERT INTO users (id, name, username, email, password, role, phone, is_active, created_at, updated_at) VALUES
(1, 'System Administrator', 'admin', 'admin@cuanflow.id', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'ADMIN', '081234567890', true, '2024-01-01 08:00:00', NOW()),
(2, 'Galang Pratama', 'galang', 'galang@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567891', true, '2024-01-10 09:00:00', NOW()),
(3, 'Ines Karlina', 'ines', 'ines@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567892', true, '2024-01-15 10:30:00', NOW()),
(4, 'Budi Santoso', 'budi_santoso', 'budi@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567893', true, '2024-02-01 11:15:00', NOW()),
(5, 'Ahmad Fauzi', 'ahmad_fauzi', 'ahmad@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567894', true, '2024-02-05 13:45:00', NOW()),
(6, 'Siti Rahmawati', 'siti_rahma', 'siti@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567895', true, '2024-02-12 14:20:00', NOW()),
(7, 'Rian Hidayat', 'rian_h', 'rian@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567896', true, '2024-02-20 15:10:00', NOW()),
(8, 'Dewi Lestari', 'dewi_lestari', 'dewi@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567897', true, '2024-03-01 08:30:00', NOW()),
(9, 'Eko Prasetyo', 'eko_p', 'eko@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567898', true, '2024-03-05 09:40:00', NOW()),
(10, 'Fajar Nugraha', 'fajar_n', 'fajar@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567899', true, '2024-03-10 10:15:00', NOW()),
(11, 'Gita Gutawa', 'gita_g', 'gita@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567801', true, '2024-03-15 11:20:00', NOW()),
(12, 'Hendra Wijaya', 'hendra_w', 'hendra@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567802', true, '2024-03-20 13:00:00', NOW()),
(13, 'Indah Permata', 'indah_p', 'indah@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567803', true, '2024-03-25 14:10:00', NOW()),
(14, 'Joko Widodo', 'joko_w', 'joko@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567804', true, '2024-04-01 15:30:00', NOW()),
(15, 'Kartika Sari', 'kartika_s', 'kartika@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567805', true, '2024-04-05 16:45:00', NOW()),
(16, 'Lukman Hakim', 'lukman_h', 'lukman@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567806', true, '2024-04-10 09:15:00', NOW()),
(17, 'Maya Anggraini', 'maya_a', 'maya@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567807', true, '2024-04-15 10:20:00', NOW()),
(18, 'Naufal Rizky', 'naufal_r', 'naufal@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567808', true, '2024-04-20 11:30:00', NOW()),
(19, 'Olivia Tan', 'olivia_t', 'olivia@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567809', true, '2024-04-25 14:00:00', NOW()),
(20, 'Putra Mandiri', 'putra_m', 'putra@gmail.com', '$2a$10$wN3Mh9fAEvs5qFf9pZgHau2W4Y9H.g.p0DkqfB6I5uOqWpI0qJt6u', 'USER', '081234567810', true, '2024-05-01 16:00:00', NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 2. SEED PROFILES (20 Profil Pengguna)
-- Relasi One-to-One dengan tabel users
-- =========================================================
INSERT INTO profiles (id, user_id, avatar_url, date_of_birth, gender, address, occupation, created_at, updated_at) VALUES
(1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', '1990-01-01', 'Laki-laki', 'Jakarta Pusat, DKI Jakarta', 'System Administrator', NOW(), NOW()),
(2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', '1998-05-15', 'Laki-laki', 'Surabaya, Jawa Timur', 'Software Engineer', NOW(), NOW()),
(3, 3, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', '1999-08-20', 'Perempuan', 'Bandung, Jawa Barat', 'Akuntan Publik', NOW(), NOW()),
(4, 4, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', '1995-03-12', 'Laki-laki', 'Semarang, Jawa Tengah', 'Konsultan Keuangan', NOW(), NOW()),
(5, 5, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce', '1996-07-22', 'Laki-laki', 'Medan, Sumatera Utara', 'Staff Keuangan', NOW(), NOW()),
(6, 6, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', '1997-11-05', 'Perempuan', 'Yogyakarta, D.I. Yogyakarta', 'Data Analyst', NOW(), NOW()),
(7, 7, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', '1994-09-18', 'Laki-laki', 'Makassar, Sulawesi Selatan', 'Wirausaha', NOW(), NOW()),
(8, 8, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', '1996-02-14', 'Perempuan', 'Malang, Jawa Timur', 'Guru / Pendidik', NOW(), NOW()),
(9, 9, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', '1993-06-30', 'Laki-laki', 'Palembang, Sumatera Selatan', 'Manajer Operasional', NOW(), NOW()),
(10, 10, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', '1995-12-25', 'Laki-laki', 'Denpasar, Bali', 'Content Creator', NOW(), NOW()),
(11, 11, 'https://images.unsplash.com/photo-1517841905240-472988babdf9', '1998-04-10', 'Perempuan', 'Solo, Jawa Tengah', 'Marketing Specialist', NOW(), NOW()),
(12, 12, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61', '1992-10-08', 'Laki-laki', 'Bogor, Jawa Barat', 'Pegawai BUMN', NOW(), NOW()),
(13, 13, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04', '1997-01-19', 'Perempuan', 'Tangerang, Banten', 'Desainer UI/UX', NOW(), NOW()),
(14, 14, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea', '1991-03-24', 'Laki-laki', 'Bekasi, Jawa Barat', 'Manajer Proyek', NOW(), NOW()),
(15, 15, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', '1999-09-09', 'Perempuan', 'Depok, Jawa Barat', 'Admin Logistik', NOW(), NOW()),
(16, 16, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91', '1994-05-04', 'Laki-laki', 'Batam, Kepulauan Riau', 'Teknisi Jaringan', NOW(), NOW()),
(17, 17, 'https://images.unsplash.com/photo-1548142813-c348350df52b', '1998-12-01', 'Perempuan', 'Padang, Sumatera Barat', 'Apoteker', NOW(), NOW()),
(18, 18, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6', '1996-08-16', 'Laki-laki', 'Pekanbaru, Riau', 'Pengembang Web', NOW(), NOW()),
(19, 19, 'https://images.unsplash.com/photo-1517849845537-4d257902454a', '1997-04-18', 'Perempuan', 'Pontianak, Kalimantan Barat', 'Arsitek', NOW(), NOW()),
(20, 20, 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6', '1995-07-29', 'Laki-laki', 'Samarinda, Kalimantan Timur', 'Konsultan IT', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 3. SEED CATEGORIES (20 Kategori)
-- Kombinasi Pemasukan (INCOME) dan Pengeluaran (EXPENSE)
-- =========================================================
-- Pastikan kolom user_id tersedia pada tabel categories jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE categories ADD COLUMN user_id INT4 DEFAULT 2;
    END IF;
END $$;

INSERT INTO categories (id, user_id, name, type, description, icon, created_at, updated_at) VALUES
(1, 2, 'Gaji Pokok', 'INCOME', 'Penghasilan rutin bulanan dari pekerjaan utama', 'wallet', NOW(), NOW()),
(2, 2, 'Bonus & Tunjangan', 'INCOME', 'Bonus kinerja, THR, dan tunjangan kerja', 'gift', NOW(), NOW()),
(3, 2, 'Freelance & Proyek', 'INCOME', 'Pendapatan sampingan dari proyek lepas', 'laptop', NOW(), NOW()),
(4, 2, 'Investasi & Dividen', 'INCOME', 'Hasil dividen saham, reksadana, dan bunga deposito', 'trending-up', NOW(), NOW()),
(5, 2, 'Penjualan Produk', 'INCOME', 'Pendapatan dari bisnis e-commerce atau toko', 'shopping-bag', NOW(), NOW()),
(6, 2, 'Makanan & Minuman', 'EXPENSE', 'Makan harian, kafe, restoran, dan pesan antar', 'utensils', NOW(), NOW()),
(7, 2, 'Transportasi', 'EXPENSE', 'Bahan bakar bensin, ojek online, tiket KRL, tol', 'car', NOW(), NOW()),
(8, 2, 'Belanja Kebutuhan Pokok', 'EXPENSE', 'Belanja bulanan sembako, sabun, dan kebutuhan rumah tangga', 'shopping-cart', NOW(), NOW()),
(9, 2, 'Tagihan Listrik & Air', 'EXPENSE', 'Pembayaran token PLN, PDAM, dan iuran lingkungan', 'zap', NOW(), NOW()),
(10, 2, 'Internet & Pulsa', 'EXPENSE', 'Paket data seluler dan langganan WiFi rumah', 'wifi', NOW(), NOW()),
(11, 2, 'Sewa & Cicilan Rumah', 'EXPENSE', 'Pembayaran kontrakan, kos, atau KPR', 'home', NOW(), NOW()),
(12, 2, 'Kesehatan & Obat', 'EXPENSE', 'Biaya dokter, pembelian vitamin, obat, dan BPJS', 'heart-pulse', NOW(), NOW()),
(13, 2, 'Hiburan & Liburan', 'EXPENSE', 'Nonton bioskop, tiket wisata, hobi, dan jalan-jalan', 'film', NOW(), NOW()),
(14, 2, 'Pendidikan & Kursus', 'EXPENSE', 'Biaya kuliah, buku pelajaran, dan sertifikasi keahlian', 'book-open', NOW(), NOW()),
(15, 2, 'Pakaian & Fashion', 'EXPENSE', 'Pembelian baju, sepatu, dan aksesoris', 'shirt', NOW(), NOW()),
(16, 2, 'Olahraga & Gym', 'EXPENSE', 'Member tempat gym, sewa lapangan futsal/badminton', 'activity', NOW(), NOW()),
(17, 2, 'Donasi & Sedekah', 'EXPENSE', 'Zakat, infak, sedekah, dan bantuan sosial', 'heart', NOW(), NOW()),
(18, 2, 'Perawatan Pribadi', 'EXPENSE', 'Skincare, barbershop, salon, dan grooming', 'smile', NOW(), NOW()),
(19, 2, 'Hadiah & Traktir', 'EXPENSE', 'Kado ulang tahun, traktiran teman, dan bingkisan', 'package', NOW(), NOW()),
(20, 2, 'Lain-lain / Tak Terduga', 'EXPENSE', 'Pengeluaran darurat yang tidak terencana sebelumnya', 'alert-circle', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 4. SEED TAGS (20 Label/Tag Transaksi)
-- =========================================================
INSERT INTO tags (id, name, user_id) VALUES
(1, 'primer', 2),
(2, 'sekunder', 2),
(3, 'darurat', 2),
(4, 'kantor', 2),
(5, 'keluarga', 2),
(6, 'liburan', 2),
(7, 'investasi', 2),
(8, 'hobi', 2),
(9, 'rutin-bulanan', 2),
(10, 'online-food', 2),
(11, 'cashback', 2),
(12, 'promo-diskon', 2),
(13, 'kesehatan', 2),
(14, 'kendaraan', 2),
(15, 'kuliah', 2),
(16, 'sedekah', 2),
(17, 'weekend', 2),
(18, 'self-reward', 2),
(19, 'elektronik', 2),
(20, 'tabungan', 2)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 5. SEED TRANSACTIONS (25 Data Transaksi)
-- Didominasi untuk Galang (user_id = 2) untuk demo lengkap
-- Melibatkan berbagai kategori, tanggal, tipe, dan metode bayar
-- =========================================================
INSERT INTO transactions (id, user_id, category_id, type, amount, title, description, transaction_date, payment_method, created_at, updated_at) VALUES
(1, 2, 1, 'INCOME', 8500000.00, 'Gaji Pokok Agustus 2024', 'Transfer gaji bulanan dari PT Tech Nusantara', '2024-08-01', 'BANK_TRANSFER', NOW(), NOW()),
(2, 2, 6, 'EXPENSE', 45000.00, 'Makan Siang Nasi Padang', 'Makan siang bareng tim kantor', '2024-08-01', 'E_WALLET', NOW(), NOW()),
(3, 2, 7, 'EXPENSE', 35000.00, 'Bensin Motor Shell V-Power', 'Isi bensin full tank', '2024-08-02', 'CASH', NOW(), NOW()),
(4, 2, 10, 'EXPENSE', 350000.00, 'Tagihan WiFi Indihome', 'Pembayaran internet rumah bulan Agustus', '2024-08-03', 'BANK_TRANSFER', NOW(), NOW()),
(5, 2, 8, 'EXPENSE', 420000.00, 'Belanja Bulanan Superindo', 'Beli beras, minyak, sabun, dan telur', '2024-08-04', 'DEBIT_CARD', NOW(), NOW()),
(6, 2, 3, 'INCOME', 2500000.00, 'Honor Jasa Desain Web', 'Pelunasan proyek landing page klien', '2024-08-05', 'BANK_TRANSFER', NOW(), NOW()),
(7, 2, 9, 'EXPENSE', 280000.00, 'Token Listrik PLN', 'Beli token listrik 250 ribu', '2024-08-06', 'E_WALLET', NOW(), NOW()),
(8, 2, 6, 'EXPENSE', 78000.00, 'Kopi & Snack Janji Jiwa', 'Nongkrong santai sore', '2024-08-07', 'E_WALLET', NOW(), NOW()),
(9, 2, 12, 'EXPENSE', 125000.00, 'Beli Vitamin C & Suplemen', 'Beli di apotek K-24', '2024-08-08', 'CASH', NOW(), NOW()),
(10, 2, 7, 'EXPENSE', 50000.00, 'Top Up Saldo E-Toll', 'Isi saldo kartu Flazz untuk tol kota', '2024-08-09', 'BANK_TRANSFER', NOW(), NOW()),
(11, 2, 13, 'EXPENSE', 110000.00, 'Nonton Bioskop XXI', 'Nonton film bareng teman di weekend', '2024-08-10', 'E_WALLET', NOW(), NOW()),
(12, 2, 4, 'INCOME', 450000.00, 'Dividen Saham BBCA', 'Pembagian dividen interim pasar modal', '2024-08-11', 'BANK_TRANSFER', NOW(), NOW()),
(13, 2, 6, 'EXPENSE', 55000.00, 'Makan Malam Ayam Geprek', 'Pesan via aplikasi online', '2024-08-12', 'E_WALLET', NOW(), NOW()),
(14, 2, 17, 'EXPENSE', 100000.00, 'Donasi Peduli Bencana', 'Donasi melalui platform Kitabisa', '2024-08-13', 'BANK_TRANSFER', NOW(), NOW()),
(15, 2, 16, 'EXPENSE', 150000.00, 'Sewa Lapangan Futsal', 'Iuran futsal mingguan komunitas', '2024-08-14', 'CASH', NOW(), NOW()),
(16, 2, 18, 'EXPENSE', 70000.00, 'Potong Rambut Barbershop', 'Grooming berkala di Captain Barbershop', '2024-08-15', 'CASH', NOW(), NOW()),
(17, 2, 8, 'EXPENSE', 185000.00, 'Belanja Buah & Sayur Segar', 'Beli stok buah apel dan jeruk di pasar', '2024-08-16', 'CASH', NOW(), NOW()),
(18, 2, 14, 'EXPENSE', 250000.00, 'Beli Buku Pemrograman Java', 'Buku panduan arsitektur Spring Boot', '2024-08-17', 'DEBIT_CARD', NOW(), NOW()),
(19, 2, 2, 'INCOME', 1200000.00, 'Bonus Insentif Proyek', 'Bonus penyelesaian sprint tepat waktu', '2024-08-18', 'BANK_TRANSFER', NOW(), NOW()),
(20, 2, 19, 'EXPENSE', 200000.00, 'Kado Ulang Tahun Adik', 'Beli hadiah jaket di marketplace', '2024-08-19', 'E_WALLET', NOW(), NOW()),
(21, 2, 6, 'EXPENSE', 62000.00, 'Makan Bakso Lapangan Tembak', 'Makan malam sepulang kantor', '2024-08-20', 'E_WALLET', NOW(), NOW()),
(22, 2, 7, 'EXPENSE', 40000.00, 'Tarif Parkir Bulanan Kantor', 'Iuran kartu parkir gedung', '2024-08-21', 'CASH', NOW(), NOW()),
(23, 2, 15, 'EXPENSE', 299000.00, 'Beli Kemeja Kerja Uniqlo', 'Pakaian formal untuk meeting klien', '2024-08-22', 'CREDIT_CARD', NOW(), NOW()),
(24, 2, 20, 'EXPENSE', 150000.00, 'Tambal Ban & Servis Ringan', 'Ganti oli mesin motor berkala', '2024-08-23', 'CASH', NOW(), NOW()),
(25, 2, 5, 'INCOME', 850000.00, 'Hasil Penjualan Barang Bekas', 'Jual monitor bekas tidak terpakai', '2024-08-24', 'BANK_TRANSFER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 6. SEED TRANSACTION_TAGS (Relasi Many-to-Many)
-- =========================================================
INSERT INTO transaction_tags (transaction_id, tag_id) VALUES
(1, 9), (1, 20),
(2, 1), (2, 4),
(3, 1), (3, 14),
(4, 1), (4, 9),
(5, 1), (5, 9),
(6, 4), (6, 20),
(7, 1), (7, 9),
(8, 2), (8, 8),
(9, 1), (9, 13),
(10, 1), (10, 14),
(11, 2), (11, 17),
(12, 7), (12, 20),
(13, 1), (13, 10),
(14, 16),
(15, 2), (15, 8),
(16, 2), (16, 18),
(17, 1),
(18, 2), (18, 15),
(19, 20),
(20, 2), (20, 5),
(21, 1),
(22, 1), (22, 4),
(23, 2), (23, 18),
(24, 3), (24, 14),
(25, 20)
ON CONFLICT (transaction_id, tag_id) DO NOTHING;

-- =========================================================
-- 7. SEED BUDGETS (20 Batas Anggaran Bulanan)
-- Langsung berelasi dengan category_id (sesuai entitas Budget)
-- =========================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE budgets ADD COLUMN category_id INT4;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'month'
    ) THEN
        ALTER TABLE budgets ADD COLUMN month INT4 DEFAULT 8;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'year'
    ) THEN
        ALTER TABLE budgets ADD COLUMN year INT4 DEFAULT 2024;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'alert_percentage'
    ) THEN
        ALTER TABLE budgets ADD COLUMN alert_percentage INT4 DEFAULT 80;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'alert_threshold'
    ) THEN
        ALTER TABLE budgets ADD COLUMN alert_threshold INT4 DEFAULT 80;
    END IF;
END $$;

INSERT INTO budgets (id, user_id, category_id, name, amount, month, year, start_date, end_date, alert_percentage, alert_threshold, status, created_at, updated_at) VALUES
(1, 2, 6, 'Anggaran Makan Agustus 2024', 1500000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(2, 2, 7, 'Anggaran Transportasi Agustus', 600000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(3, 2, 8, 'Anggaran Belanja Bulanan', 1200000.00, 8, 2024, '2024-08-01', '2024-08-31', 85, 85, 'ACTIVE', NOW(), NOW()),
(4, 2, 9, 'Anggaran Tagihan & Utilitas', 800000.00, 8, 2024, '2024-08-01', '2024-08-31', 90, 90, 'ACTIVE', NOW(), NOW()),
(5, 2, 13, 'Anggaran Hiburan & Rekreasi', 500000.00, 8, 2024, '2024-08-01', '2024-08-31', 75, 75, 'ACTIVE', NOW(), NOW()),
(6, 2, 12, 'Anggaran Kesehatan & Apotek', 400000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(7, 2, 15, 'Anggaran Pakaian & Grooming', 500000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(8, 2, 16, 'Anggaran Olahraga Mingguan', 300000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(9, 2, 17, 'Anggaran Sedekah & Sosial', 400000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(10, 2, 20, 'Anggaran Biaya Tak Terduga', 500000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(11, 3, 6, 'Anggaran Makan Ines', 1800000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(12, 3, 18, 'Anggaran Belanja Kosmetik Ines', 750000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(13, 3, 7, 'Anggaran Transportasi Ines', 500000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(14, 4, 8, 'Anggaran Rumah Tangga Budi', 2500000.00, 8, 2024, '2024-08-01', '2024-08-31', 85, 85, 'ACTIVE', NOW(), NOW()),
(15, 4, 14, 'Anggaran Pendidikan Anak Budi', 1500000.00, 8, 2024, '2024-08-01', '2024-08-31', 90, 90, 'ACTIVE', NOW(), NOW()),
(16, 5, 10, 'Anggaran Operasional Ahmad', 1200000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(17, 6, 6, 'Anggaran Makan Siti', 1000000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW()),
(18, 7, 8, 'Anggaran Bahan Baku Rian', 3500000.00, 8, 2024, '2024-08-01', '2024-08-31', 85, 85, 'ACTIVE', NOW(), NOW()),
(19, 8, 13, 'Anggaran Hiburan Dewi', 600000.00, 8, 2024, '2024-08-01', '2024-08-31', 75, 75, 'ACTIVE', NOW(), NOW()),
(20, 9, 7, 'Anggaran Servis Kendaraan Eko', 800000.00, 8, 2024, '2024-08-01', '2024-08-31', 80, 80, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 9. SEED FINANCIAL_GOALS (20 Target Finansial / Tabungan)
-- =========================================================
INSERT INTO financial_goals (id, user_id, name, target_amount, current_amount, target_date, description, status, created_at, updated_at) VALUES
(1, 2, 'Dana Darurat 6 Bulan', 30000000.00, 18500000.00, '2025-12-31', 'Simpanan darurat aman setara 6 bulan biaya hidup', 'ACTIVE', NOW(), NOW()),
(2, 2, 'Beli Laptop MacBook Pro M3', 25000000.00, 15000000.00, '2024-11-30', 'Alat kerja untuk meningkatkan produktivitas coding', 'ACTIVE', NOW(), NOW()),
(3, 2, 'Liburan Akhir Tahun ke Jepang', 20000000.00, 8000000.00, '2024-12-20', 'Biaya tiket pesawat, hotel, dan makan di Tokyo & Kyoto', 'ACTIVE', NOW(), NOW()),
(4, 2, 'Uang Muka (DP) Rumah Pertama', 80000000.00, 32000000.00, '2026-06-30', 'Persiapan DP rumah impian tipe 45', 'ACTIVE', NOW(), NOW()),
(5, 2, 'Beli Motor Listrik Baru', 18000000.00, 18000000.00, '2024-07-31', 'Kendaraan ramah lingkungan untuk mobilitas kerja', 'COMPLETED', NOW(), NOW()),
(6, 2, 'Dana Investasi SBN & Reksadana', 15000000.00, 6500000.00, '2025-03-31', 'Portofolio investasi obligasi pemerintah', 'ACTIVE', NOW(), NOW()),
(7, 2, 'Upgrade HP Flagship', 12000000.00, 4500000.00, '2024-10-31', 'Ganti smartphone untuk konten medsos', 'ACTIVE', NOW(), NOW()),
(8, 2, 'Ibadah Umroh Bareng Orang Tua', 65000000.00, 28000000.00, '2026-02-28', 'Paket umroh 9 hari bersama ayah dan ibu', 'ACTIVE', NOW(), NOW()),
(9, 2, 'Kursus Sertifikasi Cloud Architect', 7500000.00, 7500000.00, '2024-06-30', 'Biaya ujian AWS Certified Solutions Architect', 'COMPLETED', NOW(), NOW()),
(10, 2, 'Tabungan Pernikahan', 50000000.00, 12000000.00, '2026-08-31', 'Persiapan resepsi dan administrasi nikah', 'ACTIVE', NOW(), NOW()),
(11, 3, 'Tabungan S2 Akuntansi Ines', 40000000.00, 22000000.00, '2025-08-31', 'Biaya kuliah magister akuntansi', 'ACTIVE', NOW(), NOW()),
(12, 3, 'Beli iPad Pro & Apple Pencil', 16000000.00, 9500000.00, '2024-10-31', 'Tablet untuk review dokumen dan audit', 'ACTIVE', NOW(), NOW()),
(13, 4, 'Renovasi Dapur Rumah Budi', 20000000.00, 11000000.00, '2025-01-31', 'Perbaikan kitchen set dan keramik dapur', 'ACTIVE', NOW(), NOW()),
(14, 5, 'Beli Kamera Mirrorless Ahmad', 14000000.00, 5000000.00, '2024-12-15', 'Kamera untuk dokumentasi proyek', 'ACTIVE', NOW(), NOW()),
(15, 6, 'Dana Skripsi & Wisuda Siti', 5000000.00, 5000000.00, '2024-07-15', 'Biaya wisuda dan cetak buku skripsi', 'COMPLETED', NOW(), NOW()),
(16, 7, 'Modal Ekspansi Usaha Rian', 50000000.00, 25000000.00, '2025-05-31', 'Buka cabang toko offline kedua', 'ACTIVE', NOW(), NOW()),
(17, 8, 'Beli Sepeda Roadbike Dewi', 8500000.00, 3000000.00, '2024-11-15', 'Hobi gowes akhir pekan', 'ACTIVE', NOW(), NOW()),
(18, 9, 'Dana Liburan Keluarga Eko', 15000000.00, 7500000.00, '2024-12-25', 'Wisata keluarga ke Yogyakarta', 'ACTIVE', NOW(), NOW()),
(19, 10, 'Studio Lighting Setup Fajar', 9000000.00, 4200000.00, '2024-09-30', 'Lampu studio dan mic podcast', 'ACTIVE', NOW(), NOW()),
(20, 11, 'Asuransi Jiwa & Kesehatan Gita', 12000000.00, 6000000.00, '2025-04-30', 'Premi tahunan asuransi murni', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 10. SEED NOTIFICATIONS (20 Notifikasi Riwayat Sistem)
-- =========================================================
INSERT INTO notifications (id, user_id, title, message, type, is_read, scheduled_at, sent_at, created_at, updated_at) VALUES
(1, 2, 'Selamat Datang di CuanFlow!', 'Akun Anda telah aktif. Mulai catat transaksi pertama Anda sekarang.', 'SYSTEM', true, NOW(), NOW(), NOW(), NOW()),
(2, 2, 'Peringatan Anggaran Makan (80%)', 'Pengeluaran kategori Makanan telah mencapai Rp 1.200.000 (80% dari batas Rp 1.500.000).', 'BUDGET_ALERT', false, NOW(), NOW(), NOW(), NOW()),
(3, 2, 'Target Tercapai: Beli Motor Listrik', 'Selamat! Target tabungan Beli Motor Listrik Baru telah terkumpul 100%.', 'GOAL_REMINDER', true, NOW(), NOW(), NOW(), NOW()),
(4, 2, 'Pengingat Transaksi Harian', 'Jangan lupa mencatat pemasukan dan pengeluaran hari ini.', 'TRANSACTION_REMINDER', false, NOW(), NOW(), NOW(), NOW()),
(5, 2, 'Laporan Keuangan Mingguan Siap', 'Lihat rekapitulasi arus kas Anda di menu Laporan & Analitik.', 'INFO', true, NOW(), NOW(), NOW(), NOW()),
(6, 2, 'Tips CuanFlow: Hemat Pengeluaran', 'Kendalikan pos jajan kafe agar target Dana Darurat lebih cepat tercapai.', 'INFO', false, NOW(), NOW(), NOW(), NOW()),
(7, 2, 'Peringatan Anggaran Transportasi', 'Pengeluaran transportasi telah mencapai 75% dari batas bulanan.', 'BUDGET_ALERT', true, NOW(), NOW(), NOW(), NOW()),
(8, 2, 'Pembaruan Keamanan Sistem', 'Sistem keamanan JWT CuanFlow telah berhasil diperbarui.', 'SYSTEM', true, NOW(), NOW(), NOW(), NOW()),
(9, 2, 'Progres Tabungan Rumah: 40%', 'Hebat! Anda telah mengumpulkan 40% dari DP Rumah Pertama.', 'GOAL_REMINDER', false, NOW(), NOW(), NOW(), NOW()),
(10, 2, 'Pencatatan Transaksi Berhasil', 'Transaksi Gaji Pokok sebesar Rp 8.500.000 berhasil disimpan.', 'INFO', true, NOW(), NOW(), NOW(), NOW()),
(11, 3, 'Selamat Datang Ines!', 'Akun CuanFlow Anda siap digunakan untuk manajemen pembukuan kas.', 'SYSTEM', true, NOW(), NOW(), NOW(), NOW()),
(12, 3, 'Peringatan Anggaran Kosmetik', 'Pengeluaran belanja kosmetik mendekati ambang batas 80%.', 'BUDGET_ALERT', false, NOW(), NOW(), NOW(), NOW()),
(13, 4, 'Pengingat Pembayaran KPR', 'Jadwal pembayaran cicilan KPR tanggal 10 setiap bulan.', 'TRANSACTION_REMINDER', true, NOW(), NOW(), NOW(), NOW()),
(14, 5, 'Target Finansial Baru Dibuat', 'Target Beli Kamera Mirrorless berhasil ditambahkan.', 'GOAL_REMINDER', true, NOW(), NOW(), NOW(), NOW()),
(15, 6, 'Selamat! Wisuda Telah Selesai', 'Target Dana Skripsi & Wisuda berstatus COMPLETED.', 'GOAL_REMINDER', true, NOW(), NOW(), NOW(), NOW()),
(16, 7, 'Peringatan Anggaran Bahan Baku', 'Bahan baku telah mencapai 85% dari batas anggaran.', 'BUDGET_ALERT', false, NOW(), NOW(), NOW(), NOW()),
(17, 8, 'Evaluasi Anggaran Bulanan', 'Bulan Agustus telah berjalan separuh. Periksa sisa saldo Anda.', 'INFO', false, NOW(), NOW(), NOW(), NOW()),
(18, 9, 'Pengingat Servis Motor', 'Jadwal servis berkala motor Anda minggu ini.', 'TRANSACTION_REMINDER', true, NOW(), NOW(), NOW(), NOW()),
(19, 10, 'Target Studio Lighting 45%', 'Progres tabungan studio pencahayaan berjalan sesuai rencana.', 'GOAL_REMINDER', false, NOW(), NOW(), NOW(), NOW()),
(20, 1, 'Laporan Aktivitas Pengguna (Admin)', 'Terdapat 20 pengguna aktif terdaftar di sistem CuanFlow.', 'SYSTEM', true, NOW(), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 11. SEED ATTACHMENTS (Contoh Bukti Transaksi)
-- =========================================================
INSERT INTO attachments (id, transaction_id, file_name, file_url, file_type, file_size, created_at, updated_at) VALUES
(1, 1, 'slip-gaji-agustus.pdf', 'uploads/attachments/sample-slip-gaji.pdf', 'application/pdf', 245800, NOW(), NOW()),
(2, 2, 'struk-nasi-padang.jpg', 'uploads/attachments/sample-struk-padang.jpg', 'image/jpeg', 124500, NOW(), NOW()),
(3, 4, 'bukti-transfer-indihome.png', 'uploads/attachments/sample-bukti-wifi.png', 'image/png', 312000, NOW(), NOW()),
(4, 5, 'struk-superindo.jpg', 'uploads/attachments/sample-struk-superindo.jpg', 'image/jpeg', 458900, NOW(), NOW()),
(5, 7, 'resi-token-pln.pdf', 'uploads/attachments/sample-token-pln.pdf', 'application/pdf', 189400, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 12. SEED AUDIT_LOGS (20 Log Jejak Audit Pengendalian Internal SIA)
-- Memenuhi Syarat Minimal 20 Data Awal & Standar Audit COSO
-- =========================================================
INSERT INTO audit_logs (id, user_id, action, module, entity, description, ip_address, user_agent, status, severity, created_at) VALUES
(1, 1, 'UPDATE_ROLE', 'USER_MANAGEMENT', 'User ID #2 (Galang Pratama)', 'Mengubah peran pengguna dari USER menjadi ADMIN', '192.168.1.105', 'Chrome/128.0 Windows 10', 'SUCCESS', 'HIGH', '2024-08-20 14:32:15'),
(2, 5, 'EXPORT_REPORT', 'FINANCIAL_REPORT', 'Report PDF (Periode Agustus 2024)', 'Melakukan ekspor Laporan Keuangan Pribadi format PDF', '192.168.1.112', 'Edge/127.0 Windows 11', 'SUCCESS', 'LOW', '2024-08-20 11:15:40'),
(3, 1, 'SUSPEND_ACCOUNT', 'SECURITY_CONTROL', 'User ID #14 (Rian Hidayat)', 'Menonaktifkan status akun pengguna karena aktivitas mencurigakan', '192.168.1.105', 'Chrome/128.0 Windows 10', 'WARNING', 'HIGH', '2024-08-19 16:45:02'),
(4, 4, 'CREATE_TRANSACTION', 'TRANSACTION_SERVICE', 'Transaksi ID #142 (Nominal: Rp 4.500.000)', 'Membuat transaksi pengeluaran kategori Sewa Kamar Kost', '192.168.1.140', 'Safari/604.1 iOS 17.5', 'SUCCESS', 'LOW', '2024-08-19 09:20:11'),
(5, NULL, 'FAILED_LOGIN', 'AUTHENTICATION', 'Akun Target: admin@cuanflow.id', 'Percobaan login gagal sebanyak 3 kali (Salah Password)', '182.253.14.92', 'PostmanRuntime/7.39.0', 'FAILED', 'HIGH', '2024-08-18 22:10:05'),
(6, 1, 'BROADCAST_NOTIFICATION', 'NOTIFICATION_SERVICE', 'Pengumuman Sistem #08', 'Mengirimkan siaran pengumuman pemeliharaan rutin server ke seluruh pengguna', '192.168.1.105', 'Chrome/128.0 Windows 10', 'SUCCESS', 'MEDIUM', '2024-08-18 08:00:00'),
(7, 6, 'UPDATE_PROFILE', 'AUTH_SERVICE', 'Profil User ID #6', 'Memperbarui informasi profil (Nomor HP, Tanggal Lahir, dan Pekerjaan)', '192.168.1.118', 'Chrome/128.0 Android 14', 'SUCCESS', 'LOW', '2024-08-17 13:40:22'),
(8, 1, 'DELETE_USER', 'USER_MANAGEMENT', 'User ID #99 (Akun Uji Coba)', 'Menghapus data akun uji coba pengguna secara permanen atas permintaan user', '192.168.1.105', 'Chrome/128.0 Windows 10', 'SUCCESS', 'HIGH', '2024-08-16 10:15:30'),
(9, 2, 'LOGIN', 'AUTHENTICATION', 'User ID #2 (Galang Pratama)', 'Login berhasil ke dalam sistem CuanFlow', '192.168.1.102', 'Chrome/128.0 Windows 10', 'SUCCESS', 'LOW', '2024-08-16 08:30:10'),
(10, 3, 'LOGIN', 'AUTHENTICATION', 'User ID #3 (Ines Karlina)', 'Login berhasil ke dalam sistem CuanFlow', '192.168.1.103', 'Chrome/128.0 Windows 10', 'SUCCESS', 'LOW', '2024-08-16 08:45:00'),
(11, 2, 'CREATE_BUDGET', 'BUDGET_SERVICE', 'Anggaran ID #1 (Makan & Minum: Rp 2.500.000)', 'Membuat plafon anggaran pengeluaran bulanan baru', '192.168.1.102', 'Chrome/128.0 Windows 10', 'SUCCESS', 'LOW', '2024-08-15 09:12:00'),
(12, 3, 'CREATE_GOAL', 'FINANCIAL_GOAL', 'Target Tabungan ID #2 (Dana Darurat: Rp 15.000.000)', 'Membuat sasaran tujuan finansial tabungan baru', '192.168.1.103', 'Chrome/128.0 Windows 10', 'SUCCESS', 'LOW', '2024-08-15 10:00:45'),
(13, 1, 'CREATE_CATEGORY', 'CATEGORY_SERVICE', 'Master Kategori ID #10 (Pendidikan & Kursus)', 'Menambahkan template master kategori sistem baru', '192.168.1.105', 'Chrome/128.0 Windows 10', 'SUCCESS', 'MEDIUM', '2024-08-14 14:20:10'),
(14, 7, 'EXPORT_REPORT', 'FINANCIAL_REPORT', 'Report Excel (Periode Juli 2024)', 'Melakukan ekspor Laporan Keuangan Pribadi format XLSX', '192.168.1.115', 'Chrome/128.0 Windows 10', 'SUCCESS', 'LOW', '2024-08-14 16:50:33'),
(15, 8, 'UPDATE_PASSWORD', 'AUTH_SERVICE', 'User ID #8 (Dewi Lestari)', 'Memperbarui kata sandi akun pengguna (Password Change)', '192.168.1.120', 'Safari/604.1 macOS', 'SUCCESS', 'MEDIUM', '2024-08-13 11:05:19'),
(16, 9, 'LOGIN', 'AUTHENTICATION', 'User ID #9 (Eko Prasetyo)', 'Login berhasil ke dalam sistem CuanFlow', '192.168.1.122', 'Firefox/129.0 Linux', 'SUCCESS', 'LOW', '2024-08-13 13:40:00'),
(17, 10, 'CREATE_TRANSACTION', 'TRANSACTION_SERVICE', 'Transaksi ID #143 (Pemasukan Gaji: Rp 8.000.000)', 'Mencatat arus kas masuk dari penerimaan gaji bulanan', '192.168.1.125', 'Chrome/128.0 Windows 11', 'SUCCESS', 'LOW', '2024-08-12 08:15:22'),
(18, 1, 'ACTIVATE_ACCOUNT', 'SECURITY_CONTROL', 'User ID #7 (Rian Hidayat)', 'Mengaktifkan kembali status akun pengguna setelah verifikasi identitas', '192.168.1.105', 'Chrome/128.0 Windows 10', 'SUCCESS', 'HIGH', '2024-08-12 15:30:00'),
(19, 11, 'FAILED_LOGIN', 'AUTHENTICATION', 'Akun Target: anita@gmail.com', 'Percobaan login gagal (Kredensial tidak valid)', '182.253.18.11', 'Chrome/128.0 Android 13', 'FAILED', 'MEDIUM', '2024-08-11 20:45:10'),
(20, 1, 'SYSTEM_BACKUP', 'SYSTEM_MAINTENANCE', 'Database Snapshot db_cuanflow', 'Melakukan pencadangan (*backup*) data berkala sistem', '192.168.1.105', 'pg_dump Automated Script', 'SUCCESS', 'MEDIUM', '2024-08-11 23:59:59')
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 13. SEED SYSTEM_BROADCASTS (Contoh Siaran Pengumuman Massal)
-- =========================================================
INSERT INTO system_broadcasts (id, sender_id, title, message, type, target_audience, recipients_count, is_sent, sent_at, created_at) VALUES
(1, 1, 'Pemeliharaan Server Terjadwal (Maintenance)', 'Sistem CuanFlow akan melakukan pemeliharaan rutin pada hari Minggu pukul 00.00 - 02.00 WIB. Mohon simpan transaksi Anda.', 'MAINTENANCE', 'ALL_USERS', 20, true, '2024-08-18 08:00:00', NOW()),
(2, 1, 'Fitur Baru: Format Laporan Keuangan Pribadi (Excel & PDF)', 'Kini Anda dapat mengunduh laporan keuangan pribadi dengan struktur tabel bulanan terintegrasi dan ringkasan kas lengkap.', 'INFO', 'ACTIVE_ONLY', 19, true, '2024-08-15 14:30:22', NOW()),
(3, 1, 'Tips CuanFlow: Evaluasi Batas Anggaran Bulanan', 'Jangan lupa untuk memeriksa progres anggaran bulanan Anda agar terhindar dari pengeluaran di atas batas target 80%.', 'TIPS', 'ALL_USERS', 20, true, '2024-08-10 10:00:00', NOW()),
(4, 1, 'Pemberitahuan Keamanan: Pembaruan Kata Sandi Berkala', 'Demi menjaga keamanan catatan keuangan pribadi Anda, disarankan untuk memperbarui kata sandi akun secara berkala.', 'INFO', 'ALL_USERS', 20, true, '2024-08-05 09:00:00', NOW()),
(5, 1, 'Edukasi Finansial: Manfaat Pembentukan Pos Dana Darurat', 'Alokasikan minimal 10-20% dari pemasukan bulanan Anda ke dalam fitur Tujuan Keuangan (Dana Darurat).', 'TIPS', 'ALL_USERS', 20, true, '2024-08-01 10:00:00', NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 14. SINKRONISASI IDENTITY SEQUENCES
-- Mencegah error "duplicate key value violates unique constraint"
-- saat user menambah data baru di aplikasi setelah seeding
-- =========================================================
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('profiles', 'id'), COALESCE((SELECT MAX(id) FROM profiles), 1));
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval(pg_get_serial_sequence('transactions', 'id'), COALESCE((SELECT MAX(id) FROM transactions), 1));
SELECT setval(pg_get_serial_sequence('budgets', 'id'), COALESCE((SELECT MAX(id) FROM budgets), 1));
SELECT setval(pg_get_serial_sequence('financial_goals', 'id'), COALESCE((SELECT MAX(id) FROM financial_goals), 1));
SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE((SELECT MAX(id) FROM notifications), 1));
SELECT setval(pg_get_serial_sequence('attachments', 'id'), COALESCE((SELECT MAX(id) FROM attachments), 1));
SELECT setval(pg_get_serial_sequence('tags', 'id'), COALESCE((SELECT MAX(id) FROM tags), 1));

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        PERFORM setval(pg_get_serial_sequence('audit_logs', 'id'), COALESCE((SELECT MAX(id) FROM audit_logs), 1));
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_broadcasts') THEN
        PERFORM setval(pg_get_serial_sequence('system_broadcasts', 'id'), COALESCE((SELECT MAX(id) FROM system_broadcasts), 1));
    END IF;
END $$;

-- =========================================================
-- SEED DATA BERHASIL DI-LOAD SECARA LENGKAP!
-- Total:
-- - 20 Users & 20 Profiles
-- - 20 Categories (Income & Expense)
-- - 20 Tags & 25 Transaction-Tags junction
-- - 25 Transactions (Berbagai metode, tanggal, dan tipe)
-- - 20 Budgets & Junction Categories
-- - 20 Financial Goals
-- - 20 Notifications
-- - 5 Sample Attachments
-- - 20 Audit Logs (Sistem Pengendalian Internal COSO)
-- - 5 System Broadcasts (Siaran Pengumuman Massal)
-- =========================================================

