const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Login untuk admin dan pegawai
exports.login = async (req, res) => {
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
      
      pegawaiData = await prisma.simpeg_pegawai.findFirst({
        where: {
          OR: [
            { email: user.email },
            { nip: user.username }
          ]
        },
        select: {
          id_pegawai: true,
          nip: true,
          nama_pegawai: true,
          id_jabatan_struktural: true,
          id_status_pegawai: true
        }
      });
      
      console.log('Pegawai data found:', pegawaiData);
      
      if (pegawaiData) {
        // Ambil data jabatan struktural
        const jabatan = await prisma.simpeg_jabatan_struktural.findUnique({
          where: { id_jabatan_struktural: pegawaiData.id_jabatan_struktural }
        });
        
        console.log('Jabatan found:', jabatan);
        
        if (jabatan) {
          pegawaiData.jabatan = jabatan.nama_jabatan_struktural;
        }
        
        // Ambil data status pegawai
        const statusPegawai = await prisma.simpeg_status_pegawai.findFirst({
          where: { id_status_pegawai: parseInt(pegawaiData.id_status_pegawai) }
        });
        
        console.log('Status pegawai found:', statusPegawai);
        
        if (statusPegawai) {
          pegawaiData.status = statusPegawai.nama_status_pegawai;
        }
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id_user, 
        role: user.level,
        pegawaiId: pegawaiData ? pegawaiData.id_pegawai : null
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
          jabatan: pegawaiData.jabatan || '',
          status: pegawaiData.status || ''
        } : {
          id: null,
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