let songs = [];

// 🔥 carregar JSON corretamente
async function carregar() {
  try {
    const res = await fetch("songs.json");
    songs = await res.json();
    console.log("Louvores carregados:", songs.length);
  } catch (e) {
    alert("Erro ao carregar songs.json. Rode em servidor!");
  }
}

carregar();

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

// 🎸 destacar cifras melhorado
function destacar(texto) {
  return texto.replace(/\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g,
    '<span class="chord">$1</span>');
}

// 🔎 busca melhorada (mais rápida)
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

// 🎵 mostrar
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  songDiv.innerHTML = `
    <h2>${s.numero} - ${s.titulo}</h2>
    <div>${destacar(s.letra)}</div>
  `;
}