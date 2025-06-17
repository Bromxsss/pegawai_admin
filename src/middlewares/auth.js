import jwt from 'jsonwebtoken';

// Middleware untuk verifikasi token
export const verifyToken = (req, res, next) => {
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
export const isAdminPegawai = (req, res, next) => {
  if (req.user.role !==6) { // Asumsi role 6 dalah admin pegawai
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin pegawai yang diizinkan.' });
  }
  next();
};


// Middleware untuk memeriksa role pegawai biasa
export const isPegawai = (req, res, next) => {
  if (req.user.role !== 7) { // Asumsi role 2 adalah pegawai biasa
    return res.status(403).json({ message: 'Akses ditolak. Hanya pegawai yang diizinkan.' });
  }
  next();
};

// Middleware untuk memeriksa apakah user adalah pemilik data
export const isOwner = (req, res, next) => {
  const pegawaiId = parseInt(req.params.id_pegawai || req.params.id);

  if (req.user.role === 6) {
    // Admin boleh akses semua data
    return next();
  }

  if (req.user.id_pegawai === pegawaiId) {
    // Pegawai boleh akses data miliknya sendiri
    return next();
  }

  return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk data ini.' });
};
