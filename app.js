let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

async function carregar() {
  const res = await fetch("songs.json");
  songs = await res.json();
}

carregar();

function renderLinha(linha) {
  return `
    <div class="linha">
      <div class="acordes">${linha.acordes}</div>
      <div class="letra">${linha.letra}</div>
    </div>
  `;
}

function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  let html = `<h2>${s.numero} - ${s.titulo}</h2>`;

  s.linhas.forEach(l => {
    html += renderLinha(l);
  });

  songDiv.innerHTML = html;
}

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
