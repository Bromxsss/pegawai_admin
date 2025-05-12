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
      orderBy: {
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
}; // Added closing bracket and semicolon here

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
      where: { nip: pegawaiData.nip },
      select: {
        id_pegawai: true,
        nip: true,
        nama_pegawai: true
      }
    });
    
    if (existingPegawai) {
      return res.status(400).json({ message: 'NIP sudah terdaftar' });
    }
    
    // Password default bisa menggunakan 6 digit terakhir NIK atau NIP
    const defaultPassword = pegawaiData.no_ktp.slice(-6);
    
    // Hapus field foto1 jika ada dalam data
    if (pegawaiData.foto1) {
      delete pegawaiData.foto1;
    }
    
    // Buat pegawai baru
    const newPegawai = await prisma.simpeg_pegawai.create({
      data: {
        ...pegawaiData,
        id_status_pegawai: pegawaiData.id_status_pegawai.toString() // Pastikan ini adalah string
      }
    });
    
    // Cek apakah username sudah ada
    const existingUser = await prisma.users.findUnique({
      where: { username: pegawaiData.nip }
    });
    
    
    
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
    
    // Pastikan id_status_pegawai adalah string
    if (pegawaiData.id_status_pegawai) {
      pegawaiData.id_status_pegawai = pegawaiData.id_status_pegawai.toString();
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


// Update data non-sensitif (Pegawai)
exports.updateNonSensitiveData = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validasi input
    if (!updateData) {
      return res.status(400).json({ message: 'Data untuk update harus disediakan' });
    }

    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Update data non-sensitif
    const updatedPegawai = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: updateData
    });

    res.json({
      message: 'Data non-sensitif berhasil diperbarui',
      data: updatedPegawai
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui data non-sensitif',
      error: error.message
    });
  }
};

// Request perubahan data sensitif (Pegawai)
exports.requestSensitiveDataChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, newValue, reason } = req.body;

    // Validasi input
    if (!field || !newValue) {
      return res.status(400).json({ message: 'Field dan nilai baru harus diisi' });
    }

    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Buat permintaan perubahan data
    const changeRequest = await prisma.data_change_requests.create({
      data: {
        pegawai_id: parseInt(id),
        field_name: field,
        current_value: pegawai[field]?.toString() || '',
        requested_value: newValue.toString(),
        reason: reason || 'Perubahan data',
        status: 'pending',
        requested_at: new Date()
      }
    });

    res.status(201).json({
      message: 'Permintaan perubahan data berhasil diajukan',
      data: changeRequest
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengajukan perubahan data',
      error: error.message
    });
  }
};

// Mengelola permintaan perubahan data (Admin)
// ... existing code ...
// exports.getDataChangeRequestById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const changeRequest = await prisma.data_change_requests.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         simpeg_pegawai: { // Pastikan nama relasi benar
//           select: {
//             nama_pegawai: true,
//             nip: true
//           }
//         }
//       }
//     });

//     if (!changeRequest) {
//       return res.status(404).json({ message: 'Permintaan perubahan data tidak ditemukan' });
//     }

//     res.json(changeRequest);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({
//       message: 'Terjadi kesalahan saat mengambil detail permintaan perubahan data',
//       error: error.message
//     });
//   }
// };
// ... existing code ...

exports.processDataChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validasi input
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status harus berupa "approved" atau "rejected"' });
    }

    // Cek apakah permintaan perubahan ada
    const changeRequest = await prisma.data_change_requests.findUnique({
      where: { id: parseInt(id) }
    });

    if (!changeRequest) {
      return res.status(404).json({ message: 'Permintaan perubahan data tidak ditemukan' });
    }

    // Update status permintaan
    const updatedRequest = await prisma.data_change_requests.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        admin_notes: adminNotes || '',
        processed_at: new Date()
      }
    });

    // Jika disetujui, update data pegawai
    if (status === 'approved') {
      await prisma.simpeg_pegawai.update({
        where: { id_pegawai: changeRequest.pegawai_id },
        data: {
          [changeRequest.field_name]: changeRequest.requested_value
        }
      });
    }

    res.json({
      message: `Permintaan perubahan data telah ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memproses permintaan perubahan data',
      error: error.message
    });
  }
};



// Mengambil semua permintaan perubahan data
exports.getAllDataChangeRequests = async (req, res) => {
  try {
    const requests = await prisma.data_change_requests.findMany({
      include: {
        simpeg_pegawai: true // relasi ke data pegawai
      },
      orderBy: { requested_at: 'desc' }
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data permintaan', detail: err.message });
  }
};

// Mengambil detail permintaan perubahan data berdasarkan ID

exports.getDataChangeRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const changeRequest = await prisma.data_change_requests.findUnique({
      where: { 
        id: parseInt(id) 
      },
      include: {
        pegawai: {
          select: {
            nama_pegawai: true,
            nip: true
          }
        }
      }
    });

    if (!changeRequest) {
      return res.status(404).json({ 
        message: 'Permintaan perubahan data tidak ditemukan' 
      });
    }

    res.json(changeRequest);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil detail permintaan perubahan data',
      error: error.message
    });
  }
};

