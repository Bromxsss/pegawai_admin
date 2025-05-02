const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token dan role
const auth = (role) => {
  return (req, res, next) => {
    try {
      // Ambil token dari header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
      }
      
      // Format token: "Bearer [token]"
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Format token tidak valid' });
      }
      
      // Debugging logs (moved inside the function where token is defined)
      console.log('Token:', token);
      console.log('JWT_SECRET:', process.env.JWT_SECRET);
      
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Tambahkan data user ke request
      req.user = decoded;
      
      // Cek role jika diperlukan
      if (role) {
        // Admin level = 1, Pegawai level = 2
        const userRole = decoded.level === 1 ? 'admin' : 'pegawai';
        
        if (role !== userRole) {
          return res.status(403).json({ message: 'Akses ditolak' });
        }
      }
      
      // Lanjutkan ke handler berikutnya
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token telah kedaluwarsa' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token tidak valid' });
      }
      res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
  };
};

module.exports = auth;