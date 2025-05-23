﻿
# 📘 Admin CRUD Pegawai – API Documentation

## 🚀 Cara Menjalankan Aplikasi

### 🔑 Login
```http
POST http://localhost:4000/api/auth/login
```
**Request Body:**
```json
{
  "username": "09876543211234567890",
  "password": "admin"
}
```

---

## 👥 Manajemen Pegawai

### ➕ Menambah Data Pegawai
```http
POST http://localhost:4000/api/pegawai
```
**Request Body:**
## From-data (cuma foto aja yg file)
```
nama_pegawai:nancin
nip:747547547545
no_ktp:3424453553543
jk:1
id_agama:1
tempat_lahir:banjarmasin
tgl_lahir:1940-01-01
nidn:98343400013
no_kk:6565656564774
id_status_hidup:1
gol_darah:1
id_pendidikan:1
alamat:jln.banyu
kota:Kab. Kepulauan Seribu
kode_pos:12345
id_wil:010000
id_kabupaten:0101
id_prov:12
handphone:912345453222
email_poliban:nancin@example.com
id_jabatan_struktural:1
id_jabatan_fungsional:1
id_riwayat_pangkat:1100
id_riwayat_pendidikan:16
id_status_pegawai:1
id_bagian:2
id_jurusan:1
id_prodi:1
foto": default.jpg (file)
}
```

---

### ✏️ Mengubah Data Pegawai
```http
PUT http://localhost:4000/api/pegawai/{id}
```
**Request Body (Contoh):**
```json
{
  "nama_pegawai": "Saidi",
  "panggilan": "Saidi",
  "jk": "L",
  "id_agama": 1,
  "alamat": "Jl. Contoh No. 123",
  "kota": "Surabaya",
  "kode_pos": "60111",
  "id_wil": "35781000",
  "id_kabupaten": "3578",
  "id_prov": "35",
  "telpon": "031123456",
  "handphone": "081234567890",
  "email": "pegawai@example.com",
  "email_poliban": "pegawai@poliban.ac.id",
  "website": "www.example.com",
  "id_jabatan_fungsional": 1,
  "id_jabatan_struktural": 3,
  "id_status_pegawai": "1",
  "id_bagian": 1,
  "foto": "default.jpg",
  "foto_ktp": "default.jpg",
  "foto_npwp": "default.jpg",
  "foto_karpeg": "default.jpg",
  "foto_surat_nikah": "default.jpg",
  "foto_taspen": "default.jpg",
  "foto_nip": "default.jpg"
}
```

---

## 👤 Update Profil Pegawai

### 🟡 Update Data Non-Sensitif (oleh Pegawai)
```http
PUT http://localhost:4000/api/pegawai/profile/non-sensitive/{id}
```
**Request Body:**
```json
{
  "alamat": "Jl. Baru No. 456",
  "kota": "Jakarta",
  "kode_pos": "12345",
  "telpon": "021987654",
  "handphone": "08987654321",
  "email": "pegawai_update@example.com",
  "website": "www.pegawai.com",
  "id_prov": "31",
  "id_kabupaten": "3171",
  "email_poliban": "pegawai_update@poliban.ac.id"
}
```

---

### 🔐 Request Perubahan Data Sensitif (oleh Pegawai)
```http
POST http://localhost:4000/api/pegawai/profile/request-sensitive/{id}
```
**Request Body:**
```json
{
  "field": "email",
  "newValue": "newemail@example.com",
  "reason": "Perubahan alamat email untuk komunikasi"
}
```
> 🔒 Harus login sebagai pegawai

---

## 🛠️ Manajemen Request Perubahan (Admin)

### 📄 Melihat Semua Permintaan
```http
GET http://localhost:4000/api/pegawai/admin/change-requests
```

### 🔍 Melihat Detail Permintaan
```http
GET http://localhost:4000/api/pegawai/admin/change-requests/{id}
```

### ✅ Menyetujui / ❌ Menolak Permintaan
```http
PUT http://localhost:4000/api/pegawai/admin/change-requests/{id}
```
**Untuk menyetujui:**
```json
{
  "status": "approved",
  "keterangan": "Perubahan disetujui"
}
```
**Untuk menolak:**
```json
{
  "status": "rejected",
  "keterangan": "Perubahan ditolak karena alasan XYZ"
}
```

---  
> 🧠 Pastikan token JWT dikirim di `Authorization` header saat mengakses endpoint yang membutuhkan autentikasi.


{
    "message": "Selamat Anda login sebagai Pegawai",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOjIsInBlZ2F3YWlJZCI6NCwiaWF0IjoxNzQ3MjEwNTQzLCJleHAiOjE3NDcyOTY5NDN9.6Rp89_LjQ6Du_HjC0AAvbjjbVPW4wWa0Q1DKtjx2cW0",
    "user": {
        "id": 3,
        "username": "11111111111111111111111111111122222",
        "role": 2,
        "nama": "Iqbal pm geming",
        "pegawai": {
            "id": 4,
            "nip": "11111111111111111111111111111122222222222",
            "nama": "Iqbal pm geming",
            "jabatan": "dosen",
            "status": ""
        }
    }
}login ini harusnya

{
  "nama_pegawai": "Iqbal",
  "nip": "19900101202233",
  "no_ktp": "3578121234567890",
  "jk": "L",
  "id_agama": 1,
  "nidn": "0000000000",
  "no_kk": "3578121234567890",
  "gol_darah": "O",
  "id_pendidikan": "1",
  "alamat": "Jl. Contoh No. 123",
  "kota": "Surabaya",
  "kode_pos": "60111",
  "id_wil": "35781000",
  "id_kabupaten": "3578",
  "id_prov": "35",
  "handphone": "081234567890",
  "email_poliban": "pegawai@poliban.ac.id",
  "email": "pegawai@example.com",
  "id_jabatan_fungsional": 1,
  "id_jabatan_struktural": 3,
  "id_status_pegawai": 1,
  "id_bagian": 1,
  "foto": "default.jpg"
}



