// ============================================================================
// 1. KONFIGURASI SUPABASE (GANTI DENGAN URL & ANON KEY PROYEK KAMU)
// ============================================================================
const SUPABASE_URL = 'https://supabase.com/dashboard/project/rlrrecrhlvclnqsaxnrf/settings/api-keys/legacy';
const SUPABASE_KEY = 'sb_publishable_8fCAlOwIoWsdKMjJ_f_Mng_4s_o8HOx';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PLAFON_PETTY_CASH = 1000000;
let daftarProduk = [];
let keranjang = [];
let saldoSistemKasBesar = 0;

const formatRp = (angka) => 'Rp ' + Number(angka).toLocaleString('id-ID');

// ============================================================================
// 2. NAVIGASI ANTAR ROOM DASHBOARD
// ============================================================================
function bukaRoom(roomId, btnElement) {
    document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(roomId).classList.add('active');
    btnElement.classList.add('active');
    muatSemuaData();
}

async function muatSemuaData() {
    await muatProduk();
    await muatPettyCash();
    await muatLaporanAkuntansi();
}

// ============================================================================
// 3. ROOM 2: KASIR POS & AUTO-JURNAL PENJUALAN (METODE PERPETUAL)
// ============================================================================
async function muatProduk() {
    const { data, error } = await db.from('produk').select('*').order('id');
    if (error) return console.error('Gagal muat produk:', error);
    daftarProduk = data;

    document.getElementById('daftar-produk').innerHTML = data.map(p => `
        <div class="produk-item" onclick="tambahKeKeranjang(${p.id})">
            <span class="kat">${p.kategori}</span>
            <h4>${p.nama_produk}</h4>
            <p><strong>${formatRp(p.harga_jual)}</strong></p>
            <small>Stok: ${p.stok}</small>
        </div>
    `).join('');
}

function tambahKeKeranjang(idProduk) {
    const prod = daftarProduk.find(p => p.id === idProduk);
    if (!prod || prod.stok <= 0) return alert('Stok produk habis!');

    const itemAda = keranjang.find(k => k.id === idProduk);
    if (itemAda) {
        if (itemAda.qty >= prod.stok) return alert('Jumlah melebihi stok tersedia!');
        itemAda.qty += 1;
    } else {
        keranjang.push({ ...prod, qty: 1 });
    }
    renderKeranjang();
}

function hapusDariKeranjang(index) {
    keranjang.splice(index, 1);
    renderKeranjang();
}

function renderKeranjang() {
    let total = 0;
    document.getElementById('keranjang-body').innerHTML = keranjang.map((item, idx) => {
        const sub = item.harga_jual * item.qty;
        total += sub;
        return `
            <tr>
                <td>${item.nama_produk}</td>
                <td>${item.qty}</td>
                <td>${formatRp(sub)}</td>
                <td><button onclick="hapusDariKeranjang(${idx})">❌</button></td>
            </tr>
        `;
    }).join('');
    document.getElementById('kasir-total').innerText = formatRp(total);
}

async function prosesTransaksiKasir() {
    if (keranjang.length === 0) return alert('Keranjang belanja masih kosong!');

    const akunKas = document.getElementById('metode-bayar').value; // '1-1101' atau '1-1103'
    const noRef = 'POS-' + Date.now().toString().slice(-6);
    
    let totalJual = 0;
    let pendPetShop = 0, pendGrooming = 0, pendCafe = 0;
    let hppPetShop = 0, hppCafe = 0;

    for (const item of keranjang) {
        const subJual = item.harga_jual * item.qty;
        const subHpp = item.harga_beli * item.qty;
        totalJual += subJual;

        if (item.kategori === 'Pet Shop') {
            pendPetShop += subJual;
            hppPetShop += subHpp;
        } else if (item.kategori === 'Cafe') {
            pendCafe += subJual;
            hppCafe += subHpp;
        } else {
            pendGrooming += subJual;
        }

        // Update stok otomatis (Metode Perpetual)
        await db.from('produk').update({ stok: item.stok - item.qty }).eq('id', item.id);
    }

    // Susun Jurnal Umum Standar SAK EMKM
    const entriJurnal = [
        { no_referensi: noRef, kode_akun: akunKas, keterangan: `Penerimaan Penjualan Kasir (${noRef})`, debit: totalJual, kredit: 0 }
    ];

    if (pendPetShop > 0) entriJurnal.push({ no_referensi: noRef, kode_akun: '4-1101', keterangan: 'Pendapatan Penjualan Pet Shop', debit: 0, kredit: pendPetShop });
    if (pendGrooming > 0) entriJurnal.push({ no_referensi: noRef, kode_akun: '4-1102', keterangan: 'Pendapatan Jasa Grooming', debit: 0, kredit: pendGrooming });
    if (pendCafe > 0) entriJurnal.push({ no_referensi: noRef, kode_akun: '4-1103', keterangan: 'Pendapatan Penjualan Cafe', debit: 0, kredit: pendCafe });

    // Jurnal HPP & Pengurangan Persediaan per Divisi
    if (hppPetShop > 0) {
        entriJurnal.push({ no_referensi: noRef, kode_akun: '5-1101', keterangan: `Beban Pokok Penjualan Pet Shop (${noRef})`, debit: hppPetShop, kredit: 0 });
        entriJurnal.push({ no_referensi: noRef, kode_akun: '1-1301', keterangan: `Pengurangan Persediaan Pet Shop (${noRef})`, debit: 0, kredit: hppPetShop });
    }
    if (hppCafe > 0) {
        entriJurnal.push({ no_referensi: noRef, kode_akun: '5-1102', keterangan: `Beban Pokok Penjualan Cafe (${noRef})`, debit: hppCafe, kredit: 0 });
        entriJurnal.push({ no_referensi: noRef, kode_akun: '1-1302', keterangan: `Pengurangan Persediaan Bahan Cafe (${noRef})`, debit: 0, kredit: hppCafe });
    }

    const { error } = await db.from('jurnal_umum').insert(entriJurnal);
    if (error) return alert('Gagal menyimpan jurnal: ' + error.message);

    alert(`Transaksi ${noRef} berhasil & otomatis tercatat di Jurnal Umum!`);
    keranjang = [];
    renderKeranjang();
    muatSemuaData();
}

