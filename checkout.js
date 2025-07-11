let BASE_URL = "";

window.addEventListener("DOMContentLoaded", () => {
  fetch("backend.txt")
    .then(res => res.text())
    .then(base => {
      BASE_URL = base.trim();
      initForm(); // lanjut kalau BASE_URL udah siap
    });
});

function initForm() {
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
  inputTotal.value = "Rp0";
  inputJumlah.max = stok;

  inputJumlah.addEventListener("input", () => {
    const jumlah = parseInt(inputJumlah.value);
    if (isNaN(jumlah) || jumlah <= 0) {
      inputTotal.value = "Rp0";
    } else {
      const total = harga * jumlah;
      inputTotal.value = `Rp${total.toLocaleString("id-ID")}`;
    }
  });

  document.getElementById("form-checkout").addEventListener("submit", async (e) => {
    e.preventDefault();

    const jumlah = parseInt(inputJumlah.value);
    const nickname = document.getElementById("nickname").value;
    const nowa = document.getElementById("nowa").value;
    const metode = document.getElementById("metode").value;

    if (!jumlah || jumlah <= 0) {
      alert("Jumlah harus lebih dari 0!");
      return;
    }

    if (jumlah > stok) {
      alert("Jumlah melebihi stok tersedia!");
      return;
    }

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
      alert("Terjadi kesalahan jaringan saat checkout.");
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
