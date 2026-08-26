/* =====================================================================
   MINI SITE DE CASAMENTO — script principal
   =====================================================================
   COMO EDITAR O SITE:
   Praticamente tudo (nomes, data, local, WhatsApp, Pix) é controlado
   pelo objeto WEDDING logo abaixo. Troque os valores entre aspas e
   salve — o site inteiro (envelope, hero, contagem, botões) atualiza
   sozinho, porque todos os textos são preenchidos a partir daqui.

   Textos mais longos e específicos (nossa história, dress code,
   padrinhos, legendas da galeria) ficam direto no index.html, em
   blocos marcados com o comentário "EDITE AQUI".
   ===================================================================== */

// O site sempre começa do topo (envelope + hero), nunca de onde o
// navegador "lembrava" de uma visita anterior (voltar/recarregar a página).
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo({ top: 0, left: 0, behavior: "instant" });

// Registra o service worker que guarda o site em cache — depois do
// primeiro acesso, o convite continua abrindo mesmo sem internet.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* navegador sem suporte ou bloqueado — o site continua funcionando normalmente online */
    });
  });
}

const WEDDING = {
  // Nomes do casal (aparecem no envelope, no topo e no rodapé)
  noiva: "INGRID APARECIDA",
  noivo: "IVANEY DE CASTRO",

  // Data e hora principal do casamento (usada na contagem regressiva).
  // Formato: "AAAA-MM-DDTHH:MM:SS" — 24 horas, sem espaços.
  // Ajuste o fuso se não for horário de Manaus/Amazonas:
  // -04:00 = Manaus | -03:00 = Brasília/SP/RJ | -05:00 = Acre
  dataISO: "2026-12-19T19:00:00-04:00",

  // Prazo para os convidados confirmarem presença (texto livre)
  rsvpPrazo: "1º de dezembro de 2026",

  cerimonia: {
    horario: "19h00",
    local: "Basílica de Santo Antônio",
    endereco: "Centro, Borba – Am",
  },

  recepcao: {
    horario: "21h00",
    local: "Centro Social Dom José Afonso Ribeiro",
    endereco: "R. Floriano Peixoto - Centro, Borba - AM",
  },

  // WhatsApp para confirmação de presença.
  // Formato: código do país + DDD + número, só números (sem espaço, +, ou traço)
  // Exemplo Brasil/Manaus: 55 92 91234-5678  ->  "5592912345678"
  whatsapp: "92988531960",

  // Mensagem que já vem pronta quando o convidado clica em confirmar
  whatsappMensagem: "Olá! Gostaria de confirmar minha presença no casamento de {noiva} e {noivo}. 🤍",

  // Dados para presente via Pix
  pixKey: "009.892.722-14",
  pixNome: "Ivaney de Castro",
  pixCidade: "Borba", // cidade do titular da chave — exigido pelo padrão do QR Code Pix
};

/* -----------------------------------------------------------------
   LISTA DE PRESENTES (versão descontraída)
   Cada item vira um card na seção "Lista de presentes". Ao tocar,
   abre um QR Code Pix já com esse valor preenchido.

   Para usar uma foto de meme real em vez do emoji, troque "imagem"
   por "images/sua-foto.jpg" (mesmo esquema da galeria) — o código já
   detecta e mostra a foto no lugar do emoji.
   ----------------------------------------------------------------- */
const LISTA_PRESENTES = [
  { titulo: "Alvará pra roubar docinhos", valor: 50, imagem: "images/meme1.jpg" },
  { titulo: "Ajuda pra lua de mel", valor: 75, imagem: "images/meme4.jpg" },
  { titulo: "Cobertor pra noiva que está sempre coberta de razão", valor: 100, imagem: "images/meme3.jpg" },
  { titulo: "Cota pra comer e falar mal da festa", valor: 125, imagem: "images/meme2.jpg" },
  { titulo: "Primeiro lugar da fila do buffet", valor: 150, imagem: "images/meme5.jpg" },
  { titulo: "Calmantes pro noivo continuar aguentando a noiva", valor: 175, imagem: "images/meme6.jpg" },
  { titulo: "Maquiagem pra noiva ficar linda", valor: 200, imagem: "images/meme7.jpg" },
  { titulo: "De coração, qualquer valor", valor: 250, imagem: "images/meme8.jpg" },
  { titulo: "Levar alguém que não foi convidado", valor: 500, imagem: "images/meme9.jpg" },
  { titulo: "Resto do ano de manicure pra noiva", valor: 1000, imagem: "images/meme10.jpg" },
];

