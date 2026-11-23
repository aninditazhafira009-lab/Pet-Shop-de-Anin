// ==========================================
// KONFIGURASI SUPABASE - CAFE PET DE ANIN
// ==========================================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;
if (
  window.supabase &&
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==========================================
// CHART OF ACCOUNTS (COA)
// ==========================================
const COA = {
  '111': { name: 'Kas Besar', type: 'Aset', normal: 'D' },
  '112': { name: 'Kas Kecil (Imprest)', type: 'Aset', normal: 'D' },
  '113': { name: 'Persediaan Barang Dagang', type: 'Aset', normal: 'D' },
  '311': { name: 'Modal Pemilik', type: 'Ekuitas', normal: 'K' },
  '411': { name: 'Pendapatan Penjualan', type: 'Pendapatan', normal: 'K' },
  '412': { name: 'Pendapatan Selisih Kas', type: 'Pendapatan', normal: 'K' },
  '511': { name: 'Harga Pokok Penjualan (HPP)', type: 'Beban', normal: 'D' },
  '512': { name: 'Beban Operasional & Perlengkapan', type: 'Beban', normal: 'D' },
  '513': { name: 'Beban Listrik, Air & Internet', type: 'Beban', normal: 'D' },
  '514': { name: 'Beban Kebersihan & Perawatan Hewan', type: 'Beban', normal: 'D' },
  '515': { name: 'Beban Selisih Kas', type: 'Beban', normal: 'D' }
};

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];
const STORAGE_KEY = 'pet_de_anin_pos_v1';

const ROOM_META = {
  dashboard: ['Dashboard Executive', 'Ringkasan performa keuangan & stok Cafe Pet De Anin'],
  pos: ['POS Kasir', 'Transaksi penjualan & pemotongan stok perpetual otomatis'],
  pettycash: ['Petty Cash Imprest', 'Pengelolaan dana kas kecil sistem dana tetap'],
  katalog: ['Katalog Produk', 'Manajemen item cafe, pet food, harga pokok, dan restok'],
  opname: ['Cash Opname', 'Perhitungan fisik uang tunai & penyesuaian selisih kas'],
  jurnal: ['Jurnal Umum', 'Catatan kronologis seluruh transaksi otomatis & manual'],
  neraca: ['Neraca Saldo', 'Rekapitulasi saldo akhir seluruh akun & uji keseimbangan']
};

// ==========================================
// DATA AWAL (SEED DEMO)
// ==========================================
function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function getDefaultState() {
  const today = getTodayISO();
  return {
    imprestLimit: 1500000,
    products: [
      { id: 'P1', name: 'Matcha Paw Latte', category: 'Cafe', cost: 12000, price: 28000, stock: 25, emoji: '🍵' },
      { id: 'P2', name: 'Caramel Guinea Frappe', category: 'Cafe', cost: 14000, price: 32000, stock: 20, emoji: '🧋' },
      { id: 'P3', name: 'Timothy Hay Premium 500g', category: 'Pet Food', cost: 35000, price: 55000, stock: 15, emoji: '🌿' },
      { id: 'P4', name: 'Pelet Marmut & Kelinci', category: 'Pet Food', cost: 22000, price: 38000, stock: 18, emoji: '🐹' },
      { id: 'P5', name: 'Creamy Cat Treat Pack', category: 'Pet Food', cost: 15000, price: 26000, stock: 30, emoji: '🐱' },
      { id: 'P6', name: 'Mini Grooming & Nail Trim', category: 'Aksesoris', cost: 15000, price: 45000, stock: 99, emoji: '🛁' }
    ],
    vouchers: [],
    journals: [
      { id: 'J1', date: today, ref: 'INIT-01', desc: 'Setoran Modal Awal & Pembentukan Kas Kecil', account: '111', debit: 15000000, credit: 0 },
      { id: 'J2', date: today, ref: 'INIT-01', desc: 'Setoran Modal Awal & Pembentukan Kas Kecil', account: '112', debit: 1500000, credit: 0 },
      { id: 'J3', date: today, ref: 'INIT-01', desc: 'Setoran Modal Awal & Pembentukan Kas Kecil', account: '113', debit: 3500000, credit: 0 },
      { id: 'J4', date: today, ref: 'INIT-01', desc: 'Setoran Modal Awal & Pembentukan Kas Kecil', account: '311', debit: 0, credit: 20000000 }
    ]
  };
}

