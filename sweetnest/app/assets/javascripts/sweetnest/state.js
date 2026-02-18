// Shared global state (simple, framework-free).
(function () {
  var BASE_PRICE = 29.99;

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

