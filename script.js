document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const item = urlParams.get("item");
  const price = urlParams.get("price");

  document.getElementById("item").value = item || "";
  document.getElementById("price").value = price || "";

  document.getElementById("checkoutForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const itemName = document.getElementById("item").value;
    const itemPrice = document.getElementById("price").value;
    const jumlah = document.getElementById("jumlah").value;
    const metode = document.getElementById("metode").value;
    const catatan = document.getElementById("catatan").value;

    const pesan = `🛒 PESANAN ZYEN STORE\n\n📦 Produk: ${itemName}\n💰 Harga: ${itemPrice}\n🧮 Jumlah: ${jumlah}\n💳 Pembayaran via: ${metode}\n📝 Catatan: ${catatan}`;
    const waLink = `https://wa.me/6287778342994?text=${encodeURIComponent(pesan)}`;

    window.open(waLink, "_blank");
  });
});