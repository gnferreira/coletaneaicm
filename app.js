let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

// carregar JSON
async function carregar() {
  try {
    const res = await fetch("songs.json");
    songs = await res.json();
  } catch (e) {
    alert("Erro ao carregar songs.json.");
  }
}
carregar();

// 🔥 CORRIGIR CIFRAS QUEBRADAS
function corrigirCifras(texto) {
  return texto
    .replace(/\b([A-G])\s+(m|7|maj7|sus|dim|aug)\b/g, "$1$2")
    .replace(/\b([A-G])\s+(7)\b/g, "$17")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\s+\n/g, "\n");
}

// 🔥 MOSTRAR (SEM HTML INTERNO)
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  const texto = corrigirCifras(s.letra);

  // 🔥 USAR textContent (NÃO innerHTML)
  songDiv.textContent = `${s.numero} - ${s.titulo}\n\n${texto}`;
}

// busca
search.addEventListener("input", () => {
  const valor = search.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!valor) return;

  const resultados = songs.filter(s =>
    s.numero.startsWith(valor) ||
    s.titulo.toLowerCase().includes(valor)
  );

  resultados.slice(0, 10).forEach(s => {
    const div = document.createElement("div");
    div.innerText = `${s.numero} - ${s.titulo}`;
    div.onclick = () => mostrar(s);
    suggestions.appendChild(div);
  });
});
