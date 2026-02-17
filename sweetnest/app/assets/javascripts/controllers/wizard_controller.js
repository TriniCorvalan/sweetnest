// Stimulus controller: wizard
(function () {
  function WizardController() {}

  WizardController.prototype.connect = function () {
    this.updateUI(1);

    this._onGoToStep = this.onGoToStep.bind(this);
    document.addEventListener("sweetnest:goToStep", this._onGoToStep);
  };

  WizardController.prototype.disconnect = function () {
    if (this._onGoToStep) document.removeEventListener("sweetnest:goToStep", this._onGoToStep);
  };

  WizardController.prototype.onGoToStep = function (event) {
    var step = Number((event && event.detail && event.detail.step) || 1);
    this.updateUI(step);
  };

  WizardController.prototype.updateUI = function (step) {
    var state = window.Sweetnest.state;
    state.currentStep = step;

    var stepEls = document.querySelectorAll("[data-sweetnest-step]");
    stepEls.forEach(function (node) {
      var nodeStep = Number(node.getAttribute("data-sweetnest-step"));
      node.classList.toggle("hidden", nodeStep !== step);
    });

    var currentStepEl = document.getElementById("currentStep");
    if (currentStepEl) currentStepEl.textContent = String(step);

    var progressFill = document.getElementById("progressFill");
    if (progressFill) progressFill.style.width = String(step * 25) + "%";

    var labels = ["Select Levels", "Choose Candies", "Review Cart", "Shipping"];
    var labelEl = document.getElementById("stepLabel");
    if (labelEl) labelEl.textContent = labels[step - 1] || "";

    window.Sweetnest.dispatch("sweetnest:stepChanged", { step: step });
  };

  window.SweetNestWizardController = WizardController;
})();

