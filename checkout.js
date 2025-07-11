let BASE_URL = "";

window.addEventListener("DOMContentLoaded", () => {
  fetch("backend.txt")
    .then(res => res.text())
    .then(base => {
      BASE_URL = base.trim();
      initForm(); // baru jalan setelah BASE_URL siap
    });
});

function initForm() {
  const url = new URLSearchParams(window.location.search);
  const nama = url.get("nama");
  const harga = parseInt(url.get("harga"));
  const stok = parseInt(url.get("stok"));
  const id_produk = url.get("id");

  // isi input dari URL
  document.getElementById("nama").value = nama || "";
  document.getElementById("harga").value = `Rp${harga.toLocaleString("id-ID")}`;
  document.getElementById("total").value = "Rp0";
  const inputJumlah = document.getElementById("jumlah");
  inputJumlah.max = stok;

  inputJumlah.addEventListener("input", () => {
    const jumlah = parseInt(inputJumlah.value);
    const total = isNaN(jumlah) || jumlah <= 0 ? 0 : harga * jumlah;
    document.getElementById("total").value = `Rp${total.toLocaleString("id-ID")}`;
  });

  // hanya jalan pas submit
  document.getElementById("form-checkout").addEventListener("submit", async (e) => {
    e.preventDefault();

    const jumlah = parseInt(document.getElementById("jumlah").value);
    const nickname = document.getElementById("nickname").value;
    const nowa = document.getElementById("nowa").value;
    const metode = document.getElementById("metode").value;

    if (!jumlah || jumlah <= 0) return alert("Jumlah harus lebih dari 0!");
    if (jumlah > stok) return alert("Jumlah melebihi stok tersedia!");

    try {
      const res = await fetch(`${BASE_URL}/checkout`, {
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

        const interval = setInterval(async () => {
          const statusRes = await fetch(`${BASE_URL}/status/${data.transaksi_id}`);
          const statusData = await statusRes.json();

          if (statusData.status === "berhasil") {
            clearInterval(interval);
            hidePopup();
            Swal.fire("✅ Pembayaran Berhasil!", "Transaksi kamu sukses!", "success").then(() => {
              window.location.href = "sukses.html";
            });
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
  document.getElementById("popup").style.display = "flex";
}
function hidePopup() {
  document.getElementById("popup").style.display = "none";
}
