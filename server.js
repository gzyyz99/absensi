require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { generateAttendanceExcel } = require('./excelExporter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware (connects to MongoDB Atlas if MONGODB_URI is provided)
app.use(async (req, res, next) => {
  try {
    await db.connect();
  } catch (err) {
    // continue with local fallback
  }
  next();
});

// Static directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper to format date YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const d = new Date();
  return d.toTimeString().substring(0, 5); // HH:MM
}

// Helper to check if a date is a weekend (Saturday or Sunday)
function isWeekend(dateStr) {
  let d;
  if (!dateStr) {
    d = new Date();
  } else {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateStr);
    }
  }
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
}

// Daftar Hari Libur Nasional / Tanggal Merah Indonesia (2026/2027)
const NATIONAL_HOLIDAYS = {
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': "Isra Mi'raj Nabi Muhammad SAW",
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-20': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H',
  '2026-03-22': 'Hari Raya Idul Fitri 1447 H',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-27': 'Hari Raya Idul Adha 1447 H',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan Republik Indonesia',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',
  '2027-01-01': 'Tahun Baru 2027 Masehi',
  '2027-02-06': 'Tahun Baru Imlek 2578 Kongzili',
  '2027-03-10': 'Hari Raya Idul Fitri 1448 H',
  '2027-03-11': 'Hari Raya Idul Fitri 1448 H',
  '2027-05-01': 'Hari Buruh Internasional',
  '2027-08-17': 'Hari Kemerdekaan Republik Indonesia'
};

function getHolidayName(dateStr) {
  const d = dateStr || getTodayString();
  return NATIONAL_HOLIDAYS[d] || null;
}

function isDayOff(dateStr) {
  return isWeekend(dateStr) || !!getHolidayName(dateStr);
}

// Middleware: Require Guru Role for Monitoring & Recaps
function requireGuru(req, res, next) {
  const role = req.headers['x-user-role'] || req.query.role;
  if (role !== 'guru') {
    return res.status(403).json({ error: 'Akses ditolak: Hanya Guru Pembimbing yang berhak mengakses data ini.' });
  }
  next();
}

// ======================== API ROUTES ========================

// 1. Settings
app.get('/api/settings', async (req, res) => {
  res.json(await db.getSettings());
});

// 2. Authentication
// Siswa: Nama & Kelas
// Guru: Nama & Password
app.post('/api/auth/login', async (req, res) => {
  const { role, nama, kelas, password } = req.body;

  if (role === 'guru') {
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password guru wajib diisi' });
    }
    const guru = await db.findTeacherByNameAndPassword(nama, password);
    if (guru) {
      return res.json({ success: true, user: guru, role: 'guru' });
    }
    return res.status(401).json({ success: false, message: 'Nama Guru atau Password salah' });
  }

  // Login Siswa menggunakan Nama dan Kelas
  if (!nama || !kelas) {
    return res.status(400).json({ success: false, message: 'Harap masukkan Nama dan Kelas' });
  }

  const siswa = await db.findStudentByNameAndClass(nama, kelas);
  if (siswa) {
    return res.json({ success: true, user: siswa, role: 'siswa' });
  }

  return res.status(401).json({
    success: false,
    message: 'Data siswa dengan Nama dan Kelas tersebut tidak ditemukan'
  });
});

// 3. Students list (Only accessible by Guru)
app.get('/api/students', requireGuru, async (req, res) => {
  const students = await db.getStudents();
  res.json(students);
});

app.post('/api/students', requireGuru, async (req, res) => {
  const { nama, kelas, jurusan, dudi, alamat_dudi, no_hp, guru_pembimbing } = req.body;
  if (!nama || !kelas || !dudi) {
    return res.status(400).json({ error: 'Nama, Kelas, dan Tempat PKL (DUDI) wajib diisi' });
  }
  const created = await db.addStudent({
    nama,
    kelas,
    jurusan: jurusan || 'Teknik Komputer dan Jaringan',
    dudi,
    alamat_dudi: alamat_dudi || '-',
    no_hp: no_hp || '-',
    guru_pembimbing: guru_pembimbing || 'Nunik Wulan Saptowati, S.T.P.'
  });
  res.json({ success: true, student: created });
});

