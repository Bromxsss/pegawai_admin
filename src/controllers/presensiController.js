// src/controller/presensiController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createPresensi = async (req, res) => {
  try {
    let { id_pegawai, tanggal, status, jam_masuk, jam_keluar } = req.body;

    // Konversi id_pegawai ke integer
    id_pegawai = parseInt(id_pegawai);
    if (isNaN(id_pegawai)) {
      return res.status(400).json({ message: "id_pegawai harus berupa angka." });
    }

    if (!id_pegawai || !tanggal || !status) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    // Pastikan id_pegawai memang ada di tabel simpeg_pegawai
    const pegawai = await prisma.simpeg_pegawai.findUnique({ where: { id_pegawai } });
    if (!pegawai) {
      return res.status(404).json({ message: "Pegawai tidak ditemukan." });
    }

    const newPresensi = await prisma.presensi.create({ 
      data: {
        id_pegawai,
        tanggal: new Date(tanggal),
        status,
        jam_masuk: jam_masuk ? new Date(`1970-01-01T${jam_masuk}.000Z`) : null,
        jam_keluar: jam_keluar ? new Date(`1970-01-01T${jam_keluar}.000Z`) : null,
      },
    });

    res.status(201).json({ message: "Presensi berhasil disimpan.", presensi: newPresensi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan.", error: error.message });
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