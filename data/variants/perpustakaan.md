perpustakaan workflow

kode bawaan yang udah ada biarin. code di bawah cuma bagian yang lu tambah atau ubah.
command dijalankan di terminal vscode.

persiapan awal:
buka terminal lalu jalankan command berikut:

    composer create-project laravel/laravel perpustakaan
    cd perpustakaan
    code .

<!-- modul 1 -->
Step 1
di file .env ubah konfigurasi database jadi:

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=perpustakaan
    DB_USERNAME=root
    DB_PASSWORD=

Step 2
buat model, migration, dan controller dengan command:

    php artisan make:model Book -mcr
    php artisan make:model Order -mcr
    php artisan make:model OrderDetail -m

Step 3
buka file migration di database/migrations. tanggal di nama file ikutin hasil generate lu.
tambahin kolom berikut di dalam Schema::create pada method up(), sebelum timestamps yang udah ada.

#1. xxxx_xx_xx_xxxxxx_create_books_table.php
pastikan nama table di Schema::create adalah books:

    $table->string('name');
    $table->enum('category', ['Fiksi', 'Nonfiksi', 'Referensi']);
    $table->integer('price');
    $table->text('description');
    $table->string('image')->nullable(); // Boleh kosong/null

#2. xxxx_xx_xx_xxxxxx_create_orders_table.php

    $table->string('customer_name');
    $table->string('member_number'); // Bisa Integer/Varchar (disarankan string/varchar)
    $table->integer('total_price');
    $table->string('status')->default('Pending');

#3. xxxx_xx_xx_xxxxxx_create_order_details_table.php
kolom price ikutin catatan revisi di modul: Subtotal Ganti price yaaa.

    // Foreign Key ke tabel orders
    $table->foreignId('order_id')
          ->constrained('orders')
          ->onDelete('cascade');

    // Foreign Key ke tabel books
    $table->foreignId('book_id')
          ->constrained('books')
          ->onDelete('cascade');

    $table->integer('quantity');
    $table->integer('price');

Step 4
jalankan command:

    php artisan migrate
    php artisan make:seeder BookSeeder

Step 5
buka database/seeders/BookSeeder.php, tambahin baris ini di bagian use di atas class:

    use Illuminate\Support\Facades\DB;

