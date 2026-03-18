let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

// carregar
async function carregar() {
  const res = await fetch("songs.json");
  songs = await res.json();
}
carregar();

// 🎸 detectar se é cifra
function ehCifra(linha) {
  return /^[A-G][#b]?(m|maj7|7|sus|dim|aug)?$/.test(linha.trim());
}

// 🔥 reconstruir linhas horizontais
function corrigirFormato(texto) {
  const linhas = texto.split("\n");
  let resultado = [];
  let buffer = [];

  linhas.forEach(l => {
    if (ehCifra(l)) {
      buffer.push(l.trim());
    } else {
      if (buffer.length > 0) {
        resultado.push(buffer.join("   "));
        buffer = [];
      }
      resultado.push(l);
    }
  });

  if (buffer.length > 0) {
    resultado.push(buffer.join("   "));
  }

  return resultado.join("\n");
}

// 🎨 destacar cifras SEM quebrar layout
function destacar(texto) {
  return texto.replace(
    /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g,
    '[$1]' // visual simples e seguro
  );
}

// mostrar
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  let texto = corrigirFormato(s.letra);

  songDiv.textContent = `${s.numero} - ${s.titulo}\n\n${texto}`;
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
