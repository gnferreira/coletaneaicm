let dbColetanea = [];
let dbAvulsos = [];
let songs = [];
let bancoAtual = "coletanea";

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");
const statusBanco = document.getElementById("statusBanco");
const btnColetanea = document.getElementById("btnColetanea");
const btnAvulsos = document.getElementById("btnAvulsos");

async function carregar() {
  try {
    const [resColetanea, resAvulsos] = await Promise.all([
      fetch("songs_ultra_compacto.json"),
      fetch("louvores_avulsos_sem_espacos.json")
    ]);

    dbColetanea = await resColetanea.json();
    dbAvulsos = await resAvulsos.json();

    songs = dbColetanea;
    atualizarStatus();
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar os bancos de dados.");
  }
}

carregar();

function atualizarStatus() {
  statusBanco.textContent =
    bancoAtual === "coletanea"
      ? "Base atual: Louvores da Coletânea"
      : "Base atual: Louvores Avulsos";

  btnColetanea.classList.toggle("active", bancoAtual === "coletanea");
  btnAvulsos.classList.toggle("active", bancoAtual === "avulsos");
}

function trocarBanco(tipo) {
  bancoAtual = tipo;
  songs = tipo === "coletanea" ? dbColetanea : dbAvulsos;
  suggestions.innerHTML = "";
  songDiv.innerHTML = "";
  search.value = "";
  atualizarStatus();
}

btnColetanea.addEventListener("click", () => trocarBanco("coletanea"));
btnAvulsos.addEventListener("click", () => trocarBanco("avulsos"));

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
    t.startsWith("int:") ||
    t.startsWith("instrumentos:") ||
    t.startsWith("final:") ||
    t.startsWith("repetir") ||
    t.startsWith("repete")
  );
}

function normalizarLinhas(linhas) {
  if (!Array.isArray(linhas)) return [];

  return linhas
    .map((l) => ({
      acordes: (l?.acordes || "").trim(),
      letra: (l?.letra || "").trim()
    }))
    .filter((linha) => linha.acordes || linha.letra);
}

function renderPreLouvor(linhas) {
  let html = '<pre class="pre-louvor">';

  for (const linha of linhas) {
    const acordes = escapeHtml(linha.acordes);
    const letra = escapeHtml(linha.letra);

    if (ehLinhaEspecial(linha.letra)) {
      html += `<span class="linha-especial-inline">${letra}</span>\n`;
      continue;
    }

    if (acordes) {
      html += `<span class="acordes-inline">${acordes}</span>\n`;
    }

    if (letra) {
      html += `<span class="letra-inline">${letra}</span>\n`;
    }
  }

  html += "</pre>";
  return html;
}

function mostrar(song) {
  suggestions.innerHTML = "";
  search.value = `${song.numero} - ${song.titulo}`;

  const linhas = normalizarLinhas(song.linhas);

  songDiv.innerHTML = `
    <div class="cabecalho-louvor">
      <div class="numero-louvor">${escapeHtml(song.numero)}</div>
      <h2>${escapeHtml(song.titulo)}</h2>
    </div>
    <div class="corpo-louvor">
      ${renderPreLouvor(linhas)}
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
