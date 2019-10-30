module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

var cacheManager = __webpack_require__(971);
var memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/});
var ttl = 5;

/***/ }),

/***/ 167:
/***/ (function(module) {


var isObject = function isObject(value) {
    return value instanceof Object && value.constructor === Object;
};

var parseWrapArguments = function parseWrapArguments(args) {
    var length = args.length;
    var work;
    var options = {};
    var cb;

    /**
     * As we can receive an unlimited number of keys
     * we find the index of the first function which is
     * the "work" handler to fetch the keys.
     */
    for (var i = 0; i < length; i += 1) {
        if (typeof args[i] === 'function') {
            if (typeof args[i + 2] === 'function') {
                cb = args.pop();
            } else if (typeof args[i + 1] === 'function') {
                cb = args.pop();
            }
            if (isObject(args[i + 1])) {
                options = args.pop();
            }
            work = args.pop();
            break;
        }
    }

    return {
        keys: args,
        work: work,
        options: options,
        cb: cb
    };
};

module.exports = {
    isObject: isObject,
    parseWrapArguments: parseWrapArguments,
};


/***/ }),

/***/ 210:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = LRUCache

// This will be a proper iterable 'Map' in engines that support it,
// or a fakey-fake PseudoMap in older versions.
var Map = __webpack_require__(718)
var util = __webpack_require__(669)

// A linked list to keep track of recently-used-ness
var Yallist = __webpack_require__(612)

// use symbols if possible, otherwise just _props
var symbols = {}
var hasSymbol = typeof Symbol === 'function'
var makeSymbol
if (hasSymbol) {
  makeSymbol = function (key) {
    return Symbol.for(key)
  }
} else {
  makeSymbol = function (key) {
    return '_' + key
  }
}

function priv (obj, key, val) {
  var sym
  if (symbols[key]) {
    sym = symbols[key]
  } else {
    sym = makeSymbol(key)
    symbols[key] = sym
  }
  if (arguments.length === 2) {
    return obj[sym]
  } else {
    obj[sym] = val
    return val
  }
}

function naiveLength () { return 1 }

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
function LRUCache (options) {
  if (!(this instanceof LRUCache)) {
    return new LRUCache(options)
  }

  if (typeof options === 'number') {
    options = { max: options }
  }

  if (!options) {
    options = {}
  }

  var max = priv(this, 'max', options.max)
  // Kind of weird to have a default max of Infinity, but oh well.
  if (!max ||
      !(typeof max === 'number') ||
      max <= 0) {
    priv(this, 'max', Infinity)
  }

  var lc = options.length || naiveLength
  if (typeof lc !== 'function') {
    lc = naiveLength
  }
  priv(this, 'lengthCalculator', lc)

  priv(this, 'allowStale', options.stale || false)
  priv(this, 'maxAge', options.maxAge || 0)
  priv(this, 'dispose', options.dispose)
  this.reset()
}

// resize the cache when the max changes.
Object.defineProperty(LRUCache.prototype, 'max', {
  set: function (mL) {
    if (!mL || !(typeof mL === 'number') || mL <= 0) {
      mL = Infinity
    }
    priv(this, 'max', mL)
    trim(this)
  },
  get: function () {
    return priv(this, 'max')
  },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'allowStale', {
  set: function (allowStale) {
    priv(this, 'allowStale', !!allowStale)
  },
  get: function () {
    return priv(this, 'allowStale')
  },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'maxAge', {
  set: function (mA) {
    if (!mA || !(typeof mA === 'number') || mA < 0) {
      mA = 0
    }
    priv(this, 'maxAge', mA)
    trim(this)
  },
  get: function () {
    return priv(this, 'maxAge')
  },
  enumerable: true
})

// resize the cache when the lengthCalculator changes.
Object.defineProperty(LRUCache.prototype, 'lengthCalculator', {
  set: function (lC) {
    if (typeof lC !== 'function') {
      lC = naiveLength
    }
    if (lC !== priv(this, 'lengthCalculator')) {
      priv(this, 'lengthCalculator', lC)
      priv(this, 'length', 0)
      priv(this, 'lruList').forEach(function (hit) {
        hit.length = priv(this, 'lengthCalculator').call(this, hit.value, hit.key)
        priv(this, 'length', priv(this, 'length') + hit.length)
      }, this)
    }
    trim(this)
  },
  get: function () { return priv(this, 'lengthCalculator') },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'length', {
  get: function () { return priv(this, 'length') },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'itemCount', {
  get: function () { return priv(this, 'lruList').length },
  enumerable: true
})

LRUCache.prototype.rforEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = priv(this, 'lruList').tail; walker !== null;) {
    var prev = walker.prev
    forEachStep(this, fn, walker, thisp)
    walker = prev
  }
}

function forEachStep (self, fn, node, thisp) {
  var hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!priv(self, 'allowStale')) {
      hit = undefined
    }
  }
  if (hit) {
    fn.call(thisp, hit.value, hit.key, self)
  }
}

LRUCache.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = priv(this, 'lruList').head; walker !== null;) {
    var next = walker.next
    forEachStep(this, fn, walker, thisp)
    walker = next
  }
}

LRUCache.prototype.keys = function () {
  return priv(this, 'lruList').toArray().map(function (k) {
    return k.key
  }, this)
}

LRUCache.prototype.values = function () {
  return priv(this, 'lruList').toArray().map(function (k) {
    return k.value
  }, this)
}

