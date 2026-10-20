'use strict';
const fs = require('fs');
const path = require('path');
const lessons = [];
const text = (heading, body) => ({ heading, text: body });
const list = (heading, items) => ({ heading, items });
const code = (heading, language, target, body, explanation) => ({ heading, language, target, code: body.trim(), explanation });
function lesson(id, group, title, summary, blocks, checklist, qa = []) {
  lessons.push({ id: 'bonus-' + id, index: lessons.length, module: 'bonus', group, step: lessons.length + 1, part: 1, mode: 'bonus', title, summary, blocks, checklist, qa });
}

lesson('tools', 'Teori', 'Tools untuk membuat proyek', 'Kenali alatnya dan jelaskan fungsi masing-masing dengan satu kalimat.', [
  list('Alat dan perannya', [
    'VS Code: editor untuk menulis kode, membuka folder, dan memakai terminal. VS Code bukan server database.',
    'PHP: bahasa/runtime yang menjalankan backend Laravel.',
    'Composer: pengelola dependensi PHP dan alat untuk membuat proyek Laravel.',
    'Laravel: framework PHP yang menyediakan routing, controller, model, migration, validasi, dan autentikasi.',
    'MySQL: sistem pengelola database. phpMyAdmin adalah antarmuka untuk mengelolanya; keduanya berbeda.',
    'Node.js dan npm: menjalankan tooling frontend serta mengelola dependensinya; Vite menyiapkan aset CSS/JavaScript.',
    'Browser: membuka halaman dan menguji interaksi. Terminal: menjalankan perintah.',
    'Git dan GitHub: mencatat riwayat perubahan serta menyimpan/berbagi repository. Keduanya tidak wajib agar Laravel bisa berjalan lokal.',
    'Laragon atau XAMPP (opsional): paket yang membantu menyediakan PHP, server web, dan database. Pilih sesuai komputer, tidak harus memasang semuanya.'
  ]),
  code('Cek alat yang tersedia', 'shellscript', 'Terminal', 'php --version\ncomposer --version\nnode --version\nnpm --version', 'Perintah ini menampilkan versi. MySQL juga harus berjalan; cek dari aplikasi/service database yang dipakai.'),
  text('Saat diminta menjelaskan', 'Saya menulis kode memakai VS Code, menjalankan Laravel dengan PHP, mengelola paket PHP dengan Composer, menyimpan data di MySQL, dan menyiapkan aset frontend memakai npm/Vite.')
], ['Bisa membedakan editor, bahasa, framework, dan database.', 'Bisa menyebut fungsi Composer dan npm.', 'Bisa menunjukkan cara menjalankan proyek yang sudah disiapkan.']);

lesson('erd', 'Teori', 'Fungsi ERD dan database', 'ERD adalah peta hubungan data; database menyimpan dan mengelola data sebenarnya.', [
  text('Istilah yang perlu dipahami', 'Tabel menyimpan satu jenis data. Kolom adalah atribut, baris adalah satu record. Primary key membedakan tiap record. Foreign key menghubungkan record ke tabel lain. ERD membantu merancang hubungan dan mengurangi pengulangan data sebelum kode dibuat.'),
  code('Hubungan dari materi utama', 'plaintext', 'Sketsa ERD', 'foods (id)   1 ─── N order_details (food_id)\norders (id)  1 ─── N order_details (order_id)\n\nusers: akun untuk login/register', 'Satu pesanan mempunyai banyak detail. Satu makanan dapat muncul di banyak detail pesanan. order_details menjadi penghubung orders dan foods.'),
  text('Contoh yang mudah dibayangkan', 'Pesanan nomor 10 berisi dua bakso dan satu es teh. Tabel orders menyimpan identitas/total pesanan, sementara order_details menyimpan dua baris item beserta jumlahnya. Nama makanan dibaca dari foods lewat food_id.'),
  text('Batas materi asli', 'Pada .md asli, orders belum mempunyai user_id. Nama pelanggan disimpan sebagai teks, jadi jangan menyebut orders sudah terhubung ke users melalui foreign key. Relasi user-pesanan memerlukan penambahan kolom dan aturan baru di luar materi asli.')
], ['Bisa menggambar dua hubungan 1 ke banyak di atas.', 'Bisa menjelaskan mengapa pesanan perlu tabel detail.', 'Bisa menunjuk primary key dan foreign key.'], [{ q: 'Apa fungsi ERD?', a: 'Merencanakan entitas, atribut, dan hubungan data agar struktur database jelas sebelum implementasi.' }, { q: 'Kenapa detail pesanan tidak ditaruh dalam satu teks panjang?', a: 'Agar tiap makanan dan jumlahnya dapat dicari, dihitung, serta dihubungkan dengan tabel makanan.' }]);

