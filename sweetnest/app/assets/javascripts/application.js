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
  function boot() {
    if (!window.Stimulus || !window.Stimulus.Application) return;

    var application = window.Stimulus.Application.start();
    application.register("wizard", window.SweetNestWizardController);
    application.register("three-preview", window.SweetNestThreePreviewController);
    application.register("candy-selector", window.SweetNestCandySelectorController);
    application.register("cart", window.SweetNestCartController);
    application.register("order", window.SweetNestOrderController);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

