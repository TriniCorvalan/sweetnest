// Stimulus controller: three-preview
(function () {
  function ThreePreviewController() {}

  ThreePreviewController.prototype.connect = function () {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.contentGroup = null;
    this.viewMode = "3d"; // "3d" | "flat"
    this.rotationIndex = 0; // 0..3 => Frente, Derecha, Atras, Izquierda
    this._candyTextureCache = {};

    this.initThree();
    this.bindUI();

    this._onConfigChanged = this.updatePreview.bind(this);
    document.addEventListener("sweetnest:configChanged", this._onConfigChanged);
    document.addEventListener("sweetnest:levelsSelected", this._onConfigChanged);

    this.updatePreview();

    this._onResize = this.onResize.bind(this);
    window.addEventListener("resize", this._onResize);
  };

  ThreePreviewController.prototype.disconnect = function () {
    if (this._onConfigChanged) {
      document.removeEventListener("sweetnest:configChanged", this._onConfigChanged);
      document.removeEventListener("sweetnest:levelsSelected", this._onConfigChanged);
    }
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    this.unbindUI();

    try {
      var canvas = this.canvasEl();
      if (canvas) canvas.innerHTML = "";
    } catch (_) {}

    try {
      if (this.renderer && typeof this.renderer.dispose === "function") this.renderer.dispose();
    } catch (_) {}
  };

  ThreePreviewController.prototype.canvasEl = function () {
    return this.element.querySelector("#threeCanvas");
  };

  ThreePreviewController.prototype.flatEl = function () {
    return this.element.querySelector("#flatPreview");
  };

  ThreePreviewController.prototype.mode3dBtn = function () {
    return this.element.querySelector("#previewMode3d");
  };

  ThreePreviewController.prototype.modeFlatBtn = function () {
    return this.element.querySelector("#previewModeFlat");
  };

  ThreePreviewController.prototype.rotateLeftBtn = function () {
    return this.element.querySelector("#previewRotateLeft");
  };

  ThreePreviewController.prototype.rotateRightBtn = function () {
    return this.element.querySelector("#previewRotateRight");
  };

  ThreePreviewController.prototype.sideLabelEl = function () {
    return this.element.querySelector("#previewSideLabel");
  };

  ThreePreviewController.prototype.wallNames = function () {
    return ["Frente", "Derecha", "Atras", "Izquierda"];
  };

  ThreePreviewController.prototype.bindUI = function () {
    var self = this;
    this._onMode3d = function () { self.setViewMode("3d"); };
    this._onModeFlat = function () { self.setViewMode("flat"); };
    this._onRotateLeft = function () { self.rotateBy(-1); };
    this._onRotateRight = function () { self.rotateBy(1); };

    var b3d = this.mode3dBtn();
    var bFlat = this.modeFlatBtn();
    var bL = this.rotateLeftBtn();
    var bR = this.rotateRightBtn();
    if (b3d) b3d.addEventListener("click", this._onMode3d);
    if (bFlat) bFlat.addEventListener("click", this._onModeFlat);
    if (bL) bL.addEventListener("click", this._onRotateLeft);
    if (bR) bR.addEventListener("click", this._onRotateRight);

    this.applyModeUI();
    this.applyRotationUI();
  };

  ThreePreviewController.prototype.unbindUI = function () {
    var b3d = this.mode3dBtn();
    var bFlat = this.modeFlatBtn();
    var bL = this.rotateLeftBtn();
    var bR = this.rotateRightBtn();
    if (b3d && this._onMode3d) b3d.removeEventListener("click", this._onMode3d);
    if (bFlat && this._onModeFlat) bFlat.removeEventListener("click", this._onModeFlat);
    if (bL && this._onRotateLeft) bL.removeEventListener("click", this._onRotateLeft);
    if (bR && this._onRotateRight) bR.removeEventListener("click", this._onRotateRight);
  };

  ThreePreviewController.prototype.initThree = function () {
    var canvas = this.canvasEl();
    if (!canvas || !window.THREE) return;

    // Evita duplicar canvases si Turbo re-monta controladores.
    canvas.innerHTML = "";

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a0b2e);

    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.appendChild(this.renderer.domElement);

    var ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Modo “botones”: sin drag/zoom.
    this.controls = null;

    this.contentGroup = new THREE.Group();
    this.scene.add(this.contentGroup);

    this.camera.position.set(0, 1.2, 6);
    this.camera.lookAt(0, 1.2, 0);

    this.animate();
  };

  ThreePreviewController.prototype.animate = function () {
    var self = this;
    if (!self.renderer || !self.scene || !self.camera) return;

    requestAnimationFrame(function () { self.animate(); });
    if (self.controls) self.controls.update();
    self.renderer.render(self.scene, self.camera);
  };

  ThreePreviewController.prototype.onResize = function () {
    var canvas = this.canvasEl();
    if (!canvas || !this.camera || !this.renderer) return;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };

  ThreePreviewController.prototype.setViewMode = function (mode) {
    this.viewMode = mode === "flat" ? "flat" : "3d";
    this.applyModeUI();
    this.updatePreview();
  };

  ThreePreviewController.prototype.applyModeUI = function () {
    var canvas = this.canvasEl();
    var flat = this.flatEl();
    var b3d = this.mode3dBtn();
    var bFlat = this.modeFlatBtn();
    var is3d = this.viewMode === "3d";

    if (canvas) canvas.classList.toggle("hidden", !is3d);
    if (flat) flat.classList.toggle("hidden", is3d);

    if (b3d) {
      b3d.setAttribute("aria-pressed", is3d ? "true" : "false");
      b3d.classList.toggle("bg-white/15", is3d);
      b3d.classList.toggle("text-white", is3d);
      b3d.classList.toggle("text-white/70", !is3d);
    }
    if (bFlat) {
      bFlat.setAttribute("aria-pressed", !is3d ? "true" : "false");
      bFlat.classList.toggle("bg-white/15", !is3d);
      bFlat.classList.toggle("text-white", !is3d);
      bFlat.classList.toggle("text-white/70", is3d);
    }
  };

  ThreePreviewController.prototype.rotateBy = function (delta) {
    var next = (this.rotationIndex + delta) % 4;
    if (next < 0) next += 4;
    this.rotationIndex = next;
    this.applyRotationUI();
    this.updatePreview();
  };

  ThreePreviewController.prototype.applyRotationUI = function () {
    var label = this.sideLabelEl();
    if (label) label.textContent = this.wallNames()[this.rotationIndex] || "Frente";
  };

  ThreePreviewController.prototype.updatePreview = function () {
    var state = window.Sweetnest && window.Sweetnest.state;
    if (!state) return;

    if (this.viewMode === "flat") {
      this.renderFlat();
      return;
    }

    this.render3d();
  };

  ThreePreviewController.prototype.clearGroup = function () {
    if (!this.contentGroup) return;
    while (this.contentGroup.children.length) {
      this.contentGroup.remove(this.contentGroup.children[0]);
    }
  };

  ThreePreviewController.prototype.render3d = function () {
    if (!this.scene || !this.contentGroup || !window.THREE) return;

    this.clearGroup();

    var state = window.Sweetnest.state;
    var levels = Number(state.levels || 0);
    if (!levels) return;

    // Rotación de toda la caja en pasos de 90°.
    this.contentGroup.rotation.y = -this.rotationIndex * (Math.PI / 2);

    var cumulativeY = 0;
    var totalHeight = 0;

    for (var i = 0; i < levels; i++) {
      var levelSize = 2 - (i * 0.6);
      totalHeight = cumulativeY + levelSize * 0.5;

      var boxGeometry = new THREE.BoxGeometry(levelSize, levelSize, levelSize);
      var boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.28 + (i * 0.18),
        shininess: 100
      });

      var box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.y = cumulativeY;
      box.castShadow = true;
      box.receiveShadow = true;
      this.contentGroup.add(box);

      cumulativeY += levelSize * 0.48;
    }

    // Ajusta cámara al centro aproximado.
    if (this.camera) {
      var centerY = Math.max(0.8, totalHeight * 0.5);
      var z = 5.2 + (levels * 0.9);
      this.camera.position.set(0, centerY, z);
      this.camera.lookAt(0, centerY, 0);
    }
  };

  ThreePreviewController.prototype.renderFlat = function () {
    var host = this.flatEl();
    if (!host) return;

    var state = window.Sweetnest && window.Sweetnest.state;
    var levels = Number(state && state.levels) || 0;
    if (!levels) {
      host.innerHTML =
        '<div class="w-full h-full flex items-center justify-center text-white/70 text-sm">' +
          "Selecciona niveles para ver la vista plana." +
        "</div>";
      return;
    }

    // Se completa en el siguiente TODO (render de íconos por lado/nivel).
    host.innerHTML =
      '<div class="w-full h-full flex items-center justify-center text-white/70 text-sm px-6 text-center">' +
        "Vista plana activada. Agrega dulces para verlos por nivel y lado." +
      "</div>";
  };

  window.SweetNestThreePreviewController = ThreePreviewController;
})();