lesson('crud-sql', 'Teori', 'CRUD MySQL: tambah, lihat, edit, hapus', 'CRUD adalah empat operasi dasar data. MySQL menjalankan perintah SQL untuk operasi tersebut.', [
  list('Pasangan yang harus hafal', ['Create / tambah → INSERT.', 'Read / tampilkan → SELECT.', 'Update / edit → UPDATE.', 'Delete / hapus → DELETE.']),
  text('Tempat mencoba', 'Jalankan contoh ini pada database latihan yang sudah memiliki tabel foods dari materi utama, lewat SQL editor/phpMyAdmin atau client MySQL. Ini SQL, bukan command terminal PHP. Jalankan blok secara berurutan dalam sesi koneksi yang sama.'),
  code('1. Tambah satu menu latihan', 'sql', 'SQL editor MySQL · database latihan', "INSERT INTO foods (name, category, price, description, image, created_at, updated_at)\nVALUES ('Menu Latihan Bonus', 'Makanan', 12000, 'Data untuk latihan CRUD.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\nSET @food_id = LAST_INSERT_ID();", 'INSERT membuat record. LAST_INSERT_ID mengambil ID record baru pada koneksi ini; @food_id menyimpannya agar contoh edit/hapus tidak menyentuh menu lain.'),
  code('2. Tampilkan menu yang baru dibuat', 'sql', 'SQL editor MySQL · koneksi yang sama', 'SELECT id, name, category, price\nFROM foods\nWHERE id = @food_id;', 'SELECT memilih kolom. FROM menyebut tabel. WHERE membatasi record yang ditampilkan.'),
  code('3. Ubah harga menu latihan', 'sql', 'SQL editor MySQL · koneksi yang sama', 'UPDATE foods\nSET price = 15000, updated_at = CURRENT_TIMESTAMP\nWHERE id = @food_id;', 'SET menetapkan nilai baru. WHERE memastikan hanya record latihan yang berubah.'),
  code('4. Hapus menu latihan', 'sql', 'SQL editor MySQL · koneksi yang sama', 'DELETE FROM foods\nWHERE id = @food_id;', 'DELETE menghapus record. Menghilangkan WHERE pada UPDATE/DELETE dapat mengubah atau menghapus semua record tabel.')
], ['Bisa menyebut keempat perintah tanpa melihat catatan.', 'Bisa menampilkan data sesudah INSERT dan UPDATE.', 'Bisa menjelaskan kegunaan WHERE sebelum menjalankan DELETE.']);

lesson('query', 'Teori', 'Apa itu query dan manfaatnya?', 'Query adalah permintaan/perintah yang dikirim ke database untuk membaca atau mengubah data.', [
  text('Jawaban singkat untuk ujian', 'Query dipakai untuk meminta data tertentu atau mengolahnya. Dengan query, kita bisa menambah data, menyaring kategori, mengurutkan harga, mencari pesanan dalam rentang waktu, dan membuat rekap tanpa menghitung manual.'),
  code('Minta tiga makanan termurah', 'sql', 'SQL editor MySQL', "SELECT id, name, price\nFROM foods\nWHERE category = 'Makanan'\nORDER BY price ASC, id ASC\nLIMIT 3;", 'WHERE menyaring kategori, ORDER BY mengurutkan, ASC berarti naik dari nilai kecil, dan LIMIT membatasi banyak hasil.'),
  code('Hitung jumlah menu per kategori', 'sql', 'SQL editor MySQL', 'SELECT category, COUNT(*) AS total_menu\nFROM foods\nGROUP BY category\nORDER BY category;', 'COUNT menghitung baris. GROUP BY mengelompokkan baris berdasarkan kategori. AS memberi nama kolom hasil agar mudah dibaca.'),
  text('SQL dengan Eloquent', 'Food::all() pada Laravel juga membaca database. Eloquent menerjemahkan pemanggilan model/query builder menjadi SQL. Saat memakai input pengguna, gunakan binding/parameter atau query builder; jangan gabungkan input mentah ke string SQL.')
], ['Bisa membedakan WHERE, ORDER BY, GROUP BY, dan LIMIT.', 'Bisa membaca hasil query dan menjelaskan artinya.'], [{ q: 'Apakah query cuma SELECT?', a: 'Tidak. Istilah query sering dipakai untuk permintaan database; perintah tambah, ubah, dan hapus juga dikirim ke database. SELECT adalah contoh query pembacaan.' }]);

lesson('login', 'Latihan', 'Login dan register admin/user', 'Mulai dari autentikasi Breeze yang sudah dipakai materi utama, lalu bedakan login dan hak akses.', [
  list('Alur yang dikerjakan', ['Ikuti modul 2 langkah 1–3 untuk pemasangan Breeze pada proyek latihan yang sudah siap.', 'Buka /register. Buat akun user dengan nama, email unik, password, dan konfirmasi password.', 'Keluar, lalu masuk lagi lewat /login dengan akun tadi.', 'Akun admin memakai login yang sama. Perbedaan hak akses dibuat lewat role dan pemeriksaan server pada dua bonus berikutnya.']),
  text('Authentication dan authorization', 'Authentication memastikan siapa yang login. Authorization menentukan apa yang boleh dilakukan oleh akun itu. Login berhasil tidak otomatis berarti akun adalah admin.'),
  text('Password dan form', 'Hash::make menyimpan hash password. Input konfirmasi harus cocok dengan password. @csrf membantu memvalidasi kiriman form. Jangan menyimpan password sebagai teks asli dan jangan menyediakan pilihan menjadi admin pada register publik.'),
  text('Hal yang belum tercakup otomatis', 'Materi utama sudah memasang login/register, tetapi belum membedakan role admin dan user. Menyembunyikan tombol admin saja tidak cukup; URL admin harus dibatasi dari server.')
], ['Register user baru berhasil.', 'Email yang sama ditolak saat register lagi.', 'Login dengan password salah ditolak.', 'Logout membuat halaman yang butuh login tidak bisa diakses langsung.'], [{ q: 'Kenapa user biasa tidak boleh memilih role admin saat register?', a: 'Karena pengguna dapat menaikkan hak aksesnya sendiri. Akun publik harus mendapat role user dari server.' }]);