LRUCache.prototype.reset = function () {
  if (priv(this, 'dispose') &&
      priv(this, 'lruList') &&
      priv(this, 'lruList').length) {
    priv(this, 'lruList').forEach(function (hit) {
      priv(this, 'dispose').call(this, hit.key, hit.value)
    }, this)
  }

  priv(this, 'cache', new Map()) // hash of items by key
  priv(this, 'lruList', new Yallist()) // list of items in order of use recency
  priv(this, 'length', 0) // length of items in the list
}

LRUCache.prototype.dump = function () {
  return priv(this, 'lruList').map(function (hit) {
    if (!isStale(this, hit)) {
      return {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }
    }
  }, this).toArray().filter(function (h) {
    return h
  })
}

LRUCache.prototype.dumpLru = function () {
  return priv(this, 'lruList')
}

LRUCache.prototype.inspect = function (n, opts) {
  var str = 'LRUCache {'
  var extras = false

  var as = priv(this, 'allowStale')
  if (as) {
    str += '\n  allowStale: true'
    extras = true
  }

  var max = priv(this, 'max')
  if (max && max !== Infinity) {
    if (extras) {
      str += ','
    }
    str += '\n  max: ' + util.inspect(max, opts)
    extras = true
  }

  var maxAge = priv(this, 'maxAge')
  if (maxAge) {
    if (extras) {
      str += ','
    }
    str += '\n  maxAge: ' + util.inspect(maxAge, opts)
    extras = true
  }

  var lc = priv(this, 'lengthCalculator')
  if (lc && lc !== naiveLength) {
    if (extras) {
      str += ','
    }
    str += '\n  length: ' + util.inspect(priv(this, 'length'), opts)
    extras = true
  }

  var didFirst = false
  priv(this, 'lruList').forEach(function (item) {
    if (didFirst) {
      str += ',\n  '
    } else {
      if (extras) {
        str += ',\n'
      }
      didFirst = true
      str += '\n  '
    }
    var key = util.inspect(item.key).split('\n').join('\n  ')
    var val = { value: item.value }
    if (item.maxAge !== maxAge) {
      val.maxAge = item.maxAge
    }
    if (lc !== naiveLength) {
      val.length = item.length
    }
    if (isStale(this, item)) {
      val.stale = true
    }

    val = util.inspect(val, opts).split('\n').join('\n  ')
    str += key + ' => ' + val
  })

  if (didFirst || extras) {
    str += '\n'
  }
  str += '}'

  return str
}

LRUCache.prototype.set = function (key, value, maxAge) {
  maxAge = maxAge || priv(this, 'maxAge')

  var now = maxAge ? Date.now() : 0
  var len = priv(this, 'lengthCalculator').call(this, value, key)

  if (priv(this, 'cache').has(key)) {
    if (len > priv(this, 'max')) {
      del(this, priv(this, 'cache').get(key))
      return false
    }

    var node = priv(this, 'cache').get(key)
    var item = node.value

    // dispose of the old one before overwriting
    if (priv(this, 'dispose')) {
      priv(this, 'dispose').call(this, key, item.value)
    }

    item.now = now
    item.maxAge = maxAge
    item.value = value
    priv(this, 'length', priv(this, 'length') + (len - item.length))
    item.length = len
    this.get(key)
    trim(this)
    return true
  }

  var hit = new Entry(key, value, len, now, maxAge)

  // oversized objects fall out of cache automatically.
  if (hit.length > priv(this, 'max')) {
    if (priv(this, 'dispose')) {
      priv(this, 'dispose').call(this, key, value)
    }
    return false
  }

  priv(this, 'length', priv(this, 'length') + hit.length)
  priv(this, 'lruList').unshift(hit)
  priv(this, 'cache').set(key, priv(this, 'lruList').head)
  trim(this)
  return true
}

LRUCache.prototype.has = function (key) {
  if (!priv(this, 'cache').has(key)) return false
  var hit = priv(this, 'cache').get(key).value
  if (isStale(this, hit)) {
    return false
  }
  return true
}

LRUCache.prototype.get = function (key) {
  return get(this, key, true)
}

LRUCache.prototype.peek = function (key) {
  return get(this, key, false)
}

LRUCache.prototype.pop = function () {
  var node = priv(this, 'lruList').tail
  if (!node) return null
  del(this, node)
  return node.value
}

LRUCache.prototype.del = function (key) {
  del(this, priv(this, 'cache').get(key))
}

LRUCache.prototype.load = function (arr) {
  // reset the cache
  this.reset()

  var now = Date.now()
  // A previous serialized cache has the most recent items first
  for (var l = arr.length - 1; l >= 0; l--) {
    var hit = arr[l]
    var expiresAt = hit.e || 0
    if (expiresAt === 0) {
      // the item was created without expiration in a non aged cache
      this.set(hit.k, hit.v)
    } else {
      var maxAge = expiresAt - now
      // dont add already expired items
      if (maxAge > 0) {
        this.set(hit.k, hit.v, maxAge)
      }
    }
  }
}

LRUCache.prototype.prune = function () {
  var self = this
  priv(this, 'cache').forEach(function (value, key) {
    get(self, key, false)
  })
}

function get (self, key, doUse) {
  var node = priv(self, 'cache').get(key)
  if (node) {
    var hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!priv(self, 'allowStale')) hit = undefined
    } else {
      if (doUse) {
        priv(self, 'lruList').unshiftNode(node)
      }
    }
    if (hit) hit = hit.value
  }
  return hit
}

function isStale (self, hit) {
  if (!hit || (!hit.maxAge && !priv(self, 'maxAge'))) {
    return false
  }
  var stale = false
  var diff = Date.now() - hit.now
  if (hit.maxAge) {
    stale = diff > hit.maxAge
  } else {
    stale = priv(self, 'maxAge') && (diff > priv(self, 'maxAge'))
  }
  return stale
}

