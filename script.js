const PER_PAGE = 5;

let data = [
  {nim:"231001", nama:"Andi Pratama",  jurusan:"Informatika",      email:"andi@mail.com"},
  {nim:"231002", nama:"Siti Aisyah",   jurusan:"Sistem Informasi", email:"siti@mail.com"},
  {nim:"231003", nama:"Budi Santoso",  jurusan:"Teknik Komputer",  email:"budi@mail.com"},
  {nim:"231004", nama:"Nina Marlina",  jurusan:"Manajemen",        email:"nina@mail.com"},
  {nim:"231005", nama:"Rizky Pratama", jurusan:"Informatika",      email:"rizky@mail.com"},
  {nim:"231006", nama:"Dewi Lestari",  jurusan:"Akuntansi",        email:"dewi@mail.com"},
  {nim:"231007", nama:"Fajar Nugroho", jurusan:"Informatika",      email:"fajar@mail.com"},
  {nim:"231008", nama:"Maya Putri",    jurusan:"Sistem Informasi", email:"maya@mail.com"}
];

try { const s = localStorage.getItem("students"); if (s) data = JSON.parse(s); } catch (e) {}
const save = () => { try { localStorage.setItem("students", JSON.stringify(data)); } catch (e) {} };

let page = 1;
let editing = null;
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function render() {
  const q = $("q").value.trim().toLowerCase();
  const list = data.filter(s => [s.nim, s.nama, s.jurusan, s.email].some(v => v.toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if (page > pages) page = pages;

  const start = (page - 1) * PER_PAGE;
  const rows = list.slice(start, start + PER_PAGE);

  $("tbody").innerHTML = rows.length
    ? rows.map((s, i) => `
      <tr>
        <td class="c">${start + i + 1}</td>
        <td>${esc(s.nim)}</td>
        <td>${esc(s.nama)}</td>
        <td>${esc(s.jurusan)}</td>
        <td>${esc(s.email)}</td>
        <td class="c">
          <button class="icon i-edit" data-edit="${esc(s.nim)}" title="Edit" aria-label="Edit">✎</button>
          <button class="icon i-del" data-del="${esc(s.nim)}" title="Hapus" aria-label="Hapus">🗑</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="empty">Tidak ada data yang cocok.</td></tr>`;

  let p = `<button data-p="1" ${page == 1 ? "disabled" : ""}>«</button>
           <button data-p="${page - 1}" ${page == 1 ? "disabled" : ""}>‹</button>`;
  for (let i = 1; i <= pages; i++) p += `<button data-p="${i}" class="${i == page ? "on" : ""}">${i}</button>`;
  p += `<button data-p="${page + 1}" ${page == pages ? "disabled" : ""}>›</button>
        <button data-p="${pages}" ${page == pages ? "disabled" : ""}>»</button>`;
  $("pager").innerHTML = p;
}

function clearForm() {
  ["nim", "nama", "jurusan", "email"].forEach(k => { $(k).value = ""; $("e-" + k).textContent = ""; });
  $("nim").disabled = false;
  editing = null;
  $("formTitle").textContent = "Form Student";
  $("btnSave").textContent = "💾 Simpan";
}

function validate() {
  const v = {
    nim: $("nim").value.trim(),
    nama: $("nama").value.trim(),
    jurusan: $("jurusan").value,
    email: $("email").value.trim()
  };
  const e = {};
  if (!/^\d{4,}$/.test(v.nim)) e.nim = "NIM harus berupa angka (min. 4 digit).";
  else if (!editing && data.some(s => s.nim === v.nim)) e.nim = "NIM sudah terdaftar.";
  if (!v.nama) e.nama = "Nama lengkap wajib diisi.";
  if (!v.jurusan) e.jurusan = "Pilih jurusan terlebih dahulu.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Format email tidak valid.";

  ["nim", "nama", "jurusan", "email"].forEach(k => $("e-" + k).textContent = e[k] || "");
  return Object.keys(e).length ? null : v;
}

$("btnSave").onclick = () => {
  const v = validate();
  if (!v) return;
  if (editing) {
    data = data.map(s => s.nim === editing ? v : s);
    toast("Data diperbarui");
  } else {
    data.push(v);
    page = Math.ceil(data.length / PER_PAGE);
    toast("Data disimpan");
  }
  save();
  clearForm();
  render();
};

$("btnCancel").onclick = clearForm;

$("btnReset").onclick = () => {
  if (confirm("Kembalikan semua data ke awal?")) {
    try { localStorage.removeItem("students"); } catch (e) {}
    location.reload();
  }
};

$("q").oninput = () => { page = 1; render(); };

document.addEventListener("click", ev => {
  const b = ev.target.closest("button");
  if (!b) return;

  if (b.dataset.p) {
    const n = +b.dataset.p;
    if (n > 0) { page = n; render(); }
  }

  if (b.dataset.edit) {
    const s = data.find(x => x.nim === b.dataset.edit);
    $("nim").value = s.nim;
    $("nim").disabled = true;
    $("nama").value = s.nama;
    $("jurusan").value = s.jurusan;
    $("email").value = s.email;
    editing = s.nim;
    $("formTitle").textContent = "Edit Student";
    $("btnSave").textContent = "💾 Perbarui";
    $("nama").focus();
  }

  if (b.dataset.del && confirm("Hapus data mahasiswa ini?")) {
    data = data.filter(x => x.nim !== b.dataset.del);
    save();
    if (editing === b.dataset.del) clearForm();
    render();
    toast("Data dihapus");
  }
});

render();