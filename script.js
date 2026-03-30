const DB_FILES = {
  principal: 'coletanea_principal_mono.json',
  avulsos: 'louvores_avulsos_mono.json'
};

let currentDbKey = 'principal';
let dbCache = {};
let currentSongs = [];
let filteredSongs = [];
let currentSong = null;
let fontSize = 17;
let showChords = true;
let suggestionIndex = -1;

const searchInput = document.getElementById('searchInput');
const suggestionsEl = document.getElementById('suggestions');
const songListEl = document.getElementById('songList');
const resultInfoEl = document.getElementById('resultInfo');
const songTitleEl = document.getElementById('songTitle');
const songMetaEl = document.getElementById('songMeta');
const songContentEl = document.getElementById('songContent');
const toggleChordsBtn = document.getElementById('toggleChordsBtn');
const fontDownBtn = document.getElementById('fontDownBtn');
const fontUpBtn = document.getElementById('fontUpBtn');

document.querySelectorAll('.db-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.db-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDbKey = btn.dataset.db;
    searchInput.value = '';
    hideSuggestions();
    await loadDatabase(currentDbKey);
  });
});

toggleChordsBtn.addEventListener('click', () => {
  showChords = !showChords;
  toggleChordsBtn.textContent = showChords ? 'Ocultar cifras' : 'Mostrar cifras';
  if (currentSong) renderSong(currentSong);
});

fontDownBtn.addEventListener('click', () => {
  fontSize = Math.max(12, fontSize - 1);
  songContentEl.style.fontSize = fontSize + 'px';
});

fontUpBtn.addEventListener('click', () => {
  fontSize = Math.min(26, fontSize + 1);
  songContentEl.style.fontSize = fontSize + 'px';
});

searchInput.addEventListener('input', () => {
  applyFilter();
  renderSuggestions();
});

searchInput.addEventListener('focus', () => {
  renderSuggestions();
});

searchInput.addEventListener('keydown', (e) => {
  const items = [...suggestionsEl.querySelectorAll('.suggestion-item')];
  if (!items.length || suggestionsEl.classList.contains('hidden')) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    suggestionIndex = Math.min(items.length - 1, suggestionIndex + 1);
    updateSuggestionActive(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    suggestionIndex = Math.max(0, suggestionIndex - 1);
    updateSuggestionActive(items);
  } else if (e.key === 'Enter') {
    if (suggestionIndex >= 0 && items[suggestionIndex]) {
      e.preventDefault();
      items[suggestionIndex].click();
    }
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) hideSuggestions();
});

function normalizeText(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getSearchTokens(raw) {
  return normalizeText(raw).split(/\s+/).filter(Boolean);
}

function songMatches(song, rawQuery) {
  const query = normalizeText(rawQuery).trim();
  if (!query) return true;

  const title = normalizeText(song.titulo || '');
  const number = normalizeText(song.numero || '');
  const combined = `${number} ${title}`;

  return getSearchTokens(query).every(token => combined.includes(token));
}

function getSuggestions(query) {
  if (!query.trim()) return currentSongs.slice(0, 12);
  return currentSongs.filter(song => songMatches(song, query)).slice(0, 12);
}

function renderSuggestions() {
  const suggestions = getSuggestions(searchInput.value);
  suggestionIndex = -1;

  if (!suggestions.length) {
    hideSuggestions();
    return;
  }

  suggestionsEl.innerHTML = suggestions.map(song => `
    <div class="suggestion-item" data-numero="${song.numero}">
      <span class="suggestion-number">${song.numero}</span>
      <span class="suggestion-title">${escapeHtml(song.titulo || '')}</span>
    </div>
  `).join('');

  suggestionsEl.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const song = currentSongs.find(s => s.numero === el.dataset.numero);
      if (!song) return;
      searchInput.value = `${song.numero} - ${song.titulo}`;
      applyFilter(song.numero);
      openSong(song);
      hideSuggestions();
    });
  });

  suggestionsEl.classList.remove('hidden');
}

function updateSuggestionActive(items) {
  items.forEach((item, idx) => item.classList.toggle('active', idx === suggestionIndex));
  if (items[suggestionIndex]) items[suggestionIndex].scrollIntoView({ block: 'nearest' });
}

function hideSuggestions() {
  suggestionsEl.classList.add('hidden');
}

async function loadDatabase(key) {
  if (!dbCache[key]) {
    const res = await fetch(DB_FILES[key]);
    dbCache[key] = await res.json();
  }

  currentSongs = dbCache[key].map(song => {
    if (song.conteudo) return song;
    let conteudo = '';
    if (Array.isArray(song.linhas)) {
      conteudo = song.linhas.map(l => {
        if (typeof l === 'string') return l;
        const a = (l.acordes || '');
        const t = (l.letra || '');
        return a && t ? `${a}\n${t}` : (a || t || '');
      }).join('\n');
    }
    return { ...song, conteudo };
  });

  filteredSongs = [...currentSongs];
  renderSongList();
  resultInfoEl.textContent = `${filteredSongs.length} louvores`;
  if (filteredSongs[0]) openSong(filteredSongs[0]);
}

function applyFilter(forceNumero = null) {
  const query = forceNumero ? forceNumero : searchInput.value.trim();
  filteredSongs = currentSongs.filter(song => songMatches(song, query));
  renderSongList();
  resultInfoEl.textContent = `${filteredSongs.length} louvores encontrados`;
  if (currentSong && !filteredSongs.some(s => s.numero === currentSong.numero) && filteredSongs[0]) {
    openSong(filteredSongs[0]);
  }
}

function renderSongList() {
  songListEl.innerHTML = filteredSongs.map(song => `
    <div class="song-item ${currentSong && currentSong.numero === song.numero ? 'active' : ''}" data-numero="${song.numero}">
      <div class="song-item-number">${song.numero}</div>
      <div class="song-item-title">${escapeHtml(song.titulo || '')}</div>
    </div>
  `).join('');

  songListEl.querySelectorAll('.song-item').forEach(el => {
    el.addEventListener('click', () => {
      const song = filteredSongs.find(s => s.numero === el.dataset.numero);
      if (song) openSong(song);
    });
  });
}

function openSong(song) {
  currentSong = song;
  renderSongList();
  renderSong(song);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function looksLikeChordLine(line) {
  if (!line) return false;
  const tokens = line.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const chordRegex = /^[A-G](?:[#b]|m|maj|min|sus|add|dim|aug|º|°|\+|-|\/|\d|\(|\))*$/i;
  let good = 0;
  for (const token of tokens) {
    if (chordRegex.test(token)) good++;
  }
  return good / tokens.length >= 0.65 && tokens.length <= 20;
}

function renderSong(song) {
  songTitleEl.textContent = song.titulo || 'Sem título';
  songMetaEl.textContent = `Louvor ${song.numero} • Banco: ${currentDbKey === 'principal' ? 'Coletânea' : 'Avulsos'}`;

  const raw = (song.conteudo || '').replace(/\r/g, '');
  const lines = raw.split('\n');
  let html = '';
  for (const line of lines) {
    const trimmed = line.trim();
    const isChord = looksLikeChordLine(trimmed);
    if (!showChords && isChord) continue;
    html += `<div class="${isChord ? 'chord-line' : 'lyric-line'}">${escapeHtml(line)}</div>`;
  }
  songContentEl.innerHTML = html;
  songContentEl.style.fontSize = fontSize + 'px';
}

loadDatabase(currentDbKey);