// 4. Daily Monitoring (Today's Attendances - ONLY GURU)
app.get('/api/attendances/today', requireGuru, async (req, res) => {
  const isTodayWeekend = isWeekend();
  const todayStr = getTodayString();
  const holidayName = getHolidayName(todayStr);
  const isTodayOff = isDayOff(todayStr);

  const list = await db.getAttendanceToday();
  const settings = await db.getSettings();

  const total = list.length;
  const hadir = list.filter(item => item.attendance && item.attendance.status === 'Hadir').length;
  const izinSakit = list.filter(
    item => item.attendance && (item.attendance.status === 'Izin' || item.attendance.status === 'Sakit')
  ).length;
  // Jika hari Sabtu, Minggu, atau Tanggal Merah Libur Nasional: belumAbsen = 0 (tidak dianggap alfa)
  const belumAbsen = isTodayOff ? 0 : list.filter(item => !item.attendance).length;

  res.json({
    tanggal: todayStr,
    isWeekend: isTodayWeekend,
    isHoliday: !!holidayName,
    holidayName: holidayName,
    isDayOff: isTodayOff,
    summary: {
      total,
      hadir,
      izinSakit,
      belumAbsen
    },
    studentsAttendance: list,
    settings
  });
});

// 5. Student Attendance Actions (Clock In, Clock Out, Leave)
// Jam Masuk & Pulang diisi oleh siswa, Waktu submit otomatis dicatat
// Presensi hanya berlaku hari kerja (Senin - Jumat, di luar Tanggal Merah)
// SISWA TIDAK DAPAT ABSEN MASUK / PULANG 2 KALI
app.post('/api/attendances/clock-in', async (req, res) => {
  const todayStr = getTodayString();
  const holidayName = getHolidayName(todayStr);

  if (isWeekend()) {
    return res.status(400).json({
      error: 'Hari ini libur akhir pekan (Sabtu/Minggu). Presensi hanya dapat diisi pada hari kerja (Senin - Jumat).'
    });
  }
  if (holidayName) {
    return res.status(400).json({
      error: `Hari ini Tanggal Merah / Libur Nasional (${holidayName}). Tidak ada presensi PKL.`
    });
  }

  const { student_id, jam_masuk } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'ID Siswa wajib diisi' });
  }

  const currentSubmitTime = getCurrentTime() + ' WIB';
  const finalJamMasuk = jam_masuk || getCurrentTime();

  // Cek apakah siswa sudah pernah absen masuk hari ini (TIDAK BISA ABSEN 2 KALI)
  const existingList = await db.getAttendances();
  const existing = existingList.find(a => a.student_id === student_id && a.tanggal === todayStr);

  if (existing && existing.jam_masuk && existing.jam_masuk !== '-') {
    return res.status(400).json({
      error: 'Anda sudah melakukan absen masuk hari ini. Tidak dapat melakukan absen masuk 2 kali.'
    });
  }
  if (existing && (existing.status === 'Izin' || existing.status === 'Sakit')) {
    return res.status(400).json({
      error: `Anda sudah tercatat ${existing.status} hari ini. Tidak dapat melakukan absen masuk.`
    });
  }

  const record = {
    ...(existing || {}),
    student_id,
    tanggal: todayStr,
    status: 'Hadir',
    jam_masuk: finalJamMasuk,
    waktu_submit_masuk: currentSubmitTime,
    keterangan: ''
  };

  await db.saveAttendance(record);
  res.json({
    success: true,
    message: `Absen masuk berhasil dicatat: Jam ${finalJamMasuk} (Waktu kirim: ${currentSubmitTime})!`,
    record
  });
});

