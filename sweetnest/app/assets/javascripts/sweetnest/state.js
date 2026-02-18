// Shared global state (simple, framework-free).
(function () {
  var BASE_PRICE = 29.99;
  var WALL_NAMES = ["Frente", "Derecha", "Atras", "Izquierda"];
  // Capacidad por pared por nivel (1..3), expresada en "unidades small".
  // La capacidad efectiva se calcula ponderando por tamaño del dulce.
  var LEVEL_WALL_CAPACITY_UNITS = [4, 6, 8];
  var SIZE_WEIGHTS = { small: 1, medium: 2, large: 3 };

  function initialState() {
    return {
      levels: 0,
      currentStep: 1,
      // boxConfig[levelIndex][wallIndex] = array of candy objects {id,name,price,emoji,color_hex,size_category,preview_size}
      boxConfig: {},
      cart: [],
      total: 0,
      basePrice: BASE_PRICE
    };
  }

  if (!window.Sweetnest) window.Sweetnest = {};

  window.Sweetnest.state = initialState();

  window.Sweetnest.reset = function reset() {
    window.Sweetnest.state = initialState();
  };

  window.Sweetnest.dispatch = function dispatch(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  };

  window.Sweetnest.computeCart = function computeCart() {
    var state = window.Sweetnest.state;
    var byId = {};
    var total = state.basePrice;

    Object.keys(state.boxConfig || {}).forEach(function (levelKey) {
      var walls = state.boxConfig[levelKey] || [];
      walls.forEach(function (candies) {
        (candies || []).forEach(function (candy) {
          if (!byId[candy.id]) byId[candy.id] = { candy: candy, quantity: 0 };
          byId[candy.id].quantity += 1;
          total += Number(candy.price || 0);
        });
      });
    });

    state.cart = Object.keys(byId).map(function (id) {
      return Object.assign({}, byId[id].candy, { quantity: byId[id].quantity });
    });
    state.total = total;
  };

  window.Sweetnest.selectedCandiesCount = function selectedCandiesCount() {
    var state = window.Sweetnest.state;
    var total = 0;

    Object.keys(state.boxConfig || {}).forEach(function (levelKey) {
      var walls = state.boxConfig[levelKey] || [];
      walls.forEach(function (candies) {
        total += (candies || []).length;
      });
    });

    return total;
  };

  window.Sweetnest.hasSelectedCandies = function hasSelectedCandies() {
    return window.Sweetnest.selectedCandiesCount() > 0;
  };

  window.Sweetnest.wallCapacityUnits = function wallCapacityUnits(levelIndex) {
    var idx = Math.min(Number(levelIndex) || 0, 2);
    return LEVEL_WALL_CAPACITY_UNITS[idx];
  };

  window.Sweetnest.candyWeightUnits = function candyWeightUnits(candy) {
    var key = candy && candy.size_category ? String(candy.size_category) : "small";
    return SIZE_WEIGHTS[key] || 1;
  };

  window.Sweetnest.wallLoadUnits = function wallLoadUnits(levelIndex, wallIndex) {
    var state = window.Sweetnest.state;
    var candies = (state.boxConfig && state.boxConfig[levelIndex] && state.boxConfig[levelIndex][wallIndex]) ? state.boxConfig[levelIndex][wallIndex] : [];
    var total = 0;
    (candies || []).forEach(function (c) {
      total += window.Sweetnest.candyWeightUnits(c);
    });
    return total;
  };

  // Valida reglas de armado:
  // - Cada pared de cada nivel debe tener al menos 1 dulce
  // - No exceder la capacidad por pared, ponderada por tamaño
  // Devuelve un arreglo de strings (errores).
  window.Sweetnest.boxValidationErrors = function boxValidationErrors() {
    var state = window.Sweetnest.state;
    var levels = Number(state && state.levels) || 0;
    var errors = [];
    if (!levels) return ["Selecciona la cantidad de niveles antes de continuar."];

    for (var i = 0; i < levels; i++) {
      var cap = window.Sweetnest.wallCapacityUnits(i);
      for (var w = 0; w < 4; w++) {
        var candies = (state.boxConfig && state.boxConfig[i] && state.boxConfig[i][w]) ? state.boxConfig[i][w] : [];
        var count = (candies || []).length;
        if (count <= 0) {
          errors.push("Falta seleccionar 1 dulce en Nivel " + String(i + 1) + " - " + (WALL_NAMES[w] || ("Pared " + String(w + 1))));
          continue;
        }
        var load = window.Sweetnest.wallLoadUnits(i, w);
        if (load > cap) {
          errors.push(
            "Excede capacidad en Nivel " + String(i + 1) + " - " + (WALL_NAMES[w] || ("Pared " + String(w + 1))) +
            " (usado " + String(load) + "/" + String(cap) + " 🍬)"
          );
        }
      }
    }

    return errors;
  };

  // Transforma a box_config para el backend:
  // { "0": { "0": [{candy_id, quantity}], ... }, "1": { ... } }
  window.Sweetnest.serializeBoxConfig = function serializeBoxConfig() {
    var state = window.Sweetnest.state;
    var result = {};

    Object.keys(state.boxConfig || {}).forEach(function (levelKey) {
      var levelIndex = String(levelKey);
      var walls = state.boxConfig[levelKey] || [];
      result[levelIndex] = {};

      walls.forEach(function (candies, wallIndex) {
        var counts = {};
        (candies || []).forEach(function (c) {
          counts[c.id] = (counts[c.id] || 0) + 1;
        });
        result[levelIndex][String(wallIndex)] = Object.keys(counts).map(function (candyId) {
          return { candy_id: Number(candyId), quantity: counts[candyId] };
        });
      });
    });

    return result;
  };
})();

