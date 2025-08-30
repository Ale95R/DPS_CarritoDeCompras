// Helpers básicos ($ y $$)
if (!window.$) {
  window.$ = (sel) => document.querySelector(sel);
}
if (!window.$$) {
  window.$$ = (sel) => document.querySelectorAll(sel);
}

// Captura global de errores (no dejar página en blanco)
window.addEventListener("error", (e) => {
  const msg = e?.error?.message || e.message || "Error desconocido";
  try {
    window.Swal
      ? Swal.fire({ icon: "error", title: "Error en la página", text: msg })
      : alert("Error: " + msg);
  } catch {}
  console.error("GlobalError:", e?.error || e);
});

// ==== Utilidades y notificaciones ====
const fmt = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const notify = {
  error: (m) =>
    window.Swal
      ? Swal.fire({ icon: "error", title: "Error", text: m })
      : alert(m),
  success: (m) =>
    window.Swal
      ? Swal.fire({
          icon: "success",
          title: "Listo",
          text: m,
          timer: 1400,
          showConfirmButton: false,
        })
      : alert(m),
  toast: (m, icon = "success") => {
    if (window.Swal) {
      const T = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      T.fire({ icon, title: m });
    } else console.log(icon.toUpperCase() + ": " + m);
  },
  confirm: (m) =>
    window.Swal
      ? Swal.fire({
          icon: "question",
          title: "¿Confirmar?",
          text: m,
          showCancelButton: true,
          confirmButtonText: "Sí",
          cancelButtonText: "Cancelar",
        })
      : Promise.resolve({ isConfirmed: confirm(m) }),
};

// ==== Datos (productos embebidos, SIN data.json) ====
const initialProducts = [
  {
    id: 1,
    name: "Pistachio Baklava",
    price: 4.0,
    stock: 10,
    img: "assets/images/image-baklava-desktop.jpg",
  },
  {
    id: 2,
    name: "Waffle with Berries",
    price: 6.5,
    stock: 8,
    img: "assets/images/image-waffle-desktop.jpg",
  },
  {
    id: 3,
    name: "Vanilla Bean Crème Brûlée",
    price: 7.0,
    stock: 5,
    img: "assets/images/image-creme-brulee-desktop.jpg",
  },
  {
    id: 4,
    name: "Macaron",
    price: 8.0,
    stock: 12,
    img: "assets/images/image-macaron-desktop.jpg",
  },
  {
    id: 5,
    name: "Classic Tiramisu",
    price: 5.5,
    stock: 9,
    img: "assets/images/image-tiramisu-desktop.jpg",
  },
  {
    id: 6,
    name: "Meringue Pie",
    price: 5.0,
    stock: 7,
    img: "assets/images/image-meringue-desktop.jpg",
  },
  {
    id: 7,
    name: "Cake",
    price: 4.5,
    stock: 6,
    img: "assets/images/image-cake-desktop.jpg",
  },
  {
    id: 8,
    name: "Salted Caramel Brownie",
    price: 5.5,
    stock: 10,
    img: "assets/images/image-brownie-desktop.jpg",
  },
  {
    id: 9,
    name: "Vanilla Panna Cotta",
    price: 6.5,
    stock: 8,
    img: "assets/images/image-panna-cotta-desktop.jpg",
  },
];

let cart = JSON.parse(localStorage.getItem("desserts_cart_v1") || "[]");
const products = window.structuredClone
  ? structuredClone(initialProducts)
  : JSON.parse(JSON.stringify(initialProducts)); // fallback

// ==== Referencias DOM ====
const list = $("#product-list");
const resultsMsg = $("#resultsMsg");
const cartList = $("#cart-items");
const cartTotal = $("#cart-total");

// ==== Lógica de stock y render ====
const availableStock = (p) =>
  Math.max(0, p.stock - (cart.find((i) => i.id === p.id)?.quantity || 0));

const productCard = (p) => {
  const stockAvail = availableStock(p);
  const disabled = stockAvail === 0 ? "disabled" : "";
  return `
    <article class="card" data-id="${p.id}">
      <img class="product__img" src="${p.img}" alt="${
    p.name
  }" onerror="this.src='https://picsum.photos/seed/dessert${p.id}/640/480'"/>
      <div class="pad">
        <h3 style="margin:0 0 6px 0;font-size:18px">${p.name}</h3>
        <div class="row"><span class="price">${fmt.format(
          p.price
        )}</span><span class="muted">Stock: ${stockAvail}</span></div>
        <div class="row" style="margin-top:10px">
          <div class="qty">
            <label for="qty-${p.id}" class="visually-hidden">Cantidad</label>
            <input id="qty-${
              p.id
            }" type="number" min="1" value="1" max="${stockAvail}" ${disabled} />
          </div>
          <button class="btn primary add" type="button" ${disabled}>Agregar</button>
        </div>
      </div>
    </article>`;
};

function renderProducts(filter = "") {
  const norm = filter.trim().toLowerCase();
  const filtered = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(norm)
  );
  list.innerHTML = filtered.map(productCard).join("");
  resultsMsg.textContent = norm
    ? `Resultados para "${filter}" (${filtered.length})`
    : "Todos los productos";
}

