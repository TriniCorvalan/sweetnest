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

  CandySelectorController.prototype.renderLevelSelector = function () {
    var container = document.getElementById("levelSelector");
    if (!container) return;

    var state = window.Sweetnest.state;
    container.innerHTML = "";

    for (var i = 0; i < state.levels; i++) {
      var sizeKey = this.sizeKeyForLevel(i);
      var candies = (this.candiesBySize && this.candiesBySize[sizeKey]) || [];

      var wrapper = document.createElement("div");
      wrapper.className = "glass-effect rounded-2xl p-6 mb-6 shadow-glow level-enter-active";
      wrapper.innerHTML =
        '<h3 class="text-xl font-bold text-white mb-4 flex items-center">' +
          '<div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mr-3 text-lg font-black">' + (i + 1) + "</div>" +
          "Level " + (i + 1) + " (" + (sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)) + " candies)" +
        "</h3>" +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-3" data-level="' + i + '">' +
          [0,1,2,3].map(function (wall) {
            return (
              '<div class="wall-selector p-4 rounded-xl bg-white/10 border-2 border-dashed border-white/30 hover:border-white/60 transition-all">' +
                '<div class="text-center mb-3">' +
                  '<div class="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-xl">' +
                    ["Front", "Right", "Back", "Left"][wall] + "📦" +
                  "</div>" +
                  '<span class="text-white/70 text-sm block">Wall ' + (wall + 1) + "</span>" +
                "</div>" +
                '<div class="candy-grid" data-wall="' + wall + '">' +
                  candies.map(function (candy) {
                    return (
                      '<div class="candy-option p-2 rounded-lg cursor-pointer hover:scale-110 transition-all" data-candy-id="' + candy.id + '">' +
                        '<div class="w-12 h-12 mx-auto rounded-full shadow-lg flex items-center justify-center text-xl mb-1" style="background: linear-gradient(135deg, ' + candy.color_hex + ", " + candy.color_hex + 'cc);">' +
                          candy.emoji +
                        "</div>" +
                        '<div class="text-center text-xs">' +
                          '<div class="font-bold text-white">' + candy.name + "</div>" +
                          '<div class="text-yellow-300 font-bold">$' + Number(candy.price).toFixed(2) + "</div>" +
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
    var candyId = Number(event.currentTarget.getAttribute("data-candy-id"));
    var levelEl = event.currentTarget.closest("[data-level]");
    var wallEl = event.currentTarget.closest(".wall-selector").querySelector("[data-wall]");
    if (!levelEl || !wallEl) return;

    var level = Number(levelEl.getAttribute("data-level"));
    var wall = Number(wallEl.getAttribute("data-wall"));

    var state = window.Sweetnest.state;
    if (!state.boxConfig[level]) state.boxConfig[level] = [[], [], [], []];
    if (!state.boxConfig[level][wall]) state.boxConfig[level][wall] = [];

    var sizeKey = this.sizeKeyForLevel(level);
    var candies = (this.candiesBySize && this.candiesBySize[sizeKey]) || [];
    var candy = candies.find(function (c) { return Number(c.id) === candyId; });
    if (!candy) return;

    state.boxConfig[level][wall].push(candy);
    if (state.boxConfig[level][wall].length > 5) state.boxConfig[level][wall].shift();

    window.Sweetnest.computeCart();
    window.Sweetnest.dispatch("sweetnest:configChanged", { level: level, wall: wall });
  };

  window.SweetNestCandySelectorController = CandySelectorController;
})();

