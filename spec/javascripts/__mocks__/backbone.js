var _ = require('lodash');

var BackboneEvents = {
  on: function(event, callback) { this._events = this._events || {}; this._events[event] = this._events[event] || []; this._events[event].push(callback); return this; },
  off: function(event) { if (this._events) delete this._events[event]; return this; },
  once: function(event, callback) { var self = this; var wrapped = function() { self.off(event); callback.apply(this, arguments); }; this.on(event, wrapped); return this; },
  trigger: function(event) { var args = Array.prototype.slice.call(arguments, 1); if (this._events && this._events[event]) this._events[event].forEach(function(cb) { cb.apply(null, args); }); return this; },
};

var BackboneView = function(options) {
  this.options = options || {};
  this.id = _.uniqueId();
  this.$el = { addClass: function() { return this; }, removeClass: function() { return this; }, removeAttr: function() { return this; }, height: function() { return 0; }, offset: function() { return this; }, css: function() { return this; }, remove: function() { return this; }, insertAfter: function() { return this; } };
  this.$ = function() { return { text: function() { return ''; }, html: function() { return ''; }, focus: function() {}, blur: function() {}, offset: function() { return {}; }, height: function() { return 0; }, addClass: function() { return this; }, removeClass: function() { return this; }, length: 0 }; };
  if (this.initialize) this.initialize(options || {});
};
BackboneView.prototype = Object.create(BackboneEvents);
BackboneView.prototype.constructor = BackboneView;
BackboneView.prototype.setElement = function() { return this; };
BackboneView.prototype.delegateEvents = function() { return this; };
BackboneView.prototype.render = function() { return this; };
BackboneView.prototype.renderChildren = function() { return this; };
BackboneView.prototype.focus = function() { return this; };
BackboneView.prototype.blurContainingList = function() { return this; };
BackboneView.prototype.save = function() { return this; };
BackboneView.extend = function(protoProps) {
  var Parent = this;
  var Child = function() { return Parent.apply(this, arguments); };
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
  if (protoProps) _.extend(Child.prototype, protoProps);
  Child.extend = Parent.extend;
  return Child;
};

var Backbone = {
  Events: BackboneEvents,
  View: BackboneView,
  Model: BackboneView, // Item extends Backbone.View but code references Model too
};

module.exports = Backbone;
module.exports.default = Backbone;
module.exports.__esModule = true;