lalu isi method run() dengan data yang ada di modul:

    DB::table('books')->insert([
        [
            'name' => 'Petualangan Nusantara',
            'category' => 'Fiksi',
            'price' => 25000,
            'description' => 'Buku fiksi petualangan Nusantara.',
            'image' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Misteri Kota Lama',
            'category' => 'Fiksi',
            'price' => 28000,
            'description' => 'Buku fiksi misteri kota lama.',
            'image' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Belajar Laravel',
            'category' => 'Nonfiksi',
            'price' => 5000,
            'description' => 'Buku panduan belajar Laravel.',
            'image' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Sejarah Indonesia',
            'category' => 'Nonfiksi',
            'price' => 15000,
            'description' => 'Buku pengetahuan sejarah Indonesia.',
            'image' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Kamus Bahasa Indonesia',
            'category' => 'Referensi',
            'price' => 12000,
            'description' => 'Buku referensi bahasa Indonesia.',
            'image' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

Step 6
buka database/seeders/DatabaseSeeder.php.
tambahin baris ini di bagian use di atas class:

    use Illuminate\Support\Facades\Hash;

aktifin import WithoutModelEvents yang masih dikomen, lalu tambahin baris ini di dalam class, sebelum method run(), sesuai gambar modul:

    use WithoutModelEvents;

hapus isi run() bawaan buat Test User, lalu ganti isinya dengan ini.
data buku taruh di BookSeeder aja, jangan ditulis lagi di DatabaseSeeder.

    // 1. Buat User Admin Default
    User::create([
        'name' => 'Admin Perpustakaan',
        'email' => 'admin@gmail.com',
        'password' => Hash::make('password123'),
    ]);

    // 2. Panggil Seeder Buku
    $this->call([
        BookSeeder::class,
    ]);

Step 7
jalankan command berikut buat ulang semua tabel dan isi data awal. data lama di database yang dipilih bakal kehapus:

    php artisan migrate:fresh --seed

Step 8
buka masing2 file model di app/Models.
kalau HasFactory dari gambar modul belum ada di hasil generate lu, tambahin import ini di atas class masing2 model. kalau udah ada, lewatin:

    use Illuminate\Database\Eloquent\Factories\HasFactory;

lalu di dalam class masing2 model, tambahin ini cuma kalau belum ada:

    use HasFactory;

#1. app/Models/Book.php
tambahin di dalam class Book:

    protected $table = 'books';
    protected $guarded = ['id'];

#2. app/Models/Order.php
tambahin di dalam class Order:

    protected $guarded = ['id'];

    // Relasi: 1 Peminjaman punya banyak detail item
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

#3. app/Models/OrderDetail.php
tambahin di dalam class OrderDetail:

    protected $table = 'order_details';
    protected $guarded = ['id'];

    // Relasi balik ke model Book
    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    // Relasi balik ke model Order
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

<!-- modul 1 -->

<!-- ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->

<!-- modul 2 -->

Step 1
buka terminal di vscode lalu jalankan command untuk install Laravel Breeze:

    composer require laravel/breeze --dev

Step 2
jalankan command:

    php artisan breeze:install

pilih: blade
dark mode?: NO
framework do you prefer?: 1 (PHPUnit)

Step 3
setelah install Breeze selesai, jalankan command berikut secara berurutan:

    php artisan migrate
    php artisan storage:link
    npm install
    npm run build

Step 4
buka app/Http/Controllers/BookController.php.
tambahin import ini di bagian use di atas class:

    use Illuminate\Support\Facades\Storage;

di method index(), ganti isinya dengan ini:

    $books = Book::latest()->paginate(10);
    return view('admin.books.index', compact('books'));

di method create(), ganti isinya dengan ini:

    return view('admin.books.create');

di method store(), ganti isinya dengan ini:

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

di method edit(), ganti isinya dengan ini:

    return view('admin.books.edit', compact('book'));

di method update(), ganti isinya dengan ini:

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

di method destroy(), ganti isinya dengan ini:

    if ($book->image && Storage::disk('public')->exists($book->image)) {
        Storage::disk('public')->delete($book->image);
    }
    $book->delete();

    return redirect()->route('books.index')->with('success', 'Data buku berhasil dihapus!');

Step 5
buat folder resources/views/admin/books lalu buat 3 file berikut:

#1. resources/views/admin/books/index.blade.php
isi file nya dengan ini:

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

#2. resources/views/admin/books/create.blade.php
isi file nya dengan ini:

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

#3. resources/views/admin/books/edit.blade.php
isi file nya dengan ini:

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

<!-- modul 2 -->




<!-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->






<!-- modul 3 -->

Step 1
buka app/Http/Controllers/OrderController.php.
tambahin baris ini di bagian use di atas class:

    use App\Models\Book;
    use App\Models\OrderDetail;
    use Illuminate\Support\Facades\DB;

di method index(), ganti isinya dengan ini:

    $books = Book::all();
    return view('customer.index', compact('books'));

di method store(), ganti isinya dengan ini:

    $request->validate([
        'customer_name' => 'required|string|max:255',
        'member_number'  => 'required|integer|min:1',
        'items'         => 'required|array',
        'items.*'       => 'nullable|integer|min:0',
    ]);

    $orderedItems = array_filter($request->items, fn ($qty) => $qty > 0);

    if (empty($orderedItems)) {
        return back()->with('error', 'Pilih minimal satu buku!');
    }

    DB::beginTransaction();
    try {
        $order = Order::create([
            'customer_name' => $request->customer_name,
            'member_number'  => $request->member_number,
            'total_price'   => 0,
            'status'        => 'pending',
        ]);

        $totalPrice = 0;

        foreach ($orderedItems as $bookId => $quantity) {
            $book = Book::findOrFail($bookId);
            $subtotal = $book->price * $quantity;
            $totalPrice += $subtotal;

            OrderDetail::create([
                'order_id' => $order->id,
                'book_id'  => $book->id,
                'quantity' => $quantity,
                'subtotal' => $subtotal, // Disimpan ke kolom subtotal
            ]);
        }

        $order->update(['total_price' => $totalPrice]);
        DB::commit();

        return redirect()->route('customer.index')->with('success', 'Peminjaman berhasil dibuat! Nomor Anggota: ' . $order->member_number);
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('error', 'Gagal memproses peminjaman: ' . $e->getMessage());
    }

lalu tambahin 2 method ini di dalam class OrderController:

    public function adminDashboard()
    {
        $orders = Order::with('orderDetails.book')->latest()->get();
        return view('dashboard', compact('orders'));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return back()->with('success', 'Status peminjaman #' . $order->id . ' berhasil diperbarui!');
    }

Step 2
buat folder resources/views/customer lalu buat file index.blade.php.
isi resources/views/customer/index.blade.php dengan ini:

    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Buku Perpustakaan</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-6 font-sans">
        <div class="max-w-5xl mx-auto">
            <div class="text-center mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Buku Perpustakaan</h1>
                <p class="text-gray-500 text-sm mt-1">Pilih buku dan masukkan nomor anggota Anda</p>
            </div>

            <!-- NOTIFIKASI SUCCESS / ERROR / VALIDASI -->
            @if(session('success'))
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-center font-semibold">{{ session('success') }}</div>
            @endif

            @if(session('error'))
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-center font-semibold">{{ session('error') }}</div>
            @endif

            @if($errors->any())
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 font-semibold">
                    <ul class="list-disc list-inside">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- FILTER KATEGORI (JAVASCRIPT) -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
                <button type="button" onclick="filterCategory('all', this)" class="btn-category px-5 py-2 rounded-full font-semibold text-sm transition bg-blue-600 text-white shadow-md">Semua Buku</button>
                <button type="button" onclick="filterCategory('Fiksi', this)" class="btn-category px-5 py-2 rounded-full font-semibold text-sm transition bg-white text-gray-600 hover:bg-gray-200 border">Fiksi</button>
                <button type="button" onclick="filterCategory('Nonfiksi', this)" class="btn-category px-5 py-2 rounded-full font-semibold text-sm transition bg-white text-gray-600 hover:bg-gray-200 border">Nonfiksi</button>
                <button type="button" onclick="filterCategory('Referensi', this)" class="btn-category px-5 py-2 rounded-full font-semibold text-sm transition bg-white text-gray-600 hover:bg-gray-200 border">Referensi</button>
            </div>

            <form id="orderForm" action="{{ route('customer.checkout') }}" method="POST">
                @csrf

                <!-- 1. Informasi Peminjam -->
                <div class="bg-white p-6 rounded-xl shadow-sm border mb-6">
                    <h2 class="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">1. Informasi Peminjam</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                            <input type="text" id="customer_name" name="customer_name" required placeholder="Masukkan nama peminjam" class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-600 mb-1">Nomor Anggota</label>
                            <input type="number" id="member_number" name="member_number" required placeholder="Contoh: 05" class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                    </div>
                </div>

                <!-- 2. Pilih Buku -->
                <h2 class="text-lg font-bold text-gray-700 mb-4">2. Pilih Buku</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    @foreach($books as $book)
                        <div class="book-card bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col justify-between" data-category="{{ $book->category ?? 'Fiksi' }}">
                            <div>
                                @if($book->image)
                                    <img src="{{ asset('storage/' . $book->image) }}" alt="{{ $book->name }}" class="w-full h-40 object-cover">
                                @else
                                    <div class="bg-gray-200 h-40 flex items-center justify-center text-gray-400 font-medium">Tanpa Gambar</div>
                                @endif

                                <div class="p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-0.5 rounded">{{ $book->category ?? 'Fiksi' }}</span>
                                        <span class="font-bold text-green-600">Rp {{ number_format($book->price) }}</span>
                                    </div>
                                    <h3 class="font-bold text-gray-800 text-lg item-name">{{ $book->name }}</h3>
                                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ $book->description }}</p>
                                </div>
                            </div>

                            <div class="p-4 bg-gray-50 border-t">
                                <label class="block text-xs font-semibold text-gray-500 mb-1">Jumlah Porsi</label>
                                <input type="number" name="items[{{ $book->id }}]" min="0" value="0" data-name="{{ $book->name }}" data-price="{{ $book->price }}" class="item-qty w-full border rounded-lg px-3 py-1.5 text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="mt-8 text-right">
                    <button type="button" onclick="showConfirmationModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition">Pesan Sekarang</button>
                </div>

                <!-- MODAL KONFIRMASI PESANAN (DI DALAM FORM) -->
                <div id="confirmModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
                        <h3 class="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Konfirmasi Peminjaman</h3>
                        <div class="space-y-2 text-sm text-gray-600 mb-4">
                            <div class="flex justify-between"><span class="font-semibold">Nama:</span> <span id="modalName" class="text-gray-900 font-bold"></span></div>
                            <div class="flex justify-between"><span class="font-semibold">No. Anggota:</span> <span id="modalTable" class="text-gray-900 font-bold"></span></div>
                        </div>
                        <div class="border-t border-b py-3 mb-4 max-h-48 overflow-y-auto">
                            <p class="font-semibold text-xs text-gray-400 uppercase mb-2">Rincian Item</p>
                            <ul id="modalItemList" class="space-y-2 text-sm"></ul>
                        </div>
                        <div class="flex justify-between items-center text-lg font-bold text-gray-800 mb-6">
                            <span>Total Pembayaran:</span>
                            <span id="modalTotalPrice" class="text-green-600 text-xl">Rp 0</span>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="closeConfirmationModal()" class="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition">Batal</button>
                            <button type="submit" class="w-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl shadow transition">Ya, Kirim Peminjaman</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <script>
            function filterCategory(category, element) {
                document.querySelectorAll('.btn-category').forEach(btn => {
                    btn.className = "btn-category px-5 py-2 rounded-full font-semibold text-sm transition bg-white text-gray-600 hover:bg-gray-200 border";
                });
                element.className = "btn-category px-5 py-2 rounded-full font-semibold text-sm transition bg-blue-600 text-white shadow-md";
                const cards = document.querySelectorAll('.book-card');
                cards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    card.style.display = (category === 'all' || cardCategory === category) ? 'flex' : 'none';
                });
            }

            function showConfirmationModal() {
                const name = document.getElementById('customer_name').value.trim();
                const table = document.getElementById('member_number').value.trim();
                if (!name || !table) {
                    alert('Silakan isi Nama Lengkap dan Nomor Anggota terlebih dahulu!');
                    return;
                }
                const items = document.querySelectorAll('.item-qty');
                let itemListHtml = '';
                let grandTotal = 0;
                let hasOrder = false;

                items.forEach(input => {
                    const qty = parseInt(input.value) || 0;
                    if (qty > 0) {
                        hasOrder = true;
                        const itemName = input.getAttribute('data-name');
                        const price = parseFloat(input.getAttribute('data-price'));
                        const subtotal = qty * price;
                        grandTotal += subtotal;
                        itemListHtml += `<li class="flex justify-between items-center"><div><span class="font-bold text-gray-800">${itemName}</span><span class="text-xs text-gray-500 block">x${qty} @ Rp ${price.toLocaleString('id-ID')}</span></div><span class="font-semibold text-gray-700">Rp ${subtotal.toLocaleString('id-ID')}</span></li>`;
                    }
                });

                if (!hasOrder) {
                    alert('Pilih minimal 1 buku dengan jumlah lebih dari 0!');
                    return;
                }

                document.getElementById('modalName').textContent = name;
                document.getElementById('modalTable').textContent = table;
                document.getElementById('modalItemList').innerHTML = itemListHtml;
                document.getElementById('modalTotalPrice').textContent = 'Rp ' + grandTotal.toLocaleString('id-ID');

                const modal = document.getElementById('confirmModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }

            function closeConfirmationModal() {
                const modal = document.getElementById('confirmModal');
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            }
        </script>
    </body>
    </html>

Step 3
buka app/Models/OrderDetail.php.
samain bagian ini di dalam class OrderDetail dengan gambar modul. kalau udah ada, jangan ditambah dua kali:

    protected $table = 'order_details';
    // Gunakan guarded agar kolom 'subtotal' diizinin masuk ke database
    protected $guarded = ['id'];

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

<!-- modul 3 -->





<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->




<!-- modul 4 -->

Step 1
buka resources/views/dashboard.blade.php lalu ganti isi file nya dengan ini:

    <x-app-layout>
        <x-slot name="header">
            <div class="flex justify-between items-center">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Daftar Peminjaman Masuk') }}
                </h2>
                <div class="flex items-center gap-3">
                    <a href="{{ route('books.index') }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition">
                        Kelola Buku
                    </a>
                    <a href="{{ route('customer.index') }}" target="_blank" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 shadow-sm transition">
                        Lihat Buku Customer
                    </a>
                </div>
            </div>
        </x-slot>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                @if(session('success'))
                    <div class="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm font-medium">
                        {{ session('success') }}
                    </div>
                @endif

                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                    <div class="p-6 text-gray-900 overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th class="p-4 border-b"># ID</th>
                                    <th class="p-4 border-b">Anggota</th>
                                    <th class="p-4 border-b">No. Anggota</th>
                                    <th class="p-4 border-b">Rincian Peminjaman</th>
                                    <th class="p-4 border-b">Total Biaya</th>
                                    <th class="p-4 border-b">Status</th>
                                    <th class="p-4 border-b text-center">Aksi Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y text-sm">
                                @forelse($orders as $order)
                                    <tr class="hover:bg-gray-50">
                                        <td class="p-4 font-bold text-gray-700">#{{ $order->id }}</td>
                                        <td class="p-4 font-medium">{{ $order->customer_name }}</td>
                                        <td class="p-4">
                                            <span class="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-xs">
                                                Anggota {{ $order->member_number }}
                                            </span>
                                        </td>
                                        <td class="p-4">
                                            <ul class="list-disc list-inside space-y-1 text-gray-600">
                                                @foreach($order->orderDetails as $detail)
                                                    <li>
                                                        <strong>{{ $detail->book->name ?? 'Buku' }}</strong> 
                                                        x{{ $detail->quantity }} 
                                                        <span class="text-xs text-gray-400">(Rp {{ number_format($detail->subtotal) }})</span>
                                                    </li>
                                                @endforeach
                                            </ul>
                                        </td>
                                        <td class="p-4 font-bold text-green-600">
                                            Rp {{ number_format($order->total_price) }}
                                        </td>
                                        <td class="p-4">
                                            @if(strtolower($order->status) == 'pending')
                                                <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded">PENDING</span>
                                            @elseif(strtolower($order->status) == 'completed' || strtolower($order->status) == 'selesai')
                                                <span class="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded">SELESAI</span>
                                            @else
                                                <span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded">{{ strtoupper($order->status) }}</span>
                                            @endif
                                        </td>
                                        <td class="p-4 text-center">
                                            <form action="{{ route('admin.orders.updateStatus', $order->id) }}" method="POST">
                                                @csrf
                                                @method('PATCH')
                                                <select name="status" onchange="this.form.submit()" class="text-xs border border-gray-300 rounded p-1.5 bg-white shadow-sm font-semibold">
                                                    <option value="pending" {{ strtolower($order->status) == 'pending' ? 'selected' : '' }}>Pending</option>
                                                    <option value="completed" {{ strtolower($order->status) == 'completed' || strtolower($order->status) == 'selesai' ? 'selected' : '' }}>Selesai / Kembali</option>
                                                    <option value="cancelled" {{ strtolower($order->status) == 'cancelled' || strtolower($order->status) == 'batal' ? 'selected' : '' }}>Batalkan</option>
                                                </select>  
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" class="p-6 text-center text-gray-500">Belum ada peminjaman masuk.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </x-app-layout>

Step 2
buka routes/web.php, tambahin 2 baris ini di bagian use di atas:

    use App\Http\Controllers\BookController;
    use App\Http\Controllers\OrderController;

hapus route halaman utama / bawaan, lalu ganti dengan ini:

    // Halaman utama (Katalog Buku Anggota)
    Route::get('/', [OrderController::class, 'index'])->name('customer.index');
    Route::post('/checkout', [OrderController::class, 'store'])->name('customer.checkout');

ganti route /dashboard bawaan Breeze dengan ini, jangan ditambah dua kali:

    // Arahkan dashboard utama Breeze langsung ke Admin Dashboard
    Route::get('/dashboard', [OrderController::class, 'adminDashboard'])
        ->middleware(['auth', 'verified'])
        ->name('dashboard');

di dalam group Route::middleware('auth'), tambahin route berikut setelah route profile yang udah ada:

    // Alias route untuk admin dashboard
    Route::get('/admin/dashboard', [OrderController::class, 'adminDashboard'])->name('admin.dashboard');
    Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.updateStatus');
    Route::resource('/admin/books', BookController::class);

<!-- modul 4 -->


1. login dan register untuk admin dan user 
2. bikin relasi antar book, harga tiket, dan peminjaman buku //antara buku nya, harga buku
3. fungsi dari bahasa mysql, bisa berupa tambah, edit, hapus, dan view
4. yang di maksud query dan penjelasan nya
5. praktek: membuat halaman register login, user, dan  admin //kalo gk bisa bikin data dummy
6. bikin crud
7. filter
8. data dummy