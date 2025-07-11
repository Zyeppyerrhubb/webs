async function getBackendURL() {
  const res = await fetch("backend.txt");
  const text = await res.text();
  return text.trim();
}
