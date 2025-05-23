-- CreateTable
CREATE TABLE `aktivitas_kelas` (
    `id_aktivitas_kelas` INTEGER NOT NULL,
    `judul_akt_kelas` VARCHAR(100) NULL,
    `deskripsi_akt_kelas` TEXT NULL,

    PRIMARY KEY (`id_aktivitas_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `data_change_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pegawai` SMALLINT NOT NULL,
    `field_name` VARCHAR(191) NOT NULL,
    `current_value` TEXT NOT NULL,
    `requested_value` TEXT NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `requested_at` DATETIME(0) NOT NULL,
    `processed_at` DATETIME(0) NULL,
    `admin_notes` TEXT NULL,

    INDEX `data_change_requests_id_pegawai_fkey`(`id_pegawai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_agama` (
    `id_agama` TINYINT NOT NULL DEFAULT 0,
    `nama_agama` VARCHAR(100) NOT NULL,
    `id_feeder` TINYINT NULL,

    PRIMARY KEY (`id_agama`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_darah` (
    `id_darah` SMALLINT NOT NULL AUTO_INCREMENT,
    `nama_darah` TEXT NOT NULL,

    PRIMARY KEY (`id_darah`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_jk` (
    `id_jk` SMALLINT NOT NULL AUTO_INCREMENT,
    `nama_jk` TEXT NOT NULL,
    `ket` VARCHAR(15) NOT NULL,

    PRIMARY KEY (`id_jk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_jurusan` (
    `id_jurusan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_jurusan` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_jurusan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_kabupaten` (
    `id_kabupaten` CHAR(10) NOT NULL,
    `nama_kabupaten` VARCHAR(50) NOT NULL,
    `id_provinsi` CHAR(2) NULL,

    INDEX `id_provinsi`(`id_provinsi`),
    PRIMARY KEY (`id_kabupaten`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_pendidikan` (
    `id_pendidikan` TINYINT NOT NULL,
    `nama_pendidikan` VARCHAR(50) NULL,

    PRIMARY KEY (`id_pendidikan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_prodi` (
    `id_prodi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_jurusan` INTEGER NULL,
    `nama_prodi` VARCHAR(100) NULL,
    `singkatan` VARCHAR(100) NULL,

    INDEX `id_jurusan`(`id_jurusan`),
    PRIMARY KEY (`id_prodi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_provinsi` (
    `id_prov` CHAR(2) NOT NULL,
    `nama_prov` TINYTEXT NOT NULL,

    PRIMARY KEY (`id_prov`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_status` (
    `id_status` SMALLINT NOT NULL,
    `nama_status` VARCHAR(15) NOT NULL,

    PRIMARY KEY (`id_status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_status_hidup` (
    `id_status_hidup` TINYINT NOT NULL AUTO_INCREMENT,
    `nama_status_hidup` VARCHAR(50) NULL,

    PRIMARY KEY (`id_status_hidup`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kol_wilayah` (
    `id_wil` CHAR(8) NOT NULL,
    `nm_wil` VARCHAR(50) NOT NULL,
    `id_induk_wilayah` VARCHAR(50) NULL,
    `id_level_wil` INTEGER NOT NULL,

    INDEX `id_induk_wilayah`(`id_induk_wilayah`),
    INDEX `id_wil`(`id_wil`),
    PRIMARY KEY (`id_wil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_bagian` (
    `id_bagian` TINYINT NOT NULL,
    `nama_bagian` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id_bagian`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_jabatan_fungsional` (
    `id_jabatan_fungsional` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_jabatan_fungsional` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id_jabatan_fungsional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_jabatan_struktural` (
    `id_jabatan_struktural` SMALLINT NOT NULL AUTO_INCREMENT,
    `id_jurusan` INTEGER NULL,
    `nama_jabatan_struktural` VARCHAR(100) NOT NULL DEFAULT '',

    INDEX `simpeg_jabatan_struktural_ibfk_1`(`id_jurusan`),
    PRIMARY KEY (`id_jabatan_struktural`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_level_pendidikan` (
    `id_level_pendidikan` SMALLINT NOT NULL,
    `nama_level_pendidikan` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_level_pendidikan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_pangkat_gol_ruang` (
    `id_pangkat_gol_ruang` INTEGER NOT NULL,
    `nama_pangkat_gol_ruang` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_pangkat_gol_ruang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_pegawai` (
    `id_pegawai` SMALLINT NOT NULL AUTO_INCREMENT,
    `nama_pegawai` VARCHAR(60) NULL,
    `jk` SMALLINT NOT NULL,
    `id_agama` TINYINT NOT NULL,
    `tempat_lahir` VARCHAR(40) NULL,
    `tgl_lahir` DATE NULL,
    `nidn` CHAR(10) NOT NULL,
    `nip` VARCHAR(18) NOT NULL,
    `no_ktp` VARCHAR(16) NOT NULL,
    `no_kk` VARCHAR(16) NOT NULL,
    `gol_darah` SMALLINT NOT NULL,
    `id_pendidikan` TINYINT NOT NULL,
    `id_status_hidup` TINYINT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `kota` VARCHAR(100) NULL,
    `kode_pos` VARCHAR(6) NOT NULL,
    `id_wil` CHAR(8) NOT NULL,
    `id_kabupaten` CHAR(10) NOT NULL,
    `id_prov` CHAR(2) NOT NULL,
    `handphone` VARCHAR(20) NOT NULL DEFAULT '',
    `email_poliban` VARCHAR(150) NOT NULL,
    `id_jabatan_struktural` SMALLINT NOT NULL,
    `id_jabatan_fungsional` INTEGER NOT NULL,
    `id_riwayat_pangkat` INTEGER NOT NULL,
    `id_riwayat_pendidikan` INTEGER NOT NULL,
    `id_status_pegawai` TINYINT NOT NULL,
    `id_jurusan` INTEGER NULL,
    `id_bagian` TINYINT NOT NULL,
    `id_prodi` INTEGER NULL,
    `foto` VARCHAR(25) NULL DEFAULT 'blm_ada_foto.jpg',

    INDEX `gol_darah`(`gol_darah`),
    INDEX `id_agama`(`id_agama`),
    INDEX `id_bagian`(`id_bagian`),
    INDEX `id_jabatan_fungsional`(`id_jabatan_fungsional`),
    INDEX `id_jabatan_struktural`(`id_jabatan_struktural`),
    INDEX `id_jurusan`(`id_jurusan`),
    INDEX `id_kabupaten`(`id_kabupaten`),
    INDEX `id_pendidikan`(`id_pendidikan`),
    INDEX `id_prodi`(`id_prodi`),
    INDEX `id_prov`(`id_prov`),
    INDEX `id_riwayat_pangkat`(`id_riwayat_pangkat`),
    INDEX `id_riwayat_pendidikan`(`id_riwayat_pendidikan`),
    INDEX `id_status_hidup`(`id_status_hidup`),
    INDEX `id_status_pegawai`(`id_status_pegawai`),
    INDEX `id_wil`(`id_wil`),
    INDEX `jk`(`jk`),
    PRIMARY KEY (`id_pegawai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_pendanaan` (
    `id_pendanaan` SMALLINT NOT NULL,
    `pendanaan` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_pendanaan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_riwayat_pangkat` (
    `id_riwayat_pangkat` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pangkat_gol_ruang` INTEGER NOT NULL,
    `tmt_pangkat_gol_ruang` DATE NOT NULL,
    `no_sk` VARCHAR(30) NOT NULL,
    `tgl_sk` DATE NOT NULL,
    `pejabat_penetap` VARCHAR(50) NOT NULL,
    `gambar1_pangkat` VARCHAR(100) NOT NULL,
    `gambar2_pangkat` VARCHAR(100) NOT NULL,

    INDEX `id_pangkat_gol_ruang`(`id_pangkat_gol_ruang`),
    PRIMARY KEY (`id_riwayat_pangkat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_riwayat_pendidikan` (
    `id_riwayat_pendidikan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_level_pendidikan` SMALLINT NOT NULL,
    `nama_pendidikan` VARCHAR(100) NOT NULL,
    `total_sks` INTEGER NOT NULL,
    `ipk` DECIMAL(4, 2) NOT NULL,
    `fakultas_jurusan_prodi` VARCHAR(100) NOT NULL,
    `tempat` VARCHAR(100) NOT NULL,
    `nama_pimpinan` VARCHAR(100) NOT NULL,
    `id_pendanaan` SMALLINT NOT NULL,
    `id_status` SMALLINT NOT NULL,
    `thn_masuk` YEAR NOT NULL,
    `thn_lulus` YEAR NOT NULL,
    `gambar1_pendidikan` VARCHAR(100) NOT NULL,
    `gambar2_pendidikan` VARCHAR(100) NOT NULL,

    INDEX `id_level_pendidikan`(`id_level_pendidikan`),
    INDEX `id_pendanaan`(`id_pendanaan`),
    INDEX `id_status`(`id_status`),
    PRIMARY KEY (`id_riwayat_pendidikan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simpeg_status_pegawai` (
    `id_status_pegawai` TINYINT NOT NULL,
    `nama_status_pegawai` VARCHAR(50) NOT NULL DEFAULT '',
    `aktif` CHAR(1) NOT NULL,

    PRIMARY KEY (`id_status_pegawai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_level` (
    `id_level` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_level` CHAR(20) NOT NULL,

    PRIMARY KEY (`id_level`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `level` SMALLINT NOT NULL,
    `username` CHAR(35) NOT NULL,
    `password` VARCHAR(100) NULL,
    `nama_lengkap` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `no_telp` VARCHAR(100) NULL,
    `aktif` ENUM('Y', 'N') NOT NULL,
    `blokir` ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    `ket` VARCHAR(255) NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `data_change_requests` ADD CONSTRAINT `data_change_requests_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `simpeg_pegawai`(`id_pegawai`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `kol_kabupaten` ADD CONSTRAINT `kol_kabupaten_ibfk_1` FOREIGN KEY (`id_provinsi`) REFERENCES `kol_provinsi`(`id_prov`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `kol_prodi` ADD CONSTRAINT `kol_prodi_ibfk_1` FOREIGN KEY (`id_jurusan`) REFERENCES `kol_jurusan`(`id_jurusan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_13` FOREIGN KEY (`id_riwayat_pangkat`) REFERENCES `simpeg_riwayat_pangkat`(`id_riwayat_pangkat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_14` FOREIGN KEY (`id_status_pegawai`) REFERENCES `simpeg_status_pegawai`(`id_status_pegawai`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_15` FOREIGN KEY (`id_riwayat_pendidikan`) REFERENCES `simpeg_riwayat_pendidikan`(`id_riwayat_pendidikan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_16` FOREIGN KEY (`id_agama`) REFERENCES `kol_agama`(`id_agama`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_17` FOREIGN KEY (`gol_darah`) REFERENCES `kol_darah`(`id_darah`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_19` FOREIGN KEY (`id_status_hidup`) REFERENCES `kol_status_hidup`(`id_status_hidup`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_20` FOREIGN KEY (`id_pendidikan`) REFERENCES `kol_pendidikan`(`id_pendidikan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_21` FOREIGN KEY (`id_wil`) REFERENCES `kol_wilayah`(`id_wil`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_22` FOREIGN KEY (`id_kabupaten`) REFERENCES `kol_kabupaten`(`id_kabupaten`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_23` FOREIGN KEY (`id_prov`) REFERENCES `kol_provinsi`(`id_prov`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_24` FOREIGN KEY (`id_bagian`) REFERENCES `simpeg_bagian`(`id_bagian`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_25` FOREIGN KEY (`id_jurusan`) REFERENCES `kol_jurusan`(`id_jurusan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_26` FOREIGN KEY (`id_prodi`) REFERENCES `kol_prodi`(`id_prodi`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_27` FOREIGN KEY (`id_jabatan_struktural`) REFERENCES `simpeg_jabatan_struktural`(`id_jabatan_struktural`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_pegawai` ADD CONSTRAINT `simpeg_pegawai_ibfk_28` FOREIGN KEY (`id_jabatan_fungsional`) REFERENCES `simpeg_jabatan_fungsional`(`id_jabatan_fungsional`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_riwayat_pangkat` ADD CONSTRAINT `simpeg_riwayat_pangkat_ibfk_1` FOREIGN KEY (`id_pangkat_gol_ruang`) REFERENCES `simpeg_pangkat_gol_ruang`(`id_pangkat_gol_ruang`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_riwayat_pendidikan` ADD CONSTRAINT `simpeg_riwayat_pendidikan_ibfk_2` FOREIGN KEY (`id_pendanaan`) REFERENCES `simpeg_pendanaan`(`id_pendanaan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simpeg_riwayat_pendidikan` ADD CONSTRAINT `simpeg_riwayat_pendidikan_ibfk_3` FOREIGN KEY (`id_level_pendidikan`) REFERENCES `simpeg_level_pendidikan`(`id_level_pendidikan`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `simpeg_riwayat_pendidikan` ADD CONSTRAINT `simpeg_riwayat_pendidikan_ibfk_4` FOREIGN KEY (`id_status`) REFERENCES `kol_status`(`id_status`) ON DELETE RESTRICT ON UPDATE RESTRICT;

