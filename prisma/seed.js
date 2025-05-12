const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buat user admin
  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123', // Sebaiknya gunakan password yang kuat dan di-hash
      level: 1, // Sesuaikan dengan level admin di tabel user_level
      nama_lengkap: 'Administrator',
      email: 'admin@example.com',
      aktif: 'Y',
      blokir: 'N'
    },
  });

  // Buat user pegawai
  const pegawai = await prisma.users.upsert({
    where: { username: 'pegawai1' },
    update: {},
    create: {
      username: 'pegawai1',
      password: 'pegawai123', // Sebaiknya gunakan password yang kuat dan di-hash
      level: 2, // Sesuaikan dengan level pegawai di tabel user_level
      nama_lengkap: 'Pegawai Satu',
      email: 'pegawai1@example.com',
      aktif: 'Y',
      blokir: 'N',
      ref_user: '1' // ID pegawai yang terkait
    },
  });

  console.log({ admin, pegawai });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });