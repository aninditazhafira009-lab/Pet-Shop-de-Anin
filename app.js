// ==========================================
// KONFIGURASI SUPABASE - PET SHOP DE ANIN
// ==========================================
const SUPABASE_URL = 'https://aninditazhafira009-lab.github.io/Pet-Shop-de-Anin/?';
const SUPABASE_ANON_KEY = 'sb_publishable_8fCAlOwIoWsdKMjJ_f_Mng_4s_o8HOx';

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
// KONFIGURASI PIN VERIFIKASI ADMIN
// ==========================================
const ADMIN_PIN = '123456';
const AUTH_SESSION_KEY = 'petshop_de_anin_auth';

// ==========================================
// CHART OF ACCOUNTS (COA) STANDAR AKUNTANSI
// ==========================================
const COA = {
  // 100 - ASET
  '111': { name: 'Kas Besar', type: 'Aset', normal: 'D' },
  '112': { name: 'Kas Kecil (Petty Cash Imprest)', type: 'Aset', normal: 'D' },
  '113': { name: 'Bank / Rekening Giro', type: 'Aset', normal: 'D' },
  '114': { name: 'Piutang Usaha', type: 'Aset', normal: 'D' },
  '115': { name: 'Perlengkapan Toko (Supplies)', type: 'Aset', normal: 'D' },
  '116': { name: 'Beban Dibayar di Muka', type: 'Aset', normal: 'D' },
  '121': { name: 'Peralatan Toko', type: 'Aset', normal: 'D' },
  '122': { name: 'Akumulasi Penyusutan Peralatan', type: 'Aset (Kontra)', normal: 'K' },

  // 200 - LIABILITAS
  '211': { name: 'Utang Usaha', type: 'Liabilitas', normal: 'K' },
  '212': { name: 'Utang Beban (Accrued Expense)', type: 'Liabilitas', normal: 'K' },
  '213': { name: 'Pendapatan Diterima di Muka', type: 'Liabilitas', normal: 'K' },

  // 300 - EKUITAS
  '311': { name: 'Modal Pemilik', type: 'Ekuitas', normal: 'K' },
  '312': { name: 'Prive Pemilik', type: 'Ekuitas (Kontra)', normal: 'D' },

  // 400 - PENDAPATAN
  '411': { name: 'Pendapatan Penjualan Pet Shop', type: 'Pendapatan', normal: 'K' },
  '412': { name: 'Pendapatan Jasa Grooming & Penitipan', type: 'Pendapatan', normal: 'K' },
  '413': { name: 'Retur & Potongan Penjualan', type: 'Pendapatan (Kontra)', normal: 'D' },
  '414': { name: 'Pendapatan Selisih Kas (Cash Over)', type: 'Pendapatan Lain', normal: 'K' },

  // 500 - BEBAN OPERASIONAL
  '511': { name: 'Beban Gaji & Komisi', type: 'Beban', normal: 'D' },
  '512': { name: 'Beban Perlengkapan Toko', type: 'Beban', normal: 'D' },
  '513': { name: 'Beban Listrik, Air & Internet', type: 'Beban', normal: 'D' },
  '514': { name: 'Beban Sewa Tempat', type: 'Beban', normal: 'D' },
  '515': { name: 'Beban Kebersihan & Perawatan Hewan', type: 'Beban', normal: 'D' },
  '516': { name: 'Beban Transportasi & Pengiriman', type: 'Beban', normal: 'D' },
  '517': { name: 'Beban Penyusutan Peralatan', type: 'Beban', normal: 'D' },
  '518': { name: 'Beban Lain-lain / Operasional', type: 'Beban', normal: 'D' },
  '519': { name: 'Beban Selisih Kas (Cash Short)', type: 'Beban Lain', normal: 'D' }
};

