let BASE_URL = "";
let pollingInterval = null;

window.addEventListener("DOMContentLoaded", () => {
  fetch("backend.txt")
    .then(res => res.text())
    .then(base => {
      BASE_URL = base.trim();
      setupForm();
    });
});

window.onload = () => {
  hidePopup(); // biar popup langsung ketutup saat halaman dibuka ulang
};

function setupForm() {
  const url = new URLSearchParams(window.location.search);
  const nama = url.get("nama");
  const harga = parseInt(url.get("harga"));
  const stok = parseInt(url.get("stok"));
  const id_produk = url.get("id");

  const inputNama = document.getElementById("nama");
  const inputHarga = document.getElementById("harga");
  const inputJumlah = document.getElementById("jumlah");
  const inputTotal = document.getElementById("total");

  inputNama.value = nama || "";
  inputHarga.value = `Rp${harga.toLocaleString("id-ID")}`;
  inputJumlah.max = stok;
  inputTotal.value = "Rp0";

  inputJumlah.addEventListener("input", () => {
    const jumlah = parseInt(inputJumlah.value);
    const total = isNaN(jumlah) || jumlah <= 0 ? 0 : harga * jumlah;
    inputTotal.value = `Rp${total.toLocaleString("id-ID")}`;
  });

  document.getElementById("form-checkout").addEventListener("submit", async (e) => {
    e.preventDefault();

    const jumlah = parseInt(inputJumlah.value);
    const nickname = document.getElementById("nickname").value;
    const nowa = document.getElementById("nowa").value;
    const metode = document.getElementById("metode").value;

    if (!jumlah || jumlah <= 0) return alert("Jumlah harus lebih dari 0!");
    if (jumlah > stok) return alert("Jumlah melebihi stok!");

    try {
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          harga,
          jumlah,
          id: id_produk,
          nickname,
          nowa,
          metode
        }),
      });

      const data = await res.json();

      if (data.status === "pending") {
        showPopup();

        pollingInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${BASE_URL}/api/status/${data.transaksi_id}`);
            const statusData = await statusRes.json();

            if (statusData.status === "berhasil") {
              clearInterval(pollingInterval);
              pollingInterval = null;
              hidePopup();
              Swal.fire("✅ Pembayaran Berhasil!", "Transaksi kamu sukses!", "success").then(() => {
                window.location.href = "sukses.html";
              });
            }
          } catch (err) {
            console.error("Gagal polling status transaksi:", err);
          }
        }, 3000);
      } else {
        alert("❌ Gagal membuat transaksi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat proses checkout.");
      console.error(err);
    }
  });
}

function showPopup() {
  hidePopup(); // pastikan tidak ada popup lama
  document.getElementById("popup").style.display = "flex";
}

function hidePopup() {
  document.getElementById("popup").style.display = "none";
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
