let data={}
let kategoriAktif=null

function formatRupiah(num){
return "Rp "+Number(num).toLocaleString("id-ID")
}

/* DARK MODE */

const darkSwitch=document.getElementById("darkSwitch")

if(localStorage.getItem("darkMode")==="true"){
document.body.classList.add("dark")
darkSwitch.checked=true
}

darkSwitch.addEventListener("change",()=>{

document.body.classList.toggle("dark")

localStorage.setItem(
"darkMode",
document.body.classList.contains("dark")
)

})

/* POPUP */

function bukaPopupKategori(){
document.getElementById("popupKategori").classList.remove("hidden")
}

function bukaPopupBarang(k){
kategoriAktif=k
document.getElementById("popupBarang").classList.remove("hidden")
}

function bukaPopupUang(k){
kategoriAktif=k
document.getElementById("popupUang").classList.remove("hidden")
}

function tutupPopup(){
document.querySelectorAll(".popup").forEach(p=>p.classList.add("hidden"))
}

/* ACTION */

function submitKategori(){

let nama=document.getElementById("namaKategori").value
if(!nama)return

data[nama]={saldo:0,barang:[]}

tutupPopup()
render()

}

function submitBarang(){

let nama=document.getElementById("barangNama").value
let harga=parseInt(document.getElementById("barangHarga").value)
let kategori=document.getElementById("barangKategori").value

if(!nama||!harga)return

data[kategoriAktif].barang.push({
nama:nama,
harga:harga,
kategori:kategori,
dibeli:false
})

tutupPopup()
render()

}

function submitUang(){

let uang=parseInt(document.getElementById("inputUang").value)

if(!uang)return

data[kategoriAktif].saldo+=uang

tutupPopup()
render()

}

/* BARANG */

function renameBarang(k,i){

let baru=prompt("Nama baru",data[k].barang[i].nama)

if(!baru)return

data[k].barang[i].nama=baru

render()

}

function hapusBarang(k,i){

if(confirm("Hapus barang?")){

data[k].barang.splice(i,1)

render()

}

}

function beliBarang(k,i){

let b=data[k].barang[i]

if(b.dibeli)return

if(data[k].saldo<b.harga){
alert("Saldo belum cukup")
return
}

data[k].saldo-=b.harga
b.dibeli=true

render()

}

/* KATEGORI */

function renameKategori(nama){

let baru=prompt("Nama baru kategori",nama)

if(!baru)return

data[baru]=data[nama]

delete data[nama]

render()

}

function hapusKategori(nama){

if(confirm("Hapus kategori?")){

delete data[nama]

render()

}

}

/* RENDER */

function render(){

let html=""

for(let k in data){

let kategori=data[k]

html+=`

<div class="kategori">

<h2>${k}</h2>

<p>Saldo: <b>${formatRupiah(kategori.saldo)}</b></p>

<button onclick="bukaPopupBarang('${k}')">Tambah Barang</button>
<button onclick="bukaPopupUang('${k}')">Tambah Uang</button>
<button onclick="renameKategori('${k}')">Rename</button>
<button onclick="hapusKategori('${k}')">Hapus</button>

<hr>
`

kategori.barang.forEach((b,i)=>{

let progress=Math.min(100,(kategori.saldo/b.harga)*100)

html+=`

<div class="barang">

<div>

${b.kategori} ${b.dibeli?`<span style="text-decoration:line-through">${b.nama}</span>`:b.nama}

<br>

Harga: ${formatRupiah(b.harga)}

<div class="progress">
<div class="progress-bar" style="width:${progress}%"></div>
</div>

</div>

<div>

<button onclick="beliBarang('${k}',${i})">Dibeli</button>
<button onclick="renameBarang('${k}',${i})">Rename</button>
<button onclick="hapusBarang('${k}',${i})">Hapus</button>

</div>

</div>

`

})

html+="</div>"

}

document.getElementById("app").innerHTML=html

}

/* FILE */

function downloadData(){

let file=new Blob([JSON.stringify(data)],{type:"application/json"})

let a=document.createElement("a")

a.href=URL.createObjectURL(file)

a.download="tabungan.json"

a.click()

}

function importData(event){

let file=event.target.files[0]

let reader=new FileReader()

reader.onload=function(e){

data=JSON.parse(e.target.result)

render()

}

reader.readAsText(file)

}