lesson('role', 'Latihan', 'Tambahkan role di proyek latihan', 'Tambahan bonus ini memperkenalkan role. Kode materi utama di ekstensi tetap asli.', [
  code('Buat migration tambahan', 'shellscript', 'Terminal proyek latihan', 'php artisan make:migration add_role_to_users_table --table=users', 'Jangan mengedit migration lama yang sudah dijalankan. Command menghasilkan satu file migration baru.'),
  code('Isi file migration baru', 'php', 'database/migrations/..._add_role_to_users_table.php · ganti seluruh isi file baru', String.raw`<?php

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
};`, 'Default user membuat akun baru mendapatkan hak biasa. Jangan tambahkan kolom ini lagi jika proyek sudah punya role.'),
  code('Terapkan migration', 'shellscript', 'Terminal proyek latihan', 'php artisan migrate', 'Ini menerapkan migration yang belum dijalankan, bukan migrate:fresh yang menghapus seluruh tabel.'),
  code('Buka Tinker', 'shellscript', 'Terminal proyek latihan', 'php artisan tinker', 'Tinker adalah console PHP Laravel. Ketik blok berikut di dalam Tinker, bukan di SQL editor.'),
  code('Tetapkan akun admin dari seeder', 'php', 'Tinker · jalankan baris demi baris', "$admin = App\\Models\\User::where('email', 'admin@gmail.com')->firstOrFail();\n$admin->role = 'admin';\n$admin->save();", 'Gunakan akun admin latihan dari seeder materi utama. Jika email berbeda, sesuaikan email pencarian. Role ditetapkan dari lingkungan pengelola, bukan dari register publik.')
], ['Kolom users.role ada tepat sekali.', 'Akun register baru mempunyai role user.', 'Akun admin latihan mempunyai role admin.', 'Keluar dari Tinker sebelum menjalankan command terminal lain.']);

lesson('gate', 'Latihan', 'Batasi halaman admin dari server', 'Buat aturan admin sekali, lalu terapkan pada route yang hanya boleh diakses admin.', [
  code('Import yang diperlukan', 'php', 'app/Providers/AppServiceProvider.php · bagian use di atas class', 'use App\\Models\\User;\nuse Illuminate\\Support\\Facades\\Gate;', 'Tambahkan hanya import yang belum ada. Jangan mendeklarasikan alias yang sama dua kali.'),
  code('Daftarkan aturan', 'php', 'app/Providers/AppServiceProvider.php · di dalam method boot()', "Gate::define('manage-admin', fn (User $user): bool => $user->role === 'admin');", 'Gate mengembalikan true hanya untuk akun ber-role admin. Ini aturan authorization yang diperiksa di server.'),
  code('Dashboard memerlukan role admin', 'php', 'routes/web.php · GANTI route /dashboard yang lama, jangan tambah route kedua', "Route::get('/dashboard', [OrderController::class, 'adminDashboard'])\n    ->middleware(['auth', 'can:manage-admin'])\n    ->name('dashboard');", 'Materi contoh ini memakai auth dan Gate; bila proyek memang menerapkan verifikasi email, pertahankan middleware verified sesuai kebijakannya.'),
  text('Lindungi route admin lainnya', 'Pada group admin yang sudah ada, ganti middleware menjadi auth dan can:manage-admin. Pindahkan route /admin/dashboard, /admin/orders/.../status, serta resource /admin/foods ke group tersebut. Jangan mendaftarkannya dua kali di dalam dan di luar group. Route profile tetap boleh diakses user yang login.'),
  code('Contoh group yang membatasi admin', 'php', 'routes/web.php · gunakan sebagai pembungkus route admin yang dipindahkan', "Route::middleware(['auth', 'can:manage-admin'])->group(function () {\n    Route::get('/admin/dashboard', [OrderController::class, 'adminDashboard'])->name('admin.dashboard');\n    Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.updateStatus');\n    Route::resource('/admin/foods', FoodController::class);\n});", 'Pemeriksaan ini berlaku juga ketika user mengetik URL secara langsung. Controller/route utama tidak otomatis diamankan hanya karena menu navigasi disembunyikan.'),
  text('Sesudah user register/login', 'Breeze dapat mengarahkan user ke /dashboard. Setelah route itu dibatasi admin, user biasa akan mendapat 403. Untuk latihan, ubah redirect sukses di controller login/register agar admin menuju dashboard dan user menuju route customer.index; autentikasi dan validasi yang sudah ada tetap dipertahankan.'),
  code('Arah redirect untuk tiap role', 'php', 'app/Http/Controllers/Auth/AuthenticatedSessionController.php dan RegisteredUserController.php · ganti return redirect sukses pada store()', "return redirect()->route($request->user()->role === 'admin' ? 'dashboard' : 'customer.index');", 'Pada controller register, letakkan return ini setelah akun dibuat dan Auth::login($user) yang sudah disediakan Breeze. Jangan menghapus validasi atau proses login aslinya.')
], ['Admin bisa membuka /dashboard dan /admin/foods.', 'User biasa mendapat 403 ketika membuka URL admin langsung.', 'Pengunjung belum login diarahkan ke login.', 'User biasa setelah login/register diarahkan ke katalog.']);

lesson('crud-food', 'Latihan', 'Latihan CRUD food dari modul utama', 'Gunakan implementasi lengkap yang sudah ada, lalu buktikan setiap operasi melalui browser.', [
  list('Urutan berkas', ['Model/migration/seeder: modul 1.', 'FoodController dan validasi: modul 2 step 4.', 'View daftar/tambah/edit: modul 2 step 5.', 'Route resource foods: modul 4 step 2; untuk latihan role, letakkan di group admin pada bonus sebelumnya.']),
  list('Pemetaan tombol ke kode', ['Daftar → GET /admin/foods → index() → Read.', 'Form tambah → create(); kirim form → store() → Create.', 'Form edit → edit(); simpan perubahan → update() → Update.', 'Tombol hapus → destroy() → Delete.']),
  text('Perhatikan upload', 'storage:link menghubungkan file gambar ke folder public. Form upload perlu multipart/form-data. File gambar tidak otomatis terhapus hanya karena baris database dihapus; materi FoodController menangani file lama.'),
  text('Tanda sudah memahami', 'Bisa menjelaskan perjalanan input dari form, validasi controller, penyimpanan model, sampai daftar diperbarui. Jangan hanya menghafal nama tombol.')
], ['Tambah Menu Bonus dengan harga 12000.', 'Cari menu itu di daftar setelah refresh.', 'Edit menjadi 15000; refresh dan pastikan nilai tersimpan.', 'Coba harga negatif; harus ditolak validasi.', 'Hapus hanya menu latihan tersebut.', 'Coba URL CRUD sebagai user biasa; akses admin harus ditolak.']);

lesson('crud-user-controller', 'Latihan', 'CRUD user: controller dan route', 'Contoh tambahan untuk admin mengelola akun user biasa. Prasyarat: role dan Gate dari bonus sebelumnya.', [
  code('Buat controller resource', 'shellscript', 'Terminal proyek latihan', 'php artisan make:controller Admin/UserController --resource --model=User', 'Controller baru diletakkan pada namespace Admin. Tidak perlu membuat model User kedua.'),
  code('Isi controller user', 'php', 'app/Http/Controllers/Admin/UserController.php · ganti seluruh isi file baru', String.raw`<?php

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
}`, 'Hash menjaga password tidak tersimpan sebagai teks asli. confirmed memeriksa password_confirmation. Rule::unique(...)->ignore($user->id) mengecualikan record yang sedang diedit, bukan mengizinkan email milik akun lain. Role dipaksa user oleh server.'),
  code('Import controller pada route', 'php', 'routes/web.php · tambahkan di bagian use jika belum ada', 'use App\\Http\\Controllers\\Admin\\UserController;', 'Nama UserController ini digunakan untuk route resource berikut.'),
  code('Daftarkan route user', 'php', 'routes/web.php · tambahkan SATU KALI di dalam group auth dan can:manage-admin', "Route::resource('/admin/users', UserController::class)\n    ->names('admin.users')\n    ->except(['show']);", 'Route names menjadi admin.users.index, admin.users.create, dan seterusnya. Parameter {user} dihubungkan ke model User lewat route model binding. Belum bisa dibuka sebelum tiga view pada bonus berikutnya dibuat.')
], ['Tidak ada route admin.users yang terdaftar dua kali.', 'Controller menolak perubahan/penghapusan akun admin.', 'Password tidak dipasang sebagai value pada form edit.', 'Role tidak diambil dari request publik.']);

lesson('crud-user-views', 'Latihan', 'CRUD user: halaman daftar, tambah, edit', 'Buat tiga file Blade ini, lalu uji CRUD user memakai admin dan user biasa.', [
  code('Daftar user', 'html', 'resources/views/admin/users/index.blade.php · buat folder/file dan isi seluruhnya', `<x-app-layout>
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
</x-app-layout>`, 'Tampilkan nama/email/role, bukan password/hash. Pembatasan pada view membantu tampilan; pemeriksaan controller dan Gate tetap diperlukan.'),
  code('Form tambah user', 'html', 'resources/views/admin/users/create.blade.php · isi seluruh file baru', `<x-app-layout>
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
</x-app-layout>`, 'old mempertahankan input nama/email jika validasi gagal. Jangan mengisi ulang field password otomatis.'),
  code('Form edit user', 'html', 'resources/views/admin/users/edit.blade.php · isi seluruh file baru', `<x-app-layout>
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
</x-app-layout>`, 'PUT diarahkan ke update(). Password kosong mempertahankan password sebelumnya; jika diisi, controller membuat hash baru.')
], ['Buka /admin/users sebagai admin.', 'Tambah user latihan dan login dengan akun baru itu.', 'Ubah nama/email melalui admin; refresh untuk memastikan tersimpan.', 'Edit tanpa mengisi password, lalu pastikan password lama masih bisa login.', 'Email yang dipakai user lain harus ditolak.', 'User biasa ditolak ketika membuka /admin/users langsung.', 'Hapus user latihan, lalu pastikan akun tersebut tidak bisa login lagi.']);

