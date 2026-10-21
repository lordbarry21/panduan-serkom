# Bonus — Kisi-kisi Serkom

Materi tambahan untuk belajar teori dan latihan. Contoh bonus tidak berasal dari perpustakaan.md dan tidak mengubah 55 langkah asli. Contoh kode perlu diterapkan sendiri pada proyek latihan setelah prasyaratnya selesai.

## Teori 1 · Tools untuk membuat proyek

Jalur: Teori

### Pengertian / jawaban singkat

Tools utama: VS Code untuk bukulis kode, PHP untuk menjalankan backend, Laravel sebagai framework, Composer untuk paket PHP, MySQL untuk database, serta Node.js/npm untuk tooling frontend. Browser dipakai untuk menguji hasil.

### Alat dan perannya

- VS Code: editor untuk bukulis kode, membuka folder, dan memakai terminal. VS Code bukan server database.
- PHP: bahasa/runtime yang menjalankan backend Laravel.
- Composer: pengelola dependensi PHP dan alat untuk membuat proyek Laravel.
- Laravel: framework PHP yang menyediakan routing, controller, model, migration, validasi, dan autentikasi.
- MySQL: sistem pengelola database. phpMyAdmin adalah antarmuka untuk mengelolanya; keduanya berbeda.
- Node.js dan npm: menjalankan tooling frontend serta mengelola dependensinya; Vite menyiapkan aset CSS/JavaScript.
- Browser: membuka halaman dan menguji interaksi. Terminal: menjalankan perintah.
- Git dan GitHub: mencatat riwayat perubahan serta menyimpan/berbagi repository. Keduanya tidak wajib agar Laravel bisa berjalan lokal.
- Laragon atau XAMPP (opsional): paket yang membantu menyediakan PHP, server web, dan database. Pilih sesuai komputer, tidak harus memasang semuanya.

### Cek alat yang tersedia

Lokasi: Terminal

```shellscript
php --version
composer --version
node --version
npm --version
```

Perintah ini menampilkan versi. MySQL juga harus berjalan; cek dari aplikasi/service database yang dipakai.

### Saat diminta menjelaskan

Saya bukulis kode memakai VS Code, menjalankan Laravel dengan PHP, mengelola paket PHP dengan Composer, menyimpan data di MySQL, dan menyiapkan aset frontend memakai npm/Vite.

### Checklist latihan

- [ ] Bisa membedakan editor, bahasa, framework, dan database.
- [ ] Bisa menyebut fungsi Composer dan npm.
- [ ] Bisa bukunjukkan cara menjalankan proyek yang sudah disiapkan.

## Teori 2 · Fungsi ERD dan database

Jalur: Teori

### Pengertian / jawaban singkat

ERD adalah diagram rancangan entitas, atribut, dan relasi. Database adalah tempat penyimpanan/pengelolaan data sebenarnya. ERD membantu menentukan struktur tabel; primary key membedakan record dan foreign key menghubungkan tabel.

### Istilah yang perlu dipahami

Tabel menyimpan satu jenis data. Kolom adalah atribut, baris adalah satu record. Primary key membedakan tiap record. Foreign key menghubungkan record ke tabel lain. ERD membantu merancang hubungan dan mengurangi pengulangan data sebelum kode dibuat.

### Hubungan dari materi utama

Lokasi: Sketsa ERD

```plaintext
books (id)   1 ─── N order_details (book_id)
orders (id)  1 ─── N order_details (order_id)

users: akun untuk login/register
```

Satu peminjaman mempunyai banyak detail. Satu buku dapat muncul di banyak detail peminjaman. order_details menjadi penghubung orders dan books.

### Contoh yang mudah dibayangkan

Peminjaman nomor 10 berisi dua bakso dan satu es teh. Tabel orders menyimpan identitas/total peminjaman, sementara order_details menyimpan dua baris item beserta jumlahnya. Nama buku dibaca dari books lewat book_id.

### Batas materi asli

Pada .md asli, orders belum mempunyai user_id. Nama anggota disimpan sebagai teks, jadi jangan menyebut orders sudah terhubung ke users melalui foreign key. Relasi user-peminjaman memerlukan penambahan kolom dan aturan baru di luar materi asli.

### Checklist latihan

- [ ] Bisa menggambar dua hubungan 1 ke banyak di atas.
- [ ] Bisa menjelaskan mengapa peminjaman perlu tabel detail.
- [ ] Bisa bukunjuk primary key dan foreign key.

## Teori 3 · CRUD MySQL: tambah, lihat, edit, hapus

Jalur: Teori

### Pengertian / jawaban singkat

CRUD berarti Create, Read, Update, Delete. Dalam SQL MySQL: tambah memakai INSERT, tampilkan memakai SELECT, edit memakai UPDATE, dan hapus memakai DELETE. WHERE membatasi record yang diproses.

### Pasangan yang harus hafal

- Create / tambah → INSERT.
- Read / tampilkan → SELECT.
- Update / edit → UPDATE.
- Delete / hapus → DELETE.

### Tempat mencoba

Jalankan contoh ini pada database latihan yang sudah memiliki tabel books dari materi utama, lewat SQL editor/phpMyAdmin atau client MySQL. Ini SQL, bukan command terminal PHP. Jalankan blok secara berurutan dalam sesi koneksi yang sama.

### 1. Tambah satu buku latihan

Lokasi: SQL editor MySQL · database latihan

```sql
INSERT INTO books (name, category, price, description, image, created_at, updated_at)
VALUES ('Buku Latihan Bonus', 'Fiksi', 12000, 'Data untuk latihan CRUD.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SET @book_id = LAST_INSERT_ID();
```

INSERT membuat record. LAST_INSERT_ID mengambil ID record baru pada koneksi ini; @book_id menyimpannya agar contoh edit/hapus tidak menyentuh buku lain.

