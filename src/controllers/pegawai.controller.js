import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { darahMapping, pendidikanMapping, statusHidupMapping, jurusanMapping, jkMapping, kabupatenMapping, agamaMapping, wilayahMapping } from './mappings.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';



// Mendapatkan direktori saat ini dalam ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer to use the uploads directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
export { upload };

// // Middleware untuk menangani upload foto

// Ambil semua pegawai (Admin)
export const getAllPegawai = async (req, res) => {
  try {
    const pegawai = await prisma.simpeg_pegawai.findMany({
      include: {
        kol_jk: { select: { id_jk: true, nama_jk: true } },
        kol_agama: { select: { id_agama: true, nama_agama: true } },
        kol_darah: { select: { id_darah: true, nama_darah: true } },
        kol_pendidikan: { select: { id_pendidikan: true, nama_pendidikan: true } },
        kol_status_hidup: { select: { id_status_hidup: true, nama_status_hidup: true } },
        kol_wilayah: { select: { id_wil: true, nm_wil: true } },
        kol_kabupaten: { select: { id_kabupaten: true, nama_kabupaten: true } },
        kol_provinsi: { select: { id_prov: true, nama_prov: true } },
        simpeg_jabatan_struktural: { select: { id_jabatan_struktural: true, nama_jabatan_struktural: true } },
        simpeg_jabatan_fungsional: { select: { id_jabatan_fungsional: true, nama_jabatan_fungsional: true } },
        simpeg_status_pegawai: { select: { id_status_pegawai: true, nama_status_pegawai: true } },
        kol_jurusan: { select: { id_jurusan: true, nama_jurusan: true } },
        simpeg_bagian: { select: { id_bagian: true, nama_bagian: true } },
        kol_prodi: { select: { id_prodi: true, nama_prodi: true } },

        // Perbaikan di sini, hanya pakai select dan nested select untuk relasi
        simpeg_riwayat_pangkat: {
          select: {
            // field biasa
            id_riwayat_pangkat: true,
            
            // ...
            // relasi nested
            simpeg_pangkat_gol_ruang: {
              select: {
                id_pangkat_gol_ruang: true,
                nama_pangkat_gol_ruang: true,
              }
            }
          }
        },

        simpeg_riwayat_pendidikan: {
          select: {
            id_riwayat_pendidikan: true,
            id_pegawai: true,
            thn_masuk: true,
            thn_lulus: true,
            tempat: true,
            simpeg_level_pendidikan: {
              select: {
                id_level_pendidikan: true,
                nama_level_pendidikan: true
              }
            }
          }
        }
      }
    });
 
    res.json(pegawai);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data pegawai',
      error: error.message
    });
  }
};