lesson('filter', 'Latihan', 'Filter menu per kategori atau periode', 'Contoh periode pada halaman ini berarti tanggal MENU DIBUAT. Periode pesanan dibahas pada rekap berikutnya.', [
  code('Contoh query kategori', 'sql', 'SQL editor MySQL', "SELECT id, name, category, price\nFROM foods\nWHERE category = 'Minuman'\nORDER BY name;", 'WHERE category menampilkan satu kategori. Untuk opsi Semua, jangan menambahkan kondisi kategori.'),
  code('Contoh query periode menu dibuat', 'sql', 'SQL editor MySQL', "SELECT id, name, category, created_at\nFROM foods\nWHERE created_at >= '2026-10-01 00:00:00'\n  AND created_at < '2026-11-01 00:00:00'\nORDER BY created_at;", 'Batas akhir memakai kurang dari awal bulan berikutnya sehingga seluruh tanggal 31 Oktober ikut, termasuk waktu yang mempunyai pecahan detik.'),
  code('Filter di controller katalog', 'php', 'app/Http/Controllers/OrderController.php · ganti method index() hanya jika mencoba latihan bonus ini', String.raw`public function index(\Illuminate\Http\Request $request)
{
    $filters = $request->validate([
        'category' => 'nullable|in:Makanan,Minuman,Cemilan',
        'start_date' => 'nullable|required_with:end_date|date_format:Y-m-d',
        'end_date' => 'nullable|required_with:start_date|date_format:Y-m-d|after_or_equal:start_date',
    ]);

    $foods = Food::query()
        ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
        ->when($filters['start_date'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
        ->when($filters['end_date'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
        ->get();

    return view('customer.index', compact('foods'));
}`, 'when menambahkan kondisi hanya jika nilai tersedia. ?? null memberi nilai cadangan. Validasi membatasi kategori serta memastikan pasangan tanggal lengkap dan berurutan. Import Food dari materi utama tetap dipakai.'),
  code('Form filter yang terpisah', 'html', 'resources/views/customer/index.blade.php · taruh SEBELUM form checkout, jangan di dalam form lain', `<form method="GET" action="{{ route('customer.index') }}">
    <label>Kategori
        <select name="category">
            <option value="">Semua</option>
            @foreach(['Makanan', 'Minuman', 'Cemilan'] as $category)
                <option value="{{ $category }}" @selected(request('category') === $category)>{{ $category }}</option>
            @endforeach
        </select>
    </label>
    <label>Dari tanggal menu dibuat <input type="date" name="start_date" value="{{ request('start_date') }}"></label>
    <label>Sampai tanggal <input type="date" name="end_date" value="{{ request('end_date') }}"></label>
    <button type="submit">Terapkan filter</button>
    <a href="{{ route('customer.index') }}">Reset</a>
</form>
@if($errors->any()) <p>{{ $errors->first() }}</p> @endif`, 'GET menaruh filter pada URL sehingga hasil bisa dibuka ulang. Form filter tidak boleh membungkus atau bersarang dengan form POST checkout. Jika hasil kosong, tampilkan pesan tidak ada menu yang cocok.')
], ['Pilih Minuman dan pastikan tidak ada Makanan/Cemilan.', 'Reset menampilkan semua kategori.', 'Periode yang mencakup tanggal seeder menampilkan datanya.', 'Tanggal akhir sebelum awal harus ditolak.', 'Jelaskan bahwa created_at makanan bukan tanggal makanan dipesan.']);