### 2. Tampilkan buku yang baru dibuat

Lokasi: SQL editor MySQL · koneksi yang sama

```sql
SELECT id, name, category, price
FROM books
WHERE id = @book_id;
```

SELECT memilih kolom. FROM menyebut tabel. WHERE membatasi record yang ditampilkan.

### 3. Ubah harga buku latihan

Lokasi: SQL editor MySQL · koneksi yang sama

```sql
UPDATE books
SET price = 15000, updated_at = CURRENT_TIMESTAMP
WHERE id = @book_id;
```

SET menetapkan nilai baru. WHERE memastikan hanya record latihan yang berubah.

### 4. Hapus buku latihan

Lokasi: SQL editor MySQL · koneksi yang sama

```sql
DELETE FROM books
WHERE id = @book_id;
```

DELETE menghapus record. Menghilangkan WHERE pada UPDATE/DELETE dapat mengubah atau menghapus semua record tabel.

### Checklist latihan

- [ ] Bisa menyebut keempat perintah tanpa melihat catatan.
- [ ] Bisa menampilkan data sesudah INSERT dan UPDATE.
- [ ] Bisa menjelaskan kegunaan WHERE sebelum menjalankan DELETE.

## Teori 4 · Apa itu query dan manfaatnya?

Jalur: Teori

### Pengertian / jawaban singkat

Query adalah permintaan/perintah ke database. Manfaatnya untuk membaca, menyaring, mengurutkan, menambah, mengubah, menghapus, dan membuat rekap data secara terukur tanpa menghitung manual.

### Jawaban singkat untuk ujian

Query dipakai untuk meminta data tertentu atau mengolahnya. Dengan query, kita bisa menambah data, menyaring kategori, mengurutkan harga, mencari peminjaman dalam rentang waktu, dan membuat rekap tanpa menghitung manual.

### Minta tiga buku termurah

Lokasi: SQL editor MySQL

```sql
SELECT id, name, price
FROM books
WHERE category = 'Fiksi'
ORDER BY price ASC, id ASC
LIMIT 3;
```

WHERE menyaring kategori, ORDER BY mengurutkan, ASC berarti naik dari nilai kecil, dan LIMIT membatasi banyak hasil.

### Hitung jumlah buku per kategori

Lokasi: SQL editor MySQL

```sql
SELECT category, COUNT(*) AS total_buku
FROM books
GROUP BY category
ORDER BY category;
```

COUNT menghitung baris. GROUP BY mengelompokkan baris berdasarkan kategori. AS memberi nama kolom hasil agar mudah dibaca.

### SQL dengan Eloquent

Book::all() pada Laravel juga membaca database. Eloquent menerjemahkan pemanggilan model/query builder menjadi SQL. Saat memakai input pengguna, gunakan binding/parameter atau query builder; jangan gabungkan input mentah ke string SQL.

### Checklist latihan

- [ ] Bisa membedakan WHERE, ORDER BY, GROUP BY, dan LIMIT.
- [ ] Bisa membaca hasil query dan menjelaskan artinya.

## Soal 1 · Login dan register admin/user

Jalur: Latihan

### Soal latihan

Buat halaman login dan register. Akun user dapat membuka katalog, sedangkan akun admin dapat mengakses dashboard dan halaman pengelolaan. User biasa tidak boleh membuka URL admin secara langsung.

### Langkah pengerjaan

1. Siapkan database/proyek latihan. Pasang dan jalankan Breeze sesuai modul 2 step 1–3, lalu coba halaman /register dan /login.
2. Buat migration baru untuk kolom users.role dengan default user, isi migration memakai jawaban di bawah, lalu jalankan php artisan migrate.
3. Tetapkan role admin pada akun seeder latihan melalui Tinker. Akun register publik tetap mendapatkan role user.
4. Tambahkan import dan Gate manage-admin pada AppServiceProvider.boot().
5. Ganti route dashboard dan pindahkan route admin ke group auth dan can:manage-admin. Jangan menduplikasi route.
6. Atur redirect sukses login/register: admin ke dashboard, user ke katalog, dengan tetap mempertahankan validasi dan proses autentikasi Breeze.
7. Uji register/login/logout, password salah, dan akses langsung URL admin memakai user biasa.

### Jawaban / contoh penyelesaian

Jawabannya memakai autentikasi Breeze ditambah kolom role dan Gate di server. Login memeriksa identitas; Gate membatasi hak akses. Kode lengkap penambahan role, Gate, route, dan redirect ada di bawah.

### Alur yang dikerjakan

- Ikuti modul 2 langkah 1–3 untuk pemasangan Breeze pada proyek latihan yang sudah siap.
- Buka /register. Buat akun user dengan nama, email unik, password, dan konfirmasi password.
- Keluar, lalu masuk lagi lewat /login dengan akun tadi.
- Akun admin memakai login yang sama. Perbedaan hak akses dibuat lewat role dan pemeriksaan server pada dua bonus berikutnya.

### Authentication dan authorization

Authentication memastikan siapa yang login. Authorization menentukan apa yang boleh dilakukan oleh akun itu. Login berhasil tidak otomatis berarti akun adalah admin.

### Password dan form

Hash::make menyimpan hash password. Input konfirmasi harus cocok dengan password. @csrf membantu memvalidasi kiriman form. Jangan menyimpan password sebagai teks asli dan jangan menyediakan pilihan menjadi admin pada register publik.

### Hal yang belum tercakup otomatis

Materi utama sudah memasang login/register, tetapi belum membedakan role admin dan user. Menyembunyikan tombol admin saja tidak cukup; URL admin harus dibatasi dari server.

### Buat migration tambahan

Lokasi: Terminal proyek latihan