function trim (self) {
  if (priv(self, 'length') > priv(self, 'max')) {
    for (var walker = priv(self, 'lruList').tail;
         priv(self, 'length') > priv(self, 'max') && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      var prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

function del (self, node) {
  if (node) {
    var hit = node.value
    if (priv(self, 'dispose')) {
      priv(self, 'dispose').call(this, hit.key, hit.value)
    }
    priv(self, 'length', priv(self, 'length') - hit.length)
    priv(self, 'cache').delete(hit.key)
    priv(self, 'lruList').removeNode(node)
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, length, now, maxAge) {
  this.key = key
  this.value = value
  this.length = length
  this.now = now
  this.maxAge = maxAge || 0
}


/***/ }),

/***/ 432:
/***/ (function(module, __unusedexports, __webpack_require__) {

/** @namespace cacheManager */
var cacheManager = {
    caching: __webpack_require__(869),
    multiCaching: __webpack_require__(992)
};

module.exports = cacheManager;


/***/ }),

/***/ 457:
/***/ (function(module, __unusedexports, __webpack_require__) {

var Lru = __webpack_require__(210);
var utils = __webpack_require__(167);
var isObject = utils.isObject;

var memoryStore = function(args) {
    args = args || {};
    var self = {};
    self.name = 'memory';
    var Promise = args.promiseDependency || global.Promise;
    self.usePromises = (typeof Promise === 'undefined' || args.noPromises) ? false : true;

    var ttl = args.ttl;
    var lruOpts = {
        max: args.max || 500,
        maxAge: (ttl || ttl === 0) ? ttl * 1000 : null,
        dispose: args.dispose,
        length: args.length,
        stale: args.stale
    };

    var lruCache = new Lru(lruOpts);

    var setMultipleKeys = function setMultipleKeys(keysValues, maxAge) {
        var length = keysValues.length;
        var values = [];
        for (var i = 0; i < length; i += 2) {
            lruCache.set(keysValues[i], keysValues[i + 1], maxAge);
            values.push(keysValues[i + 1]);
        }
        return values;
    };

    self.set = function(key, value, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = {};
        }
        options = options || {};

        var maxAge = (options.ttl || options.ttl === 0) ? options.ttl * 1000 : lruOpts.maxAge;

        lruCache.set(key, value, maxAge);
        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve(value);
        }
    };

    self.mset = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (args.length % 2 > 0 && isObject(args[args.length - 1])) {
            options = args.pop();
        }

        var maxAge = (options.ttl || options.ttl === 0) ? options.ttl * 1000 : lruOpts.maxAge;

        var values = setMultipleKeys(args, maxAge);

        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve(values);
        }
    };

    self.get = function(key, options, cb) {
        if (typeof options === 'function') {
            cb = options;
        }
        var value = lruCache.get(key);

        if (cb) {
            process.nextTick(cb.bind(null, null, value));
        } else if (self.usePromises) {
            return Promise.resolve(value);
        } else {
            return value;
        }
    };

    self.mget = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (isObject(args[args.length - 1])) {
            options = args.pop();
        }

        var values = args.map(function(key) {
            return lruCache.get(key);
        });

        if (cb) {
            process.nextTick(cb.bind(null, null, values));
        } else if (self.usePromises) {
            return Promise.resolve(values);
        } else {
            return values;
        }
    };

    self.del = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (isObject(args[args.length - 1])) {
            options = args.pop();
        }

        if (Array.isArray(args[0])) {
            args = args[0];
        }

        args.forEach(function(key) {
            lruCache.del(key);
        });

        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve();
        }
    };

    self.reset = function(cb) {
        lruCache.reset();
        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve();
        }
    };

    self.keys = function(cb) {
        var keys = lruCache.keys();
        if (cb) {
            process.nextTick(cb.bind(null, null, keys));
        } else if (self.usePromises) {
            return Promise.resolve(keys);
        } else {
            return keys;
        }
    };

    return self;
};

var methods = {
    create: function(args) {
        return memoryStore(args);
    }
};

module.exports = methods;


/***/ }),

/***/ 492:
/***/ (function(module) {

var hasOwnProperty = Object.prototype.hasOwnProperty

module.exports = PseudoMap

function PseudoMap (set) {
  if (!(this instanceof PseudoMap)) // whyyyyyyy
    throw new TypeError("Constructor PseudoMap requires 'new'")

  this.clear()

  if (set) {
    if ((set instanceof PseudoMap) ||
        (typeof Map === 'function' && set instanceof Map))
      set.forEach(function (value, key) {
        this.set(key, value)
      }, this)
    else if (Array.isArray(set))
      set.forEach(function (kv) {
        this.set(kv[0], kv[1])
      }, this)
    else
      throw new TypeError('invalid argument')
  }
}

PseudoMap.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  Object.keys(this._data).forEach(function (k) {
    if (k !== 'size')
      fn.call(thisp, this._data[k].value, this._data[k].key)
  }, this)
}

PseudoMap.prototype.has = function (k) {
  return !!find(this._data, k)
}

PseudoMap.prototype.get = function (k) {
  var res = find(this._data, k)
  return res && res.value
}

PseudoMap.prototype.set = function (k, v) {
  set(this._data, k, v)
}

PseudoMap.prototype.delete = function (k) {
  var res = find(this._data, k)
  if (res) {
    delete this._data[res._index]
    this._data.size--
  }
}

PseudoMap.prototype.clear = function () {
  var data = Object.create(null)
  data.size = 0

  Object.defineProperty(this, '_data', {
    value: data,
    enumerable: false,
    configurable: true,
    writable: false
  })
}

Object.defineProperty(PseudoMap.prototype, 'size', {
  get: function () {
    return this._data.size
  },
  set: function (n) {},
  enumerable: true,
  configurable: true
})

PseudoMap.prototype.values =
PseudoMap.prototype.keys =
PseudoMap.prototype.entries = function () {
  throw new Error('iterators are not implemented in this version')
}

// Either identical, or both NaN
function same (a, b) {
  return a === b || a !== a && b !== b
}

function Entry (k, v, i) {
  this.key = k
  this.value = v
  this._index = i
}

function find (data, k) {
  for (var i = 0, s = '_' + k, key = s;
       hasOwnProperty.call(data, key);
       key = s + i++) {
    if (same(data[key].key, k))
      return data[key]
  }
}

function set (data, k, v) {
  for (var i = 0, s = '_' + k, key = s;
       hasOwnProperty.call(data, key);
       key = s + i++) {
    if (same(data[key].key, k)) {
      data[key].value = v
      return
    }
  }
  data.size++
  data[key] = new Entry(k, v, key)
}


/***/ }),