let state = loadState();
let cart = [];
let opnameCounts = {};
DENOMINATIONS.forEach(d => (opnameCounts[d] = 0));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Gagal membaca localStorage:', e);
  }
  return getDefaultState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function syncJournalToSupabase(entries) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('journals').insert(entries);
  } catch (err) {
    console.warn('Supabase sync skipped:', err.message);
  }
}

// ==========================================
// HELPER FORMAT & NOTIFIKASI
// ==========================================
function formatRp(num) {
  const n = Number(num) || 0;
  return (n < 0 ? '-Rp ' : 'Rp ') + Math.abs(n).toLocaleString('id-ID');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function addJournalEntries(entries) {
  state.journals.push(...entries);
  saveState();
  syncJournalToSupabase(entries);
}

function getAccountBalance(code) {
  const info = COA[code];
  let totalD = 0;
  let totalK = 0;
  state.journals.forEach(j => {
    if (j.account === code) {
      totalD += Number(j.debit) || 0;
      totalK += Number(j.credit) || 0;
    }
  });
  return info.normal === 'D' ? totalD - totalK : totalK - totalD;
}

// ==========================================
// NAVIGASI 7 ROOM
// ==========================================
function switchRoom(roomId) {
  document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`room-${roomId}`).classList.add('active');
  document.querySelector(`.nav-btn[data-room="${roomId}"]`).classList.add('active');

  const [title, subtitle] = ROOM_META[roomId];
  document.getElementById('roomTitle').textContent = title;
  document.getElementById('roomSubtitle').textContent = subtitle;

  document.getElementById('sidebar').classList.remove('open');
  renderAll();
}

// ==========================================
// RENDER 1: DASHBOARD EXECUTIVE
// ==========================================
function renderDashboard() {
  const sales = getAccountBalance('411');
  const cogs = getAccountBalance('511');
  const mainCash = getAccountBalance('111');
  const voucherSum = state.vouchers.reduce((s, v) => s + v.amount, 0);
  const pettyPhysical = state.imprestLimit - voucherSum;

  document.getElementById('kpiSales').textContent = formatRp(sales);
  document.getElementById('kpiGrossProfit').textContent = formatRp(sales - cogs);
  document.getElementById('kpiMainCash').textContent = formatRp(mainCash);
  document.getElementById('kpiPettyCash').textContent = formatRp(pettyPhysical);

  // Recent Journals
  const recent = [...state.journals].slice(-6).reverse();
  const tbody = document.getElementById('dashRecentJournals');
  tbody.innerHTML = recent.map(j => `
    <tr>
      <td>${j.date}</td>
      <td>${j.desc}</td>
      <td><strong>${j.account}</strong> - ${COA[j.account]?.name || ''}</td>
      <td class="text-right">${j.debit ? formatRp(j.debit) : '-'}</td>
      <td class="text-right">${j.credit ? formatRp(j.credit) : '-'}</td>
    </tr>
  `).join('');

  // Stock monitor
  const stockList = document.getElementById('dashStockList');
  stockList.innerHTML = state.products.map(p => {
    const low = p.stock <= 5;
    return `
      <div class="stock-item">
        <div>
          <strong>${p.emoji} ${p.name}</strong>
          <div style="font-size:0.78rem;color:#7c6f89">${p.category}</div>
        </div>
        <span class="badge ${low ? 'badge-low' : 'badge-ok'}">
          Stok: ${p.stock} ${low ? '(Menipis!)' : ''}
        </span>
      </div>
    `;
  }).join('');
}

