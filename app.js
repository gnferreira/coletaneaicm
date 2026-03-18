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
    alert("Erro ao carregar songs.json. Verifique se está no Vercel ou servidor.");
  }
}

carregar();

// 🎸 FORMATAÇÃO INTELIGENTE
function formatarLouvor(texto) {
  const linhas = texto.split("\n");

  return linhas.map(linha => {
    let limpa = linha.trim();

    if (!limpa) return "<br>";

    // linha só com acordes
    if (/^([A-G](#|b)?(m|maj7|7|sus|dim|aug)?\s?)+$/.test(limpa)) {
      return `<div class="linha cifra">${limpa}</div>`;
    }

    // linha com cifra + letra
    let linhaFormatada = limpa.replace(
      /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g,
      '<span class="chord">$1</span>'
    );

    return `<div class="linha">${linhaFormatada}</div>`;
  }).join("");
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
    <h2>${s.numero} - ${s.titulo}</h2>
    <div>${formatarLouvor(s.letra)}</div>
  `;

  // 🔥 scroll suave
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
}