function saveCart() {
  localStorage.setItem("desserts_cart_v1", JSON.stringify(cart));
}

function line(item) {
  const lineTotal = item.price * item.quantity;
  return `
    <li class="cart-li" data-id="${item.id}">
      <img class="thumb" src="${item.img}" alt="${
    item.name
  }" onerror="this.src='https://picsum.photos/seed/cart${item.id}/160/120'"/>
      <div>
        <strong>${item.name}</strong>
        <div class="cart-meta muted">${item.quantity} × ${fmt.format(
    item.price
  )} = <strong>${fmt.format(lineTotal)}</strong></div>
        <div class="actions" style="margin-top:6px">
          <button class="btn icon dec" type="button" aria-label="Quitar uno">−</button>
          <input class="qtyInput" type="number" min="1" value="${
            item.quantity
          }" />
          <button class="btn icon inc" type="button" aria-label="Agregar uno">+</button>
          <button class="btn icon rm" type="button" aria-label="Eliminar">❌</button>
        </div>
      </div>
      <div class="price">${fmt.format(lineTotal)}</div>
    </li>`;
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = "";
    $("#cart-empty").style.display = "block";
    cartTotal.textContent = fmt.format(0);
    return;
  }
  $("#cart-empty").style.display = "none";
  cartList.innerHTML = cart.map(line).join("");
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  cartTotal.textContent = fmt.format(total);
}

// ==== Eventos del catálogo ====
list.addEventListener("click", (e) => {
  const btn = e.target.closest("button.add");
  if (!btn) return;
  const card = e.target.closest("[data-id]");
  const id = Number(card.dataset.id);
  const product = products.find((p) => p.id === id);
  const qty =
    parseInt(card.querySelector('input[type="number"]').value, 10) || 1;
  if (qty > availableStock(product)) {
    notify.error("No hay suficiente stock disponible.");
    return;
  }
  const it = cart.find((i) => i.id === id);
  if (it) it.quantity += qty;
  else cart.push({ ...product, quantity: qty });
  saveCart();
  renderCart();
  renderProducts($("#search").value);
});

// ==== Eventos del carrito ====
cartList.addEventListener("click", (e) => {
  const li = e.target.closest(".cart-li");
  if (!li) return;
  const id = Number(li.dataset.id);
  if (e.target.closest(".rm")) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
    renderCart();
    renderProducts($("#search").value);
    return;
  }
  if (e.target.closest(".inc")) {
    const it = cart.find((i) => i.id === id);
    it.quantity++;
    saveCart();
    renderCart();
    renderProducts($("#search").value);
    return;
  }
  if (e.target.closest(".dec")) {
    const it = cart.find((i) => i.id === id);
    it.quantity = Math.max(1, it.quantity - 1);
    saveCart();
    renderCart();
    renderProducts($("#search").value);
    return;
  }
});
cartList.addEventListener("change", (e) => {
  const input = e.target.closest(".qtyInput");
  if (!input) return;
  const li = e.target.closest(".cart-li");
  const id = Number(li.dataset.id);
  const it = cart.find((i) => i.id === id);
  it.quantity = Math.max(1, Math.floor(Number(input.value) || 1));
  saveCart();
  renderCart();
  renderProducts($("#search").value);
});

// ==== Controles ====
let t;
$("#search").addEventListener("input", (e) => {
  clearTimeout(t);
  const v = e.target.value;
  t = setTimeout(() => renderProducts(v), 150);
});
$("#resetBtn").addEventListener("click", () => {
  $("#search").value = "";
  renderProducts("");
});

const IVA = 0.13;
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    notify.error("Tu carrito está vacío 🛒");
    return;
  }
  const invoice = $("#invoice");
  const ul = $("#invoice-items");
  ul.innerHTML = cart
    .map(
      (i) => `
    <li class="cart-li">
      <img class="thumb" src="${i.img}" alt="${i.name}"/>
      <div>${i.name} — ${i.quantity} × ${fmt.format(i.price)}</div>
      <div class="price">${fmt.format(i.price * i.quantity)}</div>
    </li>`
    )
    .join("");
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = +(subtotal * IVA).toFixed(2);
  const total = subtotal + tax;
  $("#invoice-subtotal").textContent = fmt.format(subtotal);
  $("#invoice-tax").textContent = fmt.format(tax);
  $("#invoice-total").textContent = fmt.format(total);
  invoice.style.display = "block";
  localStorage.setItem(
    "desserts_last_invoice",
    JSON.stringify({
      when: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      total,
    })
  );
  cart = [];
  saveCart();
  renderCart();
});
$("#continueBtn").addEventListener(
  "click",
  () => ($("#invoice").style.display = "none")
);
$("#clearBtn").addEventListener("click", async () => {
  const res = await notify.confirm("¿Vaciar todos los productos del carrito?");
  if (res.isConfirmed) {
    cart = [];
    saveCart();
    renderCart();
    renderProducts($("#search").value);
    notify.success("Carrito vaciado");
  }
});
$("#loginBtn").addEventListener("click", () =>
  notify.toast("Función de inicio de sesión próximamente 🔐", "info")
);

// ==== Init ====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    renderProducts("");
    renderCart();
  });
} else {
  renderProducts("");
  renderCart();
}
