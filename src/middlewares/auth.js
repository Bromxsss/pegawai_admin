const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

// Middleware untuk memeriksa role admin pegawai
exports.isAdminPegawai = (req, res, next) => {
  if (req.user.role !== 1) { // Asumsi role 1 adalah admin pegawai
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin pegawai yang diizinkan.' });
  }
  next();
};

// Middleware untuk memeriksa role pegawai biasa
exports.isPegawai = (req, res, next) => {
  if (req.user.role !== 2) { // Asumsi role 2 adalah pegawai biasa
    return res.status(403).json({ message: 'Akses ditolak. Hanya pegawai yang diizinkan.' });
  }
  next();
};

// Middleware untuk memeriksa apakah user adalah pemilik data
exports.isOwner = (req, res, next) => {
  const pegawaiId = parseInt(req.params.id);
  
  if (req.user.role === 1) { // Admin bisa mengakses semua data
    next();
  } else if (req.user.pegawaiId === pegawaiId) { // Pegawai hanya bisa akses datanya sendiri
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk data ini.' });
  }
};