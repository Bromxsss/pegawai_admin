const prisma = require('../utils/jwt');

exports.getAllAktivitas = async (req, res) => {
  const aktivitas = await prisma.aktivitas_kelas.findMany({ include: { pegawai: true } });
  res.json(aktivitas);
};

exports.createAktivitas = async (req, res) => {
  const { id_pegawai, nama_kelas, aktivitas } = req.body;
  const data = await prisma.aktivitas_kelas.create({
    data: { id_pegawai, nama_kelas, aktivitas }
  });
  res.json(data);
};
