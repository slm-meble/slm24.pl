<!-- ================== ЄДИНИЙ МОДУЛЬ КОШИКА SLM24.PL (PRO) ================== -->
<script>
(function() {
  // 1. ЗАХИСТ ВІД ДВОХ ВІКОН (Якщо код випадково підключено двічі — другий раз він не запуститься)
  if (window.__SLM24_CART_LOADED__) return;
  window.__SLM24_CART_LOADED__ = true;

  // =========================================================================
  // 2. НАЛАШТУВАННЯ МАГАЗИНУ (Твої контакти та тарифи)
  // =========================================================================
  const SHOP_CONFIG = {
    whatsappNumber: "48666688298",           // Твій реальний WhatsApp
    ownerEmail: "slmmble2022@gmail.com",     // Твій реальний E-mail
    defaultPriceFallback: 1360,              // Ціна за замовчуванням, якщо в оголошенні не вказана
    defaultCourierPrice: 30,                 // Базова ціна доставки Kurier за 1 шт. (zł) — можеш змінити тут
    shippingCalculationMode: "per_item",     // "per_item" (множити на кожну шт.) або "flat" (фіксована ціна)

    seatOptions: [
      { label: "Bez sprężyny falistej (w cenie)", price: 0 },
      { label: "Sprężyna falista (+69 zł)", price: 69 }
    ],
    legsOptions: [
      "Nóżka nr 1",
      "Nóżka nr 2",
      "Nóżka nr 3",
      "Nóżka nr 4",
      "Nóżka nr 5",
      "Nóżka nr 6"
    ],
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

  // =========================================================================
  // 3. ЗБЕРЕЖЕННЯ КОШИКА ЗА КЛІЄНТОМ (LocalStorage + Cookie на 30 днів)
  // =========================================================================
  const STORAGE_KEY = "slm24_unified_cart_v3";

  function loadCartFromDevice() {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) return JSON.parse(localData);
      const match = document.cookie.match(new RegExp('(^| )' + STORAGE_KEY + '=([^;]+)'));
      if (match) return JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {}
    return [];
  }

  function saveCartToDevice(cartData) {
    try {
      const str = JSON.stringify(cartData);
      localStorage.setItem(STORAGE_KEY, str);
      const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
      document.cookie = STORAGE_KEY + "=" + encodeURIComponent(str) + "; expires=" + expires + "; path=/; SameSite=Lax";
    } catch (e) {}
  }

  let slmCart = loadCartFromDevice();
  let savedRate = parseFloat(localStorage.getItem("slm24_courier_rate"));
  let courierRate = !isNaN(savedRate) ? savedRate : SHOP_CONFIG.defaultCourierPrice;
  let shippingMode = localStorage.getItem("slm24_shipping_mode") || SHOP_CONFIG.shippingCalculationMode;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // =========================================================================
  // 4. ЗЧИТУВАННЯ НОМЕРА ОГОЛОШЕННЯ (#001 ... #999)
  // =========================================================================
  function extractAdCode(titleText, fullText, fallbackIndex) {
    const combined = (titleText || "") + " " + (fullText || "");
    // Шукаємо #001, #002, #15, #A1 тощо
    const match = combined.match(/#\s*([0-9A-Za-z_-]{1,10})/);
    if (match) {
      const rawCode = match[1];
      // Якщо це число (напр. 1 або 01), форматуємо красиво як #001
      if (/^\d+$/.test(rawCode)) {
        return "#" + rawCode.padStart(3, "0");
      }
      return "#" + rawCode.toUpperCase();
    }
    // Якщо в тексті забули написати #, ставимо порядковий номер картки (#001, #002...)
    return "#" + String(fallbackIndex).padStart(3, "0");
  }

  function cleanTitleFromCode(titleText) {
    return String(titleText || "")
      .replace(/#\s*[0-9A-Za-z_-]{1,10}\s*[-–—:]?\s*/g, "")
      .trim() || "Mebel SLM24";
  }

  // =========================================================================
  // 5. СТИЛІ КОШИКА ТА КАРТОК ТОВАРІВ
  // =========================================================================
  const css = `
    #slm-top-cart, #slm-cart-modal, #slm-ask-modal { display: none !important; }
    :root {
      --slm-burgundy: #8b1e41;
      --slm-black: #111111;
      --slm-green: #25D366;
      --slm-border: #e2e8f0;
      --slm-bg: #f8fafc;
    }

    /* Кнопки під кожним оголошенням на сайті */
    .slm-prod-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 7px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .slm-card-code-tag { display: inline-block; align-self: flex-start; background: #111; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 4px; letter-spacing: 0.5px; }
    .slm-qty-box { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; font-size: 13px; color: #222; }
    .slm-qty-controls { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 5px; overflow: hidden; background: #fff; }
    .slm-qty-btn-card { background: #f1f5f9; border: none; width: 30px; height: 30px; font-size: 16px; font-weight: bold; cursor: pointer; color: #111; }
    .slm-qty-btn-card:hover { background: #e2e8f0; }
    .slm-qty-input-card { width: 40px; text-align: center; border: none; font-size: 14px; font-weight: 700; color: #111; background: #fff; }
    .slm-add-btn { width: 100%; background: var(--slm-burgundy); color: #fff; border: none; padding: 11px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; transition: 0.2s; }
    .slm-add-btn:hover { background: #6e1532; }
    .slm-ask-btn { width: 100%; background: #fff; color: #475569; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .slm-ask-btn:hover { background: #f1f5f9; color: #111; }

    /* Плаваюча кнопка кошика у правому нижньому кутку */
    .slm-floating-cart {
      position: fixed; bottom: 22px; right: 22px;
      background: var(--slm-black); color: #fff;
      padding: 13px 20px; border-radius: 50px; cursor: pointer;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      display: flex; align-items: center; gap: 10px;
      z-index: 99990; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 700; font-size: 14px; transition: transform 0.2s;
    }
    .slm-floating-cart:hover { transform: scale(1.04); }
    .slm-cart-badge {
      background: #e11d48; color: #fff; border-radius: 50px;
      padding: 2px 9px; font-size: 13px; font-weight: 800;
    }

    /* Єдине модальне вікно кошика */
    .slm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.65);
      display: none; justify-content: center; align-items: flex-start;
      overflow-y: auto; padding: 20px 10px; z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    }
    .slm-overlay.active { display: flex; }
    .slm-modal-window {
      background: #fff; width: 100%; max-width: 660px;
      border-radius: 12px; box-shadow: 0 20px 45px rgba(0,0,0,0.35);
      overflow: hidden; margin: 20px auto; color: #1e293b; box-sizing: border-box;
    }

    .slm-modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid var(--slm-border); background: #fff;
    }
    .slm-modal-title { font-size: 18px; font-weight: 800; color: var(--slm-burgundy); cursor: pointer; user-select: none; }
    .slm-header-btns { display: flex; align-items: center; gap: 10px; }
    .slm-btn-clear {
      background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3;
      padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;
    }
    .slm-btn-close { background: none; border: none; font-size: 26px; color: #64748b; cursor: pointer; line-height: 1; }

    .slm-modal-body { padding: 18px 20px; }

    /* Прихована панель тарифу доставки (5 кліків на заголовок кошика) */
    .slm-admin-bar {
      display: none; background: #fffbeb; border: 1px dashed #f59e0b;
      padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 12px;
    }
    .slm-admin-bar.open { display: block; }

    /* Картка товару всередині кошика */
    .slm-cart-item {
      border: 1px solid var(--slm-border); border-radius: 8px;
      padding: 14px; margin-bottom: 14px; background: var(--slm-bg);
    }
    .slm-cart-item-head {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px;
    }
    .slm-item-left { display: flex; gap: 12px; align-items: center; }
    .slm-item-thumb {
      width: 60px; height: 60px; object-fit: cover; border-radius: 6px;
      border: 1px solid var(--slm-border); background: #fff; flex-shrink: 0;
    }
    .slm-code-pill {
      display: inline-block; background: var(--slm-black); color: #fff;
      font-size: 12px; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-right: 6px;
    }
    .slm-item-title { font-weight: 700; font-size: 15px; color: #0f172a; }
    .slm-btn-del {
      background: #ef4444; color: #fff; border: none; width: 26px; height: 26px;
      border-radius: 5px; cursor: pointer; font-weight: bold; flex-shrink: 0;
    }

    .slm-opt-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 9px;
      background: #fff; padding: 10px; border-radius: 6px; border: 1px solid var(--slm-border); margin-bottom: 10px;
    }
    .slm-opt-cell label { display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 3px; }
    .slm-opt-cell select, .slm-opt-cell input {
      width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 5px;
      font-size: 12px; box-sizing: border-box; background: #fff;
    }

    .slm-cart-item-foot {
      display: flex; justify-content: space-between; align-items: center; font-size: 13px;
    }
    .slm-qty-inline {
      display: inline-flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;
    }
    .slm-qty-inline button { border: none; background: none; padding: 4px 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
    .slm-qty-inline span { padding: 0 8px; font-weight: 700; }

    /* Підсумок та доставка */
    .slm-summary-block { border-top: 2px solid var(--slm-border); padding-top: 14px; margin-top: 8px; }
    .slm-sum-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--slm-border); font-size: 14px;
    }
    .slm-ship-options { display: flex; flex-direction: column; gap: 6px; text-align: right; font-size: 13px; }
    .slm-ship-options label { display: flex; align-items: center; justify-content: flex-end; gap: 6px; cursor: pointer; }
    .slm-grand-total {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 0; font-size: 19px; font-weight: 800; color: var(--slm-burgundy);
    }

    /* Форма замовлення */
    .slm-form-title { font-size: 15px; font-weight: 700; margin: 14px 0 10px; color: #111; }
    .slm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
    .slm-full { grid-column: 1 / -1; }
    .slm-field {
      width: 100%; box-sizing: border-box; padding: 9px 11px;
      border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px;
    }

    .slm-order-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .slm-btn-wa {
      background: var(--slm-green); color: #fff; border: none; padding: 13px;
      border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;
    }
    .slm-btn-email {
      background: var(--slm-burgundy); color: #fff; border: none; padding: 13px;
      border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;
    }

    @media (max-width: 540px) {
      .slm-opt-grid, .slm-form-grid, .slm-order-btns { grid-template-columns: 1fr; }
    }
  `;

  const styleNode = document.createElement("style");
  styleNode.id = "slm24-unified-styles";
  styleNode.innerHTML = css;
  document.head.appendChild(styleNode);

  // =========================================================================
  // 6. СТВОРЕННЯ ЄДИНОГО ВІКНА КОШИКА ТА ВІКНА ЗАПИТАННЯ
  // =========================================================================
  function mountModals() {
    // Видаляємо будь-які старі дублікати, якщо вони залишилися на сайті
    document.querySelectorAll("#slm-cart-modal, #slm-ask-modal, #slmCartOverlay, .slm-floating-cart").forEach(el => el.remove());

    const wrapper = document.createElement("div");
    wrapper.id = "slm24-root-container";
    wrapper.innerHTML = `
      <!-- Плаваюча кнопка кошика -->
      <div class="slm-floating-cart" id="slmFloatBtn">
        <span>🛒 Twój Koszyk</span>
        <span class="slm-cart-badge" id="slmBadgeCount">0</span>
        <span id="slmBadgeSum" style="font-size:12px; opacity:0.9;">(0.00 zł)</span>
      </div>

      <!-- Єдине модальне вікно кошика -->
      <div class="slm-overlay" id="slmMainCartModal">
        <div class="slm-modal-window">
          <div class="slm-modal-header">
            <div class="slm-modal-title" id="slmAdminSecretTrigger" title="Натисніть 5 разів для налаштування доставки">
              🛒 Twój Koszyk Zamówień
            </div>
            <div class="slm-header-btns">
              <button type="button" class="slm-btn-clear" id="slmClearAllBtn">Wyczyść koszyk</button>
              <button type="button" class="slm-btn-close" id="slmCloseCartBtn">&times;</button>
            </div>
          </div>

          <div class="slm-modal-body">
            <!-- Секретна панель власника (5 кліків по заголовку) -->
            <div class="slm-admin-bar" id="slmAdminBar">
              <strong>⚙️ Тариф доставки Kurier:</strong>
              <div style="display:flex; gap:10px; align-items:center; margin-top:6px; flex-wrap:wrap;">
                <label>Ціна (zł): <input type="number" id="slmAdminRate" style="width:70px; padding:4px;"></label>
                <label>Режим:
                  <select id="slmAdminMode" style="padding:4px;">
                    <option value="per_item">За кожну шт. (1 шт = X zł, 2 шт = 2X zł)</option>
                    <option value="flat">Фіксована сума за все замовлення</option>
                  </select>
                </label>
              </div>
            </div>

            <!-- Список товарів -->
            <div id="slmCartListContainer"></div>

            <!-- Блок підрахунку та анкети -->
            <div class="slm-summary-block" id="slmCartSummaryBlock" style="display:none;">
              <div class="slm-sum-row">
                <span style="color:#64748b;">Suma częściowa (Produkty):</span>
                <strong id="slmSubtotalText">0.00 zł</strong>
              </div>

              <div class="slm-sum-row">
                <span style="color:#64748b;">Dostawa (Przesyłka):</span>
                <div class="slm-ship-options">
                  <label>
                    <input type="radio" name="slmShipRadio" value="courier" checked>
                    <span>Kurier: <strong id="slmCourierText">0.00 zł</strong></span>
                  </label>
                  <label>
                    <input type="radio" name="slmShipRadio" value="pickup">
                    <span>Odbiór osobisty (0.00 zł)</span>
                  </label>
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
                <textarea id="slmInNotes" class="slm-field slm-full" rows="2" placeholder="Uwagi do zamówienia (np. piętro, dodatkowe życzenia)"></textarea>

                <div class="slm-full">
                  <label style="font-size:13px; font-weight:700; display:block; margin-bottom:4px;">Wybierz sposób płatności:</label>
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

      <!-- Модальне вікно "Zapytaj o produkt" -->
      <div class="slm-overlay" id="slmAskProductModal">
        <div class="slm-modal-window" style="max-width:430px;">
          <div class="slm-modal-header">
            <div class="slm-modal-title" style="font-size:17px;">✉️ Zapytaj o produkt</div>
            <button type="button" class="slm-btn-close" id="slmCloseAskBtn">&times;</button>
          </div>
          <div class="slm-modal-body">
            <p id="slmAskProdTitle" style="font-weight:700; color:#8b1e41; margin:0 0 12px 0; font-size:14px;"></p>
            <input type="email" id="slmAskEmail" class="slm-field" style="margin-bottom:8px;" placeholder="* Twój adres e-mail (na ten adres odpowiemy)">
            <input type="tel" id="slmAskPhone" class="slm-field" style="margin-bottom:8px;" placeholder="Numer telefonu (opcjonalnie)">
            <textarea id="slmAskQuestion" class="slm-field" rows="3" style="margin-bottom:10px;" placeholder="* Twoje pytanie (np. czas realizacji, próbki tkanin...)"></textarea>
            <div class="slm-order-btns" style="margin-top:4px;">
              <button type="button" class="slm-btn-wa" id="slmSendAskWa">📲 WhatsApp</button>
              <button type="button" class="slm-btn-email" id="slmSendAskMail">✉️ Wyślij E-mail</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    // Події відкриття та закриття
    document.getElementById("slmFloatBtn").addEventListener("click", () => toggleCartModal(true));
    document.getElementById("slmCloseCartBtn").addEventListener("click", () => toggleCartModal(false));
    document.getElementById("slmMainCartModal").addEventListener("click", (e) => {
      if (e.target.id === "slmMainCartModal") toggleCartModal(false);
    });

    document.getElementById("slmCloseAskBtn").addEventListener("click", () => {
      document.getElementById("slmAskProductModal").classList.remove("active");
    });
    document.getElementById("slmAskProductModal").addEventListener("click", (e) => {
      if (e.target.id === "slmAskProductModal") document.getElementById("slmAskProductModal").classList.remove("active");
    });

    document.getElementById("slmClearAllBtn").addEventListener("click", () => {
      if (confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
        slmCart = [];
        saveCartToDevice(slmCart);
        renderCart();
      }
    });

    document.querySelectorAll('input[name="slmShipRadio"]').forEach(r => {
      r.addEventListener("change", renderCart);
    });

    // Секретний вхід в адмін-панель доставки (5 кліків)
    let clicks = 0, timer = null;
    document.getElementById("slmAdminSecretTrigger").addEventListener("click", () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 1500);
      if (clicks >= 5) {
        clicks = 0;
        document.getElementById("slmAdminBar").classList.toggle("open");
      }
    });

    const rateIn = document.getElementById("slmAdminRate");
    const modeIn = document.getElementById("slmAdminMode");
    rateIn.value = courierRate;
    modeIn.value = shippingMode;

    const updateAdminShip = () => {
      const val = parseFloat(rateIn.value);
      if (!isNaN(val) && val >= 0) {
        courierRate = val;
        localStorage.setItem("slm24_courier_rate", courierRate);
      }
      shippingMode = modeIn.value;
      localStorage.setItem("slm24_shipping_mode", shippingMode);
      renderCart();
    };
    rateIn.addEventListener("change", updateAdminShip);
    modeIn.addEventListener("change", updateAdminShip);

    // Відправка замовлень
    document.getElementById("slmSubmitWaBtn").addEventListener("click", () => submitOrder("whatsapp"));
    document.getElementById("slmSubmitEmailBtn").addEventListener("click", () => submitOrder("email"));

    // Відправка запитань про товар
    document.getElementById("slmSendAskWa").addEventListener("click", () => sendProductQuestion("whatsapp"));
    document.getElementById("slmSendAskMail").addEventListener("click", () => sendProductQuestion("email"));
  }

  function toggleCartModal(show) {
    const modal = document.getElementById("slmMainCartModal");
    if (!modal) return;
    if (show) modal.classList.add("active");
    else modal.classList.remove("active");
  }

  // =========================================================================
  // 7. ДОДАВАННЯ ТОВАРІВ У КОШИК ТА ОБРАХУНОК СУМИ
  // =========================================================================
  function addItemToCart({ code, title, basePrice, qty, img, skipButtons }) {
    // Перевіряємо, чи вже є в кошику точно таке саме крісло (#код) зі стандартними параметрами
    const existing = slmCart.find(item =>
      item.code === code &&
      item.seatIdx === 0 &&
      item.leg === SHOP_CONFIG.legsOptions[0] &&
      item.buttons === (skipButtons ? "Nie dotyczy" : SHOP_CONFIG.buttonsOptions[0].value) &&
      item.fabric.trim().toLowerCase() === "jak na zdjęciu"
    );

    if (existing) {
      existing.qty += qty;
    } else {
      slmCart.push({
        id: Date.now() + Math.random(),
        code: code,
        title: title,
        basePrice: basePrice,
        qty: qty,
        img: img || "https://via.placeholder.com/80?text=SLM24",
        skipButtons: skipButtons,
        seatIdx: 0,
        leg: SHOP_CONFIG.legsOptions[0],
        buttons: skipButtons ? "Nie dotyczy" : SHOP_CONFIG.buttonsOptions[0].value,
        fabric: "Jak na zdjęciu"
      });
    }

    saveCartToDevice(slmCart);
    renderCart();
    toggleCartModal(true);
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

    let totalQty = 0;
    let subtotal = 0;

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
      listEl.innerHTML = `<div style="text-align:center; padding:35px 10px; color:#64748b; font-size:14px;">
        Twój koszyk jest pusty. Wybierz fotel lub poduszkę z ogłoszeń na stronie!
      </div>`;
      summaryEl.style.display = "none";
      return;
    }

    summaryEl.style.display = "block";

    listEl.innerHTML = slmCart.map((item, i) => {
      const seatSelectHtml = SHOP_CONFIG.seatOptions.map((opt, idx) =>
        `<option value="${idx}" ${Number(item.seatIdx) === idx ? "selected" : ""}>${escapeHtml(opt.label)}</option>`
      ).join("");

      const legsSelectHtml = SHOP_CONFIG.legsOptions.map(legName =>
        `<option value="${escapeHtml(legName)}" ${item.leg === legName ? "selected" : ""}>${escapeHtml(legName)}</option>`
      ).join("");

      const buttonsSelectHtml = SHOP_CONFIG.buttonsOptions.map(b =>
        `<option value="${escapeHtml(b.value)}" ${item.buttons === b.value ? "selected" : ""}>${escapeHtml(b.label)}</option>`
      ).join("");

      return `
        <div class="slm-cart-item">
          <div class="slm-cart-item-head">
            <div class="slm-item-left">
              <img src="${escapeHtml(item.img)}" class="slm-item-thumb" alt="Mebel">
              <div>
                <span class="slm-code-pill">${escapeHtml(item.code)}</span>
                <span class="slm-item-title">${escapeHtml(item.title)}</span>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">
                  Cena bazowa: ${Number(item.basePrice).toFixed(2)} zł / szt.
                </div>
              </div>
            </div>
            <button type="button" class="slm-btn-del" onclick="window.__slmRemove(${i})" title="Usuń pozycję">&times;</button>
          </div>

          <div class="slm-opt-grid">
            <div class="slm-opt-cell">
              <label>🪑 Siedzisko:</label>
              <select onchange="window.__slmUpdate(${i}, 'seatIdx', this.value)">
                ${seatSelectHtml}
              </select>
            </div>

            <div class="slm-opt-cell">
              <label>🦵 Nóżka (1-6):</label>
              <select onchange="window.__slmUpdate(${i}, 'leg', this.value)">
                ${legsSelectHtml}
              </select>
            </div>

            <div class="slm-opt-cell">
              <label>🔘 Układ guzików:</label>
              ${!item.skipButtons ? `
                <select onchange="window.__slmUpdate(${i}, 'buttons', this.value)">
                  ${buttonsSelectHtml}
                </select>
              ` : `
                <input type="text" value="Nie dotyczy ( bez guzików )" disabled style="color:#64748b; background:#f1f5f9;">
              `}
            </div>

            <div class="slm-opt-cell">
              <label>🎨 Tkanina / Kolor (wpisz):</label>
              <input type="text" value="${escapeHtml(item.fabric)}"
                placeholder="np. Jak na zdjęciu / Monolith 77"
                onchange="window.__slmUpdate(${i}, 'fabric', this.value)">
            </div>
          </div>

          <div class="slm-cart-item-foot">
            <div class="slm-qty-inline">
              <button type="button" onclick="window.__slmQty(${i}, -1)">-</button>
              <span>${item.qty} szt.</span>
              <button type="button" onclick="window.__slmQty(${i}, 1)">+</button>
            </div>
            <div>
              ${item.unitPrice.toFixed(2)} zł &times; ${item.qty} =
              <strong style="color:#8b1e41; font-size:15px;">${item.totalPrice.toFixed(2)} zł</strong>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const courierCost = shippingMode === "per_item" ? (courierRate * totalQty) : courierRate;
    document.getElementById("slmSubtotalText").innerText = subtotal.toFixed(2) + " zł";
    document.getElementById("slmCourierText").innerText = courierCost.toFixed(2) + " zł";

    const shipMethod = document.querySelector('input[name="slmShipRadio"]:checked')?.value || "courier";
    const finalShipping = shipMethod === "pickup" ? 0 : courierCost;
    const grandTotal = subtotal + finalShipping;

    document.getElementById("slmGrandTotalText").innerText = grandTotal.toFixed(2) + " zł";
  }

  window.__slmUpdate = function(idx, field, val) {
    if (!slmCart[idx]) return;
    if (field === "seatIdx") slmCart[idx].seatIdx = parseInt(val) || 0;
    else slmCart[idx][field] = val;
    saveCartToDevice(slmCart);
    renderCart();
  };

  window.__slmQty = function(idx, delta) {
    if (!slmCart[idx]) return;
    slmCart[idx].qty += delta;
    if (slmCart[idx].qty <= 0) slmCart.splice(idx, 1);
    saveCartToDevice(slmCart);
    renderCart();
  };

  window.__slmRemove = function(idx) {
    slmCart.splice(idx, 1);
    saveCartToDevice(slmCart);
    renderCart();
  };

  // =========================================================================
  // 8. АВТОМАТИЧНА ОБРОБКА ОГОЛОШЕНЬ НА СТОРІНЦІ (#001, #002...)
  // =========================================================================
  function enhanceProductCards() {
    const allButtons = Array.from(document.querySelectorAll("button, a")).filter(el => {
      if (el.closest("#slm24-root-container") || el.closest(".slm-prod-actions")) return false;
      const txt = (el.innerText || "").toLowerCase();
      return txt.includes("zapytaj o cenę") || txt.includes("dodaj do koszyka") || txt.includes("zamów");
    });

    allButtons.forEach((btn, idx) => {
      if (btn.dataset.slmEnhanced === "true") return;
      btn.dataset.slmEnhanced = "true";

      // Знаходимо картку оголошення
      const card = btn.closest(".product, .card, .item, .ogloszenie, article, li") || btn.closest("div")?.parentElement || btn.parentElement;
      if (!card) return;

      const titleEl = card.querySelector("h1, h2, h3, h4, .title, strong");
      const rawTitle = titleEl ? titleEl.innerText.trim() : "Mebel SLM24";
      const fullCardText = card.innerText || "";

      // Витягуємо код #001...#999 з початку заголовка або тексту картки
      const adCode = extractAdCode(rawTitle, fullCardText, idx + 1);
      const cleanName = cleanTitleFromCode(rawTitle);

      // Якщо це Caterpillar, Chesterfield або подушка (Poduszka) — вимикаємо ґудзики
      const skipButtons = /caterpillar|chesterfield|poduszka/i.test(rawTitle + " " + fullCardText);

      // Шукаємо ціну в картці (підтримує як подушки від 20 zł, так і крісла 1 360 zł)
      let basePrice = 0;
      const priceRegex = /(\d[\d\s.,]{0,6})\s*zł/gi;
      let match;
      while ((match = priceRegex.exec(fullCardText)) !== null) {
        const val = parseFloat(match[1].replace(/\s+/g, "").replace(",", "."));
        if (!isNaN(val) && val >= 15 && val > basePrice) {
          basePrice = val;
        }
      }
      if (!basePrice) basePrice = SHOP_CONFIG.defaultPriceFallback;

      const imgEl = card.querySelector("img");
      const imgSrc = imgEl && imgEl.src ? imgEl.src : "";

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "slm-prod-actions";
      actionsDiv.innerHTML = `
        <span class="slm-card-code-tag">Ogłoszenie ${escapeHtml(adCode)}</span>
        <div class="slm-qty-box">
          <span style="font-weight:700;">Ilość (szt.):</span>
          <div class="slm-qty-controls">
            <button type="button" class="slm-qty-btn-card slm-minus">-</button>
            <input type="text" class="slm-qty-input-card" value="1" readonly>
            <button type="button" class="slm-qty-btn-card slm-plus">+</button>
          </div>
        </div>
        <button type="button" class="slm-add-btn">
          🛒 Dodaj do koszyka (<span class="slm-live-price">${basePrice.toFixed(2)}</span> zł)
        </button>
        <button type="button" class="slm-
