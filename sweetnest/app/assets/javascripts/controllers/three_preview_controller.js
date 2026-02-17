// Stimulus controller: three-preview
(function () {
  function ThreePreviewController() {}

  ThreePreviewController.prototype.connect = function () {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.initThree();

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
  };

  ThreePreviewController.prototype.canvasEl = function () {
    return this.element.querySelector("#threeCanvas");
  };

  ThreePreviewController.prototype.initThree = function () {
    var canvas = this.canvasEl();
    if (!canvas || !window.THREE) return;

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

    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.0;
    }

    this.camera.position.z = 5;

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

  ThreePreviewController.prototype.updatePreview = function () {
    if (!this.scene) return;

    // Keep first 2 lights (ambient + directional)
    while (this.scene.children.length > 2) {
      this.scene.remove(this.scene.children[2]);
    }

    var state = window.Sweetnest.state;
    if (!state.levels) return;

    var cumulativeY = 0;
    for (var i = 0; i < state.levels; i++) {
      var levelSize = 2 - (i * 0.6);

      var boxGeometry = new THREE.BoxGeometry(levelSize, levelSize, levelSize);
      var boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3 + (i * 0.2),
        shininess: 100
      });
      var box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.y = cumulativeY;
      box.castShadow = true;
      box.receiveShadow = true;
      this.scene.add(box);

      var walls = (state.boxConfig && state.boxConfig[i]) || null;
      if (walls) {
        walls.forEach(function (wallCandies, wallIndex) {
          (wallCandies || []).slice(0, 3).forEach(function (candy, candyIndex) {
            var candySize = Number(candy.preview_size || 0.5);
            var candyGeometry = new THREE.SphereGeometry(candySize * 0.1, 16, 16);
            var candyMaterial = new THREE.MeshPhongMaterial({
              color: candy.color_hex || "#ffffff",
              emissive: new THREE.Color(candy.color_hex || "#ffffff").multiplyScalar(0.2)
            });
            var candyMesh = new THREE.Mesh(candyGeometry, candyMaterial);
            var angle = (wallIndex * Math.PI * 0.5) + (candyIndex * 0.3);
            candyMesh.position.set(
              Math.cos(angle) * (levelSize * 0.4),
              cumulativeY + 0.1,
              Math.sin(angle) * (levelSize * 0.4)
            );
            candyMesh.castShadow = true;
            this.scene.add(candyMesh);
          }, this);
        }, this);
      }

      cumulativeY += levelSize * 0.48;
    }
  };

  window.SweetNestThreePreviewController = ThreePreviewController;
})();

