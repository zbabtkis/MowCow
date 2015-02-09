function Observable() {
  this._listeners = {};

  this.onChange = function(attribute, listener) {
    var attributes = attribute.split(' ');

    _.forEach(attributes, _.bind(function(attribute) {
      this._listeners[attribute] = this._listeners[attribute] || [];
      this._listeners[attribute].push({callback: listener});
    }, this));
  };

  this.set = function(attribute, value) {
    var attributeBubble,
        attributeContext,
        attributeNest;

    // get nested attribute names in dot notation
    attributeNest = attribute.split('.');

    // get the context that the attribute lives in (if attribute has dot notation)
    attributeContext = attributeNest
      // limit to all but the final attribute name
      .slice(0, -1)
      // get the nested context holding the attribute
      .reduce(function(context, attribute) {
        return context[attribute];
      }, this);

    var attributeBubble = attributeNest.pop();
    attributeContext[attributeBubble] = value;

    do {
      _.invoke(
        this._listeners[attributeNest.concat(attributeBubble).join('.')],
        'callback',
        attribute,
        value,
        this
      );
    }
    while(attributeBubble = attributeNest.pop());
  };
}

Observable.disable = function() {
  this._listeners = [];
};

Observable.getNestedValue = function(context, attribute) {
  // get the context that the attribute lives in (if attribute has dot notation)
  return attribute.split('.')
    .reduce(function(currentContext, currentAttribute) {
      return (currentContext && currentContext[currentAttribute]) || null;
    }, context);
};

window.Observable = Observable;

module.exports = Observable;
