// Stimulus controller: cart
(function () {
  function CartController() {}

  CartController.prototype.connect = function () {
    this._onConfigChanged = this.refresh.bind(this);
    this._onStepChanged = this.onStepChanged.bind(this);

    document.addEventListener("sweetnest:configChanged", this._onConfigChanged);
    document.addEventListener("sweetnest:levelsSelected", this._onConfigChanged);
    document.addEventListener("sweetnest:stepChanged", this._onStepChanged);

    this.refresh();
  };

  CartController.prototype.disconnect = function () {
    document.removeEventListener("sweetnest:configChanged", this._onConfigChanged);
    document.removeEventListener("sweetnest:levelsSelected", this._onConfigChanged);
    document.removeEventListener("sweetnest:stepChanged", this._onStepChanged);
  };

  CartController.prototype.refresh = function () {
    window.Sweetnest.computeCart();

    var state = window.Sweetnest.state;
    var cartCount = (state.cart || []).reduce(function (sum, item) { return sum + Number(item.quantity || 0); }, 0);

    var cartIndicator = document.getElementById("cartIndicator");
    if (cartIndicator) cartIndicator.classList.toggle("hidden", cartCount === 0);

    var cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) cartCountEl.textContent = String(cartCount);

    var totalPriceEl = document.getElementById("totalPrice");
    if (totalPriceEl) totalPriceEl.textContent = Number(state.total || 0).toFixed(2);

    var finalTotalEl = document.getElementById("finalTotal");
    if (finalTotalEl) finalTotalEl.textContent = Number(state.total || 0).toFixed(2);
  };

  CartController.prototype.onStepChanged = function (event) {
    var step = Number((event && event.detail && event.detail.step) || 1);
    if (step === 3) this.renderSummary();
  };

  CartController.prototype.renderSummary = function () {
    this.refresh();
    var container = document.getElementById("cartSummary");
    if (!container) return;

    var state = window.Sweetnest.state;
    var itemsHtml = (state.cart || []).map(function (item) {
      return (
        '<div class="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">' +
          '<div class="flex items-center space-x-3">' +
            '<div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg" style="background: linear-gradient(135deg, ' + (item.color_hex || "#fff") + ", " + (item.color_hex || "#fff") + 'cc);">' +
              item.emoji +
            "</div>" +
            "<div>" +
              '<div class="font-bold text-white">' + item.name + "</div>" +
              '<div class="text-white/70 text-sm">' + item.quantity + "x</div>" +
            "</div>" +
          "</div>" +
          '<div class="text-xl font-bold text-yellow-400">$' + Number(item.price || 0).toFixed(2) + "</div>" +
        "</div>"
      );
    }).join("");

    container.innerHTML =
      '<div class="glass-effect p-6 rounded-2xl mb-6">' +
        '<h3 class="text-xl font-bold text-white mb-4 flex items-center">' +
          '<span class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center mr-3 text-lg font-black text-gray-900">1</span>' +
          "SweetNest premium" +
        "</h3>" +
        '<div class="text-white/70 mb-3">SweetNest personalizable</div>' +
        '<div class="text-2xl font-bold text-yellow-400">$' + Number(state.basePrice || 0).toFixed(2) + "</div>" +
      "</div>" +
      itemsHtml;
  };

  window.SweetNestCartController = CartController;
})();

