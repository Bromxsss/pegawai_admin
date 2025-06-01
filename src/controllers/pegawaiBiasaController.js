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


// Update pegawai (Admin)
export const updatePegawai = async (req, res) => {
  try {
    const id = req.user.id_pegawai;

    if (!id) {
      return res.status(400).json({ message: 'ID pegawai tidak ditemukan' });
    }

    let pegawaiData = req.body;
    

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





// ... existing code ...

export default {
  updatePegawai,
  deletePegawai
  // Add other exports as needed
};