// ==========================================
// DAFTAR ITEM KHUSUS PET SHOP (TANPA CAFE)
// ==========================================
const PET_ITEMS = [
  { id: 'PS1', name: 'Dry Food Kucing 1kg', category: 'Pet Food', price: 65000, emoji: '🐱', revenueAcc: '411' },
  { id: 'PS2', name: 'Dry Food Anjing 1kg', category: 'Pet Food', price: 78000, emoji: '🐶', revenueAcc: '411' },
  { id: 'PS3', name: 'Timothy Hay Marmut 500g', category: 'Pet Food', price: 55000, emoji: '🐹', revenueAcc: '411' },
  { id: 'PS4', name: 'Pelet Kelinci & Guinea Pig', category: 'Pet Food', price: 38000, emoji: '🐰', revenueAcc: '411' },
  { id: 'PS5', name: 'Pasir Kucing Tofu Wangi 7L', category: 'Perawatan', price: 62000, emoji: '🧼', revenueAcc: '411' },
  { id: 'PS6', name: 'Vitamin Bulu & Imun Hewan', category: 'Perawatan', price: 45000, emoji: '💊', revenueAcc: '411' },
  { id: 'PS7', name: 'Kalung Lonceng Pastel', category: 'Aksesoris', price: 28000, emoji: '🎀', revenueAcc: '411' },
  { id: 'PS8', name: 'Mainan Bola & Teaser Kucing', category: 'Aksesoris', price: 32000, emoji: '🧶', revenueAcc: '411' },
  { id: 'PS9', name: 'Jasa Grooming Mandi Sehat', category: 'Perawatan', price: 75000, emoji: '🛁', revenueAcc: '412' },
  { id: 'PS10', name: 'Jasa Potong Kuku & Ear Clean', category: 'Perawatan', price: 30000, emoji: '✂️', revenueAcc: '412' }
];

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];
const STORAGE_KEY = 'petshop_de_anin_v3';

const ROOM_META = {
  ringkasan: ['Ringkasan Penjualan & Kas', 'Pantauan arus kas penjualan & dana kas kecil Pet Shop De Anin'],
  pos: ['POS Kasir Penjualan', 'Transaksi penjualan produk & jasa hewan peliharaan + struk cetak'],
  pettycash: ['Petty Cash Imprest', 'Pengelolaan dana kas kecil sistem dana tetap'],
  opname: ['Cash Opname', 'Perhitungan fisik uang tunai & penyesuaian selisih kas'],
  jurnal: ['Jurnal Umum', 'Catatan kronologis transaksi otomatis & manual + Ekspor Excel/PDF'],
  neraca: ['Neraca Saldo', 'Rekapitulasi saldo akhir seluruh akun + Ekspor Excel/PDF']
};

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function getInitialJournals() {
  const today = getTodayISO();
  return [
    { id: 'INIT1', date: today, ref: 'INIT-01', desc: 'Saldo Awal Kas Besar & Pembentukan Kas Kecil', account: '111', debit: 15000000, credit: 0 },
    { id: 'INIT2', date: today, ref: 'INIT-01', desc: 'Saldo Awal Kas Besar & Pembentukan Kas Kecil', account: '112', debit: 1500000, credit: 0 },
    { id: 'INIT3', date: today, ref: 'INIT-01', desc: 'Saldo Awal Kas Besar & Pembentukan Kas Kecil', account: '113', debit: 5000000, credit: 0 },
    { id: 'INIT4', date: today, ref: 'INIT-01', desc: 'Saldo Awal Kas Besar & Pembentukan Kas Kecil', account: '311', debit: 0, credit: 21500000 }
  ];
}

function getDefaultState() {
  return {
    imprestLimit: 1500000,
    posTxCount: 0,
    vouchers: [],
    journals: getInitialJournals()
  };
}

let state = loadState();
let cart = [];
let lastReceiptHTML = '';
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

