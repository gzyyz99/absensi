const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = process.env.DATA_DIR || process.env.PERSISTENT_DATA_PATH || path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Helper to get formatted local date (YYYY-MM-DD)
function getTodayString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultData = {
  settings: {
    nama_sekolah: 'SMKN 3 Bogor',
    tahun_ajaran: '2026/2027',
    nama_guru: 'Nunik Wulan Saptowati, S.T.P.'
  },
  teachers: [
    {
      id: 'guru-1',
      nama: 'Nunik Wulan Saptowati, S.T.P.',
      alias: ['nunik', 'nunik wulan', 'nunik wulan saptowati', 'nunik wulan aptowati', 'saptowati', 'guru'],
      password: 'absensi123#',
      role: 'guru'
    }
  ],
  students: [
    // === 1. BANK BJB TAJUR (XII TKJ 1 - 3 SISWA) ===
    {
      id: 'siswa-2',
      nama: 'Abdul Kholik Ramadhan',
      kelas: 'XII TKJ 1',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Bank BJB KCP Tajur',
      alamat_dudi: 'Jl. Raya Tajur, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    {
      id: 'siswa-3',
      nama: 'Pradava Evans Herlambang',
      kelas: 'XII TKJ 1',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Bank BJB KCP Tajur',
      alamat_dudi: 'Jl. Raya Tajur, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    {
      id: 'siswa-4',
      nama: 'Raditya Rasia Purnama',
      kelas: 'XII TKJ 1',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Bank BJB KCP Tajur',
      alamat_dudi: 'Jl. Raya Tajur, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },

    // === 2. BANK BJB SUDIRMAN (XII TKJ 2 - 1 SISWA) ===
    {
      id: 'siswa-5',
      nama: 'Fairuz Izni Nabila',
      alias: ['fairus izni nabila', 'fairuz izni nabila'],
      kelas: 'XII TKJ 2',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Bank BJB KC Sudirman',
      alamat_dudi: 'Jl. Jend. Sudirman No. 13, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },

    // === 3. SISANYA (XII TKJ 3 - 7 SISWA) ===
    // Bank BJB Tanah Sareal
    {
      id: 'siswa-1',
      nama: 'Raden Muhamad Bagir Ramadhan',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Bank BJB KCP Tanah Sareal',
      alamat_dudi: 'Jl. Sholeh Iskandar, Tanah Sareal, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    // Bank BJB Padjajaran
    {
      id: 'siswa-6',
      nama: 'Faathir Azhar Murdilangga',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Bank BJB KCP Padjajaran',
      alamat_dudi: 'Jl. Raya Pajajaran, Baranangsiang, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    // DPRD Kota Bogor (3 Siswa)
    {
      id: 'siswa-7',
      nama: 'Faraulla Ilmira',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'DPRD Kota Bogor',
      alamat_dudi: 'Jl. Pemuda No. 25, Tanah Sareal, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    {
      id: 'siswa-8',
      nama: 'Nashwa Zalifa Gusmi',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'DPRD Kota Bogor',
      alamat_dudi: 'Jl. Pemuda No. 25, Tanah Sareal, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    {
      id: 'siswa-9',
      nama: 'Nazwa Syifa Pratama',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'DPRD Kota Bogor',
      alamat_dudi: 'Jl. Pemuda No. 25, Tanah Sareal, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    // Dinas Pariwisata & Kebudayaan (2 Siswa)
    {
      id: 'siswa-10',
      nama: 'Muhamad Rayhan Riyadi',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Dinas Pariwisata & Kebudayaan Kota Bogor',
      alamat_dudi: 'Jl. Pandu Raya No. 45, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    },
    {
      id: 'siswa-11',
      nama: 'Nur Fadly Erdiansyah',
      kelas: 'XII TKJ 3',
      jurusan: 'Teknik Komputer dan Jaringan',
      dudi: 'Dinas Pariwisata & Kebudayaan Kota Bogor',
      alamat_dudi: 'Jl. Pandu Raya No. 45, Kota Bogor',
      guru_pembimbing: 'Nunik Wulan Saptowati, S.T.P.',
      role: 'siswa'
    }
  ],
  attendances: []
};

// ================= MONGOOSE SCHEMAS =================
const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  alias: [String],
  kelas: { type: String, required: true },
  jurusan: { type: String, required: true },
  dudi: { type: String, required: true },
  alamat_dudi: String,
  guru_pembimbing: String,
  no_hp: String,
  role: { type: String, default: 'siswa' }
});

const teacherSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  alias: [String],
  password: { type: String, required: true },
  role: { type: String, default: 'guru' }
});

const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  tanggal: { type: String, required: true },
  status: { type: String, required: true },
  jam_masuk: String,
  waktu_submit_masuk: String,
  jam_pulang: String,
  waktu_submit_pulang: String,
  keterangan: String,
  created_at: String,
  updated_at: String
});