```shellscript
php artisan make:migration add_role_to_users_table --table=users
```

Jangan mengedit migration lama yang sudah dijalankan. Command menghasilkan satu file migration baru.

### Isi file migration baru

Lokasi: database/migrations/..._add_role_to_users_table.php · ganti seluruh isi file baru

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
```

Default user membuat akun baru mendapatkan hak biasa. Jangan tambahkan kolom ini lagi jika proyek sudah punya role.

### Terapkan migration

Lokasi: Terminal proyek latihan

```shellscript
php artisan migrate
```

Ini menerapkan migration yang belum dijalankan, bukan migrate:fresh yang menghapus seluruh tabel.

### Buka Tinker

Lokasi: Terminal proyek latihan

```shellscript
php artisan tinker
```

Tinker adalah console PHP Laravel. Ketik blok berikut di dalam Tinker, bukan di SQL editor.

### Tetapkan akun admin dari seeder

Lokasi: Tinker · jalankan baris demi baris

```php
$admin = App\Models\User::where('email', 'admin@gmail.com')->firstOrFail();
$admin->role = 'admin';
$admin->save();
```

Gunakan akun admin latihan dari seeder materi utama. Jika email berbeda, sesuaikan email pencarian. Role ditetapkan dari lingkungan pengelola, bukan dari register publik.

### Import yang diperlukan

Lokasi: app/Providers/AppServiceProvider.php · bagian use di atas class

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;
```

Tambahkan hanya import yang belum ada. Jangan mendeklarasikan alias yang sama dua kali.

### Daftarkan aturan

Lokasi: app/Providers/AppServiceProvider.php · di dalam method boot()

```php
Gate::define('manage-admin', fn (User $user): bool => $user->role === 'admin');
```

Gate mengembalikan true hanya untuk akun ber-role admin. Ini aturan authorization yang diperiksa di server.

### Dashboard memerlukan role admin

Lokasi: routes/web.php · GANTI route /dashboard yang lama, jangan tambah route kedua

```php
Route::get('/dashboard', [OrderController::class, 'adminDashboard'])
    ->middleware(['auth', 'can:manage-admin'])
    ->name('dashboard');
```

Materi contoh ini memakai auth dan Gate; bila proyek memang menerapkan verifikasi email, pertahankan middleware verified sesuai kebijakannya.

### Lindungi route admin lainnya

Pada group admin yang sudah ada, ganti middleware menjadi auth dan can:manage-admin. Pindahkan route /admin/dashboard, /admin/orders/.../status, serta resource /admin/books ke group tersebut. Jangan mendaftarkannya dua kali di dalam dan di luar group. Route profile tetap boleh diakses user yang login.

### Contoh group yang membatasi admin

Lokasi: routes/web.php · gunakan sebagai pembungkus route admin yang dipindahkan

```php
Route::middleware(['auth', 'can:manage-admin'])->group(function () {
    Route::get('/admin/dashboard', [OrderController::class, 'adminDashboard'])->name('admin.dashboard');
    Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.updateStatus');
    Route::resource('/admin/books', BookController::class);
});
```

Pemeriksaan ini berlaku juga ketika user mengetik URL secara langsung. Controller/route utama tidak otomatis diamankan hanya karena buku navigasi disembunyikan.

### Sesudah user register/login

Breeze dapat mengarahkan user ke /dashboard. Setelah route itu dibatasi admin, user biasa akan mendapat 403. Untuk latihan, ubah redirect sukses di controller login/register agar admin bukuju dashboard dan user bukuju route customer.index; autentikasi dan validasi yang sudah ada tetap dipertahankan.

### Arah redirect untuk tiap role

Lokasi: app/Http/Controllers/Auth/AuthenticatedSessionController.php dan RegisteredUserController.php · ganti return redirect sukses pada store()

```php
return redirect()->route($request->user()->role === 'admin' ? 'dashboard' : 'customer.index');
```

Pada controller register, letakkan return ini setelah akun dibuat dan Auth::login($user) yang sudah disediakan Breeze. Jangan menghapus validasi atau proses login aslinya.

### Checklist latihan

- [ ] Register user baru berhasil.
- [ ] Email yang sama ditolak saat register lagi.
- [ ] Login dengan password salah ditolak.
- [ ] Logout membuat halaman yang butuh login tidak bisa diakses langsung.
- [ ] Kolom users.role ada tepat sekali.
- [ ] Akun register baru mempunyai role user.
- [ ] Akun admin latihan mempunyai role admin.
- [ ] Keluar dari Tinker sebelum menjalankan command terminal lain.
- [ ] Admin bisa membuka /dashboard dan /admin/books.
- [ ] User biasa mendapat 403 ketika membuka URL admin langsung.
- [ ] Pengunjung belum login diarahkan ke login.
- [ ] User biasa setelah login/register diarahkan ke katalog.

## Soal 2 · CRUD book dan CRUD user

Jalur: Latihan

### Soal latihan

Buat fitur tambah, tampilkan, edit, dan hapus buku serta akun user. Hanya admin yang dapat mengelola data tersebut. Sertakan validasi input dan jangan menyimpan password sebagai teks asli.

### Langkah pengerjaan

1. Selesaikan autentikasi, role, dan Gate pada soal 1 agar route CRUD dapat dibatasi untuk admin.
2. Untuk CRUD book, gunakan model/migration/seeder modul 1, BookController modul 2 step 4, serta tiga view modul 2 step 5. Tempatkan route resource books pada group admin.
3. Uji tambah, baca, edit, dan hapus satu buku latihan. Controller, model, view, dan route harus saling terhubung.
4. Buat Admin/UserController dengan command resource pada jawaban. Ganti isi file controller baru menggunakan jawaban di bawah.
5. Tambahkan import UserController dan route resource admin.users satu kali di dalam group admin.
6. Buat folder resources/views/admin/users, lalu buat index.blade.php, create.blade.php, dan edit.blade.php sesuai jawaban.
7. Buka /admin/users sebagai admin. Tambah akun latihan, edit tanpa mengisi password untuk menguji password lama, lalu hapus akun latihan.
8. Uji validasi email unik, password/konfirmasi, larangan mengubah akun admin, serta penolakan akses CRUD dari user biasa.