async function syncSupabase(table, payload, mode = 'insert') {
  if (!supabaseClient) return;
  try {
    if (mode === 'insert') {
      await supabaseClient.from(table).insert(payload);
    } else if (mode === 'clear_vouchers') {
      await supabaseClient.from('vouchers').delete().neq('id', '');
    }
  } catch (err) {
    console.warn(`Supabase (${table}) skipped:`, err.message);
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
  syncSupabase('journals', entries, 'insert');
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
// VERIFIKASI AWAL ADMIN (AUTH GATE)
// ==========================================
function checkAuth() {
  const isLogged = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (isLogged) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
  } else {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('appShell').classList.add('hidden');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const identity = document.getElementById('authIdentity').value.trim();
  const pin = document.getElementById('authPin').value.trim();
  const errEl = document.getElementById('authError');

  if (!identity || identity.length < 4) {
    errEl.textContent = 'Masukkan Email atau No. Telepon Admin yang valid.';
    return;
  }
  if (pin !== ADMIN_PIN) {
    errEl.textContent = 'PIN Verifikasi salah! Gunakan PIN demo: 123456';
    return;
  }

  errEl.textContent = '';
  sessionStorage.setItem(AUTH_SESSION_KEY, identity);
  checkAuth();
  showToast('Verifikasi berhasil! Selamat datang di Pet Shop De Anin.');
}

function handleLogout() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  document.getElementById('authPin').value = '';
  checkAuth();
  showToast('Sesi Admin dikunci.');
}

// ==========================================
// NAVIGASI 6 ROOM
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
// ROOM 1: RINGKASAN PENJUALAN & KAS
// ==========================================
function renderRingkasan() {
  const salesGoods = getAccountBalance('411');
  const salesServices = getAccountBalance('412');
  const totalSales = salesGoods + salesServices;
  const mainCash = getAccountBalance('111');
  const bankCash = getAccountBalance('113');
  const voucherSum = state.vouchers.reduce((s, v) => s + v.amount, 0);
  const pettyPhysical = state.imprestLimit - voucherSum;

  document.getElementById('kpiSales').textContent = formatRp(totalSales);
  document.getElementById('kpiTxCount').textContent = `${state.posTxCount} Transaksi`;
  document.getElementById('kpiMainCash').textContent = formatRp(mainCash);
  document.getElementById('kpiPettyCash').textContent = formatRp(pettyPhysical);

  const recent = [...state.journals].slice(-6).reverse();
  document.getElementById('dashRecentJournals').innerHTML = recent.map(j => `
    <tr>
      <td>${j.date}</td>
      <td>${j.desc}</td>
      <td><strong>${j.account}</strong> - ${COA[j.account]?.name || ''}</td>
      <td class="text-right">${j.debit ? formatRp(j.debit) : '-'}</td>
      <td class="text-right">${j.credit ? formatRp(j.credit) : '-'}</td>
    </tr>
  `).join('');

  document.getElementById('dashPettySummary').innerHTML = `
    <div class="mini-item">
      <span>Plafon Dana Tetap</span>
      <strong>${formatRp(state.imprestLimit)}</strong>
    </div>
    <div class="mini-item">
      <span>Voucher Aktif (${state.vouchers.length} bukti)</span>
      <strong style="color:#d64571">${formatRp(voucherSum)}</strong>
    </div>
    <div class="mini-item">
      <span>Sisa Fisik Kas Kecil</span>
      <strong style="color:#157a55">${formatRp(pettyPhysical)}</strong>
    </div>
    <div class="mini-item">
      <span>Saldo Bank / QRIS (113)</span>
      <strong>${formatRp(bankCash)}</strong>
    </div>
  `;
}

// ==========================================
// ROOM 2: POS KASIR PENJUALAN
// ==========================================
function renderPOS() {
  const keyword = document.getElementById('posSearch').value.toLowerCase();
  const cat = document.getElementById('posCategoryFilter').value;

  const filtered = PET_ITEMS.filter(p =>
    p.name.toLowerCase().includes(keyword) && (cat === 'ALL' || p.category === cat)
  );

  document.getElementById('posProductGrid').innerHTML = filtered.map(p => `
    <div class="product-card" onclick="addToCart('${p.id}')">
      <div class="product-emoji">${p.emoji}</div>
      <div class="product-title">${p.name}</div>
      <div class="product-price">${formatRp(p.price)}</div>
      <div class="product-cat-label">${p.category}</div>
    </div>
  `).join('') || '<p class="empty-state">Item tidak ditemukan.</p>';

  renderCart();
}

function addToCart(itemId) {
  const item = PET_ITEMS.find(p => p.id === itemId);
  if (!item) return;
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  renderCart();
}

function updateCartQty(itemId, delta) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  }
  renderCart();
}