// ==========================================
// RENDER 2: POS KASIR (PERPETUAL)
// ==========================================
function renderPOS() {
  const keyword = document.getElementById('posSearch').value.toLowerCase();
  const cat = document.getElementById('posCategoryFilter').value;

  const filtered = state.products.filter(p => {
    const matchName = p.name.toLowerCase().includes(keyword);
    const matchCat = cat === 'ALL' || p.category === cat;
    return matchName && matchCat;
  });

  const grid = document.getElementById('posProductGrid');
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="addToCart('${p.id}')">
      <div class="product-emoji">${p.emoji}</div>
      <div class="product-title">${p.name}</div>
      <div class="product-price">${formatRp(p.price)}</div>
      <div class="product-stock">Stok tersedia: ${p.stock}</div>
    </div>
  `).join('') || '<p class="empty-state">Produk tidak ditemukan.</p>';

  renderCart();
}

function addToCart(prodId) {
  const prod = state.products.find(p => p.id === prodId);
  if (!prod || prod.stock <= 0) {
    showToast('Stok produk habis! Silakan restok di Katalog.');
    return;
  }
  const existing = cart.find(c => c.id === prodId);
  if (existing) {
    if (existing.qty >= prod.stock) {
      showToast('Jumlah melebihi stok yang tersedia.');
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({ id: prod.id, name: prod.name, price: prod.price, cost: prod.cost, qty: 1 });
  }
  renderCart();
}

function updateCartQty(prodId, delta) {
  const item = cart.find(c => c.id === prodId);
  const prod = state.products.find(p => p.id === prodId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== prodId);
  } else if (prod && item.qty > prod.stock) {
    item.qty = prod.stock;
    showToast('Stok maksimal tercapai.');
  }
  renderCart();
}

function renderCart() {
  const box = document.getElementById('cartItems');
  if (cart.length === 0) {
    box.innerHTML = '<p class="empty-state">Belum ada item di keranjang.</p>';
    document.getElementById('cartTotalPrice').textContent = 'Rp 0';
    document.getElementById('cartTotalCogs').textContent = 'Rp 0';
    return;
  }

  let totalPrice = 0;
  let totalCogs = 0;

  box.innerHTML = cart.map(item => {
    totalPrice += item.price * item.qty;
    totalCogs += item.cost * item.qty;
    return `
      <div class="cart-row">
        <div>
          <strong>${item.name}</strong>
          <div style="font-size:0.8rem;color:#7c6f89">${formatRp(item.price)} x ${item.qty}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <strong>${item.qty}</strong>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('cartTotalPrice').textContent = formatRp(totalPrice);
  document.getElementById('cartTotalCogs').textContent = formatRp(totalCogs);
}

function processCheckout() {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }

  const method = document.getElementById('posPaymentMethod').value;
  const today = getTodayISO();
  const ref = 'POS-' + Date.now().toString().slice(-5);

  let totalSales = 0;
  let totalCogs = 0;

  cart.forEach(item => {
    totalSales += item.price * item.qty;
    totalCogs += item.cost * item.qty;
    const prod = state.products.find(p => p.id === item.id);
    if (prod) prod.stock -= item.qty;
  });

  // Jurnal Sistem Perpetual: (1) Penjualan, (2) HPP & Persediaan
  addJournalEntries([
    { id: ref + 'a', date: today, ref, desc: `Penjualan POS (${method})`, account: '111', debit: totalSales, credit: 0 },
    { id: ref + 'b', date: today, ref, desc: `Penjualan POS (${method})`, account: '411', debit: 0, credit: totalSales },
    { id: ref + 'c', date: today, ref, desc: `HPP Penjualan POS (${ref})`, account: '511', debit: totalCogs, credit: 0 },
    { id: ref + 'd', date: today, ref, desc: `Pengurangan Persediaan (${ref})`, account: '113', debit: 0, credit: totalCogs }
  ]);

  cart = [];
  showToast(`Transaksi ${ref} berhasil! Jurnal Penjualan & HPP tercatat.`);
  renderAll();
}

