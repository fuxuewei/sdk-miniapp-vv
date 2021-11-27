(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.TezignTracer = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  /** 本地storage中user_id的存储key */
  var VISITOR_KEY = 'tz_tracer_visitor';
  /** url中将session作为查询符的正则 */

  var REG_SESSION = /_sn=\w{8}\.\w{6}\.\w{6}_/;
  /** 本地storage中session的存储key */

  var SESSION_KEY = '_sn';
  /** 微信小程序中获取当前url所加的前缀 */

  var WX_HOST = 'https://wx-mini-app/';
  /** 飞书小程序中获取当前url所加的前缀 */

  var TT_HOST = 'https://tt-mini-app/';
  var SESSION_TIMEOUT = 1800;
  var WX_SOURCE_FORM = 'weapp';
  var TT_SOURCE_FORM = 'tt'; // 埋点api

  var API_DEV = 'https://test-track-api.tezign.com/trackEvent';
  var API_PRD = 'https://track-api.tezign.com/trackEvent'; // 无侵入点击事件的自定义属性

  var CLICK_EVENT_ATTR = 'data-track-click'; // 无侵入点击事件的冒泡自定义属性

  var CLICK_EVENT_BUBBLE = 'data-track-bubble'; // 无侵入暴露事件的绑定DOM的id前缀

  var EXPOSURE_EVENT_ATTR = 'data-exposure-param';

  var EPlatform;

  (function (EPlatform) {
    EPlatform[EPlatform["web"] = 1] = "web";
    EPlatform[EPlatform["wx"] = 2] = "wx";
    EPlatform[EPlatform["tt"] = 3] = "tt";
  })(EPlatform || (EPlatform = {}));

  var browserInfo = function browserInfo() {
    var UserAgent = navigator.userAgent.toLowerCase();
    var browserInfo = {
      versions: 'unknown',
      type: 'unknown',
      userAgent: 'unknown'
    };
    var browserArray = {
      IE: window.ActiveXObject || 'ActiveXObject' in window,
      // IE
      Chrome: UserAgent.indexOf('chrome') > -1 && UserAgent.indexOf('safari') > -1,
      // Chrome浏览器
      Firefox: UserAgent.indexOf('firefox') > -1,
      // 火狐浏览器
      Opera: UserAgent.indexOf('opera') > -1,
      // Opera浏览器
      Safari: UserAgent.indexOf('safari') > -1 && UserAgent.indexOf('chrome') === -1,
      // safari浏览器
      Edge: UserAgent.indexOf('edge') > -1,
      // Edge浏览器
      QQBrowser: /qqbrowser/.test(UserAgent),
      // qq浏览器
      WeixinBrowser: /MicroMessenger/i.test(UserAgent) // 微信浏览器

    }; // console.log(browserArray)

    for (var k in browserArray) {
      if (browserArray[k]) {
        var versions = '';

        if (k === 'IE') {
          var _UserAgent$match;

          versions = ((_UserAgent$match = UserAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)) === null || _UserAgent$match === void 0 ? void 0 : _UserAgent$match[2]) || '';
        } else if (k === 'Chrome') {
          var _UserAgent$match2;

          for (var mt in navigator.mimeTypes) {
            // 检测是否是360浏览器(测试只有pc端的360才起作用)
            if (navigator.mimeTypes[mt].type === 'application/360softmgrplugin') {
              k = '360';
            }
          }

          versions = ((_UserAgent$match2 = UserAgent.match(/chrome\/([\d.]+)/)) === null || _UserAgent$match2 === void 0 ? void 0 : _UserAgent$match2[1]) || '';
        } else if (k === 'Firefox') {
          var _UserAgent$match3;

          versions = ((_UserAgent$match3 = UserAgent.match(/firefox\/([\d.]+)/)) === null || _UserAgent$match3 === void 0 ? void 0 : _UserAgent$match3[1]) || '';
        } else if (k === 'Opera') {
          var _UserAgent$match4;

          versions = ((_UserAgent$match4 = UserAgent.match(/opera\/([\d.]+)/)) === null || _UserAgent$match4 === void 0 ? void 0 : _UserAgent$match4[1]) || '';
        } else if (k === 'Safari') {
          var _UserAgent$match5;

          versions = ((_UserAgent$match5 = UserAgent.match(/version\/([\d.]+)/)) === null || _UserAgent$match5 === void 0 ? void 0 : _UserAgent$match5[1]) || '';
        } else if (k === 'Edge') {
          var _UserAgent$match6;

          versions = ((_UserAgent$match6 = UserAgent.match(/edge\/([\d.]+)/)) === null || _UserAgent$match6 === void 0 ? void 0 : _UserAgent$match6[1]) || '';
        } else if (k === 'QQBrowser') {
          var _UserAgent$match7;

          versions = ((_UserAgent$match7 = UserAgent.match(/qqbrowser\/([\d.]+)/)) === null || _UserAgent$match7 === void 0 ? void 0 : _UserAgent$match7[1]) || '';
        }

        browserInfo.type = k;
        browserInfo.versions = versions;
        browserInfo.userAgent = UserAgent;
      }
    }

    return browserInfo;
  };

  function osInfo() {
    var userAgentStr = navigator.userAgent;
    var isMobile = /(iPhone|Android|Windows Phone)/i.test(navigator.userAgent);
    var deviceReg = {
      iPhone: /iPhone/,
      iPad: /iPad/,
      Android: /Android/,
      Windows: /Windows/,
      Mac: /Macintosh/
    };
    var name = '';
    var version = '';

    for (var _key in deviceReg) {
      if (deviceReg[_key].test(userAgentStr)) {
        name = _key;

        if (_key === 'Windows') {
          version = userAgentStr.split('Windows NT ')[1].split(';')[0];
        } else if (_key === 'Mac') {
          version = userAgentStr.split('Mac OS X ')[1].split(')')[0];
        } else if (_key === 'iPhone') {
          version = userAgentStr.split('iPhone OS ')[1].split(' ')[0];
        } else if (_key === 'iPad') {
          version = userAgentStr.split('iPad; CPU OS ')[1].split(' ')[0];
        } else if (_key === 'Android') {
          version = userAgentStr.split('Android ')[1].split(';')[0];
        }
      }
    }

    return {
      name: name,
      version: version,
      isMobile: isMobile
    };
  }

  var words = '0123456789abcdefhijklmnopqrstuvwxyz';
  var L = words.length;

  var createUUID = function createUUID() {
    var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
    var result = '';

    while (length--) {
      result += words[Math.floor(Math.random() * L)];
    }

    return result;
  };

  // export function initSession(timeout: number) {
  //   const url = window.location.href;
  //   const match = url.match(reg_session);
  //   if (!match) return create();
  //   const str = match[0];
  //   return refreshSession(str.substring(4), timeout);
  // }
  // export function refreshSession(session: string, timeout: number) {
  //   const idx = session.lastIndexOf('.');
  //   const _pt = str2int(session.substr(idx + 1, 6));
  //   if (Math.round(Date.now() / 1000) - _pt > timeout) {
  //     return create();
  //   } else {
  //     return session.substring(0, idx) + '.' + getNowStr();
  //   }
  // }

  /** /\w{8}\.\w{6}\.\w{6}/格式的字符串 */

  function create() {
    return "".concat(createUUID(8), ".").concat(getNowStr(), ".").concat(getNowStr());
  }
  /** 当前时间戳生成的字符串，6位 */

  function getNowStr() {
    return int2str(Math.floor(Date.now() / 1000));
  }
  /** 整数数字转换成字符串 */

  function int2str(number) {
    return number.toString(36);
  }
  /** 字符串转换成纯整数数字 */

  function str2int(str) {
    return parseInt(str, 36);
  }

  var ClickEvent = /*#__PURE__*/function () {
    function ClickEvent() {
      _classCallCheck(this, ClickEvent);
    }

    _createClass(ClickEvent, null, [{
      key: "createEventHandler",
      value: function createEventHandler(callback) {
        return function (e) {
          var target = e.target;

          while (target && target !== document) {
            var getAttribute = target.getAttribute.bind(target);
            var info = getAttribute(CLICK_EVENT_ATTR);

            if (info) {
              try {
                info = JSON.parse(info); // console.log('info', info);
                // track(info);

                callback(info);
              } catch (e) {} // 如果设置了 data-track-bubble = true 则继续向上递归寻找 data-track
              // 没有设置，则中止


              if (getAttribute(CLICK_EVENT_BUBBLE) !== 'true') break;
            }

            target = target.parentNode; // 如果父节点为空则跳出

            if (!target) break;
          }
        };
      }
    }, {
      key: "bindEvent",
      value: function bindEvent(callback) {
        if (ClickEvent.eventhandler) {
          return;
        }

        ClickEvent.eventhandler = ClickEvent.createEventHandler(callback); // document.addEventListener('click', this.handler.bind(this));
        // gua = this.track;

        document.addEventListener('click', ClickEvent.eventhandler);
      }
    }, {
      key: "removeEvent",
      value: function removeEvent() {
        // console.log('remove', this.track === gua);
        // document.removeEventListener('click', this.handler.bind(this));
        if (!ClickEvent.eventhandler) {
          return;
        }

        document.removeEventListener('click', ClickEvent.eventhandler);
        ClickEvent.eventhandler = undefined;
      }
    }]);

    return ClickEvent;
  }();

  /**
   * Copyright 2016 Google Inc. All Rights Reserved.
   *
   * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
   *
   *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
   *
   */
  (function() {

  // Exit early if we're not running in a browser.
  if (typeof window !== 'object') {
    return;
  }

  // Exit early if all IntersectionObserver and IntersectionObserverEntry
  // features are natively supported.
  if ('IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

    // Minimal polyfill for Edge 15's lack of `isIntersecting`
    // See: https://github.com/w3c/IntersectionObserver/issues/211
    if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype,
        'isIntersecting', {
        get: function () {
          return this.intersectionRatio > 0;
        }
      });
    }
    return;
  }

  /**
   * Returns the embedding frame element, if any.
   * @param {!Document} doc
   * @return {!Element}
   */
  function getFrameElement(doc) {
    try {
      return doc.defaultView && doc.defaultView.frameElement || null;
    } catch (e) {
      // Ignore the error.
      return null;
    }
  }

  /**
   * A local reference to the root document.
   */
  var document = (function(startDoc) {
    var doc = startDoc;
    var frame = getFrameElement(doc);
    while (frame) {
      doc = frame.ownerDocument;
      frame = getFrameElement(doc);
    }
    return doc;
  })(window.document);

  /**
   * An IntersectionObserver registry. This registry exists to hold a strong
   * reference to IntersectionObserver instances currently observing a target
   * element. Without this registry, instances without another reference may be
   * garbage collected.
   */
  var registry = [];

  /**
   * The signal updater for cross-origin intersection. When not null, it means
   * that the polyfill is configured to work in a cross-origin mode.
   * @type {function(DOMRect|ClientRect, DOMRect|ClientRect)}
   */
  var crossOriginUpdater = null;

  /**
   * The current cross-origin intersection. Only used in the cross-origin mode.
   * @type {DOMRect|ClientRect}
   */
  var crossOriginRect = null;


  /**
   * Creates the global IntersectionObserverEntry constructor.
   * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
   * @param {Object} entry A dictionary of instance properties.
   * @constructor
   */
  function IntersectionObserverEntry(entry) {
    this.time = entry.time;
    this.target = entry.target;
    this.rootBounds = ensureDOMRect(entry.rootBounds);
    this.boundingClientRect = ensureDOMRect(entry.boundingClientRect);
    this.intersectionRect = ensureDOMRect(entry.intersectionRect || getEmptyRect());
    this.isIntersecting = !!entry.intersectionRect;

    // Calculates the intersection ratio.
    var targetRect = this.boundingClientRect;
    var targetArea = targetRect.width * targetRect.height;
    var intersectionRect = this.intersectionRect;
    var intersectionArea = intersectionRect.width * intersectionRect.height;

    // Sets intersection ratio.
    if (targetArea) {
      // Round the intersection ratio to avoid floating point math issues:
      // https://github.com/w3c/IntersectionObserver/issues/324
      this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
    } else {
      // If area is zero and is intersecting, sets to 1, otherwise to 0
      this.intersectionRatio = this.isIntersecting ? 1 : 0;
    }
  }


  /**
   * Creates the global IntersectionObserver constructor.
   * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
   * @param {Function} callback The function to be invoked after intersection
   *     changes have queued. The function is not invoked if the queue has
   *     been emptied by calling the `takeRecords` method.
   * @param {Object=} opt_options Optional configuration options.
   * @constructor
   */
  function IntersectionObserver(callback, opt_options) {

    var options = opt_options || {};

    if (typeof callback != 'function') {
      throw new Error('callback must be a function');
    }

    if (
      options.root &&
      options.root.nodeType != 1 &&
      options.root.nodeType != 9
    ) {
      throw new Error('root must be a Document or Element');
    }

    // Binds and throttles `this._checkForIntersections`.
    this._checkForIntersections = throttle(
        this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

    // Private properties.
    this._callback = callback;
    this._observationTargets = [];
    this._queuedEntries = [];
    this._rootMarginValues = this._parseRootMargin(options.rootMargin);

    // Public properties.
    this.thresholds = this._initThresholds(options.threshold);
    this.root = options.root || null;
    this.rootMargin = this._rootMarginValues.map(function(margin) {
      return margin.value + margin.unit;
    }).join(' ');

    /** @private @const {!Array<!Document>} */
    this._monitoringDocuments = [];
    /** @private @const {!Array<function()>} */
    this._monitoringUnsubscribes = [];
  }


  /**
   * The minimum interval within which the document will be checked for
   * intersection changes.
   */
  IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


  /**
   * The frequency in which the polyfill polls for intersection changes.
   * this can be updated on a per instance basis and must be set prior to
   * calling `observe` on the first target.
   */
  IntersectionObserver.prototype.POLL_INTERVAL = null;

  /**
   * Use a mutation observer on the root element
   * to detect intersection changes.
   */
  IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


  /**
   * Sets up the polyfill in the cross-origin mode. The result is the
   * updater function that accepts two arguments: `boundingClientRect` and
   * `intersectionRect` - just as these fields would be available to the
   * parent via `IntersectionObserverEntry`. This function should be called
   * each time the iframe receives intersection information from the parent
   * window, e.g. via messaging.
   * @return {function(DOMRect|ClientRect, DOMRect|ClientRect)}
   */
  IntersectionObserver._setupCrossOriginUpdater = function() {
    if (!crossOriginUpdater) {
      /**
       * @param {DOMRect|ClientRect} boundingClientRect
       * @param {DOMRect|ClientRect} intersectionRect
       */
      crossOriginUpdater = function(boundingClientRect, intersectionRect) {
        if (!boundingClientRect || !intersectionRect) {
          crossOriginRect = getEmptyRect();
        } else {
          crossOriginRect = convertFromParentRect(boundingClientRect, intersectionRect);
        }
        registry.forEach(function(observer) {
          observer._checkForIntersections();
        });
      };
    }
    return crossOriginUpdater;
  };


  /**
   * Resets the cross-origin mode.
   */
  IntersectionObserver._resetCrossOriginUpdater = function() {
    crossOriginUpdater = null;
    crossOriginRect = null;
  };


  /**
   * Starts observing a target element for intersection changes based on
   * the thresholds values.
   * @param {Element} target The DOM element to observe.
   */
  IntersectionObserver.prototype.observe = function(target) {
    var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
      return item.element == target;
    });

    if (isTargetAlreadyObserved) {
      return;
    }

    if (!(target && target.nodeType == 1)) {
      throw new Error('target must be an Element');
    }

    this._registerInstance();
    this._observationTargets.push({element: target, entry: null});
    this._monitorIntersections(target.ownerDocument);
    this._checkForIntersections();
  };


  /**
   * Stops observing a target element for intersection changes.
   * @param {Element} target The DOM element to observe.
   */
  IntersectionObserver.prototype.unobserve = function(target) {
    this._observationTargets =
        this._observationTargets.filter(function(item) {
          return item.element != target;
        });
    this._unmonitorIntersections(target.ownerDocument);
    if (this._observationTargets.length == 0) {
      this._unregisterInstance();
    }
  };


  /**
   * Stops observing all target elements for intersection changes.
   */
  IntersectionObserver.prototype.disconnect = function() {
    this._observationTargets = [];
    this._unmonitorAllIntersections();
    this._unregisterInstance();
  };


  /**
   * Returns any queue entries that have not yet been reported to the
   * callback and clears the queue. This can be used in conjunction with the
   * callback to obtain the absolute most up-to-date intersection information.
   * @return {Array} The currently queued entries.
   */
  IntersectionObserver.prototype.takeRecords = function() {
    var records = this._queuedEntries.slice();
    this._queuedEntries = [];
    return records;
  };


  /**
   * Accepts the threshold value from the user configuration object and
   * returns a sorted array of unique threshold values. If a value is not
   * between 0 and 1 and error is thrown.
   * @private
   * @param {Array|number=} opt_threshold An optional threshold value or
   *     a list of threshold values, defaulting to [0].
   * @return {Array} A sorted list of unique and valid threshold values.
   */
  IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
    var threshold = opt_threshold || [0];
    if (!Array.isArray(threshold)) threshold = [threshold];

    return threshold.sort().filter(function(t, i, a) {
      if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
        throw new Error('threshold must be a number between 0 and 1 inclusively');
      }
      return t !== a[i - 1];
    });
  };


  /**
   * Accepts the rootMargin value from the user configuration object
   * and returns an array of the four margin values as an object containing
   * the value and unit properties. If any of the values are not properly
   * formatted or use a unit other than px or %, and error is thrown.
   * @private
   * @param {string=} opt_rootMargin An optional rootMargin value,
   *     defaulting to '0px'.
   * @return {Array<Object>} An array of margin objects with the keys
   *     value and unit.
   */
  IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
    var marginString = opt_rootMargin || '0px';
    var margins = marginString.split(/\s+/).map(function(margin) {
      var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
      if (!parts) {
        throw new Error('rootMargin must be specified in pixels or percent');
      }
      return {value: parseFloat(parts[1]), unit: parts[2]};
    });

    // Handles shorthand.
    margins[1] = margins[1] || margins[0];
    margins[2] = margins[2] || margins[0];
    margins[3] = margins[3] || margins[1];

    return margins;
  };


  /**
   * Starts polling for intersection changes if the polling is not already
   * happening, and if the page's visibility state is visible.
   * @param {!Document} doc
   * @private
   */
  IntersectionObserver.prototype._monitorIntersections = function(doc) {
    var win = doc.defaultView;
    if (!win) {
      // Already destroyed.
      return;
    }
    if (this._monitoringDocuments.indexOf(doc) != -1) {
      // Already monitoring.
      return;
    }

    // Private state for monitoring.
    var callback = this._checkForIntersections;
    var monitoringInterval = null;
    var domObserver = null;

    // If a poll interval is set, use polling instead of listening to
    // resize and scroll events or DOM mutations.
    if (this.POLL_INTERVAL) {
      monitoringInterval = win.setInterval(callback, this.POLL_INTERVAL);
    } else {
      addEvent(win, 'resize', callback, true);
      addEvent(doc, 'scroll', callback, true);
      if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in win) {
        domObserver = new win.MutationObserver(callback);
        domObserver.observe(doc, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    }

    this._monitoringDocuments.push(doc);
    this._monitoringUnsubscribes.push(function() {
      // Get the window object again. When a friendly iframe is destroyed, it
      // will be null.
      var win = doc.defaultView;

      if (win) {
        if (monitoringInterval) {
          win.clearInterval(monitoringInterval);
        }
        removeEvent(win, 'resize', callback, true);
      }

      removeEvent(doc, 'scroll', callback, true);
      if (domObserver) {
        domObserver.disconnect();
      }
    });

    // Also monitor the parent.
    var rootDoc =
      (this.root && (this.root.ownerDocument || this.root)) || document;
    if (doc != rootDoc) {
      var frame = getFrameElement(doc);
      if (frame) {
        this._monitorIntersections(frame.ownerDocument);
      }
    }
  };


  /**
   * Stops polling for intersection changes.
   * @param {!Document} doc
   * @private
   */
  IntersectionObserver.prototype._unmonitorIntersections = function(doc) {
    var index = this._monitoringDocuments.indexOf(doc);
    if (index == -1) {
      return;
    }

    var rootDoc =
      (this.root && (this.root.ownerDocument || this.root)) || document;

    // Check if any dependent targets are still remaining.
    var hasDependentTargets =
        this._observationTargets.some(function(item) {
          var itemDoc = item.element.ownerDocument;
          // Target is in this context.
          if (itemDoc == doc) {
            return true;
          }
          // Target is nested in this context.
          while (itemDoc && itemDoc != rootDoc) {
            var frame = getFrameElement(itemDoc);
            itemDoc = frame && frame.ownerDocument;
            if (itemDoc == doc) {
              return true;
            }
          }
          return false;
        });
    if (hasDependentTargets) {
      return;
    }

    // Unsubscribe.
    var unsubscribe = this._monitoringUnsubscribes[index];
    this._monitoringDocuments.splice(index, 1);
    this._monitoringUnsubscribes.splice(index, 1);
    unsubscribe();

    // Also unmonitor the parent.
    if (doc != rootDoc) {
      var frame = getFrameElement(doc);
      if (frame) {
        this._unmonitorIntersections(frame.ownerDocument);
      }
    }
  };


  /**
   * Stops polling for intersection changes.
   * @param {!Document} doc
   * @private
   */
  IntersectionObserver.prototype._unmonitorAllIntersections = function() {
    var unsubscribes = this._monitoringUnsubscribes.slice(0);
    this._monitoringDocuments.length = 0;
    this._monitoringUnsubscribes.length = 0;
    for (var i = 0; i < unsubscribes.length; i++) {
      unsubscribes[i]();
    }
  };


  /**
   * Scans each observation target for intersection changes and adds them
   * to the internal entries queue. If new entries are found, it
   * schedules the callback to be invoked.
   * @private
   */
  IntersectionObserver.prototype._checkForIntersections = function() {
    if (!this.root && crossOriginUpdater && !crossOriginRect) {
      // Cross origin monitoring, but no initial data available yet.
      return;
    }

    var rootIsInDom = this._rootIsInDom();
    var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

    this._observationTargets.forEach(function(item) {
      var target = item.element;
      var targetRect = getBoundingClientRect(target);
      var rootContainsTarget = this._rootContainsTarget(target);
      var oldEntry = item.entry;
      var intersectionRect = rootIsInDom && rootContainsTarget &&
          this._computeTargetAndRootIntersection(target, targetRect, rootRect);

      var rootBounds = null;
      if (!this._rootContainsTarget(target)) {
        rootBounds = getEmptyRect();
      } else if (!crossOriginUpdater || this.root) {
        rootBounds = rootRect;
      }

      var newEntry = item.entry = new IntersectionObserverEntry({
        time: now(),
        target: target,
        boundingClientRect: targetRect,
        rootBounds: rootBounds,
        intersectionRect: intersectionRect
      });

      if (!oldEntry) {
        this._queuedEntries.push(newEntry);
      } else if (rootIsInDom && rootContainsTarget) {
        // If the new entry intersection ratio has crossed any of the
        // thresholds, add a new entry.
        if (this._hasCrossedThreshold(oldEntry, newEntry)) {
          this._queuedEntries.push(newEntry);
        }
      } else {
        // If the root is not in the DOM or target is not contained within
        // root but the previous entry for this target had an intersection,
        // add a new record indicating removal.
        if (oldEntry && oldEntry.isIntersecting) {
          this._queuedEntries.push(newEntry);
        }
      }
    }, this);

    if (this._queuedEntries.length) {
      this._callback(this.takeRecords(), this);
    }
  };


  /**
   * Accepts a target and root rect computes the intersection between then
   * following the algorithm in the spec.
   * TODO(philipwalton): at this time clip-path is not considered.
   * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
   * @param {Element} target The target DOM element
   * @param {Object} targetRect The bounding rect of the target.
   * @param {Object} rootRect The bounding rect of the root after being
   *     expanded by the rootMargin value.
   * @return {?Object} The final intersection rect object or undefined if no
   *     intersection is found.
   * @private
   */
  IntersectionObserver.prototype._computeTargetAndRootIntersection =
      function(target, targetRect, rootRect) {
    // If the element isn't displayed, an intersection can't happen.
    if (window.getComputedStyle(target).display == 'none') return;

    var intersectionRect = targetRect;
    var parent = getParentNode(target);
    var atRoot = false;

    while (!atRoot && parent) {
      var parentRect = null;
      var parentComputedStyle = parent.nodeType == 1 ?
          window.getComputedStyle(parent) : {};

      // If the parent isn't displayed, an intersection can't happen.
      if (parentComputedStyle.display == 'none') return null;

      if (parent == this.root || parent.nodeType == /* DOCUMENT */ 9) {
        atRoot = true;
        if (parent == this.root || parent == document) {
          if (crossOriginUpdater && !this.root) {
            if (!crossOriginRect ||
                crossOriginRect.width == 0 && crossOriginRect.height == 0) {
              // A 0-size cross-origin intersection means no-intersection.
              parent = null;
              parentRect = null;
              intersectionRect = null;
            } else {
              parentRect = crossOriginRect;
            }
          } else {
            parentRect = rootRect;
          }
        } else {
          // Check if there's a frame that can be navigated to.
          var frame = getParentNode(parent);
          var frameRect = frame && getBoundingClientRect(frame);
          var frameIntersect =
              frame &&
              this._computeTargetAndRootIntersection(frame, frameRect, rootRect);
          if (frameRect && frameIntersect) {
            parent = frame;
            parentRect = convertFromParentRect(frameRect, frameIntersect);
          } else {
            parent = null;
            intersectionRect = null;
          }
        }
      } else {
        // If the element has a non-visible overflow, and it's not the <body>
        // or <html> element, update the intersection rect.
        // Note: <body> and <html> cannot be clipped to a rect that's not also
        // the document rect, so no need to compute a new intersection.
        var doc = parent.ownerDocument;
        if (parent != doc.body &&
            parent != doc.documentElement &&
            parentComputedStyle.overflow != 'visible') {
          parentRect = getBoundingClientRect(parent);
        }
      }

      // If either of the above conditionals set a new parentRect,
      // calculate new intersection data.
      if (parentRect) {
        intersectionRect = computeRectIntersection(parentRect, intersectionRect);
      }
      if (!intersectionRect) break;
      parent = parent && getParentNode(parent);
    }
    return intersectionRect;
  };


  /**
   * Returns the root rect after being expanded by the rootMargin value.
   * @return {ClientRect} The expanded root rect.
   * @private
   */
  IntersectionObserver.prototype._getRootRect = function() {
    var rootRect;
    if (this.root && !isDoc(this.root)) {
      rootRect = getBoundingClientRect(this.root);
    } else {
      // Use <html>/<body> instead of window since scroll bars affect size.
      var doc = isDoc(this.root) ? this.root : document;
      var html = doc.documentElement;
      var body = doc.body;
      rootRect = {
        top: 0,
        left: 0,
        right: html.clientWidth || body.clientWidth,
        width: html.clientWidth || body.clientWidth,
        bottom: html.clientHeight || body.clientHeight,
        height: html.clientHeight || body.clientHeight
      };
    }
    return this._expandRectByRootMargin(rootRect);
  };


  /**
   * Accepts a rect and expands it by the rootMargin value.
   * @param {DOMRect|ClientRect} rect The rect object to expand.
   * @return {ClientRect} The expanded rect.
   * @private
   */
  IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
    var margins = this._rootMarginValues.map(function(margin, i) {
      return margin.unit == 'px' ? margin.value :
          margin.value * (i % 2 ? rect.width : rect.height) / 100;
    });
    var newRect = {
      top: rect.top - margins[0],
      right: rect.right + margins[1],
      bottom: rect.bottom + margins[2],
      left: rect.left - margins[3]
    };
    newRect.width = newRect.right - newRect.left;
    newRect.height = newRect.bottom - newRect.top;

    return newRect;
  };


  /**
   * Accepts an old and new entry and returns true if at least one of the
   * threshold values has been crossed.
   * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
   *    particular target element or null if no previous entry exists.
   * @param {IntersectionObserverEntry} newEntry The current entry for a
   *    particular target element.
   * @return {boolean} Returns true if a any threshold has been crossed.
   * @private
   */
  IntersectionObserver.prototype._hasCrossedThreshold =
      function(oldEntry, newEntry) {

    // To make comparing easier, an entry that has a ratio of 0
    // but does not actually intersect is given a value of -1
    var oldRatio = oldEntry && oldEntry.isIntersecting ?
        oldEntry.intersectionRatio || 0 : -1;
    var newRatio = newEntry.isIntersecting ?
        newEntry.intersectionRatio || 0 : -1;

    // Ignore unchanged ratios
    if (oldRatio === newRatio) return;

    for (var i = 0; i < this.thresholds.length; i++) {
      var threshold = this.thresholds[i];

      // Return true if an entry matches a threshold or if the new ratio
      // and the old ratio are on the opposite sides of a threshold.
      if (threshold == oldRatio || threshold == newRatio ||
          threshold < oldRatio !== threshold < newRatio) {
        return true;
      }
    }
  };


  /**
   * Returns whether or not the root element is an element and is in the DOM.
   * @return {boolean} True if the root element is an element and is in the DOM.
   * @private
   */
  IntersectionObserver.prototype._rootIsInDom = function() {
    return !this.root || containsDeep(document, this.root);
  };


  /**
   * Returns whether or not the target element is a child of root.
   * @param {Element} target The target element to check.
   * @return {boolean} True if the target element is a child of root.
   * @private
   */
  IntersectionObserver.prototype._rootContainsTarget = function(target) {
    var rootDoc =
      (this.root && (this.root.ownerDocument || this.root)) || document;
    return (
      containsDeep(rootDoc, target) &&
      (!this.root || rootDoc == target.ownerDocument)
    );
  };


  /**
   * Adds the instance to the global IntersectionObserver registry if it isn't
   * already present.
   * @private
   */
  IntersectionObserver.prototype._registerInstance = function() {
    if (registry.indexOf(this) < 0) {
      registry.push(this);
    }
  };


  /**
   * Removes the instance from the global IntersectionObserver registry.
   * @private
   */
  IntersectionObserver.prototype._unregisterInstance = function() {
    var index = registry.indexOf(this);
    if (index != -1) registry.splice(index, 1);
  };


  /**
   * Returns the result of the performance.now() method or null in browsers
   * that don't support the API.
   * @return {number} The elapsed time since the page was requested.
   */
  function now() {
    return window.performance && performance.now && performance.now();
  }


  /**
   * Throttles a function and delays its execution, so it's only called at most
   * once within a given time period.
   * @param {Function} fn The function to throttle.
   * @param {number} timeout The amount of time that must pass before the
   *     function can be called again.
   * @return {Function} The throttled function.
   */
  function throttle(fn, timeout) {
    var timer = null;
    return function () {
      if (!timer) {
        timer = setTimeout(function() {
          fn();
          timer = null;
        }, timeout);
      }
    };
  }


  /**
   * Adds an event handler to a DOM node ensuring cross-browser compatibility.
   * @param {Node} node The DOM node to add the event handler to.
   * @param {string} event The event name.
   * @param {Function} fn The event handler to add.
   * @param {boolean} opt_useCapture Optionally adds the even to the capture
   *     phase. Note: this only works in modern browsers.
   */
  function addEvent(node, event, fn, opt_useCapture) {
    if (typeof node.addEventListener == 'function') {
      node.addEventListener(event, fn, opt_useCapture || false);
    }
    else if (typeof node.attachEvent == 'function') {
      node.attachEvent('on' + event, fn);
    }
  }


  /**
   * Removes a previously added event handler from a DOM node.
   * @param {Node} node The DOM node to remove the event handler from.
   * @param {string} event The event name.
   * @param {Function} fn The event handler to remove.
   * @param {boolean} opt_useCapture If the event handler was added with this
   *     flag set to true, it should be set to true here in order to remove it.
   */
  function removeEvent(node, event, fn, opt_useCapture) {
    if (typeof node.removeEventListener == 'function') {
      node.removeEventListener(event, fn, opt_useCapture || false);
    }
    else if (typeof node.detatchEvent == 'function') {
      node.detatchEvent('on' + event, fn);
    }
  }


  /**
   * Returns the intersection between two rect objects.
   * @param {Object} rect1 The first rect.
   * @param {Object} rect2 The second rect.
   * @return {?Object|?ClientRect} The intersection rect or undefined if no
   *     intersection is found.
   */
  function computeRectIntersection(rect1, rect2) {
    var top = Math.max(rect1.top, rect2.top);
    var bottom = Math.min(rect1.bottom, rect2.bottom);
    var left = Math.max(rect1.left, rect2.left);
    var right = Math.min(rect1.right, rect2.right);
    var width = right - left;
    var height = bottom - top;

    return (width >= 0 && height >= 0) && {
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      width: width,
      height: height
    } || null;
  }


  /**
   * Shims the native getBoundingClientRect for compatibility with older IE.
   * @param {Element} el The element whose bounding rect to get.
   * @return {DOMRect|ClientRect} The (possibly shimmed) rect of the element.
   */
  function getBoundingClientRect(el) {
    var rect;

    try {
      rect = el.getBoundingClientRect();
    } catch (err) {
      // Ignore Windows 7 IE11 "Unspecified error"
      // https://github.com/w3c/IntersectionObserver/pull/205
    }

    if (!rect) return getEmptyRect();

    // Older IE
    if (!(rect.width && rect.height)) {
      rect = {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
    }
    return rect;
  }


  /**
   * Returns an empty rect object. An empty rect is returned when an element
   * is not in the DOM.
   * @return {ClientRect} The empty rect.
   */
  function getEmptyRect() {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0
    };
  }


  /**
   * Ensure that the result has all of the necessary fields of the DOMRect.
   * Specifically this ensures that `x` and `y` fields are set.
   *
   * @param {?DOMRect|?ClientRect} rect
   * @return {?DOMRect}
   */
  function ensureDOMRect(rect) {
    // A `DOMRect` object has `x` and `y` fields.
    if (!rect || 'x' in rect) {
      return rect;
    }
    // A IE's `ClientRect` type does not have `x` and `y`. The same is the case
    // for internally calculated Rect objects. For the purposes of
    // `IntersectionObserver`, it's sufficient to simply mirror `left` and `top`
    // for these fields.
    return {
      top: rect.top,
      y: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      x: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height
    };
  }


  /**
   * Inverts the intersection and bounding rect from the parent (frame) BCR to
   * the local BCR space.
   * @param {DOMRect|ClientRect} parentBoundingRect The parent's bound client rect.
   * @param {DOMRect|ClientRect} parentIntersectionRect The parent's own intersection rect.
   * @return {ClientRect} The local root bounding rect for the parent's children.
   */
  function convertFromParentRect(parentBoundingRect, parentIntersectionRect) {
    var top = parentIntersectionRect.top - parentBoundingRect.top;
    var left = parentIntersectionRect.left - parentBoundingRect.left;
    return {
      top: top,
      left: left,
      height: parentIntersectionRect.height,
      width: parentIntersectionRect.width,
      bottom: top + parentIntersectionRect.height,
      right: left + parentIntersectionRect.width
    };
  }


  /**
   * Checks to see if a parent element contains a child element (including inside
   * shadow DOM).
   * @param {Node} parent The parent element.
   * @param {Node} child The child element.
   * @return {boolean} True if the parent node contains the child node.
   */
  function containsDeep(parent, child) {
    var node = child;
    while (node) {
      if (node == parent) return true;

      node = getParentNode(node);
    }
    return false;
  }


  /**
   * Gets the parent node of an element or its host element if the parent node
   * is a shadow root.
   * @param {Node} node The node whose parent to get.
   * @return {Node|null} The parent node or null if no parent exists.
   */
  function getParentNode(node) {
    var parent = node.parentNode;

    if (node.nodeType == /* DOCUMENT */ 9 && node != document) {
      // If this node is a document node, look for the embedding frame.
      return getFrameElement(node);
    }

    // If the parent has element that is assigned through shadow root slot
    if (parent && parent.assignedSlot) {
      parent = parent.assignedSlot.parentNode;
    }

    if (parent && parent.nodeType == 11 && parent.host) {
      // If the parent is a shadow root, return the host element.
      return parent.host;
    }

    return parent;
  }

  /**
   * Returns true if `node` is a Document.
   * @param {!Node} node
   * @returns {boolean}
   */
  function isDoc(node) {
    return node && node.nodeType === 9;
  }


  // Exposes the constructors globally.
  window.IntersectionObserver = IntersectionObserver;
  window.IntersectionObserverEntry = IntersectionObserverEntry;

  }());

  // 获取特定格式的日期时间  "yyyy-MM-dd HH:MMM:SS"
  function getNowDate() {
    var date = new Date();
    var transverse = '-';
    var verticalpoint = ':';
    var point = '.';
    var month = date.getMonth() + 1; // 获取月份

    var strDate = date.getDate(); // 获取具体的日期

    var strHour = date.getHours(); // 获取...钟点

    var strMinute = date.getMinutes(); // 获取分钟数

    var strSeconde = date.getSeconds(); // 获取秒钟数

    var strMilliSeconde = date.getMilliseconds(); // 获取毫秒数
    // 判断获取月份 、 具体的日期 、...钟点、分钟数、秒钟数 是否在1~9
    // 如果是则在前面加“0”

    if (month >= 1 && month <= 9) {
      month = '0' + month;
    }

    if (strDate >= 1 && strDate <= 9) {
      strDate = '0' + strDate;
    }

    if (strHour >= 0 && strHour <= 9) {
      strHour = '0' + strHour;
    }

    if (strMinute >= 0 && strMinute <= 9) {
      strMinute = '0' + strMinute;
    }

    if (strSeconde >= 0 && strSeconde <= 9) {
      strSeconde = '0' + strSeconde;
    }

    if (strMilliSeconde >= 1 && strMilliSeconde < 100) {
      strMilliSeconde = (Array(3).join('0') + strMilliSeconde).slice(-3);
    } // 时间日期字符串拼接


    var NewDate = date.getFullYear() + transverse + month + transverse + strDate + ' ' + strHour + verticalpoint + strMinute + verticalpoint + strSeconde + point + strMilliSeconde; // 返回拼接字符串

    return NewDate;
  }

  var Exposure = /*#__PURE__*/function () {
    function Exposure(options) {
      _classCallCheck(this, Exposure);

      _defineProperty(this, "dataList", []);

      _defineProperty(this, "dataAllList", []);

      _defineProperty(this, "trackEvent", {});

      _defineProperty(this, "maxNum", 20);

      _defineProperty(this, "time", 2000);

      _defineProperty(this, "timer", 0);

      _defineProperty(this, "container", '#scrollExposureContainer');

      _defineProperty(this, "observer", undefined);

      var container = options.container,
          maxNum = options.maxNum,
          time = options.time;

      if (container) {
        this.container = container;
      }

      if (maxNum) {
        this.maxNum = maxNum;
      }

      if (time) {
        this.time = time;
      }
    }

    _createClass(Exposure, [{
      key: "bindEvent",
      value: function bindEvent(callback) {
        var self = this;
        self.observer = new IntersectionObserver(function (entries) {
          // console.log('暴露埋点-entries', entries);
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              try {
                var _self$observer;

                self.timer && clearTimeout(self.timer);
                var eventParam = entry.target.attributes[EXPOSURE_EVENT_ATTR].value;
                var eventParseParam = JSON.parse(eventParam);
                var exposureEventCode = localStorage.getItem('exposureCode'); // storage只set一次，，避免多次set

                self.trackEvent.eventCode && self.trackEvent.eventCode !== exposureEventCode && localStorage.setItem('exposureCode', eventParseParam.code); // 如果没有id则不计入埋点

                if (!eventParseParam.id) {
                  return;
                }

                var track = {
                  exposureId: eventParseParam.id,
                  exposureUrl: eventParseParam.url
                };
                var alltrack = {
                  exposureId: eventParseParam.id,
                  exposureUrl: eventParseParam.url,
                  exposureCode: eventParseParam.code
                };
                self.dataList.push(track);
                self.dataAllList.push(alltrack);
                self.trackEvent = {
                  eventCode: eventParseParam.code,
                  eventChanel: eventParseParam.channel
                }; // 已经上报的节点、取消对该DOM的观察

                (_self$observer = self.observer) === null || _self$observer === void 0 ? void 0 : _self$observer.unobserve(entry.target); // 超出最大长度直接上报，

                if (self.dataList.length >= self.maxNum) {
                  self.send(callback);
                } else if (self.dataList.length > 0) {
                  self.timer = window.setTimeout(function () {
                    // 只要有新的数据进来，接下来如果没有增加，自动2秒后上报
                    self.send(callback);
                  }, self.time);
                }
              } catch (err) {
                console.log('暴露埋点error: ', err);
              }
            }
          });
        }, {
          root: document.querySelector(self.container),
          rootMargin: '0px',
          threshold: 0.5 // 目标dom出现在视图的比例 0 - 1

        });
      } // 添加至观察列表

    }, {
      key: "add",
      value: function add(entry) {
        // console.log('add', entry);
        var _ref = entry || {},
            el = _ref.el;

        this.observer && el && this.observer.observe(el);
      } // 如果有需要再开放，增加缓存的数据逻辑
      // 触发上报数据

    }, {
      key: "send",
      value: function send(callback) {
        // 截取，并清空dataList
        var data = this.dataList.splice(0, this.maxNum);
        var trackData = {
          event_time: getNowDate(),
          event_type_code: this.trackEvent.eventCode,
          event_properties: {
            channel: this.trackEvent.eventChanel,
            exposure_params: JSON.stringify(data)
          }
        };
        callback(trackData);
      } // 组件销毁，数据全部上报
      // beforeUnmount() {
      //   const data = this.dataList;
      // }

    }]);

    return Exposure;
  }();

  var assign = function assign(target) {
    for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
      var source = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];

      for (var key in source) {
        if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var BaseTezignTracer = /*#__PURE__*/function () {
    function BaseTezignTracer() {
      _classCallCheck(this, BaseTezignTracer);

      this.silent = false;
      this.env = 'development';
      this.sessionTimeout = SESSION_TIMEOUT; // this.sysInfo = this.getSysInfo(params);

      this.initInfo = {};
    }

    _createClass(BaseTezignTracer, [{
      key: "api",
      get: function get() {
        var map = {
          production: API_PRD,
          development: API_DEV
        };
        return map[this.env];
      }
    }, {
      key: "getUserId",
      value: function getUserId() {
        var visitor = this.getStorage(VISITOR_KEY);
        if (visitor) return visitor;
        visitor = 'visitor_' + createUUID();
        this.setStorage(VISITOR_KEY, visitor);
        return visitor;
      }
    }, {
      key: "init",
      value: function init(options) {
        var user_id = options.user_id,
            tenant_id = options.tenant_id,
            global_user_id = options.global_user_id,
            _options$env = options.env,
            env = _options$env === void 0 ? 'development' : _options$env,
            _options$silent = options.silent,
            silent = _options$silent === void 0 ? false : _options$silent,
            _options$sessionTimeo = options.sessionTimeout,
            sessionTimeout = _options$sessionTimeo === void 0 ? SESSION_TIMEOUT : _options$sessionTimeo,
            distinct_id = options.distinct_id;
        this.silent = silent;
        this.sessionTimeout = sessionTimeout;
        this.env = env;
        this.initInfo.user_id = String(user_id) || this.getUserId();
        this.initInfo.tenant_id = tenant_id;
        this.initInfo.global_user_id = String(global_user_id);
        this.initInfo.distinct_id = distinct_id;
        this.initSession(); // TODO:绑定 data-track 事件
        // bindTrackEvent();
        // this.visit();
      }
    }, {
      key: "setGlobalData",
      value: function setGlobalData(options) {
        assign(this.initInfo, options);
      }
      /** 调用会生成新的session */

    }, {
      key: "visit",
      value: function visit() {
        this.refreshSession(); // 开启静默模式后不会向服务端发送数据

        if (this.silent) {
          return;
        }

        var event = assign({
          event_time: getNowDate()
        }, this.getSysInfo(), this.initInfo);
        this.send(event);
      }
    }, {
      key: "track",
      value: function track(data) {
        // 开启静默模式后不会向服务端发送数据
        if (this.silent) return;
        var event = assign({
          event_time: getNowDate()
        }, this.getSysInfo(), this.initInfo, data);
        this.send(event);
      }
    }]);

    return BaseTezignTracer;
  }();

  var WebTracer = /*#__PURE__*/function (_BaseTezignTracer) {
    _inherits(WebTracer, _BaseTezignTracer);

    var _super = _createSuper(WebTracer);

    function WebTracer() {
      var _this;

      _classCallCheck(this, WebTracer);

      _this = _super.call(this);
      _this.platform = EPlatform.web;
      _this.sysInfo = _this.initSysInfo();
      return _this;
    }

    _createClass(WebTracer, [{
      key: "setStorage",
      value: // this.sysInfo = this.getSysInfo();
      function setStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }, {
      key: "getStorage",
      value: function getStorage(key) {
        var value;
        value = localStorage.getItem(key);
        if (value) value = JSON.parse(value);
        return value;
      }
    }, {
      key: "getSysInfo",
      value: function getSysInfo() {
        return this.sysInfo;
      }
    }, {
      key: "initSysInfo",
      value: function initSysInfo() {
        var browser = browserInfo();
        var os = osInfo();
        return {
          os: os.name,
          os_version: os.version,
          user_agent: browser.userAgent,
          browser: browser.type,
          browser_version: browser.versions,
          source_from: os.isMobile ? 'h5' : 'web',
          device_id: 'device_id'
        };
      }
    }, {
      key: "getUrl",
      value: function getUrl() {
        return window.location.href;
      }
      /** 当前url是否有session */

    }, {
      key: "initSession",
      value: function initSession() {
        var url = this.getUrl();
        var match = url.match(REG_SESSION);

        if (!match) {
          this.initInfo.session = create();
          return;
        } // const str = match[0];


        this.refreshSession();
      }
    }, {
      key: "refreshSession",
      value: function refreshSession() {
        var session = this.initInfo.session;

        if (!session) {
          this.initInfo.session = create();
          return;
        }

        var idx = session.lastIndexOf('.');

        var _pt = str2int(session.substr(idx + 1, 6));

        if (Math.round(Date.now() / 1000) - _pt > this.sessionTimeout) {
          this.initInfo.session = create();
          return;
        }

        this.initInfo.session = session.substring(0, idx) + '.' + getNowStr();
      }
    }, {
      key: "send",
      value: function send(data) {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', this.api, true);
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status !== 200 || !xhr.responseText) {
              var error;

              if (xhr.responseText) {
                error = JSON.parse(xhr.responseText);
                console.warn('埋点失败', error);
              } // errorCallback(error);


              return;
            }
          };

          xhr.send(JSON.stringify(data));
        } catch (e) {//
        }
      }
      /** 返回新的url，将session作为查询符 */
      // relayUrl(url: string) {
      //   // 刷新 session
      //   this.refreshSession();
      //   if (REG_SESSION.test(url)) {
      //     return url.replace(REG_SESSION, this.getSessionForUrl());
      //   } else {
      //     const idx = url.indexOf('?');
      //     if (idx !== -1) {
      //       return url.replace('?', `?${this.getSessionForUrl()}&`);
      //     } else {
      //       return `${url}?${this.getSessionForUrl()}`;
      //     }
      //   }
      // }
      // relayPath(path: string) {
      //   return this.relayUrl(path);
      // }

    }], [{
      key: "initClickTrack",
      value: function initClickTrack(initOption) {
        var clickTrack = new WebTracer();
        clickTrack.init(initOption);
        ClickEvent.bindEvent(clickTrack.track.bind(clickTrack));
        return ClickEvent;
      }
    }]);

    return WebTracer;
  }(BaseTezignTracer);

  _defineProperty(WebTracer, "initExposureTrack", function (initOption, exposureInitOption) {
    var trackInstance = new WebTracer();
    var exposureInstance = new Exposure(exposureInitOption);
    trackInstance.init(initOption);
    exposureInstance.bindEvent(trackInstance.track.bind(trackInstance));
    return exposureInstance;
  });

  function parseOptionsToQuery(options) {
    var query = '?';

    for (var key in options) {
      var value = options[key];
      query += key + '=' + value + '&';
    }

    return query.substring(0, query.length - 1);
  }

  // type TaroType = typeof Taro;

  var MiniTracer = /*#__PURE__*/function (_BaseTezignTracer) {
    _inherits(MiniTracer, _BaseTezignTracer);

    var _super = _createSuper(MiniTracer);

    function MiniTracer(global, source) {
      var _this;

      _classCallCheck(this, MiniTracer);

      _this = _super.call(this);
      _this.global = global;
      _this.sourceForm = source;
      _this.sysInfo = _this.initSysInfo();
      return _this;
    }

    _createClass(MiniTracer, [{
      key: "setStorage",
      value: function setStorage(key, value) {
        this.global.setStorageSync(key, value);
      }
    }, {
      key: "getStorage",
      value: function getStorage(key) {
        return this.global.getStorageSync(key);
      }
    }, {
      key: "getSysInfo",
      value: function getSysInfo() {
        return this.sysInfo;
      }
    }, {
      key: "initSession",
      value: function initSession() {
        var sn = this.getStorage(SESSION_KEY);

        if (!sn) {
          this.initInfo.session = create();
          return;
        }

        this.refreshSession();
      }
    }, {
      key: "refreshSession",
      value: function refreshSession() {
        var session = this.getStorage(SESSION_KEY) || '';
        var idx = session.lastIndexOf('.');

        var _pt = str2int(session.substr(idx + 1, 6));

        if (Math.round(Date.now() / 1000) - _pt > this.sessionTimeout) {
          this.initInfo.session = create();
          return;
        }

        var sn = session.substring(0, idx) + '.' + getNowStr();
        this.setStorage(SESSION_KEY, sn);
        this.initInfo.session = sn;
      }
    }, {
      key: "send",
      value: function send(data) {
        this.global.request({
          url: this.api,
          method: 'POST',
          data: data,
          header: {
            'content-type': 'application/json'
          },
          success: function success(res) {// console.log(res.data);
          }
        });
      } // getUrl() {
      //   const pages = getCurrentPages();
      //   const page = pages[pages.length - 1];
      //   if (!pages.length || !page) {
      //     return this.host + '404';
      //   }
      //   const { route, options } = page;
      //   return this.host + route + parseOptionsToQuery(options);
      // }

    }, {
      key: "initSysInfo",
      value: function initSysInfo() {
        var systemInfo = this.global.getSystemInfoSync();
        return {
          os: systemInfo.system,
          os_version: systemInfo.version,
          user_agent: '',
          browser: '',
          browser_version: '',
          source_from: this.sourceForm,
          device_id: systemInfo.model
        };
      }
    }], [{
      key: "initClickTrack",
      value: function initClickTrack(initOption) {
        console.warn('小程序环境不支持无侵入点击埋点事件绑定');
      }
    }]);

    return MiniTracer;
  }(BaseTezignTracer);

  _defineProperty(MiniTracer, "initExposureTrack", function (initOption) {
    console.warn('小程序环境不支持无侵入暴露埋点事件绑定');
  });

  var WxTracer = /*#__PURE__*/function (_MiniTracer) {
    _inherits(WxTracer, _MiniTracer);

    var _super = _createSuper(WxTracer);

    function WxTracer() {
      var _this;

      _classCallCheck(this, WxTracer);

      _this = _super.call(this, wx, WX_SOURCE_FORM);

      _defineProperty(_assertThisInitialized(_this), "platform", EPlatform.wx);

      _defineProperty(_assertThisInitialized(_this), "host", WX_HOST);

      return _this;
    }

    _createClass(WxTracer, [{
      key: "getUrl",
      value: function getUrl() {
        var pages = getCurrentPages();
        var page = pages[pages.length - 1];

        if (!pages.length || !page) {
          return this.host + '404';
        }

        var route = page.route,
            options = page.options;
        return this.host + route + parseOptionsToQuery(options);
      }
    }]);

    return WxTracer;
  }(MiniTracer);

  var TtTracer = /*#__PURE__*/function (_MiniTracer) {
    _inherits(TtTracer, _MiniTracer);

    var _super = _createSuper(TtTracer);

    function TtTracer() {
      var _this;

      _classCallCheck(this, TtTracer);

      _this = _super.call(this, tt, TT_SOURCE_FORM);

      _defineProperty(_assertThisInitialized(_this), "platform", EPlatform.tt);

      _defineProperty(_assertThisInitialized(_this), "host", TT_HOST);

      return _this;
    }

    _createClass(TtTracer, [{
      key: "getUrl",
      value: function getUrl() {
        var pages = getCurrentPages();
        var page = pages[pages.length - 1];

        if (!pages.length || !page) {
          return this.host + '404';
        }

        var options = page.options;
        return this.host + page.is + parseOptionsToQuery(options);
      }
    }]);

    return TtTracer;
  }(MiniTracer);

  var UnknownTracer = /*#__PURE__*/function () {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    function UnknownTracer() {
      _classCallCheck(this, UnknownTracer);
    }

    _createClass(UnknownTracer, [{
      key: "init",
      value: function init() {}
    }, {
      key: "track",
      value: function track() {}
    }, {
      key: "setGlobalData",
      value: function setGlobalData() {}
    }], [{
      key: "initClickTrack",
      value: function initClickTrack(initOption) {}
    }]);

    return UnknownTracer;
  }();

  _defineProperty(UnknownTracer, "initExposureTrack", function (initOption) {});

  var getPlatform = function getPlatform() {
    if (typeof window !== 'undefined' && typeof XMLHttpRequest === 'function') {
      return EPlatform.web;
    }

    if (typeof wx !== 'undefined' && wx.getSystemInfo) {
      return EPlatform.wx;
    }

    if (typeof tt !== 'undefined' && tt.getSystemInfo) {
      return EPlatform.tt;
    }

    return null;
  };

  var _map;
  var map = (_map = {}, _defineProperty(_map, EPlatform.web, WebTracer), _defineProperty(_map, EPlatform.wx, WxTracer), _defineProperty(_map, EPlatform.tt, TtTracer), _map);
  var platform = getPlatform();
  var TezignTracer = platform ? map[platform] || UnknownTracer : UnknownTracer;

  return TezignTracer;

})));