function renderCart() {
  const box = document.getElementById('cartItems');
  if (cart.length === 0) {
    box.innerHTML = '<p class="empty-state">Belum ada item di keranjang.</p>';
    document.getElementById('cartTotalPrice').textContent = 'Rp 0';
    return;
  }

  let totalPrice = 0;
  box.innerHTML = cart.map(item => {
    totalPrice += item.price * item.qty;
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
}

function processCheckout() {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }

  const method = document.getElementById('posPaymentMethod').value;
  const cashAcc = method === 'Tunai' ? '111' : '113';
  const customer = document.getElementById('posCustomerName').value.trim() || 'Pelanggan Umum';
  const today = getTodayISO();
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const ref = 'POS-' + Date.now().toString().slice(-5);

  let totalSales = 0;
  const revGrouped = {};
  const purchasedItems = [...cart];

  cart.forEach(item => {
    const sub = item.price * item.qty;
    totalSales += sub;
    revGrouped[item.revenueAcc] = (revGrouped[item.revenueAcc] || 0) + sub;
  });

  const entries = [
    { id: ref + '-dr', date: today, ref, desc: `Penjualan POS (${method}) - ${customer}`, account: cashAcc, debit: totalSales, credit: 0 }
  ];

  Object.entries(revGrouped).forEach(([acc, amt], idx) => {
    entries.push({
      id: `${ref}-cr${idx}`,
      date: today,
      ref,
      desc: `Penjualan POS (${method}) - ${customer}`,
      account: acc,
      debit: 0,
      credit: amt
    });
  });

  state.posTxCount += 1;
  addJournalEntries(entries);

  const itemsHTML = purchasedItems.map(i => `
    <div class="receipt-line">
      <span>${i.name} (${i.qty}x)</span>
      <span>${formatRp(i.price * i.qty)}</span>
    </div>
  `).join('');

  lastReceiptHTML = `
    <div class="receipt-center">
      <strong>🐾 PET SHOP DE ANIN 🐾</strong><br/>
      Semarang, Jawa Tengah<br/>
      <small>No: ${ref} | ${today} ${timeStr}</small>
    </div>
    <div class="receipt-divider"></div>
    <div>Pelanggan: ${customer}</div>
    <div>Bayar    : ${method}</div>
    <div class="receipt-divider"></div>
    ${itemsHTML}
    <div class="receipt-divider"></div>
    <div class="receipt-line">
      <strong>TOTAL BAYAR</strong>
      <strong>${formatRp(totalSales)}</strong>
    </div>
    <div class="receipt-divider"></div>
    <div class="receipt-center">
      Terima kasih telah berbelanja!<br/>
      Salam sayang untuk anabul 🐾
    </div>
  `;

  document.getElementById('receiptContent').innerHTML = lastReceiptHTML;
  document.getElementById('receiptModal').classList.add('open');

  cart = [];
  document.getElementById('posCustomerName').value = '';
  showToast(`Transaksi ${ref} berhasil dicatat!`);
  renderAll();
}

function printReceipt() {
  document.getElementById('printArea').innerHTML = `<div class="print-receipt-wrap">${lastReceiptHTML}</div>`;
  window.print();
}

// ==========================================
// ROOM 3: PETTY CASH IMPREST
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

  const voucher = { id: 'VC-' + Date.now(), date, account, desc, amount };
  state.vouchers.push(voucher);
  saveState();
  syncSupabase('vouchers', voucher, 'insert');

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
  syncSupabase('vouchers', null, 'clear_vouchers');
  addJournalEntries(entries);
  showToast(`Kas Kecil diisi kembali sebesar ${formatRp(total)}!`);
  renderAll();
}