### Jawaban / contoh penyelesaian

Jawaban CRUD book berikut disalin dari kode asli modul utama, dengan lokasi penerapan tiap potongan. Jawaban CRUD user mencakup controller, route, dan tiga view. Pemetaan operasinya: store = tambah, index = tampilkan, update = edit, destroy = hapus.

### Urutan berkas

- Model/migration/seeder: modul 1.
- BookController dan validasi: modul 2 step 4.
- View daftar/tambah/edit: modul 2 step 5.
- Route resource books: modul 4 step 2; untuk latihan role, letakkan di group admin pada bonus sebelumnya.

### Pemetaan tombol ke kode

- Daftar → GET /admin/books → index() → Read.
- Form tambah → create(); kirim form → store() → Create.
- Form edit → edit(); simpan perubahan → update() → Update.
- Tombol hapus → destroy() → Delete.

### Perhatikan upload

storage:link menghubungkan file gambar ke folder public. Form upload perlu multipart/form-data. File gambar tidak otomatis terhapus hanya karena baris database dihapus; materi BookController menangani file lama.

### Tanda sudah memahami

Bisa menjelaskan perjalanan input dari form, validasi controller, penyimpanan model, sampai daftar diperbarui. Jangan hanya menghafal nama tombol.

### Jawaban CRUD book · Tambahkan import Storage di atas class

Lokasi: app/Http/Controllers/BookController.php · Tambahkan import di bagian use di atas deklarasi class; jangan di dalam method.

```php
use Illuminate\Support\Facades\Storage;
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Ganti isi method index()

Lokasi: app/Http/Controllers/BookController.php · Ganti isi method index(), pertahankan deklarasi method dan kurungnya.

```php
$books = Book::latest()->paginate(10);
return view('admin.books.index', compact('books'));
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Ganti isi method create()

Lokasi: app/Http/Controllers/BookController.php · Ganti isi method create(), pertahankan deklarasi method dan kurungnya.

```php
return view('admin.books.create');
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Ganti isi method store()

Lokasi: app/Http/Controllers/BookController.php · Ganti isi method store(), pertahankan deklarasi method dan kurungnya.

```php
$request->validate([
    'name'        => 'required|string|max:255',
    'category'    => 'required|in:Fiksi,Nonfiksi,Referensi',
    'price'       => 'required|numeric|min:0',
    'description' => 'required|string',
    'image'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
]);

$imagePath = null;
if ($request->hasFile('image')) {
    $imagePath = $request->file('image')->store('books', 'public');
}

Book::create([
    'name'        => $request->name,
    'category'    => $request->category,
    'price'       => $request->price,
    'description' => $request->description,
    'image'       => $imagePath,
]);

return redirect()->route('books.index')->with('success', 'Data buku berhasil ditambahkan!');
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Ganti isi method edit()

Lokasi: app/Http/Controllers/BookController.php · Ganti isi method edit(), pertahankan deklarasi method dan kurungnya.

```php
return view('admin.books.edit', compact('book'));
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Ganti isi method update()

Lokasi: app/Http/Controllers/BookController.php · Ganti isi method update(), pertahankan deklarasi method dan kurungnya.

```php
$request->validate([
    'name'        => 'required|string|max:255',
    'category'    => 'required|in:Fiksi,Nonfiksi,Referensi',
    'price'       => 'required|numeric|min:0',
    'description' => 'required|string',
    'image'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
]);

$imagePath = $book->image;
if ($request->hasFile('image')) {
    if ($book->image && Storage::disk('public')->exists($book->image)) {
        Storage::disk('public')->delete($book->image);
    }
    $imagePath = $request->file('image')->store('books', 'public');
}

$book->update([
    'name'        => $request->name,
    'category'    => $request->category,
    'price'       => $request->price,
    'description' => $request->description,
    'image'       => $imagePath,
]);

return redirect()->route('books.index')->with('success', 'Data buku berhasil diperbarui!');
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Ganti isi method destroy()

Lokasi: app/Http/Controllers/BookController.php · Ganti isi method destroy(), pertahankan deklarasi method dan kurungnya.

```php
if ($book->image && Storage::disk('public')->exists($book->image)) {
    Storage::disk('public')->delete($book->image);
}
$book->delete();

return redirect()->route('books.index')->with('success', 'Data buku berhasil dihapus!');
```

Disalin dari jawaban kode asli modul utama. BookController menangani daftar, tambah, edit, hapus buku dan penyimpanan gambar.

### Jawaban CRUD book · Buat folder dan file view daftar buku, isi seluruh file

Lokasi: resources/views/admin/books/index.blade.php · Ganti seluruh isi file view ini.

