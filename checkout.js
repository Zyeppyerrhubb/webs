<script>
  const url = new URLSearchParams(window.location.search);
  const nama = url.get("nama");
  const harga = parseInt(url.get("harga"));
  const stok = parseInt(url.get("stok"));

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
    const id = crypto.randomUUID();

    const data = {
      id,
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
        title: 'Memproses...',
        html: 'Sedang mengirim data ke server...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await fetch("https://bccacea4-b100-4d02-9d5b-f1cbbfdb9b63-00-8ki0bygk7dr8.pike.replit.dev/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        // ✅ simpan data ke localStorage
        localStorage.setItem("checkoutData", JSON.stringify(data));

        Swal.fire({
          icon: 'info',
          title: 'Menunggu Pembayaran',
          html: 'Data kamu sudah dikirim. Mohon tunggu konfirmasi dari admin...',
          allowOutsideClick: false,
          showConfirmButton: false
        });

        const checkInterval = setInterval(async () => {
          try {
            const checkRes = await fetch(`https://bccacea4-b100-4d02-9d5b-f1cbbfdb9b63-00-8ki0bygk7dr8.pike.replit.dev/api/status/${id}`);
            const checkData = await checkRes.json();

            if (checkRes.ok && checkData.status === "paid") {
              clearInterval(checkInterval);
              Swal.fire({
                icon: 'success',
                title: 'Pembayaran Berhasil!',
                text: 'Pesanan kamu sudah dibayar dan akan segera diproses.',
                confirmButtonText: 'Lanjut'
              }).then(() => {
                  window.location.href =                   `sukses.html?id=${id}`;
              });
            }
          } catch (err) {
            console.error("Gagal cek status:", err);
          }
        }, 3000);
      } else {
        Swal.fire("Gagal", result.message || "Gagal checkout", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan saat mengirim data.", "error");
    }
  });

  updateTotal();
</script>