/* ===================================================================
   A partir daqui é lógica do site — normalmente não precisa mexer.
   =================================================================== */

const MESES_PT = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const DIAS_PT = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];

function formatarDataExtenso(date) {
  return `${date.getDate()} de ${MESES_PT[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatarDiaHora(date) {
  const dia = DIAS_PT[date.getDay()];
  const diaCap = dia.charAt(0).toUpperCase() + dia.slice(1);
  const horas = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${diaCap} às ${horas}h${min !== "00" ? min : ""}`;
}

// Usados no bloco de "data em destaque": dia bem grande, mês e hora
// menores embaixo (ex: "19" / "DE DEZEMBRO" / "ÀS 19H").
function formatarDiaNumero(date) {
  return String(date.getDate()).padStart(2, "0");
}
function formatarMesLabel(date) {
  return `de ${MESES_PT[date.getMonth()]}`;
}
function formatarHoraSimples(date) {
  const horas = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `às ${horas}h${min !== "00" ? min : ""}`;
}

function iniciais(nome) {
  return (nome || "?").trim().charAt(0).toUpperCase() || "?";
}

function primeiroNome(nome) {
  return (nome || "").trim().split(/\s+/)[0] || "";
}

// Nomes em WEDDING vêm em CAIXA ALTA; em fonte script (cursiva) texto
// todo maiúsculo fica ilegível, então aqui geramos uma versão "Título
// Case" só para exibir nos lugares com fonte script (ex: hero-names).
function paraTituloCase(nome) {
  return (nome || "")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
}

/* ---------- Preenche todos os campos [data-field] ---------- */
function popularCampos() {
  const weddingDate = new Date(WEDDING.dataISO);
  const monograma = `${iniciais(WEDDING.noiva)} & ${iniciais(WEDDING.noivo)}`;

  const valores = {
    noiva: WEDDING.noiva,
    noivo: WEDDING.noivo,
    noivaTitulo: paraTituloCase(WEDDING.noiva),
    noivoTitulo: paraTituloCase(WEDDING.noivo),
    envelopeNomesCurto: `${paraTituloCase(primeiroNome(WEDDING.noiva))} & ${paraTituloCase(primeiroNome(WEDDING.noivo))}`,
    monogram: monograma,
    dataExtenso: formatarDataExtenso(weddingDate),
    diaSemanaHora: formatarDiaHora(weddingDate),
    dataDia: formatarDiaNumero(weddingDate),
    dataMes: formatarMesLabel(weddingDate),
    horaSimples: formatarHoraSimples(weddingDate),
    cerimoniaHorario: WEDDING.cerimonia.horario,
    cerimoniaLocal: WEDDING.cerimonia.local,
    cerimoniaEndereco: WEDDING.cerimonia.endereco,
    recepcaoHorario: WEDDING.recepcao.horario,
    recepcaoLocal: WEDDING.recepcao.local,
    recepcaoEndereco: WEDDING.recepcao.endereco,
    pixKey: WEDDING.pixKey,
    pixNome: WEDDING.pixNome,
    rsvpPrazo: WEDDING.rsvpPrazo,
  };

  document.querySelectorAll("[data-field]").forEach((el) => {
    const key = el.getAttribute("data-field");
    if (valores[key] !== undefined) el.textContent = valores[key];
  });

  document.title = `${WEDDING.noiva} & ${WEDDING.noivo} — Nosso Casamento`;
}

