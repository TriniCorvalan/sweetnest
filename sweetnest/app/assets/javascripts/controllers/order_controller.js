// Stimulus controller: order
(function () {
  function OrderController() {}

  OrderController.prototype.connect = function () {
    this.bindNav();
    this.bindOrder();
  };

  OrderController.prototype.disconnect = function () {
    this.unbindNav();
    this.unbindOrder();
  };

  OrderController.prototype.bindNav = function () {
    this._go1 = this.goToStep.bind(this, 1);
    this._go2 = this.goToStep.bind(this, 2);
    this._go3 = this.goToStep.bind(this, 3);
    this._go4 = this.goToStep.bind(this, 4);

    this._nextToCart = this.onNextToCart.bind(this);

    this._backToLevels = document.getElementById("backToLevels");
    this._nextToCartBtn = document.getElementById("nextToCart");
    this._backToCandy = document.getElementById("backToCandy");
    this._nextToShipping = document.getElementById("nextToShipping");
    this._backToCart = document.getElementById("backToCart");

    if (this._backToLevels) this._backToLevels.addEventListener("click", this._go1);
    if (this._nextToCartBtn) this._nextToCartBtn.addEventListener("click", this._nextToCart);
    if (this._backToCandy) this._backToCandy.addEventListener("click", this._go2);
    if (this._nextToShipping) this._nextToShipping.addEventListener("click", this._go4);
    if (this._backToCart) this._backToCart.addEventListener("click", this._go3);
  };

  OrderController.prototype.unbindNav = function () {
    if (this._backToLevels) this._backToLevels.removeEventListener("click", this._go1);
    if (this._nextToCartBtn) this._nextToCartBtn.removeEventListener("click", this._nextToCart);
    if (this._backToCandy) this._backToCandy.removeEventListener("click", this._go2);
    if (this._nextToShipping) this._nextToShipping.removeEventListener("click", this._go4);
    if (this._backToCart) this._backToCart.removeEventListener("click", this._go3);
  };

  OrderController.prototype.goToStep = function (step, event) {
    if (event) event.preventDefault();
    window.Sweetnest.dispatch("sweetnest:goToStep", { step: step });
  };

  OrderController.prototype.onNextToCart = function (event) {
    if (event) event.preventDefault();
    if (!window.Sweetnest.hasSelectedCandies()) {
      window.alert("Selecciona al menos 1 dulce antes de continuar.");
      window.Sweetnest.dispatch("sweetnest:goToStep", { step: 2 });
      return;
    }
    window.Sweetnest.computeCart();
    window.Sweetnest.dispatch("sweetnest:goToStep", { step: 3 });
  };

  OrderController.prototype.bindOrder = function () {
    this._placeOrder = this.placeOrder.bind(this);
    this._completeOrder = this.completeOrder.bind(this);

    this._placeOrderBtn = document.getElementById("placeOrder");
    this._completeOrderBtn = document.getElementById("completeOrder");

    if (this._placeOrderBtn) this._placeOrderBtn.addEventListener("click", this._placeOrder);
    if (this._completeOrderBtn) this._completeOrderBtn.addEventListener("click", this._completeOrder);
  };

  OrderController.prototype.unbindOrder = function () {
    if (this._placeOrderBtn) this._placeOrderBtn.removeEventListener("click", this._placeOrder);
    if (this._completeOrderBtn) this._completeOrderBtn.removeEventListener("click", this._completeOrder);
  };

  OrderController.prototype.placeOrder = function (event) {
    if (event) event.preventDefault();

    var form = document.getElementById("shippingForm");
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var state = window.Sweetnest.state;
    window.Sweetnest.computeCart();

    var payload = {
      levels: state.levels,
      box_config: window.Sweetnest.serializeBoxConfig(),
      shipping: {
        full_name: (document.getElementById("shipping_full_name") || {}).value,
        street: (document.getElementById("shipping_street") || {}).value,
        unit: (document.getElementById("shipping_unit") || {}).value,
        city: (document.getElementById("shipping_city") || {}).value,
        zip: (document.getElementById("shipping_zip") || {}).value,
        special_instructions: (document.getElementById("shipping_special_instructions") || {}).value
      },
      total: Number(state.total || 0)
    };

    var csrf = document.querySelector("meta[name='csrf-token']");
    var csrfToken = csrf ? csrf.getAttribute("content") : null;

    fetch("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.ok ? r.json() : r.json().catch(function(){ return {}; }).then(function(j){ throw j; }); })
      .then(function (data) {
        var orderNumberEl = document.getElementById("orderNumber");
        if (orderNumberEl) orderNumberEl.textContent = data.order_number || "";
        var modal = document.getElementById("successModal");
        if (modal) modal.classList.remove("hidden");
      })
      .catch(function (err) {
        // Fallback simple: alert
        var msg = (err && err.error) || "No se pudo crear la orden. Revisa los datos e inténtalo de nuevo.";
        window.alert(msg);
      });
  };

  OrderController.prototype.completeOrder = function (event) {
    if (event) event.preventDefault();
    window.location.reload();
  };

  window.SweetNestOrderController = OrderController;
})();

