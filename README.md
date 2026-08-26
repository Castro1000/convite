# Mini Site de Casamento

Site estático (HTML + CSS + JS puro, sem build, sem dependências externas)
inspirado em convites digitais elegantes/românticos: abertura em envelope,
selo dourado, contagem regressiva, história do casal, cerimônia/recepção,
dress code, padrinhos, galeria de fotos, lista de presentes via Pix e
confirmação de presença via WhatsApp.

Funciona **100% offline**: as fontes ficam salvas dentro do próprio site
(pasta `fonts/`), então dá pra abrir o `index.html` direto no navegador,
sem internet, e também hospedar normalmente.

## Estrutura de arquivos

```
wedding-site/
├── index.html          → estrutura e textos do site
├── css/style.css        → visual (cores, fontes, layout, animações)
├── js/script.js         → contagem regressiva, envelope, RSVP, Pix etc.
│                           TEM O OBJETO "WEDDING" NO TOPO — comece por aqui!
├── fonts/                → fontes baixadas localmente (Playfair Display,
│                           Great Vibes, Montserrat) — não apaga
├── images/               → suas fotos entram aqui (veja LEIA-ME.txt)
└── README.md             → este arquivo
```

## Passo 1 — Edite as informações principais

Abra **`js/script.js`** e edite o objeto `WEDDING` no topo do arquivo:

- `noiva` / `noivo` — nomes do casal
- `dataISO` — data e hora do casamento (usada na contagem regressiva)
- `rsvpPrazo` — prazo para confirmar presença
- `cerimonia` / `recepcao` — horário, nome do local e endereço
- `whatsapp` — número para receber as confirmações (só números, com DDI+DDD)
- `whatsappMensagem` — mensagem que já vem pronta no WhatsApp
- `pixKey` / `pixNome` — dados para presentear via Pix

Assim que você salvar esse arquivo, o site inteiro atualiza sozinho —
o envelope, o topo, a contagem, os botões de "como chegar" e "adicionar
à agenda", o RSVP e o Pix. **Você não precisa mexer em mais nada pra
esses dados.**

## Passo 2 — Personalize os textos mais longos

Esses ficam direto no `index.html`, em blocos com o comentário
`EDITE AQUI` (procure por essa palavra no arquivo, Ctrl+F):

- **Nossa história** — os 4 marcos da linha do tempo (pode adicionar/remover)
- **Dress code** — texto e cores sugeridas
- **Padrinhos e madrinhas** — nomes e papéis (ou apague a seção toda)

## Passo 3 — Adicione as fotos reais

Veja `images/LEIA-ME.txt` — é só copiar as fotos para a pasta `images/`
e trocar os placeholders da galeria por tags `<img>`.

## Passo 4 — Teste offline antes de publicar

Dê duplo clique no arquivo `index.html` — ele abre no navegador, sem
precisar de internet nem servidor. Ótimo para testar em lugares com
sinal fraco, ou mandar o site direto por WhatsApp/pendrive.

## Passo 5 — Publicar no Render (hospedagem gratuita)

1. Suba esta pasta para um repositório no GitHub (ou GitLab).
2. No Render (render.com), clique em **New +** → **Static Site**.
3. Conecte o repositório.
4. Configurações de build:
   - **Build Command:** deixe em branco (não precisa)
   - **Publish Directory:** `.` (a raiz do projeto, onde está o index.html)
5. Clique em **Create Static Site**. Em 1–2 minutos o Render te dá um link
   tipo `https://seu-casamento.onrender.com` — pode compartilhar direto
   ou apontar um domínio próprio (ex: `amandaeerick.com.br`) nas
   configurações do Render, se você tiver um.

Toda vez que você editar os arquivos e enviar (`git push`) pro
repositório, o Render atualiza o site sozinho.

## Continuando a editar pelo Claude Code (VSCode)

O projeto foi organizado de propósito para ser fácil de continuar por lá:
- Peça ajustes de **conteúdo** citando o objeto `WEDDING` em `js/script.js`.
- Peça ajustes de **visual** (cores, fontes, espaçamento) citando as
  variáveis no topo de `css/style.css` (bloco `:root`).
- Peça novas seções ou mudanças de estrutura citando `index.html`.

Qualquer coisa, é só descrever o que quer mudar que o Claude no VSCode
já sabe onde mexer.