/* ---------- Contagem regressiva ---------- */
function iniciarContagem() {
  const alvo = new Date(WEDDING.dataISO).getTime();
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");
  if (!elDays) return;

  function tick() {
    const agora = Date.now();
    let diff = Math.max(0, alvo - agora);

    const dias = Math.floor(diff / 86400000);
    diff -= dias * 86400000;
    const horas = Math.floor(diff / 3600000);
    diff -= horas * 3600000;
    const minutos = Math.floor(diff / 60000);
    diff -= minutos * 60000;
    const segundos = Math.floor(diff / 1000);

    elDays.textContent = String(dias).padStart(2, "0");
    elHours.textContent = String(horas).padStart(2, "0");
    elMinutes.textContent = String(minutos).padStart(2, "0");
    elSeconds.textContent = String(segundos).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

/* ---------- Envelope de abertura ---------- */
function configurarEnvelope() {
  const envelope = document.getElementById("envelope");
  const tela = document.getElementById("envelope-screen");
  const skip = document.getElementById("envelope-skip");
  if (!envelope || !tela) return;

  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const passaros = document.querySelector(".ring-birds");
  let abrindo = false;

  function revelarPagina() {
    tela.classList.add("hidden");
    document.body.classList.remove("locked");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  // Sequência: o laço desata e cai (~0.8s) e, ao mesmo tempo, as duas
  // metades do convite giram em 3D pra trás (tipo porta dupla abrindo de
  // verdade), com um clarão estourando no centro — revelando a página
  // real por trás assim que terminam de abrir (~1.3s no total).
  function abrir() {
    if (abrindo) return;
    abrindo = true;
    envelope.classList.add("is-open");
    iniciarMusica();
    if (passaros) passaros.classList.add("voando");

    if (reduzMovimento) {
      revelarPagina();
      return;
    }

    setTimeout(revelarPagina, 1350);
  }

  envelope.addEventListener("click", abrir);
  if (skip) {
    skip.addEventListener("click", (e) => {
      e.preventDefault();
      abrir();
    });
  }
}

/* ---------- Música de fundo ---------- */
function iniciarMusica() {
  const audio = document.getElementById("musica-fundo");
  const btn = document.getElementById("music-toggle");
  if (!audio) return;
  audio.play().catch(() => { /* navegador bloqueou; a pessoa pode tocar manual pelo botão */ });
  if (btn) btn.classList.remove("mudo");
}

function configurarMusica() {
  const audio = document.getElementById("musica-fundo");
  const btn = document.getElementById("music-toggle");
  if (!audio || !btn) return;

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      btn.classList.remove("mudo");
    } else {
      audio.pause();
      btn.classList.add("mudo");
    }
  });
}

/* ---------- Navbar visível ao rolar ---------- */
function configurarNavbar() {
  const nav = document.getElementById("navbar");
  const hero = document.getElementById("hero");
  if (!nav || !hero) return;

  window.addEventListener("scroll", () => {
    const limite = hero.offsetHeight * 0.6;
    nav.classList.toggle("visible", window.scrollY > limite);
  });
}