// ==========================================
// RENDER 3: PETTY CASH IMPREST
// ==========================================
function renderPettyCash() {
  const used = state.vouchers.reduce((s, v) => s + v.amount, 0);
  const remaining = state.imprestLimit - used;

  document.getElementById('pcLimit').textContent = formatRp(state.imprestLimit);
  document.getElementById('pcUsed').textContent = formatRp(used);
  document.getElementById('pcRemaining').textContent = formatRp(remaining);

  const tbody = document.getElementById('pcVoucherTable');
  if (state.vouchers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Belum ada voucher pengeluaran aktif.</td></tr>';
    return;
  }

  tbody.innerHTML = state.vouchers.map(v => `
    <tr>
      <td>${v.date}</td>
      <td>${v.desc}</td>
      <td>${v.account} - ${COA[v.account]?.name}</td>
      <td class="text-right">${formatRp(v.amount)}</td>
    </tr>
  `).join('');
}

function handlePettyCashSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('pcDate').value;
  const account = document.getElementById('pcAccount').value;
  const desc = document.getElementById('pcDesc').value.trim();
  const amount = Number(document.getElementById('pcAmount').value);

  const used = state.vouchers.reduce((s, v) => s + v.amount, 0);
  if (used + amount > state.imprestLimit) {
    showToast('Nominal melebihi sisa fisik Dana Kas Kecil!');
    return;
  }

  state.vouchers.push({ id: 'VC-' + Date.now(), date, account, desc, amount });
  saveState();
  e.target.reset();
  document.getElementById('pcDate').value = getTodayISO();
  showToast('Voucher kas kecil berhasil dicatat.');
  renderAll();
}

function replenishPettyCash() {
  if (state.vouchers.length === 0) {
    showToast('Tidak ada voucher yang perlu diisi kembali.');
    return;
  }

  const today = getTodayISO();
  const ref = 'PC-' + Date.now().toString().slice(-5);
  const total = state.vouchers.reduce((s, v) => s + v.amount, 0);

  // Kelompokkan beban per akun
  const grouped = {};
  state.vouchers.forEach(v => {
    grouped[v.account] = (grouped[v.account] || 0) + v.amount;
  });

  const entries = Object.entries(grouped).map(([acc, amt], idx) => ({
    id: `${ref}-${idx}`,
    date: today,
    ref,
    desc: `Pengisian Kembali Kas Kecil (Imprest)`,
    account: acc,
    debit: amt,
    credit: 0
  }));

  entries.push({
    id: `${ref}-cr`,
    date: today,
    ref,
    desc: `Pengisian Kembali Kas Kecil (Imprest)`,
    account: '111',
    debit: 0,
    credit: total
  });

  state.vouchers = [];
  addJournalEntries(entries);
  showToast(`Kas Kecil diisi kembali sebesar ${formatRp(total)}!`);
  renderAll();
}

