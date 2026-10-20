'use strict';
const fs = require('fs');
const path = require('path');
const steps = require('../data/steps.json');
const rules = [
  ['Hash::make(\'password123\')', 'Hash mengubah password menjadi hasil satu arah untuk disimpan. Saat login, sistem mengecek kecocokan password dengan hash; hasil ini tidak dibuka kembali menjadi password asli.'],
  ['use Illuminate\\Support\\Facades\\Hash;', 'Import ini membuat nama pendek Hash bisa digunakan. Mengimpor class belum menjalankan proses hashing.'],
  ['use WithoutModelEvents;', 'Trait ini menonaktifkan event model ketika seeder berjalan. Kode listener/observer model tidak ikut terpanggil dari seeder tersebut.'],
  ['use HasFactory;', 'Trait menambahkan kemampuan ke class. HasFactory menyediakan akses factory untuk membuat data contoh/pengujian; baris ini sendiri tidak membuat data.'],
  ["protected $guarded = ['id'];", 'Saat mengisi banyak atribut sekaligus melalui create/update, kolom id tidak boleh diisi lewat daftar atribut itu. Ini pengaturan pengisian model, bukan pembatas akses admin.'],
  ["protected $table = 'order_details';", 'Menentukan tabel database yang dipakai model. Model OrderDetail ini diarahkan ke tabel order_details.'],
  ['->foreignId(', 'Membuat kolom ID untuk menghubungkan baris ini dengan data pada tabel lain. Aturan hubungan database ditambahkan lewat constrained.'],
  ['->constrained(', 'Membuat aturan foreign key ke tabel yang disebut, dengan kolom id sebagai tujuan bawaan. ID yang disimpan harus merujuk ke data induk yang ada.'],
  ["->onDelete('cascade')", 'Jika data induk dihapus, baris detail yang terhubung ikut dihapus oleh database. Contohnya: menghapus pesanan juga menghapus detail pesanan itu.'],
  ['->nullable()', 'Kolom boleh menyimpan NULL, yaitu tidak ada nilai. Cocok untuk gambar yang belum diunggah.'],
  ["->enum('category'", 'Nilai kategori dibatasi ke pilihan yang tertulis di dalam array. Teks di luar pilihan itu tidak sesuai dengan aturan kolom.'],
  ['->hasMany(', 'Relasi satu-ke-banyak: satu pesanan dapat memiliki beberapa baris detail. orderDetails dapat dipakai untuk membaca semua item pesanan.'],
  ['->belongsTo(', 'Relasi dari detail menuju data induknya. Contohnya food() membaca satu makanan yang dirujuk oleh food_id pada detail.'],
  ['DB::table(\'foods\')->insert([', 'Memasukkan beberapa baris contoh langsung ke tabel foods. Array terluar menampung daftar makanan; tiap array di dalamnya mewakili satu baris.'],
  ['$this->call([', 'DatabaseSeeder meminta Laravel menjalankan seeder lain dalam daftar ini, yaitu FoodSeeder. $this berarti objek class yang sedang berjalan.'],
  ['migrate:fresh --seed', 'fresh menghapus semua tabel lalu membuatnya kembali; --seed mengisi data contoh. Ini bukan sekadar menambahkan tabel yang belum ada.'],
  ['php artisan make:model Food -mcr', '-m membuat migration, -c membuat controller, dan -r membuat controller dengan method resource/CRUD. Food adalah nama modelnya.'],
  ['php artisan make:model Order -mcr', '-m membuat migration, -c membuat controller, dan -r membuat controller dengan method resource/CRUD. Order adalah nama modelnya.'],
  ['php artisan storage:link', 'Membuat tautan dari public/storage menuju storage/app/public agar gambar di disk public dapat diakses lewat browser.'],
  ['->paginate(10)', 'Membagi daftar ke beberapa halaman, paling banyak 10 data per halaman. Ini membuat seluruh menu tidak harus ditampilkan sekaligus.'],
  ['Food::latest()', 'Mengambil query makanan dengan urutan terbaru berdasarkan created_at secara bawaan. Query baru dijalankan saat hasilnya diminta, misalnya oleh paginate.'],
  ["compact('foods')", 'Membentuk array dengan nama foods dan isi dari variabel $foods. Ini mengirim data ke view agar Blade bisa membacanya.'],
  ["compact('food')", 'Membentuk array dengan nama food dan isi dari variabel $food. View edit menerima data satu makanan melalui nama itu.'],
  ["compact('orders')", 'Mengirim variabel $orders ke view dengan nama orders. Itu yang dipakai perulangan pada dashboard.'],
  ['$request->validate([', 'Memeriksa data dari form sesuai aturan. Jika input tidak lolos, Laravel mengembalikan error validasi dan kode berikutnya tidak dilanjutkan seperti input normal.'],
  ['nullable|image|mimes:jpeg,png,jpg|max:2048', 'File gambar boleh tidak dikirim. Jika dikirim harus berupa gambar dengan tipe yang diizinkan, dan ukurannya paling besar 2048 KB.'],
  ['required|string|max:255', 'Wajib diisi, harus berupa teks, dan panjangnya paling banyak 255 karakter. Tanda | memisahkan beberapa aturan validasi.'],
  ["->store('foods', 'public')", 'Menyimpan unggahan di folder foods pada disk public. Nilai yang dikembalikan adalah path file untuk dicatat di database, bukan isi gambar.'],
  ["Storage::disk('public')->delete", 'Menghapus file gambar dari disk public. Menghapus baris makanan di database saja tidak otomatis menghapus file gambar.'],
  ['fn ($qty) => $qty > 0', 'Fungsi singkat yang menerima satu jumlah. Hasilnya true hanya untuk jumlah di atas nol, sehingga array_filter membuang item yang tidak dipesan.'],
  ['DB::beginTransaction();', 'Memulai satu kelompok perubahan database. Kelompok ini baru dipastikan tersimpan lewat commit, atau dibatalkan lewat rollBack jika ada kegagalan.'],
  ['DB::commit();', 'Menyetujui perubahan database pada transaksi aktif agar tersimpan. Dipanggil setelah pesanan dan semua detail berhasil dibuat.'],
  ['DB::rollBack();', 'Membatalkan perubahan pada transaksi yang belum di-commit ketika proses masuk ke catch. Pesanan tidak dibiarkan tersimpan sebagian.'],
  ['Food::findOrFail($foodId)', 'Mencari makanan berdasarkan ID. Jika ID tidak ditemukan, Laravel melempar exception, lalu alur ini masuk ke catch.'],
  ["Order::with('orderDetails.food')", 'Memuat pesanan beserta detail dan makanan terkait sekaligus lewat eager loading. Tanda titik berarti relasi bertingkat: pesanan → detail → makanan.'],
  ['Order::findOrFail($id)', 'Mencari pesanan berdasarkan ID. Jika tidak ada, Laravel menghentikan alur normal dengan exception.'],
  ["->with('success'", 'Menitipkan pesan sementara di session untuk request berikutnya setelah redirect. Ini berbeda dari with untuk eager loading pada query model.'],
  ['@csrf', 'Blade membuat input token agar Laravel dapat memeriksa bahwa kiriman form berasal dari sesi yang sah. Token dibutuhkan oleh form POST pada aplikasi web Laravel.'],
  ["@method('DELETE')", 'Form HTML mengirim POST, tetapi input tersembunyi ini memberi tahu Laravel untuk memperlakukannya sebagai DELETE agar cocok dengan route hapus.'],
  ["@method('PUT')", 'Form HTML mengirim POST, tetapi Laravel membacanya sebagai PUT supaya cocok dengan route pembaruan data.'],
  ["@method('PATCH')", 'Form HTML mengirim POST, tetapi Laravel membacanya sebagai PATCH supaya cocok dengan route perubahan status.'],
  ['enctype="multipart/form-data"', 'Memungkinkan form mengirim isi file unggahan, bukan hanya teks biasa. Dibutuhkan untuk input gambar.'],
  ["asset('storage/'", 'Membentuk URL aset gambar yang dapat dibaca browser. public/storage harus sudah terhubung lewat storage:link.'],
  ['@forelse(', 'Melakukan perulangan seperti foreach, dengan bagian @empty untuk tampilan ketika daftar pesanan kosong.'],
  ["?? 'Menu'", 'Operator ?? memakai nilai cadangan Menu ketika nilai sebelumnya tidak tersedia atau NULL. Ini membantu menampilkan label pengganti.'],
  ["->middleware(['auth', 'verified'])", 'Route melewati pemeriksaan autentikasi dan middleware verifikasi email. Perilaku verifikasi bergantung pada konfigurasi model pengguna dan aplikasi.'],
  ["Route::resource('/admin/foods'", 'Mendaftarkan kumpulan route CRUD sekaligus, seperti index, create, store, edit, update, dan destroy pada FoodController.'],
  ["->name('customer.index')", 'Memberi nama tetap untuk route. Pemanggilan route dengan nama ini menghasilkan URL tanpa harus menulis alamatnya berulang-ulang.']
];

const notes = {};
for (const step of steps) {
  const matches = rules.map(([match, text]) => {
    const offset = step.code.indexOf(match);
    if (offset < 0) return null;
    return { code: match, line: step.code.slice(0, offset).split('\n').length, text };
  }).filter(Boolean).sort((a, b) => a.line - b.line);
  if (matches.length) notes[step.id] = matches;
}
fs.writeFileSync(path.join(__dirname, '../data/notes.json'), JSON.stringify(notes, null, 2) + '\n');
console.log(`${Object.keys(notes).length} langkah memiliki penjelasan terpilih; kode sumber tidak diubah.`);
