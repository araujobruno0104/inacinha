const search = document.getElementById("search");
const botoesCategoria = document.querySelectorAll(".categoria-btn");
const produtos = document.querySelectorAll(".card");
const cartFab = document.getElementById("cart-fab");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalValue = document.getElementById("cart-total-value");
const cartCount = document.getElementById("cart-count");
const sendOrderBtn = document.getElementById("send-order");
const clientNameInput = document.getElementById("client-name");

let categoriaSelecionada = "todos";
const carrinho = {};

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function parsePreco(textoPreco) {
  const limpo = textoPreco
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(limpo) || 0;
}

function detectarCategoria(nomeProduto) {
  const nome = normalizarTexto(nomeProduto);

  if (nome.includes("perfume")) return "perfumes";
  if (
    nome.includes("paleta") ||
    nome.includes("batom") ||
    nome.includes("delineador") ||
    nome.includes("esponja") ||
    nome.includes("pincel") ||
    nome.includes("po compacto") ||
    nome.includes("maqui")
  ) {
    return "maquiagem";
  }
  if (nome.includes("bolsa") || nome.includes("carteira") || nome.includes("porta cartao")) {
    return "bolsas";
  }
  if (
    nome.includes("pulseira") ||
    nome.includes("colar") ||
    nome.includes("brinco") ||
    nome.includes("anel") ||
    nome.includes("semi joia") ||
    nome.includes("joia")
  ) {
    return "joias";
  }
  if (
    nome.includes("usb") ||
    nome.includes("led") ||
    nome.includes("caixa de som") ||
    nome.includes("lanterna") ||
    nome.includes("carregador")
  ) {
    return "eletronicos";
  }
  if (
    nome.includes("copo") ||
    nome.includes("garrafa") ||
    nome.includes("marmita") ||
    nome.includes("mini processador") ||
    nome.includes("massageador")
  ) {
    return "utilidades";
  }
  return "acessorios";
}

produtos.forEach((produto) => {
  const nome = produto.querySelector("h3")?.textContent || "";
  if (!produto.dataset.categoria) {
    produto.dataset.categoria = detectarCategoria(nome);
  }

  const botao = produto.querySelector(".botao");
  if (botao) {
    botao.textContent = "Adicionar ao carrinho";
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      adicionarAoCarrinho(produto);
    });
  }
});

function filtrarProdutos() {
  const texto = normalizarTexto(search?.value || "");

  produtos.forEach((produto) => {
    const nome = normalizarTexto(produto.querySelector("h3")?.textContent || "");
    const categoriaDoProduto = produto.dataset.categoria;
    const bateBusca = nome.includes(texto);
    const bateCategoria =
      categoriaSelecionada === "todos" || categoriaDoProduto === categoriaSelecionada;

    produto.style.display = bateBusca && bateCategoria ? "flex" : "none";
  });
}

function adicionarAoCarrinho(card) {
  const nome = card.querySelector("h3")?.textContent?.trim() || "Produto";
  const precoTexto = card.querySelector(".preco")?.textContent || "R$ 0,00";
  const preco = parsePreco(precoTexto);

  if (!carrinho[nome]) {
    carrinho[nome] = { nome, preco, quantidade: 0 };
  }

  carrinho[nome].quantidade += 1;
  renderCarrinho();
}

function atualizarQuantidade(nome, novaQuantidade) {
  if (!carrinho[nome]) return;

  if (novaQuantidade <= 0) {
    delete carrinho[nome];
  } else {
    carrinho[nome].quantidade = novaQuantidade;
  }
  renderCarrinho();
}

function renderCarrinho() {
  const itens = Object.values(carrinho);
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValor = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  cartCount.textContent = String(totalItens);
  cartTotalValue.textContent = formatarPreco(totalValor);

  if (itens.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
    return;
  }

  cartItemsContainer.innerHTML = itens
    .map((item) => {
      return `
      <div class="cart-item">
        <div class="cart-item-top">
          <strong>${item.nome}</strong>
          <span>${formatarPreco(item.preco * item.quantidade)}</span>
        </div>
        <small>${formatarPreco(item.preco)} cada</small>
        <div class="cart-item-actions">
          <button type="button" data-action="menos" data-nome="${item.nome}">-</button>
          <span>Qtd: ${item.quantidade}</span>
          <button type="button" data-action="mais" data-nome="${item.nome}">+</button>
          <button type="button" data-action="remover" data-nome="${item.nome}">Remover</button>
        </div>
      </div>`;
    })
    .join("");
}

function abrirCarrinho() {
  cartPanel.classList.add("ativo");
  cartOverlay.classList.add("ativo");
  cartPanel.setAttribute("aria-hidden", "false");
  cartOverlay.setAttribute("aria-hidden", "false");
}

function fecharCarrinho() {
  cartPanel.classList.remove("ativo");
  cartOverlay.classList.remove("ativo");
  cartPanel.setAttribute("aria-hidden", "true");
  cartOverlay.setAttribute("aria-hidden", "true");
}

function pegarNumeroWhatsApp() {
  const link = document.querySelector(".whatsapp")?.getAttribute("href") || "";
  const match = link.match(/wa\.me\/(\d+)/);
  return match?.[1] || "5534999468554";
}

function enviarPedidoWhatsApp() {
  const itens = Object.values(carrinho);
  if (itens.length === 0) {
    alert("Adicione pelo menos um item no carrinho.");
    return;
  }

  const nomeCliente = clientNameInput.value.trim();
  if (!nomeCliente) {
    alert("Por favor, informe seu nome para enviar o pedido.");
    clientNameInput.focus();
    return;
  }

  const totalValor = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const linhasItens = itens
    .map((item) => `- ${item.nome} | Qtd: ${item.quantidade} | ${formatarPreco(item.preco * item.quantidade)}`)
    .join("\n");

  const mensagem = `Olá! Meu nome é ${nomeCliente}.\nQuero fazer este pedido:\n${linhasItens}\nTotal: ${formatarPreco(totalValor)}`;
  const numero = pegarNumeroWhatsApp();
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}

search?.addEventListener("keyup", filtrarProdutos);

botoesCategoria.forEach((botao) => {
  botao.addEventListener("click", () => {
    categoriaSelecionada = botao.dataset.categoria || "todos";

    botoesCategoria.forEach((item) => item.classList.remove("ativo"));
    botao.classList.add("ativo");

    filtrarProdutos();
  });
});

cartFab?.addEventListener("click", abrirCarrinho);
cartClose?.addEventListener("click", fecharCarrinho);
cartOverlay?.addEventListener("click", fecharCarrinho);
sendOrderBtn?.addEventListener("click", enviarPedidoWhatsApp);

cartItemsContainer?.addEventListener("click", (evento) => {
  const alvo = evento.target;
  if (!(alvo instanceof HTMLButtonElement)) return;

  const nome = alvo.dataset.nome;
  const action = alvo.dataset.action;
  if (!nome || !action || !carrinho[nome]) return;

  if (action === "menos") atualizarQuantidade(nome, carrinho[nome].quantidade - 1);
  if (action === "mais") atualizarQuantidade(nome, carrinho[nome].quantidade + 1);
  if (action === "remover") atualizarQuantidade(nome, 0);
});

filtrarProdutos();
renderCarrinho();
