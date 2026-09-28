(() => {
  "use strict";

  const app = document.querySelector(".app");
  const chat = document.getElementById("chat");
  const messagesEl = document.getElementById("messages");
  const emptyState = document.getElementById("emptyState");
  const form = document.getElementById("composerForm");
  const input = document.getElementById("messageInput");
  const btnSend = document.getElementById("btnSend");
  const btnNewChat = document.getElementById("btnNewChat");
  const btnToggleSidebar = document.getElementById("btnToggleSidebar");
  const historyList = document.getElementById("historyList");
  const topbarStatus = document.getElementById("topbarStatus");

  const STORAGE_KEY = "nexus.conversations";
  let conversations = carregarConversas();
  let conversaAtualId = null;
  let gerandoResposta = false;

  // ---------- Persistencia local (apenas no navegador do usuario) ----------
  function carregarConversas() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function salvarConversas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }

  function conversaAtual() {
    return conversations.find((c) => c.id === conversaAtualId);
  }

  // ---------- Renderizacao da barra lateral ----------
  function renderHistorico() {
    historyList.innerHTML = "";
    conversations
      .slice()
      .reverse()
      .forEach((c, index) => {
        const item = document.createElement("div");
        item.className = "history-item" + (c.id === conversaAtualId ? " active" : "");
        item.style.animationDelay = `${index * 25}ms`;
        item.textContent = c.titulo || "Nova conversa";
        item.addEventListener("click", () => abrirConversa(c.id));
        historyList.appendChild(item);
      });
  }

  function abrirConversa(id) {
    conversaAtualId = id;
    const c = conversaAtual();
    messagesEl.innerHTML = "";
    if (!c || c.mensagens.length === 0) {
      emptyState.style.display = "";
    } else {
      emptyState.style.display = "none";
      c.mensagens.forEach((m) => renderMensagem(m.role, m.content, false));
    }
    renderHistorico();
  }

  function novaConversa() {
    const c = { id: crypto.randomUUID(), titulo: "Nova conversa", mensagens: [] };
    conversations.push(c);
    conversaAtualId = c.id;
    salvarConversas();
    abrirConversa(c.id);
    input.focus();
  }

  // ---------- Renderizacao de mensagens ----------
  function renderMensagem(role, content, animar = true) {
    emptyState.style.display = "none";

    const msg = document.createElement("div");
    msg.className = `msg ${role}`;
    if (!animar) msg.style.animation = "none";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = role === "user" ? "EU" : "AI";

    const body = document.createElement("div");
    body.className = "msg-body";

    const roleLabel = document.createElement("div");
    roleLabel.className = "msg-role";
    roleLabel.textContent = role === "user" ? "Voce" : "Nexus";

    const contentEl = document.createElement("div");
    contentEl.className = "msg-content";
    contentEl.textContent = content;

    body.appendChild(roleLabel);
    body.appendChild(contentEl);
    msg.appendChild(avatar);
    msg.appendChild(body);
    messagesEl.appendChild(msg);

    chat.scrollTo({ top: chat.scrollHeight, behavior: animar ? "smooth" : "auto" });
    return contentEl;
  }

  function renderIndicadorDigitando() {
    const msg = document.createElement("div");
    msg.className = "msg assistant";
    msg.id = "thinkingMsg";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = "AI";

    const body = document.createElement("div");
    body.className = "msg-body";
    body.innerHTML = `
      <div class="msg-role">Nexus</div>
      <div class="thinking">
        <span class="wave-bar"></span><span class="wave-bar"></span>
        <span class="wave-bar"></span><span class="wave-bar"></span><span class="wave-bar"></span>
      </div>`;

    msg.appendChild(avatar);
    msg.appendChild(body);
    messagesEl.appendChild(msg);
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  }

  function removerIndicadorDigitando() {
    document.getElementById("thinkingMsg")?.remove();
  }

  // ---------- Efeito de "digitacao" ao exibir a resposta ----------
  function digitarTexto(elemento, textoFinal, callback) {
    let i = 0;
    const velocidade = Math.max(4, Math.min(18, 1200 / textoFinal.length));
    (function passo() {
      elemento.textContent = textoFinal.slice(0, i);
      chat.scrollTo({ top: chat.scrollHeight, behavior: "auto" });
      i += Math.ceil(textoFinal.length / 120) || 1;
      if (i < textoFinal.length) {
        setTimeout(passo, velocidade);
      } else {
        elemento.textContent = textoFinal;
        callback?.();
      }
    })();
  }

  // ---------- Estado visual de "gerando resposta" ----------
  function setGerando(valor) {
    gerandoResposta = valor;
    btnSend.classList.toggle("generating", valor);
    btnSend.disabled = valor ? false : input.value.trim().length === 0;
    topbarStatus.innerHTML = valor
      ? `<span class="status-dot busy"></span><span>Gerando resposta...</span>`
      : `<span class="status-dot"></span><span>Pronto</span>`;
  }

  // ---------- Envio ----------
  async function enviarMensagem(texto) {
    if (!conversaAtualId) novaConversa();
    const c = conversaAtual();

    if (c.mensagens.length === 0) {
      c.titulo = texto.slice(0, 42) + (texto.length > 42 ? "..." : "");
    }

    c.mensagens.push({ role: "user", content: texto });
    salvarConversas();
    renderMensagem("user", texto);
    renderHistorico();

    setGerando(true);
    renderIndicadorDigitando();

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: texto,
          history: c.mensagens.slice(0, -1),
        }),
      });

      removerIndicadorDigitando();

      if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}));
        throw new Error(erro.erro || `Erro HTTP ${resposta.status}`);
      }

      const dados = await resposta.json();
      const conteudoEl = renderMensagem("assistant", "");
      digitarTexto(conteudoEl, dados.reply || "(resposta vazia)", () => setGerando(false));

      c.mensagens.push({ role: "assistant", content: dados.reply || "" });
      salvarConversas();
    } catch (erro) {
      removerIndicadorDigitando();
      renderMensagem("assistant", `Nao foi possivel obter resposta: ${erro.message}`);
      setGerando(false);
    }
  }

  // ---------- Eventos de UI ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || gerandoResposta) return;
    input.value = "";
    ajustarAlturaTextarea();
    btnSend.disabled = true;
    enviarMensagem(texto);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  input.addEventListener("input", () => {
    ajustarAlturaTextarea();
    btnSend.disabled = gerandoResposta ? false : input.value.trim().length === 0;
  });

  function ajustarAlturaTextarea() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 180) + "px";
  }

  document.querySelectorAll(".suggestion-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.text;
      ajustarAlturaTextarea();
      btnSend.disabled = false;
      form.requestSubmit();
    });
  });

  btnNewChat.addEventListener("click", novaConversa);

  btnToggleSidebar.addEventListener("click", () => {
    if (window.innerWidth <= 860) {
      app.classList.toggle("sidebar-open");
    } else {
      app.classList.toggle("sidebar-collapsed");
    }
  });

  // ---------- Inicializacao ----------
  if (conversations.length === 0) {
    novaConversa();
  } else {
    conversaAtualId = conversations[conversations.length - 1].id;
    abrirConversa(conversaAtualId);
  }
})();
