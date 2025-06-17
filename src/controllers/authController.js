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
      where: { 
        username: req.body.username.padEnd(35, ' ') // cocokkan dengan CHAR(35)
       }
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
    if (user.level === 7 || user.level === 6) {
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
        id_pegawai: pegawaiData ? pegawaiData.id_pegawai : true,
      },
      process.env.JWT_SECRET || 'rahasia',
      { expiresIn: '1d' }
    );
    
    // Buat pesan selamat datang berdasarkan level user
    let welcomeMessage = 'Login berhasil';
    if (user.level === 7) {
      welcomeMessage = 'Selamat login sebagai Admin Pegawai';
    } else if (user.level === 6) {
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
        email: user.email,
        pegawai: pegawaiData ? {
          id: pegawaiData.id_pegawai,
          nip: pegawaiData.nip,
          nama: pegawaiData.nama_pegawai,
        } : {
          id: user.id_user,
          nip: user.username,
          nama: user.nama_lengkap,
          jabatan: user.level === 7 ? 'Administrator' : 'Pegawai',
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