lesson('rekap', 'Latihan', 'Rekapan menu yang diorder', 'Gabungkan pesanan dan detail untuk menghitung jumlah menu. Hitung omzet dari orders agar total pesanan tidak terhitung berulang.', [
  code('Jumlah tiap menu yang selesai dipesan dalam Oktober', 'sql', 'SQL editor MySQL · data orders, order_details, foods', "SELECT f.id, f.name, SUM(od.quantity) AS total_quantity\nFROM order_details AS od\nJOIN orders AS o ON o.id = od.order_id\nJOIN foods AS f ON f.id = od.food_id\nWHERE LOWER(o.status) IN ('completed', 'selesai')\n  AND o.created_at >= '2026-10-01 00:00:00'\n  AND o.created_at < '2026-11-01 00:00:00'\nGROUP BY f.id, f.name\nORDER BY total_quantity DESC, f.id ASC;", 'JOIN menghubungkan tabel lewat ID. SUM menjumlahkan quantity per makanan. Filter status mengecualikan pending/batal. Yang dipakai adalah tanggal pesanan, bukan tanggal menu dibuat.'),
  code('Rekap jumlah pesanan dan omzet harian', 'sql', 'SQL editor MySQL · hitung langsung dari orders', "SELECT DATE(created_at) AS tanggal,\n       COUNT(*) AS jumlah_pesanan,\n       SUM(total_price) AS omzet\nFROM orders\nWHERE LOWER(status) IN ('completed', 'selesai')\n  AND created_at >= '2026-10-01 00:00:00'\n  AND created_at < '2026-11-01 00:00:00'\nGROUP BY DATE(created_at)\nORDER BY tanggal;", 'Jangan SUM orders.total_price setelah JOIN detail tanpa mengelompokkan pesanan dahulu: satu pesanan dengan tiga detail akan terhitung tiga kali. Query ini membaca tabel orders langsung.'),
  text('Jika diminta menampilkan di Laravel', 'Buat method laporan di controller admin, jalankan query lewat DB::select dengan binding tanggal/status atau query builder, lalu kirim hasil ke view. Daftarkan URL laporan dalam group auth dan can:manage-admin. Tampilkan kolom nama menu dan total_quantity untuk rekap menu, serta tanggal/jumlah_pesanan/omzet untuk rekap harian.'),
  code('Contoh method laporan menu', 'php', 'app/Http/Controllers/OrderController.php · method baru di dalam class, di luar method lain', String.raw`public function report(\Illuminate\Http\Request $request)
{
    if (!$request->filled('start_date') && !$request->filled('end_date')) {
        $menus = collect();
        return view('admin.reports.menus', compact('menus'));
    }

    $dates = $request->validate([
        'start_date' => 'required|date_format:Y-m-d',
        'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
    ]);

    $menus = \Illuminate\Support\Facades\DB::table('order_details as od')
        ->join('orders as o', 'o.id', '=', 'od.order_id')
        ->join('foods as f', 'f.id', '=', 'od.food_id')
        ->whereRaw('LOWER(o.status) IN (?, ?)', ['completed', 'selesai'])
        ->whereDate('o.created_at', '>=', $dates['start_date'])
        ->whereDate('o.created_at', '<=', $dates['end_date'])
        ->select('f.id', 'f.name')
        ->selectRaw('SUM(od.quantity) AS total_quantity')
        ->groupBy('f.id', 'f.name')
        ->orderByDesc('total_quantity')
        ->orderBy('f.id')
        ->get();

    return view('admin.reports.menus', compact('menus'));
}`, 'Tanda ? pada whereRaw diisi melalui binding, bukan gabungan input mentah. Rekap ini memakai quantity sehingga tidak bergantung pada perbedaan kolom price/subtotal pada materi asli.'),
  code('Route laporan', 'php', 'routes/web.php · tambahkan satu kali di group auth dan can:manage-admin', "Route::get('/admin/reports/menus', [OrderController::class, 'report'])->name('admin.reports.menus');", 'Buka /admin/reports/menus untuk form tanggal. Akses contoh dengan hasil: /admin/reports/menus?start_date=2026-10-01&end_date=2026-10-31. Jika baru satu tanggal diisi atau urutannya salah, validasi mengembalikan error.'),
  code('View hasil rekap', 'html', 'resources/views/admin/reports/menus.blade.php · buat file baru', `<x-app-layout>
    <h1>Rekap Menu yang Diorder</h1>
    <form method="GET" action="{{ route('admin.reports.menus') }}">
        <label>Dari <input type="date" name="start_date" value="{{ request('start_date') }}" required></label>
        <label>Sampai <input type="date" name="end_date" value="{{ request('end_date') }}" required></label>
        <button type="submit">Tampilkan rekap</button>
    </form>
    @if($errors->any()) <p>{{ $errors->first() }}</p> @endif
    <table>
        <thead><tr><th>Menu</th><th>Jumlah dipesan</th></tr></thead>
        <tbody>
            @forelse($menus as $menu)
                <tr><td>{{ $menu->name }}</td><td>{{ $menu->total_quantity }}</td></tr>
            @empty
                <tr><td colspan="2">Tidak ada pesanan selesai pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</x-app-layout>`, 'Tampilan ini fokus ke jumlah menu yang dipesan. Jalankan query omzet harian terpisah bila diminta total uang.'),
  text('Batas data asli', 'Checkout materi asli masih memiliki perbedaan price/subtotal yang sudah dicatat. Untuk menguji laporan, checkout harus berhasil atau data latihan dibuat secara konsisten dulu. Query rekap tidak memperbaiki checkout tersebut. Jika menu/detail pernah terhapus karena cascade, data yang sudah terhapus tidak dapat muncul dalam rekap.')
], ['Buat pesanan latihan dengan dua menu dan jumlah berbeda.', 'Tandai satu pesanan completed dan satu lainnya pending.', 'Rekap hanya memasukkan pesanan completed/selesai pada rentang tanggal.', 'Cocokkan jumlah menu dengan penjumlahan manual detail.', 'Cocokkan omzet harian dengan total_price tiap pesanan selesai, dihitung sekali per pesanan.', 'User biasa ditolak saat membuka URL laporan admin.'], [{ q: 'Kenapa rekap jumlah menu memakai SUM(quantity), bukan COUNT(*)?', a: 'Satu baris detail dapat berisi beberapa porsi. COUNT menghitung baris detail; SUM(quantity) menghitung jumlah porsi.' }, { q: 'Apakah jumlah terjual sama dengan omzet?', a: 'Tidak. Jumlah terjual adalah banyak item; omzet adalah nilai uang dari transaksi yang masuk perhitungan.' }]);