```html
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Master Data Buku</h2>
    </x-slot>

    <div class="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <a href="{{ route('books.create') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4 inline-block font-semibold">+ Tambah Buku</a>

        @if(session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">{{ session('success') }}</div>
        @endif

        <table class="w-full bg-white border mt-4 shadow-sm rounded-lg overflow-hidden">
            <thead>
                <tr class="bg-gray-100 border-b text-gray-600 text-sm">
                    <th class="p-3">Gambar</th>
                    <th class="p-3">Nama</th>
                    <th class="p-3">Kategori</th>
                    <th class="p-3">Harga</th>
                    <th class="p-3">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($books as $book)
                <tr class="border-b text-center text-sm">
                    <td class="p-3">
                        @if($book->image)
                            <img src="{{ asset('storage/' . $book->image) }}" class="w-16 h-16 object-cover mx-auto rounded">
                        @else
                            <span class="text-gray-400 text-xs">No Image</span>
                        @endif
                    </td>
                    <td class="p-3 font-semibold">{{ $book->name }}</td>
                    <td class="p-3">{{ $book->category }}</td>
                    <td class="p-3 font-bold text-green-600">Rp {{ number_format($book->price) }}</td>
                    <td class="p-3">
                        <a href="{{ route('books.edit', $book->id) }}" class="text-blue-600 hover:underline mr-3 font-semibold">Edit</a>
                        <form action="{{ route('books.destroy', $book->id) }}" method="POST" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="submit" onclick="return confirm('Yakin hapus data ini?')" class="text-red-600 hover:underline font-semibold">Hapus</button>
                        </form>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <div class="mt-4">{{ $books->links() }}</div>
    </div>
</x-app-layout>
```

Disalin dari jawaban kode asli modul utama. View Blade menampilkan daftar dan formulir CRUD buku kepada admin.

### Jawaban CRUD book · Buat file view tambah buku, isi seluruh file

Lokasi: resources/views/admin/books/create.blade.php · Ganti seluruh isi file view ini.

```html
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Tambah Buku</h2>
    </x-slot>

    <div class="py-12 max-w-2xl mx-auto sm:px-6 lg:px-8">
        <form action="{{ route('books.store') }}" method="POST" enctype="multipart/form-data" class="bg-white p-6 rounded-lg shadow-sm border">
            @csrf
            <div class="mb-4">
                <label class="block font-medium mb-1">Nama Buku</label>
                <input type="text" name="name" class="w-full border rounded p-2" required>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Kategori</label>
                <select name="category" class="w-full border rounded p-2" required>
                    <option value="Fiksi">Fiksi</option>
                    <option value="Nonfiksi">Nonfiksi</option>
                    <option value="Referensi">Referensi</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Harga (Rp)</label>
                <input type="number" name="price" class="w-full border rounded p-2" required>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Deskripsi</label>
                <textarea name="description" class="w-full border rounded p-2" rows="3" required></textarea>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Gambar Buku</label>
                <input type="file" name="image" class="w-full border rounded p-2">
            </div>
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded font-semibold">Simpan Data</button>
        </form>
    </div>
</x-app-layout>
```

Disalin dari jawaban kode asli modul utama. View Blade menampilkan daftar dan formulir CRUD buku kepada admin.

### Jawaban CRUD book · Buat file view edit buku, isi seluruh file

Lokasi: resources/views/admin/books/edit.blade.php · Ganti seluruh isi file view ini.

```html
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Edit Buku</h2>
    </x-slot>

    <div class="py-12 max-w-2xl mx-auto sm:px-6 lg:px-8">
        <form action="{{ route('books.update', $book->id) }}" method="POST" enctype="multipart/form-data" class="bg-white p-6 rounded-lg shadow-sm border">
            @csrf
            @method('PUT')
            <div class="mb-4">
                <label class="block font-medium mb-1">Nama Buku</label>
                <input type="text" name="name" value="{{ $book->name }}" class="w-full border rounded p-2" required>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Kategori</label>
                <select name="category" class="w-full border rounded p-2" required>
                    <option value="Fiksi" {{ $book->category == 'Fiksi' ? 'selected' : '' }}>Fiksi</option>
                    <option value="Nonfiksi" {{ $book->category == 'Nonfiksi' ? 'selected' : '' }}>Nonfiksi</option>
                    <option value="Referensi" {{ $book->category == 'Referensi' ? 'selected' : '' }}>Referensi</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Harga (Rp)</label>
                <input type="number" name="price" value="{{ $book->price }}" class="w-full border rounded p-2" required>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Deskripsi</label>
                <textarea name="description" class="w-full border rounded p-2" rows="3" required>{{ $book->description }}</textarea>
            </div>
            <div class="mb-4">
                <label class="block font-medium mb-1">Gambar Baru (Opsional)</label>
                <input type="file" name="image" class="w-full border rounded p-2">
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-semibold">Update Data</button>
        </form>
    </div>
</x-app-layout>
```

Disalin dari jawaban kode asli modul utama. View Blade menampilkan daftar dan formulir CRUD buku kepada admin.

### Buat controller resource

Lokasi: Terminal proyek latihan

```shellscript
php artisan make:controller Admin/UserController --resource --model=User
```

Controller baru diletakkan pada namespace Admin. Tidak perlu membuat model User kedua.

### Isi controller user

Lokasi: app/Http/Controllers/Admin/UserController.php · ganti seluruh isi file baru

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(10);
        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->password = Hash::make($data['password']);
        $user->role = 'user';
        $user->save();

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        abort_if($user->role === 'admin', 403, 'Latihan ini hanya mengelola akun user biasa.');
        return view('admin.users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        abort_if($user->role === 'admin', 403, 'Akun admin tidak diubah lewat latihan ini.');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        if ($request->filled('password')) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($request->user()->is($user), 422, 'Tidak boleh menghapus akun sendiri.');
        abort_if($user->role === 'admin', 403, 'Akun admin tidak dihapus lewat latihan ini.');
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User berhasil dihapus.');
    }
}
```

Hash menjaga password tidak tersimpan sebagai teks asli. confirmed memeriksa password_confirmation. Rule::unique(...)->ignore($user->id) mengecualikan record yang sedang diedit, bukan mengizinkan email milik akun lain. Role dipaksa user oleh server.

### Import controller pada route

Lokasi: routes/web.php · tambahkan di bagian use jika belum ada

```php
use App\Http\Controllers\Admin\UserController;
```

Nama UserController ini digunakan untuk route resource berikut.

### Daftarkan route user

Lokasi: routes/web.php · tambahkan SATU KALI di dalam group auth dan can:manage-admin

```php
Route::resource('/admin/users', UserController::class)
    ->names('admin.users')
    ->except(['show']);
