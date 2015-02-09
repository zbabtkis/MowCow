(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge]
 * @returns {Object} dest
 */
function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
function merge(dest, src) {
    return extend(dest, src, true);
}

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        extend(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument;
    return (doc.defaultView || doc.parentWindow);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = last.deltaX - input.deltaX;
        var deltaY = last.deltaY - input.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // pan-x and pan-y can be combined
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.id = uniqueId();

    this.manager = null;
    this.options = merge(options || {}, this.defaults);

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        extend(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(withState) {
            self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(true);
        }

        emit(); // simple 'eventName' events

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(true);
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = extend({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {
        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        this._super.emit.call(this, input);
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            this.manager.emit(this.options.event + inOut, input);
        }
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 500, // minimal time of the pointer to be pressed
        threshold: 5 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.65,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.velocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.velocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.velocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.direction &&
            input.distance > this.options.threshold &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 2, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED ) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create an manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.4';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, { enable: false }],
        [PinchRecognizer, { enable: false }, ['rotate']],
        [SwipeRecognizer,{ direction: DIRECTION_HORIZONTAL }],
        [PanRecognizer, { direction: DIRECTION_HORIZONTAL }, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, { event: 'doubletap', taps: 2 }, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    options = options || {};

    this.options = merge(options, Hammer.defaults);
    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        extend(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        var recognizers = this.recognizers;
        recognizer = this.get(recognizer);
        recognizers.splice(inArray(recognizers, recognizer), 1);

        this.touchAction.update();
        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

extend(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

if (typeof define == TYPE_FUNCTION && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],2:[function(require,module,exports){
/*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(k(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a}function i(a,b){return h(a,b,!0)}function j(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&h(d,c)}function k(a,b){return function(){return a.apply(b,arguments)}}function l(a,b){return typeof a==kb?a.apply(b?b[0]||d:d,b):a}function m(a,b){return a===d?b:a}function n(a,b,c){g(r(b),function(b){a.addEventListener(b,c,!1)})}function o(a,b,c){g(r(b),function(b){a.removeEventListener(b,c,!1)})}function p(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function q(a,b){return a.indexOf(b)>-1}function r(a){return a.trim().split(/\s+/g)}function s(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function t(a){return Array.prototype.slice.call(a,0)}function u(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];s(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function v(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ib.length;){if(c=ib[g],e=c?c+f:b,e in a)return e;g++}return d}function w(){return ob++}function x(a){var b=a.ownerDocument;return b.defaultView||b.parentWindow}function y(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){l(a.options.enable,[a])&&c.handler(b)},this.init()}function z(a){var b,c=a.options.inputClass;return new(b=c?c:rb?N:sb?Q:qb?S:M)(a,A)}function A(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&yb&&d-e===0,g=b&(Ab|Bb)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,B(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function B(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=E(b)),e>1&&!c.firstMultiple?c.firstMultiple=E(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=F(d);b.timeStamp=nb(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=J(h,i),b.distance=I(h,i),C(c,b),b.offsetDirection=H(b.deltaX,b.deltaY),b.scale=g?L(g.pointers,d):1,b.rotation=g?K(g.pointers,d):0,D(c,b);var j=a.element;p(b.srcEvent.target,j)&&(j=b.srcEvent.target),b.target=j}function C(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};(b.eventType===yb||f.eventType===Ab)&&(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function D(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Bb&&(i>xb||h.velocity===d)){var j=h.deltaX-b.deltaX,k=h.deltaY-b.deltaY,l=G(i,j,k);e=l.x,f=l.y,c=mb(l.x)>mb(l.y)?l.x:l.y,g=H(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function E(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:lb(a.pointers[c].clientX),clientY:lb(a.pointers[c].clientY)},c++;return{timeStamp:nb(),pointers:b,center:F(b),deltaX:a.deltaX,deltaY:a.deltaY}}function F(a){var b=a.length;if(1===b)return{x:lb(a[0].clientX),y:lb(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:lb(c/b),y:lb(d/b)}}function G(a,b,c){return{x:b/a||0,y:c/a||0}}function H(a,b){return a===b?Cb:mb(a)>=mb(b)?a>0?Db:Eb:b>0?Fb:Gb}function I(a,b,c){c||(c=Kb);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function J(a,b,c){c||(c=Kb);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function K(a,b){return J(b[1],b[0],Lb)-J(a[1],a[0],Lb)}function L(a,b){return I(b[0],b[1],Lb)/I(a[0],a[1],Lb)}function M(){this.evEl=Nb,this.evWin=Ob,this.allow=!0,this.pressed=!1,y.apply(this,arguments)}function N(){this.evEl=Rb,this.evWin=Sb,y.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function O(){this.evTarget=Ub,this.evWin=Vb,this.started=!1,y.apply(this,arguments)}function P(a,b){var c=t(a.touches),d=t(a.changedTouches);return b&(Ab|Bb)&&(c=u(c.concat(d),"identifier",!0)),[c,d]}function Q(){this.evTarget=Xb,this.targetIds={},y.apply(this,arguments)}function R(a,b){var c=t(a.touches),d=this.targetIds;if(b&(yb|zb)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=t(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return p(a.target,i)}),b===yb)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ab|Bb)&&delete d[g[e].identifier],e++;return h.length?[u(f.concat(h),"identifier",!0),h]:void 0}function S(){y.apply(this,arguments);var a=k(this.handler,this);this.touch=new Q(this.manager,a),this.mouse=new M(this.manager,a)}function T(a,b){this.manager=a,this.set(b)}function U(a){if(q(a,bc))return bc;var b=q(a,cc),c=q(a,dc);return b&&c?cc+" "+dc:b||c?b?cc:dc:q(a,ac)?ac:_b}function V(a){this.id=w(),this.manager=null,this.options=i(a||{},this.defaults),this.options.enable=m(this.options.enable,!0),this.state=ec,this.simultaneous={},this.requireFail=[]}function W(a){return a&jc?"cancel":a&hc?"end":a&gc?"move":a&fc?"start":""}function X(a){return a==Gb?"down":a==Fb?"up":a==Db?"left":a==Eb?"right":""}function Y(a,b){var c=b.manager;return c?c.get(a):a}function Z(){V.apply(this,arguments)}function $(){Z.apply(this,arguments),this.pX=null,this.pY=null}function _(){Z.apply(this,arguments)}function ab(){V.apply(this,arguments),this._timer=null,this._input=null}function bb(){Z.apply(this,arguments)}function cb(){Z.apply(this,arguments)}function db(){V.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function eb(a,b){return b=b||{},b.recognizers=m(b.recognizers,eb.defaults.preset),new fb(a,b)}function fb(a,b){b=b||{},this.options=i(b,eb.defaults),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.element=a,this.input=z(this),this.touchAction=new T(this,this.options.touchAction),gb(this,!0),g(b.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function gb(a,b){var c=a.element;g(a.options.cssProps,function(a,d){c.style[v(c.style,d)]=b?a:""})}function hb(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var ib=["","webkit","moz","MS","ms","o"],jb=b.createElement("div"),kb="function",lb=Math.round,mb=Math.abs,nb=Date.now,ob=1,pb=/mobile|tablet|ip(ad|hone|od)|android/i,qb="ontouchstart"in a,rb=v(a,"PointerEvent")!==d,sb=qb&&pb.test(navigator.userAgent),tb="touch",ub="pen",vb="mouse",wb="kinect",xb=25,yb=1,zb=2,Ab=4,Bb=8,Cb=1,Db=2,Eb=4,Fb=8,Gb=16,Hb=Db|Eb,Ib=Fb|Gb,Jb=Hb|Ib,Kb=["x","y"],Lb=["clientX","clientY"];y.prototype={handler:function(){},init:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(x(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&o(this.element,this.evEl,this.domHandler),this.evTarget&&o(this.target,this.evTarget,this.domHandler),this.evWin&&o(x(this.element),this.evWin,this.domHandler)}};var Mb={mousedown:yb,mousemove:zb,mouseup:Ab},Nb="mousedown",Ob="mousemove mouseup";j(M,y,{handler:function(a){var b=Mb[a.type];b&yb&&0===a.button&&(this.pressed=!0),b&zb&&1!==a.which&&(b=Ab),this.pressed&&this.allow&&(b&Ab&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:vb,srcEvent:a}))}});var Pb={pointerdown:yb,pointermove:zb,pointerup:Ab,pointercancel:Bb,pointerout:Bb},Qb={2:tb,3:ub,4:vb,5:wb},Rb="pointerdown",Sb="pointermove pointerup pointercancel";a.MSPointerEvent&&(Rb="MSPointerDown",Sb="MSPointerMove MSPointerUp MSPointerCancel"),j(N,y,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Pb[d],f=Qb[a.pointerType]||a.pointerType,g=f==tb,h=s(b,a.pointerId,"pointerId");e&yb&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ab|Bb)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Tb={touchstart:yb,touchmove:zb,touchend:Ab,touchcancel:Bb},Ub="touchstart",Vb="touchstart touchmove touchend touchcancel";j(O,y,{handler:function(a){var b=Tb[a.type];if(b===yb&&(this.started=!0),this.started){var c=P.call(this,a,b);b&(Ab|Bb)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:tb,srcEvent:a})}}});var Wb={touchstart:yb,touchmove:zb,touchend:Ab,touchcancel:Bb},Xb="touchstart touchmove touchend touchcancel";j(Q,y,{handler:function(a){var b=Wb[a.type],c=R.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:tb,srcEvent:a})}}),j(S,y,{handler:function(a,b,c){var d=c.pointerType==tb,e=c.pointerType==vb;if(d)this.mouse.allow=!1;else if(e&&!this.mouse.allow)return;b&(Ab|Bb)&&(this.mouse.allow=!0),this.callback(a,b,c)},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var Yb=v(jb.style,"touchAction"),Zb=Yb!==d,$b="compute",_b="auto",ac="manipulation",bc="none",cc="pan-x",dc="pan-y";T.prototype={set:function(a){a==$b&&(a=this.compute()),Zb&&(this.manager.element.style[Yb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){l(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),U(a.join(" "))},preventDefaults:function(a){if(!Zb){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=q(d,bc),f=q(d,dc),g=q(d,cc);return e||f&&c&Hb||g&&c&Ib?this.preventSrc(b):void 0}},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var ec=1,fc=2,gc=4,hc=8,ic=hc,jc=16,kc=32;V.prototype={defaults:{},set:function(a){return h(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=Y(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=Y(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=Y(a,this),-1===s(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=Y(a,this);var b=s(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(c.options.event+(b?W(d):""),a)}var c=this,d=this.state;hc>d&&b(!0),b(),d>=hc&&b(!0)},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=kc)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(kc|ec)))return!1;a++}return!0},recognize:function(a){var b=h({},a);return l(this.options.enable,[this,b])?(this.state&(ic|jc|kc)&&(this.state=ec),this.state=this.process(b),void(this.state&(fc|gc|hc|jc)&&this.tryEmit(b))):(this.reset(),void(this.state=kc))},process:function(){},getTouchAction:function(){},reset:function(){}},j(Z,V,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(fc|gc),e=this.attrTest(a);return d&&(c&Bb||!e)?b|jc:d||e?c&Ab?b|hc:b&fc?b|gc:fc:kc}}),j($,Z,{defaults:{event:"pan",threshold:10,pointers:1,direction:Jb},getTouchAction:function(){var a=this.options.direction,b=[];return a&Hb&&b.push(dc),a&Ib&&b.push(cc),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Hb?(e=0===f?Cb:0>f?Db:Eb,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Cb:0>g?Fb:Gb,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return Z.prototype.attrTest.call(this,a)&&(this.state&fc||!(this.state&fc)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=X(a.direction);b&&this.manager.emit(this.options.event+b,a),this._super.emit.call(this,a)}}),j(_,Z,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[bc]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&fc)},emit:function(a){if(this._super.emit.call(this,a),1!==a.scale){var b=a.scale<1?"in":"out";this.manager.emit(this.options.event+b,a)}}}),j(ab,V,{defaults:{event:"press",pointers:1,time:500,threshold:5},getTouchAction:function(){return[_b]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ab|Bb)&&!f)this.reset();else if(a.eventType&yb)this.reset(),this._timer=e(function(){this.state=ic,this.tryEmit()},b.time,this);else if(a.eventType&Ab)return ic;return kc},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===ic&&(a&&a.eventType&Ab?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=nb(),this.manager.emit(this.options.event,this._input)))}}),j(bb,Z,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[bc]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&fc)}}),j(cb,Z,{defaults:{event:"swipe",threshold:10,velocity:.65,direction:Hb|Ib,pointers:1},getTouchAction:function(){return $.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Hb|Ib)?b=a.velocity:c&Hb?b=a.velocityX:c&Ib&&(b=a.velocityY),this._super.attrTest.call(this,a)&&c&a.direction&&a.distance>this.options.threshold&&mb(b)>this.options.velocity&&a.eventType&Ab},emit:function(a){var b=X(a.direction);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),j(db,V,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:2,posThreshold:10},getTouchAction:function(){return[ac]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&yb&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ab)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||I(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=ic,this.tryEmit()},b.interval,this),fc):ic}return kc},failTimeout:function(){return this._timer=e(function(){this.state=kc},this.options.interval,this),kc},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==ic&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),eb.VERSION="2.0.4",eb.defaults={domEvents:!1,touchAction:$b,enable:!0,inputTarget:null,inputClass:null,preset:[[bb,{enable:!1}],[_,{enable:!1},["rotate"]],[cb,{direction:Hb}],[$,{direction:Hb},["swipe"]],[db],[db,{event:"doubletap",taps:2},["tap"]],[ab]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var lc=1,mc=2;fb.prototype={set:function(a){return h(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?mc:lc},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&ic)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===mc||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(fc|gc|hc)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof V)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;var b=this.recognizers;return a=this.get(a),b.splice(s(b,a),1),this.touchAction.update(),this},on:function(a,b){var c=this.handlers;return g(r(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this},off:function(a,b){var c=this.handlers;return g(r(a),function(a){b?c[a].splice(s(c[a],b),1):delete c[a]}),this},emit:function(a,b){this.options.domEvents&&hb(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&gb(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},h(eb,{INPUT_START:yb,INPUT_MOVE:zb,INPUT_END:Ab,INPUT_CANCEL:Bb,STATE_POSSIBLE:ec,STATE_BEGAN:fc,STATE_CHANGED:gc,STATE_ENDED:hc,STATE_RECOGNIZED:ic,STATE_CANCELLED:jc,STATE_FAILED:kc,DIRECTION_NONE:Cb,DIRECTION_LEFT:Db,DIRECTION_RIGHT:Eb,DIRECTION_UP:Fb,DIRECTION_DOWN:Gb,DIRECTION_HORIZONTAL:Hb,DIRECTION_VERTICAL:Ib,DIRECTION_ALL:Jb,Manager:fb,Input:y,TouchAction:T,TouchInput:Q,MouseInput:M,PointerEventInput:N,TouchMouseInput:S,SingleTouchInput:O,Recognizer:V,AttrRecognizer:Z,Tap:db,Pan:$,Swipe:cb,Pinch:_,Rotate:bb,Press:ab,on:n,off:o,each:g,merge:i,extend:h,inherit:j,bindFn:k,prefixed:v}),typeof define==kb&&define.amd?define(function(){return eb}):"undefined"!=typeof module&&module.exports?module.exports=eb:a[c]=eb}(window,document,"Hammer");
//# sourceMappingURL=hammer.min.map
},{}],3:[function(require,module,exports){
var AcelerometerController = require('../lib/accellerometer-controller'),
    Character = require('../lib/character'),
    ContinuousSwipeController = require('../lib/continuous-swipe-controller'),
    Cow = require('../lib/cow'),
    Entity = require('../lib/entity'),
    Explosive = require('../lib/explosive'),
    Grass = require('../lib/grass.js'),
    KeyboardController = require('../lib/keyboard-controller'),
    Level = require('../lib/level'),
    LevelHelpers = require('./level-helpers'),
    ModalMessage = require('../lib/modal-message'),
    Mower = require('../lib/mower'),
    RandomController = require('../lib/random-controller'),
    Renderer = require('../lib/renderer'),
    SlidingText = require('../lib/sliding-text'),
    Sprite = require('../lib/sprite.js'),
    StatsBar = require('../lib/stats-bar'),
    SwipeController = require('../lib/swipe-controller.js'),
    World = require('../lib/world');

var gameSettings = require('./settings');

var BasicCow = new Sprite('assets/cow_hide_1.jpg', gameSettings.tile.width, gameSettings.tile.height);

function _bootstrapGame() {
  var gameWorld = new World(document.getElementById('my-game'), {
    width: gameSettings.width,
    height: gameSettings.height
  });

  var gameRenderer = new Renderer(gameWorld, document.body);

  var me = new Mower({
    x: 0,
    y: 0
  }, {
    width: gameSettings.tile.width,
    height: gameSettings.tile.height,
    sprite: require('./sprites/mower-sprite')
  });

  me.onChange('lives', function() {
    console.log(me.lives);
    if(me.lives <= 0) {
      var message = new ModalMessage('Game Over')
        .addButton('Reset Level', function() {
          me.reset();
          gameWorld.reset();

          // Restart the current level
          Level
            .current()
            .run();
        });

      // Add modal to the world
      gameWorld.addObject(message);

      // Remove dead character from the world
      return gameWorld.removeObject(me);
    }
  });


  var meController;

//  if(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
//    meController = new AcelerometerController();
//  } else {
//    meController = new KeyboardController();
//  }
  meController = new ContinuousSwipeController();

  var statsBar = new StatsBar({
    x: 10,
    y: gameSettings.height - 10
  }, {});

  statsBar.trackStat('Lives', me, 'lives');
  statsBar.trackStat('Level', gameWorld, 'level');
  statsBar.trackStat('Weapon', me, 'weapon', 'weapon.type');

  var level1 = new Level(function() {
    var level1Message;

    gameWorld.set('level', 1);
    gameWorld.set('title', 'Kranky Kows');

    level1Message = LevelHelpers.generateLevelMessage(gameSettings, gameWorld);

    LevelHelpers.generateLevelWeapons(gameSettings, gameWorld, 3);
    LevelHelpers.generateLevelTiles(gameSettings, gameWorld);

    var enemy1 = new Cow({
      x: gameSettings.tile.width * 3,
      y: gameSettings.tile.height * 4
    },{
      width: gameSettings.tile.width,
      height: gameSettings.tile.height,
      sprite: BasicCow
    });

    var enemy2 = new Cow({
      x: gameSettings.tile.width * 5,
      y: gameSettings.tile.height * 2
    },{
      width: gameSettings.tile.width,
      height: gameSettings.tile.height,
      sprite: BasicCow
    });

    meController.controlEntity(me);

    // Control enemy with stupid AI controller
    new RandomController()
      .controlEntity(enemy1);

    new RandomController()
      .controlEntity(enemy2);

    // Add enemies to world
    gameWorld
      .addObject(me)
      .addObject(enemy1)
      .addObject(enemy2)
      .addObject(statsBar);

    // Show the opening message after 1 second
    setTimeout(function() {
      gameWorld.addObject(level1Message);
      level1Message.slide();
    }, 1000);

    var isLevelComplete = gameWorld.onRemoveObject(function(entity) {
      function isEntityNotGrass(e) {
        return !(e instanceof Grass);
      }

      // If main character has mowed all the grass
      if(gameWorld.entities.length < 10 && _.every(gameWorld.entities, isEntityNotGrass)) {
        gameWorld.offRemoveObject(isLevelComplete);

        // Reset main character position
        me.x = 0;
        me.y = 0;

        gameWorld.reset();

        // Advance to the next level
        Level
          .next()
          .run();
      }
    });
  });

  var level2 = new Level(function() {
    var enemy1,
        enemy2,
        enemy3;

    gameWorld.set('level', 2);
    gameWorld.set('title', 'Tipping Point');

    var level2Message = LevelHelpers.generateLevelMessage(gameSettings, gameWorld);

    LevelHelpers.generateLevelWeapons(gameSettings, gameWorld, 5);
    LevelHelpers.generateLevelTiles(gameSettings, gameWorld);

    enemy1 = new Cow({
      x: 100,
      y: 200
    },{
      width: 50,
      height: 50,
      sprite: BasicCow
    });
    
    enemy2 = new Cow({
      x: 400,
      y: 50
    },{
      width: 50,
      height: 50,
      sprite: BasicCow
    });

    enemy3 = new Cow({
      x: 200,
      y: 450
    },{
      width: 50,
      height: 50,
      sprite: BasicCow
    });
    
    new RandomController()
      .controlEntity(enemy1);
    new RandomController()
      .controlEntity(enemy2);
    new RandomController()
      .controlEntity(enemy3);

    // reattach controller
    meController
      .controlEntity(me);
    
    gameWorld
      .addObject(me)
      .addObject(enemy1)
      .addObject(enemy2)
      .addObject(enemy3)
      .addObject(level2Message)
      .addObject(statsBar);

    level2Message.slide();
  });

  Sprite.preloadSprites(function() {
    level1.run();
    gameRenderer.render();
  });
}

_bootstrapGame();

},{"../lib/accellerometer-controller":8,"../lib/character":9,"../lib/continuous-swipe-controller":11,"../lib/cow":13,"../lib/entity":14,"../lib/explosive":15,"../lib/grass.js":16,"../lib/keyboard-controller":17,"../lib/level":18,"../lib/modal-message":19,"../lib/mower":20,"../lib/random-controller":22,"../lib/renderer":23,"../lib/sliding-text":24,"../lib/sprite.js":25,"../lib/stats-bar":26,"../lib/swipe-controller.js":27,"../lib/world":28,"./level-helpers":4,"./settings":5,"./sprites/mower-sprite":7}],4:[function(require,module,exports){
var Explosive = require('../lib/explosive'),
    Grass = require('../lib/grass'),
    HeatBomb = require('./sprites/heat-bomb'),
    SlidingText = require('../lib/sliding-text');

/** @namespace LevelHelpers */

/**
 * Generate a message for the given level
 *
 * @function generateLevelMessage
 * @memberof LevelHelpers
 * @param {Object} gameSettings Settings for game
 * @param {World} gameWorld A game world to add tiles to
 */
function generateLevelMessage(gameSettings, gameWorld) {
  return new SlidingText({
    x: gameSettings.width,
    y: gameSettings.height / 2
  }, {
    fontFamily: 'Helvetica',
    fontSize: 50,
    color: '#ecf0f1',
    title: 'Level ' + gameWorld.level,
    message: gameWorld.title
  });
}

exports.generateLevelMessage = generateLevelMessage;

/**
 * Add tiles to game level
 *
 * @function generateLevelTiles
 * @memberof LevelHelpers
 * @param {Object} gameSettings Settings for game
 * @param {World} gameWorld A game world to add tiles to
 */
function generateLevelTiles(gameSettings, gameWorld) {
    // iterate through horizontal tile columns
    _.range(0, gameSettings.width, gameSettings.tile.width)
      .forEach(function(x) {

        // iterate through vertical tile rows
        _.range(0, gameSettings.height, gameSettings.tile.height)
          .forEach(function(y) {

            // add a tile of grass to the X,Y coordinate
            gameWorld.addObject(new Grass({
              x: x,
              y: y
            }, {
              color: '#16a085',
              width: gameSettings.tile.width,
              height: gameSettings.tile.height,
              canCollide: false
            }));
          });
      });
}

exports.generateLevelTiles = generateLevelTiles;

/**
 * Add weapons to gameworld for a level
 *
 * @function generateLevelWeapons
 * @memberof LevelHelpers
 * @param {Object} gameSettings Game settings
 * @param {World} gameWorld Game World to add tiles to
 * @param {Integer} weaponCount Number of weapons to add
 */
function generateLevelWeapons(gameSettings, gameWorld, weaponCount) {
  // generate 3 weapons randomy placed on game board
  _.times(3, function() {

    // random X,Y tile coordinates to place weapon
    var x = Math.round(Math.random() * (gameSettings.horizontalTiles + 1)) * gameSettings.tile.width,
        y = Math.round(Math.random() * (gameSettings.verticalTiles + 1)) * gameSettings.tile.height;

    // add new explosive to board
    gameWorld.addObject(new Explosive({
      x: x,
      y: y
    }, {
      width: gameSettings.tile.width,
      height: gameSettings.tile.height,
      sprite: HeatBomb,
      type: 'Heat Sensing Bomb'
    }));
  });
}

exports.generateLevelWeapons = generateLevelWeapons;

},{"../lib/explosive":15,"../lib/grass":16,"../lib/sliding-text":24,"./sprites/heat-bomb":6}],5:[function(require,module,exports){
var gameSettings = {
  width: window.innerWidth,
  height: window.innerHeight,

  // displays current stats about the level
  statusBar: {

    // height of the status bar that runs along the bottom
    bottomHeight: 0,

    // width of the status bar that runs along the right side
    sideWidth: 0
  },

  // a tile is a pixel in the game
  tile: {
    width: 50,
    height: 50
  }
};

// how many tiles can be rendered along the X and Y axis of the game board
gameSettings.width -= gameSettings.width % gameSettings.tile.width;
gameSettings.height -= gameSettings.height % gameSettings.tile.height;

// calculate how many tiles can be displayed along the X and Y axis
gameSettings.horizontalTiles = gameSettings.width / gameSettings.tile.width;
gameSettings.verticalTiles = gameSettings.height / gameSettings.tile.height;

module.exports = gameSettings;

},{}],6:[function(require,module,exports){
var gameSettings = require('../settings'),
    Sprite = require('../../lib/sprite');

module.exports = new Sprite('assets/heatbomb.gif', gameSettings.tile.width * 2, gameSettings.tile.height)
  .defineAction('active', [{
    offsetX: 50,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }]);

},{"../../lib/sprite":25,"../settings":5}],7:[function(require,module,exports){
var Sprite = require('../../lib/sprite'),
    gameSettings = require('../settings.js');

var MowerSprite = new Sprite('assets/mower.gif', gameSettings.tile.width, gameSettings.tile.height)
  .defineAction('goUp', [{
    offsetX: 0,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }])
  .defineAction('goLeft', [{
    offsetX: 50,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }])
  .defineAction('goDown', [{
    offsetX: 100,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }])
  .defineAction('goRight', [{
    offsetX: 150,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }]);

module.exports = MowerSprite;

},{"../../lib/sprite":25,"../settings.js":5}],8:[function(require,module,exports){
var Controller = require('./controller');

/**
 * Control a Character's motion through the devices accelerometer
 *
 * @class AcelerometerController
 * @property {Object} options Provide tuning for acelerometer sensitivity
 * @property {Integer} options.resistance How much force to apply against device acceleration
 * @property {Object} Keys Enum for directional key names
 * @property {Integer} Keys.UP Device tilted up enum value
 * @property {Integer} Keys.DOWN Device tilted down enum value
 * @property {Integer} Keys.RIGHT Device tilted right enum value
 * @property {Integer} Keys.LEFT Device tilted left enum value
 */
function AcelerometerController() {
  Controller.apply(this, arguments);

  // the resistance
  this.options.resistance = 5;

  // Always run onDeviceMotion handler in this context
  this.onDeviceMotion = _.bind(this.onDeviceMotion, this);

  window.addEventListener('devicemotion',this.onDeviceMotion);
};

AcelerometerController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

AcelerometerController.prototype = Object.create(Controller.prototype);

/**
 * Set the state of the controller based on a device onmotion event
 *
 * @function onDeviceMotion
 * @memberof AcelerometerController
 * @param {Event} event A DOM event indicating the motion of the device
 * @return {AcelerometerController} Instance of this AcelerometerController
 */
AcelerometerController.prototype.onDeviceMotion = function(event) {

    // Get rotation along the X axis
    var xRotation = parseInt(event.accelerationIncludingGravity.x);

    // Convert -+ rotation to absolute value (force) of motion
    var absXRotation = Math.abs(xRotation);

    // Get direction that device is tilting on the X axis (right or left)
    var xDirection = xRotation > 0 ? AcelerometerController.Keys.RIGHT : AcelerometerController.Keys.LEFT;

    // Get the rotation of the device on the Y axis
    var yRotation = parseInt(event.accelerationIncludingGravity.y);

    // Get the absolute rotation of the device on the Y axis
    var absYRotation = Math.abs(yRotation);

    // Get the direction that the device is tilting along the Y axis
    var yDirection = yRotation > 0 ? AcelerometerController.Keys.UP : AcelerometerController.Keys.DOWN;

    // If the device is tilting a reasonable amount along the Y axis send control signal
    if(absYRotation) {
      this.setControlState(yDirection, absYRotation);
    }

    // If the device is tilting a reasonable amount along the X axis send control signal
    if(absXRotation) {
      this.setControlState(xDirection, absXRotation);
    }

    return this;
};

/**
 * Remove an entity from the entities this controller controls
 *
 * @function detachEntity
 * @memberof AcelerometerController
 * @return {AcelerometerController} Instance of this AcelerometerController
 */
AcelerometerController.prototype.detachEntity = function() {
  Controller.prototype.detachEntity.apply(this, arguments);

  return this;
};

/**
 * Send controls to controllers entities
 *
 * @function setControlState
 * @memberof AcelerometerController
 * @param {Integer} key The signal to set the control state sent to the controllers entities
 * @param {Integer} force How many times to execute control
 * @return {AcelerometerController} Instance of this AcelerometerController
 */
AcelerometerController.prototype.setControlState = function(key, force) {
  var state = {};

  switch (key) {
    case AcelerometerController.Keys.UP:
      state.isDirectionUp = true;
      break;
    case AcelerometerController.Keys.DOWN:
      state.isDirectionDown = true;
      break;
    case AcelerometerController.Keys.LEFT:
      state.isDirectionLeft = true;
      break;
    case AcelerometerController.Keys.RIGHT:
      state.isDirectionRight = true;
      break;
    default:
      break;
  }

  _.times(Math.round(force / this.options.resistance), _.bind(function() {
    _.invoke(this.entities, 'control', state);
  }, this));

  return this;
};

module.exports = AcelerometerController;

},{"./controller":12}],9:[function(require,module,exports){
var Entity = require('./entity'),
    Controller = require('./controller');

/**
 * A movable game entity to render in a world
 *
 * @class Character
 * @extends Entity
 * @param {Object} location Initail coordinates in the game
 * @param {Integer} location.x x-coordinate for character to start in
 * @param {Integer} location.y y-coordinate for character to start in
 * @param {Object} css Css rules to apply to character
 */
function Character(location, options) {
  // Extend an entity
  Entity.apply(this, arguments);

  // How far a character should travel per control movement
  this.distancePerCycle = 50;
  this.type = 'character';

  // Position to render character in intially
  this.currentPosition = {
    x: location.x,
    y: location.y
  };
};

Character.prototype = Object.create(Entity.prototype);

/**
 * The character controller
 *
 * @function control
 * @memberof Character#
 * @param {Object} state The control messages being sent
 * @param {Boolean} state.isDirectionUp Whether the character should move up
 * @param {Boolean} state.isDirectionDown Whether the character should move down
 * @param {Boolean} state.isDirectionLeft Whether the character should move left
 * @param {Boolean} state.isDirectionRight Whether the character should move right
 * @return {Character} Instance of this character
 */
Character.prototype.control = function(state) {
  if (state.isDirectionUp && this.y > 0) {
    this.set('y', this.y - Math.min(this.distancePerCycle, this.y));
  }
  
  if (state.isDirectionDown && this.y + this.options.height < this.world.height) {
    this.set('y', this.y + Math.min(this.distancePerCycle, this.world.height - this.options.height - this.y));
  }
  
  if (state.isDirectionLeft && this.x > 0) {
    this.set('x', this.x - Math.min(this.distancePerCycle, this.x));
  }
  
  if (state.isDirectionRight && this.x + this.options.width < this.world.width) {
    this.set('x', this.x + Math.min(this.distancePerCycle, this.world.width - this.options.width - this.x));
  }

  return this;
};

/**
 * Teardown Character
 *
 * @function destroy
 * @memberof Character#
 * @return {Character} Instance of this character
 */
Character.prototype.destroy = function() {
  Entity.prototype.destroy.apply(this, arguments);

  if (this.controller instanceof Controller) {
    this.controller.detachEntity(this);
  }

  return this;
};

/**
 * Handle a collision with another object
 *
 * @function onCollision
 * @memberof Character#
 * @param {Array<Entity>} state Entities that are touching this character
 * @return {Character} This character instance
 */
Character.prototype.onCollision = _.noop;

/**
 * Render the character in the context of the world
 *
 * @function render
 * @memberof Character#
 * @return {Object} Instance of this character
 */
Character.prototype.render = function() {
  var ctx = this.world.ctx;

  this.currentPosition.x += Math.round((this.x - this.currentPosition.x) / 3);
  this.currentPosition.y += Math.round((this.y - this.currentPosition.y) / 3);

  if (this.options.color) {
    ctx.beginPath();
    ctx.fillStyle = this.options.color;
    ctx.fillRect(
      this.currentPosition.x,
      this.currentPosition.y,
      this.options.width,
      this.options.height
    );
    ctx.stroke();
  } else if (this.sprite) {
    ctx.drawImage(
      this.sprite.image,
      this.sprite.frame.offsetX,
      this.sprite.frame.offsetY,
      this.options.width,
      this.options.height,
      this.currentPosition.x,
      this.currentPosition.y,
      this.options.width,
      this.options.height
    );
    ctx.restore();
  }
};

module.exports = Character;

},{"./controller":12,"./entity":14}],10:[function(require,module,exports){
function CollisionDetector(options) {
  this.entities = {};
  this.entityMap = {};
}

CollisionDetector.prototype.detectCollisions = function(entity) {
  var _this = this,
      a = this.entityMap[entity.id],
      aId = entity.id;;

  _.forEach(this.entityMap, function(b, bId) {
    if (b) {
      var bEnt = _this.entities[bId],
          isOverlapping = (
            a.min[0] < b.max[0] &&
            a.min[1] < b.max[1] &&
            a.max[0] > b.min[0] && 
            a.max[1] > b.min[1]
          );

      if(isOverlapping && b !== a) {
        bEnt.onCollision(entity);

        // currently it is more important that
        // an entity responds after something it hits
        // this is bad
        entity.onCollision(bEnt);
      }
    }
  });
};

CollisionDetector.prototype.removeEntityFromMatrix = function(entity, previousCoordinates) {
  return this;
};

CollisionDetector.prototype.addEntityToMatrix = function(entity, coordinates) {
  return this;
};

CollisionDetector.prototype.updateEntityPosition = function(entity) {
  this.entityMap[entity.id] = this.getAABB(entity);
  this.detectCollisions(entity);
};

CollisionDetector.prototype.getAABB = function(entity) {
  return {
    min: [
      entity.x,
      entity.y
    ],
    max: [
      entity.x + entity.options.width,
      entity.y + entity.options.height
    ]
  };
};

CollisionDetector.prototype.untrackCollisions = function(entity) {
  delete this.entities[entity.id];
  delete this.entityMap[entity.id];
};

CollisionDetector.prototype.trackCollisions = function(entity) {
  this.entities[entity.id] = entity;
  entity.onChange('x y', _.bind(this.updateEntityPosition, this, entity));
  this.updateEntityPosition(entity);
};

CollisionDetector.prototype.reset = function() {
  this.entities = {};
  this.entityMap = {};
}

module.exports = CollisionDetector;

},{}],11:[function(require,module,exports){
var SwipeController = require('./swipe-controller');

function ContinuousSwipeController() {
  SwipeController.apply(this, arguments);

  // Send the current controller action to the character ever 200 ms
  setInterval(_.bind(this.sendControl, this), 200);
}

ContinuousSwipeController.prototype = Object.create(SwipeController.prototype);

ContinuousSwipeController.prototype.setControlState = function(key, event) {
  this.state = this.getStateByKey(key); 
};

ContinuousSwipeController.prototype.sendControl = function() {
  _.invoke(this.entities, 'control', this.state);
};

module.exports = ContinuousSwipeController;

},{"./swipe-controller":27}],12:[function(require,module,exports){
/**
 * Controls the movement of an Entity
 *
 * @class Controller
 */
var Controller = function(options) {
  this.state = {};
  this.options = _.assign({}, options);
  this.entities = [];
};


/**
 * Start controling an entities movement
 *
 * @function controlEntity
 * @memberof Controller#
 * @param {Entity} entity An entity to move
 * @return {Controller} Instance of this controller
 */
Controller.prototype.controlEntity = function(entity) {
  entity.controller = this;
  this.entities.push(entity);

  return this;
};

Controller.prototype.detachEntity = function(entity) {
  _.remove(this.entities, entity);
};

module.exports = Controller;

},{}],13:[function(require,module,exports){
var Character = require('./character'),
    Explosive = require('./explosive');

/**
 * A cow character
 *
 * @class Cow
 */
function Cow() {
  Character.apply(this, arguments);
  this.type = 'cow';
}

Cow.prototype = Object.create(Character.prototype);

/**
 * Handle a cow colliding into another object
 *
 * @function onCollision
 * @memberof Cow#
 * @param {Entity} collider An entity that the cow is colliding with
 */
Cow.prototype.onCollision = function(collider) {
  if (collider instanceof Explosive && collider.explosion.state.isExploding) {

    // bounce cow out of world
    this.set('x', -200);
    this.set('y', -200);

    // After cow should be out of frame, remove from world
    setTimeout(_.bind(function() {
      this.world.removeObject(this);
    }, this), 1000);
  }
};

/**
 * Render a cow to the world
 *
 * @function render
 * @memberof Cow#
 * @return {Cow} Instance of this cow
 */
Cow.prototype.render = function() {
  var ctx = this.world.ctx;

  this.currentPosition.x += Math.round((this.x - this.currentPosition.x) / 6);
  this.currentPosition.y += Math.round((this.y - this.currentPosition.y) / 6);

  this.currentPosition.x = this.currentPosition.x - 6 <= 0 ? this.x : this.currentPosition.x; 
  this.currentPosition.y = this.currentPosition.y - 6 <= 0 ? this.y : this.currentPosition.y; 

  ctx.drawImage(
    this.sprite.image,
    this.sprite.frame.offsetX,
    this.sprite.frame.offsetY,
    this.options.width,
    this.options.height,
    this.currentPosition.x,
    this.currentPosition.y,
    this.options.width,
    this.options.height
  );

  ctx.restore();

  return this;
};

module.exports = Cow;

},{"./character":9,"./explosive":15}],14:[function(require,module,exports){
var Observable = require('./observable');

/**
 * A base game entity to render in a world
 *
 * @class Entity
 */
function Entity(location, options) {
  // Add Observable mixin
  Observable.call(this);

  this.id = _.uniqueId('entity_');
  this.options = options;
  this.set('x', location.x);
  this.set('y', location.y);

  if (options.sprite) {
    this.sprite = options.sprite.create();
  }
}

/**
 * Teardown entity
 *
 * @function destroy
 * @memberof Entity#
 * @return {Entity} Instance of this entity
 */
Entity.prototype.destroy = function() {
  Observable.disable(this);
  return this;
};

/**
 * Register a function to call when the entity moves
 *
 * @function onMove
 * @memberof Entity#
 * @deprecated Use onChange instead
 * @param {Function} notifier Function to call when movement occurs
 * @return {Entity} Instance of this entity
 */
Entity.prototype.onMove = function(notifier) {
  this.onChange('x y', notifier);
};

module.exports = Entity;

},{"./observable":21}],15:[function(require,module,exports){
var Character = require('./character');

function Explosive(location, options) {
  Character.apply(this, arguments);

  this.type = options.type || 'weapon';
  this.set('explosion', {
    state: {
      isExploded: false,
      isExploding: false,
      strength: 20
    }
  });
}

Explosive.prototype = Object.create(Character.prototype);

Explosive.prototype.explode = function() {
  var _this = this;

  this.set('explosion.state.isExploding', true); 

  var degradeExplosionVerocity = _.bind(function() {
    this.state.strength -= 0.5;

    if(!this.state.strength) {
      _this.world.removeObject(_this);
    } else {
      setTimeout(degradeExplosionVerocity, 20);
    }
  }, this.explosion);

  degradeExplosionVerocity();

  return this;
};

Explosive.prototype.activate = function() {
  this.sprite.startAction('active');
  this.onCollision = this.explode;

  return this; 
};

Explosive.prototype.render = function() {
  var ctx = this.world.ctx,
      centerX = this.currentPosition.x + (this.options.width / 2),
      centerY = this.currentPosition.y + (this.options.height / 2);

  this.currentPosition.x += Math.round((this.x - this.currentPosition.x) / 2);
  this.currentPosition.y += Math.round((this.y - this.currentPosition.y) / 2);

  ctx.drawImage(
    this.sprite.image,
    this.sprite.frame.offsetX,
    this.sprite.frame.offsetY,
    this.options.width,
    this.options.height,
    this.currentPosition.x,
    this.currentPosition.y,
    this.options.width,
    this.options.height
  );

  ctx.restore();

  if (this.explosion.state.isExploding) {
    ctx.beginPath();
    ctx.lineWidth = this.explosion.state.strength;
    ctx.arc(centerX, centerY, (20 - this.explosion.state.strength) * 3, 0, 2, Math.PI, false);
    ctx.strokeStyle = 'orange';
    ctx.stroke();
    ctx.restore();
  }
};

Explosive.prototype.place = function(coordinates) {
  this.set('x', coordinates.x);
  this.set('y', coordinates.y);
};

module.exports = Explosive;

},{"./character":9}],16:[function(require,module,exports){
var Character = require('./character'),
    Mower = require('./mower');

function Grass() {
  Character.apply(this, arguments);
  this.type = 'grass';
}

Grass.prototype = Object.create(Character.prototype);

Grass.prototype.onCollision = function(collider) {
  if (collider instanceof Mower) {
    this.world.removeObject(this);
  }
};

module.exports = Grass;

},{"./character":9,"./mower":20}],17:[function(require,module,exports){
var Controller = require('./controller');

/**
 * A controller that uses a keyboard direction keys as input
 *
 * @class KeyboardController
 * @extends Controller
 */
var KeyboardController = function() {
  Controller.apply(this, arguments);
  
  window.addEventListener('keyup', this.setControlState.bind(this));
  window.addEventListener('keydown', this.setControlState.bind(this));
};

KeyboardController.prototype = Object.create(Controller.prototype);

KeyboardController.Keys = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
};

/**
 * Set the state of the controller and send it to the entities it controls
 *
 * @function setControllerState
 * @memberof KeyboardController#
 * @param {Object} state The direction state
 * @return {RandomController} Instance of this controller
 */
KeyboardController.prototype.setControlState = function(event) {
  switch (event.which) {
    case KeyboardController.Keys.UP:
      this.state.isDirectionUp = event.type === "keydown";
      break;
    case KeyboardController.Keys.DOWN:
      this.state.isDirectionDown = event.type === "keydown";
      break;
    case KeyboardController.Keys.LEFT:
      this.state.isDirectionLeft = event.type === "keydown";
      break;
    case KeyboardController.Keys.RIGHT:
      this.state.isDirectionRight = event.type === "keydown";
      break;
    default:
      break;
  }
  
  _.invoke(this.entities, 'control', this.state);

  return this;
};

module.exports = KeyboardController;

},{"./controller":12}],18:[function(require,module,exports){
/**
 * A game level
 *
 * @class Level
 * @param {Function} run Function to run when the level is starting
 */
function Level(run) {
  Level._levels.push(this);
  this.run = run;
}

Level._levels = [];
Level._current = 0;

/**
 * Get the next level in the game
 *
 * @function next
 * @memberof Level
 * @return {Level} Instance of next level
 */
Level.next = function() {
  Level._current++;
  return Level.current();
};

Level.current = function() {
  return Level._levels[
    Level._current
  ]
};

module.exports = Level;

},{}],19:[function(require,module,exports){
var Hammer = require('../bower_components/hammerjs/hammer.min');

function ModalMessage(text) {
  this.text = text;
  this.onClickButton = _.bind(this.onClickButton, this);
  this.mc = Hammer(document.body)
  
  // Bind modal tap actions
  this.mc.on('tap', this.onClickButton);
}

ModalMessage.prototype.render = function() {
  var WORLD_START_TOP = 0,
      WORLD_START_LEFT = 0,
      ctx = this.world.ctx,
      textSize,
      textHeight,
      textWidth,
      offsetWidth,
      offsetHeight;

  // Draw modal background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(
    WORLD_START_TOP + 10,
    WORLD_START_LEFT + 10 ,
    this.world.options.width - 20,
    this.world.options.height - 20
  );

  // Draw message text
  ctx.fillStyle = "white";
  ctx.font = '50px Helvetica';
  textSize = ctx.measureText(this.text);
  textWidth = textSize.width;
  textHeight = 50;
  offsetWidth = (this.world.options.width / 2) - (textWidth / 2);
  offsetHeight = (this.world.options.height / 2) - (textHeight / 2);
  ctx.fillText(this.text, offsetWidth, offsetHeight)

  if (this.button) {
    var buttonOffsetHeight = offsetHeight + textHeight + 30;

    ctx.fillStyle = '#1abc9c';
    ctx.font = '30px Helvetica';
    textSize = ctx.measureText(this.button.label);
    textWidth = textSize.width;
    textHeight = 30;
    offsetWidth = (this.world.options.width / 2) - (textWidth / 2) - 20;
    ctx.fillRect(offsetWidth, buttonOffsetHeight, textWidth + 20, textHeight + 20);
    ctx.strokeStyle = '#16a085';
    ctx.lineWidth = 5;
    ctx.strokeRect(offsetWidth, buttonOffsetHeight, textWidth + 20, textHeight + 20);
    ctx.fillStyle = 'white';
    ctx.fillText(this.button.label, offsetWidth + 10, buttonOffsetHeight + 30);
    ctx.lineWidth = 1;
    this.button.xStart = offsetWidth;
    this.button.yStart = buttonOffsetHeight;
    this.button.xEnd = offsetWidth + textWidth + 20;
    this.button.yEnd = buttonOffsetHeight + textHeight + 20;
  }
};

ModalMessage.prototype.destroy = function() {
  this.mc.off('tap', this.onClickButton);
};


ModalMessage.prototype.addButton = function(label, action) {
  this.button = {
    label: label,
    action: action
  };


  return this;
};

ModalMessage.prototype.onClickButton = function(event) {
  if (!this.button) return;

  var x = event.center.x,
      y = event.center.y,
      isClickInButton = (x > this.button.xStart &&
        x < this.button.xEnd &&
        y > this.button.yStart &&
        y < this.button.yEnd);

  if (isClickInButton) {
    this.button.action();
  }
};

module.exports = ModalMessage;

},{"../bower_components/hammerjs/hammer.min":2}],20:[function(require,module,exports){
var Character = require('./character'),
    Cow = require('./cow'),
    Hammer = require('../bower_components/hammerjs/hammer'),
    Explosive = require('./explosive');

function Mower(location, options) {
  _.defaults(options, {lives:3});

  Character.apply(this, arguments);  
  this.set('lives', options.lives);

  this.dropWeapon = _.bind(this.dropWeapon, this);

  this.mc = Hammer(document.body);
  this.mc.on('doubletap', this.dropWeapon);
}

Mower.prototype = Object.create(Character.prototype);

Mower.prototype.destroy = function() {
  Character.prototype.destroy.apply(this, arguments);
  this.mc.off('doubletap', this.dropWeapon);
};

Mower.prototype.control = function(state) {
  Character.prototype.control.apply(this, arguments);

  if(state.isDirectionUp) {
    this.sprite.startAction('goUp');
  }

  if(state.isDirectionDown) {
    this.sprite.startAction('goDown');
  }

  if(state.isDirectionLeft) {
    this.sprite.startAction('goLeft');
  }

  if(state.isDirectionRight) {
    this.sprite.startAction('goRight');
  }
};

Mower.prototype.dropWeapon = function(event) {
  var x = event.center.x,
      y = event.center.y;

  // Get middle of click
  x = (x + (this.options.width / 2))
  y = (y + (this.options.height / 2))

  // Get beginning coordinates of the closest cell
  x = x - (x % this.options.width);
  y = y - (y % this.options.height);

  if (this.weapon) {
    this.weapon.place({
      x: x,
      y: y
    });
    this.world.addObject(this.weapon);
    this.weapon.activate();
    this.set('weapon', null);
  }
}

Mower.prototype.onCollision = function(collider) {
  setTimeout(function() {
    var isColliderCow = collider instanceof Cow,
        isColliderExploding = collider instanceof Explosive 
          && collider.explosion.state.isExploding;

    if (isColliderCow || isColliderExploding) {
      return this.die();
    }

    if (collider instanceof Explosive && !this.weapon) {
      this.set('weapon', collider);

      this.set('weapon.currentPosition.x', this.currentPosition.x);
      this.set('weapon.currentPosition.y', this.currentPosition.y);

      return this.world.removeObject(this.weapon);
    }
  }.bind(this));
};

// Mower can only die once in a second
Mower.prototype.die = _.throttle(function() {
  this.set('x', 0);
  this.set('y', 0);

  if(this.lives > 0) {
    this.set('lives', this.lives - 1);
  }
}, 1000);

Mower.prototype.reset = function() {
  this.x = 0;
  this.y = 0;
  this.lives = this.options.lives;
};

module.exports = Mower;

},{"../bower_components/hammerjs/hammer":1,"./character":9,"./cow":13,"./explosive":15}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
var Controller = require('./controller');

/**
 * A controller that controls an entity with random movements
 *
 * @class RandomController
 * @extends Controller
 */
var RandomController = function() {
  var _this = this;
  
  Controller.apply(this, arguments);
  
  this.key = {
    direction: 1
  };
  
  setInterval(this.setControllerState.bind(this, this.key), 200);
  setInterval(this.changeKey.bind(this), 1000);
};

RandomController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

RandomController.prototype = Object.create(Controller.prototype);

/**
 * Change the direction of an entity to a random direction
 *
 * @function changeKey
 * @memberof RandomController#
 * @return {RandomController} Instance of this controller
 */
RandomController.prototype.changeKey = function() {
  this.key.direction = Math.floor(Math.random() * 5);

  return this;
};

/**
 * Set the state of the controller and send it to the entities it controls
 *
 * @function setControllerState
 * @memberof RandomController#
 * @param {Object} state The direction state
 * @return {RandomController} Instance of this controller
 */
RandomController.prototype.setControllerState = function(state) {
  this.state = {
    isDirectionUp: state.direction === RandomController.Keys.UP,
    isDirectionDown: state.direction === RandomController.Keys.DOWN,
    isDirectionLeft: state.direction === RandomController.Keys.LEFT,
    isDirectionRight: state.direction === RandomController.Keys.RIGHT
  };
  
  _.invoke(this.entities, 'control', this.state);

  return this;
};

module.exports = RandomController;

},{"./controller":12}],23:[function(require,module,exports){
/**
 * Runs a render loop
 *
 * @class Renderer
 * @param {World} world A world to render
 * @param {HTMLElement} rootNode Element to install game in
 */
var Renderer = function(world, rootNode) {
  this.world = world;
  rootNode.appendChild(this.world.el);
};

/**
 * Start the world render loop
 *
 * @function render
 * @memberof Renderer#
 * @return {Renderer} Instance of this renderer
 */
Renderer.prototype.render = function() {
  this.world.tick();
  
  requestAnimationFrame(this.render.bind(this));
  
  return this;
};

module.exports = Renderer;

},{}],24:[function(require,module,exports){
var Entity = require('./entity');

/**
 * A sliding message
 *
 * @class SlidingText
 * @extends Entity
 * @param {Object} location x, y coodinates of start of message
 * @param {Object} options Options to render method with
 */
function SlidingText(location, options) {
  Entity.apply(this, arguments);

  this.title = options.title;
  this.message = options.message;
}

SlidingText.prototype = Object.create(Entity.prototype);

/**
 * Move message to the right
 *
 * @function pan
 * @memberof SlidingText#
 */
SlidingText.prototype.pan = function() {
  this.x-=5;

  if (this.x + window.innerWidth <= 0) {
    this.world.removeObject(this);
  }
};

/**
 * Begin sliding message
 *
 * @function slide
 * @memberof SlidingText#
 */
SlidingText.prototype.slide = function() {
  setInterval(_.bind(this.pan, this), 16);
};

SlidingText.prototype.render = function() {
  var ctx = this.world.ctx;
  ctx.fillStyle = 'rgba(44, 62, 80, 0.5)';
  ctx.fillRect(this.x, this.y - 10, window.innerWidth, this.options.fontSize + 20);
  ctx.fillStyle = this.options.color;
  ctx.font = this.options.fontSize + 'px ' + this.options.fontFamily;
  ctx.fillText(this.title, this.x + 10, this.y + 10);
  ctx.font = '40px ' + this.options.fontFamily;
  ctx.fillText(this.message, this.x + 10, this.y + 50);
};

module.exports = SlidingText;

},{"./entity":14}],25:[function(require,module,exports){
/**
 * A sprite class and sprite registry
 *
 * @class Sprite
 * @param {String} src An image source for a sprite
 * @param {Integer} frameWidth Width of a single sprite frame
 * @param {Integer} frameHeight Height of a single sprite frame
 * @property {Image} img HTML image element for rendering sprite
 * @property {Object} options Options for rendering a sprite
 * @property {Integer} options.frameHeight Height of a single sprite frame
 * @property {Integer} options.frameWidth Width of a single sprite frame
 */
function Sprite(src, frameWidth, frameHeight) {
  this._actions = {};

  this.options = {
    frameHeight: frameHeight,
    frameWidth: frameWidth
  };

  this.img = document.createElement('img');
  this.img.src = src;
  this.img.width = this.options.frameWidth;
  this.img.height = this.options.frameHeight;

  // Register sprite
  Sprite._sprites[src] = this;

  // By default, the beginning of the sprite is the default action
  this.defineAction('default', [{
    offsetX: 0,
    offsetY: 0,
    width: 50,
    height: 50
  }]);
}

// Sprite registry
Sprite._sprites = {};

/**
 * Preload all sprites
 *
 * @function preloadSprites
 * @memberof Sprite
 * @param {Function} successCallback Callback called when all sprites have been loaded
 * @param {Function} errorCallback Callback to call if there is an error loading a sprite
 */
Sprite.preloadSprites = function(successCallback, errorCallback) {
  var countImagesLoaded = 0,
      countTotalImages = _.keys(Sprite._sprites).length;

  errorCallback = errorCallback || _.noop;

  function checkLoadCount() {
    countImagesLoaded++;
    if (countImagesLoaded === countTotalImages) {
      successCallback();
    }
  }

  _.forEach(Sprite._sprites, function(sprite) {
      if (sprite.img.complete) {
        countImagesLoaded++;
        checkLoadCount();
      } else {
        sprite.img.onload = function() {
          checkLoadCount();
        };

        sprite.img.onerror = function() {
          errorCallback();
        };
      }
  });
};

/**
 * Load a sprite from the registry
 *
 * @function load
 * @memberof Sprite
 * @param {String} spritePath The path to a sprite image file (used as the key to retrieve a sprite)
 * @return {Sprite} The sprite for the sprite image path key
 */
Sprite.load = function(spritePath) {
  return Sprite._sprites[spritePath];
};

/**
 * Define a set of positions for a sprite that represent an action (e.g. running)
 *
 * @function defineAction
 * @memberof Sprite#
 * @param {String} action Name of action
 * @param {Integer} [frameRefreshRate] Optional rate at which to go to next frame
 * @param {Array.<Object>} states Array of hashes holding sprite offset positions
 * @param {Integer} states.offsetX X offset of sprite position
 * @param {Integer} states.offsetY Y offset of sprite position
 * @return {Sprite} Instance of this sprite
 */
Sprite.prototype.defineAction = function(actionName, frameRefreshRate, frames) {
  if (!frames) {
    frames = frameRefreshRate;
    frameRefreshRate = undefined;
  }

  this._actions[actionName] = {
    frames: frames,
    frameRefreshRate: frameRefreshRate
  };

  return this;
};

Sprite.prototype.create = function() { 
  var action = this._actions['default'],
      state = { frameIndex: 0, timeout: null },
      spriteInstance;

  function onActionChange() {
    spriteInstance.destroy();

    // If action uses a set of frames, set frame incrementer
    if(action.frameRefreshRate) {
      state.timeout = setInterval(function() {
        state.frameIndex++;

        if(state.frameIndex === action.frames.length) {
          state.frameIndex = 0;
        }

        spriteInstance.frame = action.frames[state.frameIndex];
      }, action.frameRefreshRate);
    }

    spriteInstance.frame = action.frames[state.frameIndex];
  }

  spriteInstance = {

    // stop a frame incrementer from running
    destroy: function() {
      clearInterval(state.timeout);
    },

    // use a predefined sprite action
    startAction: _.bind(function(actionName) {
      action = this._actions[actionName]; 
      onActionChange();
    }, this),

    image: this.img,
  };

  onActionChange();

  return spriteInstance;
};

module.exports = Sprite;

},{}],26:[function(require,module,exports){
var Entity = require('./entity'),
    Observable = require('./observable');

function StatsBar() {
  Entity.apply(this, arguments);
  this.messages = {};
}

StatsBar.prototype = Object.create(Entity.prototype);

StatsBar.prototype.trackStat = function(statName, source, attribute, changeAttribute) {
  changeAttribute = changeAttribute || attribute;
  var stat = {
    name: statName,
    value: Observable.getNestedValue(source, changeAttribute)
  };

  this.messages[statName] = stat;

  source.onChange(attribute, _.bind(function(attr, value) {
    stat.value = Observable.getNestedValue(source, changeAttribute);
    this.messageString = this.buildMessageString(this.messages);
  }, this));

  this.messageString = this.buildMessageString(this.messages);
};

StatsBar.prototype.buildMessageString = function(messages) {
  return _.chain(messages)
    .filter(function(stat) {
      return stat.value;
    })
    .map(function(stat) {
      return stat.name + ': ' + stat.value;
    })
    .value()
    .join(', ');
}

StatsBar.prototype.render = function() {
  var ctx = this.world.ctx;

  ctx.font = "15px Helvetica";
  ctx.fillStyle = "white";
  ctx.fillText(
    this.messageString,
    this.x,
    this.y
  );
};

module.exports = StatsBar;

},{"./entity":14,"./observable":21}],27:[function(require,module,exports){
var Controller = require('./controller'),
    Hammer = require('../bower_components/hammerjs/hammer.min');

function SwipeController() {
  Controller.apply(this, arguments);

  var swipeRecognizer = new Hammer.Manager(document.body);

  swipeRecognizer.add(new Hammer.Swipe({
    direciton: Hammer.DIRECTION_ALL,
    threshold: 2,
    velocity: 0.03
  }));

  swipeRecognizer.on('swipeleft', _.bind(this.setControlState, this, SwipeController.Keys.LEFT));
  swipeRecognizer.on('swiperight', _.bind(this.setControlState, this, SwipeController.Keys.RIGHT));
  swipeRecognizer.on('swipeup', _.bind(this.setControlState, this, SwipeController.Keys.UP));
  swipeRecognizer.on('swipedown', _.bind(this.setControlState, this, SwipeController.Keys.DOWN));
}

SwipeController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

SwipeController.prototype = Object.create(Controller.prototype);

SwipeController.prototype.getStateByKey = function(key) {
  var state = {};

  switch (key) {
    case SwipeController.Keys.UP:
      state.isDirectionUp = true;
      break;
    case SwipeController.Keys.DOWN:
      state.isDirectionDown = true;
      break;
    case SwipeController.Keys.LEFT:
      state.isDirectionLeft = true;
      break;
    case SwipeController.Keys.RIGHT:
      state.isDirectionRight = true;
      break;
    default:
      break;
  }

  return state;
};

SwipeController.prototype.setControlState = function(key, event) {
  var state = this.getStateByKey(key),
      force = Math.round(Math.abs(event.velocity));

  _.times(force, _.bind(function() {
    _.invoke(this.entities, 'control', state);
  }, this));

  return this;
};

module.exports = SwipeController;

},{"../bower_components/hammerjs/hammer.min":2,"./controller":12}],28:[function(require,module,exports){
var CollisionDetector = require('./collision-detector-2'),
    Entity = require('./entity'),
    Observable = require('./observable');

/**
 * An environment for your characters and entities to live in
 *
 * @class World
 * @param {HTMLElement} el Canvas to render game entities in
 * @param {Object} options Options to configure the game world
 * @param {Integer} options.height Height of game viewport
 * @param {Integer} options.width Width of game viewport
 */
var World = function(el, options) {

  // make world attributes observable
  Observable.call(this);

  this.el = document.createElement('canvas');
  this.collisionDetector = new CollisionDetector({
    x: options.width,
    y: options.height
  });
  this.ctx = this.el.getContext('2d');

  // Set the size of the canvas
  this.el.width = options.width;
  this.el.height = options.height;
  
  this.entities = [];
  this.options = options;
  this._onRemoveObjectNotifiers = [];
  this.height = options.height;
  this.width = options.width;
};

/**
 * Add an entity to the game
 *
 * @function addObject
 * @memberof World#
 * @param {Entity} entity An instance of a game entity to render in the game
 * @return {World} This world instance
 */
World.prototype.addObject = function(entity) {
  entity.world = this;

  if (entity instanceof Entity) {
    this.collisionDetector.trackCollisions(entity);
  }

  this.entities.push(entity);

  return this;
};

/**
 * Remove an entity from the game
 *
 * @function removeObject
 * @memberof World
 * @param {Entity} entity An entity that exists in the game
 * @return {World} This world instance
 */
World.prototype.removeObject = function(entity) {
  _.remove(this.entities, entity);
  this.collisionDetector.untrackCollisions(entity);
  entity.destroy();
  _.invoke(this._onRemoveObjectNotifiers, 'cb', entity);

  return this;
};

World.prototype.reset = function(entity) {
  this.collisionDetector.reset();
  _.invoke(this.entities, 'destroy');
  this.entities = [];
};

/**
 * Register a callback to run whenever an object is removed from the world
 *
 * @function onRemoveObject
 * @memberof World#
 * @param {Function} notifier Callback to call when object is removed
 * @return {Object} Pointer to object notifier (can be used with offRemoveObject)
 */
World.prototype.onRemoveObject = function(notifier) {
  this._onRemoveObjectNotifiers.push({
    cb: notifier
  });

  return _.last(this._onRemoveObjectNotifiers);
};

/**
 * Remove a callback registered with onRemoveObject
 *
 * @function offRemoveObject
 * @memberof World#
 * @param {Object} notifier Returned notifier object from onRemoveObject
 */
World.prototype.offRemoveObject = function(notifier) {
  _.remove(this._onRemoveObjectNotifiers, notifier);
};

/**
 * Render every object in the game and update collision state
 *
 * @function tick
 * @memberof World#
 * @return {World} This world instance
 */
World.prototype.tick = function() {
  var _this = this;

  // Clear the entire before redraw
  this.ctx.clearRect(0, 0, this.options.width, this.options.height);

  // Render all objects in world
  _.invoke(this.entities, 'render');

  return this;
};

module.exports = World;

},{"./collision-detector-2":10,"./entity":14,"./observable":21}]},{},[3])