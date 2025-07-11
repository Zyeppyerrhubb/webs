<script>
  let BASE_URL = "";

  async function loadBackendURL() {
    try {
      const res = await fetch("backend.txt");
      const text = await res.text();
      BASE_URL = text.trim();

      if (!BASE_URL.startsWith("http")) {
        throw new Error("backend.txt tidak valid");
      }

      initCheckout();
    } catch (err) {
      Swal.fire("Error", "Gagal ambil URL backend. Coba refresh halaman.", "error");
      console.error("Gagal load backend.txt:", err);
    }
  }

  async function initCheckout() {
    const url = new URLSearchParams(window.location.search);
    const nama = url.get("nama");
    const harga = parseInt(url.get("harga"));
    const stok = parseInt(url.get("stok"));

    const inputNama = document.getElementById("nama");
    const inputHarga = document.getElementById("harga");
    const inputJumlah = document.getElementById("jumlah");
    const inputTotal = document.getElementById("total");

    inputNama.value = nama || "";
    inputHarga.value = isNaN(harga) ? "Rp0" : `Rp${harga.toLocaleString("id-ID")}`;
    inputJumlah.max = isNaN(stok) ? 0 : stok;

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

      if (!BASE_URL || BASE_URL.length < 5) {
        Swal.fire("Gagal", "Server belum siap. Mohon tunggu beberapa detik lalu coba lagi.", "error");
        return;
      }

      const nickname = document.getElementById("nickname").value.trim();
      const nowa = document.getElementById("nowa").value.trim();
      const jumlah = parseInt(document.getElementById("jumlah").value);
      const metode = document.getElementById("metode").value;

      if (!nickname || !nowa || isNaN(jumlah) || jumlah <= 0) {
        Swal.fire("Gagal", "Mohon isi semua data dengan benar.", "error");
        return;
      }

      if (!/^08\d{8,13}$/.test(nowa)) {
        Swal.fire("Gagal", "Nomor WA tidak valid. Gunakan format 08xxxxxxxxxx", "error");
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
          title: "Memproses...",
          html: "Mengirim data ke server...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        const res = await fetch(`${BASE_URL}/api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Gagal checkout");
        }

        localStorage.setItem("checkoutData", JSON.stringify(data));

        Swal.fire({
          icon: "info",
          title: "Menunggu Pembayaran",
          html: `
            <p>Data kamu sudah dikirim.</p>
            <p>Transfer ke:</p>
            <b>Dana / GoPay: 087814897547</b><br><br>
            <small>Sistem akan mengecek otomatis setiap 3 detik...</small>
          `,
          allowOutsideClick: false,
          showConfirmButton: false
        });

        const checkInterval = setInterval(async () => {
          try {
            const checkRes = await fetch(`${BASE_URL}/api/status/${id}`);
            const checkData = await checkRes.json();

            if (checkRes.ok && checkData.status === "paid") {
              clearInterval(checkInterval);
              Swal.fire({
                icon: "success",
                title: "Pembayaran Berhasil!",
                text: "Pesanan kamu akan segera diproses.",
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
        Swal.fire("Error", err.message || "Terjadi kesalahan saat mengirim data.", "error");
        console.error("Checkout error:", err);
      }
    });

    updateTotal();
  }

  loadBackendURL();
</script>
