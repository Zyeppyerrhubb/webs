// file: checkout.js
let BASE_URL = "";

fetch("backend.txt")
  .then(res => res.text())
  .then(base => {
    BASE_URL = base.trim();
  });

const url = new URLSearchParams(window.location.search);
const nama = url.get("nama");
const harga = parseInt(url.get("harga"));
const stok = parseInt(url.get("stok"));
const id_produk = url.get("id_produk");

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

document.getElementById("checkoutForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nickname = document.getElementById("nickname").value.trim();
  const nowa = document.getElementById("nowa").value.trim();
  const jumlah = parseInt(document.getElementById("jumlah").value);
  const metode = document.getElementById("metode").value;

  if (!nickname || !nowa || isNaN(jumlah) || jumlah <= 0) {
    Swal.fire("Gagal", "Mohon lengkapi semua data dengan benar.", "error");
    return;
  }

  if (!/^08\d{8,13}$/.test(nowa)) {
    Swal.fire("Gagal", "Nomor WA tidak valid. Gunakan format: 08xxxxxxxxxx", "error");
    return;
  }

  const total = harga * jumlah;
  let id = crypto.randomUUID();

  const data = {
    id,
    id_produk,
    nickname,
    nowa,
    nama_produk: nama,
    jumlah,
    metode,
    total,
    status: "pending"
  };

  try {
    Swal.fire({
      title: 'Menunggu Pembayaran',
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><strong>Metode Pembayaran:</strong> ${metode}</p>
          <p><strong>Total:</strong> Rp${total.toLocaleString("id-ID")}</p>
          <p><strong>Silakan transfer ke:</strong></p>
          <div style="background:#f3f3f3;padding:10px;border-radius:6px;color:#333">
            <strong>Nomor:</strong> 087814897547<br>
            <strong>Nama:</strong> ZYEN STORE<br>
            <strong>Bank / e-Wallet:</strong> ${metode}
          </div>
          <p style="margin-top:10px;"><strong>Nickname Game:</strong> ${nickname}</p>
          <p>Setelah transfer, tunggu admin konfirmasi.</p>
        </div>
      `,
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    // polling status
    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/status/${id}`);
        const resData = await res.json();
        if (res.ok && resData.status === "berhasil") {
          clearInterval(checkInterval);
          Swal.fire({
            icon: "success",
            title: "Pembayaran Berhasil!",
            text: "Pesanan kamu akan segera diproses",
            confirmButtonText: "Lanjut"
          }).then(() => {
            window.location.href = `sukses.html?id=${id}`;
          });
        }
      } catch (err) {
        console.error("Gagal cek status:", err);
      }
    }, 3000);
  } catch (err) {
    Swal.fire("Error", "Gagal kirim data ke server", "error");
  }
});
