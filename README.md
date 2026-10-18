# 📱 Sistem Absensi Siswa PKL SMKN 3 Bogor

Aplikasi presensi web sederhana, cepat, dan transparan untuk siswa PKL SMKN 3 Bogor dan Guru Pembimbing **Ibu Nunik Wulan Saptowati, S.T.P.**

---

## ⚡ Fitur Utama

### 1. 👤 Akses Siswa PKL (Hanya untuk Presensi Pribadi)
- **Login Sangat Mudah**: Cukup memasukkan **Nama Lengkap** dan **Kelas** (contoh: `XII TKJ 1`, `XII TKJ 2`, atau `XII TKJ 3`).
- **Jam Masuk & Pulang Diisi Siswa**: Siswa dapat mengisikan jam kerja PKL sesuai kesepakatan tempat magang masing-masing.
- **Waktu Submit Otomatis**: Sistem secara otomatis mencatat waktu riil (timestamp) saat tombol simpan diklik.
- **Tanpa Foto / Kamera**: Menghilangkan kendala izin perangkat dan kuota internet.
- **Tanpa Jurnal Harian**: Presensi fokus murni pada kehadiran.
- **Tanpa Status Terlambat**: Jam fleksibel menyesuaikan jam operasional tiap kantor/instansi.
- **Pengajuan Izin / Sakit**: Tersedia formulir cepat jika siswa berhalangan hadir.
- **Riwayat Pribadi**: Siswa hanya dapat melihat presensi dirinya sendiri.

### 2. 👩‍🏫 Akses Guru Pembimbing (Pemantauan & Rekapitulasi)
- **Login Guru**: Menggunakan **Nama Guru** (`Nunik Wulan Saptowati, S.T.P.`) dan **Password** (`absensi123#`).
- **Dashboard Pemantauan Harian**:
  - Melihat kehadiran 11 siswa secara langsung.
  - Memantau jam kerja yang diisi siswa dan **Waktu Mengisi Absen** yang tercatat oleh sistem.
  - Filter pencarian nama siswa, tempat PKL, dan status (Hadir, Izin, Sakit, Belum Absen).
- **Rekapitulasi Kehadiran & Export Excel**:
  - Menghitung persentase kehadiran masing-masing siswa.
  - **Export Excel (.xlsx)**: Rekapitulasi lengkap dua lembar (Sheet Ringkasan & Sheet Log Harian dengan Waktu Submit Siswa).
  - Cetak / PDF ramah printer.
- **Daftar Siswa & Tempat PKL (DUDI)**.

---

## 👥 Data Siswa & Tempat PKL (Total 11 Siswa - Jurusan TKJ)

| No | Nama Siswa | Kelas | Tempat PKL (DUDI) |
| :-: | :--- | :---: | :--- |
| 1 | **Abdul Kholik Ramadhan** | **XII TKJ 1** | Bank BJB KCP Tajur |
| 2 | **Pradava Evans Herlambang** | **XII TKJ 1** | Bank BJB KCP Tajur |
| 3 | **Raditya Rasia Purnama** | **XII TKJ 1** | Bank BJB KCP Tajur |
| 4 | **Fairuz Izni Nabila** | **XII TKJ 2** | Bank BJB KC Sudirman |
| 5 | **Raden Muhamad Bagir Ramadhan** | **XII TKJ 3** | Bank BJB KCP Tanah Sareal |
| 6 | **Faathir Azhar Murdilangga** | **XII TKJ 3** | Bank BJB KCP Padjajaran |
| 7 | **Faraulla Ilmira** | **XII TKJ 3** | DPRD Kota Bogor |
| 8 | **Nashwa Zalifa Gusmi** | **XII TKJ 3** | DPRD Kota Bogor |
| 9 | **Nazwa Syifa Pratama** | **XII TKJ 3** | DPRD Kota Bogor |
| 10 | **Muhamad Rayhan Riyadi** | **XII TKJ 3** | Dinas Pariwisata & Kebudayaan Kota Bogor |
| 11 | **Nur Fadly Erdiansyah** | **XII TKJ 3** | Dinas Pariwisata & Kebudayaan Kota Bogor |

