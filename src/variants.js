'use strict';
const fs = require('fs');
const path = require('path');
const original = {
  steps: require('../data/steps.json'),
  notes: require('../data/notes.json'),
  bonus: require('../data/bonus.json')
};

// Only vocabulary changes. Keep the original statements, flags, layout and steps.
const definitions = [
  { id: 'pesanmakan', label: 'Pesan makan' },
  {
    id: 'laundry', label: 'Laundry baju', model: 'LaundryItem', singular: 'laundryItem', plural: 'laundry_items', foreignKey: 'laundry_item_id',
    item: 'Layanan', items: 'Layanan', category: ['Cuci', 'Setrika', 'Paket'], location: 'Antrean', field: 'queue_number', place: 'Laundry',
    names: ['Cuci Baju Reguler', 'Cuci Baju Ekspres', 'Setrika Baju Reguler', 'Setrika Baju Ekspres', 'Paket Cuci dan Setrika'],
    descriptions: ['Layanan cuci baju reguler.', 'Layanan cuci baju ekspres.', 'Layanan setrika baju reguler.', 'Layanan setrika baju ekspres.', 'Paket layanan cuci dan setrika baju.']
  },
  {
    id: 'pesantiketfilm', label: 'Pesan tiket film', model: 'Film', singular: 'film', plural: 'films',
    item: 'Film', items: 'Film', category: ['Aksi', 'Drama', 'Komedi'], location: 'Kursi', field: 'seat_number', place: 'Bioskop',
    names: ['Petualangan Kota', 'Misi Terakhir', 'Cerita Senja', 'Langkah Baru', 'Liburan Seru'],
    descriptions: ['Film aksi petualangan di kota.', 'Film aksi tentang sebuah misi.', 'Film drama tentang keluarga.', 'Film drama tentang persahabatan.', 'Film komedi tentang liburan.']
  },
  {
    id: 'perpustakaan', label: 'Perpustakaan', model: 'Book', singular: 'book', plural: 'books',
    item: 'Buku', items: 'Buku', category: ['Fiksi', 'Nonfiksi', 'Referensi'], location: 'Anggota', field: 'member_number', place: 'Perpustakaan',
    names: ['Petualangan Nusantara', 'Misteri Kota Lama', 'Belajar Laravel', 'Sejarah Indonesia', 'Kamus Bahasa Indonesia'],
    descriptions: ['Buku fiksi petualangan Nusantara.', 'Buku fiksi misteri kota lama.', 'Buku panduan belajar Laravel.', 'Buku pengetahuan sejarah Indonesia.', 'Buku referensi bahasa Indonesia.']
  }
];
const seedNames = ['Nasi Goreng Spesial', 'Mie Goreng Seafood', 'Es Teh Manis', 'Jus Alpukat', 'Kentang Goreng'];
const seedDescriptions = ['Nasi goreng dengan telur, ayam suwir, dan kerupuk.', 'Mie goreng pedas dengan udang dan cumi.', 'Es teh melati segar.', 'Jus alpukat murni dengan susu cokelat.', 'Kentang goreng renyah dengan saus keju.'];

function vocabulary(variant) {
  if (variant.id === 'pesanmakan') return {};
  return {
    ...Object.fromEntries(seedNames.map((name, i) => [name, variant.names[i]])),
    ...Object.fromEntries(seedDescriptions.map((text, i) => [text, variant.descriptions[i]])),
    pesanmakan: variant.id,
    'Menu Restoran': `${variant.items} ${variant.place}`,
    'menu makanan/minuman': variant.items.toLowerCase(),
    'menu makanan': variant.items.toLowerCase(),
    'Makanan': variant.category[0], 'Minuman': variant.category[1], 'Cemilan': variant.category[2],
    // Specific category substitutions also apply to enum, validation and filters.
    'Data Makanan': `Data ${variant.item}`, 'Tambah Makanan': `Tambah ${variant.item}`,
    'Nama Makanan': `Nama ${variant.item}`, 'Gambar Makanan': `Gambar ${variant.item}`,
    'Edit Makanan': `Edit ${variant.item}`, 'Seeder Makanan': `Seeder ${variant.item}`,
    'makanan': variant.item.toLowerCase(), 'minuman': variant.category[1].toLowerCase(),
    'Menu': variant.items, 'menu': variant.items.toLowerCase(),
    'Meja': variant.location, 'meja': variant.location.toLowerCase(), table_number: variant.field,
    'Restoran': variant.place, 'restoran': variant.place.toLowerCase(),
    'Admin Toko': `Admin ${variant.place}`,
    'Food': variant.model, 'foods': variant.plural, 'food_id': variant.foreignKey || `${variant.singular}_id`, 'food': variant.singular,
    ...(variant.id === 'perpustakaan' ? {
      'Pemesanan': 'Peminjaman', 'pemesanan': 'peminjaman',
      'Pesanan': 'Peminjaman', 'pesanan': 'peminjaman',
      'Pemesan': 'Peminjam', 'pemesan': 'peminjam',
      'Pelanggan': 'Anggota', 'pelanggan': 'anggota',
      'Total Harga': 'Total Biaya', 'Selesai / Lunas': 'Selesai / Kembali'
    } : {})
  };
}
function createRename(variant) {
  const words = vocabulary(variant);
  const keys = Object.keys(words).sort((a, b) => b.length - a.length);
  if (!keys.length) return value => value;
  const pattern = new RegExp(keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return value => value.replace(pattern, match => words[match]);
}
function translate(value, rename) {
  if (typeof value === 'string') return rename(value);
  if (Array.isArray(value)) return value.map(item => translate(item, rename));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'id' ? item : translate(item, rename)]));
  return value;
}
const cache = new Map();
function getVariant(id) {
  const variant = definitions.find(item => item.id === id) || definitions[0];
  if (!cache.has(variant.id)) {
    const rename = createRename(variant);
    cache.set(variant.id, { ...variant, ...translate(original, rename), rename,
      source: variant.id === 'pesanmakan' ? 'data/pesanmakan.md' : `data/variants/${variant.id}.md`,
      bonusSource: variant.id === 'pesanmakan' ? 'data/bonus-kisi-kisi.md' : `data/variants/${variant.id}-bonus.md`
    });
  }
  return cache.get(variant.id);
}
function sourceText(id, bonus = false) {
  const originalPath = path.join(__dirname, '../data', bonus ? 'bonus-kisi-kisi.md' : 'pesanmakan.md');
  return getVariant(id).rename(fs.readFileSync(originalPath, 'utf8'));
}
module.exports = { definitions, vocabulary, createRename, getVariant, sourceText };
