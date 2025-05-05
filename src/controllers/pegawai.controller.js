const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil semua pegawai (Admin)
exports.getAllPegawai = async (req, res) => {
  try {
    const pegawai = await prisma.simpeg_pegawai.findMany({
      select: {
        id_pegawai: true,
        nama_pegawai: true,
        nip: true,
        no_ktp: true,
        tgl_lahir: true,
        jk: true,
        id_prov: true,
        id_kabupaten: true,
        kota: true,
        email: true,
        handphone: true,
        id_status_pegawai: true,
        id_jabatan_struktural: true
      },
      include: {
        simpeg_jabatan_struktural: true
      }
    });
    
    // Ambil data provinsi, kabupaten, dan status pegawai
    const pegawaiWithDetails = await Promise.all(pegawai.map(async (p) => {
      const provinsi = await prisma.kol_provinsi.findUnique({
        where: { id_prov: p.id_prov }
      });
      
      const kabupaten = await prisma.kol_kabupaten.findUnique({
        where: { id_kabupaten: p.id_kabupaten }
      });
      
      const statusPegawai = await prisma.simpeg_status_pegawai.findFirst({
        where: { id_status_pegawai: parseInt(p.id_status_pegawai) }
      });
      
      return {
        ...p,
        provinsi: provinsi ? provinsi.nama_prov : null,
        kabupaten: kabupaten ? kabupaten.nama_kabupaten : null,
        status_pegawai: statusPegawai ? statusPegawai.nama_status_pegawai : null
      };
    }));
    
    res.json(pegawaiWithDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil data pegawai', 
      error: error.message 
    });
  }
};

// Ambil detail pegawai (Admin & Pegawai)
exports.getPegawaiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Ambil data tambahan
    const provinsi = await prisma.kol_provinsi.findUnique({
      where: { id_prov: pegawai.id_prov }
    });
    
    const kabupaten = await prisma.kol_kabupaten.findUnique({
      where: { id_kabupaten: pegawai.id_kabupaten }
    });
    
    const statusPegawai = await prisma.simpeg_status_pegawai.findFirst({
      where: { id_status_pegawai: parseInt(pegawai.id_status_pegawai) }
    });
    
    const jabatanStruktural = await prisma.simpeg_jabatan_struktural.findUnique({
      where: { id_jabatan_struktural: pegawai.id_jabatan_struktural }
    });
    
    const pegawaiDetail = {
      ...pegawai,
      provinsi: provinsi ? provinsi.nama_prov : null,
      kabupaten: kabupaten ? kabupaten.nama_kabupaten : null,
      status_pegawai: statusPegawai ? statusPegawai.nama_status_pegawai : null,
      jabatan: jabatanStruktural ? jabatanStruktural.nama_jabatan_struktural : null
    };
    
    res.json(pegawaiDetail);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil detail pegawai', 
      error: error.message 
    });
  }
};

// Tambah pegawai baru (Admin)
// Tambah pegawai baru (Admin)
// ... existing code ...