```

Route names menjadi admin.users.index, admin.users.create, dan seterusnya. Parameter {user} dihubungkan ke model User lewat route model binding. Belum bisa dibuka sebelum tiga view pada bonus berikutnya dibuat.

### Daftar user

Lokasi: resources/views/admin/users/index.blade.php · buat folder/file dan isi seluruhnya

```html
<x-app-layout>
    <h1>Data User</h1>
    @if(session('success')) <p>{{ session('success') }}</p> @endif
    @if($errors->any()) <p>{{ $errors->first() }}</p> @endif
    <a href="{{ route('admin.users.create') }}">Tambah user</a>
    <table>
        <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead>
        <tbody>
            @foreach($users as $user)
                <tr>
                    <td>{{ $user->name }}</td>
                    <td>{{ $user->email }}</td>
                    <td>{{ $user->role }}</td>
                    <td>
                        @if($user->role !== 'admin')
                            <a href="{{ route('admin.users.edit', $user) }}">Edit</a>
                            <form method="POST" action="{{ route('admin.users.destroy', $user) }}">
                                @csrf
                                @method('DELETE')
                                <button type="submit">Hapus user latihan</button>
                            </form>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    {{ $users->links() }}
</x-app-layout>
```

Tampilkan nama/email/role, bukan password/hash. Pembatasan pada view membantu tampilan; pemeriksaan controller dan Gate tetap diperlukan.

### Form tambah user

Lokasi: resources/views/admin/users/create.blade.php · isi seluruh file baru

```html
<x-app-layout>
    <h1>Tambah User</h1>
    @if($errors->any()) <p>{{ $errors->first() }}</p> @endif
    <form method="POST" action="{{ route('admin.users.store') }}">
        @csrf
        <label>Nama <input name="name" value="{{ old('name') }}" required></label>
        <label>Email <input name="email" type="email" value="{{ old('email') }}" required></label>
        <label>Password <input name="password" type="password" minlength="8" required></label>
        <label>Konfirmasi password <input name="password_confirmation" type="password" required></label>
        <button type="submit">Simpan user</button>
    </form>
    <a href="{{ route('admin.users.index') }}">Kembali</a>
</x-app-layout>
```

old mempertahankan input nama/email jika validasi gagal. Jangan mengisi ulang field password otomatis.

### Form edit user

Lokasi: resources/views/admin/users/edit.blade.php · isi seluruh file baru

```html
<x-app-layout>
    <h1>Edit User</h1>
    @if($errors->any()) <p>{{ $errors->first() }}</p> @endif
    <form method="POST" action="{{ route('admin.users.update', $user) }}">
        @csrf
        @method('PUT')
        <label>Nama <input name="name" value="{{ old('name', $user->name) }}" required></label>
        <label>Email <input name="email" type="email" value="{{ old('email', $user->email) }}" required></label>
        <label>Password baru (boleh kosong) <input name="password" type="password" minlength="8"></label>
        <label>Konfirmasi password baru <input name="password_confirmation" type="password"></label>
        <button type="submit">Simpan perubahan</button>
    </form>
    <a href="{{ route('admin.users.index') }}">Kembali</a>
</x-app-layout>
```

PUT diarahkan ke update(). Password kosong mempertahankan password sebelumnya; jika diisi, controller membuat hash baru.

### Checklist latihan

- [ ] Tambah Buku Bonus dengan harga 12000.
- [ ] Cari buku itu di daftar setelah refresh.
- [ ] Edit menjadi 15000; refresh dan pastikan nilai tersimpan.
- [ ] Coba harga negatif; harus ditolak validasi.
- [ ] Hapus hanya buku latihan tersebut.
- [ ] Coba URL CRUD sebagai user biasa; akses admin harus ditolak.
- [ ] Tidak ada route admin.users yang terdaftar dua kali.
- [ ] Controller menolak perubahan/penghapusan akun admin.
- [ ] Password tidak dipasang sebagai value pada form edit.
- [ ] Role tidak diambil dari request publik.
- [ ] Buka /admin/users sebagai admin.
- [ ] Tambah user latihan dan login dengan akun baru itu.
- [ ] Ubah nama/email melalui admin; refresh untuk memastikan tersimpan.
- [ ] Edit tanpa mengisi password, lalu pastikan password lama masih bisa login.
- [ ] Email yang dipakai user lain harus ditolak.
- [ ] User biasa ditolak ketika membuka /admin/users langsung.
- [ ] Hapus user latihan, lalu pastikan akun tersebut tidak bisa login lagi.

## Soal 3 · Buku per periode atau kategori

Jalur: Latihan

### Soal latihan

Buat tampilan buku yang dapat difilter berdasarkan kategori atau periode. Sediakan pilihan semua kategori dan reset. Jelaskan tanggal apa yang dipakai sebagai periode.

### Langkah pengerjaan

1. Siapkan beberapa buku dari kategori berbeda dan catat created_at masing-masing.
2. Coba query WHERE category untuk memahami hasil filter kategori.
3. Coba query rentang created_at. Pada soal ini periode berarti tanggal buku dibuat, bukan tanggal peminjaman.
4. Ganti method index() katalog pada OrderController dengan jawaban filter yang memvalidasi kategori dan pasangan tanggal.
5. Tambahkan form GET filter sebelum form checkout pada view anggota. Jangan menaruh satu form di dalam form lain.
6. Uji kategori, rentang tanggal, hasil kosong, tanggal terbalik, serta tombol reset.

### Jawaban / contoh penyelesaian

Jawabannya memakai WHERE pada query database dan form GET. Pada Laravel, when() menambahkan kondisi hanya ketika filter diisi. Contoh query, method controller, dan form ada di bawah.

### Contoh query kategori

Lokasi: SQL editor MySQL

```sql
SELECT id, name, category, price
FROM books
WHERE category = 'Nonfiksi'
ORDER BY name;
```

WHERE category menampilkan satu kategori. Untuk opsi Semua, jangan menambahkan kondisi kategori.

### Contoh query periode buku dibuat

Lokasi: SQL editor MySQL

```sql
SELECT id, name, category, created_at
FROM books
WHERE created_at >= '2026-10-01 00:00:00'
  AND created_at < '2026-11-01 00:00:00'
