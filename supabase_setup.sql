-- =========================================================================
-- SQL SETUP UNTUK DATABASE SUPABASE - ABSENSI SISWA PKL SMKN 3 BOGOR
-- Salin semua kode di bawah ini dan tempel di menu "SQL Editor" di Supabase,
-- lalu klik tombol "Run".
-- =========================================================================

-- 1. Buat Tabel Siswa
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jurusan TEXT DEFAULT 'Teknik Komputer dan Jaringan',
  dudi TEXT NOT NULL,
  alamat_dudi TEXT DEFAULT '-',
  guru_pembimbing TEXT DEFAULT 'Nunik Wulan Saptowati, S.T.P.',
  no_hp TEXT DEFAULT '-',
  role TEXT DEFAULT 'siswa'
);

-- 2. Buat Tabel Guru Pembimbing
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'guru'
);

-- 3. Buat Tabel Presensi Kehadiran
CREATE TABLE IF NOT EXISTS attendances (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  status TEXT NOT NULL,
  jam_masuk TEXT,
  waktu_submit_masuk TEXT,
  jam_pulang TEXT,
  waktu_submit_pulang TEXT,
  keterangan TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 4. Masukkan Data 11 Siswa PKL SMKN 3 Bogor
INSERT INTO students (id, nama, kelas, jurusan, dudi, alamat_dudi, guru_pembimbing) VALUES
('siswa-1', 'Raden Muhamad Bagir Ramadhan', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'Bank BJB KCP Tanah Sareal', 'Jl. Sholeh Iskandar, Tanah Sareal, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-2', 'Abdul Kholik Ramadhan', 'XII TKJ 1', 'Teknik Komputer dan Jaringan', 'Bank BJB KCP Tajur', 'Jl. Raya Tajur, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-3', 'Pradava Evans Herlambang', 'XII TKJ 1', 'Teknik Komputer dan Jaringan', 'Bank BJB KCP Tajur', 'Jl. Raya Tajur, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-4', 'Raditya Rasia Purnama', 'XII TKJ 1', 'Teknik Komputer dan Jaringan', 'Bank BJB KCP Tajur', 'Jl. Raya Tajur, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-5', 'Fairuz Izni Nabila', 'XII TKJ 2', 'Teknik Komputer dan Jaringan', 'Bank BJB KC Sudirman', 'Jl. Jend. Sudirman No. 13, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-6', 'Faathir Azhar Murdilangga', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'Bank BJB KCP Padjajaran', 'Jl. Raya Pajajaran, Baranangsiang, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-7', 'Faraulla Ilmira', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'DPRD Kota Bogor', 'Jl. Pemuda No. 25, Tanah Sareal, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-8', 'Nashwa Zalifa Gusmi', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'DPRD Kota Bogor', 'Jl. Pemuda No. 25, Tanah Sareal, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-9', 'Nazwa Syifa Pratama', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'DPRD Kota Bogor', 'Jl. Pemuda No. 25, Tanah Sareal, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-10', 'Muhamad Rayhan Riyadi', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'Dinas Pariwisata & Kebudayaan Kota Bogor', 'Jl. Pandu Raya No. 45, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.'),
('siswa-11', 'Nur Fadly Erdiansyah', 'XII TKJ 3', 'Teknik Komputer dan Jaringan', 'Dinas Pariwisata & Kebudayaan Kota Bogor', 'Jl. Pandu Raya No. 45, Kota Bogor', 'Nunik Wulan Saptowati, S.T.P.')
ON CONFLICT (id) DO NOTHING;

-- 5. Masukkan Akun Guru Pembimbing (Password: absensi123#)
INSERT INTO teachers (id, nama, password, role) VALUES
('guru-1', 'Nunik Wulan Saptowati, S.T.P.', 'absensi123#', 'guru')
ON CONFLICT (id) DO NOTHING;

-- 6. Izinkan Akses Baca/Tulis untuk Vercel API
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendances DISABLE ROW LEVEL SECURITY;