const settingsSchema = new mongoose.Schema({
  nama_sekolah: String,
  tahun_ajaran: String,
  nama_guru: String
});

const StudentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);
const TeacherModel = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
const AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// Connection cache for Serverless/Vercel
let cachedDb = null;

class Database {
  constructor() {
    this.isMongo = false;
    this.initLocal();
  }

  initLocal() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_PATH)) {
        const seedPath = path.join(__dirname, 'data', 'db.json');
        if (seedPath !== DB_PATH && fs.existsSync(seedPath)) {
          fs.copyFileSync(seedPath, DB_PATH);
        } else {
          this.write(defaultData);
        }
      } else {
        try {
          const cur = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
          if (!cur.students || cur.students.length !== 11 || !cur.students.some(s => s.kelas === 'XII TKJ 1')) {
            this.write(defaultData);
          }
        } catch (e) {
          this.write(defaultData);
        }
      }
    } catch (e) {
      // In serverless / read-only filesystem environments, file write may fail, which is expected
    }
  }

  // Connect to MongoDB Atlas if MONGODB_URI is provided
  async connect() {
    if (!process.env.MONGODB_URI) {
      this.isMongo = false;
      return;
    }

    if (cachedDb && mongoose.connection.readyState === 1) {
      this.isMongo = true;
      return cachedDb;
    }

    try {
      const opts = {
        bufferCommands: false,
      };
      cachedDb = await mongoose.connect(process.env.MONGODB_URI, opts);
      this.isMongo = true;
      console.log('✅ Berhasil terhubung ke MongoDB Atlas Cloud Database');
      await this.seedMongoIfEmpty();
      return cachedDb;
    } catch (err) {
      console.error('⚠️ Gagal terhubung ke MongoDB Atlas, fallback ke data lokal/memori:', err.message);
      this.isMongo = false;
    }
  }

  async seedMongoIfEmpty() {
    try {
      const count = await StudentModel.countDocuments();
      if (count === 0) {
        console.log('🌱 Melakukan inisialisasi awal 11 Siswa SMKN 3 Bogor ke MongoDB...');
        await StudentModel.insertMany(defaultData.students);
        await TeacherModel.insertMany(defaultData.teachers);
        await SettingsModel.create(defaultData.settings);
        await AttendanceModel.insertMany(defaultData.attendances);
        console.log('✅ Inisialisasi data MongoDB selesai.');
      }
    } catch (err) {
      console.error('Error saat seeding MongoDB:', err);
    }
  }

  read() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        this.write(defaultData);
        return defaultData;
      }
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      return defaultData;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      return false;
    }
  }

  async getStudents() {
    if (this.isMongo) {
      return await StudentModel.find().lean();
    }
    const data = this.read();
    return data.students || defaultData.students;
  }

  async getStudentById(id) {
    if (this.isMongo) {
      return await StudentModel.findOne({ id }).lean();
    }
    const students = await this.getStudents();
    return students.find(s => s.id === id);
  }

  async findStudentByNameAndClass(nama, kelas) {
    const students = await this.getStudents();
    const cleanNama = (nama || '').trim().toLowerCase();
    const cleanKelas = (kelas || '').trim().toLowerCase();

    return students.find(s => {
      const matchName =
        s.nama.trim().toLowerCase() === cleanNama ||
        (s.alias && s.alias.some(a => a.toLowerCase() === cleanNama)) ||
        s.nama.toLowerCase().includes(cleanNama) ||
        cleanNama.includes(s.nama.toLowerCase());

      const matchClass =
        !cleanKelas ||
        s.kelas.trim().toLowerCase() === cleanKelas ||
        s.kelas.toLowerCase().includes(cleanKelas) ||
        cleanKelas.includes(s.kelas.toLowerCase()) ||
        cleanKelas === 'xii' ||
        cleanKelas === 'tkj';

      return matchName && matchClass;
    });
  }

  async getTeachers() {
    if (this.isMongo) {
      return await TeacherModel.find().lean();
    }
    const data = this.read();
    return data.teachers || defaultData.teachers;
  }

  async findTeacherByNameAndPassword(nama, password) {
    const teachers = await this.getTeachers();
    const cleanNama = (nama || '').trim().toLowerCase();

    return teachers.find(t => {
      const matchName =
        t.nama.trim().toLowerCase() === cleanNama ||
        (t.alias && t.alias.some(a => a.toLowerCase() === cleanNama)) ||
        t.nama.toLowerCase().includes(cleanNama) ||
        cleanNama.includes('nunik') ||
        cleanNama.includes('guru');

      return matchName && t.password === (password || '').trim();
    });
  }

  async getSettings() {
    if (this.isMongo) {
      const s = await SettingsModel.findOne().lean();
      return s || defaultData.settings;
    }
    const data = this.read();
    return data.settings || defaultData.settings;
  }

  async getAttendances() {
    if (this.isMongo) {
      return await AttendanceModel.find().lean();
    }
    const data = this.read();
    return data.attendances || [];
  }

  async getAttendanceToday() {
    const todayStr = getTodayString(0);
    const students = await this.getStudents();
    let attendances = [];

    if (this.isMongo) {
      attendances = await AttendanceModel.find({ tanggal: todayStr }).lean();
    } else {
      const data = this.read();
      attendances = (data.attendances || []).filter(a => a.tanggal === todayStr);
    }

    return students.map(student => {
      const att = attendances.find(a => a.student_id === student.id);
      return {
        student,
        attendance: att || null,
        statusToday: att ? att.status : 'Belum Absen'
      };
    });
  }

  async saveAttendance(record) {
    if (this.isMongo) {
      const query = { student_id: record.student_id, tanggal: record.tanggal };
      const existing = await AttendanceModel.findOne(query);
      if (existing) {
        await AttendanceModel.updateOne(query, {
          ...record,
          updated_at: new Date().toISOString()
        });
      } else {
        await AttendanceModel.create({
          ...record,
          id: record.id || `att-${Date.now()}`,
          created_at: new Date().toISOString()
        });
      }
      return record;
    }

    const data = this.read();
    const index = (data.attendances || []).findIndex(
      a => a.student_id === record.student_id && a.tanggal === record.tanggal
    );

    if (index >= 0) {
      data.attendances[index] = { ...data.attendances[index], ...record, updated_at: new Date().toISOString() };
    } else {
      if (!data.attendances) data.attendances = [];
      data.attendances.push({
        ...record,
        id: record.id || `att-${Date.now()}`,
        created_at: new Date().toISOString()
      });
    }

    this.write(data);
    return record;
  }

  async addStudent(studentData) {
    const newStudent = {
      ...studentData,
      id: studentData.id || `siswa-${Date.now()}`,
      role: 'siswa'
    };

    if (this.isMongo) {
      await StudentModel.create(newStudent);
      return newStudent;
    }

    const data = this.read();
    if (!data.students) data.students = [];
    data.students.push(newStudent);
    this.write(data);
    return newStudent;
  }
}

module.exports = new Database();
