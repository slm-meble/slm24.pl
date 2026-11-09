// Повнофункціональний кошик для SLM24.pl (З ДОСТАВКОЮ, ПОСЛУГОЮ ВНЕСЕННЯ ТА РОЗДІЛЕНОЮ АДРЕСОЮ)

(function() {
    function initSLMCart() {
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem("slm_cart")) || [];
        } catch (e) {
            cart = [];
        }

        const style = document.createElement("style");
        style.innerHTML = `
            #slm-top-cart { display: none !important; }
            .slm-prod-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; width: 100%; }
            .slm-qty-box { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; font-size: 13px; color: #333; }
            .slm-qty-controls { display: flex; align-items: center; border: 1px solid #d5cdc2; border-radius: 6px; overflow: hidden; background: #fff; }
            .slm-qty-btn { background: #f2ece4; border: none; width: 28px; height: 28px; font-size: 15px; font-weight: bold; cursor: pointer; color: #1f1d1a; }
            .slm-qty-btn:hover { background: #e6dfd5; }
            .slm-qty-input { width: 36px; text-align: center; border: none; font-size: 13px; font-weight: bold; background: #fff; color: #1f1d1a; }
            .slm-add-btn { width: 100%; background: #111111; color: #fff; border: none; padding: 10px 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; text-transform: uppercase; transition: background 0.2s; }
            .slm-add-btn:hover { background: #333; }
            .slm-ask-btn { width: 100%; background: #faf8f5; color: #555; border: 1px solid #e6dfd5; padding: 7px; border-radius: 4px; font-size: 12px; cursor: pointer; }
            .slm-ask-btn:hover { background: #f2ece4; color: #1f1d1a; }
            .slm-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; justify-content: center; align-items: center; padding: 15px; box-sizing: border-box; }
            .slm-modal-box { background: #fff; width: 100%; max-width: 650px; border-radius: 4px; padding: 22px; max-height: 92vh; overflow-y: auto; box-shadow: 0 12px 35px rgba(0,0,0,0.35); position: relative; box-sizing: border-box; font-family: 'Helvetica Neue', Arial, sans-serif; }
            .slm-input { width: 100%; padding: 10px; margin-bottom: 9px; border: 1px solid #d5cdc2; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
            .slm-cart-item-edit select, .slm-cart-item-edit input { padding: 5px 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; margin-top: 3px; }
            .slm-floating-cart-btn { position: fixed; bottom: 18px; left: 18px; background: #111111; color: #fff; border: none; border-radius: 50px; padding: 12px 20px; font-weight: 700; font-size: 15px; cursor: pointer; z-index: 900; box-shadow: 0 6px 18px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px; text-transform: uppercase;}
            .slm-floating-cart-btn:hover { background: #333; }
            .slm-cart-badge { background: #fff; color: #111111; border-radius: 50%; padding: 2px 8px; font-size: 13px; font-weight: 800; }
        `;
        document.head.appendChild(style);

        const floatBtn = document.createElement("button");
        floatBtn.className = "slm-floating-cart-btn";
        floatBtn.innerHTML = `🛒 Koszyk <span class="slm-cart-badge" id="slm-cart-badge">0</span>`;
        floatBtn.addEventListener("click", () => {
            saveAndRenderCart();
            document.getElementById("slm-cart-modal").style.display = "flex";
        });
        document.body.appendChild(floatBtn);

        const cartModal = document.createElement("div");
        cartModal.className = "slm-modal-overlay";
        cartModal.id = "slm-cart-modal";
        cartModal.innerHTML = `
            <div class="slm-modal-box">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">
                    <h2 style="margin:0; color:#111; font-size:18px; text-transform:uppercase;">🛒 Twój Koszyk</h2>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button type="button" id="slm-clear-cart" style="background:none; border:1px solid #ff4d4d; color:#ff4d4d; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;">Wyczyść koszyk</button>
                        <span id="slm-close-cart" style="cursor:pointer; font-size:26px; font-weight:bold; color:#888;">&times;</span>
                    </div>
                </div>
                <div id="slm-cart-items"></div>
                <div id="slm-cart-summary" style="text-align:right; font-size:18px; font-weight:bold; color:#111; margin:15px 0; display:none;">
                    Razem do zapłaty: <span id="slm-total-price">0.00</span> zł
                </div>
                <div id="slm-checkout-form" style="display:none; border-top:1px solid #eee; padding-top:15px;">
                    <h3 style="margin:0 0 10px 0; font-size:14px; color:#333; text-transform:uppercase;">Dane do dostawy:</h3>
                    
                    <input type="text" id="slm-name" class="slm-input" placeholder="* Imię i nazwisko" required>
                    
                    <div style="display:flex; gap:8px; margin-bottom:0;">
                        <input type="tel" id="slm-phone" class="slm-input" placeholder="* Numer telefonu" style="flex:1;" required>
                        <input type="email" id="slm-email" class="slm-input" placeholder="* Twój e-mail" style="flex:1;" required>
                    </div>

                    <!-- РОЗБИТА АДРЕСА -->
                    <div style="display:flex; gap:8px; margin-bottom:0;">
                        <input type="text" id="slm-street" class="slm-input" placeholder="* Ulica" style="flex:2;" required>
                        <input type="text" id="slm-house" class="slm-input" placeholder="* Nr domu/lokalu" style="flex:1;" required>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:0;">
                        <input type="text" id="slm-zip" class="slm-input" placeholder="* Kod pocztowy" style="flex:1;" required>
                        <input type="text" id="slm-city" class="slm-input" placeholder="* Miejscowość" style="flex:2;" required>
                    </div>
                    
                    <textarea id="slm-notes" class="slm-input" placeholder="Uwagi do zamówienia (np. piętro, dodatkowe życzenia)" style="height:50px;"></textarea>
                    
                    <label style="font-size:13px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Sposób płatności:</label>
                    <select id="slm-payment" class="slm-input" style="font-weight:bold;">
                        <option value="Zapłać teraz (Przelewy24 / BLIK / Przelew)">💳 Zapłać teraz (Przelewy24 / BLIK / Przelew)</option>
                        <option value="Płatność przy odbiorze (Za pobraniem)">🚚 Płatność przy odbiorze (Za pobraniem)</option>
                    </select>

                    <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                        <button type="button" id="slm-order-whatsapp" style="flex:1; background:#25D366; color:#fff; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:13px; text-transform:uppercase;">📲 Wyślij (WhatsApp)</button>
                        <button type="button" id="slm-order-email" style="flex:1; background:#111; color:#fff; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:13px; text-transform:uppercase;">✉️ Wyślij na E-mail</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(cartModal);

        const askModal = document.createElement("div");
        askModal.className = "slm-modal-overlay";
        askModal.id = "slm-ask-modal";
        askModal.innerHTML = `
            <div class="slm-modal-box" style="max-width:420px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:12px;">
                    <h3 style="margin:0; color:#111; font-size:16px; text-transform:uppercase;">Zapytaj o produkt</h3>
                    <span id="slm-close-ask" style="cursor:pointer; font-size:24px; font-weight:bold; color:#888;">&times;</span>
                </div>
                <p id="slm-ask-prod-name" style="font-weight:bold; color:#333; margin:0 0 12px 0; font-size:13px;"></p>
                <input type="email" id="slm-ask-email" class="slm-input" placeholder="* Twój adres e-mail">
                <input type="tel" id="slm-ask-phone" class="slm-input" placeholder="Numer telefonu (opcjonalnie)">
                <textarea id="slm-ask-question" class="slm-input" placeholder="* Twoje pytanie..." style="height:80px;"></textarea>
                <div style="display:flex; gap:8px;">
                    <button type="button" id="slm-send-ask-email" style="flex:1; background:#111; color:#fff; border:none; padding:10px; border-radius:4px; font-weight:bold; cursor:pointer;">E-mail</button>
                    <button type="button" id="slm-send-ask-wa" style="flex:1; background:#25D366; color:#fff; border:none; padding:10px; border-radius:4px; font-weight:bold; cursor:pointer;">WhatsApp</button>
                </div>
            </div>
        `;
        document.body.appendChild(askModal);

        function extractPriceNumber(str) {
            if (!str) return 0;
            const val = parseFloat(String(str).replace(/[^\d.,]/g, "").replace(",", "."));
            return isNaN(val) ? 0 : val;
        }

        function extractSku(text, fallbackIndex) {
            if (!text) return "#00" + (fallbackIndex + 1);
            const match = String(text).match(/#\s*\d+/);
            return match ? match[0].replace(/\s+/g, "") : "#00" + (fallbackIndex + 1);
        }

        function enhanceProductCards() {
            const cards = document.querySelectorAll("#product-list .product-card");
            cards.forEach((card, index) => {
                if (card.dataset.slmEnhanced === "true") return;
                card.dataset.slmEnhanced = "true";

                const titleEl = card.querySelector(".card-title");
                const priceEl = card.querySelector(".card-price");
                const descEl = card.querySelector(".card-desc");
                const oldBtn = card.querySelector(".card-order-btn");

                const title = titleEl ? titleEl.innerText.trim() : ("#" + String(index + 1).padStart(3, "0") + " Mebel SLM24");
                const sku = extractSku(title + " " + (descEl ? descEl.innerText.trim() : ""), index);

                let basePrice = priceEl ? extractPriceNumber(priceEl.innerText) : extractPriceNumber(card.innerText) || 1360;
                if (priceEl) priceEl.innerText = basePrice.toFixed(2) + " zł";

                // ВИПРАВЛЕНИЙ ПОШУК (Не зважаємо на великі/малі літери)
                let deliveryPrice = 0;
                let carryPrice = 0;
                if (window.allProducts && Array.isArray(window.allProducts)) {
                    const titleLower = title.toLowerCase();
                    const matchedProd = window.allProducts.find(p => {
                        const pName = (p.name || p.title || "").toLowerCase().trim();
                        return pName === titleLower;
                    });
                    
                    if (matchedProd) {
                        deliveryPrice = extractPriceNumber(matchedProd.deliveryPrice);
                        carryPrice = extractPriceNumber(matchedProd.carryPrice);
                    }
                }

                const skipButtons = /caterpillar|chesterfield|narożnik|naroznik|sofa|łóżko|lozko/i.test(title);
                if (oldBtn) oldBtn.style.display = "none";

                const actionsDiv = document.createElement("div");
                actionsDiv.className = "slm-prod-actions";
                actionsDiv.innerHTML = `
                    <div class="slm-qty-box">
                        <span style="font-weight:bold;">Ilość (szt.):</span>
                        <div class="slm-qty-controls">
                            <button type="button" class="slm-qty-btn slm-minus">-</button>
                            <input type="text" class="slm-qty-input" value="1" readonly>
                            <button type="button" class="slm-qty-btn slm-plus">+</button>
                        </div>
                    </div>
                    <button type="button" class="slm-add-btn">🛒 Do koszyka (<span class="slm-live-price">${basePrice.toFixed(2)}</span> zł)</button>
                    <button type="button" class="slm-ask-btn">✉️ Zapytaj o produkt</button>
                `;

                actionsDiv.addEventListener("click", e => e.stopPropagation());
                (card.querySelector(".card-body") || card).appendChild(actionsDiv);

                const qtyInput = actionsDiv.querySelector(".slm-qty-input");
                const livePriceEl = actionsDiv.querySelector(".slm-live-price");

                function updateCardPrice() {
                    const qty = parseInt(qtyInput.value) || 1;
                    livePriceEl.innerText = (basePrice * qty).toFixed(2);
                }

                actionsDiv.querySelector(".slm-minus").addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (parseInt(qtyInput.value) > 1) { qtyInput.value = parseInt(qtyInput.value) - 1; updateCardPrice(); }
                });

                actionsDiv.querySelector(".slm-plus").addEventListener("click", (e) => {
                    e.stopPropagation();
                    qtyInput.value = parseInt(qtyInput.value) + 1; updateCardPrice();
                });

                actionsDiv.querySelector(".slm-add-btn").addEventListener("click", (e) => {
                    e.stopPropagation();
                    cart.push({
                        name: title,
                        cardId: sku,
                        skipButtons: skipButtons,
                        basePrice: basePrice,
                        deliveryPrice: deliveryPrice,
                        carryPrice: carryPrice,
                        carryVal: 0,
                        carryDesc: "Bez wniesienia (0 zł)",
                        qty: parseInt(qtyInput.value) || 1,
                        springVal: 0,
                        spring: "Bez sprężyny falistej (standard)",
                        leg: "1",
                        buttons: skipButtons ? "Nie dotyczy" : "A",
                        fabric: "Jak na zdjęciu"
                    });

                    qtyInput.value = 1;
                    updateCardPrice();
                    saveAndRenderCart();
                    document.getElementById("slm-cart-modal").style.display = "flex";
                });

                actionsDiv.querySelector(".slm-ask-btn").addEventListener("click", (e) => {
                    e.stopPropagation();
