// SweetNest (Sprockets) entrypoint.
//
// Dependencias (CDN) cargadas en el layout:
// - Tailwind
// - THREE + OrbitControls
// - Stimulus UMD (window.Stimulus)
//
//= require sweetnest/state
//= require controllers/wizard_controller
//= require controllers/three_preview_controller
//= require controllers/candy_selector_controller
//= require controllers/cart_controller
//= require controllers/order_controller

(function () {
  function controllerRegistry() {
    return {
      wizard: window.SweetNestWizardController,
      "three-preview": window.SweetNestThreePreviewController,
      "candy-selector": window.SweetNestCandySelectorController,
      cart: window.SweetNestCartController,
      order: window.SweetNestOrderController
    };
  }

  function disconnectPreviousInstances() {
    var instances = window.__sweetnestControllerInstances || [];
    instances.forEach(function (instance) {
      if (instance && typeof instance.disconnect === "function") {
        try { instance.disconnect(); } catch (_) {}
      }
    });
    window.__sweetnestControllerInstances = [];
  }

  // Montaje robusto sin depender del runtime de Stimulus.
  function mountControllersManually() {
    var registry = controllerRegistry();
    var instances = [];

    document.querySelectorAll("[data-controller]").forEach(function (host) {
      var names = (host.getAttribute("data-controller") || "").split(/\s+/).filter(Boolean);
      names.forEach(function (name) {
        var Ctor = registry[name];
        if (!Ctor) return;
        try {
          var instance = new Ctor();
          instance.element = host;
          if (typeof instance.connect === "function") instance.connect();
          instances.push(instance);
        } catch (e) {
          // No bloquea el resto de controladores si uno falla.
          if (window.console && console.warn) console.warn("SweetNest controller error:", name, e);
        }
      });
    });

    window.__sweetnestControllerInstances = instances;
  }

  function boot() {
    disconnectPreviousInstances();
    mountControllersManually();
    installNavigationSafetyFallback();
  }

  function applyStepUI(step) {
    var stepEls = document.querySelectorAll("[data-sweetnest-step]");
    if (!stepEls.length) return;

    stepEls.forEach(function (node) {
      var nodeStep = Number(node.getAttribute("data-sweetnest-step"));
      var visible = nodeStep === step;
      node.classList.toggle("hidden", !visible);
      node.style.display = visible ? "" : "none";
    });

    var currentStepEl = document.getElementById("currentStep");
    if (currentStepEl) currentStepEl.textContent = String(step);

    var progressFill = document.getElementById("progressFill");
    if (progressFill) progressFill.style.width = String(step * 25) + "%";

    var labels = ["Select Levels", "Choose Candies", "Review Cart", "Shipping"];
    var labelEl = document.getElementById("stepLabel");
    if (labelEl) labelEl.textContent = labels[step - 1] || "";
  }

  function installNavigationSafetyFallback() {
    if (window.__sweetnestNavFallbackBound) return;
    window.__sweetnestNavFallbackBound = true;

    document.addEventListener("click", function (event) {
      var levelOption = event.target.closest(".level-option[data-levels]");
      if (levelOption) {
        var levels = Number(levelOption.getAttribute("data-levels"));
        if (window.Sweetnest && window.Sweetnest.state) {
          window.Sweetnest.state.levels = levels;
          window.Sweetnest.state.boxConfig = {};
          window.Sweetnest.state.cart = [];
          window.Sweetnest.state.total = 0;
        }
        if (window.Sweetnest && typeof window.Sweetnest.dispatch === "function") {
          window.Sweetnest.dispatch("sweetnest:levelsSelected", { levels: levels });
          window.Sweetnest.dispatch("sweetnest:goToStep", { step: 2 });
        }
        applyStepUI(2);
        return;
      }

      var stepMap = {
        backToLevels: 1,
        nextToCart: 3,
        backToCandy: 2,
        nextToShipping: 4,
        backToCart: 3
      };
      var target = event.target.closest("#backToLevels, #nextToCart, #backToCandy, #nextToShipping, #backToCart");
      if (!target) return;

      var step = stepMap[target.id];
      if (!step) return;
      if (window.Sweetnest && typeof window.Sweetnest.dispatch === "function") {
        window.Sweetnest.dispatch("sweetnest:goToStep", { step: step });
      }
      applyStepUI(step);
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Si Turbo está activo, re-monta controladores en cada navegación.
  document.addEventListener("turbo:load", boot);
})();

