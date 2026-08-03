export function gerarCodigo() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const nums = "0123456789";
  let c = "AX-";
  for (let i = 0; i < 3; i++) c += letras[Math.floor(Math.random() * letras.length)];
  c += "-";
  for (let i = 0; i < 4; i++) c += nums[Math.floor(Math.random() * nums.length)];
  return c;
}

export function normalizarCodigo(s) {
  return (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
