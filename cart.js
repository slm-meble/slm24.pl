// ================== SLM24.PL UNIFIED CART SCRIPT (CART.JS) ==================
(function() {
  const SHOP_CONFIG = {
    whatsappNumber: "48666688298",
    ownerEmail: "slmmble2022@gmail.com",
    defaultPriceFallback: 1360,
    defaultCourierPrice: 30,
    shippingCalculationMode: "per_item",
    seatOptions: [
      { label: "Bez sprężyny falistej (w cenie)", price: 0 },
      { label: "Sprężyna falista (+69 zł)", price: 69 }
    ],
    legsOptions: ["Nóżka nr 1", "Nóżka nr 2", "Nóżka nr 3", "Nóżka nr 4", "Nóżka nr 5", "Nóżka nr 6"],
    buttonsOptions: [
      { label: "Układ A (+0 zł)", value: "Układ A", price: 0 },
      { label: "Układ B (+0 zł)", value: "Układ B", price: 0 },
      { label: "Układ C (+0 zł)", value: "Układ C", price: 0 },
      { label: "Układ D (+0 zł)", value: "Układ D", price: 0 },
      { label: "Układ E (+0 zł)", value: "Układ E", price: 0 },
      { label: "Układ F (+0 zł)", value: "Układ F", price: 0 },
      { label: "Kryształki (+50 zł)", value: "Kryształki (+50 zł)", price: 50 }
    ]
  };

  const STORAGE_KEY = "slm24_unified_cart_v3";
  let slmCart = [];
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) slmCart = JSON.parse(localData);
  } catch (e) { slmCart = []; }

  let courierRate = parseFloat(localStorage.getItem("slm24_courier_rate")) || SHOP_CONFIG.defaultCourierPrice;
  let shippingMode = localStorage.getItem("slm_shipping_mode") || SHOP_CONFIG.shippingCalculationMode;

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slmCart)); } catch (e) {}
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Створення HTML-каркаса кошика прямо через JS, щоб не захаращувати HTML
  function injectCartUI() {
    if (document.getElementById("slm24-root-container")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "slm24-root-container";
    wrapper.innerHTML = `
      <style>
        #slm24-root-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; z-index: 999999; position: relative; }
        .slm-floating-cart {
          position: fixed !important; bottom: 25px !important; right: 25px !important;
          background: #111 !important; color: #fff !important; padding: 14px 22px !important;
          border-radius: 50px !important; cursor: pointer !important; box-shadow: 0 8px 25px rgba(0,0,0,0.35) !important;
          display: flex !important; align-items: center !important; gap: 10px !important; z-index: 999999 !important;
          font-weight: 700 !important; font-size: 15px !important;
        }
        .slm-floating-cart:hover { transform: scale(1.05); }
        .slm-cart-badge { background: #e11d48 !important; color: #fff !important; border-radius: 50px !important; padding: 2px 9px !important; font-size: 13px !important; font-weight: 800 !important; }
        
        .slm-overlay {
          position: fixed !important; inset: 0 !important; background: rgba(0,0,0,0.7) !important;
          display: none; justify-content: center !important; align-items: flex-start !important;
          overflow-y: auto !important; padding: 20px 10px !important; z-index: 1000000 !important;
        }
        .slm-overlay.active { display: flex !important; }
        .slm-modal-window {
          background: #fff !important; width: 100% !important; max-width: 660px !important;
          border-radius: 12px !important; box-shadow: 0 20px 45px rgba(0,0,0,0.4) !important;
          overflow: hidden !important; margin: 20px auto !important; color: #1e293b !important;
        }
        .slm-modal-header {
          display: flex !important; justify-content: space-between !important; align-items: center !important;
          padding: 16px 20px !important; border-bottom: 1px solid #e2e8f0 !important; background: #fff !important;
        }
        .slm-modal-title { font-size: 18px !important; font-weight: 800 !important; color: #8b1e41 !important; cursor: pointer !important; }
        .slm-header-btns { display: flex !important; align-items: center !important; gap: 10px !important; }
        .slm-btn-clear { background: #fff1f2 !important; color: #e11d48 !important; border: 1px solid #fecdd3 !important; padding: 6px 12px !important; border-radius: 6px !important; font-size: 12px !important; font-weight: 700 !important; cursor: pointer !important; }
        .slm-btn-close { background: none !important; border: none !important; font-size: 28px !important; color: #64748b !important; cursor: pointer !important; line-height: 1 !important; }
        .slm-modal-body { padding: 18px 20px !important; }
        .slm-admin-bar { display: none; background: #fffbeb !important; border: 1px dashed #f59e0b !important; padding: 12px !important; border-radius: 8px !important; margin-bottom: 15px !important; font-size: 12px !important; }
        .slm-admin-bar.open { display: block !important; }
        
        .slm-cart-item { border: 1px solid #e2e8f0 !important; border-radius: 8px !important; padding: 14px !important; margin-bottom: 14px !important; background: #f8fafc !important; }
        .slm-cart-item-head { display: flex !important; justify-content: space-between !important; align-items: flex-start !important; gap: 10px !important; margin-bottom: 10px !important; }
        .slm-item-left { display: flex !important; gap: 12px !important; align-items: center !important; }
        .slm-item-thumb { width: 60px !important; height: 60px !important; object-fit: cover !important; border-radius: 6px !important; border: 1px solid #e2e8f0 !important; background: #fff !important; }
        .slm-code-pill { background: #111 !important; color: #fff !important; font-size: 12px !important; font-weight: 800 !important; padding: 2px 8px !important; border-radius: 4px !important; margin-right: 6px !important; }
        .slm-item-title { font-weight: 700 !important; font-size: 15px !important; color: #0f172a !important; }
        .slm-btn-del { background: #ef4444 !important; color: #fff !important; border: none !important; width: 26px !important; height: 26px !important; border-radius: 5px !important; cursor: pointer !important; font-weight: bold !important; }
        
        .slm-opt-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 9px !important; background: #fff !important; padding: 10px !important; border-radius: 6px !important; border: 1px solid #e2e8f0 !important; margin-bottom: 10px !important; }
        .slm-opt-cell label { display: block !important; font-size: 11px !important; font-weight: 700 !important; color: #475569 !important; margin-bottom: 3px !important; }
        .slm-opt-cell select, .slm-opt-cell input { width: 100% !important; padding: 6px 8px !important; border: 1px solid #cbd5e1 !important; border-radius: 5px !important; font-size: 12px !important; background: #fff !important; box-sizing: border-box !important; }
        
        .slm-cart-item-foot { display: flex !important; justify-content: space-between !important; align-items: center !important; font-size: 13px !important; }
        .slm-qty-inline { display: inline-flex !important; align-items: center !important; border: 1px solid #cbd5e1 !important; border-radius: 6px !important; background: #fff !important; }
        .slm-qty-inline button { border: none !important; background: none !important; padding: 4px 10px !important; font-size: 15px !important; font-weight: 700 !important; cursor: pointer !important; }
        .slm-qty-inline span { padding: 0 8px !important; font-weight: 700 !important; }
        
        .slm-summary-block { border-top: 2px solid #e2e8f0 !important; padding-top: 14px !important; margin-top: 8px !important; }
        .slm-sum-row { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 8px 0 !important; border-bottom: 1px solid #e2e8f0 !important; font-size: 14px !important; }
        .slm-ship-options { display: flex !important; flex-direction: column !important; gap: 6px !important; text-align: right !important; font-size: 13px !important; }
        .slm-ship-options label { display: flex !important; align-items: center !important; justify-content: flex-end !important; gap: 6px !important; cursor: pointer !important; }
        .slm-grand-total { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 14px 0 !important; font-size: 19px !important; font-weight: 800 !important; color: #8b1e41 !important; }
        
        .slm-form-title { font-size: 15px !important; font-weight: 700 !important; margin: 14px 0 10px !important; color: #111 !important; }
        .slm-form-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 9px !important; }
        .slm-full { grid-column: 1 / -1 !important; }
        .slm-field { width: 100% !important; box-sizing: border-box !important; padding: 9px 11px !important; border: 1px solid #cbd5e1 !important; border-radius: 6px !important; font-size: 13px !important; background: #fff !important; }
        
        .slm-order-btns { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; margin-top: 14px !important; }
        .slm-btn-wa { background: #25D366 !important; color: #fff !important; border: none !important; padding: 13px !important; border-radius: 6px !important; font-weight: 700 !important; cursor: pointer !important; font-size: 14px !important; }
        .slm-btn-email { background: #8b1e41 !important; color: #fff !important; border: none !important; padding: 13px !important; border-radius: 6px !important; font-weight: 700 !important; cursor: pointer !important; font-size: 14px !important; }

        .slm-prod-actions { margin-top: 10px !important; display: flex !important; flex-direction: column !important; gap: 7px !important; }
        .slm-card-code-tag { display: inline-block !important; background: #111 !important; color: #fff !important; font-size: 12px !important; font-weight: 700 !important; padding: 3px 9px !important; border-radius: 4px !important; width: fit-content !important; }
        .slm-qty-box { display: flex !important; align-items: center !important; justify-content: space-between !important; margin: 4px 0 !important; font-size: 13px !important; color: #222 !important; }
        .slm-qty-controls { display: flex !important; align-items: center !important; border: 1px solid #cbd5e1 !important; border-radius: 5px !important; overflow: hidden !important; background: #fff !important; }
        .slm-qty-btn-card { background: #f1f5f9 !important; border: none !important; width: 30px !important; height: 30px !important; font-size: 16px !important; font-weight: bold !important; cursor: pointer !important; }
        .slm-qty-input-card { width: 40px !important; text-align: center !important; border: none !important; font-size: 14px !important; font-weight: 700 !important; background: #fff !important; }
        .slm-add-btn { width: 100% !important; background: #8b1e41 !important; color: #fff !important; border: none !important; padding: 11px !important; border-radius: 6px !important; font-weight: 700 !important; cursor: pointer !important; font-size: 14px !important; }
        .slm-ask-btn { width: 100% !important; background: #fff !important; color: #475569 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; border-radius: 6px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; }

        @media (max-width: 540px) {
          .slm-opt-grid, .slm-form-grid, .slm-order-btns { grid-template-columns: 1fr !important; }
        }
      </style>

      <div class="slm-floating-cart" id="slmFloatBtn">
        <span>🛒 Twój Koszyk</span>
        <span class="slm-cart-badge" id="slmBadgeCount">0</span>
        <span id="slmBadgeSum" style="font-size:12px; opacity:0.9;">(0.00 zł)</span>
      </div>

      <div class="slm-overlay" id="slmMainCartModal">
        <div class="slm-modal-window">
          <div class="slm-modal-header">
            <div class="slm-modal-title" id="slmAdminSecretTrigger">🛒 Twój Koszyk Zamówień</div>
            <div class="slm-header-btns">
              <button type="button" class="slm-btn-clear" id="slmClearAllBtn">Wyczyść koszyk</button>
              <button type="button" class="slm-btn-close" id="slmCloseCartBtn">&times;</button>
            </div>
          </div>
          <div class="slm-modal-body">
            <div class="slm-admin-bar" id="slmAdminBar">
              <strong>⚙️ Тариф доставки Kurier:</strong>
              <div style="display:flex; gap:10px; align-items:center; margin-top:6px; flex-wrap:wrap;">
                <label>Ціна (zł): <input type="number" id="slmAdminRate" style="width:70px; padding:4px;"></label>
                <label>Режим:
                  <select id="slmAdminMode" style="padding:4px;">
                    <option value="per_item">За кожну шт.</option>
                    <option value="flat">Фіксована сума</option>
                  </select>
                </label>
              </div>
            </div>

            <div id="slmCartListContainer"></div>

            <div class="slm-summary-block" id="slmCartSummaryBlock" style="display:none;">
              <div class="slm-sum-row">
                <span style="color:#64748b;">Suma częściowa:</span>
                <strong id="slmSubtotalText">0.00 zł</strong>
              </div>
              <div class="slm-sum-row">
                <span style="color:#64748b;">Przesyłka:</span>
                <div class="slm-ship-options">
                  <label><input type="radio" name="slmShipRadio" value="courier" checked> Kurier: <strong id="slmCourierText">0.00 zł</strong></label>
                  <label><input type="radio" name="slmShipRadio" value="pickup"> Odbiór osobisty (0.00 zł)</label>
                </div>
              </div>
              <div class="slm-grand-total">
                <span>Razem do zapłaty:</span>
                <span id="slmGrandTotalText">0.00 zł</span>
              </div>

              <div class="slm-form-title">Dane do dostawy i kontakt:</div>
              <div class="slm-form-grid">
                <input type="text" id="slmInName" class="slm-field slm-full" placeholder="* Imię i nazwisko" required>
                <input type="tel" id="slmInPhone" class="slm-field" placeholder="* Numer telefonu" required>
                <input type="email" id="slmInEmail" class="slm-field" placeholder="* Twój adres e-mail" required>
                <input type="text" id="slmInStreet" class="slm-field slm-full" placeholder="* Ulica, numer domu / lokalu" required>
                <input type="text" id="slmInZip" class="slm-field" placeholder="* Kod pocztowy (np. 00-001)" required>
                <input type="text" id="slmInCity" class="slm-field" placeholder="* Miasto" required>
                <textarea id="slmInNotes" class="slm-field slm-full" rows="2" placeholder="Uwagi do zamówienia"></textarea>
                <div class="slm-full">
                  <label style="font-size:13px; font-weight:700; display:block; margin-bottom:4px;">Sposób płatności:</label>
                  <select id="slmInPayment" class="slm-field" style="font-weight:700;">
                    <option value="Płatność przy odbiorze (Za pobraniem)">🚚 Płatność przy odbiorze (Za pobraniem)</option>
                    <option value="Zapłać teraz (Przelewy24 / BLIK / Przelew)">💳 Zapłać teraz (Przelewy24 / BLIK / Przelew)</option>
                  </select>
                </div>
              </div>

              <div class="slm-order-btns">
                <button type="button" class="slm-btn-wa" id="slmSubmitWaBtn">📲 Wyślij zamówienie (WhatsApp)</button>
                <button type="button" class="slm-btn-email" id="slmSubmitEmailBtn">✉️ Wyślij zamówienie na E-mail</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="slm-overlay" id="slmAskProductModal">
        <div class="slm-modal-window" style="max-width:430px;">
          <div class="slm-modal-header">
            <div class="slm-modal-title" style="font-size:17px;">✉️ Zapytaj o produkt</div>
            <button type="button" class="slm-btn-close" id="slmCloseAskBtn">&times;</button>
          </div>
          <div class="slm-modal-body">
            <p id="slmAskProdTitle" style="font-weight:700; color:#8b1e41; margin:0 0 12px 0; font-size:14px;"></p>
            <input type="email" id="slmAskEmail" class="slm-field" style="margin-bottom:8px;" placeholder="* Twój e-mail">
            <input type="tel" id="slmAskPhone" class="slm-field" style="margin-bottom:8px;" placeholder="Telefon (opcjonalnie)">
            <textarea id="slmAskQuestion" class="slm-field" rows="3" style="margin-bottom:10px;" placeholder="* Twoje pytanie"></textarea>
            <div class="slm-order-btns" style="margin-top:4px;">
              <button type="button" class="slm-btn-wa" id="slmSendAskWa">📲 WhatsApp</button>
              <button type="button" class="slm-btn-email" id="slmSendAskMail">✉️ Wyślij E-mail</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
    initCartEvents();
  }

  function initCartEvents() {
    document.getElementById("slmFloatBtn").onclick = () => document.getElementById("slmMainCartModal").classList.add("active");
    document.getElementById("slmCloseCartBtn").onclick = () => document.getElementById("slmMainCartModal").classList.remove("active");
    document.getElementById("slmMainCartModal").onclick = (e) => { if (e.target.id === "slmMainCartModal") e.target.classList.remove("active"); };
    document.getElementById("slmClearAllBtn").onclick = () => {
      if (confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
        slmCart = [];
        saveCart();
        renderCart();
      }
    };

    document.getElementById("slmCloseAskBtn").onclick = () => document.getElementById("slmAskProductModal").classList.remove("active");
    document.getElementById("slmAskProductModal").onclick = (e) => { if (e.target.id === "slmAskProductModal") e.target.classList.remove("active"); };

    let clicks = 0, timer = null;
    document.getElementById("slmAdminSecretTrigger").onclick = () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 1500);
      if (clicks >= 5) {
        clicks = 0;
        document.getElementById("slmAdminBar").classList.toggle("open");
      }
    };

    const rateIn = document.getElementById("slmAdminRate");
    const modeIn = document.getElementById("slmAdminMode");
    if (rateIn) rateIn.value = courierRate;
    if (modeIn) modeIn.value = shippingMode;

    if (rateIn) rateIn.onchange = () => {
      courierRate = parseFloat(rateIn.value) || 0;
      localStorage.setItem("slm24_courier_rate", courierRate);
      renderCart();
    };
    if (modeIn) modeIn.onchange = () => {
      shippingMode = modeIn.value;
      localStorage.setItem("slm_shipping_mode", shippingMode);
      renderCart();
    };

    document.querySelectorAll('input[name="slmShipRadio"]').forEach(r => r.onchange = renderCart);

    document.getElementById("slmSubmitWaBtn").onclick = () => submitOrder("whatsapp");
    document.getElementById("slmSubmitEmailBtn").onclick = () => submitOrder("email");
    document.getElementById("slmSendAskWa").onclick = () => sendProductQuestion("whatsapp");
    document.getElementById("slmSendAskMail").onclick = () => sendProductQuestion("email");
  }

  function addItemToCart(prod) {
    const existing = slmCart.find(i => i.code === prod.code && i.seatIdx === 0 && i.leg === SHOP_CONFIG.legsOptions[0] && i.fabric.toLowerCase() === "jak na zdjęciu");
    if (existing) {
      existing.qty += prod.qty;
    } else {
      slmCart.push({
        id: Date.now() + Math.random(),
        code: prod.code,
        title: prod.title,
        basePrice: prod.basePrice,
        qty: prod.qty,
        img: prod.img || "",
        skipButtons: prod.skipButtons,
        seatIdx: 0,
        leg: SHOP_CONFIG.legsOptions[0],
        buttons: prod.skipButtons ? "Nie dotyczy" : SHOP_CONFIG.buttonsOptions[0].value,
        fabric: "Jak na zdjęciu"
      });
    }
    saveCart();
    renderCart();
    document.getElementById("slmMainCartModal").classList.add("active");
  }

  function getUnitPrice(item) {
    const base = parseFloat(item.basePrice) || SHOP_CONFIG.defaultPriceFallback;
    const seatExtra = SHOP_CONFIG.seatOptions[item.seatIdx]?.price || 0;
    const btnObj = SHOP_CONFIG.buttonsOptions.find(b => b.value === item.buttons);
    const btnExtra = (!item.skipButtons && btnObj) ? btnObj.price : 0;
    return base + seatExtra + btnExtra;
  }

  function renderCart() {
    const listEl = document.getElementById("slmCartListContainer");
    const summaryEl = document.getElementById("slmCartSummaryBlock");
    const badgeCount = document.getElementById("slmBadgeCount");
    const badgeSum = document.getElementById("slmBadgeSum");
    if (!listEl) return;

    let totalQty = 0, subtotal = 0;
    slmCart.forEach(item => {
      const unit = getUnitPrice(item);
      item.unitPrice = unit;
      item.totalPrice = unit * item.qty;
      totalQty += item.qty;
      subtotal += item.totalPrice;
    });

    badgeCount.innerText = totalQty;
    badgeSum.innerText = `(${subtotal.toFixed(2)} zł)`;

    if (slmCart.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:30px 10px; color:#64748b; font-size:14px;">Twój koszyk jest pusty.</div>`;
      summaryEl.style.display = "none";
      return;
    }

    summaryEl.style.display = "block";
    listEl.innerHTML = slmCart.map((item, i) => {
      const seatOpts = SHOP_CONFIG.seatOptions.map((o, idx) => `<option value="${idx}" ${Number(item.seatIdx) === idx ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("");
      const legOpts = SHOP_CONFIG.legsOptions.map(l => `<option value="${escapeHtml(l)}" ${item.leg === l ? "selected" : ""}>${escapeHtml(l)}</option>`).join("");
      const btnOpts = SHOP_CONFIG.buttonsOptions.map(b => `<option value="${escapeHtml(b.value)}" ${item.buttons === b.value ? "selected" : ""}>${escapeHtml(b.label)}</option>`).join("");

      return `
        <div class="slm-cart-item">
          <div class="slm-cart-item-head">
            <div class="slm-item-left">
              <img src="${escapeHtml(item.img)}" class="slm-item-thumb" alt="Mebel">
              <div>
                <span class="slm-code-pill">${escapeHtml(item.code)}</span>
                <span class="slm-item-title">${escapeHtml(item.title)}</span>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">Cena bazowa: ${Number(item.basePrice).toFixed(2)} zł</div>
              </div>
            </div>
            <button type="button" class="slm-btn-del" onclick="window.__slmDel(${i})">&times;</button>
          </div>
          <div class="slm-opt-grid">
            <div class="slm-opt-cell"><label>🪑 Siedzisko:</label><select onchange="window.__slmUpd(${i}, 'seatIdx', this.value)">${seatOpts}</select></div>
            <div class="slm-opt-cell"><label>🦵 Nóżka:</label><select onchange="window.__slmUpd(${i}, 'leg', this.value)">${legOpts}</select></div>
            <div class="slm-opt-cell"><label>🔘 Guziki:</label>${!item.skipButtons ? `<select onchange="window.__slmUpd(${i}, 'buttons', this.value)">${btnOpts}</select>` : `<input type="text" value="Nie dotyczy" disabled>`}</div>
            <div class="slm-opt-cell"><label>🎨 Tkanina:</label><input type="text" value="${escapeHtml(item.fabric)}" onchange="window.__slmUpd(${i}, 'fabric', this.value)"></div>
          </div>
          <div class="slm-cart-item-foot">
            <div class="slm-qty-inline">
              <button type="button" onclick="window.__slmQty(${i}, -1)">-</button>
              <span>${item.qty} szt.</span>
              <button type="button" onclick="window.__slmQty(${i}, 1)">+</button>
            </div>
            <div>${item.unitPrice.toFixed(2)} zł &times; ${item.qty} = <strong style="color:#8b1e41;">${item.totalPrice.toFixed(2)} zł</strong></div>
          </div>
        </div>
      `;
    }).join("");

    const courierCost = shippingMode === "per_item" ? (courierRate * totalQty) : courierRate;
    document.getElementById("slmSubtotalText").innerText = subtotal.toFixed(2) + " zł";
    document.getElementById("slmCourierText").innerText = courierCost.toFixed(2) + " zł";

    const shipMethod = document.querySelector('input[name="slmShipRadio"]:checked')?.value || "courier";
    const finalShip = shipMethod === "pickup" ? 0 : courierCost;
    document.getElementById("slmGrandTotalText").innerText = (subtotal + finalShip).toFixed(2) + " zł";
  }

  window.__slmUpd = (idx, f, v) => { if(slmCart[idx]){ if(f==='seatIdx') slmCart[idx].seatIdx = parseInt(v)||0; else slmCart[idx][f] = v; saveCart(); renderCart(); } };
  window.__slmQty = (idx, d) => { if(slmCart[idx]){ slmCart[idx].qty += d; if(slmCart[idx].qty<=0) slmCart.splice(idx,1); saveCart(); renderCart(); } };
  window.__slmDel = (idx) => { slmCart.splice(idx,1); saveCart(); renderCart(); };

  function enhanceCards() {
    document.querySelectorAll("button, a").forEach((btn, idx) => {
      if (btn.dataset.slmEnhanced === "true") return;
      const txt = (btn.innerText || "").toLowerCase();
      if (!txt.includes("zapytaj o cenę") && !txt.includes("dodaj do koszyka") && !txt.includes("zamów")) return;
      if (btn.closest("#slm24-root-container") || btn.closest(".slm-prod-actions")) return;

      btn.dataset.slmEnhanced = "true";
      const card = btn.closest(".product, .card, .item, .ogloszenie, article, li") || btn.parentElement;
      if (!card) return;

      const titleEl = card.querySelector("h1, h2, h3, h4, .title, strong");
      const rawTitle = titleEl ? titleEl.innerText.trim() : "Mebel SLM24";
      const fullText = card.innerText || "";

      let adCode = "#001";
      const match = (rawTitle + " " + fullText).match(/#\s*([0-9A-Za-z_-]{1,10})/);
      if (match) {
        adCode = /^\d+$/.test(match[1]) ? "#" + match[1].padStart(3, "0") : "#" + match[1].toUpperCase();
      } else {
        adCode = "#" + String(idx + 1).padStart(3, "0");
      }

      const cleanTitle = rawTitle.replace(/#\s*[0-9A-Za-z_-]{1,10}\s*[-–—:]?\s*/g, "").trim() || "Mebel SLM24";
      const skipButtons = /caterpillar|chesterfield|poduszka/i.test(rawTitle + " " + fullText);

      let basePrice = 0;
      const priceRegex = /(\d[\d\s.,]{0,6})\s*zł/gi;
      let m;
      while ((m = priceRegex.exec(fullText)) !== null) {
        const val = parseFloat(m[1].replace(/\s+/g, "").replace(",", "."));
        if (!isNaN(val) && val >= 15 && val > basePrice) basePrice = val;
      }
      if (!basePrice) basePrice = SHOP_CONFIG.defaultPriceFallback;

      const imgEl = card.querySelector("img");
      const imgSrc = imgEl && imgEl.src ? imgEl.src : "";

      const box = document.createElement("div");
      box.className = "slm-prod-actions";
      box.innerHTML = `
        <span class="slm-card-code-tag">Ogłoszenie ${escapeHtml(adCode)}</span>
        <div class="slm-qty-box">
          <span style="font-weight:700;">Ilość (szt.):</span>
          <div class="slm-qty-controls">
            <button type="button" class="slm-qty-btn-card slm-m">-</button>
            <input type="text" class="slm-qty-input-card" value="1" readonly>
            <button type="button" class="slm-qty-btn-card slm-p">+</button>
          </div>
        </div>
        <button type="button" class="slm-add-btn">🛒 Dodaj do koszyka (${basePrice.toFixed(2)} zł)</button>
        <button type="button" class="slm-ask-btn">✉️ Zapytaj o produkt (${escapeHtml(adCode)})</button>
      `;

      btn.style.display = "none";
      btn.parentNode.insertBefore(box, btn);

      const qInput = box.querySelector(".slm-qty-input-card");
      box.querySelector(".slm-m").onclick = () => { let v = parseInt(qInput.value)||1; if(v>1) qInput.value = v-1; };
      box.querySelector(".slm-p").onclick = () => { qInput.value = (parseInt(qInput.value)||1) + 1; };

      box.querySelector(".slm-add-btn").onclick = () => {
        addItemToCart({ code: adCode, title: cleanTitle, basePrice: basePrice, qty: parseInt(qInput.value)||1, img: imgSrc, skipButtons: skipButtons });
      };

      box.querySelector(".slm-ask-btn").onclick = () => {
        document.getElementById("slmAskProdTitle").innerText = `Produkt: [${adCode}] ${cleanTitle}`;
        document.getElementById("slmAskProductModal").classList.add("active");
      };
    });
  }

  function submitOrder(ch) {
    if (slmCart.length === 0) { alert("Twój koszyk jest pusty!"); return; }
    const name = document.getElementById("slmInName").value.trim();
    const phone = document.getElementById("slmInPhone").value.trim();
    const email = document.getElementById("slmInEmail").value.trim();
    const street = document.getElementById("slmInStreet").value.trim();
    const zip = document.getElementById("slmInZip").value.trim();
    const city = document.getElementById("slmInCity").value.trim();
    const notes = document.getElementById("slmInNotes").value.trim();
    const payment = document.getElementById("slmInPayment").value;

    if (!name || !phone || !email || !street || !zip || !city) {
      alert("Proszę wypełnić wszystkie wymagane pola oznaczone gwiazdką (*)!");
      return;
    }

    let subtotal = 0, totalQty = 0;
    const codes = slmCart.map(i => `${i.code} (${i.qty} szt.)`).join(", ");
    const lines = slmCart.map((item, idx) => {
      const unit = getUnitPrice(item);
      const rowT = unit * item.qty;
      subtotal += rowT; totalQty += item.qty;
      return `${idx + 1}. [${item.code}] *${item.title}*\n   • Ilość: ${item.qty} szt. x ${unit.toFixed(2)} zł = *${rowT.toFixed(2)} zł*\n   • Siedzisko: ${SHOP_CONFIG.seatOptions[item.seatIdx]?.label}\n   • Nóżka: ${item.leg}\n   • Guziki: ${item.skipButtons ? "Nie dotyczy" : item.buttons}\n   • Tkanina: *${item.fabric}*`;
    }).join("\n\n");

    const shipM = document.querySelector('input[name="slmShipRadio"]:checked')?.value || "courier";
    const shipCost = shipM === "pickup" ? 0 : (shippingMode === "per_item" ? courierRate * totalQty : courierRate);
    const grand = subtotal + shipCost;

    const msg = `🛒 NOWE ZAMÓWIENIE - SLM24.PL\n📌 KODY: ${codes}\n==============================\n${lines}\n\nSuma: ${subtotal.toFixed(2)} zł\nDostawa: ${shipM === "pickup" ? "Odbiór osobisty (0 zł)" : "Kurier (" + shipCost.toFixed(2) + " zł)"}\nRAZEM: ${grand.toFixed(2)} zł\nPłatność: ${payment}\n==============================\n👤 KLIENT:\nImię: ${name}\nTel: ${phone}\nE-mail: ${email}\nAdres: ${street}, ${zip} ${city}\nUwagi: ${notes || "Brak"}`;

    if (ch === "whatsapp") {
      window.open(`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      window.location.href = `mailto:${SHOP_CONFIG.ownerEmail}?subject=${encodeURIComponent("Zamówienie [" + codes + "] - " + name)}&body=${encodeURIComponent(msg)}`;
    }
  }

  function sendProductQuestion(ch) {
    const prod = document.getElementById("slmAskProdTitle").innerText;
    const email = document.getElementById("slmAskEmail").value.trim();
    const phone = document.getElementById("slmAskPhone").value.trim();
    const q = document.getElementById("slmAskQuestion").value.trim();
    if (!email || !q) { alert("Podaj e-mail oraz treść pytania!"); return; }

    const text = `ZAPYTANIE:\n${prod}\nE-mail: ${email}\nTel: ${phone || "Brak"}\nPytanie: ${q}`;
    if (ch === "whatsapp") {
      window.open(`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      window.location.href = `mailto:${SHOP_CONFIG.ownerEmail}?subject=${encodeURIComponent("Zapytanie - " + prod)}&body=${encodeURIComponent(text)}`;
    }
    document.getElementById("slmAskProductModal").classList.remove("active");
  }

  // Автозапуск
  function run() {
    injectCartUI();
    enhanceCards();
    renderCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  setInterval(() => { enhanceCards(); }, 1200);
})();
