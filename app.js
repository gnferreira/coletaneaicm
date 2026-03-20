let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

async function carregar() {
  try {
    const res = await fetch("songs_profissional.json");
    songs = await res.json();
    console.log("Louvores carregados:", songs.length);
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar songs_profissional.json");
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

function ehLinhaEspecial(letra) {
  const t = (letra || "").trim().toLowerCase();
  return (
    t === "coro" ||
    t.startsWith("introdução:") ||
    t.startsWith("instrumentos:") ||
    t.startsWith("final:") ||
    t.startsWith("repetir")
  );
}

function normalizarLinhas(linhas) {
  if (!Array.isArray(linhas)) return [];

  const limpas = linhas.map((l) => ({
    acordes: (l?.acordes || "").trim(),
    letra: (l?.letra || "").trim()
  }));

  const filtradas = limpas.filter((linha) => {
    const texto = linha.letra;
    const acordes = linha.acordes;

    if (!texto && !acordes) return false;

    if (
      texto === "|" ||
      texto === "I" ||
      texto === "bis" ||
      texto === "%"
    ) {
      return false;
    }

    return true;
  });

  const semRepeticao = [];
  let ultimaFoiSeparador = false;

  for (const linha of filtradas) {
    const vaziaVisual = !linha.acordes && !linha.letra;
    const separador = vaziaVisual || ehLinhaEspecial(linha.letra);

    if (separador && ultimaFoiSeparador) {
      continue;
    }

    semRepeticao.push(linha);
    ultimaFoiSeparador = separador;
  }

  return semRepeticao;
}

function renderLinha(linha) {
  const acordes = escapeHtml(linha.acordes);
  const letra = escapeHtml(linha.letra);

  if (!acordes && !letra) return "";

  if (ehLinhaEspecial(linha.letra)) {
    return `<div class="linha-especial">${letra}</div>`;
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
    <div class="corpo-louvor">${htmlLinhas}</div>
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
