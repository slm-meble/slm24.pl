// Інтерактивний кошик для SLM24.pl
document.addEventListener("DOMContentLoaded", function() {
    // Створюємо плаваючу кнопку кошика
    const cartButton = document.createElement("div");
    cartButton.innerHTML = `
        <div id="slm-cart-btn" style="position: fixed; bottom: 20px; right: 20px; background: #9e2a48; color: white; padding: 12px 20px; border-radius: 30px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 9999; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            🛒 Koszyk (<span id="slm-cart-count">0</span>)
        </div>
    `;
    document.body.appendChild(cartButton);

    // Створюємо модальне вікно кошика
    const cartModal = document.createElement("div");
    cartModal.innerHTML = `
        <div id="slm-cart-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; justify-content: center; align-items: center;">
            <div style="background: white; width: 90%; max-width: 500px; padding: 25px; border-radius: 12px; max-height: 90vh; overflow-y: auto; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">
                    <h2 style="margin: 0; color: #9e2a48; font-size: 20px;">Twój Koszyk Zamówień</h2>
                    <span id="slm-close-modal" style="cursor: pointer; font-size: 24px; font-weight: bold; color: #666;">&times;</span>
                </div>
                <div id="slm-cart-items" style="margin-bottom: 15px;">Pusty koszyk</div>
                
                <div id="slm-checkout-form" style="border-top: 1px solid #ddd; padding-top: 15px; display: none;">
                    <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">Dane do dostawy i opcje:</h3>
                    <input type="text" id="slm-name" placeholder="Imię i nazwisko" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <input type="text" id="slm-phone" placeholder="Numer telefonu" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <textarea id="slm-address" placeholder="Adres dostawy (Ulica, nr, miasto, kod)" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px; height: 60px;"></textarea>
                    
                    <div style="margin-bottom: 8px;">
                        <label style="font-size: 14px; color: #555;">Sposób płatności:</label>
                        <select id="slm-payment" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="Za pobraniem">Płatność przy odbiorze (Za pobraniem)</option>
                            <option value="Przelew / BLIK">Przedpłata / BLIK / Przelewy24</option>
                        </select>
                    </div>

                    <button id="slm-submit-order" style="width: 100%; background: #28a745; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; margin-top: 10px;">Zamów z wysyłką</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(cartModal);

    let cart = [];

    // Логіка відкриття/закриття вікна
    document.getElementById("slm-cart-btn").addEventListener("click", () => {
        document.getElementById("slm-cart-modal").style.display = "flex";
        renderCart();
    });
    document.getElementById("slm-close-modal").addEventListener("click", () => {
        document.getElementById("slm-cart-modal").style.display = "none";
    });

    // Функція малювання кошика
    function renderCart() {
        const container = document.getElementById("slm-cart-items");
        const form = document.getElementById("slm-checkout-form");
        if (cart.length === 0) {
            container.innerHTML = "<p style='color: #777; text-align: center;'>Twój koszyk jest pusty.</p>";
            form.style.display = "none";
            return;
        }
        form.style.display = "block";
        let html = "";
        cart.forEach((item, index) => {
            html += `
                <div style="border-bottom: 1px dashed #eee; padding: 8px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>Cena: ${item.price} | Ilość: ${item.qty}</small><br>
                        <small style="color: #9e2a48;">Nóżka nr: ${item.leg} | Uклад ґудзиків: ${item.buttons}</small>
                    </div>
                    <button onclick="window.slmRemove(${index})" style="background: #ff4d4d; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">X</button>
                </div>
            `;
        });
        container.innerHTML = html;
        document.getElementById("slm-cart-count").innerText = cart.length;
    }

    window.slmRemove = function(index) {
        cart.splice(index, 1);
        renderCart();
    };

    // Перехоплюємо кнопки "Zapytaj o cenę" або замінюємо їх на "Додати в кошик" у каталозі
    // (Або додаємо селектори вибору параметрів на сторінку товарів)
});
