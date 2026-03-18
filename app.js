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

// 🎸 regex de cifra
const regexCifra = /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g;

// 🔥 identifica linha de cifra (linha com maioria de acordes)
function linhaEhCifra(linha) {
  const matches = linha.match(regexCifra);
  if (!matches) return false;
  return matches.length >= linha.trim().split(/\s+/).length / 2;
}

// 🎨 destaca cifras SEM quebrar alinhamento
function destacarLinha(linha) {
  return linha.replace(regexCifra, '<span class="chord">$1</span>');
}

// 🔥 reconstrução + destaque inteligente
function processarTexto(texto) {
  const linhas = texto.split("\n");
  let resultado = [];

  let buffer = [];

  linhas.forEach(linha => {
    if (/^[A-G][#b]?(m|maj7|7|sus|dim|aug)?$/.test(linha.trim())) {
      buffer.push(linha.trim());
    } else {
      if (buffer.length > 0) {
        const linhaCifras = buffer.join("   ");
        resultado.push(destacarLinha(linhaCifras));
        buffer = [];
      }

      if (linhaEhCifra(linha)) {
        resultado.push(destacarLinha(linha));
      } else {
        resultado.push(linha);
      }
    }
  });

  if (buffer.length > 0) {
    resultado.push(destacarLinha(buffer.join("   ")));
  }

  return resultado.join("\n");
}

// mostrar louvor
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  const textoProcessado = processarTexto(s.letra);

  songDiv.innerHTML = `
<pre>${s.numero} - ${s.titulo}

${textoProcessado}</pre>
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