// Tambah pegawai baru (Admin)
// Tambah pegawai baru (Admin)
export const createPegawai = async (req, res) => {
  try {
    console.log('Data yang diterima:', req.body);
    const pegawaiData = req.body;
    const foto = req.file ? req.file.filename : null;
    pegawaiData.foto = foto;

   // Validasi panjang NIP
   if (pegawaiData.nip.length < 18) {
    return res.status(400).json({ message: 'NIP harus tepat 18 karakter, saat ini kurang dari 18 karakter' });
  } else if (pegawaiData.nip.length > 18) {
    return res.status(400).json({ message: 'NIP harus tepat 18 karakter, saat ini lebih dari 18 karakter' });
  }

    // Konversi ID dari String ke Int
    pegawaiData.jk = parseInt(pegawaiData.jk);
    pegawaiData.id_agama = parseInt(pegawaiData.id_agama);
    pegawaiData.gol_darah = parseInt(pegawaiData.gol_darah);
    pegawaiData.id_pendidikan = parseInt(pegawaiData.id_pendidikan);
    pegawaiData.id_riwayat_pangkat = parseInt(pegawaiData.id_riwayat_pangkat);
    pegawaiData.id_pendidikan = pegawaiData.id_pendidikan.toString(); // ✅

    pegawaiData.id_status_pegawai = parseInt(pegawaiData.id_status_pegawai);
    pegawaiData.id_status_hidup = parseInt(pegawaiData.id_status_hidup); // Konversi ke Int
    pegawaiData.id_wil = pegawaiData.id_wil.toString(); // Pastikan ini adalah String
    pegawaiData.id_kabupaten = pegawaiData.id_kabupaten.toString();
    pegawaiData.id_prov = pegawaiData.id_prov.toString();
    pegawaiData.id_bagian = parseInt(pegawaiData.id_bagian);
    pegawaiData.id_jurusan = parseInt(pegawaiData.id_jurusan);
    pegawaiData.id_prodi = parseInt(pegawaiData.id_prodi);
    pegawaiData.id_jabatan_struktural = parseInt(pegawaiData.id_jabatan_struktural);
    pegawaiData.id_jabatan_fungsional = parseInt(pegawaiData.id_jabatan_fungsional);

    // Validasi data
    if (!pegawaiData || !pegawaiData.nama_pegawai || !pegawaiData.nip || !pegawaiData.no_ktp || !pegawaiData.id_agama || !pegawaiData.id_wil) {
      return res.status(400).json({ message: 'Nama, NIP, NIK, id_agama, dan id_wil wajib diisi' });
    }

    // Cek apakah wilayah ada
    const existingWilayah = await prisma.kol_wilayah.findUnique({
      where: { id_wil: pegawaiData.id_wil }
    });

    if (!existingWilayah) {
      return res.status(400).json({ message: 'Wilayah tidak ditemukan' });
    }

    // Cek apakah jurusan ada
    if (pegawaiData.id_jurusan) {
      const existingJurusan = await prisma.kol_jurusan.findUnique({
        where: { id_jurusan: pegawaiData.id_jurusan }
      });

      if (!existingJurusan) {
        return res.status(400).json({ message: 'Jurusan tidak ditemukan' });
      }
    }

    // Cek apakah prodi ada
    if (pegawaiData.id_prodi) {
      const existingProdi = await prisma.kol_prodi.findUnique({
        where: { id_prodi: pegawaiData.id_prodi }
      });

      if (!existingProdi) {
        return res.status(400).json({ message: 'Prodi tidak ditemukan' });
      }
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

    // Buat pegawai baru
    const Pegawai = await prisma.simpeg_pegawai.create({
       data :  {
        nama_pegawai: pegawaiData.nama_pegawai,
        tempat_lahir: pegawaiData.tempat_lahir,
        tgl_lahir: new Date(pegawaiData.tgl_lahir),
        nidn: pegawaiData.nidn,
        nip: pegawaiData.nip,
        no_ktp: pegawaiData.no_ktp,
        no_kk: pegawaiData.no_kk,
        alamat: pegawaiData.alamat,
        kota: pegawaiData.kota,
        kode_pos: pegawaiData.kode_pos,
        handphone: pegawaiData.handphone,
        email_poliban: pegawaiData.email_poliban,
        foto: pegawaiData.foto,
      
 // Foreign keys
 kol_agama: { connect: { id_agama: pegawaiData.id_agama } },
 kol_darah: { connect: { id_darah: pegawaiData.gol_darah } },
 kol_pendidikan: { connect: { id_pendidikan: pegawaiData.id_pendidikan } },
 kol_status_hidup: pegawaiData.id_status_hidup ? { connect: { id_status_hidup: pegawaiData.id_status_hidup } } : undefined,
 kol_wilayah: { connect: { id_wil: pegawaiData.id_wil } },
 kol_kabupaten: { connect: { id_kabupaten: pegawaiData.id_kabupaten } },
 kol_provinsi: { connect: { id_prov: pegawaiData.id_prov } },
 simpeg_bagian: { connect: { id_bagian: pegawaiData.id_bagian } },
 kol_jurusan: pegawaiData.id_jurusan ? { connect: { id_jurusan: pegawaiData.id_jurusan } } : undefined,
 kol_prodi: pegawaiData.id_prodi ? { connect: { id_prodi: pegawaiData.id_prodi } } : undefined,
 simpeg_jabatan_struktural: { connect: { id_jabatan_struktural: pegawaiData.id_jabatan_struktural } },
 simpeg_jabatan_fungsional: { connect: { id_jabatan_fungsional: pegawaiData.id_jabatan_fungsional } },
 simpeg_status_pegawai: { connect: { id_status_pegawai: pegawaiData.id_status_pegawai } },

        // RELASI WAJIB VALID
        kol_agama: { connect: { id_agama: parseInt(pegawaiData.id_agama) } },
        kol_darah: { connect: { id_darah: parseInt(pegawaiData.gol_darah) } },
        kol_pendidikan: { connect: { id_pendidikan: pegawaiData.id_pendidikan.toString() } },
      kol_status_hidup: { connect: { id_status_hidup: pegawaiData.id_status_hidup.toString() } },
        kol_wilayah: { connect: { id_wil: pegawaiData.id_wil } },
        kol_kabupaten: { connect: { id_kabupaten: pegawaiData.id_kabupaten } },
        kol_provinsi: { connect: { id_prov: pegawaiData.id_prov } },
        simpeg_bagian: { connect: { id_bagian: parseInt(pegawaiData.id_bagian) } },
        kol_jurusan: { connect: { id_jurusan: parseInt(pegawaiData.id_jurusan) } },
        kol_prodi: { connect: { id_prodi: parseInt(pegawaiData.id_prodi) } },
        simpeg_jabatan_struktural: { connect: { id_jabatan_struktural: parseInt(pegawaiData.id_jabatan_struktural) } },
        simpeg_jabatan_fungsional: { connect: { id_jabatan_fungsional: parseInt(pegawaiData.id_jabatan_fungsional) } },
        simpeg_status_pegawai: { connect: { id_status_pegawai: parseInt(pegawaiData.id_status_pegawai) } },
        kol_jk: { connect: { id_jk: parseInt(pegawaiData.jk) } },
      },
  
        
      //   // HANYA BUAT CONNECT JIKA VALID
      //   ...(pegawaiData.id_riwayat_pangkat &&
      //     !isNaN(parseInt(pegawaiData.id_riwayat_pangkat)) && {
      //       simpeg_riwayat_pangkat: {
      //         connect: { id_riwayat_pangkat: parseInt(pegawaiData.id_riwayat_pangkat) }
      //       }
      //     }),
      
      //   ...(pegawaiData.id_riwayat_pendidikan &&
      //     !isNaN(parseInt(pegawaiData.id_riwayat_pendidikan)) && {
      //       simpeg_riwayat_pendidikan: {
      //         connect: { id_riwayat_pendidikan: parseInt(pegawaiData.id_riwayat_pendidikan) }
      //       }
      //     }),
      // }
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
          email: pegawaiData.email_poliban,
          level: 2, // Level 2 untuk pegawai biasa
          aktif: 'Y',
          blokir: 'N'
        }
      });
    }

    res.status(201).json({
      message: 'Pegawai berhasil ditambahkan' + (userAccount ? ' dan akun user dibuat' : ''),
      data: Pegawai,
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





// Ambil detail pegawai (Admin & Pegawai)
// ... existing code ...

export const getPegawaiById = async (req, res) => {
  try {
    const { id } = req.params;
    const idPegawai = parseInt(id);

    if (isNaN(idPegawai)) {
      return res.status(400).json({ message: 'ID Pegawai tidak valid' });
    }

    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: idPegawai },
      include: {
        simpeg_riwayat_pangkat: true, // <--- Sementara dimatikan
        simpeg_riwayat_pendidikan: true,
        kol_agama: true,
        kol_darah: true,
        kol_status_hidup: true,
        kol_pendidikan: true,
        kol_wilayah: true,
        kol_kabupaten: true,
        kol_provinsi: true,
        simpeg_bagian: true,
        kol_jurusan: true,
        kol_prodi: true,
        simpeg_jabatan_struktural: true,
        simpeg_jabatan_fungsional: true
      }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Lakukan mapping dari ID ke nama jika diperlukan (pastikan mapping-nya tersedia)
    const pegawaiDetail = {
      ...pegawai,
      gol_darah: darahMapping[pegawai.gol_darah] ?? pegawai.kol_darah?.nama ?? null,
      id_pendidikan: pendidikanMapping[pegawai.id_pendidikan] ?? pegawai.kol_pendidikan?.nama ?? null,
      id_status_hidup: statusHidupMapping[pegawai.id_status_hidup] ?? pegawai.kol_status_hidup?.nama ?? null,
      id_jurusan: jurusanMapping[pegawai.id_jurusan] ?? pegawai.kol_jurusan?.nama ?? null,
      jk: jkMapping[pegawai.jk] ?? pegawai.jk,
      kabupaten: kabupatenMapping[pegawai.id_kabupaten] ?? pegawai.kol_kabupaten?.nama ?? null,
      agama: agamaMapping[pegawai.id_agama] ?? pegawai.kol_agama?.nama ?? null,
      wilayah: wilayahMapping[pegawai.id_wil] ?? pegawai.kol_wilayah?.nama ?? null,
    };

    return res.json(pegawaiDetail);
  } catch (error) {
    console.error('Error saat mengambil detail pegawai:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil detail pegawai', 
      error: error.message 
    });
  }
};


// ... existing code ...

// Update pegawai (Admin)
export const updatePegawai = async (req, res) => {
  try {
    const { id } = req.params;
    let pegawaiData = req.body || {};

    // Validasi awal
    if (!pegawaiData || typeof pegawaiData !== 'object' || Array.isArray(pegawaiData)) {
      return res.status(400).json({ message: 'Data update tidak valid' });
    }

    

    // Cek apakah pegawai ada
    const existingPegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });

    if (!existingPegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // === [UPLOAD FOTO BARU] ===
    if (req.file) {
      const oldFoto = existingPegawai.foto;
      const newFoto = req.file.filename;

      // Hapus foto lama dari folder uploads (jika ada)
      if (oldFoto) {
        const oldPath = path.join('uploads', oldFoto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Simpan path/filename baru ke database
      pegawaiData.foto = newFoto;
    }

    // Field yang bertipe INT (pastikan sesuai dengan schema.prisma kamu)
    // Perbaikan: gunakan field yang konsisten dengan schema dan data frontend
    const intFields = [
      'id_status_pegawai', 'id_agama', 'jk',
      'id_jabatan_struktural', 'id_jabatan_fungsional',
      'id_bagian', 'id_jurusan', 'id_prodi', 'gol_darah',
      'id_riwayat_pangkat', 'id_riwayat_pendidikan'
    ];

    intFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(pegawaiData, field) && pegawaiData[field] !== null && pegawaiData[field] !== '') {
        pegawaiData[field] = parseInt(pegawaiData[field]);
        if (isNaN(pegawaiData[field])) delete pegawaiData[field];
      }
    });

    // Field yang harus string (seperti kode wilayah & kabupaten)
    const stringFields = [
      'id_status_hidup', 'id_wil', 'id_kabupaten',
      'id_pendidikan', 'id_prov'
    ];

    stringFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(pegawaiData, field) && pegawaiData[field] !== null && pegawaiData[field] !== '') {
        pegawaiData[field] = String(pegawaiData[field]);
      }
    });

    // Validasi dan parsing tgl_lahir
    if (pegawaiData.tgl_lahir) {
      const date = new Date(pegawaiData.tgl_lahir);
      if (!isNaN(date.getTime())) {
        pegawaiData.tgl_lahir = date;
      } else {
        delete pegawaiData.tgl_lahir;
      }
    }

    // Update data pegawai
    const updatedPegawai = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: pegawaiData
    });

    // Jika ada perubahan NIP / nama, update juga tabel users
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
export const deletePegawai = async (req, res) => {
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



// PINDAH KE pegawaiBiasController.js
// Update data non-sensitif (Pegawai)
// filepath: [pegawai.controller.js](http://_vscodecontentref_/12)
// export const updateNonSensitiveData = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body || {};

//     // Daftar field yang boleh diupdate oleh pegawai sendiri
//     const allowedFields = [
//       'nama_pegawai',
//       'jk',
//       'tempat_lahir',
//       'tgl_lahir',
//       'alamat',
//       'kota',
//       'kode_pos',
//       'handphone',
//       'email_poliban',
//       'foto'
//     ];

//     // Filter hanya field yang diizinkan
//     const filteredData = {};
//     for (const key of allowedFields) {
//       if (Object.prototype.hasOwnProperty.call(updateData, key)) {
//         filteredData[key] = updateData[key];
//       }
//     }

//     // Jika ada upload file foto, tambahkan ke filteredData
//     if (req.file) {
//       filteredData.foto = req.file.filename;
//     }

//     if (Object.keys(filteredData).length === 0) {
//       return res.status(400).json({ message: 'Tidak ada data yang boleh diupdate' });
//     }

//     // Cek apakah pegawai ada
//     const pegawai = await prisma.simpeg_pegawai.findUnique({
//       where: { id_pegawai: parseInt(id) }
//     });

//     if (!pegawai) {
//       return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
//     }

//     // Update data non-sensitif
//     const updatedPegawai = await prisma.simpeg_pegawai.update({
//       where: { id_pegawai: parseInt(id) },
//       data: filteredData
//     });

//     res.json({
//       message: 'Data non-sensitif berhasil diperbarui',
//       data: updatedPegawai
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({
//       message: 'Terjadi kesalahan saat memperbarui data non-sensitif',
//       error: error.message
//     });
//   }
// };



export const requestSensitiveDataChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, newValue, reason } = req.body;

    // Validasi input
    if (!field || !newValue) {
      return res.status(400).json({ message: 'Field dan nilai baru harus diisi' });
    }

    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) } // Corrected here
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Buat permintaan perubahan data
    const changeRequest = await prisma.data_change_requests.create({
      data: {
        id_pegawai: parseInt(id), // Corrected here
        field_name: field,
        current_value: pegawai[field]?.toString() || '',
        requested_value: newValue.toString(),
        reason: reason || 'Perubahan data',
        status: 'pending',
        requested_at: new Date(),
        simpeg_pegawai: {
          connect: { id_pegawai: pegawai.id_pegawai }
        }
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
export const processDataChangeRequest = async (req, res) => {
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
        where: { id_pegawai: changeRequest.id_pegawai },
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
export const getAllDataChangeRequests = async (req, res) => {
  try {
    // Ambil semua permintaan perubahan data
    const requests = await prisma.data_change_requests.findMany({
      orderBy: {
        // Tambahkan kriteria pengurutan jika diperlukan
      }
    });

    // Ambil data pegawai untuk setiap permintaan
    const requestsWithPegawai = await Promise.all(requests.map(async (request) => {
      if (request.pegawai_id) {
        const pegawai = await prisma.simpeg_pegawai.findUnique({
          where: { id_pegawai: request.pegawai_id },
          select: {
            nama_pegawai: true,
            nip: true
          }
        });
        return {
          ...request,
          pegawai
        };
      }
      return request;
    }));

    res.json(requestsWithPegawai);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data permintaan', detail: err.message });
  }
};

// Mengambil detail permintaan perubahan data
export const getDataChangeRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil detail permintaan perubahan data
    const changeRequest = await prisma.data_change_requests.findUnique({
      where: { 
        id: parseInt(id) 
      }
    });

    if (!changeRequest) {
      return res.status(404).json({ 
        message: 'Permintaan perubahan data tidak ditemukan' 
      });
    }

    // Ambil data pegawai terkait
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: changeRequest.pegawai_id },
      select: {
        nama_pegawai: true,
        nip: true
      }
    });

    res.json({
      ...changeRequest,
      pegawai
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil detail permintaan perubahan data',
      error: error.message
    });
  }
};
// ... existing code ...

export default {
  getAllPegawai,
  createPegawai,
  getPegawaiById,
  requestSensitiveDataChange,
  // Add other exports as needed
};