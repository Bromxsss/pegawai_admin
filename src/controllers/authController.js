const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { username, password, level = 2 } = req.body;
    
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }
    
    // Cek apakah username sudah ada
    const existingUser = await prisma.users.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Buat user baru
    const user = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        level: parseInt(level),
        aktif: 'Y',
        blokir: 'N'
      }
    });
    
    // Kirim respons sukses tanpa token
    res.status(201).json({ 
      message: 'Registrasi berhasil',
      user: {
        id: user.id_user,
        username: user.username,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi', error: error.message });
  }
};

// Fungsi login tetap menghasilkan token
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }
    
    // Cari user berdasarkan username
    const user = await prisma.users.findUnique({
      where: { username }
    });
    
    // Jika user tidak ditemukan atau password salah
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }
    
    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id_user, 
        level: user.level,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Kirim token ke client
    res.status(200).json({ 
      message: 'Login berhasil',
      token,
      user: {
        id: user.id_user,
        username: user.username,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};