// Mapping dari id ke deskripsi
const darahMapping = {
  1: "A",
  2: "B",
  3: "AB",
  4: "O",
  5: "DUMMY"
};

const pendidikanMapping = {
  1: "SD",
  2: "SMP",
  3: "SMA",
  // Tambahkan mapping lainnya sesuai kebutuhan
};

const statusHidupMapping = {
  1: "Hidup",
  2: "Meninggal",
  // Tambahkan mapping lainnya sesuai kebutuhan
};

const jurusanMapping = {
  1: "Teknik Sipil dan Kebumian",
  2: "Teknik Elektro",
  3: "Teknik Mesin",
  4: "Akuntansi",
  5: "Administrasi Bisnis",
  6: "Tidak di jurusan",
  10: "DUMMY",
  11: "-"
};

const jkMapping = {
  1: "Laki-Laki",
  2: "Perempuan"
};

const kabupatenMapping = {
  // Tambahkan mapping kabupaten sesuai data yang Anda miliki
};

const agamaMapping = {
  1: "ISLAM",
  2: "KRISTEN KATOLIK",
  3: "KRISTEN PROTESTAN",
  4: "BUDHA",
  5: "HINDU",
  6: "LAIN-LAIN"
};

// Gunakan mapping ini dalam kode Anda untuk mengubah id menjadi deskripsi


020726
Kec. Campaka Mulya            
020700  
3
020727
Kec. Cikadu                   
020700  
3
020728
Kec. Leles                    
020700  
3
020729
Kec. Cijati                   
020700  
3
020730
Kec. Gekbrong                 
020700  
3
020731
Kec. Cipanas                  
020700  
3
020732
Kec. Haurwangi                
020700  
3
020733
Kec. Pasirkuda                
020700  
3
020800
Kab. Bandung                  
020000  
2
020801
Kec. Ciwidey                  
020800  
3
020802
Kec. Pasirjambu               
020800  
3
020803
Kec. Cimaung                  
020800  
3
020804
Kec. Pangalengan              
020800  
3
020805
Kec. Kertasari                
020800  
3
020806
Kec. Pacet                    
020800  
3
020807
Kec. Ibun                     
020800  
3
020808
Kec. Paseh                    
020800  
3
020809
Kec. Cikancung                
020800  
3
020810
Kec. Cicalengka               
020800  
3
020811
Kec. Rancaekek                
020800  
3
020812
Kec. Majalaya                 
020800  
3
020813
Kec. Ciparay                  
020800  
3
020814
Kec. Bale Endah               
020800  
3
020815
Kec. Arjasari                 
020800  
3
020816
Kec. Banjaran                 
020800  
3
020817
Kec. Pameungpeuk              
020800  
3
020818
Kec. Ketapang                 
020800  
3
020819
Kec. Soreang                  
020800  
3
020820
Kec. Marga Asih               
020800  
3
020821
Kec. Margahayu                
020800  
3
020822
Kec. Dayeuhkolot              
020800  
3
020823
Kec. Bojongsoang              
020800  
3
020824
Kec. Cileunyi                 
020800  
3
020825
Kec. Cilengkrang              
020800  
3
020826
Kec. Cimenyan                 
020800  
3
020829
Kec. Rancabali                
020800  
3
020830
Kec. Nagreg                   
020800  
3
020831
Kec. Solokan Jeruk            
020800  
3
020832
Kec. Cangkuang                
020800  
3
020833
Kec. Kutawaringin             
020800  
3
021000
Kab. Sumedang                 
020000  
2
021001
Kec. Jatinangor               
021000  
3
021002
Kec. Cimanggung               
021000  
3
021003
Kec. Tanjungsari              
021000  
3
021004
Kec. Rancakalong              
021000  
3
021005
Kec. Sumedang Selatan         
021000  
3
021006
Kec. Sumedang Utara           
021000  
3
021007
Kec. Situraja                 
021000  
3
021008
Kec. Darmaraja                
021000  
3
021009
Kec. Cibugel                  
021000  
3
021010
Kec. Wado                     
021000  
3
021012
Kec. Tomo                     
021000  
3
021013
Kec. Ujung Jaya               
021000  
3
021014
Kec. Conggeang                
021000  
3
021015
Kec. Paseh                    
021000  
3
021016
Kec. Cimalaka                 
021000  
3
021017
Kec. Tanjungkerta             
021000  
3
021018
Kec. Buah Dua                 
021000  
3
021019
Kec. Ganeas                   
021000  
3

nama_pegawai:hifni
nip:12345678910111111
no_ktp:12672343241908
jk:1
id_agama:1
tempat_lahir:Jakarta
tgl_lahir:1940-01-01
nidn:231312000000
no_kk:1232137640
id_status_hidup:1
gol_darah:1
id_pendidikan:1
alamat:jln.banyu
kota:Kab. Kepulauan Seribu
kode_pos:12345
id_wil:010000
id_kabupaten:0101
id_prov:12
handphone:08123400089
email_poliban:foto@example.com
id_jabatan_struktural:1
id_jabatan_fungsional:1
id_riwayat_pangkat:1100
id_riwayat_pendidikan:16
id_status_pegawai:1
id_bagian:2
id_jurusan:1
id_prodi:1
