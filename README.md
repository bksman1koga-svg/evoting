# E-voting OSIS SMA Negeri 1 Kota Gajah (versi database bersama)

Data siswa, guru, paslon, dan suara tersimpan di database online (Neon Postgres) lewat API Vercel.
Admin cukup mengisi data satu kali, lalu link bisa disebar. Siswa dari HP mana pun menemukan datanya.

Login admin awal: `admin` / `admin123` (segera ganti di menu Pengaturan).
Login siswa: NIS. Login guru/tendik: NIP.

## Susunan file (semua di tingkat paling atas repo GitHub)
- index.html, style.css, app.js, folder assets
- package.json
- folder api: _lib.js, public.js, admin.js, ping.js

## Cara memasang
1. Hapus file lama di repo GitHub (termasuk folder .github dan file .nojekyll), lalu unggah semua isi zip ini. Pastikan folder api dan package.json ada di halaman depan repo.
2. Vercel: Settings > General > Framework Preset = Other, Root Directory kosong. Hapus Output Directory jika ada isinya.
3. Vercel: tab Storage > Create Database > Neon, hubungkan ke proyek (kolom prefix dikosongkan).
4. Deployments > titik tiga > Redeploy sampai Ready.
5. Buka /api/ping di alamat Vercel. Harus tampil: server ok, database terhubung.
6. Login admin, upload ulang Excel siswa (kolom NIS, Nama, Kelas) dan guru (NIP, Nama), isi paslon dan pengaturan.
