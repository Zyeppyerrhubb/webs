async function getBackendURL() {
  const res = await fetch('/backend.txt');
  return res.text();
}

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const backendURL = await getBackendURL();

  const res = await fetch(`${backendURL}/api/auth/login`, {
    method: "POST",
    credentials: "include", // penting biar session login nyambung
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  } else {
    alert(data.message);
  }
});