app.post('/api/attendances/clock-out', async (req, res) => {
  const todayStr = getTodayString();
  const holidayName = getHolidayName(todayStr);

  if (isWeekend()) {
    return res.status(400).json({
      error: 'Hari ini libur akhir pekan (Sabtu/Minggu). Presensi hanya dapat diisi pada hari kerja (Senin - Jumat).'
    });
  }
  if (holidayName) {
    return res.status(400).json({
      error: `Hari ini Tanggal Merah / Libur Nasional (${holidayName}). Tidak ada presensi PKL.`
    });
  }

  const { student_id, jam_pulang } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'ID Siswa wajib diisi' });
  }

  const currentSubmitTime = getCurrentTime() + ' WIB';
  const finalJamPulang = jam_pulang || getCurrentTime();

  const existingList = await db.getAttendances();
  const existing = existingList.find(a => a.student_id === student_id && a.tanggal === todayStr);

  if (!existing || !existing.jam_masuk || existing.jam_masuk === '-') {
    return res.status(400).json({ error: 'Anda belum melakukan absen masuk hari ini' });
  }

  // Cek apakah siswa sudah pernah absen pulang hari ini (TIDAK BISA ABSEN 2 KALI)
  if (existing.jam_pulang && existing.jam_pulang !== '-') {
    return res.status(400).json({
      error: 'Anda sudah melakukan absen pulang hari ini. Presensi hari ini sudah lengkap.'
    });
  }

  const record = {
    ...existing,
    jam_pulang: finalJamPulang,
    waktu_submit_pulang: currentSubmitTime
  };

  await db.saveAttendance(record);
  res.json({
    success: true,
    message: `Absen pulang berhasil dicatat: Jam ${finalJamPulang} (Waktu kirim: ${currentSubmitTime})!`,
    record
  });
});

// Leave / Sakit report
app.post('/api/attendances/leave', async (req, res) => {
  const todayStr = getTodayString();
  const holidayName = getHolidayName(todayStr);

  if (isWeekend()) {
    return res.status(400).json({
      error: 'Hari ini libur akhir pekan (Sabtu/Minggu). Pengajuan izin/sakit hanya dapat dilakukan pada hari kerja (Senin - Jumat).'
    });
  }
  if (holidayName) {
    return res.status(400).json({
      error: `Hari ini Tanggal Merah / Libur Nasional (${holidayName}). Tidak perlu mengajukan izin.`
    });
  }

  const { student_id, status, keterangan } = req.body;
  if (!student_id || !status) {
    return res.status(400).json({ error: 'Data izin tidak lengkap' });
  }

  // Cek apakah siswa sudah memiliki catatan presensi hari ini
  const existingList = await db.getAttendances();
  const existing = existingList.find(a => a.student_id === student_id && a.tanggal === todayStr);
  if (existing) {
    return res.status(400).json({
      error: 'Anda sudah memiliki catatan presensi untuk hari ini.'
    });
  }

  const currentSubmitTime = getCurrentTime() + ' WIB';
  const record = {
    student_id,
    tanggal: todayStr,
    status, // 'Izin' | 'Sakit'
    jam_masuk: '-',
    waktu_submit_masuk: currentSubmitTime,
    jam_pulang: '-',
    waktu_submit_pulang: '-',
    keterangan: keterangan || '-'
  };

  await db.saveAttendance(record);
  res.json({ success: true, message: `Laporan ${status} berhasil dicatat (Waktu kirim: ${currentSubmitTime})!`, record });
});

