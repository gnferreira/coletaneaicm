let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

async function carregar() {
  try {
    const res = await fetch("songs.json");
    songs = await res.json();
    console.log("Louvores carregados:", songs.length);
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar songs.json");
  }
}

carregar();

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarLinhas(linhas) {
  if (!Array.isArray(linhas)) return [];

  const limpas = linhas.map((l) => ({
    acordes: (l?.acordes || "").trim(),
    letra: (l?.letra || "").trim()
  }));

  const semExcesso = [];
  for (const linha of limpas) {
    const vazia = !linha.acordes && !linha.letra;
    const ultima = semExcesso[semExcesso.length - 1];
    const ultimaVazia = ultima && !ultima.acordes && !ultima.letra;

    if (vazia && ultimaVazia) continue;
    semExcesso.push(linha);
  }

  while (semExcesso.length && !semExcesso[0].acordes && !semExcesso[0].letra) {
    semExcesso.shift();
  }
  while (
    semExcesso.length &&
    !semExcesso[semExcesso.length - 1].acordes &&
    !semExcesso[semExcesso.length - 1].letra
  ) {
    semExcesso.pop();
  }

  return semExcesso;
}

function renderLinha(linha) {
  const acordes = escapeHtml(linha.acordes);
  const letra = escapeHtml(linha.letra);

  if (!acordes && !letra) {
    return `<div class="bloco-espaco"></div>`;
  }

  return `
    <div class="linha-musica">
      ${acordes ? `<div class="acordes">${acordes}</div>` : ""}
      ${letra ? `<div class="letra">${letra}</div>` : ""}
    </div>
  `;
}

function mostrar(song) {
  suggestions.innerHTML = "";
  search.value = `${song.numero} - ${song.titulo}`;

  const linhas = normalizarLinhas(song.linhas);

  const htmlLinhas = linhas.map(renderLinha).join("");

  songDiv.innerHTML = `
    <div class="cabecalho-louvor">
      <div class="numero-louvor">${escapeHtml(song.numero)}</div>
      <h2>${escapeHtml(song.titulo)}</h2>
    </div>
    <div class="corpo-louvor">
      ${htmlLinhas}
    </div>
  `;
}

search.addEventListener("input", () => {
  const valor = search.value.toLowerCase().trim();
  suggestions.innerHTML = "";

  if (!valor) return;

  const resultados = songs.filter((s) =>
    String(s.numero).includes(valor) ||
    String(s.titulo).toLowerCase().includes(valor)
  );

  resultados.slice(0, 12).forEach((s) => {
    const div = document.createElement("div");
    div.className = "item-sugestao";
    div.textContent = `${s.numero} - ${s.titulo}`;
    div.onclick = () => mostrar(s);
    suggestions.appendChild(div);
  });
});