const root = path.resolve(__dirname, '..');
const byId = id => lessons.find(item => item.id === 'bonus-' + id);
const mainSteps = require('../data/steps.json');
const theoryAnswers = [
  'Tools utama: VS Code untuk menulis kode, PHP untuk menjalankan backend, Laravel sebagai framework, Composer untuk paket PHP, MySQL untuk database, serta Node.js/npm untuk tooling frontend. Browser dipakai untuk menguji hasil.',
  'ERD adalah diagram rancangan entitas, atribut, dan relasi. Database adalah tempat penyimpanan/pengelolaan data sebenarnya. ERD membantu menentukan struktur tabel; primary key membedakan record dan foreign key menghubungkan tabel.',
  'CRUD berarti Create, Read, Update, Delete. Dalam SQL MySQL: tambah memakai INSERT, tampilkan memakai SELECT, edit memakai UPDATE, dan hapus memakai DELETE. WHERE membatasi record yang diproses.',
  'Query adalah permintaan/perintah ke database. Manfaatnya untuk membaca, menyaring, mengurutkan, menambah, mengubah, menghapus, dan membuat rekap data secara terukur tanpa menghitung manual.'
];
const sections = lessons.slice(0, 4).map((item, index) => ({ ...item, number: index + 1, answerSummary: theoryAnswers[index], qa: [] }));
function exercise(id, number, title, question, procedure, answerSummary, sourceIds) {
  const items = sourceIds.map(byId);
  const blocks = items.flatMap(item => {
    if (item.id !== 'bonus-crud-food') return item.blocks;
    const originalFood = mainSteps.filter(step => step.module === 2 && [4, 5].includes(step.step)).map(step => ({ heading: 'Jawaban CRUD food · ' + step.title, language: step.step === 5 ? 'html' : 'php', target: step.target + ' · ' + step.where, code: step.code, explanation: 'Disalin dari jawaban kode asli modul utama. ' + step.goal }));
    return [...item.blocks, ...originalFood];
  });
  sections.push({ id, index: sections.length, number, module: 'bonus', group: 'Latihan', step: number, part: 1, mode: 'bonus', title, summary: question, question, procedure, answerSummary, blocks, checklist: items.flatMap(item => item.checklist), qa: [] });
}
exercise('bonus-latihan-login', 1, 'Soal 1 · Login dan register admin/user',
  'Buat halaman login dan register. Akun user dapat membuka katalog, sedangkan akun admin dapat mengakses dashboard dan halaman pengelolaan. User biasa tidak boleh membuka URL admin secara langsung.',
  [
    'Siapkan database/proyek latihan. Pasang dan jalankan Breeze sesuai modul 2 step 1–3, lalu coba halaman /register dan /login.',
    'Buat migration baru untuk kolom users.role dengan default user, isi migration memakai jawaban di bawah, lalu jalankan php artisan migrate.',
    'Tetapkan role admin pada akun seeder latihan melalui Tinker. Akun register publik tetap mendapatkan role user.',
    'Tambahkan import dan Gate manage-admin pada AppServiceProvider.boot().',
    'Ganti route dashboard dan pindahkan route admin ke group auth dan can:manage-admin. Jangan menduplikasi route.',
    'Atur redirect sukses login/register: admin ke dashboard, user ke katalog, dengan tetap mempertahankan validasi dan proses autentikasi Breeze.',
    'Uji register/login/logout, password salah, dan akses langsung URL admin memakai user biasa.'
  ],
  'Jawabannya memakai autentikasi Breeze ditambah kolom role dan Gate di server. Login memeriksa identitas; Gate membatasi hak akses. Kode lengkap penambahan role, Gate, route, dan redirect ada di bawah.',
  ['login', 'role', 'gate']);
exercise('bonus-latihan-crud', 2, 'Soal 2 · CRUD food dan CRUD user',
  'Buat fitur tambah, tampilkan, edit, dan hapus makanan serta akun user. Hanya admin yang dapat mengelola data tersebut. Sertakan validasi input dan jangan menyimpan password sebagai teks asli.',
  [
    'Selesaikan autentikasi, role, dan Gate pada soal 1 agar route CRUD dapat dibatasi untuk admin.',
    'Untuk CRUD food, gunakan model/migration/seeder modul 1, FoodController modul 2 step 4, serta tiga view modul 2 step 5. Tempatkan route resource foods pada group admin.',
    'Uji tambah, baca, edit, dan hapus satu menu latihan. Controller, model, view, dan route harus saling terhubung.',
    'Buat Admin/UserController dengan command resource pada jawaban. Ganti isi file controller baru menggunakan jawaban di bawah.',
    'Tambahkan import UserController dan route resource admin.users satu kali di dalam group admin.',
    'Buat folder resources/views/admin/users, lalu buat index.blade.php, create.blade.php, dan edit.blade.php sesuai jawaban.',
    'Buka /admin/users sebagai admin. Tambah akun latihan, edit tanpa mengisi password untuk menguji password lama, lalu hapus akun latihan.',
    'Uji validasi email unik, password/konfirmasi, larangan mengubah akun admin, serta penolakan akses CRUD dari user biasa.'
  ],
  'Jawaban CRUD food berikut disalin dari kode asli modul utama, dengan lokasi penerapan tiap potongan. Jawaban CRUD user mencakup controller, route, dan tiga view. Pemetaan operasinya: store = tambah, index = tampilkan, update = edit, destroy = hapus.',
  ['crud-food', 'crud-user-controller', 'crud-user-views']);
