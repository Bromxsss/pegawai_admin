import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Login untuk admin dan pegawai
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username, password);
    
    // Cari user berdasarkan username
    const user = await prisma.users.findUnique({
      where: { username }
    });
    
    console.log('User found:', user);
    
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }
    
    // Verifikasi password (sebaiknya gunakan bcrypt untuk produksi)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }
    
    // Cek apakah user aktif
    if (user.aktif !== 'Y') {
      return res.status(401).json({ message: 'Akun tidak aktif' });
    }
    
    // Cek apakah user diblokir
    if (user.blokir === 'Y') {
      return res.status(401).json({ message: 'Akun diblokir' });
    }
    
    // Cari data pegawai berdasarkan email atau username (NIP)
    let pegawaiData = null;

    // Jika user adalah admin atau pegawai biasa
    if (user.level === 1 || user.level === 2) {
      console.log('Searching pegawai with email:', user.email, 'or nip:', user.username);

      const whereClause = {
        OR: [
          { nip: user.username }
        ]
      };

      // Add email to the where clause only if it's not null
      if (user.email) {
        whereClause.OR.push({ email_poliban: user.email });
      }

      // ... existing code ...

      pegawaiData = await prisma.simpeg_pegawai.findFirst({
        where: {
          OR: [
            { email_poliban: user.email },
            { nip: user.username }
          ]
        },
        select: {
          id_pegawai: true,
          nama_pegawai: true,
          nip: true,
          // Hapus atau ganti field status dengan field yang benar-benar ada
          jk: true,
          id_agama: true,
          tempat_lahir: true,
          tgl_lahir: true,
          nidn: true,
          no_ktp: true,
          no_kk: true,
          gol_darah: true,
          id_pendidikan: true,
          id_status_hidup: true,
          alamat: true,
          kota: true,
          kode_pos: true,
          id_wil: true,
          id_kabupaten: true,
          id_prov: true,
          handphone: true,
          email_poliban: true,
          id_jabatan_struktural: true,
          id_jabatan_fungsional: true,
          id_riwayat_pangkat: true,
          id_riwayat_pendidikan: true,
          id_status_pegawai: true,
          id_jurusan: true,
          id_bagian: true,
          id_prodi: true,
          foto: true
        }
      });
      // ... existing code ...

      console.log('Pegawai data found:', pegawaiData);

     // ... existing code ...

// ... existing code ...

if (pegawaiData) {
  // Pastikan id_status_pegawai tidak undefined dan memiliki nilai
  if (pegawaiData.id_status_pegawai !== undefined && pegawaiData.id_status_pegawai !== null) {
    // Ambil data status pegawai
    const statusPegawai = await prisma.simpeg_status_pegawai.findFirst({
      where: { id_status_pegawai: parseInt(pegawaiData.id_status_pegawai) }
    });

    console.log('Status pegawai found:', statusPegawai);

    if (statusPegawai) {
      pegawaiData.status = statusPegawai.nama_status_pegawai;
    }
  } else {
    console.log('id_status_pegawai is undefined or null');
  }
}
    }

// ... existing code ...

// ... existing code ...
    
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id_user, 
        role: user.level,
        pegawaiId: pegawaiData ? pegawaiData.id_pegawai : true,
      },
      process.env.JWT_SECRET || 'rahasia',
      { expiresIn: '1d' }
    );
    
    // Buat pesan selamat datang berdasarkan level user
    let welcomeMessage = 'Login berhasil';
    if (user.level === 1) {
      welcomeMessage = 'Selamat login sebagai Admin Pegawai';
    } else if (user.level === 2) {
      welcomeMessage = 'Selamat Anda login sebagai Pegawai';
    }
    
    // Kirim response dengan data yang diminta
    res.json({
      message: welcomeMessage,
      token,
      user: {
        id: user.id_user,
        username: user.username,
        role: user.level,
        nama: user.nama_lengkap,
        pegawai: pegawaiData ? {
          id: pegawaiData.id_pegawai,
          nip: pegawaiData.nip,
          nama: pegawaiData.nama_pegawai,
          jabatan: pegawaiData.jabatan,
          status: pegawaiData.status,
          jk: pegawaiData.jk,
          id_agama: pegawaiData.id_agama,
          tempat_lahir: pegawaiData.tempat_lahir,
          tgl_lahir: pegawaiData.tgl_lahir,
          nidn: pegawaiData.nidn,
          no_ktp: pegawaiData.no_ktp,
          no_kk: pegawaiData.no_kk,
          gol_darah: pegawaiData.gol_darah,
          id_pendidikan: pegawaiData.id_pendidikan,
          id_status_hidup: pegawaiData.id_status_hidup,
          alamat: pegawaiData.alamat,
          kota: pegawaiData.kota,
          kode_pos: pegawaiData.kode_pos,
          id_wil: pegawaiData.id_wil,
          id_kabupaten: pegawaiData.id_kabupaten,
          id_prov: pegawaiData.id_prov,
          handphone: pegawaiData.handphone,
          email_poliban: pegawaiData.email_poliban,
          id_jabatan_struktural: pegawaiData.id_jabatan_struktural,
          id_jabatan_fungsional: pegawaiData.id_jabatan_fungsional,
          id_riwayat_pangkat: pegawaiData.id_riwayat_pangkat,
          id_riwayat_pendidikan: pegawaiData.id_riwayat_pendidikan,
          id_status_pegawai: pegawaiData.id_status_pegawai,
          id_jurusan: pegawaiData.id_jurusan,
          id_bagian: pegawaiData.id_bagian,
          id_prodi: pegawaiData.id_prodi,
          foto: pegawaiData.foto || 'blm_ada_foto.jpg'
        } : {
          id: user.id_user,
          nip: user.username,
          nama: user.nama_lengkap,
          jabatan: user.level === 1 ? 'Administrator' : 'Pegawai',
          status: 'Aktif'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login', error: error.message });
  }
};

export default { login };