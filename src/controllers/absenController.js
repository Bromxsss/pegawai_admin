import prisma from '../utils/jwt.js';

export const getAllAbsen = async (req, res) => {
  try {
    const absen = await prisma.absen.findMany({
      select: {
        createdAt: true, // Tampilkan tanggal
        status: true,    // Tampilkan status hadir/tidak hadir
        id_pegawai: true // Tampilkan id pegawai
      }
    });
    res.json(absen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createAbsen = async (req, res) => {
  try {
    const { id_pegawai, status } = req.body;

    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: id_pegawai },
      select: {
        nama_pegawai: true,
        nip: true
      }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Tentukan waktu absen berdasarkan status
    const waktuSekarang = new Date();
    let absenData = { id_pegawai, status };

    if (status === 'datang') {
      absenData.waktu_datang = waktuSekarang;
    } else if (status === 'pulang') {
      absenData.waktu_pulang = waktuSekarang;
    }

    const absen = await prisma.absen.create({
      data: absenData
    });

    res.json({
      message: 'Absen berhasil dicatat',
      absen,
      pegawai: {
        nama: pegawai.nama_pegawai,
        nim: pegawai.nip
      }
    });
  } catch (error) {
    console.error('Error in createAbsen:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add this line to export the functions as default
export default { getAllAbsen, createAbsen };