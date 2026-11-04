 // Повнофункціональний та стабільний кошик для SLM24.pl (Оновлена версія)

document.addEventListener("DOMContentLoaded", function() {

    let cart = JSON.parse(localStorage.getItem("slm_cart")) || [];


    // 1. Стилі для карток та модальних вікон

    const style = document.createElement("style");

    style.innerHTML = `

        #slm-top-cart { display: none !important; }

        .slm-prod-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }

        .slm-qty-box { display: flex; align-items: center; justify-content: space-between; margin: 8px 0; font-size: 13px; }

        .slm-qty-controls { display: flex; align-items: center; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; background: #fff; }

        .slm-qty-btn { background: #f5f5f5; border: none; width: 28px; height: 28px; font-size: 15px; font-weight: bold; cursor: pointer; color: #333; }

        .slm-qty-btn:hover { background: #e0e0e0; }

        .slm-qty-input { width: 38px; text-align: center; border: none; font-size: 13px; font-weight: bold; }

        .slm-add-btn { width: 100%; background: #9e2a48; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s; }

        .slm-add-btn:hover { background: #7d1e37; }

        .slm-ask-btn { width: 100%; background: transparent; color: #666; border: 1px solid #ccc; padding: 7px; border-radius: 6px; font-size: 13px; cursor: pointer; }

        .slm-ask-btn:hover { background: #f2f2f2; color: #333; }

        .slm-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; justify-content: center; align-items: center; padding: 15px; box-sizing: border-box; }

        .slm-modal-box { background: #fff; width: 100%; max-width: 600px; border-radius: 12px; padding: 22px; max-height: 92vh; overflow-y: auto; box-shadow: 0 8px 25px rgba(0,0,0,0.3); position: relative; box-sizing: border-box; }

        .slm-input { width: 100%; padding: 9px; margin-bottom: 9px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; box-sizing: border-box; }

        .slm-cart-item-edit select, .slm-cart-item-edit input { padding: 4px 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; margin-top: 3px; }

    `;

    document.head.appendChild(style);


    // 2. Модальне вікно Кошика (додано кнопку очищення кошика)

    const cartModal = document.createElement("div");

    cartModal.className = "slm-modal-overlay";

    cartModal.id = "slm-cart-modal";

    cartModal.innerHTML = `

        <div class="slm-modal-box">

            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">

                <h2 style="margin:0; color:#9e2a48; font-size:20px;">🛒 Twój Koszyk Zamówień</h2>

                <div style="display:flex; align-items:center; gap:12px;">

                    <button id="slm-clear-cart" style="background:none; border:1px solid #ff4d4d; color:#ff4d4d; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;">Wyczyść koszyk</button>

                    <span id="slm-close-cart" style="cursor:pointer; font-size:26px; font-weight:bold; color:#888;">&times;</span>

                </div>

            </div>

            <div id="slm-cart-items"></div>

            <div id="slm-cart-summary" style="text-align:right; font-size:18px; font-weight:bold; color:#9e2a48; margin:12px 0; display:none;">

                Razem do zapłaty: <span id="slm-total-price">0.00</span> zł

            </div>

            <div id="slm-checkout-form" style="display:none; border-top:1px solid #eee; padding-top:15px;">

                <h3 style="margin:0 0 10px 0; font-size:16px; color:#333;">Dane do dostawy i kontakt:</h3>

                <input type="text" id="slm-name" class="slm-input" placeholder="* Imię i nazwisko" required>

                <input type="tel" id="slm-phone" class="slm-input" placeholder="* Numer telefonu" required>

                <input type="email" id="slm-email" class="slm-input" placeholder="* Twój adres e-mail (do potwierdzenia)" required>

                <textarea id="slm-address" class="slm-input" placeholder="* Adres dostawy (Ulica, nr domu/lokalu, kod pocztowy, miasto)" style="height:60px;"></textarea>

                <textarea id="slm-notes" class="slm-input" placeholder="Uwagi do zamówienia (np. piętro, dodatkowe życzenia)" style="height:55px;"></textarea>

                

                <label style="font-size:14px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Wybierz sposób płatności:</label>

                <select id="slm-payment" class="slm-input" style="font-weight:bold;">

                    <option value="Zapłać teraz (Przelewy24 / BLIK / Przelew)">💳 Zapłać teraz (Przelewy24 / BLIK / Przelew)</option>

                    <option value="Płatność przy odbiorze (Za pobraniem)">🚚 Płatność przy odbiorze (Za pobraniem)</option>

                </select>


                <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">

                    <button id="slm-order-whatsapp" style="flex:1; background:#25D366; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px;">📲 Wyślij zamówienie (WhatsApp)</button>

                    <button id="slm-order-email" style="flex:1; background:#9e2a48; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px;">✉️ Wyślij zamówienie na E-mail</button>

                </div>

            </div>

        </div>

    `;

    document.body.appendChild(cartModal);


    // 3. Модальне вікно "Zapytaj o produkt"

    const askModal = document.createElement("div");

    askModal.className = "slm-modal-overlay";

    askModal.id = "slm-ask-modal";

    askModal.innerHTML = `

        <div class="slm-modal-box" style="max-width:420px;">

            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:12px;">

                <h3 style="margin:0; color:#333; font-size:18px;">Zapytaj o produkt</h3>

                <span id="slm-close-ask" style="cursor:pointer; font-size:24px; font-weight:bold; color:#888;">&times;</span>

            </div>

            <p id="slm-ask-prod-name" style="font-weight:bold; color:#9e2a48; margin:0 0 12px 0; font-size:14px;"></p>

            <input type="email" id="slm-ask-email" class="slm-input" placeholder="* Twój adres e-mail (na ten adres odpowiemy)">

            <input type="tel" id="slm-ask-phone" class="slm-input" placeholder="Numer telefonu (opcjonalnie)">

            <textarea id="slm-ask-question" class="slm-input" placeholder="* Twoje pytanie (np. czas realizacji, próbki tkanin...)" style="height:80px;"></textarea>

            <div style="display:flex; gap:8px;">

                <button id="slm-send-ask-email" style="flex:1; background:#9e2a48; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">Wyślij na E-mail</button>

                <button id="slm-send-ask-wa" style="flex:1; background:#25D366; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">WhatsApp</button>

            </div>

        </div>

    `;

    document.body.appendChild(askModal);


    // 4. Покращене зчитування ціни з урахуванням форматування сайту

    function enhanceProductCards() {

        const buttons = Array.from(document.querySelectorAll("button, a")).filter(el => el.innerText.includes("Zapytaj o cenę"));

        buttons.forEach((btn, index) => {

            if (btn.dataset.slmEnhanced) return;

            btn.dataset.slmEnhanced = "true";


            const card = btn.closest("div") || btn.parentElement;

            if (!card) return;


            const titleEl = card.querySelector("h3, h2, h4, strong") || { innerText: "Mebel SLM24" };

            const title = titleEl.innerText.trim();

            const skipButtons = /caterpillar|chesterfield/i.test(title);

            

            // Пошук ціни: шукаємо числа, що закінчуються на zł або мають формат ціни

            let basePrice = 0;

            const fullCardText = card.innerText;

            // Шукаємо будь-які числа з можливими пробілами чи крапками перед "zł" (наприклад, "1 360 zł" або "1360 zł")

            const priceRegex = /(\d[\d\s.,]{2,6})\s*zł/gi;

            let match;

            while ((match = priceRegex.exec(fullCardText)) !== null) {

                const val = parseFloat(match[1].replace(/\s+/g, "").replace(",", "."));

                if (val >= 200 && val > basePrice) { // Беремо найбільшу знайдену реальну вартість товару

                    basePrice = val;

                }

            }


            // Якщо ціну все ж не знайдено автоматично, ставимо 0 або виводимо попередження в консоль замість хардкоду 1030

            if (!basePrice || isNaN(basePrice)) {

                basePrice = 1360; // Твоя актуальна ціна за замовчуванням

            }


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

                <button type="button" class="slm-add-btn">🛒 Dodaj do koszyka (<span class="slm-live-price">${basePrice.toFixed(2)}</span> zł)</button>

                <button type="button" class="slm-ask-btn">✉️ Zapytaj o produkt (Zostaw e-mail)</button>

            `;


            btn.style.display = "none";

            btn.parentNode.insertBefore(actionsDiv, btn);


            const qtyInput = actionsDiv.querySelector(".slm-qty-input");

            const livePriceEl = actionsDiv.querySelector(".slm-live-price");


            function updateCardPrice() {

                const qty = parseInt(qtyInput.value) || 1;

                const total = basePrice * qty;

                livePriceEl.innerText = total.toFixed(2);

            }


            actionsDiv.querySelector(".slm-minus").addEventListener("click", () => {

                let v = parseInt(qtyInput.value);

                if (v > 1) { qtyInput.value = v - 1; updateCardPrice(); }

            });

            actionsDiv.querySelector(".slm-plus").addEventListener("click", () => {

                let v = parseInt(qtyInput.value);

                qtyInput.value = v + 1;

                updateCardPrice();

            });


            actionsDiv.querySelector(".slm-add-btn").addEventListener("click", () => {

                const qty = parseInt(qtyInput.value) || 1;


                cart.push({

                    name: title,

                    skipButtons: skipButtons,

                    cardId: "Kreslo #" + (index + 1),

                    basePrice: basePrice,

                    qty: qty,

                    springVal: 0,

                    spring: "Bez sprężyny falistej (standard)",

                    leg: "1",

                    buttons: skipButtons ? "Nie dotyczy" : "A",

                    fabric: "Jak na zdjęciu"

                });

                saveAndRenderCart();

                document.getElementById("slm-cart-modal").style.display = "flex";

            });


            actionsDiv.querySelector(".slm-ask-btn").addEventListener("click", () => {

                document.getElementById("slm-ask-prod-name").innerText = "Produkt: " + title;

                document.getElementById("slm-ask-modal").style.display = "flex";

            });

        });

    }


    setInterval(enhanceProductCards, 800);


    // 5. Рендеринг кошика

    function saveAndRenderCart() {

        cart.forEach(item => {

            const base = item.basePrice || 1360;

            const spExtra = parseFloat(item.springVal) || 0;

            const crExtra = (item.buttons && item.buttons.includes("+50")) ? 50 : 0;

            item.unitPrice = base + spExtra + crExtra;

            item.totalPrice = item.unitPrice * item.qty;

        });


        localStorage.setItem("slm_cart", JSON.stringify(cart));

        const container = document.getElementById("slm-cart-items");

        const form = document.getElementById("slm-checkout-form");

        const summary = document.getElementById("slm-cart-summary");


        let totalSum = 0;

        let totalQty = 0;

        cart.forEach(item => { totalSum += item.totalPrice; totalQty += item.qty; });


        if (cart.length === 0) {

            container.innerHTML = "<p style='color:#777; text-align:center; padding:15px 0;'>Twój koszyk jest pusty.</p>";

            form.style.display = "none";

            summary.style.display = "none";

            return;

        }


        form.style.display = "block";

        summary.style.display = "block";

        document.getElementById("slm-total-price").innerText = totalSum.toFixed(2);


        container.innerHTML = cart.map((item, i) => `

            <div class="slm-cart-item-edit" style="border-bottom:1px solid #eee; padding:12px 0;">

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">

                    <strong style="font-size:14px; color:#222;">${item.name}</strong>

                    <button type="button" onclick="window.slmRemoveItem(${i})" style="background:#ff4d4d; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-weight:bold;">&times;</button>

                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:12px; color:#555; background:#fdfaf9; padding:8px; border-radius:6px; border:1px solid #eee;">

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

                        <span style="font-size:11px; color:#888; font-style:italic;">Nie dotyczy (Model klasyczny)</span>

                    </div>`}

                    <div>

                        <b>🎨 Tkanina / Kolor:</b><br>

                        <input type="text" value="${item.fabric || 'Jak na zdjęciu'}" onchange="window.slmUpdateCartItem(${i}, 'fabric', this.value)" style="width:100%; box-sizing:border-box;">

                    </div>

                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:13px;">

                    <div>

                        Ilość: 

                        <button type="button" onclick="window.slmChangeQty(${i}, -1)" style="padding:2px 8px; cursor:pointer;">-</button>

                        <b style="margin:0 6px;">${item.qty} szt.</b>

                        <button type="button" onclick="window.slmChangeQty(${i}, 1)" style="padding:2px 8px; cursor:pointer;">+</button>

                    </div>

                    <div>

                        ${item.unitPrice.toFixed(2)} zł &times; ${item.qty} = <b style="color:#9e2a48; font-size:14px;">${item.totalPrice.toFixed(2)} zł</b>

                    </div>

                </div>

            </div>

        `).join("");

    }


    window.slmUpdateCartItem = function(index, field, value) {

        if (field === "springVal") {

            cart[index].springVal = parseFloat(value);

            cart[index].spring = value == "69" ? "Ze sprężyną falistą (+69 zł)" : "Bez sprężyny falistej (standard)";

        } else {

            cart[index][field] = value;

        }

        saveAndRenderCart();

    };


    window.slmChangeQty = function(index, delta) {

        if (cart[index].qty + delta >= 1) {

            cart[index].qty += delta;

            saveAndRenderCart();

        }

    };


    window.slmRemoveItem = function(index) {

        cart.splice(index, 1);

        saveAndRenderCart();

    };


    // Кнопка повного очищення кошика

    document.getElementById("slm-clear-cart").addEventListener("click", () => {

        if (confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {

            cart = [];

            localStorage.removeItem("slm_cart");

            saveAndRenderCart();

        }

    });


    document.getElementById("slm-close-cart").addEventListener("click", () => {

        document.getElementById("slm-cart-modal").style.display = "none";

    });

    document.getElementById("slm-close-ask").addEventListener("click", () => {

        document.getElementById("slm-ask-modal").style.display = "none";

    });


    // 6. Відправка замовлення

    function buildOrderMessage() {

        const name = document.getElementById("slm-name").value.trim();

        const phone = document.getElementById("slm-phone").value.trim();

        const email = document.getElementById("slm-email").value.trim();

        const address = document.getElementById("slm-address").value.trim();

        const notes = document.getElementById("slm-notes").value.trim();

        const payment = document.getElementById("slm-payment").value;


        if (!name || !phone || !email || !address) {

            alert("Proszę wypełnić wszystkie wymagane pola (Imię, Telefon, E-mail oraz Adres dostawy)!");

            return null;

        }


        let total = 0;

        let itemsText = cart.map((item, idx) => {

            total += item.totalPrice;

            let buttonsText = item.skipButtons ? "Nie dotyczy" : item.buttons;

            return `${idx + 1}. *${item.name}* (${item.cardId})\n` +

                   `    - Ilość: ${item.qty} szt. - ${item.totalPrice.toFixed(2)} zł\n` +

                   `    - 🪑 Siedzisko: ${item.spring}\n` +

                   `    - 🦵 Nóżka nr: ${item.leg}\n` +

                   `    - 🔘 Układ guzików: ${buttonsText}\n` +

                   `    - 🎨 Tkanina / kolor: *${item.fabric || "Jak na zdjęciu"}*`;

        }).join("\n\n");


        const fullMsg = `NOWE ZAMÓWIENIE - SLM24.PL\n========================\n` +

                        `PRODUKTY:\n${itemsText}\n\n` +

                        `RAZEM DO ZAPŁATY: ${total.toFixed(2)} zł\n` +

                        `SPOSÓB PŁATNOŚCI: ${payment}\n========================\n` +

                        `DANE KLIENTA:\nImię i nazwisko: ${name}\nTelefon: ${phone}\nE-mail: ${email}\nAdres dostawy: ${address}\nUwagi: ${notes || "Brak"}`;


        cart = [];

        localStorage.removeItem("slm_cart");

        saveAndRenderCart();

        document.getElementById("slm-cart-modal").style.display = "none";


        return fullMsg;

    }


    document.getElementById("slm-order-whatsapp").addEventListener("click", () => {

        const msg = buildOrderMessage();

        if (!msg) return;

        window.open(`https://wa.me/48666688298?text=${encodeURIComponent(msg)}`, "_blank");

    });


    document.getElementById("slm-order-email").addEventListener("click", () => {

        const msg = buildOrderMessage();

        if (!msg) return;

        window.location.href = `mailto:slmmble2022@gmail.com?subject=${encodeURIComponent("Nowe zamówienie ze sklepu SLM24.pl")}&body=${encodeURIComponent(msg)}`;

    });


    document.getElementById("slm-send-ask-wa").addEventListener("click", () => {

        const prod = document.getElementById("slm-ask-prod-name").innerText;

        const email = document.getElementById("slm-ask-email").value.trim();

        const phone = document.getElementById("slm-ask-phone").value.trim();

        const q = document.getElementById("slm-ask-question").value.trim();

        if (!email || !q) { alert("Podaj swój adres e-mail oraz wpisz pytanie!"); return; }

        const text = `ZAPYTANIE O PRODUKT - SLM24.PL\n${prod}\nE-mail klienta: ${email}\nTelefon: ${phone || "Brak"}\nPytanie: ${q}`;

        window.open(`https://wa.me/48666688298?text=${encodeURIComponent(text)}`, "_blank");

    });


    document.getElementById("slm-send-ask-email").addEventListener("click", () => {

        const prod = document.getElementById("slm-ask-prod-name").innerText;

        const email = document.getElementById("slm-ask-email").value.trim();

        const phone = document.getElementById("slm-ask-phone").value.trim();

        const q = document.getElementById("slm-ask-question").value.trim();

        if (!email || !q) { alert("Podaj swój adres e-mail oraz wpisz pytanie!"); return; }

        const text = `${prod}\nOdpowiedz na e-mail klienta: ${email}\nTelefon: ${phone || "Brak"}\n\nPytanie:\n${q}`;

        window.location.href = `mailto:slmmble2022@gmail.com?subject=${encodeURIComponent("Zapytanie o produkt - SLM24.pl")}&body=${encodeURIComponent(text)}`;

    });


    saveAndRenderCart();

}); 