// Tambah pegawai baru (Admin)
exports.createPegawai = async (req, res) => {
  try {
    const pegawaiData = req.body;
    
    // Validasi data
    if (!pegawaiData.nama_pegawai || !pegawaiData.nip || !pegawaiData.no_ktp) {
      return res.status(400).json({ message: 'Nama, NIP, dan NIK pegawai wajib diisi' });
    }
    
    // Cek apakah NIP sudah terdaftar
    const existingPegawai = await prisma.simpeg_pegawai.findFirst({
      where: { nip: pegawaiData.nip }
    });
    
    if (existingPegawai) {
      return res.status(400).json({ message: 'NIP sudah terdaftar' });
    }
    
    // Password default bisa menggunakan 6 digit terakhir NIK atau NIP
    const defaultPassword = pegawaiData.no_ktp.slice(-6);
    
    // Buat pegawai baru
    const newPegawai = await prisma.simpeg_pegawai.create({
      data: pegawaiData
    });
    
    // Cek apakah username sudah ada
    const existingUser = await prisma.users.findUnique({
      where: { username: pegawaiData.nip }
    });
    
    let userAccount = null;
    
    if (!existingUser) {
      userAccount = await prisma.users.create({
        data: {
          username: pegawaiData.nip,
          password: defaultPassword, // Sebaiknya gunakan bcrypt untuk hash password
          nama_lengkap: pegawaiData.nama_pegawai,
          email: pegawaiData.email || '',
          level: 2, // Level 2 untuk pegawai biasa
          aktif: 'Y',
          blokir: 'N'
        }
      });
    }
    
    res.status(201).json({
      message: 'Pegawai berhasil ditambahkan' + (userAccount ? ' dan akun user dibuat' : ''),
      data: newPegawai,
      userAccount: userAccount ? {
        username: userAccount.username,
        password: defaultPassword, // Hanya untuk demo, jangan tampilkan password di produksi
        role: 'Pegawai'
      } : null
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

// Update pegawai (Admin)
exports.updatePegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const pegawaiData = req.body;
    
    // Cek apakah pegawai ada
    const existingPegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!existingPegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Update pegawai
    const updatedPegawai = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: pegawaiData
    });
    
    // Update user jika ada perubahan pada NIP atau nama
    if (pegawaiData.nip || pegawaiData.nama_pegawai) {
      const user = await prisma.users.findFirst({
        where: { username: existingPegawai.nip }
      });
      
      if (user) {
        const updateData = {};
        
        if (pegawaiData.nip && pegawaiData.nip !== existingPegawai.nip) {
          updateData.username = pegawaiData.nip;
        }
        
        if (pegawaiData.nama_pegawai) {
          updateData.nama_lengkap = pegawaiData.nama_pegawai;
        }
        
        if (Object.keys(updateData).length > 0) {
          await prisma.users.update({
            where: { id_user: user.id_user },
            data: updateData
          });
        }
      }
    }
    
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

// Delete pegawai (Admin)
exports.deletePegawai = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if pegawai exists
    const existingPegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!existingPegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Delete pegawai
    await prisma.simpeg_pegawai.delete({
      where: { id_pegawai: parseInt(id) }
    });
    
    res.json({
      message: 'Pegawai berhasil dihapus'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus pegawai', 
      error: error.message 
    });
  }
};



// ... existing code ...

// Update profil pegawai (Pegawai)
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;
    
    // Cek apakah pegawai ada
    const existingPegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });
    
    if (!existingPegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Cek apakah ada upaya mengubah data yang tidak diizinkan
    if (profileData.nip || profileData.no_ktp || profileData.nama_pegawai) {
      return res.status(403).json({ 
        message: 'Anda tidak diizinkan mengubah NIP, NIK, atau Nama. Silakan hubungi Admin Pegawai untuk perubahan data tersebut.' 
      });
    }
    
    // Hanya izinkan update field tertentu untuk pegawai biasa
    const allowedFields = {
      alamat: profileData.alamat,
      kota: profileData.kota,
      kode_pos: profileData.kode_pos,
      telpon: profileData.telpon,
      handphone: profileData.handphone,
      email: profileData.email,
      website: profileData.website,
      id_prov: profileData.id_prov,
      id_kabupaten: profileData.id_kabupaten,
      email_poliban: profileData.email_poliban
    };
    
    // Hapus field null atau undefined
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined || allowedFields[key] === null) {
        delete allowedFields[key];
      }
    });
    
    // Update profil pegawai
    const updatedProfile = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: allowedFields
    });
    
    console.log(`Pegawai ID ${id} memperbarui profil pada ${new Date().toISOString()}`);
    
    res.json({
      message: 'Profil berhasil diperbarui',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat memperbarui profil', 
      error: error.message 
    });
  }
};