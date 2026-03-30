const DATABASES = {
  principal: {
    label: "Coletânea",
    url: "coletanea_principal_mono.json"
  },
  avulsos: {
    label: "Louvores Avulsos",
    url: "louvores_avulsos_mono.json"
  }
};

let songs = [];
let filteredSongs = [];
let currentIndex = 0;
let fontSize = 20;
let showChords = true;
let currentDb = "principal";

const searchInput = document.getElementById("searchInput");
const songList = document.getElementById("songList");
const countInfo = document.getElementById("countInfo");
const songNumero = document.getElementById("songNumero");
const songTitulo = document.getElementById("songTitulo");
const songConteudo = document.getElementById("songConteudo");
const increaseFont = document.getElementById("increaseFont");
const decreaseFont = document.getElementById("decreaseFont");
const toggleChords = document.getElementById("toggleChords");
const btnPrincipal = document.getElementById("btnPrincipal");
const btnAvulsos = document.getElementById("btnAvulsos");

btnPrincipal.addEventListener("click", () => switchDatabase("principal"));
btnAvulsos.addEventListener("click", () => switchDatabase("avulsos"));

function switchDatabase(name) {
  if (name === currentDb) return;
  currentDb = name;
  btnPrincipal.classList.toggle("active", name === "principal");
  btnAvulsos.classList.toggle("active", name === "avulsos");
  searchInput.value = "";
  loadDatabase();
}

function loadDatabase() {
  const db = DATABASES[currentDb];
  countInfo.textContent = "Carregando...";
  songList.innerHTML = "";
  songNumero.textContent = "---";
  songTitulo.textContent = "Carregando";
  songConteudo.textContent = "Aguarde...";
  fetch(db.url)
    .then((res) => {
      if (!res.ok) throw new Error("Não foi possível carregar o JSON.");
      return res.json();
    })
    .then((data) => {
      songs = data;
      filteredSongs = [...songs];
      currentIndex = 0;
      renderList();
      if (filteredSongs.length) selectSong(0);
      else {
        songNumero.textContent = "---";
        songTitulo.textContent = "Sem dados";
        songConteudo.textContent = "Nenhum louvor encontrado.";
      }
    })
    .catch((error) => {
      countInfo.textContent = "Erro ao carregar os dados";
      songConteudo.textContent = error.message;
    });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  filteredSongs = songs.filter((song) =>
    String(song.numero || "").toLowerCase().includes(q) ||
    String(song.titulo || "").toLowerCase().includes(q)
  );
  currentIndex = 0;
  renderList();
  if (filteredSongs.length) selectSong(0);
  else {
    songNumero.textContent = "---";
    songTitulo.textContent = "Nenhum resultado";
    songConteudo.textContent = "Nenhum louvor encontrado.";
  }
});

increaseFont.addEventListener("click", () => {
  fontSize = Math.min(fontSize + 2, 40);
  songConteudo.style.fontSize = `${fontSize}px`;
});

decreaseFont.addEventListener("click", () => {
  fontSize = Math.max(fontSize - 2, 12);
  songConteudo.style.fontSize = `${fontSize}px`;
});

toggleChords.addEventListener("click", () => {
  showChords = !showChords;
  toggleChords.textContent = showChords ? "Ocultar cifras" : "Mostrar cifras";
  if (filteredSongs.length) renderSong(filteredSongs[currentIndex]);
});

function renderList() {
  const db = DATABASES[currentDb];
  countInfo.textContent = `${filteredSongs.length} de ${songs.length} louvores - ${db.label}`;
  songList.innerHTML = "";

  filteredSongs.forEach((song, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `song-item ${index === currentIndex ? "active" : ""}`;
    btn.innerHTML = `<span class="num">${escapeHtml(song.numero)}</span><span class="title">${escapeHtml(song.titulo)}</span>`;
    btn.addEventListener("click", () => selectSong(index));
    songList.appendChild(btn);
  });
}

function selectSong(index) {
  currentIndex = index;
  renderList();
  renderSong(filteredSongs[index]);
}

function renderSong(song) {
  songNumero.textContent = song.numero;
  songTitulo.textContent = song.titulo;

  const lines = String(song.conteudo || "").replace(/\r/g, "").split("\n");
  const html = lines.map((line) => {
    const cls = isChordLine(line) ? "chord-line" : "lyric-line";
    if (!showChords && cls === "chord-line") return "";
    return `<div class="${cls}">${escapeHtml(line) || "&nbsp;"}</div>`;
  }).join("");

  songConteudo.innerHTML = html;
  songConteudo.style.fontSize = `${fontSize}px`;
}

function isChordLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  if (!tokens.length) return false;
  let good = 0;
  for (const token of tokens) {
    const t = token.replace(/[.,;:!?"“”]/g, "");
    if (/^[A-G](?:[#bº°]|m|M|maj|min|sus|add|dim|aug|\+|-|\/|\d|\(|\)|\*)*$/.test(t)) {
      good++;
    }
  }
  return (good / tokens.length) >= 0.7;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

loadDatabase();
