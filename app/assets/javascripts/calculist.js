var window = this;
window.sessionStorage || (window.sessionStorage = {});
(function (global, _) {

  'use strict';

  var calculist = {};

  var registeredObjects = {},
      require = _.propertyOf(registeredObjects),
      queue = [],
      initialized = false;

  var processQueue = function () {
    var _process = _.spread(function (name, dependencies, initializer) {
      var resolvedDependencies = _.compact(_.map(dependencies, require));
      if (resolvedDependencies.length < dependencies.length) {
        return false;
      } else if (name) {
        if (registeredObjects[name]) throw new Error('Naming collision for "' + name + '"');
        registeredObjects[name] = initializer.apply(null, resolvedDependencies);
        if (!registeredObjects[name]) throw new Error('Attempted to register a falsy value for "' + name + '"');
        return true;
      } else {
        initializer.apply(null, resolvedDependencies);
        return true;
      }
    });
    var removed = [1];
    while (removed.length > 0) {
      removed = _.remove(queue, _process);
    }
    if (queue.length) {
      var notFound = _.reject(_.flatten(_.map(queue, '1')), require);
      throw new Error('Unresolveable dependencies: "' + notFound.join('", "') + '"');
    }
  };

  calculist.register = function (name, dependencies, initializer) {
    queue.push([name, dependencies, initializer]);
    if (initialized) processQueue();
  };

  calculist.require = _.partial(calculist.register, false);

  calculist.init = function (dependencies, bootstrap) {
    processQueue();
    initialized = true;
    if (_.isFunction(dependencies)) {
      bootstrap = dependencies;
      dependencies = [];
    }
    if (bootstrap) calculist.require(dependencies, bootstrap);
  };

  global.calculist = calculist;

})(this, _);
