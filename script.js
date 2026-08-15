const WHATSAPP = "5511979937423";
const STORAGE_KEY = "artesanal_carrinho";
let carrinho = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const money = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const $ = (s) => document.querySelector(s);
const salvar = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));

function contador() {
  const n = carrinho.reduce((s, i) => s + i.quantidade, 0);
  document.querySelectorAll("#cart-count").forEach((e) => (e.textContent = n));
}

function toast(m) {
  const e = $("#toast");
  if (!e) return;
  e.textContent = m;
  e.classList.add("show");
  clearTimeout(window.tt);
  window.tt = setTimeout(() => e.classList.remove("show"), 2200);
}

function produto(id) {
  return produtos.find((p) => p.id === Number(id));
}

function adicionar(id) {
  const p = produto(id);
  const i = carrinho.find((x) => x.id === p.id);
  i ? i.quantidade++ : carrinho.push({ id: p.id, quantidade: 1 });
  salvar();
  contador();
  renderCarrinho();
  toast(`${p.nome} adicionado ao carrinho!`);
}

function alterar(id, d) {
  const i = carrinho.find((x) => x.id === Number(id));
  if (!i) return;
  i.quantidade += d;
  if (i.quantidade <= 0) carrinho = carrinho.filter((x) => x.id !== Number(id));
  salvar();
  contador();
  renderCarrinho();
}

function remover(id) {
  carrinho = carrinho.filter((x) => x.id !== Number(id));
  salvar();
  contador();
  renderCarrinho();
}

function limpar() {
  carrinho = [];
  salvar();
  contador();
  renderCarrinho();
  toast("Carrinho limpo.");
}

function total() {
  return carrinho.reduce((s, i) => {
    const p = produto(i.id);
    return s + (p ? p.preco * i.quantidade : 0);
  }, 0);
}

function card(p) {
  return `<article class="product-card">
    <div class="product-image">
      <img src="${p.imagem}" alt="${p.nome}" onerror="this.style.display='none';this.parentElement.classList.add('no-image')">
      <span class="product-placeholder">${p.emoji}</span>
    </div>
    <div class="product-body">
      <span class="product-category">${p.categoria === "brownie" ? "BROWNIE" : "TORTA"}</span>
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
      <div class="product-bottom">
        <div>
          <small>Preço</small>
          <strong>${money(p.preco)}</strong>
        </div>
        <button class="btn btn-small btn-add" data-id="${p.id}">+ Adicionar</button>
      </div>
    </div>
  </article>`;
}

function renderProdutos(id, filtro) {
  const c = document.getElementById(id);
  if (!c) return;
  c.innerHTML = produtos
    .filter((p) => p.categoria === filtro)
    .map(card)
    .join("");
  c.querySelectorAll(".btn-add").forEach(
    (b) => (b.onclick = () => adicionar(b.dataset.id))
  );
}

function renderDestaques() {
  const c = $("#featured-products");
  if (!c) return;
  c.innerHTML = produtos.slice(0, 4).map(card).join("");
  c.querySelectorAll(".btn-add").forEach(
    (b) => (b.onclick = () => adicionar(b.dataset.id))
  );
}

function renderCarrinho() {
  const c = $("#cart-items");
  if (!c) return;

  if (!carrinho.length) {
    c.innerHTML = `<div class="empty-cart">
      <div>🛒</div>
      <h2>Seu carrinho está vazio</h2>
      <p>Escolha um brownie ou uma torta e bora adoçar o dia.</p>
      <a class="btn btn-primary" href="cardapio.html">Ver cardápio</a>
    </div>`;
  } else {
    c.innerHTML = carrinho
      .map((i) => {
        const p = produto(i.id);
        return `<article class="cart-item">
          <div class="cart-item-image">
            <img src="${p.imagem}" alt="${p.nome}" onerror="this.style.display='none'">
            <span>${p.emoji}</span>
          </div>
          <div class="cart-item-info">
            <span>${p.categoria === "brownie" ? "BROWNIE" : "TORTA"}</span>
            <h3>${p.nome}</h3>
            <small>${money(p.preco)} por unidade</small>
          </div>
          <div class="cart-item-actions">
            <div class="quantity">
              <button onclick="alterar(${p.id},-1)">−</button>
              <strong>${i.quantidade}</strong>
              <button onclick="alterar(${p.id},1)">+</button>
            </div>
            <strong class="item-total">${money(p.preco * i.quantidade)}</strong>
            <button class="remove" onclick="remover(${p.id})">Remover</button>
          </div>
        </article>`;
      })
      .join("");
  }

  if ($("#cart-subtotal")) $("#cart-subtotal").textContent = money(total());
  if ($("#cart-total")) $("#cart-total").textContent = money(total());
}

function checkout() {
  if (!carrinho.length) return toast("Seu carrinho está vazio.");

  const nome = $("#customer-name")?.value.trim();
  const tel = $("#customer-phone")?.value.trim();
  const obs = $("#customer-note")?.value.trim();

  if (!nome) {
    toast("Digite seu nome para continuar.");
    $("#customer-name")?.focus();
    return;
  }

  const itens = carrinho.map((i) => {
    const p = produto(i.id);
    return `• ${i.quantidade}x ${p.nome} — ${money(p.preco * i.quantidade)}`;
  });

  let m = `Olá! Vim pelo site da *Artesanal Brownies & Tortas*\n\n*Nome:* ${nome}\n`;
  if (tel) m += `*Telefone:* ${tel}\n`;
  m += `\n*Pedido:*\n${itens.join("\n")}\n\n*TOTAL: ${money(total())}*\n`;
  if (obs) m += `\n*Observação:* ${obs}\n`;
  m += `\nGostaria de confirmar meu pedido e combinar a entrega/retirada.`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m)}`, "_blank");
}

function menu() {
  const b = $("#hamburger"),
    n = $("#nav");
  if (!b || !n) return;
  b.onclick = () => {
    n.classList.toggle("open");
    b.textContent = n.classList.contains("open") ? "✕" : "☰";
  };
}

function whatsapp() {
  const m =
    "Olá! Vim pelo site da Artesanal Brownies & Tortas e gostaria de fazer um pedido. 🍫";
  document
    .querySelectorAll("[data-whatsapp]")
    .forEach((a) => (a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m)}`));
}

document.addEventListener("DOMContentLoaded", () => {
  contador();
  menu();
  whatsapp();
  if ($("#year")) $("#year").textContent = new Date().getFullYear();
  renderDestaques();
  renderProdutos("brownies-products", "brownie");
  renderProdutos("tortas-products", "torta");
  renderCarrinho();
  $("#clear-cart")?.addEventListener("click", limpar);
  $("#checkout")?.addEventListener("click", checkout);
});