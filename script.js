let data = JSON.parse(localStorage.getItem("tabungan_pro_v1")) || {};
let kategoriAktif = null;
let editIndex = null;
let modeEditKategori = false;

const save = () => localStorage.setItem("tabungan_pro_v1", JSON.stringify(data));
const formatRupiah = (num) => "Rp " + Number(num).toLocaleString("id-ID");

/* DARK MODE */
const darkSwitch = document.getElementById("darkSwitch");
if(localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    darkSwitch.checked = true;
}
darkSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

/* POPUPS */
function tutupPopup() {
    document.querySelectorAll(".popup").forEach(p => p.classList.add("hidden"));
    document.querySelectorAll("input").forEach(i => { if(i.type !== "checkbox") i.value = ""; });
    editIndex = null;
    modeEditKategori = false;
}

function bukaPopupKategori(oldName = null) {
    if(oldName) {
        modeEditKategori = oldName;
        document.getElementById("titleKategori").innerText = "Ubah Nama Kategori";
        document.getElementById("namaKategori").value = oldName;
    } else {
        document.getElementById("titleKategori").innerText = "Kategori Baru";
    }
    document.getElementById("popupKategori").classList.remove("hidden");
}

function bukaPopupBarang(k, idx = null) {
    kategoriAktif = k;
    editIndex = idx;
    if(idx !== null) {
        document.getElementById("titleBarang").innerText = "Edit Target";
        const b = data[k].barang[idx];
        document.getElementById("barangNama").value = b.nama;
        document.getElementById("barangHarga").value = b.harga;
        document.getElementById("barangKategori").value = b.kategori;
    } else {
        document.getElementById("titleBarang").innerText = "Tambah Target";
    }
    document.getElementById("popupBarang").classList.remove("hidden");
}

function bukaPopupUang(k) { kategoriAktif = k; document.getElementById("popupUang").classList.remove("hidden"); }

/* ACTIONS */
function submitKategori() {
    let nama = document.getElementById("namaKategori").value;
    if(!nama) return;

    if(modeEditKategori) {
        data[nama] = data[modeEditKategori];
        if(nama !== modeEditKategori) delete data[modeEditKategori];
    } else {
        if(!data[nama]) data[nama] = { saldo: 0, barang: [], minimized: false };
    }
    tutupPopup(); render();
}

function submitBarang() {
    let nama = document.getElementById("barangNama").value;
    let harga = parseInt(document.getElementById("barangHarga").value);
    let kat = document.getElementById("barangKategori").value;
    if(!nama || !harga) return;

    if(editIndex !== null) {
        data[kategoriAktif].barang[editIndex] = { ...data[kategoriAktif].barang[editIndex], nama, harga, kategori: kat };
    } else {
        data[kategoriAktif].barang.push({ nama, harga, kategori: kat, dibeli: false });
    }
    tutupPopup(); render();
}

function submitUang() {
    let uang = parseInt(document.getElementById("inputUang").value);
    if(uang) data[kategoriAktif].saldo += uang;
    tutupPopup(); render();
}

function toggleMinimize(k) { data[k].minimized = !data[k].minimized; render(); }

function beliBarang(k, i) {
    let b = data[k].barang[i];
    if(data[k].saldo < b.harga) return Swal.fire("Tabungan Kurang", "Saldo tidak cukup!", "warning");
    data[k].saldo -= b.harga;
    b.dibeli = true;
    render();
}

function hapusBarang(k, i) {
    Swal.fire({ title: 'Hapus barang?', icon: 'warning', showCancelButton: true }).then(res => {
        if(res.isConfirmed) { data[k].barang.splice(i,1); render(); }
    });
}

function hapusKategori(k) {
    Swal.fire({ title: 'Hapus kategori?', icon: 'error', showCancelButton: true }).then(res => {
        if(res.isConfirmed) { delete data[k]; render(); }
    });
}

/* RENDER */
function render() {
    save();
    let html = ""; let tSaldo = 0; let tTarget = 0;

    for (let k in data) {
        let kat = data[k];
        tSaldo += kat.saldo;
        let butuh = kat.barang.reduce((acc, b) => acc + (b.dibeli ? 0 : b.harga), 0);
        let persen = butuh > 0 ? Math.min(100, (kat.saldo / butuh) * 100) : (kat.barang.length > 0 ? 100 : 0);

        html += `
        <div class="kategori">
            <div class="kategori-header">
                <div onclick="toggleMinimize('${k}')" style="flex:1">
                    <h2 style="margin:0">${kat.minimized ? '▶' : '▼'} ${k}</h2>
                    <div style="font-size: 0.8rem; color: #4CAF50; font-weight: bold; margin-top: 5px;">Progress: ${persen.toFixed(1)}%</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button style="background:none; color:#888; padding:5px;" onclick="bukaPopupKategori('${k}')">✏️</button>
                    <button style="background:none; color:#888; padding:5px;" onclick="hapusKategori('${k}')">🗑️</button>
                </div>
            </div>
            <div class="${kat.minimized ? 'hidden' : ''}">
                <p style="margin-top:15px;">Saldo: <b style="color:#4CAF50">${formatRupiah(kat.saldo)}</b></p>
                <div style="display:flex; gap:8px; margin-bottom:15px;">
                    <button class="btn-primary" onclick="bukaPopupBarang('${k}')">+ Target</button>
                    <button style="background:#388E3C; color:white;" onclick="bukaPopupUang('${k}')">+ Saldo</button>
                </div>
                ${kat.barang.map((b, i) => {
                    if(!b.dibeli) tTarget += b.harga;
                    let prog = Math.min(100, (kat.saldo / b.harga) * 100);
                    let color = prog === 100 ? "#4CAF50" : (prog > 50 ? "#FFC107" : "#F44336");
                    return `
                    <div class="barang" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding: 10px 0;">
                        <div style="flex:1">
                            <span>${b.kategori}</span> <b style="${b.dibeli ? 'text-decoration:line-through; opacity:0.5' : ''}">${b.nama}</b><br>
                            <small>${formatRupiah(b.harga)}</small>
                            <div class="progress"><div class="progress-bar" style="width:${prog}%; background:${color}"></div></div>
                        </div>
                        <div style="display:flex; gap:5px; margin-left:10px;">
                            ${!b.dibeli ? `<button style="background:#4CAF50; color:white;" onclick="beliBarang('${k}',${i})">🛒</button>` : '✅'}
                            <button style="background:#ffa000; color:white;" onclick="bukaPopupBarang('${k}',${i})">✏️</button>
                            <button style="background:#e53935; color:white;" onclick="hapusBarang('${k}',${i})">🗑️</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }
    document.getElementById("app").innerHTML = html || `<p style="text-align:center; opacity:0.5; margin-top:50px;">Belum ada kategori.</p>`;
    document.getElementById("summary-container").innerHTML = `
        <div><small>Total Tabungan</small><h2 style="margin:0">${formatRupiah(tSaldo)}</h2></div>
        <div><small>Sisa Target</small><h2 style="margin:0">${formatRupiah(tTarget)}</h2></div>
    `;
}

function downloadData() {
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tabungan-pro.json`;
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => { data = JSON.parse(ev.target.result); render(); };
    reader.readAsText(e.target.files[0]);
}

render();
