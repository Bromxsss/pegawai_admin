import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { darahMapping, pendidikanMapping, statusHidupMapping, jurusanMapping, jkMapping, kabupatenMapping, agamaMapping, wilayahMapping } from './mappings.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { get } from 'http';



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
    const pegawaiList = await prisma.simpeg_pegawai.findMany({
      include: {
        kol_jk: { select: { nama_jk: true } },
        kol_agama: { select: { nama_agama: true } },
        kol_darah: { select: { nama_darah: true } },
        kol_pendidikan: { select: { nama_pendidikan: true } },
        kol_status_hidup: { select: { nama_status_hidup: true } },
        kol_wilayah: { select: { nm_wil: true } },
        kol_kabupaten: { select: { nama_kabupaten: true } },
        kol_provinsi: { select: { nama_prov: true } },
        simpeg_jabatan_struktural: { select: { nama_jabatan_struktural: true } },
        simpeg_jabatan_fungsional: { select: { nama_jabatan_fungsional: true } },
        simpeg_status_pegawai: { select: { nama_status_pegawai: true } },
        kol_jurusan: { select: { nama_jurusan: true } },
        simpeg_bagian: { select: { nama_bagian: true } },
        kol_prodi: { select: { nama_prodi: true } },
        simpeg_riwayat_pangkat: {
          select: {
            id_riwayat_pangkat: true,
            simpeg_pangkat_gol_ruang: {
              select: {
                nama_pangkat_gol_ruang: true,
              }
            }
          }
        },
        simpeg_riwayat_pendidikan: {
          select: {
            id_riwayat_pendidikan: true,
            thn_masuk: true,
            thn_lulus: true,
            tempat: true,
            simpeg_level_pendidikan: {
              select: {
                nama_level_pendidikan: true
              }
            }
          }
        }
      }
    });

    // Mapping agar output langsung menampilkan nama relasi, bukan objek
    const pegawaiMapped = pegawaiList.map(p => ({
      ...p,
      jk: p.kol_jk?.nama_jk ?? null,
      agama: p.kol_agama?.nama_agama ?? null,
      gol_darah: p.kol_darah?.nama_darah ?? null,
      pendidikan: p.kol_pendidikan?.nama_pendidikan ?? null,
      status_hidup: p.kol_status_hidup?.nama_status_hidup ?? null,
      wilayah: p.kol_wilayah?.nm_wil ?? null,
      kabupaten: p.kol_kabupaten?.nama_kabupaten ?? null,
      provinsi: p.kol_provinsi?.nama_prov ?? null,
      jabatan_struktural: p.simpeg_jabatan_struktural?.nama_jabatan_struktural ?? null,
      jabatan_fungsional: p.simpeg_jabatan_fungsional?.nama_jabatan_fungsional ?? null,
      status_pegawai: p.simpeg_status_pegawai?.nama_status_pegawai ?? null,
      jurusan: p.kol_jurusan?.nama_jurusan ?? null,
      bagian: p.simpeg_bagian?.nama_bagian ?? null,
      prodi: p.kol_prodi?.nama_prodi ?? null,
      // relasi nested riwayat
      riwayat_pangkat: p.simpeg_riwayat_pangkat?.map(rp => ({
        ...rp,
        pangkat_gol_ruang: rp.simpeg_pangkat_gol_ruang?.nama_pangkat_gol_ruang ?? null
      })) ?? [],
      riwayat_pendidikan: p.simpeg_riwayat_pendidikan?.map(rp => ({
        ...rp,
        level_pendidikan: rp.simpeg_level_pendidikan?.nama_level_pendidikan ?? null
      })) ?? []
    }));

    res.json(pegawaiMapped);
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
    const pegawaiData = req.body;
    const foto = req.file ? req.file.filename : null;
    pegawaiData.foto = foto;

    // Validasi field wajib
    if (
      !pegawaiData.nama_pegawai ||
      !pegawaiData.nip ||
      !pegawaiData.nidn ||
      !pegawaiData.NUPTK
    ) {
      return res.status(400).json({
        message: 'Field wajib: nama_pegawai, nip, nidn, NUPTK'
      });
    }

    // Validasi panjang NIP
    if (pegawaiData.nip.length !== 18) {
      return res.status(400).json({ message: 'NIP harus tepat 18 karakter' });
    }

    // Konversi dan validasi opsional
    if (pegawaiData.tgl_lahir) {
      const date = new Date(pegawaiData.tgl_lahir);
      pegawaiData.tgl_lahir = !isNaN(date.getTime()) ? date : null;
    }
    if (pegawaiData.jk) pegawaiData.jk = parseInt(pegawaiData.jk);
    if (pegawaiData.id_agama) pegawaiData.id_agama = parseInt(pegawaiData.id_agama);
    if (pegawaiData.gol_darah) pegawaiData.gol_darah = parseInt(pegawaiData.gol_darah);
    if (pegawaiData.id_pendidikan) pegawaiData.id_pendidikan = String(pegawaiData.id_pendidikan);
    if (pegawaiData.id_status_pegawai) pegawaiData.id_status_pegawai = parseInt(pegawaiData.id_status_pegawai);
    if (pegawaiData.id_status_hidup) pegawaiData.id_status_hidup = parseInt(pegawaiData.id_status_hidup);
    if (pegawaiData.id_wil) pegawaiData.id_wil = String(pegawaiData.id_wil);
    if (pegawaiData.id_kabupaten) pegawaiData.id_kabupaten = String(pegawaiData.id_kabupaten);
    if (pegawaiData.id_prov) pegawaiData.id_prov = String(pegawaiData.id_prov);
    if (pegawaiData.id_bagian) pegawaiData.id_bagian = parseInt(pegawaiData.id_bagian);
    if (pegawaiData.id_jurusan) pegawaiData.id_jurusan = parseInt(pegawaiData.id_jurusan);
    if (pegawaiData.id_prodi) pegawaiData.id_prodi = parseInt(pegawaiData.id_prodi);
    if (pegawaiData.id_jabatan_struktural) pegawaiData.id_jabatan_struktural = parseInt(pegawaiData.id_jabatan_struktural);
    if (pegawaiData.id_jabatan_fungsional) pegawaiData.id_jabatan_fungsional = parseInt(pegawaiData.id_jabatan_fungsional);

    // Cek NIP unik
    const existingPegawai = await prisma.simpeg_pegawai.findFirst({
      where: { nip: pegawaiData.nip }
    });
    if (existingPegawai) {
      return res.status(400).json({ message: 'NIP sudah terdaftar' });
    }

    // Default password dari 6 digit terakhir NIP
    const defaultPassword = pegawaiData.nip.slice(-6);

    // Siapkan data untuk Prisma, hanya relasi yang ada nilainya
    const dataPegawai = {
      nama_pegawai: pegawaiData.nama_pegawai,
      tempat_lahir: pegawaiData.tempat_lahir,
      tgl_lahir: pegawaiData.tgl_lahir,
      nidn: pegawaiData.nidn,
      nip: pegawaiData.nip,
      NUPTK: pegawaiData.NUPTK,
      no_ktp: pegawaiData.no_ktp,
      no_kk: pegawaiData.no_kk,
      alamat: pegawaiData.alamat,
      kota: pegawaiData.kota,
      kode_pos: pegawaiData.kode_pos,
      handphone: pegawaiData.handphone,
      email_poliban: pegawaiData.email_poliban,
      foto: pegawaiData.foto,
      kol_agama: pegawaiData.id_agama ? { connect: { id_agama: pegawaiData.id_agama } } : undefined,
      kol_darah: pegawaiData.gol_darah ? { connect: { id_darah: pegawaiData.gol_darah } } : undefined,
      kol_status_hidup: pegawaiData.id_status_hidup ? { connect: { id_status_hidup: String(pegawaiData.id_status_hidup) } } : undefined,
      kol_wilayah: pegawaiData.id_wil ? { connect: { id_wil: pegawaiData.id_wil } } : undefined,
      kol_kabupaten: pegawaiData.id_kabupaten ? { connect: { id_kabupaten: pegawaiData.id_kabupaten } } : undefined,
      kol_provinsi: pegawaiData.id_prov ? { connect: { id_prov: pegawaiData.id_prov } } : undefined,
      kol_pendidikan: pegawaiData.id_pendidikan ? { connect: { id_pendidikan: pegawaiData.id_pendidikan } } : undefined,
      simpeg_bagian: pegawaiData.id_bagian ? { connect: { id_bagian: pegawaiData.id_bagian } } : undefined,
      kol_jurusan: pegawaiData.id_jurusan ? { connect: { id_jurusan: pegawaiData.id_jurusan } } : undefined,
      kol_prodi: pegawaiData.id_prodi ? { connect: { id_prodi: pegawaiData.id_prodi } } : undefined,
      simpeg_jabatan_struktural: pegawaiData.id_jabatan_struktural ? { connect: { id_jabatan_struktural: pegawaiData.id_jabatan_struktural } } : undefined,
      simpeg_jabatan_fungsional: pegawaiData.id_jabatan_fungsional ? { connect: { id_jabatan_fungsional: pegawaiData.id_jabatan_fungsional } } : undefined,
      simpeg_status_pegawai: pegawaiData.id_status_pegawai ? { connect: { id_status_pegawai: pegawaiData.id_status_pegawai } } : undefined,
      kol_jk: pegawaiData.jk ? { connect: { id_jk: pegawaiData.jk } } : undefined,
    };

    // Hapus property undefined agar Prisma tidak error
    Object.keys(dataPegawai).forEach(key => {
      if (dataPegawai[key] === undefined) {
        delete dataPegawai[key];
      }
    });

    const Pegawai = await prisma.simpeg_pegawai.create({
      data: dataPegawai,
      include: {
        kol_agama: { select: { nama_agama: true } },
        kol_darah: { select: { nama_darah: true } },
        kol_status_hidup: { select: { nama_status_hidup: true } },
        kol_wilayah: { select: { nm_wil: true } },
        kol_kabupaten: { select: { nama_kabupaten: true } },
        kol_provinsi: { select: { nama_prov: true } },
        kol_pendidikan: { select: { nama_pendidikan: true } },
        simpeg_bagian: { select: { nama_bagian: true } },
        kol_jurusan: { select: { nama_jurusan: true } },
        kol_prodi: { select: { nama_prodi: true } },
        simpeg_jabatan_struktural: { select: { nama_jabatan_struktural: true } },
        simpeg_jabatan_fungsional: { select: { nama_jabatan_fungsional: true } },
        simpeg_status_pegawai: { select: { nama_status_pegawai: true } },
        kol_jk: { select: { nama_jk: true } }
      }
    });

    // Buat akun user jika belum ada
    let userAccount = null;
    const existingUser = await prisma.users.findUnique({
      where: { username: pegawaiData.nip }
    });
    if (!existingUser) {
      userAccount = await prisma.users.create({
        data: {
          username: pegawaiData.nip,
          password: defaultPassword,
          nama_lengkap: pegawaiData.nama_pegawai,
          email: pegawaiData.email_poliban,
          level: 2,
          aktif: 'Y',
          blokir: 'N'
        }
      });
    }

    // Mapping response agar tampil nama, bukan id
    const responsePegawai = {
      id_pegawai: Pegawai.id_pegawai,
      nama_pegawai: Pegawai.nama_pegawai,
      nip: Pegawai.nip,
      nidn: Pegawai.nidn,
      NUPTK: Pegawai.NUPTK,
      agama: Pegawai.kol_agama?.nama_agama ?? null,
      gol_darah: Pegawai.kol_darah?.nama_darah ?? null,
      pendidikan: Pegawai.kol_pendidikan?.nama_pendidikan ?? null,
      status_hidup: Pegawai.kol_status_hidup?.nama_status_hidup ?? null,
      wilayah: Pegawai.kol_wilayah?.nm_wil ?? null,
      kabupaten: Pegawai.kol_kabupaten?.nama_kabupaten ?? null,
      provinsi: Pegawai.kol_provinsi?.nama_prov ?? null,
      bagian: Pegawai.simpeg_bagian?.nama_bagian ?? null,
      jurusan: Pegawai.kol_jurusan?.nama_jurusan ?? null,
      prodi: Pegawai.kol_prodi?.nama_prodi ?? null,
      jabatan_struktural: Pegawai.simpeg_jabatan_struktural?.nama_jabatan_struktural ?? null,
      jabatan_fungsional: Pegawai.simpeg_jabatan_fungsional?.nama_jabatan_fungsional ?? null,
      status_pegawai: Pegawai.simpeg_status_pegawai?.nama_status_pegawai ?? null,
      jenis_kelamin: Pegawai.kol_jk?.nama_jk ?? null,
      // tambahkan field lain jika perlu
    };

    res.status(201).json({
      message: 'Pegawai berhasil ditambahkan' + (userAccount ? ' dan akun user dibuat' : ''),
      data: responsePegawai,
      userAccount: userAccount ? {
        username: userAccount.username,
        password: defaultPassword,
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
        kol_jk: { select: { nama_jk: true } },
        kol_agama: { select: { nama_agama: true } },
        kol_darah: { select: { nama_darah: true } },
        kol_pendidikan: { select: { nama_pendidikan: true } },
        kol_status_hidup: { select: { nama_status_hidup: true } },
        kol_wilayah: { select: { nm_wil: true } },
        kol_kabupaten: { select: { nama_kabupaten: true } },
        kol_provinsi: { select: { nama_prov: true } },
        simpeg_jabatan_struktural: { select: { nama_jabatan_struktural: true } },
        simpeg_jabatan_fungsional: { select: { nama_jabatan_fungsional: true } },
        simpeg_status_pegawai: { select: { nama_status_pegawai: true } },
        kol_jurusan: { select: { nama_jurusan: true } },
        simpeg_bagian: { select: { nama_bagian: true } },
        kol_prodi: { select: { nama_prodi: true } },
        simpeg_riwayat_pangkat: {
          select: {
            id_riwayat_pangkat: true,
            simpeg_pangkat_gol_ruang: {
              select: {
                nama_pangkat_gol_ruang: true,
              }
            }
          }
        },
        simpeg_riwayat_pendidikan: {
          select: {
            id_riwayat_pendidikan: true,
            thn_masuk: true,
            thn_lulus: true,
            tempat: true,
            simpeg_level_pendidikan: {
              select: {
                nama_level_pendidikan: true
              }
            }
          }
        }
      }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Mapping agar output langsung menampilkan nama relasi, bukan objek
    const pegawaiDetail = {
      id_pegawai: pegawai.id_pegawai,
      nip: pegawai.nip,
      nama_pegawai: pegawai.nama_pegawai,
      jenis_kelamin: pegawai.kol_jk?.nama_jk ?? null,
      agama: pegawai.kol_agama?.nama_agama ?? null,
      gol_darah: pegawai.kol_darah?.nama_darah ?? null,
      pendidikan: pegawai.kol_pendidikan?.nama_pendidikan ?? null,
      status_hidup: pegawai.kol_status_hidup?.nama_status_hidup ?? null,
      wilayah: pegawai.kol_wilayah?.nm_wil ?? null,
      kabupaten: pegawai.kol_kabupaten?.nama_kabupaten ?? null,
      provinsi: pegawai.kol_provinsi?.nama_prov ?? null,
      jabatan_struktural: pegawai.simpeg_jabatan_struktural?.nama_jabatan_struktural ?? null,
      jabatan_fungsional: pegawai.simpeg_jabatan_fungsional?.nama_jabatan_fungsional ?? null,
      status_pegawai: pegawai.simpeg_status_pegawai?.nama_status_pegawai ?? null,
      jurusan: pegawai.kol_jurusan?.nama_jurusan ?? null,
      bagian: pegawai.simpeg_bagian?.nama_bagian ?? null,
      prodi: pegawai.kol_prodi?.nama_prodi ?? null,
      riwayat_pangkat: pegawai.simpeg_riwayat_pangkat?.map(rp => ({
        ...rp,
        pangkat_gol_ruang: rp.simpeg_pangkat_gol_ruang?.nama_pangkat_gol_ruang ?? null
      })) ?? [],
      riwayat_pendidikan: pegawai.simpeg_riwayat_pendidikan?.map(rp => ({
        ...rp,
        level_pendidikan: rp.simpeg_level_pendidikan?.nama_level_pendidikan ?? null
      })) ?? []
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
      pegawaiData.foto = newFoto;
    }

    // Mapping nama relasi ke id (jika frontend mengirim nama)
    if (pegawaiData.agama) {
      const agama = await prisma.kol_agama.findFirst({ where: { nama_agama: pegawaiData.agama } });
      if (agama) pegawaiData.kol_agama = { connect: { id_agama: agama.id_agama } };
      delete pegawaiData.agama;
    }
    if (pegawaiData.gol_darah) {
      const darah = await prisma.kol_darah.findFirst({ where: { nama_darah: pegawaiData.gol_darah } });
      if (darah) pegawaiData.kol_darah = { connect: { id_darah: darah.id_darah } };
      delete pegawaiData.gol_darah;
    }
    if (pegawaiData.pendidikan) {
      const pendidikan = await prisma.kol_pendidikan.findFirst({ where: { nama_pendidikan: pegawaiData.pendidikan } });
      if (pendidikan) pegawaiData.kol_pendidikan = { connect: { id_pendidikan: pendidikan.id_pendidikan } };
      delete pegawaiData.pendidikan;
    }
    if (pegawaiData.status_hidup) {
      const status = await prisma.kol_status_hidup.findFirst({ where: { nama_status_hidup: pegawaiData.status_hidup } });
      if (status) pegawaiData.kol_status_hidup = { connect: { id_status_hidup: status.id_status_hidup } };
      delete pegawaiData.status_hidup;
    }
    if (pegawaiData.wilayah) {
      const wilayah = await prisma.kol_wilayah.findFirst({ where: { nm_wil: pegawaiData.wilayah } });
      if (wilayah) pegawaiData.kol_wilayah = { connect: { id_wil: wilayah.id_wil } };
      delete pegawaiData.wilayah;
    }
    if (pegawaiData.kabupaten) {
      const kabupaten = await prisma.kol_kabupaten.findFirst({ where: { nama_kabupaten: pegawaiData.kabupaten } });
      if (kabupaten) pegawaiData.kol_kabupaten = { connect: { id_kabupaten: kabupaten.id_kabupaten } };
      delete pegawaiData.kabupaten;
    }
    if (pegawaiData.provinsi) {
      const provinsi = await prisma.kol_provinsi.findFirst({ where: { nama_prov: pegawaiData.provinsi } });
      if (provinsi) pegawaiData.kol_provinsi = { connect: { id_prov: provinsi.id_prov } };
      delete pegawaiData.provinsi;
    }
    if (pegawaiData.bagian) {
      const bagian = await prisma.simpeg_bagian.findFirst({ where: { nama_bagian: pegawaiData.bagian } });
      if (bagian) pegawaiData.simpeg_bagian = { connect: { id_bagian: bagian.id_bagian } };
      delete pegawaiData.bagian;
    }
    if (pegawaiData.jurusan) {
      const jurusan = await prisma.kol_jurusan.findFirst({ where: { nama_jurusan: pegawaiData.jurusan } });
      if (jurusan) pegawaiData.kol_jurusan = { connect: { id_jurusan: jurusan.id_jurusan } };
      delete pegawaiData.jurusan;
    }
    if (pegawaiData.prodi) {
      const prodi = await prisma.kol_prodi.findFirst({ where: { nama_prodi: pegawaiData.prodi } });
      if (prodi) pegawaiData.kol_prodi = { connect: { id_prodi: prodi.id_prodi } };
      delete pegawaiData.prodi;
    }
    if (pegawaiData.jabatan_struktural) {
      const jabStruk = await prisma.simpeg_jabatan_struktural.findFirst({ where: { nama_jabatan_struktural: pegawaiData.jabatan_struktural } });
      if (jabStruk) pegawaiData.simpeg_jabatan_struktural = { connect: { id_jabatan_struktural: jabStruk.id_jabatan_struktural } };
      delete pegawaiData.jabatan_struktural;
    }
    if (pegawaiData.jabatan_fungsional) {
      const jabFung = await prisma.simpeg_jabatan_fungsional.findFirst({ where: { nama_jabatan_fungsional: pegawaiData.jabatan_fungsional } });
      if (jabFung) pegawaiData.simpeg_jabatan_fungsional = { connect: { id_jabatan_fungsional: jabFung.id_jabatan_fungsional } };
      delete pegawaiData.jabatan_fungsional;
    }
    if (pegawaiData.status_pegawai) {
      const statusPeg = await prisma.simpeg_status_pegawai.findFirst({ where: { nama_status_pegawai: pegawaiData.status_pegawai } });
      if (statusPeg) pegawaiData.simpeg_status_pegawai = { connect: { id_status_pegawai: statusPeg.id_status_pegawai } };
      delete pegawaiData.status_pegawai;
    }
    if (pegawaiData.jenis_kelamin) {
      const jk = await prisma.kol_jk.findFirst({ where: { nama_jk: pegawaiData.jenis_kelamin } });
      if (jk) pegawaiData.kol_jk = { connect: { id_jk: jk.id_jk } };
      delete pegawaiData.jenis_kelamin;
    }

    // Field INT
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

    // Field STRING
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

    // Hapus property undefined
    Object.keys(pegawaiData).forEach(key => {
      if (pegawaiData[key] === undefined) {
        delete pegawaiData[key];
      }
    });

    // // ✅ Hapus id_pegawai agar tidak menyebabkan error saat update
    // if ('id_pegawai' in pegawaiData) {
    //   delete pegawaiData.id_pegawai;
    // }

    // Update data pegawai dan ambil relasi
    const updatedPegawai = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: pegawaiData, // <-- gunakan seluruh objek pegawaiData hasil mapping
      include: {
        kol_agama: { select: { nama_agama: true } },
        kol_darah: { select: { nama_darah: true } },
        kol_status_hidup: { select: { nama_status_hidup: true } },
        kol_wilayah: { select: { nm_wil: true } },
        kol_kabupaten: { select: { nama_kabupaten: true } },
        kol_provinsi: { select: { nama_prov: true } },
        kol_pendidikan: { select: { nama_pendidikan: true } },
        simpeg_bagian: { select: { nama_bagian: true } },
        kol_jurusan: { select: { nama_jurusan: true } },
        kol_prodi: { select: { nama_prodi: true } },
        simpeg_jabatan_struktural: { select: { nama_jabatan_struktural: true } },
        simpeg_jabatan_fungsional: { select: { nama_jabatan_fungsional: true } },
        simpeg_status_pegawai: { select: { nama_status_pegawai: true } },
        kol_jk: { select: { nama_jk: true } }
      }
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

    // Mapping response agar tampil nama, bukan id
    const responsePegawai = {
      id_pegawai: pegawai.id_pegawai,
      nama_pegawai: pegawai.nama_pegawai,
      nip: pegawai.nip,
      nidn: pegawai.nidn,
      NUPTK: pegawai.NUPTK,
      agama: pegawai.kol_agama?.nama_agama ?? null,
      gol_darah: pegawai.kol_darah?.nama_darah ?? null,
      jenis_kelamin: pegawai.kol_jk?.nama_jk ?? null,
      tempat_lahir: pegawai.tempat_lahir,
      tgl_lahir: pegawai.tgl_lahir ? pegawai.tgl_lahir.toISOString().split('T')[0] : null,
      no_ktp: pegawai.no_ktp,
      no_kk: pegawai.no_kk,
      alamat: pegawai.alamat,
      handphone: pegawai.handphone,
      email_poliban: pegawai.email_poliban,
      kota: pegawai.kota,
      kode_pos: pegawai.kode_pos,
      pendidikan: pegawai.kol_pendidikan?.nama_pendidikan ?? null,
      status_hidup: pegawai.kol_status_hidup?.nama_status_hidup ?? null,
      wilayah: pegawai.kol_wilayah?.nm_wil ?? null,
      kabupaten: pegawai.kol_kabupaten?.nama_kabupaten ?? null,
      provinsi: pegawai.kol_provinsi?.nama_prov ?? null,
      bagian: pegawai.simpeg_bagian?.nama_bagian ?? null,
      jurusan: pegawai.kol_jurusan?.nama_jurusan ?? null,
      prodi: pegawai.kol_prodi?.nama_prodi ?? null,
      jabatan_struktural: pegawai.simpeg_jabatan_struktural?.nama_jabatan_struktural ?? null,
      jabatan_fungsional: pegawai.simpeg_jabatan_fungsional?.nama_jabatan_fungsional ?? null,
      foto: pegawai.foto,
      // tambahkan field lain jika perlu
    };

    res.json({
      message: 'Data pegawai berhasil diperbarui',
      data: responsePegawai
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

    // Hapus user yang terkait dengan pegawai (berdasarkan NIP sebagai username)
    await prisma.users.deleteMany({
      where: { username: existingPegawai.nip }
    });

    // Hapus pegawai
    await prisma.simpeg_pegawai.delete({
      where: { id_pegawai: parseInt(id) }
    });

    res.json({
      message: 'Pegawai dan user terkait berhasil dihapus'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menghapus pegawai',
      error: error.message
    });
  }
};



export const getProfilePegawai = async (req, res) => {
  try {
    const id_pegawai = req.user.id_pegawai;

    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: id_pegawai },
      include: {
        kol_agama: { select: { nama_agama: true } },
        kol_darah: { select: { nama_darah: true } },
        kol_status_hidup: { select: { nama_status_hidup: true } },
        kol_pendidikan: { select: { nama_pendidikan: true } },
        kol_wilayah: { select: { nm_wil: true } },
        kol_kabupaten: { select: { nama_kabupaten: true } },
        kol_provinsi: { select: { nama_prov: true } },
        simpeg_bagian: { select: { nama_bagian: true } },
        kol_jurusan: { select: { nama_jurusan: true } },
        kol_prodi: { select: { nama_prodi: true } },
        simpeg_jabatan_struktural: { select: { nama_jabatan_struktural: true } },
        simpeg_jabatan_fungsional: { select: { nama_jabatan_fungsional: true } }
      }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Mapping response agar hanya menampilkan nama, bukan id
    const profile = {
      id_pegawai: pegawai.id_pegawai,
      nama_pegawai: pegawai.nama_pegawai,
      nip: pegawai.nip,
      nidn: pegawai.nidn,
      NUPTK: pegawai.NUPTK,
      agama: pegawai.kol_agama?.nama_agama ?? null,
      gol_darah: pegawai.kol_darah?.nama_darah ?? null,
      jenis_kelamin: pegawai.kol_jk?.nama_jk ?? null,
      tempat_lahir: pegawai.tempat_lahir,
      tgl_lahir: pegawai.tgl_lahir ? pegawai.tgl_lahir.toISOString().split('T')[0] : null,
      no_ktp: pegawai.no_ktp,
      no_kk: pegawai.no_kk,
      alamat: pegawai.alamat,
      handphone: pegawai.handphone,
      email_poliban: pegawai.email_poliban,
      kota: pegawai.kota,
      kode_pos: pegawai.kode_pos,
      pendidikan: pegawai.kol_pendidikan?.nama_pendidikan ?? null,
      status_hidup: pegawai.kol_status_hidup?.nama_status_hidup ?? null,
      wilayah: pegawai.kol_wilayah?.nm_wil ?? null,
      kabupaten: pegawai.kol_kabupaten?.nama_kabupaten ?? null,
      provinsi: pegawai.kol_provinsi?.nama_prov ?? null,
      bagian: pegawai.simpeg_bagian?.nama_bagian ?? null,
      jurusan: pegawai.kol_jurusan?.nama_jurusan ?? null,
      prodi: pegawai.kol_prodi?.nama_prodi ?? null,
      jabatan_struktural: pegawai.simpeg_jabatan_struktural?.nama_jabatan_struktural ?? null,
      jabatan_fungsional: pegawai.simpeg_jabatan_fungsional?.nama_jabatan_fungsional ?? null,
      foto: pegawai.foto,
     
      
      // tambahkan field lain jika perlu
    };

    return res.json(profile);

  } catch (error) {
    console.error('Error saat mengambil detail pegawai:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil detail pegawai', 
      error: error.message 
    });
  }
};





