const prisma = require('../utils/jwt');

exports.getAllAbsen = async (req, res) => {
  try {
    const absen = await prisma.absen.findMany({
      select: {
        createdAt: true, // Tampilkan tanggal
        status: true ,    // Tampilkan status hadir/tidak hadir
        id_pegawai: true, // Tampilkan id pegawai
        
      }
    });
    res.json(absen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createAbsen = async (req, res) => {
  try {
    const { id_pegawai, status } = req.body;

    // Optional: cek pegawai ada atau tidak (biar error lebih manusiawi)
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: id_pegawai }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    const absen = await prisma.absen.create({
      data: { id_pegawai, status }
    });

    res.json(absen);
  } catch (error) {
    console.error('Error in createAbsen:', error); // Ini hanya di server log
    res.status(500).json({ message: 'Internal Server Error' }); // Ini dikirim ke client
  }
};
