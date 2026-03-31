var eventHub = {
  _events: {},
  on: function(event, callback) { this._events[event] = this._events[event] || []; this._events[event].push(callback); return this; },
  off: function(event) { delete this._events[event]; return this; },
  once: function(event, callback) { var self = this; var wrapped = function() { self.off(event); callback.apply(this, arguments); }; this.on(event, wrapped); return this; },
  trigger: function(event) { var args = Array.prototype.slice.call(arguments, 1); if (this._events[event]) this._events[event].forEach(function(cb) { cb.apply(null, args); }); return this; },
};
module.exports = eventHub;
module.exports.default = eventHub;
module.exports.__esModule = true;
