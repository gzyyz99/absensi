// Client Application Logic for Absensi Siswa PKL (Simplified)

const app = {
  currentUser: null,
  students: [],
  todayData: null,
  activeGuruTab: 'monitoring',
  loginSelectedRole: 'siswa',
  holidays: {
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
    '2026-08-17': 'Hari Kemerdekaan RI',
    '2026-08-25': 'Maulid Nabi Muhammad SAW',
    '2026-12-25': 'Hari Raya Natal'
  },

  getHoliday(dateStr) {
    return this.holidays[dateStr] || null;
  },

  // Helper to format local date YYYY-MM-DD (WIB / Local timezone, NOT UTC)
  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Initialize
  async init() {
    this.startClock();

    // Check saved session
    const saved = localStorage.getItem('absensi_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }

    // Render appropriate view based on auth state
    this.renderCurrentView();

    // Setup recap date inputs default to this month
    const now = new Date();
    const firstDay = this.getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
    const todayStr = this.getLocalDateString(now);
    const sInput = document.getElementById('recapStartDate');
    const eInput = document.getElementById('recapEndDate');
    if (sInput) sInput.value = firstDay;
    if (eInput) eInput.value = todayStr;

    if (window.lucide) lucide.createIcons();
  },

  // Helper for API fetch with auth headers
  async apiFetch(url, options = {}) {
    const headers = options.headers || {};
    if (this.currentUser) {
      headers['x-user-role'] = this.currentUser.role;
      headers['x-user-id'] = this.currentUser.id;
    }
    return fetch(url, { ...options, headers });
  },

  // Real-time Clock
  startClock() {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
      
      const clockEl = document.getElementById('liveClock');
      const dateEl = document.getElementById('liveDate');
      if (clockEl) clockEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  // Switch role tab on login page
  setLoginRole(role) {
    this.loginSelectedRole = role;
    const sBtn = document.getElementById('loginRoleSiswaBtn');
    const gBtn = document.getElementById('loginRoleGuruBtn');
    const formSiswa = document.getElementById('loginFormSiswa');
    const formGuru = document.getElementById('loginFormGuru');
    const noticeText = document.getElementById('loginNoticeText');

    if (role === 'siswa') {
      sBtn.className = 'py-2.5 rounded-xl bg-white shadow-xs text-brand-600 flex items-center justify-center gap-1.5 transition font-bold';
      gBtn.className = 'py-2.5 rounded-xl text-slate-600 flex items-center justify-center gap-1.5 transition font-semibold';
      formSiswa.classList.remove('hidden');
      formGuru.classList.add('hidden');
      noticeText.innerHTML = '<strong>Akses Siswa:</strong> Masukkan Nama dan Kelas Anda untuk melakukan absensi kehadiran.';
    } else {
      gBtn.className = 'py-2.5 rounded-xl bg-white shadow-xs text-brand-600 flex items-center justify-center gap-1.5 transition font-bold';
      sBtn.className = 'py-2.5 rounded-xl text-slate-600 flex items-center justify-center gap-1.5 transition font-semibold';
      formGuru.classList.remove('hidden');
      formSiswa.classList.add('hidden');
      noticeText.innerHTML = '<strong>Akses Guru:</strong> Masukkan Nama Guru dan Password untuk memantau siswa & download rekap Excel.';
      const pwdInput = document.getElementById('loginGuruPassword');
      if (pwdInput) pwdInput.value = '';
    }
    if (window.lucide) lucide.createIcons();
  },

  // Quick fill demo buttons
  async quickFillStudent(nama, kelas) {
    document.getElementById('loginSiswaNama').value = nama;
    document.getElementById('loginSiswaKelas').value = kelas;
    await this.handleStudentLogin();
  },

  async quickFillTeacher(nama, password) {
    document.getElementById('loginGuruNama').value = nama;
    document.getElementById('loginGuruPassword').value = password;
    await this.handleTeacherLogin();
  },

  // Login Siswa (Nama & Kelas)
  async handleStudentLogin(e) {
    if (e) e.preventDefault();
    const nama = document.getElementById('loginSiswaNama').value.trim();
    const kelas = document.getElementById('loginSiswaKelas').value.trim();

    if (!nama || !kelas) {
      this.showToast('Harap isi Nama dan Kelas', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'siswa', nama, kelas })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        localStorage.setItem('absensi_user', JSON.stringify(this.currentUser));
        this.renderCurrentView();
        this.showToast(`Halo, ${this.currentUser.nama}! Silakan lakukan absensi.`, 'success');
      } else {
        this.showToast(data.message || 'Siswa tidak ditemukan, periksa Nama dan Kelas', 'error');
      }
    } catch (err) {
      this.showToast('Gagal menghubungi server', 'error');
    }
  },

  // Login Guru (Nama & Password)
  async handleTeacherLogin(e) {
    if (e) e.preventDefault();
    const nama = document.getElementById('loginGuruNama').value.trim();
    const password = document.getElementById('loginGuruPassword').value.trim();

    if (!nama || !password) {
      this.showToast('Harap isi Nama Guru dan Password', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'guru', nama, password })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        localStorage.setItem('absensi_user', JSON.stringify(this.currentUser));
        this.renderCurrentView();
        this.showToast(`Selamat datang Bapak/Ibu ${this.currentUser.nama}`, 'success');
      } else {
        this.showToast(data.message || 'Nama Guru atau Password salah', 'error');
      }
    } catch (err) {
      this.showToast('Gagal menghubungi server', 'error');
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('absensi_user');
    const pwdInput = document.getElementById('loginGuruPassword');
    if (pwdInput) pwdInput.value = '';
    this.renderCurrentView();
    this.showToast('Anda telah keluar dari sistem', 'info');
  },

  // View Switcher (STRICT ROLE ACCESS)
  renderCurrentView() {
    const viewGuru = document.getElementById('viewGuru');
    const viewSiswa = document.getElementById('viewSiswa');
    const viewLogin = document.getElementById('viewLogin');
    const navUser = document.getElementById('userProfileNav');
    const label = document.getElementById('currentUserLabel');
    const roleBadge = document.getElementById('roleBadge');

    // Case 1: NOT LOGGED IN -> Show Login Form
    if (!this.currentUser) {
      viewGuru.classList.add('hidden');
      viewSiswa.classList.add('hidden');
      viewLogin.classList.remove('hidden');
      navUser.classList.add('hidden');
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Case 2: LOGGED IN
    viewLogin.classList.add('hidden');
    navUser.classList.remove('hidden');
    label.textContent = this.currentUser.nama;

    if (this.currentUser.role === 'guru') {
      // ONLY GURU SEES MONITORING & RECAP
      viewGuru.classList.remove('hidden');
      viewSiswa.classList.add('hidden');

      roleBadge.textContent = 'Guru Pembimbing';
      roleBadge.className = 'text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';

      const guruHeader = document.getElementById('guruNamaHeader');
      if (guruHeader) guruHeader.textContent = this.currentUser.nama;

      this.loadTodayMonitoring();
      this.loadRecapData();
      this.fetchStudents();
    } else {
      // SISWA ONLY SEES ATTENDANCE (NO OTHER STUDENTS VISIBLE)
      viewGuru.classList.add('hidden');
      viewSiswa.classList.remove('hidden');

      roleBadge.textContent = 'Siswa PKL';
      roleBadge.className = 'text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-brand-800 border border-indigo-200';

      this.renderStudentDashboard();
    }

    if (window.lucide) lucide.createIcons();
  },

  // ================= SISWA FEATURES (1-KLIK LANGSUNG TANPA FOTO/JURNAL) =================
  async renderStudentDashboard() {
    const s = this.currentUser;
    if (!s || s.role !== 'siswa') return;

    document.getElementById('siswaNama').textContent = s.nama;
    document.getElementById('siswaKelas').textContent = s.kelas;
    document.getElementById('siswaDudi').textContent = s.dudi;
    document.getElementById('siswaAlamatDudi').textContent = s.alamat_dudi || '-';
    document.getElementById('siswaGuru').textContent = s.guru_pembimbing || 'Nunik Wulan Saptowati, S.T.P.';

    // Fetch ONLY student's own attendance history
    try {
      const res = await this.apiFetch(`/api/attendances/student/${s.id}`);
      if (!res.ok) throw new Error('Akses ditolak');
      const history = await res.json();
      this.renderStudentHistory(history);

      const todayStr = this.getLocalDateString();
      const todayAtt = history.find(a => a.tanggal === todayStr);

      const badge = document.getElementById('badgeStatusHariIni');
      const inputMasuk = document.getElementById('inputJamMasuk');
      const statusMasuk = document.getElementById('siswaStatusMasuk');
      const infoSubmitMasuk = document.getElementById('infoSubmitMasuk');
      const inputPulang = document.getElementById('inputJamPulang');
      const statusPulang = document.getElementById('siswaStatusPulang');
      const infoSubmitPulang = document.getElementById('infoSubmitPulang');
      const btnMasuk = document.getElementById('btnAbsenMasuk');
      const btnPulang = document.getElementById('btnAbsenPulang');

      // Helper for current time in HH:mm
      const getNowHHMM = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      };

      const isWeekendToday = (now.getDay() === 0 || now.getDay() === 6);
      const holidayToday = this.getHoliday(todayStr);

      if (todayAtt) {
        // Attendance status today
        if (todayAtt.status === 'Hadir') {
          // 1. JAM MASUK ALREADY SAVED
          if (inputMasuk) {
            inputMasuk.value = todayAtt.jam_masuk || getNowHHMM();
            inputMasuk.disabled = true;
          }
          if (statusMasuk) {
            statusMasuk.textContent = `Tersimpan (${todayAtt.jam_masuk})`;
            statusMasuk.className = 'text-[11px] font-bold text-emerald-600';
          }
          if (infoSubmitMasuk) {
            infoSubmitMasuk.innerHTML = `<span class="text-emerald-600 font-medium">✓ Jam Masuk: ${todayAtt.jam_masuk}</span> • Submit: <span class="text-slate-600 font-mono font-medium">${todayAtt.waktu_submit_masuk || '-'}</span>`;
          }
          if (btnMasuk) {
            btnMasuk.disabled = true;
            btnMasuk.classList.add('opacity-50', 'pointer-events-none');
            btnMasuk.innerHTML = '<i data-lucide="check-check" class="w-4 h-4"></i> Tersimpan';
          }

          // 2. JAM PULANG
          if (todayAtt.jam_pulang && todayAtt.jam_pulang !== '-') {
            // Already clocked out
            if (inputPulang) {
              inputPulang.value = todayAtt.jam_pulang;
              inputPulang.disabled = true;
            }
            if (statusPulang) {
              statusPulang.textContent = `Selesai PKL (${todayAtt.jam_pulang})`;
              statusPulang.className = 'text-[11px] font-bold text-emerald-600';
            }
            if (infoSubmitPulang) {
              infoSubmitPulang.innerHTML = `<span class="text-emerald-600 font-medium">✓ Jam Pulang: ${todayAtt.jam_pulang}</span> • Submit: <span class="text-slate-600 font-mono font-medium">${todayAtt.waktu_submit_pulang || '-'}</span>`;
            }
            if (btnPulang) {
              btnPulang.disabled = true;
              btnPulang.classList.add('opacity-50', 'pointer-events-none');
              btnPulang.innerHTML = '<i data-lucide="check-check" class="w-4 h-4"></i> Tersimpan';
            }

            badge.textContent = 'Presensi Lengkap Hari Ini';
            badge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800';
          } else {
            // Clock-in done, clock-out ready to be filled
            if (inputPulang) {
              if (!inputPulang.value) inputPulang.value = getNowHHMM();
              inputPulang.disabled = false;
            }
            if (statusPulang) {
              statusPulang.textContent = 'Bisa Diisi';
              statusPulang.className = 'text-[11px] font-semibold text-amber-600';
            }
            if (infoSubmitPulang) {
              infoSubmitPulang.textContent = 'Isi jam pulang Anda saat selesai PKL lalu klik Simpan.';
            }
            if (btnPulang) {
              btnPulang.disabled = false;
              btnPulang.classList.remove('opacity-50', 'pointer-events-none');
              btnPulang.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Simpan Pulang';
            }

            badge.textContent = 'Sedang PKL (Sudah Masuk)';
            badge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800';
          }
        } else {
          // Izin or Sakit
          badge.textContent = `Status: ${todayAtt.status}`;
          badge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800';

          if (inputMasuk) inputMasuk.disabled = true;
          if (btnMasuk) {
            btnMasuk.disabled = true;
            btnMasuk.classList.add('opacity-50', 'pointer-events-none');
          }
          if (statusMasuk) statusMasuk.textContent = todayAtt.status;
          if (infoSubmitMasuk) infoSubmitMasuk.textContent = `Permohonan ${todayAtt.status} tercatat (${todayAtt.keterangan || '-'})`;

          if (inputPulang) inputPulang.disabled = true;
          if (btnPulang) {
            btnPulang.disabled = true;
            btnPulang.classList.add('opacity-50', 'pointer-events-none');
          }
          if (statusPulang) statusPulang.textContent = '-';
        }
      } else if (holidayToday) {
        // HARI LIBUR NASIONAL / TANGGAL MERAH - TIDAK PERLU ABSEN & TIDAK DIANGGAP ALFA
        badge.textContent = `Tanggal Merah: ${holidayToday}`;
        badge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200';

        if (inputMasuk) {
          inputMasuk.value = '--:--';
          inputMasuk.disabled = true;
        }
        if (statusMasuk) {
          statusMasuk.textContent = 'Libur Nasional';
          statusMasuk.className = 'text-[11px] font-semibold text-rose-600';
        }
        if (infoSubmitMasuk) {
          infoSubmitMasuk.innerHTML = `<span class="text-rose-600 font-medium">Hari ini Tanggal Merah (${holidayToday}). Presensi libur.</span>`;
        }
        if (btnMasuk) {
          btnMasuk.disabled = true;
          btnMasuk.classList.add('opacity-50', 'pointer-events-none');
          btnMasuk.innerHTML = '<i data-lucide="coffee" class="w-4 h-4"></i> Libur Nasional';
        }

        if (inputPulang) {
          inputPulang.value = '--:--';
          inputPulang.disabled = true;
        }
        if (statusPulang) {
          statusPulang.textContent = 'Libur Nasional';
          statusPulang.className = 'text-[11px] font-semibold text-rose-600';
        }
        if (infoSubmitPulang) {
          infoSubmitPulang.innerHTML = '<span class="text-slate-400">Tidak ada presensi di tanggal merah.</span>';
        }
        if (btnPulang) {
          btnPulang.disabled = true;
          btnPulang.classList.add('opacity-50', 'pointer-events-none');
          btnPulang.innerHTML = '<i data-lucide="coffee" class="w-4 h-4"></i> Libur Nasional';
        }
      } else if (isWeekendToday) {
        // HARI LIBUR AKHIR PEKAN (SABTU & MINGGU) - TIDAK PERLU ABSEN & TIDAK DIANGGAP ALFA
        badge.textContent = 'Libur Akhir Pekan (Sabtu / Minggu)';
        badge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200';

        if (inputMasuk) {
          inputMasuk.value = '--:--';
          inputMasuk.disabled = true;
        }
        if (statusMasuk) {
          statusMasuk.textContent = 'Libur PKL';
          statusMasuk.className = 'text-[11px] font-semibold text-slate-500';
        }
        if (infoSubmitMasuk) {
          infoSubmitMasuk.innerHTML = '<span class="text-slate-500 font-medium">Hari ini Libur Akhir Pekan (Sabtu/Minggu). Presensi PKL aktif Senin s/d Jumat.</span>';
        }
        if (btnMasuk) {
          btnMasuk.disabled = true;
          btnMasuk.classList.add('opacity-50', 'pointer-events-none');
          btnMasuk.innerHTML = '<i data-lucide="coffee" class="w-4 h-4"></i> Libur Akhir Pekan';
        }

        if (inputPulang) {
          inputPulang.value = '--:--';
          inputPulang.disabled = true;
        }
        if (statusPulang) {
          statusPulang.textContent = 'Libur PKL';
          statusPulang.className = 'text-[11px] font-semibold text-slate-500';
        }
        if (infoSubmitPulang) {
          infoSubmitPulang.innerHTML = '<span class="text-slate-400">Tidak ada presensi di hari libur.</span>';
        }
        if (btnPulang) {
          btnPulang.disabled = true;
          btnPulang.classList.add('opacity-50', 'pointer-events-none');
          btnPulang.innerHTML = '<i data-lucide="coffee" class="w-4 h-4"></i> Libur Akhir Pekan';
        }
      } else {
        // Belum Absen sama sekali hari ini (Senin - Jumat)
        badge.textContent = 'Belum Absen Hari Ini';
        badge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800';

        if (inputMasuk) {
          if (!inputMasuk.value) inputMasuk.value = getNowHHMM();
          inputMasuk.disabled = false;
        }
        if (statusMasuk) {
          statusMasuk.textContent = 'Belum Disimpan';
          statusMasuk.className = 'text-[11px] font-semibold text-slate-400';
        }
        if (infoSubmitMasuk) {
          infoSubmitMasuk.textContent = 'Isi jam masuk Anda, lalu klik Simpan Masuk.';
        }
        if (btnMasuk) {
          btnMasuk.disabled = false;
          btnMasuk.classList.remove('opacity-50', 'pointer-events-none');
          btnMasuk.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Simpan Masuk';
        }

        if (inputPulang) {
          inputPulang.disabled = true;
        }
        if (statusPulang) {
          statusPulang.textContent = 'Menunggu Jam Masuk';
          statusPulang.className = 'text-[11px] font-semibold text-slate-400';
        }
        if (infoSubmitPulang) {
          infoSubmitPulang.textContent = 'Simpan jam masuk terlebih dahulu.';
        }
        if (btnPulang) {
          btnPulang.disabled = true;
          btnPulang.classList.add('opacity-50', 'pointer-events-none');
          btnPulang.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Simpan Pulang';
        }
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    }
  },

  // Simpan Absen Masuk (Jam Masuk diisi Siswa, Waktu Submit Otomatis)
  async doClockIn() {
    const inputMasuk = document.getElementById('inputJamMasuk');
    const jam_masuk = inputMasuk ? inputMasuk.value.trim() : '';

    if (!jam_masuk) {
      this.showToast('Silakan isi jam masuk PKL terlebih dahulu', 'warning');
      return;
    }

    const btn = document.getElementById('btnAbsenMasuk');
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menyimpan...';

    try {
      const res = await this.apiFetch('/api/attendances/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: this.currentUser.id,
          jam_masuk
        })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message || 'Presensi masuk berhasil disimpan!', 'success');
        await this.renderStudentDashboard();
      } else {
        this.showToast(data.error || 'Gagal menyimpan jam masuk', 'error');
      }
    } catch (err) {
      this.showToast('Gagal menghubungi server', 'error');
    } finally {
      if (window.lucide) lucide.createIcons();
    }
  },

  // Simpan Absen Pulang (Jam Pulang diisi Siswa, Waktu Submit Otomatis)
  async doClockOut() {
    const inputPulang = document.getElementById('inputJamPulang');
    const jam_pulang = inputPulang ? inputPulang.value.trim() : '';

    if (!jam_pulang) {
      this.showToast('Silakan isi jam pulang PKL terlebih dahulu', 'warning');
      return;
    }

    const btn = document.getElementById('btnAbsenPulang');
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menyimpan...';

    try {
      const res = await this.apiFetch('/api/attendances/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: this.currentUser.id,
          jam_pulang
        })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message || 'Presensi pulang berhasil disimpan!', 'success');
        await this.renderStudentDashboard();
      } else {
        this.showToast(data.error || 'Gagal menyimpan jam pulang', 'error');
      }
    } catch (err) {
      this.showToast('Gagal menghubungi server', 'error');
    } finally {
      if (window.lucide) lucide.createIcons();
    }
  },

  // Leave / Sakit modal
  openLeaveModal() {
    const todayStr = this.getLocalDateString();
    const holidayToday = this.getHoliday(todayStr);
    const now = new Date();
    if (now.getDay() === 0 || now.getDay() === 6) {
      this.showToast('Hari ini Libur Akhir Pekan. Pengajuan izin/sakit hanya berlaku pada hari Senin s/d Jumat.', 'info');
      return;
    }
    if (holidayToday) {
      this.showToast(`Hari ini Tanggal Merah (${holidayToday}). Tidak perlu mengajukan izin/sakit.`, 'info');
      return;
    }
    document.getElementById('leaveModal').classList.remove('hidden');
  },

  closeLeaveModal() {
    document.getElementById('leaveModal').classList.add('hidden');
  },

  async handleLeaveSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('leaveType').value;
    const reason = document.getElementById('leaveReason').value.trim();

    try {
      const res = await this.apiFetch('/api/attendances/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: this.currentUser.id,
          status: type,
          keterangan: reason
        })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, 'success');
        this.closeLeaveModal();
        await this.renderStudentDashboard();
      } else {
        this.showToast(data.error || 'Gagal mengirim permohonan', 'error');
      }
    } catch (err) {
      this.showToast('Gagal menghubungi server', 'error');
    }
  },

  renderStudentHistory(history) {
    const list = document.getElementById('studentHistoryList');
    if (!list) return;
    list.innerHTML = '';

    if (!history || history.length === 0) {
      list.innerHTML = '<p class="text-center text-xs text-slate-400 py-6">Belum ada riwayat kehadiran.</p>';
      return;
    }

    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition space-y-2';

      let statusBadge = '<span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Hadir</span>';
      if (item.status === 'Izin') statusBadge = '<span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Izin</span>';
      if (item.status === 'Sakit') statusBadge = '<span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">Sakit</span>';

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-brand-600"></i> ${item.tanggal}
          </div>
          <div>${statusBadge}</div>
        </div>
        <div class="grid grid-cols-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 gap-2">
          <div>
            <div class="text-[10px] text-slate-400">Jam Masuk (Diisi):</div>
            <div class="font-bold text-slate-800 font-mono">${item.jam_masuk || '-'}</div>
            ${item.waktu_submit_masuk ? `<div class="text-[9px] text-slate-400">Submit: ${item.waktu_submit_masuk}</div>` : ''}
          </div>
          <div>
            <div class="text-[10px] text-slate-400">Jam Pulang (Diisi):</div>
            <div class="font-bold text-slate-800 font-mono">${item.jam_pulang || '-'}</div>
            ${item.waktu_submit_pulang && item.waktu_submit_pulang !== '-' ? `<div class="text-[9px] text-slate-400">Submit: ${item.waktu_submit_pulang}</div>` : ''}
          </div>
        </div>
        ${item.keterangan ? `
          <div class="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
            <strong>Keterangan:</strong> ${item.keterangan}
          </div>
        ` : ''}
      `;
      list.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  },

  // ================= GURU FEATURES =================
  setGuruTab(tabName) {
    if (this.currentUser?.role !== 'guru') return;

    this.activeGuruTab = tabName;
    const tabMon = document.getElementById('guruTabMonitoring');
    const tabRek = document.getElementById('guruTabRekap');
    const tabSis = document.getElementById('guruTabSiswa');

    const btnMon = document.getElementById('tabBtnMonitoring');
    const btnRek = document.getElementById('tabBtnRekap');
    const btnSis = document.getElementById('tabBtnSiswa');

    tabMon.classList.toggle('hidden', tabName !== 'monitoring');
    tabRek.classList.toggle('hidden', tabName !== 'rekap');
    tabSis.classList.toggle('hidden', tabName !== 'siswa');

    const activeClass = 'pb-3 border-b-2 border-brand-600 text-brand-600 flex items-center gap-2';
    const inactiveClass = 'pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2';

    btnMon.className = tabName === 'monitoring' ? activeClass : inactiveClass;
    btnRek.className = tabName === 'rekap' ? activeClass : inactiveClass;
    btnSis.className = tabName === 'siswa' ? activeClass : inactiveClass;

    if (tabName === 'rekap') this.loadRecapData();
    if (tabName === 'siswa') this.renderMasterStudentsTable();
    if (window.lucide) lucide.createIcons();
  },

  async fetchStudents() {
    if (this.currentUser?.role !== 'guru') return;
    try {
      const res = await this.apiFetch('/api/students');
      if (res.ok) {
        this.students = await res.json();
        this.renderMasterStudentsTable();
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  },

  async loadTodayMonitoring() {
    if (this.currentUser?.role !== 'guru') return;
    try {
      const res = await this.apiFetch('/api/attendances/today?_t=' + Date.now());
      if (!res.ok) throw new Error('Akses ditolak');
      this.todayData = await res.json();

      // Render summary stats (Tanpa terlambat)
      document.getElementById('statTotal').textContent = this.todayData.summary.total;
      document.getElementById('statHadir').textContent = this.todayData.summary.hadir;
      let belumLabel = this.todayData.summary.belumAbsen;
      if (this.todayData.isHoliday) {
        belumLabel = `0 (Libur: ${this.todayData.holidayName})`;
      } else if (this.todayData.isWeekend) {
        belumLabel = '0 (Libur)';
      }
      document.getElementById('statBelum').textContent = belumLabel;

      this.filterTodayTable();
    } catch (err) {
      console.error('Failed to load today monitoring:', err);
    }
  },

  filterTodayTable() {
    if (!this.todayData || this.currentUser?.role !== 'guru') return;
    const query = (document.getElementById('searchTodayInput').value || '').toLowerCase();
    const statusFilter = document.getElementById('filterStatusToday').value;

    const tbody = document.getElementById('todayAttendanceTableBody');
    tbody.innerHTML = '';

    const list = this.todayData.studentsAttendance.filter(item => {
      const studentMatch =
        item.student.nama.toLowerCase().includes(query) ||
        item.student.dudi.toLowerCase().includes(query) ||
        item.student.kelas.toLowerCase().includes(query);

      let statusMatch = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Belum Absen') {
          statusMatch = !item.attendance;
        } else if (statusFilter === 'Hadir') {
          statusMatch = item.attendance && item.attendance.status === 'Hadir';
        } else if (statusFilter === 'Izin') {
          statusMatch = item.attendance && (item.attendance.status === 'Izin' || item.attendance.status === 'Sakit');
        }
      }

      return studentMatch && statusMatch;
    });

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400 text-xs">
            Tidak ada data presensi yang sesuai kriteria filter.
          </td>
        </tr>
      `;
      return;
    }

    list.forEach(item => {
      const s = item.student;
      const att = item.attendance;
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';

      let statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Belum Absen</span>';
      if (att) {
        if (att.status === 'Hadir') {
          statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Hadir</span>';
        } else if (att.status === 'Izin') {
          statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Izin</span>';
        } else if (att.status === 'Sakit') {
          statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Sakit</span>';
        }
      }

      let submitInfo = '<span class="text-slate-300 text-xs">-</span>';
      if (att) {
        const masukSubmit = att.waktu_submit_masuk ? `<div><span class="text-[10px] text-slate-400">Masuk:</span> <span class="font-bold text-slate-700 font-mono">${att.waktu_submit_masuk}</span></div>` : '';
        const pulangSubmit = att.waktu_submit_pulang && att.waktu_submit_pulang !== '-' ? `<div><span class="text-[10px] text-slate-400">Pulang:</span> <span class="font-bold text-slate-700 font-mono">${att.waktu_submit_pulang}</span></div>` : '';
        if (masukSubmit || pulangSubmit) {
          submitInfo = `<div class="text-[11px] space-y-0.5 text-center">${masukSubmit}${pulangSubmit}</div>`;
        }
      }

      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-900">
          ${s.nama}
        </td>
        <td class="py-3 px-4 text-xs text-slate-600">
          <span class="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-brand-700 font-bold border border-indigo-100">${s.kelas}</span>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-800 text-xs">${s.dudi}</div>
          <div class="text-[11px] text-slate-400 truncate max-w-xs">${s.alamat_dudi || '-'}</div>
        </td>
        <td class="py-3 px-4 font-mono text-xs font-semibold text-slate-700 text-center">
          ${att ? att.jam_masuk : '-'}
        </td>
        <td class="py-3 px-4 font-mono text-xs font-semibold text-slate-700 text-center">
          ${att && att.jam_pulang ? att.jam_pulang : '-'}
        </td>
        <td class="py-3 px-4 text-center">
          ${statusBadge}
          ${att && att.keterangan ? `<div class="text-[11px] text-slate-500 mt-1">${att.keterangan}</div>` : ''}
        </td>
        <td class="py-3 px-4 text-center">
          ${submitInfo}
        </td>
      `;

      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  },

  async loadRecapData() {
    if (this.currentUser?.role !== 'guru') return;
    try {
      const sDate = document.getElementById('recapStartDate').value;
      const eDate = document.getElementById('recapEndDate').value;
      let url = '/api/attendances/recap';
      if (sDate && eDate) {
        url += `?startDate=${sDate}&endDate=${eDate}`;
      }

      const res = await this.apiFetch(url);
      if (!res.ok) return;
      const data = await res.json();

      const label = document.getElementById('recapPeriodLabel');
      if (label && sDate && eDate) {
        label.textContent = `Periode: ${sDate} s/d ${eDate}`;
      }

      // Summary Table
      const summaryBody = document.getElementById('recapSummaryTableBody');
      summaryBody.innerHTML = '';

      data.summary.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';

        let colorClass = 'bg-emerald-500';
        if (s.persentase < 75) colorClass = 'bg-rose-500';
        else if (s.persentase < 85) colorClass = 'bg-amber-500';

        tr.innerHTML = `
          <td class="py-3 px-4 text-slate-400 font-mono text-xs">${idx + 1}</td>
          <td class="py-3 px-4 font-bold text-slate-900">${s.nama}</td>
          <td class="py-3 px-4 text-xs text-slate-600">${s.kelas}</td>
          <td class="py-3 px-4 text-xs font-medium text-slate-700">${s.dudi}</td>
          <td class="py-3 px-4 text-center font-bold text-emerald-600">${s.totalHadir}</td>
          <td class="py-3 px-4 text-center font-semibold text-blue-600">${s.totalIzin}</td>
          <td class="py-3 px-4 text-center font-semibold text-rose-500">${s.totalSakit}</td>
          <td class="py-3 px-4 text-center font-semibold text-slate-400">${s.totalAlpha}</td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <div class="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="${colorClass} h-2 rounded-full" style="width: ${s.persentase}%"></div>
              </div>
              <span class="text-xs font-bold text-slate-700">${s.persentase}%</span>
            </div>
          </td>
        `;
        summaryBody.appendChild(tr);
      });

      // Detail Logs Table
      const detailBody = document.getElementById('recapDetailLogsBody');
      detailBody.innerHTML = '';
      (data.allLogs || []).forEach(log => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';

        let badge = '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Hadir</span>';
        if (log.status === 'Izin') badge = '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Izin</span>';
        if (log.status === 'Sakit') badge = '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">Sakit</span>';

        tr.innerHTML = `
          <td class="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">${log.tanggal}</td>
          <td class="py-3 px-4 font-bold text-xs text-slate-900">${log.student?.nama || '-'}</td>
          <td class="py-3 px-4 text-xs text-slate-600"><span class="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-brand-700 font-bold border border-indigo-100">${log.student?.kelas || '-'}</span></td>
          <td class="py-3 px-4 text-xs text-slate-600">${log.student?.dudi || '-'}</td>
          <td class="py-3 px-4 font-mono text-xs text-slate-600">
            <span class="font-bold text-slate-700">${log.jam_masuk || '-'}</span>
            ${log.waktu_submit_masuk ? `<div class="text-[10px] text-slate-400 font-sans">Submit: ${log.waktu_submit_masuk}</div>` : ''}
          </td>
          <td class="py-3 px-4 font-mono text-xs text-slate-600">
            <span class="font-bold text-slate-700">${log.jam_pulang || '-'}</span>
            ${log.waktu_submit_pulang && log.waktu_submit_pulang !== '-' ? `<div class="text-[10px] text-slate-400 font-sans">Submit: ${log.waktu_submit_pulang}</div>` : ''}
          </td>
          <td class="py-3 px-4">${badge}</td>
          <td class="py-3 px-4 text-xs text-slate-600">${log.keterangan || '-'}</td>
        `;
        detailBody.appendChild(tr);
      });

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error('Failed to load recap data:', err);
    }
  },

  downloadExcelRecap() {
    if (this.currentUser?.role !== 'guru') {
      this.showToast('Hanya guru yang berhak mendownload rekap', 'warning');
      return;
    }
    const sDate = document.getElementById('recapStartDate')?.value || '';
    const eDate = document.getElementById('recapEndDate')?.value || '';
    let url = `/api/export/excel?role=guru`;
    if (sDate && eDate) {
      url += `&startDate=${sDate}&endDate=${eDate}`;
    }
    window.location.href = url;
    this.showToast('Mengunduh file Excel Rekap Presensi PKL...', 'info');
  },

  renderMasterStudentsTable() {
    const tbody = document.getElementById('studentsMasterTableBody');
    if (!tbody || this.currentUser?.role !== 'guru') return;
    tbody.innerHTML = '';

    this.students.forEach(s => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';
      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-900 text-sm">${s.nama}</td>
        <td class="py-3 px-4 text-xs text-slate-600">${s.kelas} • ${s.jurusan}</td>
        <td class="py-3 px-4 font-medium text-brand-700 text-xs">${s.dudi}</td>
        <td class="py-3 px-4 text-xs text-slate-500">${s.alamat_dudi || '-'}</td>
        <td class="py-3 px-4 text-xs font-mono text-slate-600">${s.no_hp || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  openAddStudentModal() {
    document.getElementById('addStudentModal').classList.remove('hidden');
  },

  closeAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('hidden');
  },

  async handleAddStudent(e) {
    e.preventDefault();
    const payload = {
      nama: document.getElementById('newSiswaNama').value.trim(),
      kelas: document.getElementById('newSiswaKelas').value.trim(),
      jurusan: document.getElementById('newSiswaJurusan').value.trim(),
      dudi: document.getElementById('newSiswaDudi').value.trim(),
      alamat_dudi: document.getElementById('newSiswaAlamat').value.trim(),
      no_hp: document.getElementById('newSiswaHp').value.trim(),
      guru_pembimbing: this.currentUser?.nama || 'Budi Santoso'
    };

    try {
      const res = await this.apiFetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('Siswa berhasil ditambahkan!', 'success');
        this.closeAddStudentModal();
        await this.fetchStudents();
        await this.loadTodayMonitoring();
      } else {
        this.showToast(data.error || 'Gagal menambahkan siswa', 'error');
      }
    } catch (err) {
      this.showToast('Gagal menghubungi server', 'error');
    }
  },

  // Toast Notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgMap = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
      warning: 'bg-amber-500 text-white',
      info: 'bg-slate-800 text-white'
    };

    toast.className = `${bgMap[type] || bgMap.info} px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 transform translate-y-2 opacity-0 transition-all duration-200 pointer-events-auto`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }
};

// Auto boot on load
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
