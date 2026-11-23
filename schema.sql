-- ============================================================================
-- SKEMA DATABASE BACKEND: CAFE PET DE ANIN (POS KASIR & PETTY CASH IMPREST)
-- Standar Akuntansi: SAK EMKM
-- ============================================================================

-- Bersihkan tabel lama jika ingin mengatur ulang database dari awal
DROP TABLE IF EXISTS jurnal_umum CASCADE;
DROP TABLE IF EXISTS petty_cash CASCADE;
DROP TABLE IF EXISTS produk CASCADE;
DROP TABLE IF EXISTS akun_coa CASCADE;

-- 1. TABEL CHART OF ACCOUNTS (COA) STANDAR AKUNTANSI
CREATE TABLE akun_coa (
    kode_akun VARCHAR(10) PRIMARY KEY,
    nama_akun VARCHAR(120) NOT NULL,
    klasifikasi VARCHAR(50) NOT NULL,
    sub_klasifikasi VARCHAR(60) NOT NULL,
    saldo_normal VARCHAR(10) NOT NULL
);

INSERT INTO akun_coa (kode_akun, nama_akun, klasifikasi, sub_klasifikasi, saldo_normal) VALUES
-- KELOMPOK 1: ASET
('1-1101', 'Kas Besar (Cash on Hand - Laci Kasir)', 'Aset', 'Aset Lancar - Kas', 'Debit'),
('1-1102', 'Kas Kecil (Petty Cash - Dana Tetap)', 'Aset', 'Aset Lancar - Kas', 'Debit'),
('1-1103', 'Kas di Bank (Rekening Operasional & QRIS)', 'Aset', 'Aset Lancar - Kas', 'Debit'),
('1-1201', 'Piutang Usaha Pelanggan (Grooming/Hotel)', 'Aset', 'Aset Lancar - Piutang', 'Debit'),
('1-1301', 'Persediaan Barang Dagang - Pet Shop', 'Aset', 'Aset Lancar - Persediaan', 'Debit'),
('1-1302', 'Persediaan Bahan Baku - Cafe', 'Aset', 'Aset Lancar - Persediaan', 'Debit'),
('1-1401', 'Perlengkapan Toko & Grooming (Supplies)', 'Aset', 'Aset Lancar - Perlengkapan', 'Debit'),
-- KELOMPOK 2: LIABILITAS
('2-1101', 'Utang Pajak Restoran / PB1 (10%)', 'Liabilitas', 'Liabilitas Jangka Pendek', 'Kredit'),
('2-1102', 'Pendapatan Diterima di Muka (Booking)', 'Liabilitas', 'Liabilitas Jangka Pendek', 'Kredit'),
-- KELOMPOK 3: EKUITAS
('3-1101', 'Modal Pemilik - Cafe Pet De Anin', 'Ekuitas', 'Ekuitas Pemilik', 'Kredit'),
-- KELOMPOK 4: PENDAPATAN OPERASIONAL
('4-1101', 'Pendapatan Penjualan Produk Pet Shop', 'Pendapatan', 'Pendapatan Usaha', 'Kredit'),
('4-1102', 'Pendapatan Jasa Grooming & Pet Hotel', 'Pendapatan', 'Pendapatan Usaha', 'Kredit'),
('4-1103', 'Pendapatan Penjualan Food & Beverage Cafe', 'Pendapatan', 'Pendapatan Usaha', 'Kredit'),
('4-1201', 'Potongan Penjualan (Diskon Kasir)', 'Pendapatan', 'Akun Kontra Pendapatan', 'Debit'),
-- KELOMPOK 5: BEBAN POKOK PENJUALAN (HPP)
('5-1101', 'Beban Pokok Penjualan - Pet Shop', 'HPP', 'Beban Pokok Penjualan', 'Debit'),
('5-1102', 'Beban Pokok Penjualan - Cafe', 'HPP', 'Beban Pokok Penjualan', 'Debit'),
-- KELOMPOK 6: BEBAN OPERASIONAL (PENGELUARAN PETTY CASH)
('6-1101', 'Beban Perlengkapan Toko & Kemasan', 'Beban', 'Beban Operasional Toko', 'Debit'),
('6-1102', 'Beban Perlengkapan Habis Pakai Grooming', 'Beban', 'Beban Operasional Toko', 'Debit'),
('6-1103', 'Beban Bahan Pembantu Dapur & Cafe', 'Beban', 'Beban Operasional Toko', 'Debit'),
('6-1104', 'Beban Kebersihan, Sanitasi & Disinfektan', 'Beban', 'Beban Operasional Toko', 'Debit'),
('6-1105', 'Beban Transportasi, Parkir & Kurir Lokal', 'Beban', 'Beban Operasional Toko', 'Debit'),
('6-1201', 'Beban Listrik, Air & Internet Darurat', 'Beban', 'Beban Administrasi & Umum', 'Debit'),
('6-1202', 'Beban Pemeliharaan & Perbaikan Ringan', 'Beban', 'Beban Administrasi & Umum', 'Debit'),
('6-1203', 'Beban Konsumsi Karyawan & Lembur', 'Beban', 'Beban Administrasi & Umum', 'Debit'),
-- KELOMPOK 7: PENDAPATAN & BEBAN LAIN-LAIN (SELISIH CASH OPNAME)
('7-1101', 'Pendapatan Selisih Kas Lebih (Cash Over)', 'Pendapatan Lain', 'Non-Operasional', 'Kredit'),
('7-2101', 'Beban Selisih Kas Kurang (Cash Short)', 'Beban Lain', 'Non-Operasional', 'Debit');

