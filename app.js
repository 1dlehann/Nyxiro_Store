let produk = JSON.parse(localStorage.getItem("produk")) || [
    { id: 1, nama: "Indomie Goreng", harga: 3500, stok: 30 },
    { id: 2, nama: "Aqua 600ml", harga: 4000, stok: 20 },
    { id: 3, nama: "Teh Pucuk", harga: 5000, stok: 15 },
    { id: 4, nama: "Roti Cokelat", harga: 6000, stok: 10 }
];

let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
let keranjang = [];
let nomorId = Math.max(0, ...produk.map(p => p.id)) + 1;
let modalProduk = new bootstrap.Modal(document.getElementById("modalProduk"));

const rupiah = angka => "Rp" + Number(angka).toLocaleString("id-ID");

function simpanData() {
    localStorage.setItem("produk", JSON.stringify(produk));
    localStorage.setItem("transaksi", JSON.stringify(transaksi));
}

function tanggalSekarang() {
    return new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

document.getElementById("tanggal").textContent = tanggalSekarang();

function pindahHalaman(nama) {
    document.querySelectorAll(".page-section").forEach(el => el.classList.add("d-none"));
    document.getElementById(nama).classList.remove("d-none");

    document.querySelectorAll(".sidebar .nav-link").forEach(el => {
        el.classList.toggle("active", el.dataset.page === nama);
    });

    const judul = {
        dashboard: "Dashboard",
        produk: "Manajemen Produk",
        kasir: "Kasir",
        riwayat: "Riwayat Transaksi"
    };

    document.getElementById("judulHalaman").textContent = judul[nama];

    if (nama === "dashboard") tampilkanDashboard();
    if (nama === "produk") tampilkanProduk();
    if (nama === "kasir") tampilkanKasir();
    if (nama === "riwayat") tampilkanRiwayat();
}

document.querySelectorAll(".sidebar .nav-link").forEach(link => {
    link.addEventListener("click", () => pindahHalaman(link.dataset.page));
});

function statusStok(stok) {
    if (stok === 0) return '<span class="badge-stock stock-empty">Habis</span>';
    if (stok < 5) return '<span class="badge-stock stock-low">Menipis</span>';
    return '<span class="badge-stock stock-safe">Tersedia</span>';
}

function tampilkanProduk() {
    const pencarian = document.getElementById("cariProduk").value.toLowerCase();

    document.getElementById("daftarProduk").innerHTML = produk
        .filter(p => p.nama.toLowerCase().includes(pencarian))
        .map(p => `
            <tr>
                <td class="fw-bold">${p.nama}</td>
                <td>${rupiah(p.harga)}</td>
                <td>${p.stok}</td>
                <td>${statusStok(p.stok)}</td>
                <td>
                    <button class="btn btn-sm btn-light text-primary" onclick="editProduk(${p.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger" onclick="hapusProduk(${p.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    if (!document.getElementById("daftarProduk").innerHTML) {
        document.getElementById("daftarProduk").innerHTML = `
            <tr><td colspan="5" class="text-center text-secondary py-4">Produk tidak ditemukan.</td></tr>
        `;
    }
}

function bukaModalProduk() {
    document.getElementById("formProduk").reset();
    document.getElementById("indexProduk").value = "";
    document.getElementById("judulModal").textContent = "Tambah Produk";
    modalProduk.show();
}

function editProduk(id) {
    const p = produk.find(item => item.id === id);
    if (!p) return;

    document.getElementById("indexProduk").value = p.id;
    document.getElementById("namaProduk").value = p.nama;
    document.getElementById("hargaProduk").value = p.harga;
    document.getElementById("stokProduk").value = p.stok;
    document.getElementById("judulModal").textContent = "Edit Produk";

    modalProduk.show();
}

document.getElementById("formProduk").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("indexProduk").value;
    const nama = document.getElementById("namaProduk").value.trim();
    const harga = Number(document.getElementById("hargaProduk").value);
    const stok = Number(document.getElementById("stokProduk").value);

    if (!nama || harga <= 0 || stok < 0 || !Number.isFinite(harga) || !Number.isFinite(stok)) {
        alert("Periksa kembali data produk.");
        return;
    }

    if (id) {
        const p = produk.find(item => item.id === Number(id));
        if (p) {
            p.nama = nama;
            p.harga = harga;
            p.stok = stok;
        }
    } else {
        produk.push({ id: nomorId++, nama, harga, stok });
    }

    simpanData();
    modalProduk.hide();
    tampilkanProduk();
    tampilkanKasir();
    tampilkanDashboard();
});

function hapusProduk(id) {
    const p = produk.find(item => item.id === id);
    if (!p) return;

    if (keranjang.some(item => item.id === id)) {
        alert("Produk masih ada di keranjang.");
        return;
    }

    if (!confirm(`Hapus produk ${p.nama}?`)) return;

    produk = produk.filter(item => item.id !== id);
    simpanData();
    tampilkanProduk();
    tampilkanKasir();
    tampilkanDashboard();
}

function tampilkanKasir() {
    const pencarian = document.getElementById("cariKasir").value.toLowerCase();

    document.getElementById("katalogProduk").innerHTML = produk
        .filter(p => p.nama.toLowerCase().includes(pencarian))
        .map(p => `
            <div class="col-6 col-md-4 col-xl-3">
                <div class="product-card">
                    <div class="product-symbol"><i class="bi bi-box-seam"></i></div>
                    <h6>${p.nama}</h6>
                    <small>${rupiah(p.harga)}</small>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="small text-secondary">Stok: ${p.stok}</span>
                        <button class="btn btn-primary btn-sm" onclick="tambahKeranjang(${p.id})" ${p.stok === 0 ? "disabled" : ""}>
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join("");

    if (!document.getElementById("katalogProduk").innerHTML) {
        document.getElementById("katalogProduk").innerHTML = `
            <div class="col-12 empty-state">Produk tidak ditemukan.</div>
        `;
    }

    tampilkanKeranjang();
}

function tambahKeranjang(id) {
    const p = produk.find(item => item.id === id);
    if (!p || p.stok <= 0) return;

    const item = keranjang.find(k => k.id === id);

    if (item) {
        if (item.jumlah >= p.stok) {
            alert("Jumlah melebihi stok yang tersedia.");
            return;
        }
        item.jumlah++;
    } else {
        keranjang.push({ id, jumlah: 1 });
    }

    tampilkanKeranjang();
}

function ubahJumlah(id, perubahan) {
    const item = keranjang.find(k => k.id === id);
    const p = produk.find(itemProduk => itemProduk.id === id);

    if (!item || !p) return;

    const jumlahBaru = item.jumlah + perubahan;

    if (jumlahBaru > p.stok) {
        alert("Jumlah melebihi stok.");
        return;
    }

    if (jumlahBaru <= 0) {
        keranjang = keranjang.filter(k => k.id !== id);
    } else {
        item.jumlah = jumlahBaru;
    }

    tampilkanKeranjang();
}

function totalKeranjang() {
    return keranjang.reduce((total, item) => {
        const p = produk.find(x => x.id === item.id);
        return total + (p ? p.harga * item.jumlah : 0);
    }, 0);
}

function tampilkanKeranjang() {
    const wadah = document.getElementById("daftarKeranjang");

    if (keranjang.length === 0) {
        wadah.innerHTML = '<div class="empty-state">Belum ada produk dipilih.</div>';
    } else {
        wadah.innerHTML = keranjang.map(item => {
            const p = produk.find(x => x.id === item.id);
            if (!p) return "";

            return `
                <div class="cart-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <div class="fw-bold small">${p.nama}</div>
                            <div class="text-secondary small">${rupiah(p.harga)}</div>
                        </div>
                        <strong class="small">${rupiah(p.harga * item.jumlah)}</strong>
                    </div>
                    <div class="d-flex align-items-center gap-2 mt-2">
                        <button class="btn btn-sm btn-light" onclick="ubahJumlah(${p.id}, -1)">−</button>
                        <span class="small">${item.jumlah}</span>
                        <button class="btn btn-sm btn-light" onclick="ubahJumlah(${p.id}, 1)">+</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    document.getElementById("totalBayar").textContent = rupiah(totalKeranjang());
    hitungKembalian();
}

function kosongkanKeranjang() {
    keranjang = [];
    tampilkanKeranjang();
    document.getElementById("uangDiterima").value = "";
    document.getElementById("statusPembayaran").textContent = "";
}

function hitungKembalian() {
    const total = totalKeranjang();
    const metode = document.getElementById("metodePembayaran").value;
    const uang = Number(document.getElementById("uangDiterima").value) || 0;

    document.getElementById("bagianTunai").style.display = metode === "Tunai" ? "block" : "none";

    const kembali = metode === "Tunai" ? Math.max(0, uang - total) : 0;
    document.getElementById("kembalian").textContent = rupiah(kembali);

    const cukup = metode !== "Tunai" || uang >= total;
    document.getElementById("btnBayar").disabled = keranjang.length === 0 || !cukup;

    document.getElementById("statusPembayaran").textContent =
        metode === "Tunai" && uang < total && keranjang.length > 0
        ? "Uang yang diterima belum mencukupi."
        : "";
}

document.getElementById("metodePembayaran").addEventListener("change", hitungKembalian);
document.getElementById("uangDiterima").addEventListener("input", hitungKembalian);

function prosesPembayaran() {
    if (keranjang.length === 0) {
        alert("Keranjang masih kosong.");
        return;
    }

    const total = totalKeranjang();
    const metode = document.getElementById("metodePembayaran").value;
    const uang = metode === "Tunai" ? Number(document.getElementById("uangDiterima").value) : total;

    if (metode === "Tunai" && uang < total) {
        alert("Uang pembayaran tidak mencukupi.");
        return;
    }

    for (const item of keranjang) {
        const p = produk.find(x => x.id === item.id);
        if (!p || item.jumlah > p.stok) {
            alert("Stok produk berubah. Periksa kembali keranjang.");
            tampilkanKasir();
            return;
        }
    }

    const detail = keranjang.map(item => {
        const p = produk.find(x => x.id === item.id);
        return {
            nama: p.nama,
            harga: p.harga,
            jumlah: item.jumlah,
            subtotal: p.harga * item.jumlah
        };
    });

    keranjang.forEach(item => {
        const p = produk.find(x => x.id === item.id);
        p.stok -= item.jumlah;
    });

    const dataTransaksi = {
        id: "TRX-" + Date.now(),
        tanggal: new Date().toLocaleString("id-ID"),
        waktu: new Date().toISOString(),
        metode,
        total,
        uang,
        kembalian: metode === "Tunai" ? uang - total : 0,
        detail
    };

    transaksi.unshift(dataTransaksi);
    simpanData();

    keranjang = [];
    document.getElementById("uangDiterima").value = "";

    tampilkanKasir();
    tampilkanProduk();
    tampilkanDashboard();
    tampilkanRiwayat();
    buatNota(dataTransaksi);

    alert("Transaksi berhasil disimpan!");
    window.print();
}

function buatNota(t) {
    document.getElementById("detailNota").innerHTML = `
        <div style="max-width:350px;margin:auto;font-family:monospace">
            <div style="text-align:center">
                <h2>NyxiroPOS</h2>
                <p>Struk Pembayaran</p>
                <hr>
            </div>
            <p>ID: ${t.id}<br>Tanggal: ${t.tanggal}<br>Metode: ${t.metode}</p>
            <hr>
            ${t.detail.map(item => `
                <div style="margin-bottom:10px">
                    ${item.nama}<br>
                    ${item.jumlah} x ${rupiah(item.harga)}
                    <span style="float:right">${rupiah(item.subtotal)}</span>
                </div>
            `).join("")}
            <hr>
            <p>Total: <strong style="float:right">${rupiah(t.total)}</strong></p>
            <p>Bayar: <span style="float:right">${rupiah(t.uang)}</span></p>
            <p>Kembalian: <span style="float:right">${rupiah(t.kembalian)}</span></p>
            <hr>
            <div style="text-align:center">Terima kasih telah berbelanja!</div>
        </div>
    `;
}

function tampilkanDashboard() {
    const hariIni = new Date().toDateString();

    const transaksiHariIni = transaksi.filter(t => {
        return new Date(t.waktu).toDateString() === hariIni;
    });

    const omzet = transaksiHariIni.reduce((total, t) => total + t.total, 0);
    const stok = produk.reduce((total, p) => total + p.stok, 0);

    document.getElementById("omzet").textContent = rupiah(omzet);
    document.getElementById("totalStok").textContent = stok;
    document.getElementById("totalTransaksi").textContent = transaksiHariIni.length;

    document.getElementById("transaksiTerbaru").innerHTML =
        transaksi.slice(0, 5).map(t => `
            <tr>
                <td class="fw-bold">${t.id}</td>
                <td>${t.tanggal}</td>
                <td>${t.metode}</td>
                <td class="fw-bold">${rupiah(t.total)}</td>
            </tr>
        `).join("") || `
            <tr><td colspan="4" class="text-center text-secondary py-4">Belum ada transaksi.</td></tr>
        `;
}

function tampilkanRiwayat() {
    document.getElementById("daftarRiwayat").innerHTML =
        transaksi.map(t => `
            <tr>
                <td class="fw-bold">${t.id}</td>
                <td>${t.tanggal}</td>
                <td>${t.metode}</td>
                <td class="fw-bold">${rupiah(t.total)}</td>
                <td>
                    <button class="btn btn-sm btn-light text-primary" onclick="cetakUlang('${t.id}')">
                        <i class="bi bi-printer"></i> Cetak
                    </button>
                </td>
            </tr>
        `).join("") || `
            <tr><td colspan="5" class="text-center text-secondary py-4">Belum ada transaksi.</td></tr>
        `;
}

function cetakUlang(id) {
    const t = transaksi.find(item => item.id === id);
    if (!t) return;

    buatNota(t);
    window.print();
}

document.getElementById("cariProduk").addEventListener("input", tampilkanProduk);
document.getElementById("cariKasir").addEventListener("input", tampilkanKasir);

simpanData();
tampilkanDashboard();
tampilkanProduk();
tampilkanKasir();
tampilkanRiwayat();