/***/ 571:
/***/ (function(module) {

function CallbackFiller() {
    this.queues = {};
}

CallbackFiller.prototype.fill = function(key, err, data) {
    var waiting = this.queues[key];
    delete this.queues[key];

    if (waiting && waiting.length) {
        waiting.forEach(function(task) {
            (task.cb)(err, data);
        });
    }
};

CallbackFiller.prototype.has = function(key) {
    return this.queues[key];
};

CallbackFiller.prototype.add = function(key, funcObj) {
    if (this.queues[key]) {
        this.queues[key].push(funcObj);
    } else {
        this.queues[key] = [funcObj];
    }
};

module.exports = CallbackFiller;


/***/ }),

/***/ 612:
/***/ (function(module) {

module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}


/***/ }),

/***/ 647:
/***/ (function(module, __unusedexports, __webpack_require__) {

var utils = __webpack_require__(167);
var isObject = utils.isObject;

/**
 * Store that do nothing.
 * Can be used for development environment.
 */
var noneStore = function(args) {
    args = args || {};
    var Promise = args.promiseDependency || global.Promise;

    var self = {};
    self.name = 'none';
    self.usePromises = (typeof Promise === 'undefined' || args.noPromises) ? false : true;

    self.set = function(key, value, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = {};
        }

        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve(value);
        }
    };

    self.mset = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (args.length % 2 > 0 && isObject(args[args.length - 1])) {
            options = args.pop();
        }

        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            var values = [];
            for (var i = 0; i < args.length; i += 2) {
                values.push(args[i + 1]);
            }
            return Promise.resolve(values);
        }
    };

    self.get = function(key, options, cb) {
        var value;
        if (typeof options === 'function') {
            cb = options;
        }

        if (cb) {
            process.nextTick(cb.bind(null, null, value));
        } else if (self.usePromises) {
            return Promise.resolve(value);
        } else {
            return value;
        }
    };

    self.mget = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (isObject(args[args.length - 1])) {
            options = args.pop();
        }

        var values = args.map(function() {
            return;
        });

        if (cb) {
            process.nextTick(cb.bind(null, null, values));
        } else if (self.usePromises) {
            return Promise.resolve(values);
        } else {
            return values;
        }
    };

    self.del = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (isObject(args[args.length - 1])) {
            options = args.pop();
        }

        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve();
        }
    };

    self.reset = function(cb) {
        if (cb) {
            process.nextTick(cb.bind(null, null));
        } else if (self.usePromises) {
            return Promise.resolve();
        }
    };

    self.keys = function(cb) {
        var keys = [];
        if (cb) {
            process.nextTick(cb.bind(null, null, keys));
        } else if (self.usePromises) {
            return Promise.resolve(keys);
        } else {
            return keys;
        }
    };

    return self;
};

var methods = {
    create: function(args) {
        return noneStore(args);
    }
};

module.exports = methods;


/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 718:
/***/ (function(module, __unusedexports, __webpack_require__) {

if (process.env.npm_package_name === 'pseudomap' &&
    process.env.npm_lifecycle_script === 'test')
  process.env.TEST_PSEUDOMAP = 'true'

if (typeof Map === 'function' && !process.env.TEST_PSEUDOMAP) {
  module.exports = Map
} else {
  module.exports = __webpack_require__(492)
}


/***/ }),

/***/ 816:
/***/ (function(module) {

/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if ( true && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());


/***/ }),

