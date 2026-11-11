// Повнофункціональний німецький кошик для SLM24.pl/de/ (У ЄВРО: 60€ КРІСЛО / 120€ ДИВАН)

(function() {
    function initSLMCartDE() {
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem("slm_cart_de")) || [];
        } catch (e) {
            cart = [];
        }

        const style = document.createElement("style");
        style.innerHTML = `
            .slm-prod-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; }
            .slm-qty-box { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; font-size: 13px; color: #333; }
            .slm-qty-controls { display: flex; align-items: center; border: 1px solid #d5cdc2; border-radius: 4px; overflow: hidden; background: #fff; }
            .slm-qty-btn { background: #f4f2ee; border: none; width: 28px; height: 28px; font-size: 15px; font-weight: bold; cursor: pointer; color: #111; }
            .slm-qty-input { width: 36px; text-align: center; border: none; font-size: 13px; font-weight: bold; background: #fff; color: #111; }
            .slm-add-btn { width: 100%; background: #8B1E41; color: #fff; border: none; padding: 12px 8px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; transition: 0.2s; }
            .slm-add-btn:hover { background: #6b1732; }
            .slm-ask-btn { width: 100%; background: transparent; color: #111; border: 1px solid #d5cdc2; padding: 9px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; }
            .slm-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; justify-content: center; align-items: center; padding: 12px; box-sizing: border-box; }
            .slm-modal-box { background: #fff; width: 100%; max-width: 650px; border-radius: 4px; padding: 20px; max-height: 92vh; overflow-y: auto; box-shadow: 0 12px 35px rgba(0,0,0,0.35); position: relative; box-sizing: border-box; }
            .slm-input { width: 100%; padding: 10px; margin-bottom: 9px; border: 1px solid #d5cdc2; border-radius: 4px; font-size: 14px; box-sizing: border-box; outline: none; }
            .slm-cart-item-edit select, .slm-cart-item-edit input { padding: 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; margin-top: 3px; width: 100%; box-sizing: border-box; }
            .slm-floating-cart-btn { position: fixed; bottom: 18px; left: 18px; background: #8B1E41; color: #fff; border: none; border-radius: 4px; padding: 14px 22px; font-weight: 700; font-size: 14px; cursor: pointer; z-index: 900; box-shadow: 0 6px 18px rgba(139, 30, 65, 0.4); display: flex; align-items: center; gap: 8px; text-transform: uppercase; }
            .slm-cart-badge { background: #fff; color: #8B1E41; border-radius: 50%; padding: 2px 8px; font-size: 13px; font-weight: 800; }
        `;
        document.head.appendChild(style);

        const floatBtn = document.createElement("button");
        floatBtn.className = "slm-floating-cart-btn";
        floatBtn.innerHTML = `🛒 Warenkorb <span class="slm-cart-badge" id="slm-cart-badge">0</span>`;
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
                    <h2 style="margin:0; color:#8B1E41; font-size:18px; text-transform:uppercase;">🛒 Ihr Warenkorb (DE)</h2>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button type="button" id="slm-clear-cart" style="background:none; border:1px solid #ff4d4d; color:#ff4d4d; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;">Warenkorb leeren</button>
                        <span id="slm-close-cart" style="cursor:pointer; font-size:26px; font-weight:bold; color:#888;">×</span>
                    </div>
                </div>
                <div id="slm-cart-items"></div>
                <div id="slm-cart-summary" style="text-align:right; font-size:18px; font-weight:bold; color:#111; margin:15px 0; display:none;">
                    Gesamtbetrag (inkl. Lieferung): <span id="slm-total-price" style="color:#8B1E41;">0.00</span> €
                </div>
                <div id="slm-checkout-form" style="display:none; border-top:1px solid #e5e0d8; padding-top:15px;">
                    <h3 style="margin:0 0 10px 0; font-size:14px; color:#333; text-transform:uppercase;">Lieferadresse in Deutschland:</h3>
                    <input type="text" id="slm-name" class="slm-input" placeholder="* Vor- und Nachname" required>
                    <div style="display:flex; gap:8px;">
                        <input type="tel" id="slm-phone" class="slm-input" placeholder="* Telefonnummer (WhatsApp)" style="flex:1;" required>
                        <input type="email" id="slm-email" class="slm-input" placeholder="* Ihre E-Mail-Adresse" style="flex:1;" required>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="slm-street" class="slm-input" placeholder="* Straße" style="flex:2;" required>
                        <input type="text" id="slm-house" class="slm-input" placeholder="* Hausnummer" style="flex:1;" required>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="slm-zip" class="slm-input" placeholder="* PLZ (Postleitzahl)" style="flex:1;" required>
                        <input type="text" id="slm-city" class="slm-input" placeholder="* Ort / Stadt" style="flex:2;" required>
                    </div>
                    <textarea id="slm-notes" class="slm-input" placeholder="Anmerkungen zur Bestellung (z.B. Etage, Wunschfarbe)" style="height:50px;"></textarea>
                    
                    <label style="font-size:13px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Zahlungsart:</label>
                    <select id="slm-payment" class="slm-input" style="font-weight:bold;">
                        <option value="Barzahlung bei Lieferung (beim Fahrer)">🚚 Barzahlung bei Lieferung (beim Fahrer)</option>
                        <option value="Banküberweisung (Vorkasse)">💳 Banküberweisung (Vorkasse)</option>
                    </select>

                    <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                        <button type="button" id="slm-order-whatsapp" style="flex:1; background:#25D366; color:#fff; border:none; padding:14px; border-radius:4px; font-weight:700; cursor:pointer; font-size:12px; text-transform:uppercase;">📲 Bestellung per WhatsApp</button>
                        <button type="button" id="slm-order-email" style="flex:1; background:#8B1E41; color:#fff; border:none; padding:14px; border-radius:4px; font-weight:700; cursor:pointer; font-size:12px; text-transform:uppercase;">✉️ Bestellung per E-Mail</button>
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
                    <h3 style="margin:0; color:#8B1E41; font-size:16px; text-transform:uppercase;">Frage zum Produkt</h3>
                    <span id="slm-close-ask" style="cursor:pointer; font-size:24px; font-weight:bold; color:#888;">×</span>
                </div>
                <p id="slm-ask-prod-name" style="font-weight:bold; color:#333; margin:0 0 12px 0; font-size:13px;"></p>
                <input type="email" id="slm-ask-email" class="slm-input" placeholder="* Ihre E-Mail-Adresse">
                <input type="tel" id="slm-ask-phone" class="slm-input" placeholder="Telefonnummer (optional)">
                <textarea id="slm-ask-question" class="slm-input" placeholder="* Ihre Frage..." style="height:80px;"></textarea>
                <div style="display:flex; gap:8px;">
                    <button type="button" id="slm-send-ask-email" style="flex:1; background:#8B1E41; color:#fff; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer; text-transform:uppercase;">E-Mail</button>
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

        function extractSku(text, fallbackIndex) {
            if (!text) return "#00" + (fallbackIndex + 1);
            const match = String(text).match(/#\s*\d+/);
            return match ? match[0].replace(/\s+/g, "") : "#00" + (fallbackIndex + 1);
        }

        function getButtonsMode(title, category) {
            const text = ((title || "") + " " + (category || "")).toLowerCase();
            if (/narożnik|naroznik|ecksofa|anton|pozzo|poso|łóżk|lozk|bett/i.test(text)) {
                return "none";
            }
            if (/chesterfield|chester/i.test(text)) {
                return "chester";
            }
            return "full";
        }

        function enhanceProductCards() {
            const cards = document.querySelectorAll("#product-list .product-card");
            cards.forEach((card, index) => {
                if (card.dataset.slmEnhanced === "true") return;
                card.dataset.slmEnhanced = "true";

                const titleEl = card.querySelector(".card-title");
                const oldBtn = card.querySelector(".card-order-btn");

                const title = titleEl ? titleEl.innerText.trim() : ("#" + String(index + 1).padStart(3, "0") + " Möbel SLM24");
                const sku = extractSku(title, index);
                let basePrice = extractPriceNumber(card.dataset.price) || 250;
                if (oldBtn) oldBtn.style.display = "none";

                const actionsDiv = document.createElement("div");
                actionsDiv.className = "slm-prod-actions";
                actionsDiv.innerHTML = `
                    <div class="slm-qty-box">
                        <span style="font-weight:bold;">Menge (Stk.):</span>
                        <div class="slm-qty-controls">
                            <button type="button" class="slm-qty-btn slm-minus">-</button>
                            <input type="text" class="slm-qty-input" value="1" readonly>
                            <button type="button" class="slm-qty-btn slm-plus">+</button>
                        </div>
                    </div>
                    <button type="button" class="slm-add-btn">🛒 In den Warenkorb (<span class="slm-live-price">${basePrice.toFixed(2)}</span> €)</button>
                    <button type="button" class="slm-ask-btn">✉️ Frage zum Produkt</button>
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

                    let deliveryPrice = extractPriceNumber(card.dataset.delivery) || 60;
                    let cat = card.dataset.category || "";
                    const bMode = getButtonsMode(title, cat);
                    
                    let defaultButtons = "Muster A";
                    if (bMode === "none") defaultButtons = "Nicht zutreffend";
                    if (bMode === "chester") defaultButtons = "Stoffknöpfe (im Preis)";

                    cart.push({
                        name: title,
                        cardId: sku,
                        buttonsMode: bMode,
                        basePrice: basePrice,
                        baseDeliveryPrice: deliveryPrice, 
                        currentDeliveryVal: deliveryPrice,
                        qty: parseInt(qtyInput.value) || 1,
                        leg: "1",
                        buttons: defaultButtons,
                        fabric: "Wie auf dem Foto"
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

        setInterval(enhanceProductCards, 500);

        function saveAndRenderCart() {
            cart = cart.filter(item => item && item.name && !isNaN(parseFloat(item.basePrice)));

            let totalSum = 0, totalQty = 0;

            cart.forEach((item, idx) => {
                const base = parseFloat(item.basePrice) || 0;
                const crExtra = (item.buttons && item.buttons.includes("+12")) ? 12 : 0; // Кришталики +12 € (50 zł / 4.25)
                const delivery = parseFloat(item.baseDeliveryPrice) || 60;

                item.unitPrice = base + crExtra + delivery;
                item.qty = parseInt(item.qty) || 1;
                item.totalPrice = item.unitPrice * item.qty;
                if (!item.cardId) item.cardId = extractSku(item.name, idx);
                
                totalSum += item.totalPrice;
                totalQty += item.qty;
            });

            localStorage.setItem("slm_cart_de", JSON.stringify(cart));
            const badge = document.getElementById("slm-cart-badge");
            if (badge) badge.innerText = totalQty;

            const container = document.getElementById("slm-cart-items");
            const form = document.getElementById("slm-checkout-form");
            const summary = document.getElementById("slm-cart-summary");

            if (cart.length === 0) {
                container.innerHTML = "<p style='color:#777; text-align:center; padding:18px 0;'>Ihr Warenkorb ist leer.</p>";
                form.style.display = "none"; summary.style.display = "none"; return;
            }

            form.style.display = "block"; summary.style.display = "block";
            document.getElementById("slm-total-price").innerText = totalSum.toFixed(2);

            container.innerHTML = cart.map((item, i) => {
                const displayTitle = item.name.includes(item.cardId) ? item.name : `<span style="color:#8B1E41;">[${item.cardId}]</span> ${item.name}`;
                const bMode = item.buttonsMode || getButtonsMode(item.name, "");

                let buttonsHtml = "";
                if (bMode === "full") {
                    const opts = ['Muster A','Muster B','Muster C','Muster D','Muster E','Muster F','Kristallknöpfe (+12 €)'];
                    buttonsHtml = `
                        <div>
                            <b>🔘 Steppung / Knöpfe:</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'buttons', this.value)">
                                ${opts.map(b => `<option value="${b}" ${item.buttons === b ? 'selected' : ''}>${b}</option>`).join('')}
                            </select>
                        </div>`;
                } else if (bMode === "chester") {
                    const opts = ['Stoffknöpfe (im Preis)', 'Kristallknöpfe (+12 €)'];
                    buttonsHtml = `
                        <div>
                            <b>🔘 Knöpfe:</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'buttons', this.value)">
                                ${opts.map(b => `<option value="${b}" ${item.buttons === b ? 'selected' : ''}>${b}</option>`).join('')}
                            </select>
                        </div>`;
                } else {
                    buttonsHtml = `
                        <div>
                            <b>🔘 Steppung / Knöpfe:</b><br>
                            <span style="font-size:11px; color:#888; font-style:italic; display:block; padding-top:6px;">Nicht zutreffend</span>
                        </div>`;
                }

                return `
                <div class="slm-cart-item-edit" style="border-bottom:1px solid #e5e0d8; padding:12px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:8px;">
                        <strong style="font-size:13px; color:#111; line-height:1.35; text-transform:uppercase;">${displayTitle}</strong>
                        <button type="button" onclick="window.slmRemoveItem(${i})" style="background:#ff4d4d; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-weight:bold;">×</button>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:11px; color:#555; background:#fbfaf8; padding:10px; border-radius:4px; border:1px solid #e5e0d8;">
                        <div>
                            <b>🪑 Sitzfläche:</b><br>
                            <span style="font-size:11px; color:#10b981; padding:5px 6px; display:block; border:1px solid #a7f3d0; border-radius:4px; margin-top:3px; background:#ecfdf5; font-weight:bold;">Wellenfederung (inklusive)</span>
                        </div>
                        <div>
                            <b>🦵 Fußvariante (1-6):</b><br>
                            <select onchange="window.slmUpdateCartItem(${i}, 'leg', this.value)">
                                ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${item.leg == n ? 'selected' : ''}>Fuß Nr. ${n}</option>`).join('')}
                            </select>
                        </div>
                        ${buttonsHtml}
                        <div>
                            <b>🎨 Stoff / Farbe:</b><br>
                            <input type="text" value="${item.fabric || 'Wie auf dem Foto'}" onchange="window.slmUpdateCartItem(${i}, 'fabric', this.value)">
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <b>🚚 Lieferung nach Deutschland (inklusive):</b><br>
                            <span style="font-size:11px; color:#8B1E41; padding:6px; display:block; border:1px solid #8B1E41; border-radius:4px; margin-top:3px; background:#fdf5f7; font-weight:bold;">Speditionslieferung (+${parseFloat(item.baseDeliveryPrice).toFixed(2)} €)</span>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:12px;">
                        <div>
                            Menge: 
                            <button type="button" onclick="window.slmChangeQty(${i}, -1)" style="padding:2px 8px; cursor:pointer; background:#e5e0d8; border:none; border-radius:3px;">-</button>
                            <b style="margin:0 6px;">${item.qty} Stk.</b>
                            <button type="button" onclick="window.slmChangeQty(${i}, 1)" style="padding:2px 8px; cursor:pointer; background:#e5e0d8; border:none; border-radius:3px;">+</button>
                        </div>
                        <div>
                            <span style="color:#666; font-size:11px; margin-right:6px;">(${item.basePrice.toFixed(0)} € + ${item.baseDeliveryPrice.toFixed(0)} € Versand)</span>
                            <b style="color:#8B1E41; font-size:15px;">${item.totalPrice.toFixed(2)} €</b>
                        </div>
                    </div>
                </div>`;
            }).join("");
        }

        window.slmUpdateCartItem = function(index, field, value) {
            if (!cart[index]) return;
            cart[index][field] = value;
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
            if (confirm("Möchten Sie den gesamten Warenkorb leeren?")) {
                cart = []; localStorage.removeItem("slm_cart_de"); saveAndRenderCart();
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
                alert("Bitte füllen Sie alle Pflichtfelder aus (Name, Telefon, E-Mail und vollständige Lieferadresse)!");
                return null;
            }
            
            const fullAddress = `${street} ${house}, ${zip} ${city}, Deutschland`;

            let total = 0;
            let itemsText = cart.map((item, idx) => {
                total += item.totalPrice;
                return `${idx + 1}. [${item.cardId}] *${item.name}*\n` +
                       `   - Menge: ${item.qty} Stk. x ${item.unitPrice.toFixed(2)} € = ${item.totalPrice.toFixed(2)} €\n` +
                       `   - 🪑 Sitzfläche: Wellenfederung (Standard)\n` +
                       `   - 🦵 Fuß Nr.: ${item.leg}\n` +
                       `   - 🔘 Steppung / Knöpfe: ${item.buttons}\n` +
                       `   - 🎨 Stoff / Farbe: ${item.fabric || "Wie auf dem Foto"}\n` +
                       `   - 🚚 Versand nach DE: +${item.baseDeliveryPrice.toFixed(2)} €`;
            }).join("\n\n");

            const fullMsg = `NEUE BESTELLUNG (DEUTSCHLAND) - SLM24.PL/DE\n========================\n` +
                            `BESTELLTE PRODUKTE:\n${itemsText}\n\n` +
                            `GESAMTBETRAG: ${total.toFixed(2)} €\n` +
                            `ZAHLUNGSART: ${payment}\n========================\n` +
                            `KUNDENDATEN:\nName: ${name}\nTelefon: ${phone}\nE-Mail: ${email}\nLieferadresse: ${fullAddress}\nAnmerkungen: ${notes || "Keine"}`;

            cart = [];
            localStorage.removeItem("slm_cart_de");
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
            if (msg) window.location.href = `mailto:slmmble2022@gmail.com?subject=${encodeURIComponent("Neue Bestellung (DE) - SLM24.pl")}&body=${encodeURIComponent(msg)}`;
        });

        document.getElementById("slm-send-ask-wa").addEventListener("click", () => {
            const prod = document.getElementById("slm-ask-prod-name").innerText;
            const email = document.getElementById("slm-ask-email").value.trim();
            const phone = document.getElementById("slm-ask-phone").value.trim();
            const q = document.getElementById("slm-ask-question").value.trim();
            if (!email || !q) { alert("Bitte E-Mail-Adresse und Frage eingeben!"); return; }
            window.open(`https://wa.me/48666688298?text=${encodeURIComponent(`PRODUKTANFRAGE (DE) - SLM24.PL\n${prod}\nE-Mail: ${email}\nTelefon: ${phone || "-"}\nFrage: ${q}`)}`, "_blank");
        });

        document.getElementById("slm-send-ask-email").addEventListener("click", () => {
            const prod = document.getElementById("slm-ask-prod-name").innerText;
            const email = document.getElementById("slm-ask-email").value.trim();
            const phone = document.getElementById("slm-ask-phone").value.trim();
            const q = document.getElementById("slm-ask-question").value.trim();
            if (!email || !q) { alert("Bitte E-Mail-Adresse und Frage eingeben!"); return; }
            window.location.href = `mailto:slmmble2022@gmail.com?subject=${encodeURIComponent("Produktanfrage (DE) - SLM24.pl")}&body=${encodeURIComponent(`${prod}\nE-Mail: ${email}\nTelefon: ${phone || "-"}\n\nFrage:\n${q}`)}`;
        });

        saveAndRenderCart();
        enhanceProductCards();
    }

    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initSLMCartDE); } 
    else { initSLMCartDE(); }
})();