// update data profil pegawai (Pegawai) ini adalah bagian yang non sentivie artinya pegawai bisa update sendiri data yang tidak termasuk kedalam data sensitive
export const updateDataProfil = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};

    // Field yang TIDAK boleh diupdate langsung oleh pegawai
    const forbiddenFields = ['nama_pegawai', 'nip', 'nidn', 'NUPTK'];

    // Field yang boleh diupdate langsung
    const allowedFields = [
      'jenis_kelamin',
      'tempat_lahir',
      'tgl_lahir',
      'gol_darah',
      'alamat',
      'no_ktp',
      'no_kk',
      'agama',
      'pendidikan',
      'wilayah',
      'provinsi',
      'kabupaten',
      'kota',
      'kode_pos',
      'handphone',
      'email_poliban',
      'foto',
      'jurusan',
      'prodi',
      'bagian',
      'jabatan_struktural',
      'jabatan_fungsional',
      'status_hidup',
      'status_pegawai',
      // tambahkan field lain yang memang boleh diupdate langsung
    ];

    // Filter hanya field yang diizinkan
    const filteredData = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        filteredData[key] = updateData[key];
      }
    }

    // Jika ada upload file foto, tambahkan ke filteredData
    if (req.file) {
      filteredData.foto = req.file.filename;
    }

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang boleh diupdate' });
    }

    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: parseInt(id) }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Jika ada field forbidden yang ingin diubah, tolak dan arahkan ke request perubahan data
    for (const field of forbiddenFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        return res.status(403).json({
          message: `Perubahan ${field} harus melalui permintaan perubahan data (request sensitive data change)`
        });
      }
    }

    // Proses field relasi berbasis nama (jika ada)
    if (filteredData.agama) {
      const agama = await prisma.kol_agama.findFirst({ where: { nama_agama: filteredData.agama } });
      if (!agama) return res.status(400).json({ message: 'Agama tidak ditemukan' });
      filteredData.id_agama = agama.id_agama;
      delete filteredData.agama;
    }
    if (filteredData.gol_darah) {
      const darah = await prisma.kol_darah.findFirst({ where: { nama_darah: filteredData.gol_darah } });
      if (!darah) return res.status(400).json({ message: 'Golongan darah tidak ditemukan' });
      filteredData.gol_darah = darah.id_darah;
    }
    if (filteredData.pendidikan) {
      const pendidikan = await prisma.kol_pendidikan.findFirst({ where: { nama_pendidikan: filteredData.pendidikan } });
      if (!pendidikan) return res.status(400).json({ message: 'Pendidikan tidak ditemukan' });
      filteredData.id_pendidikan = pendidikan.id_pendidikan;
      delete filteredData.pendidikan;
    }
    if (filteredData.jurusan) {
      const jurusan = await prisma.kol_jurusan.findFirst({ where: { nama_jurusan: filteredData.jurusan } });
      if (!jurusan) return res.status(400).json({ message: 'Jurusan tidak ditemukan' });
      filteredData.id_jurusan = jurusan.id_jurusan;
      delete filteredData.jurusan;
    }
    if (filteredData.prodi) {
      const prodi = await prisma.kol_prodi.findFirst({ where: { nama_prodi: filteredData.prodi } });
      if (!prodi) return res.status(400).json({ message: 'Prodi tidak ditemukan' });
      filteredData.id_prodi = prodi.id_prodi;
      delete filteredData.prodi;
    }
    if (filteredData.wilayah) {
      const wilayah = await prisma.kol_wilayah.findFirst({ where: { nm_wil: filteredData.wilayah } });
      if (!wilayah) return res.status(400).json({ message: 'Wilayah tidak ditemukan' });
      filteredData.id_wil = wilayah.id_wil;
      delete filteredData.wilayah;
    }
    if (filteredData.provinsi) {
      const provinsi = await prisma.kol_provinsi.findFirst({ where: { nama_prov: filteredData.provinsi } });
      if (!provinsi) return res.status(400).json({ message: 'Provinsi tidak ditemukan' });
      filteredData.id_prov = provinsi.id_prov;
      delete filteredData.provinsi;
    }
    if (filteredData.kabupaten) {
      const kabupaten = await prisma.kol_kabupaten.findFirst({ where: { nama_kabupaten: filteredData.kabupaten } });
      if (!kabupaten) return res.status(400).json({ message: 'Kabupaten tidak ditemukan' });
      filteredData.id_kabupaten = kabupaten.id_kabupaten;
      delete filteredData.kabupaten;
    }

    if (filteredData.bagian) {
      const bagian = await prisma.simpeg_bagian.findFirst({ where: { nama_bagian: filteredData.bagian } });
      if (!bagian) return res.status(400).json({ message: 'Bagian tidak ditemukan' });
      filteredData.id_bagian = bagian.id_bagian;
      delete filteredData.bagian;
    }

    if (filteredData.jabatan_struktural) {
      const jabatanStruktural = await prisma.simpeg_jabatan_struktural.findFirst({ where: { nama_jabatan_struktural: filteredData.jabatan_struktural } });
      if (!jabatanStruktural) return res.status(400).json({ message: 'Jabatan struktural tidak ditemukan' });
      filteredData.id_jabatan_struktural = jabatanStruktural.id_jabatan_struktural;
      delete filteredData.jabatan_struktural;
    }

    if (filteredData.jabatan_fungsional) {
      const jabatanFungsional = await prisma.simpeg_jabatan_fungsional.findFirst({ where: { nama_jabatan_fungsional: filteredData.jabatan_fungsional } });
      if (!jabatanFungsional) return res.status(400).json({ message: 'Jabatan fungsional tidak ditemukan' });
      filteredData.id_jabatan_fungsional = jabatanFungsional.id_jabatan_fungsional;
      delete filteredData.jabatan_fungsional;
    }
    if (filteredData.status_hidup) {
      const statusHidup = await prisma.kol_status_hidup.findFirst({ where: { nama_status_hidup: filteredData.status_hidup } });
      if (!statusHidup) return res.status(400).json({ message: 'Status hidup tidak ditemukan' });
      filteredData.id_status_hidup = statusHidup.id_status_hidup;
      delete filteredData.status_hidup;
    }

    if (filteredData.jenis_kelamin) {
      const jenisKelamin = await prisma.kol_jk.findFirst({ where: { ket: filteredData.jenis_kelamin } });
      if (!jenisKelamin) return res.status(400).json({ message: 'Jenis kelamin tidak ditemukan' });
      filteredData.jk = jenisKelamin.id_jk;
      delete filteredData.jenis_kelamin;
    }

    if (filteredData.status_pegawai) {
      const statusPegawai = await prisma.simpeg_status_pegawai.findFirst({ where: { nama_status_pegawai: filteredData.status_pegawai } });
      if (!statusPegawai) return res.status(400).json({ message: 'Status pegawai tidak ditemukan' });
      filteredData.id_status_pegawai = statusPegawai.id_status_pegawai;
      delete filteredData.status_pegawai;
    } 



    // Konversi tipe data jika perlu
    if (filteredData.jk !== undefined) filteredData.jk = parseInt(filteredData.jk);
    if (filteredData.gol_darah !== undefined && filteredData.gol_darah !== null && filteredData.gol_darah !== '') {
      filteredData.gol_darah = parseInt(filteredData.gol_darah);
      if (isNaN(filteredData.gol_darah)) delete filteredData.gol_darah;
    }
    if (filteredData.id_agama !== undefined) filteredData.id_agama = parseInt(filteredData.id_agama);
    if (filteredData.id_pendidikan !== undefined && filteredData.id_pendidikan !== null) {
      filteredData.id_pendidikan = String(filteredData.id_pendidikan);
    }
    if (filteredData.tgl_lahir) {
      const date = new Date(filteredData.tgl_lahir);
      if (!isNaN(date.getTime())) {
        filteredData.tgl_lahir = date;
      } else {
        delete filteredData.tgl_lahir;
      }
    }

    // Update data non-sensitif
    const updatedPegawai = await prisma.simpeg_pegawai.update({
      where: { id_pegawai: parseInt(id) },
      data: filteredData
    });

    // update perubahan juga di tabel users jika ada perubahan email
    const user = await prisma.users.findFirst({
      where: { username: pegawai.nip }
    });
    if (user) {
      const updateUserData = {};
      if (filteredData.email_poliban) {
        updateUserData.email = filteredData.email_poliban;
      }
      if (Object.keys(updateUserData).length > 0) {
        await prisma.users.update({
          where: { id_user: user.id_user },
          data: updateUserData
        });
      }
    }
    res.json({
      message: 'Data berhasil diperbarui',
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





// pengajuan perubahan data sensitif (pegawai)
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

    // Validasi field yang wajib bisa request perubahan
    const allowedFields = [
      'nama_pegawai',
      'nip',
      'nidn', 
      'NUPTK',
      'id_jabatan_struktural',
      'id_jabatan_fungsional',
      'id_bagian',
      'id_jurusan',
      'id_prodi',
      'id_status_hidup',
      'id_status_pegawai',
      'id_pendidikan',
      'no_ktp',
      'no_kk',
      'email_poliban',

    ];
    
    // Buat permintaan perubahan data
    const changeRequest = await prisma.data_change_requests.create({
      data: {
        // id_pegawai: parseInt(id), // Corrected here
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

    // kirimkan otomatis nama dan email pegawai yang mengajukan
    const user = await prisma.users.findFirst({
      where: { username: pegawai.nip },
      select: { nama_lengkap: true, email: true }
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

    // Ambil data pegawai sebelum update
    const pegawai = await prisma.simpeg_pegawai.findUnique({
      where: { id_pegawai: changeRequest.id_pegawai }
    });

    if (!pegawai) {
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }

    // Jika disetujui, update data pegawai dan users
    if (status === 'approved') {
      // Update data pegawai
      await prisma.simpeg_pegawai.update({
        where: { id_pegawai: changeRequest.id_pegawai },
        data: {
          [changeRequest.field_name]: changeRequest.requested_value
        }
      });

      // Update juga tabel users jika field yang diubah adalah nama, email, atau nip
      if (
        ['nama_pegawai', 'email_poliban', 'nip'].includes(changeRequest.field_name)
      ) {
        // Cari user berdasarkan username lama (nip lama)
        const user = await prisma.users.findFirst({
          where: { username: pegawai.nip }
        });
        if (user) {
          const updateUserData = {};
          if (changeRequest.field_name === 'nama_pegawai') {
            updateUserData.nama_lengkap = changeRequest.requested_value;
          }
          if (changeRequest.field_name === 'email_poliban') {
            updateUserData.email = changeRequest.requested_value;
          }
          if (changeRequest.field_name === 'nip') {
            updateUserData.username = changeRequest.requested_value;
          }
          if (Object.keys(updateUserData).length > 0) {
            await prisma.users.update({
              where: { id_user: user.id_user },
              data: updateUserData
            });
          }
        }
      }
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
  where: { id_pegawai: changeRequest.id_pegawai },
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
  getProfilePegawai
  // Add other exports as needed
};