// 6. Attendance Recap & History (ONLY GURU)
app.get('/api/attendances/recap', requireGuru, async (req, res) => {
  const { startDate, endDate } = req.query;
  const students = await db.getStudents();
  const attendances = await db.getAttendances();

  // Hanya perhitungkan hari kerja (Senin - Jumat), abaikan akhir pekan & tanggal merah
  const filtered = attendances.filter(a => {
    if (isDayOff(a.tanggal)) return false;
    if (startDate && a.tanggal < startDate) return false;
    if (endDate && a.tanggal > endDate) return false;
    return true;
  });

  const distinctDates = [...new Set(filtered.map(a => a.tanggal))].filter(d => !isDayOff(d));
  const totalDays = distinctDates.length;

  const summaryPerStudent = students.map(s => {
    const studentAtts = filtered.filter(a => a.student_id === s.id);
    const totalHadir = studentAtts.filter(a => a.status === 'Hadir').length;
    const totalIzin = studentAtts.filter(a => a.status === 'Izin').length;
    const totalSakit = studentAtts.filter(a => a.status === 'Sakit').length;
    const totalAlpha = totalDays > 0 ? Math.max(0, totalDays - (totalHadir + totalIzin + totalSakit)) : 0;
    const persentase = totalDays > 0 ? Math.round((totalHadir / totalDays) * 100) : 100;

    return {
      id: s.id,
      nama: s.nama,
      kelas: s.kelas,
      jurusan: s.jurusan,
      dudi: s.dudi,
      totalHadir,
      totalIzin,
      totalSakit,
      totalAlpha,
      persentase,
      attendances: studentAtts
    };
  });

  res.json({
    dateRange: { startDate, endDate },
    totalStudents: students.length,
    summary: summaryPerStudent,
    allLogs: filtered.map(a => ({
      ...a,
      student: students.find(s => s.id === a.student_id)
    }))
  });
});

// 7. Student's Own Attendance History (Protected to self or guru)
app.get('/api/attendances/student/:id', async (req, res) => {
  const studentId = req.params.id;
  const role = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];

  if (role !== 'guru' && userId && userId !== studentId) {
    return res.status(403).json({ error: 'Akses ditolak: Anda hanya dapat melihat riwayat kehadiran sendiri.' });
  }

  const allAttendances = await db.getAttendances();
  const attendances = allAttendances.filter(a => a.student_id === studentId);
  attendances.sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));
  res.json(attendances);
});

// 8. Excel Export Endpoint (.xlsx - ONLY GURU)
app.get('/api/export/excel', requireGuru, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const students = await db.getStudents();
    const attendances = await db.getAttendances();
    const settings = await db.getSettings();
    const teachers = await db.getTeachers();

    // Hanya perhitungkan hari kerja (Senin - Jumat), abaikan akhir pekan & tanggal merah
    const filtered = attendances.filter(a => {
      if (isDayOff(a.tanggal)) return false;
      if (startDate && a.tanggal < startDate) return false;
      if (endDate && a.tanggal > endDate) return false;
      return true;
    });

    const distinctDates = [...new Set(filtered.map(a => a.tanggal))].filter(d => !isDayOff(d));
    const totalDays = distinctDates.length;

    const summaryData = students.map(s => {
      const studentAtts = filtered.filter(a => a.student_id === s.id);
      const totalHadir = studentAtts.filter(a => a.status === 'Hadir').length;
      const totalIzin = studentAtts.filter(a => a.status === 'Izin').length;
      const totalSakit = studentAtts.filter(a => a.status === 'Sakit').length;
      const totalAlpha = totalDays > 0 ? Math.max(0, totalDays - (totalHadir + totalIzin + totalSakit)) : 0;
      const persentase = totalDays > 0 ? Math.round((totalHadir / totalDays) * 100) : 100;

      return {
        nama: s.nama,
        kelas: s.kelas,
        jurusan: s.jurusan,
        dudi: s.dudi,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlpha,
        persentase
      };
    });

    const detailedData = filtered.map(a => ({
      ...a,
      student: students.find(s => s.id === a.student_id)
    }));

    const buffer = generateAttendanceExcel(summaryData, detailedData, {
      sekolah: settings.nama_sekolah,
      periode: startDate && endDate ? `${startDate} s/d ${endDate}` : 'Bulan Berjalan',
      guru: teachers[0]?.nama || 'Nunik Wulan Saptowati, S.T.P.'
    });

    const filename = `Rekap_Presensi_PKL_${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ error: 'Gagal membuat file Excel' });
  }
});

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app for Vercel Serverless Function
module.exports = app;

// Start Server locally if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Aplikasi Absensi Siswa PKL Siap Berjalan!`);
    console.log(`🌐 Buka di Browser: http://localhost:${PORT}`);
    console.log(`👤 Siswa: Login dengan Nama & Kelas (Hanya untuk Absen)`);
    console.log(`👨‍🏫 Guru: Login dengan Nama & Password (Monitoring & Rekap)`);
    console.log(`====================================================`);
  });
}
