// Stimulus controller: candy-selector
(function () {
  function CandySelectorController() {}

  CandySelectorController.prototype.connect = function () {
    this.candiesBySize = null;

    this._onLevelOptionClick = this.onLevelOptionClick.bind(this);
    this._onCandyClick = this.onCandyClick.bind(this);

    this.bindLevelOptions();
    this.loadCandies();
  };

  CandySelectorController.prototype.disconnect = function () {
    this.unbindLevelOptions();
    this.unbindCandyOptions();
  };

  CandySelectorController.prototype.bindLevelOptions = function () {
    var options = document.querySelectorAll(".level-option[data-levels]");
    options.forEach(function (opt) {
      opt.addEventListener("click", this._onLevelOptionClick);
    }, this);
  };

  CandySelectorController.prototype.unbindLevelOptions = function () {
    var options = document.querySelectorAll(".level-option[data-levels]");
    options.forEach(function (opt) {
      opt.removeEventListener("click", this._onLevelOptionClick);
    }, this);
  };

  CandySelectorController.prototype.bindCandyOptions = function () {
    var options = document.querySelectorAll(".candy-option[data-candy-id]");
    options.forEach(function (opt) {
      opt.addEventListener("click", this._onCandyClick);
    }, this);
  };

  CandySelectorController.prototype.unbindCandyOptions = function () {
    var options = document.querySelectorAll(".candy-option[data-candy-id]");
    options.forEach(function (opt) {
      opt.removeEventListener("click", this._onCandyClick);
    }, this);
  };

  CandySelectorController.prototype.loadCandies = function () {
    var self = this;
    fetch("/candies", { headers: { "Accept": "application/json" } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
      .then(function (data) {
        self.candiesBySize = data;
        if (window.Sweetnest.state.levels > 0) self.renderLevelSelector();
      })
      .catch(function () {
        // Fallback mínimo: sin catálogo (la UI seguirá visible pero sin opciones).
        self.candiesBySize = { small: [], medium: [], large: [] };
        if (window.Sweetnest.state.levels > 0) self.renderLevelSelector();
      });
  };

  CandySelectorController.prototype.onLevelOptionClick = function (event) {
    var levels = Number(event.currentTarget.getAttribute("data-levels"));
    var state = window.Sweetnest.state;
    state.levels = levels;
    state.boxConfig = {};
    state.cart = [];
    state.total = 0;

    this.renderLevelSelector();
    window.Sweetnest.dispatch("sweetnest:levelsSelected", { levels: levels });
    window.Sweetnest.dispatch("sweetnest:goToStep", { step: 2 });
  };

  CandySelectorController.prototype.sizeKeyForLevel = function (levelIndex) {
    return ["small", "medium", "large"][Math.min(levelIndex, 2)];
  };

  CandySelectorController.prototype.sizeKeysAllowedForLevel = function (levelIndex) {
    // Restricción inversa: en niveles grandes se permiten dulces más pequeños.
    // Nivel 1: small; Nivel 2: small+medium; Nivel 3: small+medium+large
    var idx = Math.min(Number(levelIndex) || 0, 2);
    if (idx === 0) return ["small"];
    if (idx === 1) return ["small", "medium"];
    return ["small", "medium", "large"];
  };

  CandySelectorController.prototype.levelSizeLabel = function (levelIndex) {
    var keys = this.sizeKeysAllowedForLevel(levelIndex);
    if (keys.length === 1) return "Pequeños";
    if (keys.length === 2) return "Pequeños y medianos";
    return "Pequeños, medianos y grandes";
  };

  CandySelectorController.prototype.renderLevelSelector = function () {
    var container = document.getElementById("levelSelector");
    if (!container) return;

    var state = window.Sweetnest.state;
    container.innerHTML = "";

    for (var i = 0; i < state.levels; i++) {
      var levelNumber = i + 1;
      var allowedKeys = this.sizeKeysAllowedForLevel(i);
      var candies = [];
      for (var k = 0; k < allowedKeys.length; k++) {
        var key = allowedKeys[k];
        candies = candies.concat(((this.candiesBySize && this.candiesBySize[key]) || []));
      }
      // Restricción opcional por nivel: si allowed_levels viene vacío, se permite en todos.
      candies = candies.filter(function (c) {
        var allowed = (c && c.allowed_levels) || [];
        if (!allowed || allowed.length === 0) return true;
        return allowed.map(Number).indexOf(levelNumber) !== -1;
      });

      var wrapper = document.createElement("div");
      wrapper.className = "glass-effect rounded-2xl p-6 mb-6 shadow-glow level-enter-active";
      wrapper.innerHTML =
        '<h3 class="text-xl font-bold text-white mb-4 flex items-center">' +
          '<div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mr-3 text-lg font-black">' + (i + 1) + "</div>" +
          "Nivel " + (i + 1) + " (" + this.levelSizeLabel(i) + ")" +
        "</h3>" +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3" data-level="' + i + '">' +
          [0,1,2,3].map(function (wall) {
            var selected = (state.boxConfig && state.boxConfig[i] && state.boxConfig[i][wall]) ? state.boxConfig[i][wall] : [];
            var capUnits = window.Sweetnest.wallCapacityUnits ? window.Sweetnest.wallCapacityUnits(i) : 4;
            var usedUnits = window.Sweetnest.wallLoadUnits ? window.Sweetnest.wallLoadUnits(i, wall) : selected.length;
            var remainingUnits = Math.max(0, Number(capUnits) - Number(usedUnits));
            return (
              '<div class="wall-selector p-4 rounded-xl bg-white/10 border-2 border-dashed border-white/30 hover:border-white/60 transition-all">' +
                '<div class="text-center mb-3">' +
                  '<div class="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-xl">' +
                    ["Frente", "Derecha", "Atras", "Izquierda"][wall] + "📦" +
                  "</div>" +
                  '<span class="text-white/70 text-sm block">Pared ' + (wall + 1) + "</span>" +
                  '<span class="text-white/50 text-xs block mt-1">Espacios: ' + String(usedUnits) + "/" + String(capUnits) + ' 🍬 · Restantes: ' + String(remainingUnits) + " 🍬</span>" +
                "</div>" +
                '<div class="candy-grid" data-wall="' + wall + '">' +
                  candies.map(function (candy) {
                    var stock = Number((candy && candy.stock) || 0);
                    var outOfStock = stock <= 0;
                    var count = selected.filter(function (c) { return Number(c.id) === Number(candy.id); }).length;
                    var weightUnits = window.Sweetnest.candyWeightUnits ? window.Sweetnest.candyWeightUnits(candy) : 1;
                    var optClass = outOfStock && count <= 0
                      ? "candy-option p-2 rounded-lg cursor-not-allowed opacity-50 transition-all"
                      : "candy-option p-2 rounded-lg cursor-pointer hover:scale-110 transition-all";
                    var subline = outOfStock
                      ? '<div class="text-rose-200 font-bold">Sin stock</div>'
                      : '<div class="text-yellow-300 font-bold">$' + Number(candy.price).toFixed(2) + "</div>";
                    var minusDisabled = count <= 0;
                    var plusDisabled = outOfStock || (Number(usedUnits) + Number(weightUnits) > Number(capUnits));
                    return (
                      '<div class="' + optClass + '" data-candy-id="' + candy.id + '" data-disabled="' + (outOfStock ? "true" : "false") + '">' +
                        '<div class="w-12 h-12 mx-auto rounded-full shadow-lg flex items-center justify-center text-xl mb-1" style="background: linear-gradient(135deg, ' + candy.color_hex + ", " + candy.color_hex + 'cc);">' +
                          candy.emoji +
                        "</div>" +
                        '<div class="text-center text-xs">' +
                          '<div class="font-bold text-white">' + candy.name + "</div>" +
                          subline +
                          '<div class="text-white/60 font-semibold">Aporte: ' + String(weightUnits) + " 🍬</div>" +
                        "</div>" +
                        '<div class="mt-2 flex items-center justify-center gap-2">' +
                          '<button type="button" data-adjust="minus" class="w-7 h-7 rounded-lg bg-white/10 border border-white/20 text-white font-bold ' + (minusDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/20") + '">' +
                            "−" +
                          "</button>" +
                          '<span class="min-w-[1.5rem] text-center text-white/90 font-bold text-xs">' + String(count) + "</span>" +
                          '<button type="button" data-adjust="plus" class="w-7 h-7 rounded-lg bg-white/10 border border-white/20 text-white font-bold ' + (plusDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/20") + '">' +
                            "+" +
                          "</button>" +
                        "</div>" +
                      "</div>"
                    );
                  }).join("") +
                "</div>" +
              "</div>"
            );
          }).join("") +
        "</div>";

      container.appendChild(wrapper);
    }

    // Rebind candy clicks for freshly created DOM.
    this.unbindCandyOptions();
    this.bindCandyOptions();
  };

  CandySelectorController.prototype.onCandyClick = function (event) {
    var adjustEl = event.target && event.target.closest ? event.target.closest("[data-adjust]") : null;
    var adjust = adjustEl ? adjustEl.getAttribute("data-adjust") : null;
    if (adjustEl) {
      event.preventDefault();
      event.stopPropagation();
    }

    var candyId = Number(event.currentTarget.getAttribute("data-candy-id"));
    var levelEl = event.currentTarget.closest("[data-level]");
    var wallEl = event.currentTarget.closest(".wall-selector").querySelector("[data-wall]");
    if (!levelEl || !wallEl) return;

    var level = Number(levelEl.getAttribute("data-level"));
    var wall = Number(wallEl.getAttribute("data-wall"));

    var state = window.Sweetnest.state;
    if (!state.boxConfig[level]) state.boxConfig[level] = [[], [], [], []];
    if (!state.boxConfig[level][wall]) state.boxConfig[level][wall] = [];

    var allowedKeys = this.sizeKeysAllowedForLevel(level);
    var candies = [];
    for (var k = 0; k < allowedKeys.length; k++) {
      var key = allowedKeys[k];
      candies = candies.concat(((this.candiesBySize && this.candiesBySize[key]) || []));
    }
    var candy = candies.find(function (c) { return Number(c.id) === candyId; });
    if (!candy) return;
    // Si el backend mandó allowed_levels, respétalo también en el click.
    var allowed = (candy && candy.allowed_levels) || [];
    if (allowed && allowed.length > 0 && allowed.map(Number).indexOf(level + 1) === -1) return;

    if (adjust === "minus") {
      var arr = state.boxConfig[level][wall];
      for (var idx = arr.length - 1; idx >= 0; idx--) {
        if (Number(arr[idx] && arr[idx].id) === Number(candy.id)) {
          arr.splice(idx, 1);
          break;
        }
      }
    } else {
      // plus o click en la tarjeta completa
      if (Number((candy && candy.stock) || 0) <= 0) return;

      var nextWeight = window.Sweetnest.candyWeightUnits ? window.Sweetnest.candyWeightUnits(candy) : 1;
      var cap = window.Sweetnest.wallCapacityUnits ? window.Sweetnest.wallCapacityUnits(level) : 4;
      var load = window.Sweetnest.wallLoadUnits ? window.Sweetnest.wallLoadUnits(level, wall) : state.boxConfig[level][wall].length;
      if (load + nextWeight > cap) {
        window.alert("No cabe en esta pared. Usado " + String(load) + "/" + String(cap) + " 🍬. Este dulce aporta " + String(nextWeight) + " 🍬.");
        return;
      }

      state.boxConfig[level][wall].push(candy);
    }

    window.Sweetnest.computeCart();
    window.Sweetnest.dispatch("sweetnest:configChanged", { level: level, wall: wall });
    // Re-render para actualizar contadores y estados de botones.
    this.renderLevelSelector();
  };

  window.SweetNestCandySelectorController = CandySelectorController;
})();

