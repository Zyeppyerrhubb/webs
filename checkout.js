let BASE_URL = "";

// ambil URL backend dari backend.txt
fetch("backend.txt")
  .then(res => res.text())
  .then(base => {
    BASE_URL = base.trim();
  });

const url = new URLSearchParams(window.location.search);
const nama = url.get("nama");
const harga = parseInt(url.get("harga"));
const stok = parseInt(url.get("stok"));
const id_produk = url.get("id"); // ✅ fix: ambil "id", bukan "id_produk"

const inputNama = document.getElementById("nama");
const inputHarga = document.getElementById("harga");
const inputJumlah = document.getElementById("jumlah");
const inputTotal = document.getElementById("total");

inputNama.value = nama;
inputHarga.value = `Rp${harga.toLocaleString("id-ID")}`;
inputJumlah.max = stok;

inputJumlah.addEventListener("input", updateTotal);

function updateTotal() {
  const jumlah = parseInt(inputJumlah.value);
  if (isNaN(jumlah) || jumlah <= 0) {
    inputTotal.value = "Rp0";
  } else {
    const total = harga * jumlah;
    inputTotal.value = `Rp${total.toLocaleString("id-ID")}`;
  }
}

document.getElementById("form-checkout").addEventListener("submit", async (e) => {
  e.preventDefault();
  const jumlah = parseInt(inputJumlah.value);
  if (!jumlah || jumlah <= 0) {
    alert("Jumlah harus lebih dari 0!");
    return;
  }

  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nama,
      harga,
      jumlah,
      id: id_produk,
    }),
  });

  const data = await res.json();

  if (data.status === "pending") {
    showPopup();

    const interval = setInterval(async () => {
      const statusRes = await fetch(`${BASE_URL}/status/${data.transaksi_id}`);
      const statusData = await statusRes.json();

      if (statusData.status === "berhasil") {
        clearInterval(interval);
        hidePopup();
        alert("✅ Pembayaran berhasil!");
        window.location.href = "sukses.html";
      }
    }, 3000);
  } else {
    alert("❌ Gagal membuat transaksi.");
  }
});

// popup instruksi
function showPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "block";
}

function hidePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
}