-- 2. TABEL KATALOG PRODUK & JASA KASIR (METODE PERPETUAL)
CREATE TABLE produk (
    id SERIAL PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL, -- 'Pet Shop', 'Cafe', 'Grooming'
    harga_beli NUMERIC NOT NULL DEFAULT 0,
    harga_jual NUMERIC NOT NULL,
    stok INT NOT NULL DEFAULT 0
);

INSERT INTO produk (nama_produk, kategori, harga_beli, harga_jual, stok) VALUES
('Royal Canin Kitten 400g', 'Pet Shop', 48000, 65000, 25),
('Pasir Kucing Wangi Kopi 5L', 'Pet Shop', 22000, 35000, 20),
('Vitamin Bulu Kucing NutriPlus', 'Pet Shop', 55000, 80000, 15),
('Caramel Macchiato Iced', 'Cafe', 9000, 24000, 50),
('Croissant Butter Hangat', 'Cafe', 8000, 20000, 30),
('Basic Grooming Kucing', 'Grooming', 15000, 75000, 999);

-- 3. TABEL BUKU KAS KECIL (PETTY CASH - METODE IMPREST)
CREATE TABLE petty_cash (
    id SERIAL PRIMARY KEY,
    no_bukti VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kode_akun VARCHAR(10) REFERENCES akun_coa(kode_akun),
    keterangan TEXT NOT NULL,
    nominal NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' -- 'pending' atau 'replenished'
);

-- 4. TABEL JURNAL UMUM OTOMATIS (AUTO-JOURNALING)
CREATE TABLE jurnal_umum (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    no_referensi VARCHAR(30) NOT NULL,
    kode_akun VARCHAR(10) REFERENCES akun_coa(kode_akun),
    keterangan TEXT NOT NULL,
    debit NUMERIC NOT NULL DEFAULT 0,
    kredit NUMERIC NOT NULL DEFAULT 0
);

-- 5. SALDO AWAL PEMBENTUKAN MODAL & DANA TETAP PETTY CASH
INSERT INTO jurnal_umum (no_referensi, kode_akun, keterangan, debit, kredit) VALUES
('JU-0001', '1-1103', 'Setoran Modal Awal ke Rekening Bank Operasional', 10000000, 0),
('JU-0001', '1-1301', 'Persediaan Awal Barang Dagang Pet Shop', 2470000, 0),
('JU-0001', '1-1302', 'Persediaan Awal Bahan Baku Cafe', 690000, 0),
('JU-0001', '3-1101', 'Modal Pemilik Awal - Cafe Pet De Anin', 0, 13160000),
('JU-0002', '1-1102', 'Pembentukan Dana Tetap Petty Cash (Metode Imprest)', 1000000, 0),
('JU-0002', '1-1103', 'Pencairan Dana dari Bank untuk Kas Kecil', 0, 1000000);

-- Nonaktifkan Row Level Security (RLS) agar Frontend HTML/JS dapat membaca & menulis data
ALTER TABLE akun_coa DISABLE ROW LEVEL SECURITY;
ALTER TABLE produk DISABLE ROW LEVEL SECURITY;
ALTER TABLE petty_cash DISABLE ROW LEVEL SECURITY;
ALTER TABLE jurnal_umum DISABLE ROW LEVEL SECURITY;
