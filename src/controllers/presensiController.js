// src/controller/presensiController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createPresensi = async (req, res) => {
  try {
    const { id_pegawai, tanggal, status, jam_masuk, jam_keluar } = req.body;

    if (!id_pegawai || !tanggal || !status) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    // Pastikan id_pegawai memang ada di tabela simpeg_pegawai
    const pegawai = await prisma.simpeg_pegawai.findUnique
    ({ where: { id_pegawai } });
    if (!pegawai) {
      return res.status(404).json({ message: "Pegawai tidak ditemukan." });
    }

    const newPresensi = await prisma.presensi.create({ 
      data: {
        id_pegawai: Number(id_pegawai),
        tanggal: new Date(tanggal),
        status,
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
