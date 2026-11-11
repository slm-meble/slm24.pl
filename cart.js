// Повнофункціональний кошик для SLM24.pl (ЗАЛІЗОБЕТОННА ДОСТАВКА ТА СУМУВАННЯ)

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
            .slm-prod-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; }
            .slm-qty-box { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; font-size: 13px; color: #333; }
            .slm-qty-controls { display: flex; align-items: center; border: 1px solid #d5cdc2; border-radius: 4px; overflow: hidden; background: #fff; }
            .slm-qty-btn { background: #f4f2ee; border: none; width: 28px; height: 28px; font-size: 15px; font-weight: bold; cursor: pointer; color: #111; }
            .slm-qty-btn:hover { background: #e5e0d8; }
            .slm-qty-input { width: 36px; text-align: center; border: none; font-size: 13px; font-weight: bold; background: #fff; color: #111; }
            
            .slm-add-btn { width: 100%; background: #8B1E41; color: #fff; border: none; padding: 12px 8px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; transition: 0.2s; box-shadow: 0 4px 10px rgba(139, 30, 65, 0.2); }
            .slm-add-btn:hover { background: #6b1732; }
            
            .slm-ask-btn { width: 100%; background: transparent; color: #111; border: 1px solid #d5cdc2; padding: 9px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;}
            .slm-ask-btn:hover { background: #f4f2ee; }
            
            .slm-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; justify-content: center; align-items: center; padding: 15px; box-sizing: border-box; }
            .slm-modal-box { background: #fff; width: 100%; max-width: 650px; border-radius: 4px; padding: 22px; max-height: 92vh; overflow-y: auto; box-shadow: 0 12px 35px rgba(0,0,0,0.35); position: relative; box-sizing: border-box; font-family: 'Helvetica Neue', Arial, sans-serif; }
            .slm-input { width: 100%; padding: 10px; margin-bottom: 9px; border: 1px solid #d5cdc2; border-radius: 4px; font-size: 14px; box-sizing: border-box; outline: none; }
            .slm-input:focus { border-color: #8B1E41; }
            .slm-cart-item-edit select, .slm-cart-item-edit input { padding: 5px 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; margin-top: 3px; }
            
            .slm-floating-cart-btn { position: fixed; bottom: 18px; left: 18px; background: #8B1E41; color: #fff; border: none; border-radius: 4px; padding: 14px 22px; font-weight: 700; font-size: 14px; cursor: pointer; z-index: 900; box-shadow: 0 6px 18px rgba(139, 30, 65, 0.4); display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; transition: 0.2s;}
            .slm-floating-cart-btn:hover { background: #6b1732; transform: translateY(-2px); }
            .slm-cart-badge { background: #fff; color: #8B1E41; border-radius: 50%; padding: 2px 8px; font-size: 13px; font-weight: 800; }
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
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e0d8; padding-bottom:10px; margin-bottom:15px;">
                    <h2 style="margin:0; color:#8B1E41; font-size:18px; text-transform:uppercase; letter-spacing:1px;">🛒 Twój Koszyk</h2>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button type="button" id="slm-clear-cart" style="background:none; border:1px solid #ff4d4d; color:#ff4d4d; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;">Wyczyść koszyk</button>
                        <span id="slm-close-cart" style="cursor:pointer; font-size:26px; font-weight:bold; color:#888;">×</span>
                    </div>
                </div>
                <div id="slm-cart-items"></div>
                <div id="slm-cart-summary" style="text-align:right; font-size:18px; font-weight:bold; color:#111; margin:15px 0; display:none;">
                    Razem do zapłaty: <span id="slm-total-price" style="color:#8B1E41;">0.00</span> zł
                </div>
                <div id="slm-checkout-form" style="display:none; border-top:1px solid #e5e0d8; padding-top:15px;">
                    <h3 style="margin:0 0 10px 0; font-size:14px; color:#333; text-transform:uppercase;">Dane do dostawy:</h3>
                    
                    <input type="text" id="slm-name" class="slm-input" placeholder="* Imię i nazwisko" required>
                    
                    <div style="display:flex; gap:8px; margin-bottom:0;">
                        <input type="tel" id="slm-phone" class="slm-input" placeholder="* Numer telefonu" style="flex:1;" required>
                        <input type="email" id="slm-email" class="slm-input" placeholder="* Twój e-mail" style="flex:1;" required>
                    </div>

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
                        <button type="button" id="slm-order-whatsapp" style="flex:1; background:#25D366; color:#fff; border:none; padding:14px; border-radius:4px; font-weight:700; cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:1px;">📲 Wyślij (WhatsApp)</button>
                        <button type="button" id="slm-order-email" style="flex:1; background:#8B1E41; color:#fff; border:none; padding:14px; border-radius:4px; font-weight:700; cursor:pointer; font-size:12px; text-transform:uppercase; letter-spacing:1px;">✉️ Wyślij na E-mail</button>
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
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e0d8; padding-bottom:10px; margin-bottom:12px;">
                    <h3 style="margin:0; color:#8B1E41; font-size:16px; text-transform:uppercase;">Zapytaj o produkt</h3>
                    <span id="slm-close-ask" style="cursor:pointer; font-size:24px; font-weight:bold; color:#888;">×</span>
                </div>
                <p id="slm-ask-prod-name" style="font-weight:bold; color:#333; margin:0 0 12px 0; font-size:13px;"></p>
                <input type="email" id="slm-ask-email" class="slm-input" placeholder="* Twój adres e-mail">
                <input type="tel" id="slm-ask-phone" class="slm-input" placeholder="Numer telefonu (opcjonalnie)">
                <textarea id="slm-ask-question" class="slm-input" placeholder="* Twoje pytanie..." style="height:80px;"></textarea>
                <div style="display:flex; gap:8px;">
                    <button type="button" id="slm-send-ask-email" style="flex:1; background:#8B1E41; color:#fff; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer; text-transform:uppercase;">E-mail</button>
                    <button type="button" id="slm-send-ask-wa" style="flex:1; background:#25D366; color:#fff; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer; text-transform:uppercase;">WhatsApp</button>
                </div>
            </div>
        `;
        document.body.appendChild(askModal);

        function extractPriceNumber(str) {
            if (!str) return 0;
            const val = parseFloat(String(str).replace(/[^\d.,]/g, "").replace(",", "."));
            return isNaN(val) ? 0 : val;
        }

        // ЦЯ ФУНКЦІЯ ШУКАЄ ТІЛЬКИ НОМЕР (наприклад #014)
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
                
                // ВИТЯГУЄМО СТРОГИЙ НОМЕР (SKU) З НАЗВИ
                const sku = extractSku(title + " " + (descEl ? descEl.innerText.trim() : ""), index);

                let basePrice = priceEl ? extractPriceNumber(priceEl.innerText) : extractPriceNumber(card.innerText) || 1360;

                let deliveryPrice = 0;
                let carryPrice = 0;
                
                if (window.allProducts && Array.isArray(window.allProducts)) {
                    // НАДІЙНИЙ ПОШУК: Тільки за номером #014 == #014
                    const matchedProd = window.allProducts.find(p => {
                        const pSku = extractSku(p.name || p.title || "", index);
                        return pSku === sku;
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
                        baseDeliveryPrice: deliveryPrice, 
                        currentDeliveryVal: deliveryPrice, // Доставка автоматично ВРАХОВАНА
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
                    document.getElementById("slm-ask-prod-name").innerText = `Produkt (${sku}): ${title}`;
                    document.getElementById("slm-ask-modal").style.display = "flex";
                });
            });
        }

        setInterval(enhanceProductCards, 600);

        function saveAndRenderCart() {
            cart = cart.filter(item => item && item.name && !isNaN(parseFloat(item.basePrice)));

            let totalSum = 0, totalQty = 0;

            cart.forEach((item, idx) => {
                const base = parseFloat(item.basePrice) || 0;
                const spExtra = parseFloat(item.springVal) || 0;
                const crExtra = (item.buttons && item.buttons.includes("+50")) ? 50 : 0;
                const carry = parseFloat(item.carryVal) || 0;
                
                // ЖОРСТКЕ СУМУВАННЯ ДОСТАВКИ
                let delivery = 0;
                if (item.baseDeliveryPrice > 0) {
                    delivery = item.currentDeliveryVal !== undefined ? parseFloat(item.currentDeliveryVal) : parseFloat(item.baseDeliveryPrice);
                }

                item.unitPrice = base + spExtra + crExtra + carry + delivery;
                item.qty = parseInt(item.qty) || 1;
                item.totalPrice = item.unitPrice * item.qty;
                if (!item.cardId) item.cardId = extractSku(item.name, idx);
                
                totalSum += item.totalPrice;
                totalQty += item.qty;
            });

            localStorage.setItem("slm_cart", JSON.stringify(cart));
            const badge = document.getElementById("slm-cart-badge");
            if (badge) badge.innerText = totalQty;

            const container = document.getElementById("slm-cart-items");
            const form = document.getElementById("slm-checkout-form");
            const summary = document.getElementById("slm-cart-summary");

            if (cart.length === 0) {
                container.innerHTML = "<p style='color:#777; text-align:center; padding:18px 0;'>Twój koszyk jest pusty.</p>";
                form.style.display = "none"; summary.style.display = "none"; return;
            }

            form.style.display = "block"; summary.style.display = "block";
            document.getElementById("slm-total-price").innerText = totalSum.toFixed(2);

            container.innerHTML = cart.map((item, i) => {
                const displayTitle = item.name.includes(item.cardId) ? item.name : `<span style="color:#8B1E41;">[${item.cardId}]</span> ${item.name}`;
                
                return `
                <div class="slm-cart-item-edit" style="border-bottom:1px solid #e5e0d8; padding:12px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:8px;">
                        <strong style="font-size:13px; color:#111; line-height:1.35; text-transform:uppercase;">${displayTitle}</strong>
                        <button type="button" onclick="window.slmRemoveItem(${i})" style="background:#ff4d4d; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-weight:bold;">×</button>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:11px; color:#555; background:#fbfaf8; padding:10px; border-radius:4px; border:1px solid #e5e0d8;">
                        <div>
                            <b>🪑 Siedzisko:</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'springVal', this.value)" style="width:100%;">
                                <option value="0" ${item.springVal == 0 ? 'selected' : ''}>Bez sprężyny (w cenie)</option>
                                <option value="69" ${item.springVal == 69 ? 'selected' : ''}>Sprężyna falista (+69 zł)</option>
                            </select>
                        </div>
                        <div>
                            <b>🦵 Nóżka (1-6):</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'leg', this.value)" style="width:100%;">
                                ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${item.leg == n ? 'selected' : ''}>Nóżka nr ${n}</option>`).join('')}
                            </select>
                        </div>
                        ${!item.skipButtons ? `
                        <div>
                            <b>🔘 Układ guzików:</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'buttons', this.value)" style="width:100%;">
                                ${['A','B','C','D','E','F','Kryształki (+50 zł)'].map(b => `<option value="${b}" ${item.buttons === b ? 'selected' : ''}>${b.length === 1 ? 'Układ ' + b : b}</option>`).join('')}
                            </select>
                        </div>` : `
                        <div>
                            <b>🔘 Układ guzików:</b><br>
                            <span style="font-size:11px; color:#888; font-style:italic;">Nie dotyczy</span>
                        </div>`}
                        <div>
                            <b>🎨 Tkanina / Kolor:</b><br>
                            <input type="text" value="${item.fabric || 'Jak na zdjęciu'}" onchange="window.slmUpdateCartItem(${i}, 'fabric', this.value)" style="width:100%; box-sizing:border-box;">
                        </div>
                        <div>
                            <b>🚚 Dostawa (wybierz):</b><br>
                            ${item.baseDeliveryPrice > 0 ? `
                            <select onchange="window.slmUpdateCartItem(${i}, 'delivery', this.value)" style="width:100%; border-color:#8B1E41;">
                                <option value="${item.baseDeliveryPrice}" ${item.currentDeliveryVal > 0 ? 'selected' : ''}>Kurier (+${parseFloat(item.baseDeliveryPrice).toFixed(2)} zł)</option>
                                <option value="0" ${item.currentDeliveryVal === 0 ? 'selected' : ''}>Odbiór osobisty (0 zł)</option>
                            </select>
                            ` : `<span style="font-size:11px; color:#8B1E41; padding:5px 6px; display:block; border:1px solid #8B1E41; border-radius:4px; margin-top:3px; background:#fdf5f7; font-weight:bold;">Darmowa dostawa</span>`}
                        </div>
                        <div>
                            <b>💪 Wniesienie:</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'carryVal', this.value)" style="width:100%;" ${!item.carryPrice || item.carryPrice <= 0 ? 'disabled' : ''}>
                                ${item.carryPrice > 0 ? `
                                    <option value="0" ${item.carryVal == 0 ? 'selected' : ''}>Bez wniesienia (0 zł)</option>
                                    <option value="${item.carryPrice}" ${item.carryVal == item.carryPrice ? 'selected' : ''}>Z wniesieniem (+${parseFloat(item.carryPrice).toFixed(2)} zł)</option>
                                ` : `<option value="0">Brak opcji (0 zł)</option>`}
                            </select>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:12px;">
                        <div>
                            Ilość: 
                            <button type="button" onclick="window.slmChangeQty(${i}, -1)" style="padding:2px 8px; cursor:pointer; background:#e5e0d8; border:none; border-radius:3px;">-</button>
                            <b style="margin:0 6px;">${item.qty} szt.</b>
                            <button type="button" onclick="window.slmChangeQty(${i}, 1)" style="padding:2px 8px; cursor:pointer; background:#e5e0d8; border:none; border-radius:3px;">+</button>
                        </div>
                        <div>
                            <b style="color:#111; font-size:15px;">${item.totalPrice.toFixed(2)} zł</b>
                        </div>
                    </div>
                </div>`;
            }).join("");
        }

        window.slmUpdateCartItem = function(index, field, value) {
            if (!cart[index]) return;
            if (field === "springVal") {
                cart[index].springVal = parseFloat(value) || 0;
                cart[index].spring = value == "69" ? "Ze sprężyną falistą (+69 zł)" : "Bez sprężyny falistej (standard)";
            } else if (field === "carryVal") {
                cart[index].carryVal = parseFloat(value) || 0;
                cart[index].carryDesc = value > 0 ? `Z wniesieniem (+${parseFloat(value).toFixed(2)} zł)` : "Bez wniesienia (0 zł)";
            } else if (field === "delivery") {
                cart[index].currentDeliveryVal = parseFloat(value) || 0;
            } else {
                cart[index][field] = value;
            }
            saveAndRenderCart();
        };

        window.slmChangeQty = function(index, delta) {
            if (cart[index] && cart[index].qty + delta >= 1) {
                cart[index].qty += delta; saveAndRenderCart();
            }
        };

        window.slmRemoveItem = function(index) {
            cart.splice(index, 1); saveAndRenderCart();
        };

        document.getElementById("slm-clear-cart").addEventListener("click", () => {
            if (confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
                cart = []; localStorage.removeItem("slm_cart"); saveAndRenderCart();
            }
        });

        document.getElementById("slm-close-cart").addEventListener("click", () => {
            document.getElementById("slm-cart-modal").style.display = "none";
        });

        document.getElementById("slm-close-ask").addEventListener("click", () => {
            document.getElementById("slm-ask-modal").style.display = "none";
        });

        function buildOrderMessage() {
            const name = document.getElementById("slm-name").value.trim();
            const phone = document.getElementById("slm-phone").value.trim();
            const email = document.getElementById("slm-email").value.trim();
            
            const street = document.getElementById("slm-street").value.trim();
            const house = document.getElementById("slm-house").value.trim();
            const zip = document.getElementById("slm-zip").value.trim();
            const city = document.getElementById("slm-city").value.trim();
            
            const notes = document.getElementById("slm-notes").value.trim();
            const payment = document.getElementById("slm-payment").value;

            if (!name || !phone || !email || !street || !house || !zip || !city) {
                alert("Proszę wypełnić wszystkie wymagane pola (Imię, Telefon, E-mail oraz wszystkie pola Adresu)!");
                return null;
            }
            
            const fullAddress = `ul. ${street} ${house}, ${zip} ${city}`;

            let total = 0;
            let itemsText = cart.map((item, idx) => {
                total += item.totalPrice;
                const deliveryText = item.baseDeliveryPrice > 0 
                    ? (item.currentDeliveryVal > 0 ? `Kurier (+${item.currentDeliveryVal.toFixed(2)} zł)` : `Odbiór osobisty (0 zł)`)
                    : 'Darmowa dostawa';
                    
                return `${idx + 1}. [${item.cardId}] *${item.name}*\n` +
                       `   - Ilość: ${item.qty} szt. x ${item.unitPrice.toFixed(2)} zł = ${item.totalPrice.toFixed(2)} zł\n` +
                       `   - 🪑 Siedzisko: ${item.spring}\n` +
                       `   - 🦵 Nóżka nr: ${item.leg}\n` +
                       `   - 🔘 Układ guzików: ${item.skipButtons ? "Nie dotyczy" : item.buttons}\n` +
                       `   - 🎨 Tkanina / kolor: ${item.fabric || "Jak na zdjęciu"}\n` +
                       `   - 🚚 Dostawa: ${deliveryText}\n` +
                       `   - 💪 Wniesienie: ${item.carryDesc}`;
            }).join("\n\n");

            const fullMsg = `NOWE ZAMÓWIENIE - SLM24.PL\n========================\n` +
                            `ZAMÓWIONE PRODUKTY:\n${itemsText}\n\n` +
                            `RAZEM DO ZAPŁATY: ${total.toFixed(2)} zł\n` +
                            `SPOSÓB PŁATNOŚCI: ${payment}\n========================\n` +
                            `DANE KLIENTA:\nImię i nazwisko: ${name}\nTelefon: ${phone}\nE-mail: ${email}\nAdres dostawy: ${fullAddress}\nUwagi: ${notes || "Brak"}`;

            cart = [];
            localStorage.removeItem("slm_cart");
            saveAndRenderCart();
            document.getElementById("slm-cart-modal").style.display = "none";
            return fullMsg;
        }

        document.getElementById("slm-order-whatsapp").addEventListener("click", () => {
            const msg = buildOrderMessage();
            if (msg) window.open(`https://wa.me/48666688298?text=${encodeURIComponent(msg)}`, "_blank");
        });

        document.getElementById("slm-order-email").addEventListener("click", () => {
            const msg = buildOrderMessage();
            if (msg) window.location.href = `mailto:slmmble2022@gmail.com?subject=${encodeURIComponent("Nowe zamówienie ze sklepu SLM24.pl")}&body=${encodeURIComponent(msg)}`;
        });

        document.getElementById("slm-send-ask-wa").addEventListener("click", () => {
            const prod = document.getElementById("slm-ask-prod-name").innerText;
            const email = document.getElementById("slm-ask-email").value.trim();
            const phone = document.getElementById("slm-ask-phone").value.trim();
            const q = document.getElementById("slm-ask-question").value.trim();
            if (!email || !q) { alert("Podaj swój adres e-mail oraz wpisz pytanie!"); return; }
            window.open(`https://wa.me/48666688298?text=${encodeURIComponent(`ZAPYTANIE O PRODUKT - SLM24.PL\n${prod}\nE-mail klienta: ${email}\nTelefon: ${phone || "Brak"}\nPytanie: ${q}`)}`, "_blank");
        });

        document.getElementById("slm-send-ask-email").addEventListener("click", () => {
            const prod = document.getElementById("slm-ask-prod-name").innerText;
            const email = document.getElementById("slm-ask-email").value.trim();
            const phone = document.getElementById("slm-ask-phone").value.trim();
            const q = document.getElementById("slm-ask-question").value.trim();
            if (!email || !q) { alert("Podaj swój adres e-mail oraz wpisz pytanie!"); return; }
            window.location.href = `mailto:slmmble2022@gmail.com?subject=${encodeURIComponent("Zapytanie o produkt - SLM24.pl")}&body=${encodeURIComponent(`${prod}\nOdpowiedz na e-mail klienta: ${email}\nTelefon: ${phone || "Brak"}\n\nPytanie:\n${q}`)}`;
        });

        saveAndRenderCart();
        enhanceProductCards();
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initSLMCart); } 
    else { initSLMCart(); }
})();