/***/ 869:
/***/ (function(module, __unusedexports, __webpack_require__) {

/** @module cacheManager/caching */
/*jshint maxcomplexity:16*/
function __ncc_wildcard$0 (arg) {
  if (arg === "memory.js") return __webpack_require__(457);
  else if (arg === "none.js") return __webpack_require__(647);
}
var CallbackFiller = __webpack_require__(571);
var utils = __webpack_require__(167);
var parseWrapArguments = utils.parseWrapArguments;

/**
 * Generic caching interface that wraps any caching library with a compatible interface.
 *
 * @param {object} args
 * @param {object|string} args.store - The store must at least have `set` and a `get` functions.
 * @param {function} [args.isCacheableValue] - A callback function which is called
 *   with every value returned from cache or from a wrapped function. This lets you specify
 *   which values should and should not be cached. If the function returns true, it will be
 *   stored in cache. By default it caches everything except undefined.
 */
var caching = function(args) {
    args = args || {};
    var self = {};
    if (typeof args.store === 'object') {
        if (args.store.create) {
            self.store = args.store.create(args);
        } else {
            self.store = args.store;
        }
    } else {
        var storeName = args.store || 'memory';
        self.store = __ncc_wildcard$0(storeName).create(args);
    }

    // do we handle a cache error the same as a cache miss?
    self.ignoreCacheErrors = args.ignoreCacheErrors || false;

    var Promise = args.promiseDependency || global.Promise;

    var callbackFiller = new CallbackFiller();

    if (typeof args.isCacheableValue === 'function') {
        self._isCacheableValue = args.isCacheableValue;
    } else if (typeof self.store.isCacheableValue === 'function') {
        self._isCacheableValue = self.store.isCacheableValue.bind(self.store);
    } else {
        self._isCacheableValue = function(value) {
            return value !== undefined;
        };
    }

    function wrapPromise(key, promise, options) {
        return new Promise(function(resolve, reject) {
            self.wrap(key, function(cb) {
                Promise.resolve()
                    .then(promise)
                    .then(function(result) {
                        cb(null, result);
                        return null;
                    })
                    .catch(cb);
            }, options, function(err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    /**
     * Wraps a function in cache. I.e., the first time the function is run,
     * its results are stored in cache so subsequent calls retrieve from cache
     * instead of calling the function.
     * You can pass any number of keys as long as the wrapped function returns
     * an array with the same number of values and in the same order.
     *
     * @function
     * @name wrap
     *
     * @param {string} key - The cache key to use in cache operations. Can be one or many.
     * @param {function} work - The function to wrap
     * @param {object} [options] - options passed to `set` function
     * @param {function} cb
     *
     * @example
     * var key = 'user_' + userId;
     * cache.wrap(key, function(cb) {
     *     User.get(userId, cb);
     * }, function(err, user) {
     *     console.log(user);
     * });
     *
     * // Multiple keys
     * var key = 'user_' + userId;
     * var key2 = 'user_' + userId2;
     * cache.wrap(key, key2, function(cb) {
     *     User.getMany([userId, userId2], cb);
     * }, function(err, users) {
     *     console.log(users[0]);
     *     console.log(users[1]);
     * });
     */
    self.wrap = function() {
        var parsedArgs = parseWrapArguments(Array.prototype.slice.apply(arguments));
        var keys = parsedArgs.keys;
        var work = parsedArgs.work;
        var options = parsedArgs.options;
        var cb = parsedArgs.cb;

        if (!cb) {
            keys.push(work);
            keys.push(options);
            return wrapPromise.apply(this, keys);
        }

        if (keys.length > 1) {
            /**
             * Handle more than 1 key
             */
            return wrapMultiple(keys, work, options, cb);
        }

        var key = keys[0];

        var hasKey = callbackFiller.has(key);
        callbackFiller.add(key, {cb: cb});
        if (hasKey) { return; }

        self.store.get(key, options, function(err, result) {
            if (err && (!self.ignoreCacheErrors)) {
                callbackFiller.fill(key, err);
            } else if (self._isCacheableValue(result)) {
                callbackFiller.fill(key, null, result);
            } else {
                work(function(err, data) {
                    if (err) {
                        callbackFiller.fill(key, err);
                        return;
                    }

                    if (!self._isCacheableValue(data)) {
                        callbackFiller.fill(key, null, data);
                        return;
                    }

                    if (options && typeof options.ttl === 'function') {
                        options.ttl = options.ttl(data);
                    }

                    self.store.set(key, data, options, function(err) {
                        if (err && (!self.ignoreCacheErrors)) {
                            callbackFiller.fill(key, err);
                        } else {
                            callbackFiller.fill(key, null, data);
                        }
                    });
                });
            }
        });
    };

    function wrapMultiple(keys, work, options, cb) {
        /**
         * We create a unique key for the multiple keys
         * by concatenating them
         */
        var combinedKey = keys.reduce(function(acc, k) {
            return acc + k;
        }, '');

        var hasKey = callbackFiller.has(combinedKey);
        callbackFiller.add(combinedKey, {cb: cb});
        if (hasKey) { return; }

        keys.push(options);
        keys.push(onResult);

        self.store.mget.apply(self.store, keys);

        function onResult(err, result) {
            if (err && (!self.ignoreCacheErrors)) {
                return callbackFiller.fill(combinedKey, err);
            }

            /**
            * If all the values returned are cacheable we don't need
            * to call our "work" method and the values returned by the cache
            * are valid. If one or more of the values is not cacheable
            * the cache result is not valid.
            */
            var cacheOK = Array.isArray(result) && result.filter(function(_result) {
                return self._isCacheableValue(_result);
            }).length === result.length;

            if (cacheOK) {
                return callbackFiller.fill(combinedKey, null, result);
            }

            return work(function(err, data) {
                if (err) {
                    return done(err);
                }

                var _args = [];
                data.forEach(function(value, i) {
                    /**
                     * Add the {key, value} pair to the args
                     * array that we will send to mset()
                     */
                    if (self._isCacheableValue(value)) {
                        _args.push(keys[i]);
                        _args.push(value);
                    }
                });

                // If no key|value, exit
                if (_args.length === 0) {
                    return done(null);
                }

                if (options && typeof options.ttl === 'function') {
                    options.ttl = options.ttl(data);
                }

                _args.push(options);
                _args.push(done);

                self.store.mset.apply(self.store, _args);

                function done(err) {
                    if (err && (!self.ignoreCacheErrors)) {
                        callbackFiller.fill(combinedKey, err);
                    } else {
                        callbackFiller.fill(combinedKey, null, data);
                    }
                }
            });
        }
    }

    /**
     * Binds to the underlying store's `get` function.
     * @function
     * @name get
     */
    self.get = self.store.get.bind(self.store);

    /**
     * Get multiple keys at once.
     * Binds to the underlying store's `mget` function.
     * @function
     * @name mget
     */
    if (typeof self.store.mget === 'function') {
        self.mget = self.store.mget.bind(self.store);
    }

    /**
     * Binds to the underlying store's `set` function.
     * @function
     * @name set
     */
    self.set = self.store.set.bind(self.store);

    /**
     * Set multiple keys at once.
     * It accepts any number of {key, value} pair
     * Binds to the underlying store's `mset` function.
     * @function
     * @name mset
     */
    if (typeof self.store.mset === 'function') {
        self.mset = self.store.mset.bind(self.store);
    }

    /**
     * Binds to the underlying store's `del` function if it exists.
     * @function
     * @name del
     */
    if (typeof self.store.del === 'function') {
        self.del = self.store.del.bind(self.store);
    }

    /**
     * Binds to the underlying store's `setex` function if it exists.
     * @function
     * @name setex
     */
    if (typeof self.store.setex === 'function') {
        self.setex = self.store.setex.bind(self.store);
    }

    /**
     * Binds to the underlying store's `reset` function if it exists.
     * @function
     * @name reset
     */
    if (typeof self.store.reset === 'function') {
        self.reset = self.store.reset.bind(self.store);
    }

    /**
     * Binds to the underlying store's `keys` function if it exists.
     * @function
     * @name keys
     */
    if (typeof self.store.keys === 'function') {
        self.keys = self.store.keys.bind(self.store);
    }

    /**
     * Binds to the underlying store's `ttl` function if it exists.
     * @function
     * @name ttl
     */
    if (typeof self.store.ttl === 'function') {
        self.ttl = self.store.ttl.bind(self.store);
    }

    return self;
};

module.exports = caching;


/***/ }),

/***/ 971:
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = __webpack_require__(432);


/***/ }),

/***/ 992:
/***/ (function(module, __unusedexports, __webpack_require__) {

/** @module cacheManager/multiCaching */
var async = __webpack_require__(816);
var CallbackFiller = __webpack_require__(571);
var utils = __webpack_require__(167);
var isObject = utils.isObject;
var parseWrapArguments = utils.parseWrapArguments;

/**
 * Module that lets you specify a hierarchy of caches.
 *
 * @param {array} caches - Array of caching objects.
 * @param {object} [options]
 * @param {function} [options.isCacheableValue] - A callback function which is called
 *   with every value returned from cache or from a wrapped function. This lets you specify
 *   which values should and should not be cached. If the function returns true, it will be
 *   stored in cache. By default it caches everything except undefined.
 *
 *   If an underlying cache specifies its own isCacheableValue function, that function will
 *   be used instead of the multiCaching's _isCacheableValue function.
 */
var multiCaching = function(caches, options) {
    var self = {};
    options = options || {};

    var Promise = options.promiseDependency || global.Promise;

    if (!Array.isArray(caches)) {
        throw new Error('multiCaching requires an array of caches');
    }

    var callbackFiller = new CallbackFiller();

    if (typeof options.isCacheableValue === 'function') {
        self._isCacheableValue = options.isCacheableValue;
    } else {
        self._isCacheableValue = function(value) {
            return value !== undefined;
        };
    }

    /**
     * If the underlying cache specifies its own isCacheableValue function (such
     * as how node-cache-manager-redis does), use that function, otherwise use
     * self._isCacheableValue function.
     */
    function getIsCacheableValueFunction(cache) {
        if (cache.store && typeof cache.store.isCacheableValue === 'function') {
            return cache.store.isCacheableValue.bind(cache.store);
        } else {
            return self._isCacheableValue;
        }
    }

    function getFromHighestPriorityCachePromise() {
        var args = Array.prototype.slice.apply(arguments).filter(function(v) {
            return typeof v !== 'undefined';
        });

        return new Promise(function(resolve, reject) {
            var cb = function(err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            };
            args.push(cb);
            getFromHighestPriorityCache.apply(null, args);
        });
    }

    function getFromHighestPriorityCache() {
        var args = Array.prototype.slice.apply(arguments).filter(function(v) {
            return typeof v !== 'undefined';
        });
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (!cb) {
            return getFromHighestPriorityCachePromise.apply(this, args);
        }

        if (isObject(args[args.length - 1])) {
            options = args.pop();
        }

        /**
         * Keep a copy of the keys to retrieve
         */
        var keys = Array.prototype.slice.apply(args);
        var multi = keys.length > 1;

        /**
         * Then put back the options in the args Array
         */
        args.push(options);

        if (multi) {
            /**
             * Keep track of the keys left to fetch accross the caches
             */
            var keysToFetch = Array.prototype.slice.apply(keys);

            /**
             * Hash to save our multi keys result
             */
            var mapResult = {};
        }

        var i = 0;
        async.eachSeries(caches, function(cache, next) {
            var callback = function(err, result) {
                if (err) {
                    return next(err);
                }

                var _isCacheableValue = getIsCacheableValueFunction(cache);

                if (multi) {
                    addResultToMap(result, _isCacheableValue);

                    if (keysToFetch.length === 0 || i === caches.length - 1) {
                        // Return an Array with the values merged from all the caches
                        return cb(null, keys.map(function(k) {
                            return mapResult[k] || undefined;
                        }), i);
                    }
                } else if (_isCacheableValue(result)) {
                    // break out of async loop.
                    return cb(err, result, i);
                }

                i += 1;
                next();
            };

            if (multi) {
                if (typeof cache.store.mget !== 'function') {
                    /**
                     * Silently fail for store that don't support mget()
                     */
                    return callback(null, []);
                }
                var _args = Array.prototype.slice.apply(keysToFetch);
                _args.push(options);
                _args.push(callback);
                cache.store.mget.apply(cache.store, _args);
            } else {
                cache.store.get(args[0], options, callback);
            }
        }, function(err, result) {
            return cb(err, result);
        });

        function addResultToMap(result, isCacheable) {
            var key;
            var diff = 0;

            /**
             * We loop through the result and if the value
             * is cacheable we add it to the mapResult hash
             * and remove the key to fetch from the "keysToFetch" array
             */
            result.forEach(function(res, i) {
                if (isCacheable(res)) {
                    key = keysToFetch[i - diff];

                    // Add the result to our map
                    mapResult[key] = res;

                    // delete key from our keysToFetch array
                    keysToFetch.splice(i - diff, 1);
                    diff += 1;
                }
            });
        }
    }

    function setInMultipleCachesPromise() {
        var args = Array.prototype.slice.apply(arguments);

        return new Promise(function(resolve, reject) {
            var cb = function(err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            };
            args.push(cb);
            setInMultipleCaches.apply(null, args);
        });
    }

    function setInMultipleCaches() {
        var args = Array.prototype.slice.apply(arguments);
        var _caches = Array.isArray(args[0]) ? args.shift() : caches;

        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (!cb) {
            return setInMultipleCachesPromise.apply(this, args);
        }

        if (args.length % 2 > 0 && isObject(args[args.length - 1])) {
            options = args.pop();
        }

        var length = args.length;
        var multi = length > 2;
        var i;

        async.each(_caches, function(cache, next) {
            var _isCacheableValue = getIsCacheableValueFunction(cache);
            var keysValues = Array.prototype.slice.apply(args);

            /**
             * We filter out the keys *not* cacheable
             */
            for (i = 0; i < length; i += 2) {
                if (!_isCacheableValue(keysValues[i + 1])) {
                    keysValues.splice(i, 2);
                }
            }

            if (keysValues.length === 0) {
                return next();
            }

            var cacheOptions = options;
            if (typeof options.ttl === 'function') {
                /**
                 * Dynamically set the ttl by context depending of the store
                 */
                cacheOptions = {};
                cacheOptions.ttl = options.ttl(keysValues, cache.store.name);
            }

            if (multi) {
                if (typeof cache.store.mset !== 'function') {
                    /**
                     * Silently fail for store that don't support mset()
                     */
                    return next();
                }
                keysValues.push(cacheOptions);
                keysValues.push(next);

                cache.store.mset.apply(cache.store, keysValues);
            } else {
                cache.store.set(keysValues[0], keysValues[1], cacheOptions, next);
            }
        }, function(err, result) {
            cb(err, result);
        });
    }

    function getAndPassUpPromise(key) {
        return new Promise(function(resolve, reject) {
            self.getAndPassUp(key, function(err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    /**
     * Looks for an item in cache tiers.
     * When a key is found in a lower cache, all higher levels are updated.
     *
     * @param {string} key
     * @param {function} cb
     */
    self.getAndPassUp = function(key, cb) {
        if (!cb) {
            return getAndPassUpPromise(key);
        }

        getFromHighestPriorityCache(key, function(err, result, index) {
            if (err) {
                return cb(err);
            }

            if (index) {
                var cachesToUpdate = caches.slice(0, index);
                async.each(cachesToUpdate, function(cache, next) {
                    var _isCacheableValue = getIsCacheableValueFunction(cache);
                    if (_isCacheableValue(result)) {
                        // We rely on the cache module's default TTL
                        cache.set(key, result, next);
                    }
                });
            }

            return cb(err, result);
        });
    };

    function wrapPromise(key, promise, options) {
        return new Promise(function(resolve, reject) {
            self.wrap(key, function(cb) {
                Promise.resolve()
                .then(promise)
                .then(function(result) {
                    cb(null, result);
                })
                .catch(cb);
            }, options, function(err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    /**
     * Wraps a function in one or more caches.
     * Has same API as regular caching module.
     *
     * If a key doesn't exist in any cache, it gets set in all caches.
     * If a key exists in a high-priority (e.g., first) cache, it gets returned immediately
     * without getting set in other lower-priority caches.
     * If a key doesn't exist in a higher-priority cache but exists in a lower-priority
     * cache, it gets set in all higher-priority caches.
     * You can pass any number of keys as long as the wrapped function returns
     * an array with the same number of values and in the same order.
     *
     * @function
     * @name wrap
     *
     * @param {string} key - The cache key to use in cache operations. Can be one or many.
     * @param {function} work - The function to wrap
     * @param {object} [options] - options passed to `set` function
     * @param {function} cb
     */
    self.wrap = function() {
        var parsedArgs = parseWrapArguments(Array.prototype.slice.apply(arguments));
        var keys = parsedArgs.keys;
        var work = parsedArgs.work;
        var options = parsedArgs.options;
        var cb = parsedArgs.cb;

        if (!cb) {
            keys.push(work);
            keys.push(options);
            return wrapPromise.apply(this, keys);
        }

        if (keys.length > 1) {
            /**
             * Handle more than 1 key
             */
            return wrapMultiple(keys, work, options, cb);
        }

        var key = keys[0];

        var hasKey = callbackFiller.has(key);
        callbackFiller.add(key, {cb: cb});
        if (hasKey) { return; }

        getFromHighestPriorityCache(key, function(err, result, index) {
            if (err) {
                return callbackFiller.fill(key, err);
            } else if (self._isCacheableValue(result)) {
                var cachesToUpdate = caches.slice(0, index);
                var args = [cachesToUpdate, key, result, options, function(err) {
                    callbackFiller.fill(key, err, result);
                }];

                setInMultipleCaches.apply(null, args);
            } else {
                work(function(err, data) {
                    if (err) {
                        return callbackFiller.fill(key, err);
                    }

                    if (!self._isCacheableValue(data)) {
                        return callbackFiller.fill(key, err, data);
                    }

                    var args = [caches, key, data, options, function(err) {
                        callbackFiller.fill(key, err, data);
                    }];

                    setInMultipleCaches.apply(null, args);
                });
            }
        });
    };

    function wrapMultiple(keys, work, options, cb) {
        /**
         * We create a unique key for the multiple keys
         * by concatenating them
         */
        var combinedKey = keys.reduce(function(acc, k) {
            return acc + k;
        }, '');

        var hasKey = callbackFiller.has(combinedKey);
        callbackFiller.add(combinedKey, {cb: cb});
        if (hasKey) { return; }

        keys.push(options);
        keys.push(onResult);

        /**
         * Get from all the caches. If multiple keys have been passed,
         * we'll go through all the caches and merge the result
         */
        getFromHighestPriorityCache.apply(this, keys);

        function onResult(err, result, index) {
            if (err) {
                return done(err);
            }

            /**
             * If all the values returned are cacheable we don't need
             * to call our "work" method and the values returned by the cache
             * are valid. If one or more of the values is not cacheable
             * the cache result is not valid.
             */
            var cacheOK = result.filter(function(_result) {
                return self._isCacheableValue(_result);
            }).length === result.length;

            if (!cacheOK) {
                /**
                 * We need to fetch the data first
                 */
                return work(workCallback);
            }

            var cachesToUpdate = caches.slice(0, index);

            /**
             * Prepare arguments to set the values in
             * higher priority caches
             */
            var _args = [cachesToUpdate];

            /**
             * Add the {key, value} pair
             */
            result.forEach(function(value, i) {
                _args.push(keys[i]);
                _args.push(value);
            });

            /**
             * Add options and final callback
             */
            _args.push(options);
            _args.push(function(err) {
                done(err, result);
            });

            return setInMultipleCaches.apply(null, _args);

            /**
             * Wrapped function callback
             */
            function workCallback(err, data) {
                if (err) {
                    return done(err);
                }

                /**
                 * Prepare arguments for "setInMultipleCaches"
                 */
                var _args;

                _args = [];
                data.forEach(function(value, i) {
                    /**
                     * Add the {key, value} pair to the args
                     * array that we will send to mset()
                     */
                    if (self._isCacheableValue(value)) {
                        _args.push(keys[i]);
                        _args.push(value);
                    }
                });
                // If no key,value --> exit
                if (_args.length === 0) {
                    return done(null);
                }

                /**
                 * Add options and final callback
                 */
                _args.push(options);
                _args.push(function(err) {
                    done(err, data);
                });

                setInMultipleCaches.apply(null, _args);
            }

            /**
             * Final callback
             */
            function done(err, data) {
                callbackFiller.fill(combinedKey, err, data);
            }
        }
    }

    /**
     * Set value in all caches
     *
     * @function
     * @name set
     *
     * @param {string} key
     * @param {*} value
     * @param {object} [options] to pass to underlying set function.
     * @param {function} [cb]
     */
    self.set = setInMultipleCaches;

    /**
     * Set multiple values in all caches
     * Accepts an unlimited pair of {key, value}
     *
     * @function
     * @name mset
     *
     * @param {string} key
     * @param {*} value
     * @param {string} [key2]
     * @param {*} [value2]
     * @param {object} [options] to pass to underlying set function.
     * @param {function} [cb]
     */
    self.mset = setInMultipleCaches;

    /**
     * Get value from highest level cache that has stored it.
     *
     * @function
     * @name get
     *
     * @param {string} key
     * @param {object} [options] to pass to underlying get function.
     * @param {function} cb
     */
    self.get = getFromHighestPriorityCache;

    /**
     * Get multiple value from highest level cache that has stored it.
     * If some values are not found, the next highest cache is used
     * until either all keys are found or all caches have been fetched.
     * Accepts an unlimited number of keys.
     *
     * @function
     * @name mget
     *
     * @param {string} key key to get (any number)
     * @param {object} [options] to pass to underlying get function.
     * @param {function} cb optional callback
     */
    self.mget = getFromHighestPriorityCache;

    /**
     * Delete value from all caches.
     *
     * @function
     * @name del
     *
     * @param {string} key
     * @param {object} [options] to pass to underlying del function.
     * @param {function} cb
     */
    self.del = function() {
        var args = Array.prototype.slice.apply(arguments);
        var cb;
        var options = {};

        if (typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }

        if (isObject(args[args.length - 1])) {
            options = args.pop();
        }

        args.push(options);
        async.each(caches, function(cache, next) {
            var _args = Array.prototype.slice.apply(args);
            _args.push(next);
            cache.store.del.apply(cache.store, _args);
        }, cb);
    };

    /**
     * Reset all caches.
     *
     * @function
     * @name reset
     *
     * @param {function} cb
     */
    self.reset = function(cb) {
        async.each(caches, function(cache, next) {
            cache.store.reset(next);
        }, cb);
    };

    return self;
};

module.exports = multiCaching;


/***/ })

/******/ });