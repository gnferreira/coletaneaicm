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

// 🎸 FORMATAÇÃO CORRETA (SEM QUEBRAR ESPAÇOS)
function formatarLouvor(texto) {

  if (!texto) return "";

  // NÃO usar trim() para não quebrar alinhamento
  let resultado = texto;

  // destacar cifras sem mexer no espaçamento
  resultado = resultado.replace(
    /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g,
    '<span class="chord">$1</span>'
  );

  return resultado;
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

  // scroll suave
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
}
