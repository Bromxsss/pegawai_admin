// src/controller/presensiController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const allowedStatus = ['Hadir', 'Pulang', 'Izin'];

export const createPresensi = async (req, res) => {
  try {
    const { id_pegawai, tanggal, status, jam_masuk, jam_keluar, keterangan } = req.body;

    // Validasi wajib isi
    if (!id_pegawai || !tanggal || !status) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    // Validasi status enum
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status presensi tidak valid." });
    }

    // Jika status 'Izin', maka keterangan wajib diisi
    if (status === 'Izin' && (!keterangan || keterangan.trim() === '')) {
      return res.status(400).json({ message: "Keterangan wajib diisi untuk status Izin." });
    }

    // Cek apakah pegawai ada
    const pegawai = await prisma.simpeg_pegawai.findUnique({ where: { id_pegawai } });
    if (!pegawai) {
      return res.status(404).json({ message: "Pegawai tidak ditemukan." });
    }

    // Simpan data presensi
    const newPresensi = await prisma.presensi.create({ 
      data: {
        id_pegawai: Number(id_pegawai),
        tanggal: new Date(tanggal),
        status,
        keterangan: keterangan || null,
        jam_masuk: jam_masuk ? new Date(`1970-01-01T${jam_masuk}.000Z`) : null,
        jam_keluar: jam_keluar ? new Date(`1970-01-01T${jam_keluar}.000Z`) : null,
      },
    });

    res.status(201).json({ message: "Presensi berhasil disimpan.", presensi: newPresensi });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan.", error });
  }
};

export const getAllPresensi = async (req, res) => {
  try {
    const presensi = await prisma.presensi.findMany({ 
      include: { simpeg_pegawai: true } 
    });
    res.json({ presensi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan.", error });
  }
};

export const getPresensiById = async (req, res) => {
  try {
    const { id } = req.params;

    const presensi = await prisma.presensi.findUnique({ 
      where: { id_presensi: parseInt(id) },
    });

    if (!presensi) return res.status(404).json({ message: "Data Pegawai Tidak Ada" });

    res.json(presensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
