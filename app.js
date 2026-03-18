let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

// 🔥 carregar JSON
async function carregar() {
  try {
    const res = await fetch("songs.json");
    songs = await res.json();
    console.log("Louvores carregados:", songs.length);
  } catch (e) {
    alert("Erro ao carregar songs.json. Use Vercel ou servidor local.");
  }
}

carregar();

// 🎸 CORRIGIR CIFRAS QUEBRADAS
function corrigirCifras(texto) {
  return texto
    // D m → Dm
    .replace(/\b([A-G])\s+(m|7|maj7|sus|dim|aug)\b/g, "$1$2")

    // G 7 → G7
    .replace(/\b([A-G])\s+(7)\b/g, "$17")

    // espaços duplicados
    .replace(/[ ]{2,}/g, " ")

    // limpar espaços antes de quebra de linha
    .replace(/\s+\n/g, "\n");
}

// 🎸 FORMATAR SEM QUEBRAR ALINHAMENTO
function formatarLouvor(texto) {
  if (!texto) return "";

  let t = corrigirCifras(texto);

  // destacar cifras
  t = t.replace(
    /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g,
    '<span class="chord">$1</span>'
  );

  return t;
}

// 🔎 busca
search.addEventListener("input", () => {
  const valor = search.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!valor || songs.length === 0) return;

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

// 🎵 mostrar louvor
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  songDiv.innerHTML = `
${s.numero} - ${s.titulo}

${formatarLouvor(s.letra)}
  `;

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
}
