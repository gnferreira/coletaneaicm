let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

// carregar JSON
async function carregar() {
  const res = await fetch("songs.json");
  songs = await res.json();
}
carregar();

// 🔥 corrigir cifras
function corrigirCifras(texto) {
  return texto
    .replace(/\b([A-G])\s+(m|7|maj7|sus|dim|aug)\b/g, "$1$2")
    .replace(/\b([A-G])\s+(7)\b/g, "$17");
}

// 🔥 destacar SEM QUEBRAR LINHA
function destacarCifrasSeguro(texto) {
  const regex = /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g;

  let partes = texto.split(regex);

  return texto.replace(regex, (match) => {
    return `<span class="chord">${match}</span>`;
  });
}

// mostrar louvor
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  let texto = corrigirCifras(s.letra);

  songDiv.innerHTML = `
<pre>
${destacarCifrasSeguro(texto)}
</pre>
  `;
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