// ==========================================
// RENDER 4: KATALOG PRODUK
// ==========================================
function renderCatalog() {
  const tbody = document.getElementById('catalogTable');
  tbody.innerHTML = state.products.map(p => `
    <tr>
      <td><strong>${p.emoji} ${p.name}</strong></td>
      <td><span class="badge badge-cat">${p.category}</span></td>
      <td class="text-right">${formatRp(p.cost)}</td>
      <td class="text-right">${formatRp(p.price)}</td>
      <td class="text-center">
        <span class="badge ${p.stock <= 5 ? 'badge-low' : 'badge-ok'}">${p.stock}</span>
      </td>
      <td class="text-center">
        <button class="btn-sm" onclick="restockProduct('${p.id}')">+Restok</button>
        <button class="btn-sm danger" onclick="deleteProduct('${p.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function handleAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const cost = Number(document.getElementById('prodCost').value);
  const price = Number(document.getElementById('prodPrice').value);
  const stock = Number(document.getElementById('prodStock').value);
  const emoji = document.getElementById('prodEmoji').value.trim() || '🐾';

  const newProd = { id: 'P' + Date.now(), name, category, cost, price, stock, emoji };
  state.products.push(newProd);

  // Jika stok awal > 0, catat pembelian persediaan tunai
  if (stock > 0 && cost > 0) {
    const totalVal = stock * cost;
    const ref = 'BUY-' + Date.now().toString().slice(-4);
    const today = getTodayISO();
    addJournalEntries([
      { id: ref + 'd', date: today, ref, desc: `Pembelian Stok Awal ${name}`, account: '113', debit: totalVal, credit: 0 },
      { id: ref + 'k', date: today, ref, desc: `Pembelian Stok Awal ${name}`, account: '111', debit: 0, credit: totalVal }
    ]);
  } else {
    saveState();
  }

  e.target.reset();
  document.getElementById('prodEmoji').value = '🐾';
  showToast(`Produk "${name}" berhasil ditambahkan!`);
  renderAll();
}

function restockProduct(prodId) {
  const prod = state.products.find(p => p.id === prodId);
  if (!prod) return;
  const qtyStr = prompt(`Masukkan jumlah restok untuk "${prod.name}" (HPP: ${formatRp(prod.cost)}/unit):`, '10');
  const qty = Number(qtyStr);
  if (!qty || qty <= 0) return;

  prod.stock += qty;
  const totalCost = qty * prod.cost;
  const today = getTodayISO();
  const ref = 'RST-' + Date.now().toString().slice(-4);

  addJournalEntries([
    { id: ref + 'd', date: today, ref, desc: `Restok ${qty}x ${prod.name}`, account: '113', debit: totalCost, credit: 0 },
    { id: ref + 'k', date: today, ref, desc: `Restok ${qty}x ${prod.name}`, account: '111', debit: 0, credit: totalCost }
  ]);

  showToast(`Berhasil restok ${qty} unit ${prod.name}!`);
  renderAll();
}

function deleteProduct(prodId) {
  if (!confirm('Hapus produk ini dari katalog?')) return;
  state.products = state.products.filter(p => p.id !== prodId);
  saveState();
  showToast('Produk dihapus dari katalog.');
  renderAll();
}

// ==========================================
// RENDER 5: CASH OPNAME
// ==========================================
function renderOpname() {
  const tbody = document.getElementById('opnameDenomBody');
  tbody.innerHTML = DENOMINATIONS.map(d => {
    const qty = opnameCounts[d] || 0;
    return `
      <tr>
        <td><strong>${formatRp(d)}</strong></td>
        <td>
          <input type="number" min="0" class="input-field" style="max-width:110px"
            value="${qty}" oninput="updateOpnameCount(${d}, this.value)" />
        </td>
        <td class="text-right">${formatRp(d * qty)}</td>
      </tr>
    `;
  }).join('');

  calculateOpnameDiff();
}

function updateOpnameCount(denom, val) {
  opnameCounts[denom] = Math.max(0, Number(val) || 0);
  renderOpname();
}

function calculateOpnameDiff() {
  const target = document.getElementById('opnameTarget').value;
  let physical = 0;
  DENOMINATIONS.forEach(d => (physical += d * (opnameCounts[d] || 0)));

  let bookBalance = getAccountBalance(target);
  if (target === '112') {
    const used = state.vouchers.reduce((s, v) => s + v.amount, 0);
    bookBalance = state.imprestLimit - used;
  }

  const diff = physical - bookBalance;
  document.getElementById('opnamePhysicalTotal').textContent = formatRp(physical);
  document.getElementById('opnameBookBalance').textContent = formatRp(bookBalance);
  document.getElementById('opnameDiffValue').textContent = formatRp(diff);

  const box = document.getElementById('opnameDiffBox');
  const statusEl = document.getElementById('opnameDiffStatus');

  if (diff === 0) {
    box.classList.remove('warn');
    statusEl.textContent = 'Sesuai / Cocok (Tidak ada selisih)';
  } else if (diff > 0) {
    box.classList.add('warn');
    statusEl.textContent = 'Selisih Lebih (Cash Over)';
  } else {
    box.classList.add('warn');
    statusEl.textContent = 'Selisih Kurang (Cash Short)';
  }
}

function postOpnameAdjustment() {
  const target = document.getElementById('opnameTarget').value;
  let physical = 0;
  DENOMINATIONS.forEach(d => (physical += d * (opnameCounts[d] || 0)));

  let bookBalance = getAccountBalance(target);
  if (target === '112') {
    const used = state.vouchers.reduce((s, v) => s + v.amount, 0);
    bookBalance = state.imprestLimit - used;
  }

  const diff = physical - bookBalance;
  if (diff === 0) {
    showToast('Saldo kas sudah cocok, tidak perlu jurnal penyesuaian.');
    return;
  }

  const today = getTodayISO();
  const ref = 'OPN-' + Date.now().toString().slice(-4);
  const absDiff = Math.abs(diff);

  if (diff > 0) {
    // Cash Over: Dr Kas, Cr Pendapatan Selisih Kas
    addJournalEntries([
      { id: ref + 'd', date: today, ref, desc: 'Penyesuaian Cash Opname (Lebih)', account: target, debit: absDiff, credit: 0 },
      { id: ref + 'k', date: today, ref, desc: 'Penyesuaian Cash Opname (Lebih)', account: '412', debit: 0, credit: absDiff }
    ]);
  } else {
    // Cash Short: Dr Beban Selisih Kas, Cr Kas
    addJournalEntries([
      { id: ref + 'd', date: today, ref, desc: 'Penyesuaian Cash Opname (Kurang)', account: '515', debit: absDiff, credit: 0 },
      { id: ref + 'k', date: today, ref, desc: 'Penyesuaian Cash Opname (Kurang)', account: target, debit: 0, credit: absDiff }
    ]);
  }

  showToast(`Jurnal penyesuaian selisih kas (${formatRp(diff)}) berhasil diposting!`);
  renderAll();
}

// ==========================================
// RENDER 6: JURNAL UMUM
// ==========================================
function populateAccountSelects() {
  const opts = Object.entries(COA).map(([code, info]) =>
    `<option value="${code}">${code} - ${info.name}</option>`
  ).join('');
  document.getElementById('mjDebitAcc').innerHTML = `<option value="">-- Akun Debit --</option>` + opts;
  document.getElementById('mjCreditAcc').innerHTML = `<option value="">-- Akun Kredit --</option>` + opts;
}

function renderJournals() {
  const q = document.getElementById('journalSearch').value.toLowerCase();
  const filtered = state.journals.filter(j =>
    j.desc.toLowerCase().includes(q) ||
    j.account.includes(q) ||
    (COA[j.account]?.name.toLowerCase().includes(q))
  );

  let sumD = 0;
  let sumK = 0;

  const tbody = document.getElementById('journalTableBody');
  tbody.innerHTML = filtered.map(j => {
    sumD += Number(j.debit) || 0;
    sumK += Number(j.credit) || 0;
    return `
      <tr>
        <td>${j.date}</td>
        <td><span class="badge badge-cat">${j.ref}</span></td>
        <td>${j.desc}</td>
        <td><strong>${j.account}</strong> - ${COA[j.account]?.name || ''}</td>
        <td class="text-right">${j.debit ? formatRp(j.debit) : '-'}</td>
        <td class="text-right">${j.credit ? formatRp(j.credit) : '-'}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('journalTotalDebit').textContent = formatRp(sumD);
  document.getElementById('journalTotalCredit').textContent = formatRp(sumK);
}

function handleManualJournal(e) {
  e.preventDefault();
  const date = document.getElementById('mjDate').value;
  const desc = document.getElementById('mjDesc').value.trim();
  const dAcc = document.getElementById('mjDebitAcc').value;
  const kAcc = document.getElementById('mjCreditAcc').value;
  const amount = Number(document.getElementById('mjAmount').value);

  if (!dAcc || !kAcc || dAcc === kAcc) {
    showToast('Pilih akun Debit dan Kredit yang berbeda!');
    return;
  }

  const ref = 'MAN-' + Date.now().toString().slice(-4);
  addJournalEntries([
    { id: ref + 'd', date, ref, desc, account: dAcc, debit: amount, credit: 0 },
    { id: ref + 'k', date, ref, desc, account: kAcc, debit: 0, credit: amount }
  ]);

  e.target.reset();
  document.getElementById('mjDate').value = getTodayISO();
  showToast('Jurnal manual berhasil ditambahkan!');
  renderAll();
}

// ==========================================
// RENDER 7: NERACA SALDO
// ==========================================
function renderTrialBalance() {
  let totalD = 0;
  let totalK = 0;

  const rows = Object.entries(COA).map(([code, info]) => {
    const bal = getAccountBalance(code);
    if (bal === 0) return '';

    let colD = 0;
    let colK = 0;
    if (info.normal === 'D') {
      if (bal >= 0) colD = bal; else colK = Math.abs(bal);
    } else {
      if (bal >= 0) colK = bal; else colD = Math.abs(bal);
    }

    totalD += colD;
    totalK += colK;

    return `
      <tr>
        <td><strong>${code}</strong></td>
        <td>${info.name}</td>
        <td><span class="badge badge-cat">${info.type}</span></td>
        <td class="text-right">${colD ? formatRp(colD) : '-'}</td>
        <td class="text-right">${colK ? formatRp(colK) : '-'}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('trialBalanceBody').innerHTML = rows;
  document.getElementById('tbTotalDebit').textContent = formatRp(totalD);
  document.getElementById('tbTotalCredit').textContent = formatRp(totalK);

  const banner = document.getElementById('trialBalanceBanner');
  const statusText = document.getElementById('trialBalanceStatusText');
  if (totalD === totalK) {
    banner.classList.remove('unbalanced');
    statusText.textContent = `NERACA SALDO SEIMBANG (BALANCED) — Total: ${formatRp(totalD)}`;
  } else {
    banner.classList.add('unbalanced');
    statusText.textContent = `TIDAK SEIMBANG! Selisih: ${formatRp(Math.abs(totalD - totalK))}`;
  }
}

// ==========================================
// RENDER ALL & INITIALIZATION
// ==========================================
function renderAll() {
  renderDashboard();
  renderPOS();
  renderPettyCash();
  renderCatalog();
  renderOpname();
  renderJournals();
  renderTrialBalance();
}

document.addEventListener('DOMContentLoaded', () => {
  // Tanggal hari ini
  const now = new Date();
  document.getElementById('todayDate').textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
  });
  document.getElementById('pcDate').value = getTodayISO();
  document.getElementById('mjDate').value = getTodayISO();

  // Status Supabase
  if (supabaseClient) {
    document.getElementById('dbStatusText').textContent = 'Supabase Terhubung';
  }

  populateAccountSelects();

  // Event Listeners Navigasi
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchRoom(btn.dataset.room));
  });

  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // POS Listeners
  document.getElementById('posSearch').addEventListener('input', renderPOS);
  document.getElementById('posCategoryFilter').addEventListener('change', renderPOS);
  document.getElementById('btnClearCart').addEventListener('click', () => {
    cart = [];
    renderCart();
  });
  document.getElementById('btnCheckout').addEventListener('click', processCheckout);

  // Petty Cash Listeners
  document.getElementById('pettyCashForm').addEventListener('submit', handlePettyCashSubmit);
  document.getElementById('btnReplenish').addEventListener('click', replenishPettyCash);

  // Katalog Listeners
  document.getElementById('productForm').addEventListener('submit', handleAddProduct);

  // Cash Opname Listeners
  document.getElementById('opnameTarget').addEventListener('change', calculateOpnameDiff);
  document.getElementById('btnPostOpname').addEventListener('click', postOpnameAdjustment);
  document.getElementById('btnResetOpname').addEventListener('click', () => {
    DENOMINATIONS.forEach(d => (opnameCounts[d] = 0));
    renderOpname();
  });

  // Jurnal Listeners
  document.getElementById('manualJournalForm').addEventListener('submit', handleManualJournal);
  document.getElementById('journalSearch').addEventListener('input', renderJournals);

  // Reset Demo Data
  document.getElementById('btnResetDemo').addEventListener('click', () => {
    if (!confirm('Reset seluruh data transaksi ke kondisi awal demo?')) return;
    state = getDefaultState();
    cart = [];
    saveState();
    showToast('Data berhasil direset ke kondisi awal.');
    renderAll();
  });

  renderAll();
});
