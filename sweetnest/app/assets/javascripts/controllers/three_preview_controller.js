// Stimulus controller: three-preview (vista plana)
(function () {
  function ThreePreviewController() { }

  ThreePreviewController.prototype.connect = function () {
    this._onConfigChanged = this.updatePreview.bind(this);
    document.addEventListener("sweetnest:configChanged", this._onConfigChanged);
    document.addEventListener("sweetnest:levelsSelected", this._onConfigChanged);

    this.updatePreview();
  };

  ThreePreviewController.prototype.disconnect = function () {
    if (this._onConfigChanged) {
      document.removeEventListener("sweetnest:configChanged", this._onConfigChanged);
      document.removeEventListener("sweetnest:levelsSelected", this._onConfigChanged);
    }
  };

  ThreePreviewController.prototype.flatEl = function () {
    return this.element.querySelector("#flatPreview");
  };

  ThreePreviewController.prototype.wallNames = function () {
    return ["Frente", "Derecha", "Atras", "Izquierda"];
  };

  ThreePreviewController.prototype.updatePreview = function () {
    var state = window.Sweetnest && window.Sweetnest.state;
    if (!state) return;
    this.renderFlat();
  };

  ThreePreviewController.prototype.renderFlat = function () {
    var host = this.flatEl();
    if (!host) return;

    var state = window.Sweetnest && window.Sweetnest.state;
    var levels = Number(state && state.levels) || 0;

    if (!levels) {
      host.innerHTML =
        '<div class="w-full h-full flex items-center justify-center text-white/70 text-sm">' +
        "Selecciona niveles para ver la vista previa." +
        "</div>";
      return;
    }

    var wallNames = this.wallNames();
    var html = "";

    // Sin scroll interno: que el contenido crezca y el scroll lo maneje la página.
    html += '<div class="w-full p-4">';
    html += '<div class="space-y-4">';

    for (var i = 0; i < levels; i++) {
      html += '<div class="rounded-2xl border border-white/10 bg-white/5 p-4">';
      html += '<div class="flex items-center justify-between mb-3">';
      html += '<div class="text-white font-bold">Nivel ' + String(i + 1) + "</div>";
      html += "</div>";

      html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3">';
      for (var w = 0; w < 4; w++) {
        var candies = (state.boxConfig && state.boxConfig[i] && state.boxConfig[i][w]) ? state.boxConfig[i][w] : [];
        html += '<div class="rounded-xl border border-white/10 bg-white/5 p-3">';
        html += '<div class="text-xs text-white/70 font-bold mb-2">' + wallNames[w] + "</div>";

        if (!candies || !candies.length) {
          html += '<div class="text-white/40 text-xs">Sin dulces</div>';
        } else {
          var maxIcons = 10;
          var shown = candies.slice(0, maxIcons);
          var overflow = Math.max(0, candies.length - shown.length);
          html += '<div class="flex flex-wrap gap-2 items-center">';
          for (var c = 0; c < shown.length; c++) {
            var emoji = shown[c] && shown[c].emoji ? String(shown[c].emoji) : "🍬";
            html += '<span class="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg">' + emoji + "</span>";
          }
          if (overflow > 0) {
            html += '<span class="px-2 py-1 rounded-xl bg-white/10 border border-white/10 text-white/80 text-xs font-bold">+' + String(overflow) + "</span>";
          }
          html += "</div>";
        }

        html += "</div>";
      }
      html += "</div>";
      html += "</div>";
    }

    html += "</div></div>";
    host.innerHTML = html;
  };

  window.SweetNestThreePreviewController = ThreePreviewController;
})();