// ==========================================
// ROOM 4: CASH OPNAME
// ==========================================
function renderOpname() {
  document.getElementById('opnameDenomBody').innerHTML = DENOMINATIONS.map(d => {
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
    addJournalEntries([
      { id: ref + 'd', date: today, ref, desc: 'Penyesuaian Cash Opname (Lebih)', account: target, debit: absDiff, credit: 0 },
      { id: ref + 'k', date: today, ref, desc: 'Penyesuaian Cash Opname (Lebih)', account: '414', debit: 0, credit: absDiff }
    ]);
  } else {
    addJournalEntries([
      { id: ref + 'd', date: today, ref, desc: 'Penyesuaian Cash Opname (Kurang)', account: '519', debit: absDiff, credit: 0 },
      { id: ref + 'k', date: today, ref, desc: 'Penyesuaian Cash Opname (Kurang)', account: target, debit: 0, credit: absDiff }
    ]);
  }

  showToast(`Jurnal penyesuaian selisih kas (${formatRp(diff)}) berhasil diposting!`);
  renderAll();
}

// ==========================================
// ROOM 5: JURNAL UMUM + EKSPOR
// ==========================================
function populateAccountSelects() {
  const opts = Object.entries(COA).map(([code, info]) =>
    `<option value="${code}">${code} - ${info.name}</option>`
  ).join('');
  document.getElementById('mjDebitAcc').innerHTML = `<option value="">-- Pilih Akun Debit --</option>` + opts;
  document.getElementById('mjCreditAcc').innerHTML = `<option value="">-- Pilih Akun Kredit --</option>` + opts;
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

  document.getElementById('journalTableBody').innerHTML = filtered.map(j => {
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

function exportJournalExcel() {
  const rows = state.journals.map(j => ({
    Tanggal: j.date,
    Ref: j.ref,
    Keterangan: j.desc,
    Kode_Akun: j.account,
    Nama_Akun: COA[j.account]?.name || '',
    Debit: Number(j.debit) || 0,
    Kredit: Number(j.credit) || 0
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Umum');
  XLSX.writeFile(wb, `Jurnal_Umum_Pet_Shop_De_Anin_${getTodayISO()}.xlsx`);
  showToast('File Excel Jurnal Umum berhasil diunduh!');
}

function exportJournalPDF() {
  let sumD = 0, sumK = 0;
  const rows = state.journals.map(j => {
    sumD += Number(j.debit) || 0;
    sumK += Number(j.credit) || 0;
    return `
      <tr>
        <td>${j.date}</td>
        <td>${j.ref}</td>
        <td>${j.desc}</td>
        <td>${j.account} - ${COA[j.account]?.name || ''}</td>
        <td style="text-align:right">${j.debit ? formatRp(j.debit) : '-'}</td>
        <td style="text-align:right">${j.credit ? formatRp(j.credit) : '-'}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('printArea').innerHTML = `
    <h2>PET SHOP DE ANIN — JURNAL UMUM</h2>
    <p>Tanggal Cetak: ${getTodayISO()}</p>
    <table class="print-report-table">
      <thead>
        <tr><th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Akun</th><th>Debit</th><th>Kredit</th></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <th colspan="4">TOTAL</th>
          <th style="text-align:right">${formatRp(sumD)}</th>
          <th style="text-align:right">${formatRp(sumK)}</th>
        </tr>
      </tfoot>
    </table>
  `;
  window.print();
}

// ==========================================
// ROOM 6: NERACA SALDO + EKSPOR
// ==========================================
function getTrialBalanceData() {
  const data = [];
  Object.entries(COA).forEach(([code, info]) => {
    const bal = getAccountBalance(code);
    if (bal === 0) return;

    let debit = 0;
    let credit = 0;
    if (info.normal === 'D') {
      if (bal >= 0) debit = bal; else credit = Math.abs(bal);
    } else {
      if (bal >= 0) credit = bal; else debit = Math.abs(bal);
    }
    data.push({ code, name: info.name, type: info.type, debit, credit });
  });
  return data;
}

function renderTrialBalance() {
  const data = getTrialBalanceData();
  let totalD = 0;
  let totalK = 0;

  document.getElementById('trialBalanceBody').innerHTML = data.map(row => {
    totalD += row.debit;
    totalK += row.credit;
    return `
      <tr>
        <td><strong>${row.code}</strong></td>
        <td>${row.name}</td>
        <td><span class="badge badge-cat">${row.type}</span></td>
        <td class="text-right">${row.debit ? formatRp(row.debit) : '-'}</td>
        <td class="text-right">${row.credit ? formatRp(row.credit) : '-'}</td>
      </tr>
    `;
  }).join('');

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

function exportTBExcel() {
  const data = getTrialBalanceData();
  const rows = data.map(r => ({
    Kode_Akun: r.code,
    Nama_Akun: r.name,
    Kategori: r.type,
    Saldo_Debit: r.debit,
    Saldo_Kredit: r.credit
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Neraca Saldo');
  XLSX.writeFile(wb, `Neraca_Saldo_Pet_Shop_De_Anin_${getTodayISO()}.xlsx`);
  showToast('File Excel Neraca Saldo berhasil diunduh!');
}

function exportTBPDF() {
  const data = getTrialBalanceData();
  let totalD = 0, totalK = 0;
  const rows = data.map(r => {
    totalD += r.debit;
    totalK += r.credit;
    return `
      <tr>
        <td>${r.code}</td>
        <td>${r.name}</td>
        <td>${r.type}</td>
        <td style="text-align:right">${r.debit ? formatRp(r.debit) : '-'}</td>
        <td style="text-align:right">${r.credit ? formatRp(r.credit) : '-'}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('printArea').innerHTML = `
    <h2>PET SHOP DE ANIN — NERACA SALDO</h2>
    <p>Per Tanggal: ${getTodayISO()}</p>
    <table class="print-report-table">
      <thead>
        <tr><th>Kode</th><th>Nama Akun</th><th>Kategori</th><th>Saldo Debit</th><th>Saldo Kredit</th></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <th colspan="3">TOTAL</th>
          <th style="text-align:right">${formatRp(totalD)}</th>
          <th style="text-align:right">${formatRp(totalK)}</th>
        </tr>
      </tfoot>
    </table>
  `;
  window.print();
}

// ==========================================
// FUNGSI RESET PER DASHBOARD / ROOM
// ==========================================
function resetAllData() {
  if (!confirm('Reset seluruh data aplikasi ke kondisi awal?')) return;
  state = getDefaultState();
  cart = [];
  DENOMINATIONS.forEach(d => (opnameCounts[d] = 0));
  saveState();
  showToast('Seluruh data aplikasi berhasil direset!');
  renderAll();
}

function resetPOSData() {
  if (!confirm('Reset keranjang & seluruh riwayat transaksi POS?')) return;
  cart = [];
  state.posTxCount = 0;
  state.journals = state.journals.filter(j => !j.ref.startsWith('POS-'));
  saveState();
  showToast('Data penjualan POS berhasil direset!');
  renderAll();
}

function resetPettyCashData() {
  if (!confirm('Reset semua voucher kas kecil yang aktif?')) return;
  state.vouchers = [];
  saveState();
  syncSupabase('vouchers', null, 'clear_vouchers');
  showToast('Voucher Kas Kecil berhasil direset!');
  renderAll();
}

function resetOpnameData() {
  DENOMINATIONS.forEach(d => (opnameCounts[d] = 0));
  renderOpname();
  showToast('Hitungan pecahan Cash Opname berhasil direset!');
}

function resetJournalData() {
  if (!confirm('Reset Jurnal Umum & Neraca Saldo kembali ke saldo awal?')) return;
  state.journals = getInitialJournals();
  state.posTxCount = 0;
  saveState();
  showToast('Jurnal Umum & Neraca Saldo berhasil direset ke saldo awal!');
  renderAll();
}

// ==========================================
// RENDER ALL & INITIALIZATION
// ==========================================
function renderAll() {
  renderRingkasan();
  renderPOS();
  renderPettyCash();
  renderOpname();
  renderJournals();
  renderTrialBalance();
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  const now = new Date();
  document.getElementById('todayDate').textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
  });
  document.getElementById('pcDate').value = getTodayISO();
  document.getElementById('mjDate').value = getTodayISO();

  if (supabaseClient) {
    document.getElementById('dbStatusText').textContent = 'Supabase Terhubung';
  }

  populateAccountSelects();

  // Auth Listeners
  document.getElementById('authForm').addEventListener('submit', handleLogin);
  document.getElementById('btnLogout').addEventListener('click', handleLogout);

  // Navigasi
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchRoom(btn.dataset.room));
  });
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // POS & Modal Struk
  document.getElementById('posSearch').addEventListener('input', renderPOS);
  document.getElementById('posCategoryFilter').addEventListener('change', renderPOS);
  document.getElementById('btnClearCart').addEventListener('click', () => { cart = []; renderCart(); });
  document.getElementById('btnCheckout').addEventListener('click', processCheckout);
  document.getElementById('btnPrintReceipt').addEventListener('click', printReceipt);
  document.getElementById('btnCloseReceipt').addEventListener('click', () => {
    document.getElementById('receiptModal').classList.remove('open');
  });

  // Petty Cash
  document.getElementById('pettyCashForm').addEventListener('submit', handlePettyCashSubmit);
  document.getElementById('btnReplenish').addEventListener('click', replenishPettyCash);

  // Cash Opname
  document.getElementById('opnameTarget').addEventListener('change', calculateOpnameDiff);
  document.getElementById('btnPostOpname').addEventListener('click', postOpnameAdjustment);

  // Jurnal & Ekspor
  document.getElementById('manualJournalForm').addEventListener('submit', handleManualJournal);
  document.getElementById('journalSearch').addEventListener('input', renderJournals);
  document.getElementById('btnExportJournalExcel').addEventListener('click', exportJournalExcel);
  document.getElementById('btnExportJournalPDF').addEventListener('click', exportJournalPDF);

  // Neraca Saldo Ekspor
  document.getElementById('btnExportTBExcel').addEventListener('click', exportTBExcel);
  document.getElementById('btnExportTBPDF').addEventListener('click', exportTBPDF);

  // Reset per Room
  document.getElementById('btnResetAll').addEventListener('click', resetAllData);
  document.getElementById('btnResetPOS').addEventListener('click', resetPOSData);
  document.getElementById('btnResetPettyCash').addEventListener('click', resetPettyCashData);
  document.getElementById('btnResetOpname').addEventListener('click', resetOpnameData);
  document.getElementById('btnResetJournal').addEventListener('click', resetJournalData);
  document.getElementById('btnResetTB').addEventListener('click', resetJournalData);

  renderAll();
});
function verifikasiMasuk() {
  const identity = document.getElementById('authIdentity').value.trim();
  const pin = document.getElementById('authPin').value.trim();
  const errEl = document.getElementById('authError');

  if (!identity || identity.length < 4) {
    errEl.textContent = 'Masukkan Email atau No. Telepon Admin yang valid.';
    return;
  }
  if (pin !== '123456') {
    errEl.textContent = 'PIN salah! Gunakan PIN demo: 123456';
    return;
  }

  errEl.textContent = '';
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appShell').classList.remove('hidden');
  document.getElementById('appShell').style.display = 'flex';
}