// ============================================================================
// 4. ROOM 3: PETTY CASH (METODE IMPREST / DANA TETAP)
// ============================================================================
async function muatPettyCash() {
    const { data, error } = await db.from('petty_cash').select('*').order('id', { ascending: false });
    if (error) return console.error(error);

    let totalPending = 0;
    document.getElementById('tabel-petty-body').innerHTML = data.map(pc => {
        if (pc.status === 'pending') totalPending += Number(pc.nominal);
        return `
            <tr>
                <td>${pc.no_bukti}</td>
                <td><strong>${pc.kode_akun}</strong></td>
                <td>${pc.keterangan}</td>
                <td>${formatRp(pc.nominal)}</td>
                <td><strong>${pc.status.toUpperCase()}</strong></td>
            </tr>
        `;
    }).join('');

    const sisaFisik = PLAFON_PETTY_CASH - totalPending;
    document.getElementById('petty-pending-total').innerText = formatRp(totalPending);
    document.getElementById('petty-fisik-sisa').innerText = formatRp(sisaFisik);
    document.getElementById('stat-petty-sisa').innerText = formatRp(sisaFisik);

    const alertBox = document.getElementById('alert-box');
    if (sisaFisik < 250000) {
        alertBox.innerHTML = `⚠️ <strong>PERINGATAN PENGENDALIAN KAS:</strong> Sisa fisik Petty Cash menipis (${formatRp(sisaFisik)}). Segera lakukan <em>Replenishment</em> di Room 3!`;
        alertBox.style.background = '#ffebee';
        alertBox.style.borderColor = '#c62828';
    } else {
        alertBox.innerHTML = `✅ <strong>SISTEM TERKENDALI:</strong> Dana Petty Cash aman (${formatRp(sisaFisik)}) dan seluruh akun Neraca Saldo seimbang (Balance).`;
        alertBox.style.background = '#e8f5e9';
        alertBox.style.borderColor = '#2e7d32';
    }
}

async function tambahPettyCash(e) {
    e.preventDefault();
    const no_bukti = document.getElementById('pc-bukti').value;
    const kode_akun = document.getElementById('pc-akun').value;
    const keterangan = document.getElementById('pc-ket').value;
    const nominal = Number(document.getElementById('pc-nominal').value);

    const { error } = await db.from('petty_cash').insert([{ no_bukti, kode_akun, keterangan, nominal, status: 'pending' }]);
    if (error) return alert('Error simpan voucher: ' + error.message);

    alert('Voucher Petty Cash tersimpan! (Metode Imprest: beban dijurnal saat proses Replenishment).');
    document.getElementById('form-petty').reset();
    muatSemuaData();
}

async function prosesReplenish() {
    const { data: pendingList } = await db.from('petty_cash').select('*').eq('status', 'pending');
    if (!pendingList || pendingList.length === 0) return alert('Tidak ada voucher pending untuk di-replenish.');

    const noRef = 'REP-' + Date.now().toString().slice(-6);
    let totalReimburse = 0;
    const jurnalBaru = [];

    pendingList.forEach(item => {
        totalReimburse += Number(item.nominal);
        jurnalBaru.push({
            no_referensi: noRef,
            kode_akun: item.kode_akun,
            keterangan: `Replenish PC (${item.no_bukti}: ${item.keterangan})`,
            debit: Number(item.nominal),
            kredit: 0
        });
    });

    // Pengisian kembali dari Rekening Bank (1-1103) agar Kas Kecil (1-1102) tetap Rp 1.000.000
    jurnalBaru.push({
        no_referensi: noRef,
        kode_akun: '1-1103',
        keterangan: `Pengisian Kembali Dana Tetap Petty Cash (${noRef})`,
        debit: 0,
        kredit: totalReimburse
    });

    const { error } = await db.from('jurnal_umum').insert(jurnalBaru);
    if (error) return alert('Gagal replenish: ' + error.message);

    await db.from('petty_cash').update({ status: 'replenished' }).eq('status', 'pending');
    alert(`Replenishment Rp ${totalReimburse.toLocaleString('id-ID')} selesai! Beban telah masuk Jurnal Umum.`);
    muatSemuaData();
}

// ============================================================================
