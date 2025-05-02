const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi helper untuk memastikan semua field yang diperlukan terisi
const prepareData = (data) => {
  return {
    ...data,
    no_karpeg: data.no_karpeg || "123456",
    gol_darah: data.gol_darah || "O",
    id_pendidikan: data.id_pendidikan || "1",
    no_ktp: data.no_ktp || "",
    no_kk: data.no_kk || "",
    kode_pos: data.kode_pos || "",
    id_kabupaten: data.id_kabupaten || "",
    id_prov: data.id_prov || "",
    id_kab: data.id_kab || "",
    id_kec: data.id_kec || "",
    id_kel: data.id_kel || "",
    handphone: data.handphone || "",
    email_poliban: data.email_poliban || "",
    website: data.website || "",
    id_status_pegawai: data.id_status_pegawai || "",
    foto: data.foto || "default.jpg",
    foto_kartu: data.foto_kartu || "default.jpg",
    foto_ktp: data.foto_ktp || "default.jpg",
    foto_keluarga: data.foto_keluarga || "default.jpg",
    foto_npwp: data.foto_npwp || "default.jpg",
    foto_karpeg: data.foto_karpeg || "default.jpg",
    foto_taspen: data.foto_taspen || "default.jpg",
    foto_karis: data.foto_karis || "default.jpg",
    foto_surat_nikah: data.foto_surat_nikah || "default.jpg",
    foto_nip: data.foto_nip || "default.jpg",
    no_kuota: data.no_kuota || "",
    provider: data.provider || ""
  };
};

// Create - Tambah Pegawai Baru (Admin Only)
exports.create = async (req, res) => {
  try {
    const { 
      nama_pegawai, 
      panggilan, 
      jk, 
      id_agama,
      tempat_lahir,
      tgl_lahir,
      nidn,
      nip_baru,
      email,
      telpon,
      alamat,
      // ... data lainnya
    } = req.body;
    
    // Siapkan data dengan fungsi helper
    const data = prepareData({
      nama_pegawai,
      panggilan,
      jk,
      id_agama,
      tempat_lahir,
      tgl_lahir: new Date(tgl_lahir),
      nidn,
      nip_baru,
      email,
      telpon,
      alamat,
      id_jurusan: 1,
      id_bagian: 1,
      id_prodi: 1,
      id_prodi_mk: "1",
      // ... data lainnya dari req.body
      no_karpeg: req.body.no_karpeg
    });
    
    // Buat pegawai baru dengan data yang sudah disiapkan
    const newPegawai = await prisma.simpeg_pegawai.create({ data });
    
    res.status(201).json({
      message: 'Pegawai berhasil ditambahkan',
      data: newPegawai
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menambahkan pegawai', 
      error: error.message 
    });
  }
};

// ... existing code ...


// Read - Ambil Semua Pegawai
// Read - Ambil Semua Pegawai
exports.getAll = async (req, res) => {
  try {
    // Gunakan raw query untuk menangani tanggal yang tidak valid
    const pegawai = await prisma.$queryRaw`
      SELECT 
        id_pegawai, 
        nama_pegawai, 
        panggilan, 
        jk, 
        tempat_lahir, 
        CASE 
          WHEN MONTH(tgl_lahir) = 0 OR DAY(tgl_lahir) = 0 THEN NULL 
          ELSE tgl_lahir 
        END as tgl_lahir,
        nidn, 
        nip_baru, 
        email, 
        telpon, 
        alamat
      FROM simpeg_pegawai
    `;
    
    res.json(pegawai);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil data pegawai', 
      error: error.message 
    });
  }
};

// Read - Ambil Detail Pegawai berdasarkan ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pegawai = await prisma.simpeg_pegawai. findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    res.json(pegawai);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil detail pegawai', 
      error: error.message 
    });
  }
};

// Update - Perbarui Data Pegawai (Admin)
// Update - Perbarui Data Pegawai (Admin)
// ... existing code ...

// Update - Perbarui Data Pegawai (Admin)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Convert tgl_lahir string to Date object if it exists
    if (updateData.tgl_lahir) {
      updateData.tgl_lahir = new Date(updateData.tgl_lahir);
    }
    
    // Update data pegawai
    const updatedPegawai = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: updateData
    });
    
    res.json({
      message: 'Data pegawai berhasil diperbarui',
      data: updatedPegawai
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat memperbarui data pegawai', 
      error: error.message 
    });
  }
};

// ... existing code ...
// ... existing code ...

// Update - Perbarui Profil Pegawai (Pegawai hanya bisa edit sebagian)
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params; // Ensure id is taken from req.params
    
    // Find pegawai based on id_pegawai
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) } // Ensure id_pegawai is passed correctly
    });
    
    if (!pegawai) {
      return res.status(404).json({ message: 'Profil pegawai tidak ditemukan' });
    }
    
    // Update pegawai
    const { nama_pegawai, panggilan, jk } = req.body;
    const updated = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: { 
        nama_pegawai, 
        panggilan, 
        jk 
      }
    });
    
    res.json({ 
      message: 'Profil berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat memperbarui profil', 
      error: error.message 
    });
  }
};
// In authController.js
// exports.linkUserToPegawai = async (req, res) => {
//   try {
//     const { userId, pegawaiId } = req.body;
    
//     // Update user with ref_user
//     const updatedUser = await prisma.users.update({
//       where: { id_user: parseInt(userId) },
//       data: { ref_user: pegawaiId.toString() }
//     });
    
//     res.json({
//       message: 'Pengguna berhasil dikaitkan dengan pegawai',
//       data: updatedUser
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ 
//       message: 'Terjadi kesalahan saat mengaitkan pengguna dengan pegawai', 
//       error: error.message 
//     });
//   }
// };
// Di controller auth atau user
// Tambahkan fungsi baru di authController.js

// Delete - Hapus Pegawai (Admin Only)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Hapus pegawai
    await prisma.simpeg_pegawai.delete({
      where: { id_pegawai: parseInt(id) }
    });
    
    // Cari dan hapus user terkait jika ada
    const user = await prisma.users.findFirst({
      where: { ref_user: id.toString() }
    });
    
    if (user) {
      await prisma.users.delete({
        where: { id_user: user.id_user }
      });
    }
    
    res.json({ message: 'Pegawai berhasil dihapus' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus pegawai', 
      error: error.message 
    });
  }
};