/* ---------- Botão voltar ao topo ---------- */
function configurarBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 600);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Animação de entrada ao rolar ---------- */
function configurarFadeUp() {
  const alvos = document.querySelectorAll(".fade-up:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  alvos.forEach((el) => observer.observe(el));
}

/* ---------- Links "Como chegar" (Google Maps) ---------- */
function configurarMapas() {
  const linkCerimonia = document.getElementById("cerimonia-maps");
  const linkRecepcao = document.getElementById("recepcao-maps");
  const url = (endereco) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
  if (linkCerimonia) linkCerimonia.href = url(WEDDING.cerimonia.endereco);
  if (linkRecepcao) linkRecepcao.href = url(WEDDING.recepcao.endereco);
}

/* ---------- Adicionar à agenda (.ics) ---------- */
function gerarICS({ titulo, descricao, local, inicioISO, duracaoHoras }) {
  const inicio = new Date(inicioISO);
  const fim = new Date(inicio.getTime() + duracaoHoras * 3600000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mini Site de Casamento//PT-BR",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@casamento`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(inicio)}`,
    `DTEND:${fmt(fim)}`,
    `SUMMARY:${titulo}`,
    `DESCRIPTION:${descricao}`,
    `LOCATION:${local}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${titulo.replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function configurarAgenda() {
  const btnCerimonia = document.getElementById("cerimonia-calendar");
  const btnRecepcao = document.getElementById("recepcao-calendar");

  if (btnCerimonia) {
    btnCerimonia.addEventListener("click", () => {
      gerarICS({
        titulo: `Casamento de ${WEDDING.noiva} e ${WEDDING.noivo} — Cerimônia`,
        descricao: "Cerimônia de casamento.",
        local: `${WEDDING.cerimonia.local}, ${WEDDING.cerimonia.endereco}`,
        inicioISO: WEDDING.dataISO,
        duracaoHoras: 1.5,
      });
    });
  }

  if (btnRecepcao) {
    btnRecepcao.addEventListener("click", () => {
      gerarICS({
        titulo: `Casamento de ${WEDDING.noiva} e ${WEDDING.noivo} — Recepção`,
        descricao: "Recepção e festa de casamento.",
        local: `${WEDDING.recepcao.local}, ${WEDDING.recepcao.endereco}`,
        inicioISO: WEDDING.dataISO,
        duracaoHoras: 5,
      });
    });
  }
}

/* ---------- RSVP via WhatsApp ---------- */
function configurarRSVP() {
  const link = document.getElementById("rsvp-whatsapp");
  if (!link) return;
  const mensagem = WEDDING.whatsappMensagem
    .replace("{noiva}", WEDDING.noiva)
    .replace("{noivo}", WEDDING.noivo);
  link.href = `https://wa.me/${WEDDING.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/* ---------- Geração do "Pix Copia e Cola" (payload BR Code / EMV) ---------- */
function removerAcentos(texto) {
  return (texto || "").normalize("NFD").replace(/\p{Mark}/gu, "");
}

// Campo no formato ID + tamanho (2 dígitos) + valor, como o padrão exige.
function tlvPix(id, valor) {
  const tamanho = String(valor.length).padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

// CRC16/CCITT-FALSE — checksum final exigido pelo QR Code Pix.
function crc16Pix(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// CPF/CNPJ (chave só com números, pontuada ou não) precisa ir sem
// pontuação no QR Code; e-mail, telefone e chave aleatória vão como estão.
function normalizarChavePix(chave) {
  const somenteDigitos = (chave || "").replace(/\D/g, "");
  if (somenteDigitos.length === 11 || somenteDigitos.length === 14) return somenteDigitos;
  return (chave || "").trim();
}

function gerarPayloadPix({ chave, nome, cidade, valor, txid }) {
  const nomeSanitizado = removerAcentos(nome).toUpperCase().slice(0, 25);
  const cidadeSanitizada = removerAcentos(cidade).toUpperCase().slice(0, 15);
  const txidSanitizado = (txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";

  const contaPix = tlvPix("00", "BR.GOV.BCB.PIX") + tlvPix("01", normalizarChavePix(chave));
  const valorFormatado = Number(valor).toFixed(2);

  let payload =
    tlvPix("00", "01") +
    tlvPix("26", contaPix) +
    tlvPix("52", "0000") +
    tlvPix("53", "986") +
    tlvPix("54", valorFormatado) +
    tlvPix("58", "BR") +
    tlvPix("59", nomeSanitizado) +
    tlvPix("60", cidadeSanitizada) +
    tlvPix("62", tlvPix("05", txidSanitizado));

  payload += "6304";
  return payload + crc16Pix(payload);
}

/* ---------- Lista de presentes (grade + modal com QR Code Pix) ---------- */
function configurarPresentes() {
  const grid = document.getElementById("gift-grid");
  const modal = document.getElementById("pix-modal");
  if (!grid || !modal) return;

  const tituloEl = document.getElementById("pix-modal-titulo");
  const valorEl = document.getElementById("pix-modal-valor");
  const qrEl = document.getElementById("pix-qrcode");
  const textoEl = document.getElementById("pix-copy-texto");
  const closeBtn = document.getElementById("pix-modal-close");
  const copyBtn = document.getElementById("pix-copy-btn");
  const feedback = document.getElementById("pix-feedback");

  grid.innerHTML = LISTA_PRESENTES.map((item, i) => {
    const ehFoto = /^images\//.test(item.imagem);
    const media = ehFoto
      ? `<img src="${item.imagem}" alt="${item.titulo}">`
      : `<span class="gift-emoji">${item.imagem}</span>`;
    return `
      <button type="button" class="gift-item fade-up" data-index="${i}">
        <span class="gift-item-media">${media}</span>
        <span class="gift-item-titulo">${item.titulo}</span>
        <span class="gift-item-valor">R$ ${item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
      </button>`;
  }).join("");

  function abrirModal(item) {
    tituloEl.textContent = item.titulo;
    valorEl.textContent = `R$ ${item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

    const payload = gerarPayloadPix({
      chave: WEDDING.pixKey,
      nome: WEDDING.pixNome,
      cidade: WEDDING.pixCidade,
      valor: item.valor,
      txid: item.titulo,
    });
    textoEl.value = payload;

    qrEl.innerHTML = "";
    const qr = qrcode(0, "M");
    qr.addData(payload);
    qr.make();
    qrEl.innerHTML = qr.createSvgTag({ scalable: true });

    modal.classList.add("open");
  }

  grid.querySelectorAll(".gift-item").forEach((el) => {
    el.addEventListener("click", () => abrirModal(LISTA_PRESENTES[Number(el.dataset.index)]));
  });

  function fechar() {
    modal.classList.remove("open");
    if (feedback) feedback.textContent = "";
  }
  if (closeBtn) closeBtn.addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textoEl.value);
      } catch (e) {
        // Fallback para navegadores/contextos sem permissão de clipboard (ex: file://)
        textoEl.removeAttribute("readonly");
        textoEl.select();
        try { document.execCommand("copy"); } catch (err) { /* ignora */ }
        textoEl.setAttribute("readonly", "true");
      }
      if (feedback) {
        feedback.textContent = "Código Pix copiado!";
        setTimeout(() => (feedback.textContent = ""), 2200);
      }
    });
  }
}

/* ---------- Galeria + Lightbox ---------- */
function configurarGaleria() {
  const grid = document.getElementById("gallery-grid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  if (!grid || !lightbox) return;

  grid.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (!img) return; // placeholders sem foto real não abrem o lightbox
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightbox.classList.add("open");
    });
  });

  function fechar() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  }
  if (closeBtn) closeBtn.addEventListener("click", fechar);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });
}

/* ---------- Vídeo 360° do local (botão "Local") ---------- */
function configurarVideoLocal() {
  const btn = document.getElementById("btn-video-local");
  const modal = document.getElementById("video-modal");
  const video = document.getElementById("video-local");
  const closeBtn = document.getElementById("video-modal-close");
  if (!btn || !modal || !video) return;

  // O vídeo é mudo (veja o atributo "muted" no index.html) — a música
  // do convite continua tocando no fundo normalmente, sem pausar.
  function abrir() {
    modal.classList.add("open");
    video.currentTime = 0;
    video.play().catch(() => {});
  }
  function fechar() {
    modal.classList.remove("open");
    video.pause();
  }

  btn.addEventListener("click", abrir);
  if (closeBtn) closeBtn.addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fechar();
  });
  video.addEventListener("ended", fechar);
}

/* ---------- Inicialização ---------- */
document.addEventListener("DOMContentLoaded", () => {
  popularCampos();
  iniciarContagem();
  configurarEnvelope();
  configurarMusica();
  configurarNavbar();
  configurarBackToTop();
  configurarMapas();
  configurarAgenda();
  configurarRSVP();
  configurarPresentes();
  configurarGaleria();
  configurarVideoLocal();
  configurarFadeUp();
});
