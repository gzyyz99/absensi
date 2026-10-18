const XLSX = require('xlsx');

function generateAttendanceExcel(summaryData, detailedData, metadata = {}) {
  const wb = XLSX.utils.book_new();

  // === SHEET 1: REKAPITULASI SISWA ===
  const summaryHeaders = [
    ['REKAPITULASI KEHADIRAN SISWA PRAKTIK KERJA LAPANGAN (PKL)'],
    [`Sekolah: ${metadata.sekolah || 'SMKN 3 Bogor'}`],
    [`Periode: ${metadata.periode || 'Bulan Berjalan'}`],
    [`Guru Pembimbing: ${metadata.guru || 'Nunik Wulan Saptowati, S.T.P.'}`],
    [`Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    [], // empty line
    [
      'No',
      'Nama Siswa',
      'Kelas',
      'Tempat PKL (DUDI)',
      'Hadir (Hari)',
      'Izin (Hari)',
      'Sakit (Hari)',
      'Alpha / Belum Absen (Hari)',
      'Persentase Kehadiran'
    ]
  ];

  const summaryRows = summaryData.map((s, index) => [
    index + 1,
    s.nama,
    s.kelas,
    s.dudi,
    s.totalHadir,
    s.totalIzin,
    s.totalSakit,
    s.totalAlpha,
    `${s.persentase}%`
  ]);

  const summarySheetData = [...summaryHeaders, ...summaryRows];
  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);

  // Set column widths
  wsSummary['!cols'] = [
    { wch: 5 },  // No
    { wch: 28 }, // Nama
    { wch: 14 }, // Kelas
    { wch: 35 }, // DUDI
    { wch: 14 }, // Hadir
    { wch: 12 }, // Izin
    { wch: 12 }, // Sakit
    { wch: 25 }, // Alpha
    { wch: 20 }  // Persentase
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekap Kehadiran');

  // === SHEET 2: DETAIL LOG HARIAN ===
  const detailHeaders = [
    ['LOG HARIAN PRESENSI SISWA PKL'],
    [`Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`],
    [],
    [
      'No',
      'Tanggal',
      'Nama Siswa',
      'Kelas',
      'Tempat PKL (DUDI)',
      'Status',
      'Jam Masuk (Diisi Siswa)',
      'Waktu Mengisi Masuk',
      'Jam Pulang (Diisi Siswa)',
      'Waktu Mengisi Pulang',
      'Keterangan'
    ]
  ];

  const detailRows = (detailedData || []).map((d, index) => [
    index + 1,
    d.tanggal,
    d.student?.nama || '-',
    d.student?.kelas || '-',
    d.student?.dudi || '-',
    d.status,
    d.jam_masuk || '-',
    d.waktu_submit_masuk || '-',
    d.jam_pulang || '-',
    d.waktu_submit_pulang || '-',
    d.keterangan || '-'
  ]);

  const detailSheetData = [...detailHeaders, ...detailRows];
  const wsDetail = XLSX.utils.aoa_to_sheet(detailSheetData);

  wsDetail['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // Tanggal
    { wch: 26 }, // Nama
    { wch: 12 }, // Kelas
    { wch: 32 }, // DUDI
    { wch: 14 }, // Status
    { wch: 24 }, // Jam Masuk (Diisi Siswa)
    { wch: 22 }, // Waktu Mengisi Masuk
    { wch: 24 }, // Jam Pulang (Diisi Siswa)
    { wch: 22 }, // Waktu Mengisi Pulang
    { wch: 30 }  // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Log Harian');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { generateAttendanceExcel };