exercise('bonus-filter', 3, 'Soal 3 · Menu per periode atau kategori',
  'Buat tampilan menu yang dapat difilter berdasarkan kategori atau periode. Sediakan pilihan semua kategori dan reset. Jelaskan tanggal apa yang dipakai sebagai periode.',
  [
    'Siapkan beberapa menu dari kategori berbeda dan catat created_at masing-masing.',
    'Coba query WHERE category untuk memahami hasil filter kategori.',
    'Coba query rentang created_at. Pada soal ini periode berarti tanggal menu dibuat, bukan tanggal pesanan.',
    'Ganti method index() katalog pada OrderController dengan jawaban filter yang memvalidasi kategori dan pasangan tanggal.',
    'Tambahkan form GET filter sebelum form checkout pada view pelanggan. Jangan menaruh satu form di dalam form lain.',
    'Uji kategori, rentang tanggal, hasil kosong, tanggal terbalik, serta tombol reset.'
  ],
  'Jawabannya memakai WHERE pada query database dan form GET. Pada Laravel, when() menambahkan kondisi hanya ketika filter diisi. Contoh query, method controller, dan form ada di bawah.',
  ['filter']);
exercise('bonus-rekap', 4, 'Soal 4 · Rekapan menu yang diorder',
  'Tampilkan jumlah tiap menu yang sudah diorder dalam rentang tanggal. Sertakan rekap jumlah pesanan dan omzet harian bila diminta. Pisahkan pesanan selesai dari pending/batal.',
  [
    'Siapkan pesanan latihan yang konsisten, masing-masing memiliki detail makanan dan quantity. Pastikan checkout/data latihan sudah valid.',
    'Tentukan periode menggunakan orders.created_at dan tetapkan status completed/selesai yang masuk perhitungan.',
    'Gunakan JOIN orders, order_details, dan foods lalu SUM(quantity) dan GROUP BY menu untuk menjawab jumlah menu dipesan.',
    'Untuk omzet harian, hitung COUNT dan SUM(total_price) langsung dari orders agar satu pesanan tidak terhitung berulang akibat JOIN detail.',
    'Tambahkan method report() dan route laporan pada group admin. Buat view admin/reports/menus.blade.php dari jawaban.',
    'Buka /admin/reports/menus, isi tanggal, dan bandingkan hasilnya dengan hitungan manual. Uji pending/batal serta data di luar periode.'
  ],
  'Jumlah porsi dijawab dengan SUM(order_details.quantity), bukan COUNT baris detail. Omzet dijawab dengan SUM(orders.total_price) sekali per pesanan selesai. Query SQL serta contoh controller, route, dan view ada di bawah.',
  ['rekap']);
fs.writeFileSync(path.join(root, 'data/bonus.json'), JSON.stringify(sections, null, 2) + '\n');
const md = ['# Bonus — Kisi-kisi Serkom', '', 'Materi tambahan untuk belajar teori dan latihan. Contoh bonus tidak berasal dari pesanmakan.md dan tidak mengubah 55 langkah asli. Contoh kode perlu diterapkan sendiri pada proyek latihan setelah prasyaratnya selesai.', ''];
for (const item of sections) {
  md.push(`## ${item.group === 'Teori' ? `Teori ${item.number} · ` : ''}${item.title}`, '', `Jalur: ${item.group}`, '');
  if (item.question) md.push('### Soal latihan', '', item.question, '', '### Langkah pengerjaan', '', ...item.procedure.map((step, index) => `${index + 1}. ${step}`), '');
  md.push(item.group === 'Teori' ? '### Pengertian / jawaban singkat' : '### Jawaban / contoh penyelesaian', '', item.answerSummary, '');
  for (const block of item.blocks) {
    md.push('### ' + block.heading, '');
    if (block.text) md.push(block.text, '');
    if (block.items) md.push(...block.items.map(x => '- ' + x), '');
    if (block.code) md.push('Lokasi: ' + block.target, '', '```' + block.language, block.code, '```', '', block.explanation, '');
  }
  md.push('### Checklist latihan', '', ...item.checklist.map(x => '- [ ] ' + x), '');
  for (const qa of item.qa) md.push('**' + qa.q + '**', '', qa.a, '');
}
md.push('## Referensi', '', '- [MySQL: SELECT](https://dev.mysql.com/doc/refman/8.4/en/select.html)', '- [MySQL: INSERT](https://dev.mysql.com/doc/refman/8.4/en/insert.html)', '- [MySQL: UPDATE](https://dev.mysql.com/doc/refman/8.4/en/update.html)', '- [MySQL: DELETE](https://dev.mysql.com/doc/refman/8.4/en/delete.html)', '- [Laravel: Authorization/Gates](https://laravel.com/docs/12.x/authorization)', '- [Laravel: Hashing](https://laravel.com/docs/12.x/hashing)', '');
fs.writeFileSync(path.join(root, 'data/bonus-kisi-kisi.md'), md.join('\n'));
console.log('Bonus: 4 teori dan 4 soal latihan, masing-masing dengan langkah pengerjaan dan jawaban.');
