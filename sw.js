/* =====================================================================
   SERVICE WORKER — deixa o convite funcionando sem internet
   =====================================================================
   No primeiro acesso (com internet), este arquivo baixa e guarda uma
   cópia de todo o site no navegador. Depois disso, mesmo sem conexão,
   o convite abre normalmente a partir dessa cópia salva.

   IMPORTANTE: sempre que adicionar/trocar um arquivo do site (nova
   foto, novo áudio etc.), troque o número da CACHE_VERSAO abaixo —
   assim o navegador sabe que precisa baixar a versão nova.
   ===================================================================== */

const CACHE_VERSAO = "convite-v30";

// Página, estilo e script: sempre busca a versão mais nova na rede
// primeiro (só usa a cópia salva se estiver sem internet). É o que
// garante que uma atualização publicada apareça na hora no celular,
// sem precisar recarregar a página várias vezes.
const ARQUIVOS_SEMPRE_NOVOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "js/script.js",
  "js/qrcode.js",
];

const ARQUIVOS_PARA_GUARDAR = [
  ...ARQUIVOS_SEMPRE_NOVOS,

  "fonts/great-vibes-400.woff2",
  "fonts/montserrat-300.woff2",
  "fonts/montserrat-400.woff2",
  "fonts/montserrat-500.woff2",
  "fonts/montserrat-600.woff2",
  "fonts/montserrat-700.woff2",
  "fonts/playfair-400-italic.woff2",
  "fonts/playfair-400.woff2",
  "fonts/playfair-500-italic.woff2",
  "fonts/playfair-500.woff2",
  "fonts/playfair-600.woff2",
  "fonts/playfair-700.woff2",

  "images/favicon.svg",
  "images/icon-192.png",
  "images/icon-512.png",
  "images/apple-touch-icon.png",
  "images/convite-fundo.png",
  "images/selo-recorte.png",
  "images/flor.png",
  "images/flor1.png",
  "images/florcirculo.png",
  "images/vazoflor.png",
  "images/foto1.jpeg",
  "images/foto2.jpeg",
  "images/1.jpeg",
  "images/2.jpeg",
  "images/3.jpeg",
  "images/4.jpeg",
  "images/5.jpeg",
  "images/6.jpeg",
  "images/meme1.jpg",
  "images/meme2.jpg",
  "images/meme3.jpg",
  "images/meme4.jpg",
  "images/meme5.jpg",
  "images/meme6.jpg",
  "images/meme7.jpg",
  "images/meme8.jpg",
  "images/meme9.jpg",
  "images/meme10.jpg",

  "audio/musica.mp3",
  "video/video.mp4",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_VERSAO).then((cache) => cache.addAll(ARQUIVOS_PARA_GUARDAR))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_VERSAO)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

function ehArquivoSempreNovo(request) {
  if (request.mode === "navigate") return true;
  const caminho = new URL(request.url).pathname.replace(/^\//, "");
  return ARQUIVOS_SEMPRE_NOVOS.some((arq) => arq === caminho || (arq === "./" && caminho === ""));
}

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  // Página/CSS/JS: rede primeiro, cache só como reserva pra quando
  // não tiver internet.
  if (ehArquivoSempreNovo(evento.request)) {
    evento.respondWith(
      fetch(evento.request)
        .then((respostaDaRede) => {
          const copia = respostaDaRede.clone();
          caches.open(CACHE_VERSAO).then((cache) => cache.put(evento.request, copia));
          return respostaDaRede;
        })
        .catch(() => caches.match(evento.request, { ignoreSearch: true }))
    );
    return;
  }

  // Fotos, fontes, áudio e vídeo: cache primeiro (abre na hora, funciona
  // offline); se não tiver, busca na rede e guarda uma cópia pra próxima vez.
  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true }).then((respostaEmCache) => {
      if (respostaEmCache) return respostaEmCache;

      return fetch(evento.request)
        .then((respostaDaRede) => {
          const copia = respostaDaRede.clone();
          caches.open(CACHE_VERSAO).then((cache) => cache.put(evento.request, copia));
          return respostaDaRede;
        })
        .catch(() => respostaEmCache);
    })
  );
});