---

## 🚀 Cara Menjalankan Aplikasi

Jalankan perintah berikut di terminal:
```bash
npm start
```
Buka peramban (browser) di:
👉 **`http://localhost:3000`**

---

## 🔑 Akun Login

- **Siswa**: Ketik Nama Siswa dan Kelas (`XII TKJ 1`, `XII TKJ 2`, atau `XII TKJ 3`).
- **Guru Pembimbing**:
  - **Nama**: `Nunik Wulan Saptowati, S.T.P.`
  - **Password**: `absensi123#`

---

## 🌐 Cara Deploy ke Render.com (Online 24/7 & Gratis)

Aplikasi ini sudah dilengkapi dengan file blueprint `render.yaml` dan siap langsung dideploy ke **Render.com**.

### Langkah Mudah Deploy ke Render:
1. **Buat Repository Baru di GitHub**:
   - Buka [github.com/new](https://github.com/new)
   - Beri nama repository, misalnya: `absensi-pkl-smkn3bogor` (atur Public atau Private).
   - Klik **Create repository**.

2. **Push Kode dari Komputer Anda ke GitHub**:
   Jalankan perintah ini di terminal VS Code:
   ```bash
   git remote add origin https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git
   git push -u origin main
   ```

3. **Deploy di Render.com**:
   - Buka [dashboard.render.com](https://dashboard.render.com/) (Daftar/Login dengan GitHub).
   - Klik **"New +"** lalu pilih **"Web Service"**.
   - Hubungkan ke repository GitHub yang baru Anda buat (`absensi-pkl-smkn3bogor`).
   - Render akan otomatis membaca konfigurasi `render.yaml`:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`
   - Klik **"Deploy Web Service"**!
   - Tunggu 1–2 menit, Render akan memberikan URL publik aktif seperti:
     👉 `https://absensi-siswa-pkl.onrender.com`

---

## 🌐 Alternatif: Deploy ke Vercel (Menggunakan MongoDB Atlas)

### 1. Buat Database MongoDB Atlas Gratis (5 Menit)
1. Buka [mongodb.com/atlas](https://www.mongodb.com/atlas) dan daftar akun gratis.
2. Buat Cluster Gratis (**M0 Free**).
3. Buat database user (username & password).
4. Di menu **Network Access**, tambahkan IP Access List: `0.0.0.0/0` (Allow Access from Anywhere).
5. Klik **Connect** -> **Drivers (Node.js)**, lalu salin connection string-nya:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/absensi_pkl?retryWrites=true&w=majority
   ```

### 2. Upload / Push ke GitHub
```bash
git init
git add .
git commit -m "Absensi PKL SMKN 3 Bogor siap deploy"
# Hubungkan ke repository GitHub kamu lalu push
```

### 3. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub kamu.
2. Klik **Add New...** -> **Project** -> Pilih repository `absensi-pkl`.
3. Di bagian **Environment Variables**, tambahkan:
   - **Key**: `MONGODB_URI`
   - **Value**: *(Paste connection string MongoDB Atlas kamu)*
4. Klik **Deploy**!
5. Dalam 1 menit, website kamu sudah aktif secara online (contoh: `absensi-smkn3bogor.vercel.app`).

### 🔄 Cara Mengupdate Website Sambil Berjalan
Kamu bisa terus mengupdate kode kapan saja! Setiap kali kamu mengubah kode di VS Code:
```bash
git add .
git commit -m "Update fitur baru"
git push
```
Vercel akan secara otomatis mendeteksi perubahan dan memperbarui website kamu secara *live* tanpa mengganggu data presensi siswa yang sudah ada di database.

