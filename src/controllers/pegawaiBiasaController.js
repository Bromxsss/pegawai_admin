// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// import bcrypt from 'bcrypt';
// import { darahMapping, pendidikanMapping, statusHidupMapping, jurusanMapping, jkMapping, kabupatenMapping, agamaMapping, wilayahMapping, provinsiMapping} from './mappings.js';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';



// // Mendapatkan direktori saat ini dalam ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Configure multer to use the uploads directory
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });
// export { upload };


// export const getProfilePegawai = async (req, res) => {
//  try {
//     const id_pegawai = req.user.id_pegawai;


//     const pegawai = await prisma.simpeg_pegawai.findUnique({
//       where: { id_pegawai: id_pegawai },
//       include: {
//         //simpeg_riwayat_pangkat: true, // <--- Sementara dimatikan
//         // simpeg_riwayat_pendidikan: true,
//         kol_agama: true,
//         kol_darah: true,
//         kol_status_hidup: true,
//         kol_pendidikan: true,
//         kol_wilayah: true,
//         kol_kabupaten: true,
//         kol_provinsi: true,
//         simpeg_bagian: true,
//         kol_jurusan: true,
//         kol_prodi: true,
//         simpeg_jabatan_struktural: true,
//         simpeg_jabatan_fungsional: true
//       }
//     });

//     if (!pegawai) {
//       return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
//     }

//      const {
//       id_prov,
//       id_agama,
//       id_kabupaten,
//       id_jurusan,
//       id_status_hidup,
//       id_pendidikan,
//       gol_darah,
//       jk,
//       id_wil,
//       ...pegawaiTanpaId
//     } = pegawai;

//     const pegawaiDetail = {
//       ...pegawaiTanpaId,
//       gol_darah: darahMapping[gol_darah] ?? pegawai.kol_darah?.nama_darah,
//       pendidikan: pendidikanMapping[id_pendidikan] ?? pegawai.kol_pendidikan?.nama_pendidikan,
//       status_hidup: statusHidupMapping[id_status_hidup] ?? pegawai.kol_status_hidup?.nama_status_hidup,
//       jurusan: jurusanMapping[id_jurusan] ?? pegawai.kol_jurusan?.nama_jurusan,
//       jk: jkMapping[jk] ?? pegawai.jk,
//       kabupaten: kabupatenMapping[id_kabupaten] ?? pegawai.kol_kabupaten?.nama_kabupaten,
//       agama: agamaMapping[id_agama] ?? pegawai.kol_agama?.nama_agama,
//       wilayah: wilayahMapping[id_wil] ?? pegawai.kol_wilayah?.nm_wil,
//       provinsi: provinsiMapping[id_prov] ?? pegawai.kol_provinsi?.nama_prov
//     };

//     return res.json(pegawaiDetail);
//   } catch (error) {
//     console.error('Error saat mengambil detail pegawai:', error);
//     return res.status(500).json({ 
//       message: 'Terjadi kesalahan saat mengambil detail pegawai', 
//       error: error.message 
//     });
//   }
// };



// // Update data non-sensitif (Pegawai)
// // filepath: [pegawai.controller.js](http://_vscodecontentref_/12)
// export const updateDataProfil = async (req, res) => {
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
//       'id_agama',
//       'id_darah',
//       'id_wil',
//       'id_prov',
//       'id_kabupaten',
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
//       message: 'Data berhasil diperbarui',
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




// export const requestSensitiveDataChange = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { field, newValue, reason } = req.body;

//     // Validasi input
//     if (!field || !newValue) {
//       return res.status(400).json({ message: 'Field dan nilai baru harus diisi' });
//     }

//     // Cek apakah pegawai ada
//     const pegawai = await prisma.simpeg_pegawai.findUnique({
//       where: { id_pegawai: parseInt(id) } // Corrected here
//     });

//     if (!pegawai) {
//       return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
//     }

//     // Buat permintaan perubahan data
//     const changeRequest = await prisma.data_change_requests.create({
//       data: {
//         id_pegawai: parseInt(id), // Corrected here
//         field_name: field,
//         current_value: pegawai[field]?.toString() || '',
//         requested_value: newValue.toString(),
//         reason: reason || 'Perubahan data',
//         status: 'pending',
//         requested_at: new Date(),
//         simpeg_pegawai: {
//           connect: { id_pegawai: pegawai.id_pegawai }
//         }
//       }
//     });

//     res.status(201).json({
//       message: 'Permintaan perubahan data berhasil diajukan',
//       data: changeRequest
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({
//       message: 'Terjadi kesalahan saat mengajukan perubahan data',
//       error: error.message
//     });
//   }
// };


// export default {
//   getProfilePegawai,
//   updateDataProfil,
//   requestSensitiveDataChange
// }






