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

const CACHE_VERSAO = "convite-v3";

const ARQUIVOS_PARA_GUARDAR = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "js/script.js",
  "js/qrcode.js",

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
  "images/laco.png",
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

// Estratégia: tenta o cache primeiro (abre na hora, funciona offline);
// se não tiver, busca na rede e guarda uma cópia pra próxima vez.
self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

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
