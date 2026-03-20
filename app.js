let songs = [];

const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const songDiv = document.getElementById("song");

// 🎸 REGEX DE CIFRAS
const regexCifra = /\b([A-G](#|b)?(m|maj7|7|sus|dim|aug)?)\b/g;

// 🔥 LIMPEZA DO TEXTO
function limparTexto(texto) {
  return texto
    // junta palavras quebradas (Se nhor → Senhor)
    .replace(/\b([A-Za-zÀ-ÿ])\s+(?=[a-zà-ÿ])/g, "$1")

    // remove múltiplos espaços
    .replace(/[ ]{2,}/g, " ")

    // remove linhas lixo
    .split("\n")
    .filter(l => !/^[-_=]{3,}$/.test(l.trim()))
    .join("\n")

    // remove espaços antes de quebra
    .replace(/\s+\n/g, "\n");
}

// 🔥 IDENTIFICA LINHA DE CIFRA
function linhaEhCifra(linha) {
  const matches = linha.match(regexCifra);
  if (!matches) return false;
  return matches.length >= linha.trim().split(/\s+/).length / 2;
}

// 🎨 DESTACA CIFRAS
function destacar(linha) {
  return linha.replace(regexCifra, '<span class="chord">$1</span>');
}

// 🔥 PROCESSA TEXTO COMPLETO
function processar(texto) {
  const linhas = texto.split("\n");
  let resultado = [];
  let buffer = [];

  linhas.forEach(linha => {
    const limpa = linha.trim();

    // junta cifras quebradas (G / D / Em)
    if (/^[A-G][#b]?(m|maj7|7|sus|dim|aug)?$/.test(limpa)) {
      buffer.push(limpa);
    } else {
      if (buffer.length > 0) {
        resultado.push(destacar(buffer.join("   ")));
        buffer = [];
      }

      if (linhaEhCifra(linha)) {
        resultado.push(destacar(linha));
      } else {
        resultado.push(linha);
      }
    }
  });

  if (buffer.length > 0) {
    resultado.push(destacar(buffer.join("   ")));
  }

  return resultado.join("\n");
}

// 🔥 CARREGAR JSON
async function carregar() {
  try {
    const res = await fetch("songs.json");
    const data = await res.json();

    songs = data.map(s => ({
      numero: s.numero,
      titulo: limparTexto(s.titulo),
      letra: limparTexto(s.letra)
    }));

    console.log("Louvores carregados:", songs.length);
  } catch (e) {
    alert("Erro ao carregar songs.json");
  }
}

carregar();

// 🔎 BUSCA
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

// 🎵 MOSTRAR LOUVOR
function mostrar(s) {
  suggestions.innerHTML = "";
  search.value = `${s.numero} - ${s.titulo}`;

  const texto = processar(s.letra);

  songDiv.innerHTML = `
<pre>${s.numero} - ${s.titulo}

${texto}</pre>
  `;
}