ORDER BY created_at;
```

Batas akhir memakai kurang dari awal bulan berikutnya sehingga seluruh tanggal 31 Oktober ikut, termasuk waktu yang mempunyai pecahan detik.

### Filter di controller katalog

Lokasi: app/Http/Controllers/OrderController.php · ganti method index() hanya jika mencoba latihan bonus ini

```php
public function index(\Illuminate\Http\Request $request)
{
    $filters = $request->validate([
        'category' => 'nullable|in:Fiksi,Nonfiksi,Referensi',
        'start_date' => 'nullable|required_with:end_date|date_format:Y-m-d',
        'end_date' => 'nullable|required_with:start_date|date_format:Y-m-d|after_or_equal:start_date',
    ]);

    $books = Book::query()
        ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
        ->when($filters['start_date'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
        ->when($filters['end_date'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
        ->get();

    return view('customer.index', compact('books'));
}
```

when menambahkan kondisi hanya jika nilai tersedia. ?? null memberi nilai cadangan. Validasi membatasi kategori serta memastikan pasangan tanggal lengkap dan berurutan. Import Book dari materi utama tetap dipakai.

### Form filter yang terpisah

Lokasi: resources/views/customer/index.blade.php · taruh SEBELUM form checkout, jangan di dalam form lain

```html
<form method="GET" action="{{ route('customer.index') }}">
    <label>Kategori
        <select name="category">
            <option value="">Semua</option>
            @foreach(['Fiksi', 'Nonfiksi', 'Referensi'] as $category)
                <option value="{{ $category }}" @selected(request('category') === $category)>{{ $category }}</option>
            @endforeach
        </select>
    </label>
    <label>Dari tanggal buku dibuat <input type="date" name="start_date" value="{{ request('start_date') }}"></label>
    <label>Sampai tanggal <input type="date" name="end_date" value="{{ request('end_date') }}"></label>
    <button type="submit">Terapkan filter</button>
    <a href="{{ route('customer.index') }}">Reset</a>
</form>
@if($errors->any()) <p>{{ $errors->first() }}</p> @endif
```

GET menaruh filter pada URL sehingga hasil bisa dibuka ulang. Form filter tidak boleh membungkus atau bersarang dengan form POST checkout. Jika hasil kosong, tampilkan pesan tidak ada buku yang cocok.

### Checklist latihan

- [ ] Pilih Nonfiksi dan pastikan tidak ada Fiksi/Referensi.
- [ ] Reset menampilkan semua kategori.
- [ ] Periode yang mencakup tanggal seeder menampilkan datanya.
- [ ] Tanggal akhir sebelum awal harus ditolak.
- [ ] Jelaskan bahwa created_at buku bukan tanggal buku dipesan.

## Soal 4 · Rekapan buku yang diorder

Jalur: Latihan

### Soal latihan

Tampilkan jumlah tiap buku yang sudah diorder dalam rentang tanggal. Sertakan rekap jumlah peminjaman dan omzet harian bila diminta. Pisahkan peminjaman selesai dari pending/batal.

### Langkah pengerjaan

1. Siapkan peminjaman latihan yang konsisten, masing-masing memiliki detail buku dan quantity. Pastikan checkout/data latihan sudah valid.
2. Tentukan periode menggunakan orders.created_at dan tetapkan status completed/selesai yang masuk perhitungan.
3. Gunakan JOIN orders, order_details, dan books lalu SUM(quantity) dan GROUP BY buku untuk menjawab jumlah buku dipesan.
4. Untuk omzet harian, hitung COUNT dan SUM(total_price) langsung dari orders agar satu peminjaman tidak terhitung berulang akibat JOIN detail.
5. Tambahkan method report() dan route laporan pada group admin. Buat view admin/reports/bukus.blade.php dari jawaban.
6. Buka /admin/reports/bukus, isi tanggal, dan bandingkan hasilnya dengan hitungan manual. Uji pending/batal serta data di luar periode.

### Jawaban / contoh penyelesaian

Jumlah porsi dijawab dengan SUM(order_details.quantity), bukan COUNT baris detail. Omzet dijawab dengan SUM(orders.total_price) sekali per peminjaman selesai. Query SQL serta contoh controller, route, dan view ada di bawah.

### Jumlah tiap buku yang selesai dipesan dalam Oktober

Lokasi: SQL editor MySQL · data orders, order_details, books

```sql
SELECT f.id, f.name, SUM(od.quantity) AS total_quantity
FROM order_details AS od
JOIN orders AS o ON o.id = od.order_id
JOIN books AS f ON f.id = od.book_id
WHERE LOWER(o.status) IN ('completed', 'selesai')
  AND o.created_at >= '2026-10-01 00:00:00'
  AND o.created_at < '2026-11-01 00:00:00'
GROUP BY f.id, f.name
ORDER BY total_quantity DESC, f.id ASC;
```

JOIN menghubungkan tabel lewat ID. SUM menjumlahkan quantity per buku. Filter status mengecualikan pending/batal. Yang dipakai adalah tanggal peminjaman, bukan tanggal buku dibuat.

### Rekap jumlah peminjaman dan omzet harian

Lokasi: SQL editor MySQL · hitung langsung dari orders

```sql
SELECT DATE(created_at) AS tanggal,
       COUNT(*) AS jumlah_peminjaman,
       SUM(total_price) AS omzet
FROM orders
WHERE LOWER(status) IN ('completed', 'selesai')
  AND created_at >= '2026-10-01 00:00:00'
  AND created_at < '2026-11-01 00:00:00'
GROUP BY DATE(created_at)
ORDER BY tanggal;
```

Jangan SUM orders.total_price setelah JOIN detail tanpa mengelompokkan peminjaman dahulu: satu peminjaman dengan tiga detail akan terhitung tiga kali. Query ini membaca tabel orders langsung.

### Jika diminta menampilkan di Laravel

Buat method laporan di controller admin, jalankan query lewat DB::select dengan binding tanggal/status atau query builder, lalu kirim hasil ke view. Daftarkan URL laporan dalam group auth dan can:manage-admin. Tampilkan kolom nama buku dan total_quantity untuk rekap buku, serta tanggal/jumlah_peminjaman/omzet untuk rekap harian.

### Contoh method laporan buku

Lokasi: app/Http/Controllers/OrderController.php · method baru di dalam class, di luar method lain

```php
public function report(\Illuminate\Http\Request $request)
{
    if (!$request->filled('start_date') && !$request->filled('end_date')) {
        $bukus = collect();
        return view('admin.reports.bukus', compact('bukus'));
    }

    $dates = $request->validate([
        'start_date' => 'required|date_format:Y-m-d',
        'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
    ]);

    $bukus = \Illuminate\Support\Facades\DB::table('order_details as od')
        ->join('orders as o', 'o.id', '=', 'od.order_id')
        ->join('books as f', 'f.id', '=', 'od.book_id')
        ->whereRaw('LOWER(o.status) IN (?, ?)', ['completed', 'selesai'])
        ->whereDate('o.created_at', '>=', $dates['start_date'])
        ->whereDate('o.created_at', '<=', $dates['end_date'])
        ->select('f.id', 'f.name')
        ->selectRaw('SUM(od.quantity) AS total_quantity')
        ->groupBy('f.id', 'f.name')
        ->orderByDesc('total_quantity')
        ->orderBy('f.id')
        ->get();

    return view('admin.reports.bukus', compact('bukus'));
}
```

Tanda ? pada whereRaw diisi melalui binding, bukan gabungan input mentah. Rekap ini memakai quantity sehingga tidak bergantung pada perbedaan kolom price/subtotal pada materi asli.

### Route laporan

Lokasi: routes/web.php · tambahkan satu kali di group auth dan can:manage-admin

```php
Route::get('/admin/reports/bukus', [OrderController::class, 'report'])->name('admin.reports.bukus');
```

Buka /admin/reports/bukus untuk form tanggal. Akses contoh dengan hasil: /admin/reports/bukus?start_date=2026-10-01&end_date=2026-10-31. Jika baru satu tanggal diisi atau urutannya salah, validasi mengembalikan error.

### View hasil rekap

Lokasi: resources/views/admin/reports/bukus.blade.php · buat file baru

```html
<x-app-layout>
    <h1>Rekap Buku yang Diorder</h1>
    <form method="GET" action="{{ route('admin.reports.bukus') }}">
        <label>Dari <input type="date" name="start_date" value="{{ request('start_date') }}" required></label>
        <label>Sampai <input type="date" name="end_date" value="{{ request('end_date') }}" required></label>
        <button type="submit">Tampilkan rekap</button>
    </form>
    @if($errors->any()) <p>{{ $errors->first() }}</p> @endif
    <table>
        <thead><tr><th>Buku</th><th>Jumlah dipesan</th></tr></thead>
        <tbody>
            @forelse($bukus as $buku)
                <tr><td>{{ $buku->name }}</td><td>{{ $buku->total_quantity }}</td></tr>
            @empty
                <tr><td colspan="2">Tidak ada peminjaman selesai pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</x-app-layout>
```

Tampilan ini fokus ke jumlah buku yang dipesan. Jalankan query omzet harian terpisah bila diminta total uang.

### Batas data asli

Checkout materi asli masih memiliki perbedaan price/subtotal yang sudah dicatat. Untuk menguji laporan, checkout harus berhasil atau data latihan dibuat secara konsisten dulu. Query rekap tidak memperbaiki checkout tersebut. Jika buku/detail pernah terhapus karena cascade, data yang sudah terhapus tidak dapat muncul dalam rekap.

### Checklist latihan

- [ ] Buat peminjaman latihan dengan dua buku dan jumlah berbeda.
- [ ] Tandai satu peminjaman completed dan satu lainnya pending.
- [ ] Rekap hanya memasukkan peminjaman completed/selesai pada rentang tanggal.
- [ ] Cocokkan jumlah buku dengan penjumlahan manual detail.
- [ ] Cocokkan omzet harian dengan total_price tiap peminjaman selesai, dihitung sekali per peminjaman.
- [ ] User biasa ditolak saat membuka URL laporan admin.

## Referensi

- [MySQL: SELECT](https://dev.mysql.com/doc/refman/8.4/en/select.html)
- [MySQL: INSERT](https://dev.mysql.com/doc/refman/8.4/en/insert.html)
- [MySQL: UPDATE](https://dev.mysql.com/doc/refman/8.4/en/update.html)
- [MySQL: DELETE](https://dev.mysql.com/doc/refman/8.4/en/delete.html)
- [Laravel: Authorization/Gates](https://laravel.com/docs/12.x/authorization)
- [Laravel: Hashing](https://laravel.com/docs/12.x/hashing)
