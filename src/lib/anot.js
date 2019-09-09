
const _Anot = (function() {
/*********************************************************************
 *                    全局变量及方法                                   *
 **********************************************************************/
var bindingID = 1024

var expose = generateID()
//http://stackoverflow.com/questions/7290086/javascript-use-strict-and-nicks-find-global-function
var DOC = window.document
var head = DOC.head //HEAD元素
head.insertAdjacentHTML(
  'afterbegin',
  '<anot skip class="anot-hide"><style id="anot-style">.anot-hide{ display: none!important } slot{visibility:hidden;}</style></anot>'
)
var ifGroup = head.firstChild

function log() {
  // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
  console.log.apply(console, arguments)
}

/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 */
function createMap() {
  return Object.create(null)
}

var subscribers = '$' + expose

var nullObject = {} //作用类似于noop，只用于代码防御，千万不要在它上面添加属性
var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
var rw20g = /\w+/g
var rsvg = /^\[object SVG\w*Element\]$/
var oproto = Object.prototype
var ohasOwn = oproto.hasOwnProperty
var serialize = oproto.toString
var ap = Array.prototype
var aslice = ap.slice
var root = DOC.documentElement
var anotFragment = DOC.createDocumentFragment()
var cinerator = DOC.createElement('div')
var class2type = {
  '[object Boolean]': 'boolean',
  '[object Number]': 'number',
  '[object String]': 'string',
  '[object Function]': 'function',
  '[object Array]': 'array',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Object]': 'object',
  '[object Error]': 'error',
  '[object AsyncFunction]': 'asyncfunction',
  '[object Promise]': 'promise',
  '[object Generator]': 'generator',
  '[object GeneratorFunction]': 'generatorfunction'
}

function noop() {}
function scpCompile(array) {
  return Function.apply(noop, array)
}

function oneObject(array, val) {
  if (typeof array === 'string') {
    array = array.match(rword) || []
  }
  var result = {},
    value = val !== void 0 ? val : 1
  for (var i = 0, n = array.length; i < n; i++) {
    result[array[i]] = value
  }
  return result
}

function generateID(mark) {
  mark = (mark && mark + '-') || 'anot-'
  return mark + (++bindingID).toString(16)
}
/*-----------------部分ES6的JS实现 start---------------*/

// ===============================
// ========== Promise ============
// ===============================

if (!Promise.defer) {
  Promise.defer = function() {
    let obj = {}
    obj.promise = new Promise((resolve, reject) => {
      obj.resolve = resolve
      obj.reject = reject
    })
    return obj
  }
}

//类似于Array 的splice方法
if (!String.prototype.splice) {
  Object.defineProperty(String.prototype, 'splice', {
    value: function(start, len, fill) {
      let length = this.length
      let argLen = arguments.length

      fill = fill === undefined ? '' : fill

      if (argLen < 1) {
        return this
      }

      //处理负数
      if (start < 0) {
        if (Math.abs(start) >= length) {
          start = 0
        } else {
          start = length + start
        }
      }

      if (argLen === 1) {
        return this.slice(0, start)
      } else {
        len -= 0

        let strl = this.slice(0, start)
        let strr = this.slice(start + len)

        return strl + fill + strr
      }
    },
    enumerable: false
  })
}

if (!Date.prototype.getFullWeek) {
  //获取当天是本年度第几周
  Object.defineProperty(Date.prototype, 'getFullWeek', {
    value: function() {
      let thisYear = this.getFullYear()
      let that = new Date(thisYear, 0, 1)
      let firstDay = that.getDay() || 1
      let numsOfToday = (this - that) / 86400000
      return Math.ceil((numsOfToday + firstDay) / 7)
    },
    enumerable: false
  })

  //获取当天是本月第几周
  Object.defineProperty(Date.prototype, 'getWeek', {
    value: function() {
      let today = this.getDate()
      let thisMonth = this.getMonth()
      let thisYear = this.getFullYear()
      let firstDay = new Date(thisYear, thisMonth, 1).getDay()
      return Math.ceil((today + firstDay) / 7)
    },
    enumerable: false
  })
}

if (!Date.isDate) {
  Object.defineProperty(Date, 'isDate', {
    value: function(obj) {
      return typeof obj === 'object' && obj.getTime ? true : false
    },
    enumerable: false
  })
}

//时间格式化
if (!Date.prototype.format) {
  Object.defineProperty(Date.prototype, 'format', {
    value: function(str) {
      str = str || 'Y-m-d H:i:s'
      let week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      let dt = {
        fullyear: this.getFullYear(),
        year: this.getYear(),
        fullweek: this.getFullWeek(),
        week: this.getWeek(),
        month: this.getMonth() + 1,
        date: this.getDate(),
        day: week[this.getDay()],
        hours: this.getHours(),
        minutes: this.getMinutes(),
        seconds: this.getSeconds()
      }
      let re

      dt.g = dt.hours > 12 ? dt.hours - 12 : dt.hours

      re = {
        Y: dt.fullyear,
        y: dt.year,
        m: dt.month < 10 ? '0' + dt.month : dt.month,
        n: dt.month,
        d: dt.date < 10 ? '0' + dt.date : dt.date,
        j: dt.date,
        H: dt.hours < 10 ? '0' + dt.hours : dt.hours,
        h: dt.g < 10 ? '0' + dt.g : dt.g,
        G: dt.hours,
        g: dt.g,
        i: dt.minutes < 10 ? '0' + dt.minutes : dt.minutes,
        s: dt.seconds < 10 ? '0' + dt.seconds : dt.seconds,
        W: dt.fullweek,
        w: dt.week,
        D: dt.day
      }

      for (let i in re) {
        str = str.replace(new RegExp(i, 'g'), re[i])
      }
      return str
    },
    enumerable: false
  })
}
/*-----------------部分ES6的JS实现 ending---------------*/
let Anot = function(el) {
  //创建jQuery式的无new 实例化结构
  return new Anot.init(el)
}

/*视浏览器情况采用最快的异步回调*/
Anot.nextTick = new function() {
  // jshint ignore:line
  let tickImmediate = window.setImmediate
  let tickObserver = window.MutationObserver
  if (tickImmediate) {
    return tickImmediate.bind(window)
  }

  let queue = []
  function callback() {
    let n = queue.length
    for (let i = 0; i < n; i++) {
      queue[i]()
    }
    queue = queue.slice(n)
  }

  if (tickObserver) {
    let node = document.createTextNode('anot')
    new tickObserver(callback).observe(node, { characterData: true }) // jshint ignore:line
    let bool = false
    return function(fn) {
      queue.push(fn)
      bool = !bool
      node.data = bool
    }
  }

  return function(fn) {
    setTimeout(fn, 4)
  }
}() // jshint ignore:line

/*********************************************************************
 *                 Anot的静态方法定义区                              *
 **********************************************************************/

Anot.type = function(obj) {
  //取得目标的类型
  if (obj == null) {
    return String(obj)
  }
  // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
  return typeof obj === 'object' || typeof obj === 'function'
    ? class2type[serialize.call(obj)] || 'object'
    : typeof obj
}

Anot.PropsTypes = function(type) {
  this.type = 'PropsTypes'
  this.checkType = type
}

Anot.PropsTypes.prototype = {
  toString: function() {
    return ''
  },
  check: function(val) {
    this.result = Anot.type(val)
    return this.result === this.checkType
  },
  call: function() {
    return this.toString()
  }
}

Anot.PropsTypes.isString = function() {
  return new this('string')
}

Anot.PropsTypes.isNumber = function() {
  return new this('number')
}

Anot.PropsTypes.isFunction = function() {
  return new this('function')
}

Anot.PropsTypes.isArray = function() {
  return new this('array')
}

Anot.PropsTypes.isObject = function() {
  return new this('object')
}

Anot.PropsTypes.isBoolean = function() {
  return new this('boolean')
}

/*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
Anot.isPlainObject = function(obj) {
  // 简单的 typeof obj === "object"检测，会致使用isPlainObject(window)在opera下通不过
  return (
    serialize.call(obj) === '[object Object]' &&
    Object.getPrototypeOf(obj) === oproto
  )
}

let VMODELS = (Anot.vmodels = {}) //所有vmodel都储存在这里
Anot.init = function(source) {
  if (Anot.isPlainObject(source)) {
    let $id = source.$id
    let vm = null
    if (!$id) {
      log('warning: vm必须指定id')
    }
    vm = modelFactory(Object.assign({ props: {} }, source))
    vm.$id = $id
    VMODELS[$id] = vm

    Anot.nextTick(function() {
      let $elem = document.querySelector('[anot=' + vm.$id + ']')
      if ($elem) {
        if ($elem === DOC.body) {
          scanTag($elem, [])
        } else {
          let _parent = $elem
          while ((_parent = _parent.parentNode)) {
            if (_parent.__VM__) {
              break
            }
          }
          scanTag($elem.parentNode, _parent ? [_parent.__VM__] : [])
        }
      }
    })

    return vm
  } else {
    this[0] = this.element = source
  }
}
Anot.fn = Anot.prototype = Anot.init.prototype

//与jQuery.extend方法，可用于浅拷贝，深拷贝
Anot.mix = Anot.fn.mix = function() {
  let options,
    name,
    src,
    copy,
    copyIsArray,
    clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false

  // 如果第一个参数为布尔,判定是否深拷贝
  if (typeof target === 'boolean') {
    deep = target
    target = arguments[1] || {}
    i++
  }

  //确保接受方为一个复杂的数据类型
  if (typeof target !== 'object' && Anot.type(target) !== 'function') {
    target = {}
  }

  //如果只有一个参数，那么新成员添加于mix所在的对象上
  if (i === length) {
    target = this
    i--
  }

  for (; i < length; i++) {
    //只处理非空参数
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name]
        copy = options[name]
        // 防止环引用
        if (target === copy) {
          continue
        }
        if (
          deep &&
          copy &&
          (Anot.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))
        ) {
          if (copyIsArray) {
            copyIsArray = false
            clone = src && Array.isArray(src) ? src : []
          } else {
            clone = src && Anot.isPlainObject(src) ? src : {}
          }

          target[name] = Anot.mix(deep, clone, copy)
        } else if (copy !== void 0) {
          target[name] = copy
        }
      }
    }
  }
  return target
}

function cacheStore(tpye, key, val) {
  if (this.type(key) === 'object') {
    for (let i in key) {
      window[tpye].setItem(i, key[i])
    }
    return
  }
  switch (arguments.length) {
    case 2:
      return window[tpye].getItem(key)
    case 3:
      if ((this.type(val) == 'string' && val.trim() === '') || val === null) {
        window[tpye].removeItem(key)
        return
      }
      if (this.type(val) !== 'object' && this.type(val) !== 'array') {
        window[tpye].setItem(key, val.toString())
      } else {
        window[tpye].setItem(key, JSON.stringify(val))
      }
      break
  }
}

/*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
function isArrayLike(obj) {
  if (obj && typeof obj === 'object') {
    let n = obj.length,
      str = serialize.call(obj)
    if (/(Array|List|Collection|Map|Arguments)\]$/.test(str)) {
      return true
    } else if (str === '[object Object]' && n === n >>> 0) {
      return true //由于ecma262v5能修改对象属性的enumerable，因此不能用propertyIsEnumerable来判定了
    }
  }
  return false
}

Anot.mix({
  rword: rword,
  subscribers: subscribers,
  version: '1.0.0',
  log: log,
  ui: {}, //仅用于存放组件版本信息等
  slice: function(nodes, start, end) {
    return aslice.call(nodes, start, end)
  },
  noop: noop,
  /*如果不用Error对象封装一下，str在控制台下可能会乱码*/
  error: function(str, e) {
    throw new (e || Error)(str) // jshint ignore:line
  },
  /* Anot.range(10)
     => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     Anot.range(1, 11)
     => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     Anot.range(0, 30, 5)
     => [0, 5, 10, 15, 20, 25]
     Anot.range(0, -10, -1)
     => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
     Anot.range(0)
     => []*/
  range: function(start, end, step) {
    // 用于生成整数数组
    step || (step = 1)
    if (end == null) {
      end = start || 0
      start = 0
    }
    let index = -1,
      length = Math.max(0, Math.ceil((end - start) / step)),
      result = new Array(length)
    while (++index < length) {
      result[index] = start
      start += step
    }
    return result
  },
  deepCopy: toJson,
  eventHooks: {},
  /*绑定事件*/
  bind: function(el, type, fn, phase) {
    let hooks = Anot.eventHooks
    type = type.split(',')
    Anot.each(type, function(i, t) {
      t = t.trim()
      let hook = hooks[t]
      if (typeof hook === 'object') {
        type = hook.type || type
        phase = hook.phase || !!phase
        fn = hook.fix ? hook.fix(el, fn) : fn
      }
      el.addEventListener(t, fn, phase)
    })
    return fn
  },
  /*卸载事件*/
  unbind: function(el, type, fn, phase) {
    let hooks = Anot.eventHooks
    type = type.split(',')
    fn = fn || noop
    Anot.each(type, function(i, t) {
      t = t.trim()
      let hook = hooks[t]
      if (typeof hook === 'object') {
        type = hook.type || type
        phase = hook.phase || !!phase
      }
      el.removeEventListener(t, fn, phase)
    })
  },
  /*读写删除元素节点的样式*/
  css: function(node, name, value) {
    if (node instanceof Anot) {
      node = node[0]
    }
    var prop = /[_-]/.test(name) ? camelize(name) : name
    var fn

    name = Anot.cssName(prop) || prop
    if (value === void 0 || typeof value === 'boolean') {
      //获取样式
      fn = cssHooks[prop + ':get'] || cssHooks['@:get']
      if (name === 'background') {
        name = 'backgroundColor'
      }
      var val = fn(node, name)
      return value === true ? +val || 0 : val
    } else if (value === '') {
      //请除样式
      node.style[name] = ''
    } else {
      //设置样式
      if (value == null || value !== value) {
        return
      }
      if (isFinite(value) && !Anot.cssNumber[prop]) {
        value += 'px'
      }
      fn = cssHooks[prop + ':set'] || cssHooks['@:set']
      fn(node, name, value)
    }
  },
  /*遍历数组与对象,回调的第一个参数为索引或键名,第二个或元素或键值*/
  each: function(obj, fn) {
    if (obj) {
      //排除null, undefined
      let i = 0
      if (isArrayLike(obj)) {
        for (let n = obj.length; i < n; i++) {
          if (fn(i, obj[i]) === false) break
        }
      } else {
        for (i in obj) {
          if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
            break
          }
        }
      }
    }
  },
  Array: {
    /*只有当前数组不存在此元素时只添加它*/
    ensure: function(target, item) {
      if (target.indexOf(item) === -1) {
        return target.push(item)
      }
    },
    /*移除数组中指定位置的元素，返回布尔表示成功与否*/
    removeAt: function(target, index) {
      return !!target.splice(index, 1).length
    },
    /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
    remove: function(target, item) {
      let index = target.indexOf(item)
      if (~index) return Anot.Array.removeAt(target, index)
      return false
    }
  },
  /**
   * [ls localStorage操作]
   * @param  {[type]} key  [键名]
   * @param  {[type]} val [键值，为空时删除]
   * @return
   */
  ls: function() {
    let args = aslice.call(arguments, 0)
    args.unshift('localStorage')
    return cacheStore.apply(this, args)
  },
  ss: function() {
    let args = aslice.call(arguments, 0)
    args.unshift('sessionStorage')
    return cacheStore.apply(this, args)
  },
  /**
   * [cookie cookie 操作 ]
   * @param  key  [cookie名]
   * @param  val [cookie值]
   * @param  {[json]} opt   [有效期，域名，路径等]
   * @return {[boolean]}       [读取时返回对应的值，写入时返回true]
   */
  cookie: function(key, val, opt) {
    if (arguments.length > 1) {
      if (!key) {
        return
      }

      //设置默认的参数
      opt = opt || {}
      opt = Object.assign(
        {
          expires: '',
          path: '/',
          domain: document.domain,
          secure: ''
        },
        opt
      )

      if ((this.type(val) == 'string' && val.trim() === '') || val === null) {
        document.cookie =
          encodeURIComponent(key) +
          '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' +
          opt.domain +
          '; path=' +
          opt.path
        return true
      }
      if (opt.expires) {
        switch (opt.expires.constructor) {
          case Number:
            opt.expires =
              opt.expires === Infinity
                ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
                : '; max-age=' + opt.expires
            break
          case String:
            opt.expires = '; expires=' + opt.expires
            break
          case Date:
            opt.expires = '; expires=' + opt.expires.toUTCString()
            break
        }
      }
      document.cookie =
        encodeURIComponent(key) +
        '=' +
        encodeURIComponent(val) +
        opt.expires +
        '; domain=' +
        opt.domain +
        '; path=' +
        opt.path +
        '; ' +
        opt.secure
      return true
    } else {
      if (!key) {
        return document.cookie
      }
      return (
        decodeURIComponent(
          document.cookie.replace(
            new RegExp(
              '(?:(?:^|.*;)\\s*' +
                encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') +
                '\\s*\\=\\s*([^;]*).*$)|^.*$'
            ),
            '$1'
          )
        ) || null
      )
    }
  },
  //获取url的参数
  search: function(key) {
    key += ''
    let uri = location.search

    if (!key || !uri) {
      return null
    }
    uri = decodeURIComponent(uri)

    uri = uri.slice(1)
    uri = uri.split('&')

    let obj = {}
    for (let i = 0, item; (item = uri[i++]); ) {
      let tmp = item.split('=')
      tmp[1] = tmp.length < 2 ? null : tmp[1]
      tmp[1] = tmp[1]
      if (obj.hasOwnProperty(tmp[0])) {
        if (typeof obj[tmp[0]] === 'object') {
          obj[tmp[0]].push(tmp[1])
        } else {
          obj[tmp[0]] = [obj[tmp[0]]]
          obj[tmp[0]].push(tmp[1])
        }
      } else {
        obj[tmp[0]] = tmp[1]
      }
    }
    return obj.hasOwnProperty(key) ? obj[key] : null
  },
  //复制文本到粘贴板
  copy: function(txt) {
    if (!DOC.queryCommandSupported || !DOC.queryCommandSupported('copy')) {
      return log('该浏览器不支持复制到粘贴板')
    }

    let ta = DOC.createElement('textarea')
    ta.textContent = txt
    ta.style.position = 'fixed'
    ta.style.bottom = '-1000px'
    DOC.body.appendChild(ta)
    ta.select()
    try {
      DOC.execCommand('copy')
    } catch (err) {
      log('复制到粘贴板失败', err)
    }
    DOC.body.removeChild(ta)
  }
})

let bindingHandlers = (Anot.bindingHandlers = {})
let bindingExecutors = (Anot.bindingExecutors = {})

let directives = (Anot.directives = {})
Anot.directive = function(name, obj) {
  bindingHandlers[name] = obj.init = obj.init || noop
  bindingExecutors[name] = obj.update = obj.update || noop
  return (directives[name] = obj)
}
// https://github.com/rsms/js-lru
let Cache = new function() {
  // jshint ignore:line
  function LRU(maxLength) {
    this.size = 0
    this.limit = maxLength
    this.head = this.tail = void 0
    this._keymap = {}
  }

  let p = LRU.prototype

  p.put = function(key, value) {
    let entry = {
      key: key,
      value: value
    }
    this._keymap[key] = entry
    if (this.tail) {
      this.tail.newer = entry
      entry.older = this.tail
    } else {
      this.head = entry
    }
    this.tail = entry
    if (this.size === this.limit) {
      this.shift()
    } else {
      this.size++
    }
    return value
  }

  p.shift = function() {
    let entry = this.head
    if (entry) {
      this.head = this.head.newer
      this.head.older = entry.newer = entry.older = this._keymap[
        entry.key
      ] = void 0
      delete this._keymap[entry.key] //#1029
    }
  }
  p.get = function(key) {
    let entry = this._keymap[key]
    if (entry === void 0) return
    if (entry === this.tail) {
      return entry.value
    }
    // HEAD--------------TAIL
    //   <.older   .newer>
    //  <--- add direction --
    //   A  B  C  <D>  E
    if (entry.newer) {
      if (entry === this.head) {
        this.head = entry.newer
      }
      entry.newer.older = entry.older // C <-- E.
    }
    if (entry.older) {
      entry.older.newer = entry.newer // C. --> E
    }
    entry.newer = void 0 // D --x
    entry.older = this.tail // D. --> E
    if (this.tail) {
      this.tail.newer = entry // E. <-- D
    }
    this.tail = entry
    return entry.value
  }
  return LRU
}() // jshint ignore:line
/*********************************************************************
 *                           DOM 底层补丁                             *
 **********************************************************************/

//safari5+是把contains方法放在Element.prototype上而不是Node.prototype
if (!DOC.contains) {
  Node.prototype.contains = function(arg) {
    return !!(this.compareDocumentPosition(arg) & 16)
  }
}
Anot.contains = function(root, el) {
  try {
    while ((el = el.parentNode)) if (el === root) return true
    return false
  } catch (e) {
    return false
  }
}

//========================= event binding ====================

let eventHooks = Anot.eventHooks

//针对firefox, chrome修正mouseenter, mouseleave(chrome30+)
if (!('onmouseenter' in root)) {
  Anot.each(
    {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
    },
    function(origType, fixType) {
      eventHooks[origType] = {
        type: fixType,
        fix: function(elem, fn) {
          return function(e) {
            let t = e.relatedTarget
            if (!t || (t !== elem && !(elem.compareDocumentPosition(t) & 16))) {
              delete e.type
              e.type = origType
              return fn.call(elem, e)
            }
          }
        }
      }
    }
  )
}

//针对IE9+, w3c修正animationend
Anot.each(
  {
    AnimationEvent: 'animationend',
    WebKitAnimationEvent: 'webkitAnimationEnd'
  },
  function(construct, fixType) {
    if (window[construct] && !eventHooks.animationend) {
      eventHooks.animationend = {
        type: fixType
      }
    }
  }
)

if (DOC.onmousewheel === void 0) {
  /* IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
     firefox DOMMouseScroll detail 下3 上-3
     firefox wheel detlaY 下3 上-3
     IE9-11 wheel deltaY 下40 上-40
     chrome wheel deltaY 下100 上-100 */
  eventHooks.mousewheel = {
    type: 'wheel',
    fix: function(elem, fn) {
      return function(e) {
        e.wheelDeltaY = e.wheelDelta = e.deltaY > 0 ? -120 : 120
        e.wheelDeltaX = 0
        Object.defineProperty(e, 'type', {
          value: 'mousewheel'
        })
        fn.call(elem, e)
      }
    }
  }
}
/*********************************************************************
 *                           配置系统                                 *
 **********************************************************************/

function kernel(settings) {
  for (var p in settings) {
    if (!ohasOwn.call(settings, p)) continue
    var val = settings[p]
    if (typeof kernel.plugins[p] === 'function') {
      kernel.plugins[p](val)
    } else if (typeof kernel[p] === 'object') {
      Anot.mix(kernel[p], val)
    } else {
      kernel[p] = val
    }
  }
  return this
}
Anot.config = kernel

var openTag,
  closeTag,
  rexpr,
  rexprg,
  rbind,
  rregexp = /[-.*+?^${}()|[\]\/\\]/g

function escapeRegExp(target) {
  //http://stevenlevithan.com/regex/xregexp/
  //将字符串安全格式化为正则表达式的源码
  return (target + '').replace(rregexp, '\\$&')
}

var plugins = {
  interpolate: function(array) {
    openTag = array[0]
    closeTag = array[1]
    if (openTag === closeTag) {
      throw new SyntaxError('openTag!==closeTag')
      var test = openTag + 'test' + closeTag
      cinerator.innerHTML = test
      if (
        cinerator.innerHTML !== test &&
        cinerator.innerHTML.indexOf('&lt;') > -1
      ) {
        throw new SyntaxError('此定界符不合法')
      }
      cinerator.innerHTML = ''
    }
    kernel.openTag = openTag
    kernel.closeTag = closeTag
    var o = escapeRegExp(openTag),
      c = escapeRegExp(closeTag)
    rexpr = new RegExp(o + '([\\s\\S]*)' + c)
    rexprg = new RegExp(o + '([\\s\\S]*)' + c, 'g')
    rbind = new RegExp(o + '[\\s\\S]*' + c + '|\\s:') //此处有疑问
  }
}
kernel.plugins = plugins
kernel.plugins['interpolate'](['{{', '}}'])

kernel.async = true
kernel.paths = {}
kernel.shim = {}
kernel.maxRepeatSize = 100
function $watch(expr, binding) {
  var $events = this.$events || (this.$events = {}),
    queue = $events[expr] || ($events[expr] = [])

  if (typeof binding === 'function') {
    var backup = binding
    backup.uuid = '_' + ++bindingID
    binding = {
      element: root,
      type: 'user-watcher',
      handler: noop,
      vmodels: [this],
      expr: expr,
      uuid: backup.uuid
    }
    binding.wildcard = /\*/.test(expr)
  }

  if (!binding.update) {
    if (/\w\.*\B/.test(expr) || expr === '*') {
      binding.getter = noop
      var host = this
      binding.update = function() {
        var args = this.fireArgs || []
        if (args[2]) binding.handler.apply(host, args)
        delete this.fireArgs
      }
      queue.sync = true
      Anot.Array.ensure(queue, binding)
    } else {
      Anot.injectBinding(binding)
    }
    if (backup) {
      binding.handler = backup
    }
  } else if (!binding.oneTime) {
    Anot.Array.ensure(queue, binding)
  }

  return function() {
    binding.update = binding.getter = binding.handler = noop
    binding.element = DOC.createElement('a')
  }
}

function $emit(key, args) {
  var event = this.$events
  var _parent = null
  if (event && event[key]) {
    if (args) {
      args[2] = key
    }
    var arr = event[key]
    notifySubscribers(arr, args)
    if (args && event['*'] && !/\./.test(key)) {
      for (var sub, k = 0; (sub = event['*'][k++]); ) {
        try {
          sub.handler.apply(this, args)
        } catch (e) {}
      }
    }
    _parent = this.$up
    if (_parent) {
      if (this.$pathname) {
        $emit.call(_parent, this.$pathname + '.' + key, args) //以确切的值往上冒泡
      }
      $emit.call(_parent, '*.' + key, args) //以模糊的值往上冒泡
    }
  } else {
    _parent = this.$up
    if (this.$ups) {
      for (var i in this.$ups) {
        $emit.call(this.$ups[i], i + '.' + key, args) //以确切的值往上冒泡
      }
      return
    }
    if (_parent) {
      var p = this.$pathname
      if (p === '') p = '*'
      var path = p + '.' + key
      arr = path.split('.')

      args = (args && args.concat([path, key])) || [path, key]

      if (arr.indexOf('*') === -1) {
        $emit.call(_parent, path, args) //以确切的值往上冒泡
        arr[1] = '*'
        $emit.call(_parent, arr.join('.'), args) //以模糊的值往上冒泡
      } else {
        $emit.call(_parent, path, args) //以确切的值往上冒泡
      }
    }
  }
}

function collectDependency(el, key) {
  do {
    if (el.$watch) {
      var e = el.$events || (el.$events = {})
      var array = e[key] || (e[key] = [])
      dependencyDetection.collectDependency(array)
      return
    }
    el = el.$up
    if (el) {
      key = el.$pathname + '.' + key
    } else {
      break
    }
  } while (true)
}

function notifySubscribers(subs, args) {
  if (!subs) return
  if (new Date() - beginTime > 444 && typeof subs[0] === 'object') {
    rejectDisposeQueue()
  }
  var users = [],
    renders = []
  for (var i = 0, sub; (sub = subs[i++]); ) {
    if (sub.type === 'user-watcher') {
      users.push(sub)
    } else {
      renders.push(sub)
    }
  }
  if (kernel.async) {
    buffer.render() //1
    for (i = 0; (sub = renders[i++]); ) {
      if (sub.update) {
        sub.uuid = sub.uuid || '_' + ++bindingID
        var uuid = sub.uuid
        if (!buffer.queue[uuid]) {
          buffer.queue[uuid] = '__'
          buffer.queue.push(sub)
        }
      }
    }
  } else {
    for (i = 0; (sub = renders[i++]); ) {
      if (sub.update) {
        sub.update() //最小化刷新DOM树
      }
    }
  }
  for (i = 0; (sub = users[i++]); ) {
    if ((args && args[2] === sub.expr) || sub.wildcard) {
      sub.fireArgs = args
    }
    sub.update()
  }
}

//一些不需要被监听的属性
var kernelProps = oneObject(
  '$id,$watch,$fire,$events,$model,$active,$pathname,$up,$ups,$track,$accessors'
)

//如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
//标准浏览器使用__defineGetter__, __defineSetter__实现

function modelFactory(source, options) {
  options = options || {}
  options.watch = true
  return observeObject(source, options)
}

function isSkip(k) {
  return k.charAt(0) === '$' || k.slice(0, 2) === '__' || kernelProps[k]
}

//监听对象属性值的变化(注意,数组元素不是数组的属性),通过对劫持当前对象的访问器实现
//监听对象或数组的结构变化, 对对象的键值对进行增删重排, 或对数组的进行增删重排,都属于这范畴
//   通过比较前后代理VM顺序实现
function Component() {}

function observeObject(source, options) {
  if (
    !source ||
    (source.$id && source.$accessors) ||
    (source.nodeName && source.nodeType > 0)
  ) {
    return source
  }
  //source为原对象,不能是元素节点或null
  //options,可选,配置对象,里面有old, force, watch这三个属性
  options = options || nullObject
  var force = options.force || nullObject
  var old = options.old
  var oldAccessors = (old && old.$accessors) || nullObject
  var $vmodel = new Component() //要返回的对象, 它在IE6-8下可能被偷龙转凤
  var accessors = {} //监控属性
  var hasOwn = {}
  var skip = []
  var simple = []
  var userSkip = {}
  // 提取 source中的配置项, 并删除相应字段
  var state = source.state
  var computed = source.computed
  var methods = source.methods
  var props = source.props
  var watches = source.watch
  var mounted = source.mounted

  delete source.state
  delete source.computed
  delete source.methods
  delete source.props
  delete source.watch

  if (source.skip) {
    userSkip = oneObject(source.skip)
    delete source.skip
  }

  // 基础数据
  if (state) {
    if (source.$id) {
      // 直接删除名为props的 字段, 对于主VM对象, props将作为保留关键字
      // 下面的计算属性,方法等, 作同样的逻辑处理
      delete state.props
    }
    for (name in state) {
      var value = state[name]
      if (!kernelProps[name]) {
        hasOwn[name] = true
      }
      if (
        typeof value === 'function' ||
        (value && value.nodeName && value.nodeType > 0) ||
        (!force[name] && (isSkip(name) || userSkip[name]))
      ) {
        skip.push(name)
      } else if (isComputed(value)) {
        log('warning:计算属性建议放在[computed]对象中统一定义')
        // 转给下一步处理
        computed[name] = value
      } else {
        simple.push(name)
        if (oldAccessors[name]) {
          accessors[name] = oldAccessors[name]
        } else {
          accessors[name] = makeGetSet(name, value)
        }
      }
    }
  }

  //处理计算属性
  if (computed) {
    delete computed.props
    for (var name in computed) {
      hasOwn[name] = true
      ;(function(key, value) {
        var old
        if (typeof value === 'function') {
          value = { get: value, set: noop }
        }
        if (typeof value.set !== 'function') {
          value.set = noop
        }
        accessors[key] = {
          get: function() {
            return (old = value.get.call(this))
          },
          set: function(x) {
            var older = old,
              newer
            value.set.call(this, x)
            newer = this[key]
            if (this.$fire && newer !== older) {
              this.$fire(key, newer, older)
            }
          },
          enumerable: true,
          configurable: true
        }
      })(name, computed[name]) // jshint ignore:line
    }
  }

  // 方法
  if (methods) {
    delete methods.props
    for (var name in methods) {
      hasOwn[name] = true
      skip.push(name)
    }
  }

  if (props) {
    hideProperty($vmodel, 'props', {})
    hasOwn.props = !!source.$id
    for (var name in props) {
      $vmodel.props[name] = props[name]
    }
  }

  Object.assign(source, state, methods)

  accessors['$model'] = $modelDescriptor
  $vmodel = Object.defineProperties($vmodel, accessors, source)
  function trackBy(name) {
    return hasOwn[name] === true
  }
  skip.forEach(function(name) {
    $vmodel[name] = source[name]
  })

  // hideProperty($vmodel, '$ups', null)
  hideProperty($vmodel, '$id', 'anonymous')
  hideProperty($vmodel, '$up', old ? old.$up : null)
  hideProperty($vmodel, '$track', Object.keys(hasOwn))
  hideProperty($vmodel, '$active', false)
  hideProperty($vmodel, '$pathname', old ? old.$pathname : '')
  hideProperty($vmodel, '$accessors', accessors)
  hideProperty($vmodel, '$events', {})
  hideProperty($vmodel, '$refs', {})
  hideProperty($vmodel, '$children', [])
  hideProperty($vmodel, 'hasOwnProperty', trackBy)
  hideProperty($vmodel, '$mounted', mounted)
  if (options.watch) {
    hideProperty($vmodel, '$watch', function() {
      return $watch.apply($vmodel, arguments)
    })
    hideProperty($vmodel, '$fire', function(path, a) {
      if (path.indexOf('all!') === 0) {
        var ee = path.slice(4)
        for (var i in Anot.vmodels) {
          var v = Anot.vmodels[i]
          v.$fire && v.$fire.apply(v, [ee, a])
        }
      } else if (path.indexOf('child!') === 0) {
        var ee = 'props.' + path.slice(6)
        for (var i in $vmodel.$children) {
          var v = $vmodel.$children[i]
          v.$fire && v.$fire.apply(v, [ee, a])
        }
      } else {
        $emit.call($vmodel, path, [a])
      }
    })
  }

  simple.forEach(function(name) {
    var oldVal = old && old[name]
    var val = ($vmodel[name] = state[name])
    if (val && typeof val === 'object' && !Date.isDate(val)) {
      val.$up = $vmodel
      val.$pathname = name
    }
    $emit.call($vmodel, name, [val, oldVal])
  })

  // 属性的监听, 必须放在上一步$emit后处理, 否则会在初始时就已经触发一次 监听回调
  if (watches) {
    delete watches.props
    for (var key in watches) {
      if (Array.isArray(watches[key])) {
        var tmp
        while ((tmp = watches[key].pop())) {
          $watch.call($vmodel, key, tmp)
        }
      } else {
        $watch.call($vmodel, key, watches[key])
      }
    }
  }

  $vmodel.$active = true

  if ($vmodel.$id !== 'anonymous') {
    if (old && old.$up && old.$up.$children) {
      old.$up.$children.push($vmodel)
    }
  }

  return $vmodel
}

/*
 新的VM拥有如下私有属性
 $id: vm.id
 $events: 放置$watch回调与绑定对象
 $watch: 增强版$watch
 $fire: 触发$watch回调
 $track:一个数组,里面包含用户定义的所有键名
 $active:boolean,false时防止依赖收集
 $model:返回一个纯净的JS对象
 $accessors:放置所有读写器的数据描述对象
 $pathname:返回此对象在上级对象的名字,注意,数组元素的$pathname为空字符串
 =============================
 skip:用于指定不可监听的属性,但VM生成是没有此属性的
 */
function isComputed(val) {
  //speed up!
  if (val && typeof val === 'object') {
    for (var i in val) {
      if (i !== 'get' && i !== 'set') {
        return false
      }
    }
    return typeof val.get === 'function'
  }
}
function makeGetSet(key, value) {
  var childVm,
    value = NaN
  return {
    get: function() {
      if (this.$active) {
        collectDependency(this, key)
      }
      return value
    },
    set: function(newVal) {
      if (value === newVal) return
      var oldValue = value
      childVm = observe(newVal, value)
      if (childVm) {
        value = childVm
      } else {
        childVm = void 0
        value = newVal
      }

      if (Object(childVm) === childVm) {
        childVm.$pathname = key
        childVm.$up = this
      }
      if (this.$active) {
        $emit.call(this, key, [value, oldValue])
      }
    },
    enumerable: true,
    configurable: true
  }
}

function observe(obj, old, hasReturn, watch) {
  if (Array.isArray(obj)) {
    return observeArray(obj, old, watch)
  } else if (Anot.isPlainObject(obj)) {
    if (old && typeof old === 'object') {
      var keys = Object.keys(obj)
      var keys2 = Object.keys(old)
      if (keys.join(';') === keys2.join(';')) {
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            old[i] = obj[i]
          }
        }
        return old
      }
      old.$active = false
    }
    return observeObject(
      { state: obj },
      {
        old: old,
        watch: watch
      }
    )
  }
  if (hasReturn) {
    return obj
  }
}

function observeArray(array, old, watch) {
  if (old && old.splice) {
    var args = [0, old.length].concat(array)
    old.splice.apply(old, args)
    return old
  } else {
    for (var i in newProto) {
      array[i] = newProto[i]
    }
    hideProperty(array, '$up', null)
    hideProperty(array, '$pathname', '')
    hideProperty(array, '$track', createTrack(array.length))

    array._ = observeObject(
      {
        state: { length: NaN }
      },
      {
        watch: true
      }
    )
    array._.length = array.length
    array._.$watch('length', function(a, b) {
      $emit.call(array.$up, array.$pathname + '.length', [a, b])
    })
    if (watch) {
      hideProperty(array, '$watch', function() {
        return $watch.apply(array, arguments)
      })
    }

    Object.defineProperty(array, '$model', $modelDescriptor)

    for (var j = 0, n = array.length; j < n; j++) {
      var el = (array[j] = observe(array[j], 0, 1, 1))
      if (Object(el) === el) {
        //#1077
        el.$up = array
      }
    }

    return array
  }
}

function hideProperty(host, name, value) {
  Object.defineProperty(host, name, {
    value: value,
    writable: true,
    enumerable: false,
    configurable: true
  })
}
Anot.hideProperty = hideProperty

function toJson(val) {
  var xtype = Anot.type(val)
  if (xtype === 'array') {
    var array = []
    for (var i = 0; i < val.length; i++) {
      array[i] = toJson(val[i])
    }
    return array
  } else if (xtype === 'object') {
    var obj = {}
    for (i in val) {
      if (val.hasOwnProperty(i)) {
        var value = val[i]
        obj[i] = value && value.nodeType ? value : toJson(value)
      }
    }
    return obj
  }
  return val
}

var $modelDescriptor = {
  get: function() {
    return toJson(this)
  },
  set: noop,
  enumerable: false,
  configurable: true
}
/*********************************************************************
 *          监控数组（:for配合使用）                     *
 **********************************************************************/

var arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice']
var arrayProto = Array.prototype
var newProto = {
  notify: function() {
    $emit.call(this.$up, this.$pathname)
  },
  set: function(index, val) {
    index = index >>> 0
    if (index > this.length) {
      throw Error(index + 'set方法的第一个参数不能大于原数组长度')
    }
    if (this[index] !== val) {
      var old = this[index]
      this.splice(index, 1, val)
      $emit.call(this.$up, this.$pathname + '.*', [val, old, null, index])
    }
  },
  contains: function(el) {
    //判定是否包含
    return this.indexOf(el) > -1
  },
  ensure: function(el) {
    if (!this.contains(el)) {
      //只有不存在才push
      this.push(el)
    }
    return this
  },
  pushArray: function(arr) {
    return this.push.apply(this, toJson(arr))
  },
  remove: function(el) {
    //移除第一个等于给定值的元素
    return this.removeAt(this.indexOf(el))
  },
  removeAt: function(index) {
    index = index >>> 0
    //移除指定索引上的元素
    return this.splice(index, 1)
  },
  size: function() {
    //取得数组长度，这个函数可以同步视图，length不能
    return this._.length
  },
  removeAll: function(all) {
    //移除N个元素
    if (Array.isArray(all)) {
      for (var i = this.length - 1; i >= 0; i--) {
        if (all.indexOf(this[i]) !== -1) {
          _splice.call(this.$track, i, 1)
          _splice.call(this, i, 1)
        }
      }
    } else if (typeof all === 'function') {
      for (i = this.length - 1; i >= 0; i--) {
        var el = this[i]
        if (all(el, i)) {
          _splice.call(this.$track, i, 1)
          _splice.call(this, i, 1)
        }
      }
    } else {
      _splice.call(this.$track, 0, this.length)
      _splice.call(this, 0, this.length)
    }

    this.notify()
    this._.length = this.length
  },
  clear: function() {
    this.removeAll()
  }
}

var _splice = arrayProto.splice
arrayMethods.forEach(function(method) {
  var original = arrayProto[method]
  newProto[method] = function() {
    // 继续尝试劫持数组元素的属性
    var args = []
    for (var i = 0, n = arguments.length; i < n; i++) {
      args[i] = observe(arguments[i], 0, 1, 1)
    }
    var result = original.apply(this, args)
    addTrack(this.$track, method, args)

    this.notify()
    this._.length = this.length
    return result
  }
})

'sort,reverse'.replace(rword, function(method) {
  newProto[method] = function() {
    var oldArray = this.concat() //保持原来状态的旧数组
    var newArray = this
    var mask = Math.random()
    var indexes = []
    var hasSort = false
    arrayProto[method].apply(newArray, arguments) //排序
    for (var i = 0, n = oldArray.length; i < n; i++) {
      var neo = newArray[i]
      var old = oldArray[i]
      if (neo === old) {
        indexes.push(i)
      } else {
        var index = oldArray.indexOf(neo)
        indexes.push(index) //得到新数组的每个元素在旧数组对应的位置
        oldArray[index] = mask //屏蔽已经找过的元素
        hasSort = true
      }
    }
    if (hasSort) {
      sortByIndex(this.$track, indexes)

      this.notify()
    }
    return this
  }
})

function sortByIndex(array, indexes) {
  var map = {}
  for (var i = 0, n = indexes.length; i < n; i++) {
    map[i] = array[i]
    var j = indexes[i]
    if (j in map) {
      array[i] = map[j]
      delete map[j]
    } else {
      array[i] = array[j]
    }
  }
}

function createTrack(n) {
  var ret = []
  for (var i = 0; i < n; i++) {
    ret[i] = generateID('proxy-each')
  }
  return ret
}

function addTrack(track, method, args) {
  switch (method) {
    case 'push':
    case 'unshift':
      args = createTrack(args.length)
      break
    case 'splice':
      if (args.length > 2) {
        // 0, 5, a, b, c --> 0, 2, 0
        // 0, 5, a, b, c, d, e, f, g--> 0, 0, 3
        var del = args[1]
        var add = args.length - 2
        // args = [args[0], Math.max(del - add, 0)].concat(createTrack(Math.max(add - del, 0)))
        args = [args[0], args[1]].concat(createTrack(args.length - 2))
      }
      break
  }
  Array.prototype[method].apply(track, args)
}
/*********************************************************************
 *                           依赖调度系统                              *
 **********************************************************************/

//检测两个对象间的依赖关系
var dependencyDetection = (function() {
  var outerFrames = []
  var currentFrame
  return {
    begin: function(binding) {
      //accessorObject为一个拥有callback的对象
      outerFrames.push(currentFrame)
      currentFrame = binding
    },
    end: function() {
      currentFrame = outerFrames.pop()
    },
    collectDependency: function(array) {
      if (currentFrame) {
        //被dependencyDetection.begin调用
        currentFrame.callback(array)
      }
    }
  }
})()

//将绑定对象注入到其依赖项的订阅数组中
var roneval = /^on$/

function returnRandom() {
  return new Date() - 0
}

Anot.injectBinding = function(binding) {
  binding.handler = binding.handler || directives[binding.type].update || noop
  binding.update = function() {
    var begin = false
    if (!binding.getter) {
      begin = true
      dependencyDetection.begin({
        callback: function(array) {
          injectDependency(array, binding)
        }
      })

      binding.getter = parseExpr(binding.expr, binding.vmodels, binding)
      binding.observers.forEach(function(a) {
        a.v.$watch(a.p, binding)
      })
      delete binding.observers
    }
    try {
      var args = binding.fireArgs,
        a,
        b
      delete binding.fireArgs
      if (!args) {
        if (binding.type === 'on') {
          a = binding.getter + ''
        } else {
          try {
            a = binding.getter.apply(0, binding.args)
          } catch (e) {
            a = null
          }
        }
      } else {
        a = args[0]
        b = args[1]
      }
      b = typeof b === 'undefined' ? binding.oldValue : b
      if (binding._filters) {
        a = filters.$filter.apply(0, [a].concat(binding._filters))
      }
      if (binding.signature) {
        var xtype = Anot.type(a)
        if (xtype !== 'array' && xtype !== 'object') {
          throw Error('warning:' + binding.expr + '只能是对象或数组')
        }
        binding.xtype = xtype
        var vtrack = getProxyIds(binding.proxies || [], xtype)
        var mtrack =
          a.$track ||
          (xtype === 'array' ? createTrack(a.length) : Object.keys(a))
        binding.track = mtrack
        if (vtrack !== mtrack.join(';')) {
          binding.handler(a, b)
          binding.oldValue = 1
        }
      } else if (Array.isArray(a) ? a.length !== (b && b.length) : false) {
        binding.handler(a, b)
        binding.oldValue = a.concat()
      } else if (!('oldValue' in binding) || a !== b) {
        binding.handler(a, b)
        binding.oldValue = Array.isArray(a) ? a.concat() : a
      }
    } catch (e) {
      delete binding.getter
      log('warning:exception throwed in [Anot.injectBinding] ', e)
      var node = binding.element
      if (node && node.nodeType === 3) {
        node.nodeValue =
          openTag + (binding.oneTime ? '::' : '') + binding.expr + closeTag
      }
    } finally {
      begin && dependencyDetection.end()
    }
  }
  binding.update()
}

//将依赖项(比它高层的访问器或构建视图刷新函数的绑定对象)注入到订阅者数组
function injectDependency(list, binding) {
  if (binding.oneTime) return
  if (list && Anot.Array.ensure(list, binding) && binding.element) {
    injectDisposeQueue(binding, list)
    if (new Date() - beginTime > 444) {
      rejectDisposeQueue()
    }
  }
}

function getProxyIds(a, isArray) {
  var ret = []
  for (var i = 0, el; (el = a[i++]); ) {
    ret.push(isArray ? el.$id : el.$key)
  }
  return ret.join(';')
}
/*********************************************************************
 *                     定时GC回收机制 (基于1.6基于频率的GC)                *
 **********************************************************************/

var disposeQueue = (Anot.$$subscribers = [])
var beginTime = new Date()

//添加到回收列队中
function injectDisposeQueue(data, list) {
  data.list = list
  data.i = ~~data.i
  if (!data.uuid) {
    data.uuid = '_' + ++bindingID
  }
  if (!disposeQueue[data.uuid]) {
    disposeQueue[data.uuid] = '__'
    disposeQueue.push(data)
  }
}

var lastGCIndex = 0
function rejectDisposeQueue(data) {
  var i = lastGCIndex || disposeQueue.length
  var threshold = 0
  while ((data = disposeQueue[--i])) {
    if (data.i < 7) {
      if (data.element === null) {
        disposeQueue.splice(i, 1)
        if (data.list) {
          Anot.Array.remove(data.list, data)
          delete disposeQueue[data.uuid]
        }
        continue
      }
      if (shouldDispose(data.element)) {
        //如果它的虚拟DOM不在VTree上或其属性不在VM上
        disposeQueue.splice(i, 1)
        Anot.Array.remove(data.list, data)
        disposeData(data)
        //Anot会在每次全量更新时,比较上次执行时间,
        //假若距离上次有半秒,就会发起一次GC,并且只检测当中的500个绑定
        //而一个正常的页面不会超过2000个绑定(500即取其4分之一)
        //用户频繁操作页面,那么2,3秒内就把所有绑定检测一遍,将无效的绑定移除
        if (threshold++ > 500) {
          lastGCIndex = i
          break
        }
        continue
      }
      data.i++
      //基于检测频率，如果检测过7次，可以认为其是长久存在的节点，那么以后每7次才检测一次
      if (data.i === 7) {
        data.i = 14
      }
    } else {
      data.i--
    }
  }
  beginTime = new Date()
}

function disposeData(data) {
  delete disposeQueue[data.uuid] // 先清除，不然无法回收了
  data.element = null
  data.rollback && data.rollback()
  for (var key in data) {
    data[key] = null
  }
}

function shouldDispose(el) {
  try {
    //IE下，如果文本节点脱离DOM树，访问parentNode会报错
    var fireError = el.parentNode.nodeType
  } catch (e) {
    return true
  }
  if (el.ifRemove) {
    // 如果节点被放到ifGroup，才移除
    if (!root.contains(el.ifRemove) && ifGroup === el.parentNode) {
      el.parentNode && el.parentNode.removeChild(el)
      return true
    }
  }
  return el.msRetain
    ? 0
    : el.nodeType === 1
      ? !root.contains(el)
      : !Anot.contains(root, el)
}
/************************************************************************
 *              HTML处理(parseHTML, innerHTML, clearHTML)                *
 *************************************************************************/

//parseHTML的辅助变量
var tagHooks = new function() {
  // jshint ignore:line
  Anot.mix(this, {
    option: DOC.createElement('select'),
    thead: DOC.createElement('table'),
    td: DOC.createElement('tr'),
    area: DOC.createElement('map'),
    tr: DOC.createElement('tbody'),
    col: DOC.createElement('colgroup'),
    legend: DOC.createElement('fieldset'),
    _default: DOC.createElement('div'),
    g: DOC.createElementNS('http://www.w3.org/2000/svg', 'svg')
  })
  this.optgroup = this.option
  this.tbody = this.tfoot = this.colgroup = this.caption = this.thead
  this.th = this.td
}() // jshint ignore:line
String(
  'circle,defs,ellipse,image,line,path,polygon,polyline,rect,symbol,text,use'
).replace(rword, function(tag) {
  tagHooks[tag] = tagHooks.g //处理SVG
})

var rtagName = /<([\w:]+)/
var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi
var scriptTypes = oneObject([
  '',
  'text/javascript',
  'text/ecmascript',
  'application/ecmascript',
  'application/javascript'
])
var script = DOC.createElement('script')
var rhtml = /<|&#?\w+;/

Anot.parseHTML = function(html) {
  var fragment = anotFragment.cloneNode(false)
  if (typeof html !== 'string') {
    return fragment
  }
  if (!rhtml.test(html)) {
    fragment.appendChild(DOC.createTextNode(html))
    return fragment
  }
  html = html.replace(rxhtml, '<$1></$2>').trim()
  var tag = (rtagName.exec(html) || ['', ''])[1].toLowerCase(),
    //取得其标签名
    wrapper = tagHooks[tag] || tagHooks._default,
    firstChild
  wrapper.innerHTML = html
  var els = wrapper.getElementsByTagName('script')
  if (els.length) {
    //使用innerHTML生成的script节点不会发出请求与执行text属性
    for (var i = 0, el; (el = els[i++]); ) {
      if (scriptTypes[el.type]) {
        var neo = script.cloneNode(false) //FF不能省略参数
        ap.forEach.call(el.attributes, function(attr) {
          neo.setAttribute(attr.name, attr.value)
        }) // jshint ignore:line
        neo.text = el.text
        el.parentNode.replaceChild(neo, el)
      }
    }
  }

  while ((firstChild = wrapper.firstChild)) {
    // 将wrapper上的节点转移到文档碎片上！
    fragment.appendChild(firstChild)
  }
  return fragment
}

Anot.innerHTML = function(node, html) {
  var a = this.parseHTML(html)
  this.clearHTML(node).appendChild(a)
}

Anot.clearHTML = function(node) {
  node.textContent = ''
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
  return node
}
/*********************************************************************
 *                        Anot的原型方法定义区                       *
 **********************************************************************/

function hyphen(target) {
  //转换为连字符线风格
  return target.replace(/([a-z\d])([A-Z]+)/g, '$1-$2').toLowerCase()
}

function camelize(target) {
  //转换为驼峰风格
  if (target.indexOf('-') < 0 && target.indexOf('_') < 0) {
    return target //提前判断，提高getStyle等的效率
  }
  return target.replace(/[-_][^-_]/g, function(match) {
    return match.charAt(1).toUpperCase()
  })
}

'add,remove'.replace(rword, function(method) {
  Anot.fn[method + 'Class'] = function(cls) {
    var el = this[0]
    //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
    if (cls && typeof cls === 'string' && el && el.nodeType === 1) {
      cls.replace(/\S+/g, function(c) {
        el.classList[method](c)
      })
    }
    return this
  }
})

Anot.fn.mix({
  attr: function(name, value) {
    if (arguments.length === 2) {
      this[0].setAttribute(name, value)
      return this
    } else {
      return this[0].getAttribute(name)
    }
  },
  data: function(name, value) {
    var len = arguments.length
    var dataset = this[0].dataset
    name = hyphen(name || '')
    if (!name) {
      len = 0
    }
    switch (len) {
      case 2:
        dataset[name] = value
        return this
      case 1:
        var val = dataset[name]
        return parseData(val)
      case 0:
        var ret = createMap()
        for (var i in dataset) {
          ret[i] = parseData(dataset[i])
        }
        return ret
    }
  },
  removeData: function(name) {
    name = 'data-' + hyphen(name)
    this[0].removeAttribute(name)
    return this
  },
  css: function(name, value) {
    if (Anot.isPlainObject(name)) {
      for (var i in name) {
        Anot.css(this, i, name[i])
      }
    } else {
      var ret = Anot.css(this, name, value)
    }
    return ret !== void 0 ? ret : this
  },
  position: function() {
    var offsetParent,
      offset,
      elem = this[0],
      parentOffset = {
        top: 0,
        left: 0
      }
    if (!elem) {
      return
    }
    if (this.css('position') === 'fixed') {
      offset = elem.getBoundingClientRect()
    } else {
      offsetParent = this.offsetParent() //得到真正的offsetParent
      offset = this.offset() // 得到正确的offsetParent
      if (offsetParent[0].tagName !== 'HTML') {
        parentOffset = offsetParent.offset()
      }
      parentOffset.top += Anot.css(offsetParent[0], 'borderTopWidth', true)
      parentOffset.left += Anot.css(offsetParent[0], 'borderLeftWidth', true)
      // Subtract offsetParent scroll positions
      parentOffset.top -= offsetParent.scrollTop()
      parentOffset.left -= offsetParent.scrollLeft()
    }
    return {
      top: offset.top - parentOffset.top - Anot.css(elem, 'marginTop', true),
      left: offset.left - parentOffset.left - Anot.css(elem, 'marginLeft', true)
    }
  },
  offsetParent: function() {
    var offsetParent = this[0].offsetParent
    while (offsetParent && Anot.css(offsetParent, 'position') === 'static') {
      offsetParent = offsetParent.offsetParent
    }
    return Anot(offsetParent || root)
  },
  bind: function(type, fn, phase) {
    if (this[0]) {
      //此方法不会链
      return Anot.bind(this[0], type, fn, phase)
    }
  },
  unbind: function(type, fn, phase) {
    if (this[0]) {
      Anot.unbind(this[0], type, fn, phase)
    }
    return this
  },
  val: function(value) {
    var node = this[0]
    if (node && node.nodeType === 1) {
      var get = arguments.length === 0
      var access = get ? ':get' : ':set'
      var fn = valHooks[getValType(node) + access]
      if (fn) {
        var val = fn(node, value)
      } else if (get) {
        return (node.value || '').replace(/\r/g, '')
      } else {
        node.value = value
      }
    }
    return get ? val : this
  }
})

Anot.parseJSON = JSON.parse

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/
function parseData(data) {
  try {
    if (typeof data === 'object') return data
    data =
      data === 'true'
        ? true
        : data === 'false'
        ? false
        : data === 'null'
        ? null
        : +data + '' === data
        ? +data
        : rbrace.test(data)
        ? JSON.parse(data)
        : data
  } catch (e) {}
  return data
}

Anot.fireDom = function(elem, type, opts) {
  var hackEvent = DOC.createEvent('Events')
  hackEvent.initEvent(type, true, true)
  Anot.mix(hackEvent, opts)
  elem.dispatchEvent(hackEvent)
}

Anot.each(
  {
    scrollLeft: 'pageXOffset',
    scrollTop: 'pageYOffset'
  },
  function(method, prop) {
    Anot.fn[method] = function(val) {
      var node = this[0] || {},
        win = getWindow(node),
        top = method === 'scrollTop'
      if (!arguments.length) {
        return win ? win[prop] : node[method]
      } else {
        if (win) {
          win.scrollTo(!top ? val : win[prop], top ? val : win[prop])
        } else {
          node[method] = val
        }
      }
    }
  }
)

function getWindow(node) {
  return node.window && node.document
    ? node
    : node.nodeType === 9
    ? node.defaultView
    : false
}

//=============================css相关==================================

var cssHooks = (Anot.cssHooks = createMap())
var prefixes = ['', '-webkit-', '-moz-', '-ms-'] //去掉opera-15的支持
var cssMap = {
  float: 'cssFloat'
}

Anot.cssNumber = oneObject(
  'animationIterationCount,animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom'
)

Anot.cssName = function(name, host, camelCase) {
  if (cssMap[name]) {
    return cssMap[name]
  }
  host = host || root.style
  for (var i = 0, n = prefixes.length; i < n; i++) {
    camelCase = camelize(prefixes[i] + name)
    if (camelCase in host) {
      return (cssMap[name] = camelCase)
    }
  }
  return null
}

cssHooks['@:set'] = function(node, name, value) {
  node.style[name] = value
}

cssHooks['@:get'] = function(node, name) {
  if (!node || !node.style) {
    throw new Error('getComputedStyle要求传入一个节点 ' + node)
  }
  var ret,
    computed = getComputedStyle(node)
  if (computed) {
    ret = name === 'filter' ? computed.getPropertyValue(name) : computed[name]
    if (ret === '') {
      ret = node.style[name] //其他浏览器需要我们手动取内联样式
    }
  }
  return ret
}
cssHooks['opacity:get'] = function(node) {
  var ret = cssHooks['@:get'](node, 'opacity')
  return ret === '' ? '1' : ret
}

'top,left'.replace(rword, function(name) {
  cssHooks[name + ':get'] = function(node) {
    var computed = cssHooks['@:get'](node, name)
    return /px$/.test(computed) ? computed : Anot(node).position()[name] + 'px'
  }
})

var cssShow = {
  position: 'absolute',
  visibility: 'hidden',
  display: 'block'
}
var rdisplayswap = /^(none|table(?!-c[ea]).+)/
function showHidden(node, array) {
  //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
  if (node.offsetWidth <= 0) {
    //opera.offsetWidth可能小于0
    var styles = getComputedStyle(node, null)
    if (rdisplayswap.test(styles['display'])) {
      var obj = {
        node: node
      }
      for (var name in cssShow) {
        obj[name] = styles[name]
        node.style[name] = cssShow[name]
      }
      array.push(obj)
    }
    var _parent = node.parentNode
    if (_parent && _parent.nodeType === 1) {
      showHidden(_parent, array)
    }
  }
}

'Width,Height'.replace(rword, function(name) {
  //fix 481
  var method = name.toLowerCase(),
    clientProp = 'client' + name,
    scrollProp = 'scroll' + name,
    offsetProp = 'offset' + name
  cssHooks[method + ':get'] = function(node, which, override) {
    var boxSizing = -4
    if (typeof override === 'number') {
      boxSizing = override
    }
    which = name === 'Width' ? ['Left', 'Right'] : ['Top', 'Bottom']
    var ret = node[offsetProp] // border-box 0
    if (boxSizing === 2) {
      // margin-box 2
      return (
        ret +
        Anot.css(node, 'margin' + which[0], true) +
        Anot.css(node, 'margin' + which[1], true)
      )
    }
    if (boxSizing < 0) {
      // padding-box  -2
      ret =
        ret -
        Anot.css(node, 'border' + which[0] + 'Width', true) -
        Anot.css(node, 'border' + which[1] + 'Width', true)
    }
    if (boxSizing === -4) {
      // content-box -4
      ret =
        ret -
        Anot.css(node, 'padding' + which[0], true) -
        Anot.css(node, 'padding' + which[1], true)
    }
    return ret
  }
  cssHooks[method + '&get'] = function(node) {
    var hidden = []
    showHidden(node, hidden)
    var val = cssHooks[method + ':get'](node)
    for (var i = 0, obj; (obj = hidden[i++]); ) {
      node = obj.node
      for (var n in obj) {
        if (typeof obj[n] === 'string') {
          node.style[n] = obj[n]
        }
      }
    }
    return val
  }
  Anot.fn[method] = function(value) {
    //会忽视其display
    var node = this[0]
    if (arguments.length === 0) {
      if (node.setTimeout) {
        //取得窗口尺寸,IE9后可以用node.innerWidth /innerHeight代替
        return node['inner' + name]
      }
      if (node.nodeType === 9) {
        //取得页面尺寸
        var doc = node.documentElement
        //FF chrome    html.scrollHeight< body.scrollHeight
        //IE 标准模式 : html.scrollHeight> body.scrollHeight
        //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
        return Math.max(
          node.body[scrollProp],
          doc[scrollProp],
          node.body[offsetProp],
          doc[offsetProp],
          doc[clientProp]
        )
      }
      return cssHooks[method + '&get'](node)
    } else {
      return this.css(method, value)
    }
  }
  Anot.fn['inner' + name] = function() {
    return cssHooks[method + ':get'](this[0], void 0, -2)
  }
  Anot.fn['outer' + name] = function(includeMargin) {
    return cssHooks[method + ':get'](
      this[0],
      void 0,
      includeMargin === true ? 2 : 0
    )
  }
})

Anot.fn.offset = function() {
  //取得距离页面左右角的坐标
  var node = this[0]
  try {
    var rect = node.getBoundingClientRect()
    // Make sure element is not hidden (display: none) or disconnected
    // https://github.com/jquery/jquery/pull/2043/files#r23981494
    if (rect.width || rect.height || node.getClientRects().length) {
      var doc = node.ownerDocument
      var root = doc.documentElement
      var win = doc.defaultView
      return {
        top: rect.top + win.pageYOffset - root.clientTop,
        left: rect.left + win.pageXOffset - root.clientLeft
      }
    }
  } catch (e) {
    return {
      left: 0,
      top: 0
    }
  }
}

//=============================val相关=======================

function getValType(elem) {
  var ret = elem.tagName.toLowerCase()
  return ret === 'input' && /checkbox|radio/.test(elem.type) ? 'checked' : ret
}

var valHooks = {
  'select:get': function(node, value) {
    var option,
      options = node.options,
      index = node.selectedIndex,
      one = node.type === 'select-one' || index < 0,
      values = one ? null : [],
      max = one ? index + 1 : options.length,
      i = index < 0 ? max : one ? index : 0
    for (; i < max; i++) {
      option = options[i]
      //旧式IE在reset后不会改变selected，需要改用i === index判定
      //我们过滤所有disabled的option元素，但在safari5下，如果设置select为disable，那么其所有孩子都disable
      //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
      if ((option.selected || i === index) && !option.disabled) {
        value = option.value
        if (one) {
          return value
        }
        //收集所有selected值组成数组返回
        values.push(value)
      }
    }
    return values
  },
  'select:set': function(node, values, optionSet) {
    values = [].concat(values) //强制转换为数组
    for (var i = 0, el; (el = node.options[i++]); ) {
      if ((el.selected = values.indexOf(el.value) > -1)) {
        optionSet = true
      }
    }
    if (!optionSet) {
      node.selectedIndex = -1
    }
  }
}
var keyMap = {}
var keys = [
  'break,case,catch,continue,debugger,default,delete,do,else,false',
  'finally,for,function,if,in,instanceof,new,null,return,switch,this',
  'throw,true,try,typeof,var,void,while,with' /* 关键字*/,
  'abstract,boolean,byte,char,class,const,double,enum,export,extends',
  'final,float,goto,implements,import,int,interface,long,native',
  'package,private,protected,public,short,static,super,synchronized',
  'throws,transient,volatile' /*保留字*/,
  'arguments,let,yield,async,await,undefined'
].join(',')
keys.replace(/\w+/g, function(a) {
  keyMap[a] = true
})

var ridentStart = /[a-z_$]/i
var rwhiteSpace = /[\s\uFEFF\xA0]/
function getIdent(input, lastIndex) {
  var result = []
  var subroutine = !!lastIndex
  lastIndex = lastIndex || 0
  //将表达式中的标识符抽取出来
  var state = 'unknown'
  var variable = ''
  for (var i = 0; i < input.length; i++) {
    var c = input.charAt(i)
    if (c === "'" || c === '"') {
      //字符串开始
      if (state === 'unknown') {
        state = c
      } else if (state === c) {
        //字符串结束
        state = 'unknown'
      }
    } else if (c === '\\') {
      if (state === "'" || state === '"') {
        i++
      }
    } else if (ridentStart.test(c)) {
      //碰到标识符
      if (state === 'unknown') {
        state = 'variable'
        variable = c
      } else if (state === 'maybePath') {
        variable = result.pop()
        variable += '.' + c
        state = 'variable'
      } else if (state === 'variable') {
        variable += c
      }
    } else if (/\w/.test(c)) {
      if (state === 'variable') {
        variable += c
      }
    } else if (c === '.') {
      if (state === 'variable') {
        if (variable) {
          result.push(variable)
          variable = ''
          state = 'maybePath'
        }
      }
    } else if (c === '[') {
      if (state === 'variable' || state === 'maybePath') {
        if (variable) {
          //如果前面存在变量,收集它
          result.push(variable)
          variable = ''
        }
        var lastLength = result.length
        var last = result[lastLength - 1]
        var innerResult = getIdent(input.slice(i), i)
        if (innerResult.length) {
          //如果括号中存在变量,那么这里添加通配符
          result[lastLength - 1] = last + '.*'
          result = innerResult.concat(result)
        } else {
          //如果括号中的东西是确定的,直接转换为其子属性
          var content = input.slice(i + 1, innerResult.i)
          try {
            var text = scpCompile(['return ' + content])()
            result[lastLength - 1] = last + '.' + text
          } catch (e) {}
        }
        state = 'maybePath' //]后面可能还接东西
        i = innerResult.i
      }
    } else if (c === ']') {
      if (subroutine) {
        result.i = i + lastIndex
        addVar(result, variable)
        return result
      }
    } else if (rwhiteSpace.test(c) && c !== '\r' && c !== '\n') {
      if (state === 'variable') {
        if (addVar(result, variable)) {
          state = 'maybePath' // aaa . bbb 这样的情况
        }
        variable = ''
      }
    } else {
      addVar(result, variable)
      state = 'unknown'
      variable = ''
    }
  }
  addVar(result, variable)
  return result
}

function addVar(array, element) {
  if (element && !keyMap[element]) {
    array.push(element)
    return true
  }
}

function addAssign(vars, vmodel, name, binding) {
  var ret = []
  var prefix = ' = ' + name + '.'
  for (var i = vars.length, prop; (prop = vars[--i]); ) {
    var arr = prop.split('.')
    var first = arr[0]

    if (vmodel.hasOwnProperty(first)) {
      // log(first, prop, prefix, vmodel)
      ret.push(first + prefix + first)
      binding.observers.push({
        v: vmodel,
        p: prop,
        type: Anot.type(vmodel[first])
      })
      vars.splice(i, 1)
    }
  }
  return ret
}

var rproxy = /(proxy\-[a-z]+)\-[\-0-9a-f]+$/
var variablePool = new Cache(218)
//缓存求值函数，以便多次利用
var evaluatorPool = new Cache(128)

function getVars(expr) {
  expr = expr.trim()
  var ret = variablePool.get(expr)
  if (ret) {
    return ret.concat()
  }
  var array = getIdent(expr)
  var uniq = {}
  var result = []
  for (var i = 0, el; (el = array[i++]); ) {
    if (!uniq[el]) {
      uniq[el] = 1
      result.push(el)
    }
  }
  return variablePool.put(expr, result).concat()
}

function parseExpr(expr, vmodels, binding) {
  var filters = binding.filters
  if (typeof filters === 'string' && filters.trim() && !binding._filters) {
    binding._filters = parseFilter(filters.trim())
  }

  var vars = getVars(expr)
  var expose = new Date() - 0
  var assigns = []
  var names = []
  var args = []
  binding.observers = []

  for (var i = 0, sn = vmodels.length; i < sn; i++) {
    if (vars.length) {
      var name = 'vm' + expose + '_' + i
      names.push(name)
      args.push(vmodels[i])
      assigns.push.apply(assigns, addAssign(vars, vmodels[i], name, binding))
    }
  }
  binding.args = args
  var dataType = binding.type
  var exprId =
    vmodels.map(function(el) {
      return String(el.$id).replace(rproxy, '$1')
    }) +
    expr +
    dataType
  // log(expr, '---------------', assigns)
  var getter = evaluatorPool.get(exprId) //直接从缓存，免得重复生成
  if (getter) {
    if (dataType === 'duplex') {
      var setter = evaluatorPool.get(exprId + 'setter')
      binding.setter = setter.apply(setter, binding.args)
    }
    return (binding.getter = getter)
  }

  // expr的字段不可枚举时,补上一个随机变量, 避免抛出异常
  if (!assigns.length) {
    assigns.push('fix' + expose)
  }

  if (dataType === 'duplex') {
    var nameOne = {}
    assigns.forEach(function(a) {
      var arr = a.split('=')
      nameOne[arr[0].trim()] = arr[1].trim()
    })
    expr = expr.replace(/[\$\w]+/, function(a) {
      return nameOne[a] ? nameOne[a] : a
    })
    /* jshint ignore:start */
    var fn2 = scpCompile(
      names.concat(
        '"use strict";\n  return function(vvv){' + expr + ' = vvv\n}\n'
      )
    )
    /* jshint ignore:end */
    evaluatorPool.put(exprId + 'setter', fn2)
    binding.setter = fn2.apply(fn2, binding.args)
  }

  if (dataType === 'on') {
    //事件绑定
    if (expr.indexOf('(') === -1) {
      expr += '.call(' + names[names.length - 1] + ', $event)'
    } else {
      expr = expr.replace('(', '.call(' + names[names.length - 1] + ', ')
    }
    names.push('$event')
    expr = '\nreturn ' + expr + ';' //IE全家 Function("return ")出错，需要Function("return ;")
    var lastIndex = expr.lastIndexOf('\nreturn')
    var header = expr.slice(0, lastIndex)
    var footer = expr.slice(lastIndex)
    expr = header + '\n' + footer
  } else {
    // 对于非事件绑定的方法, 同样绑定到vm上
    binding.observers.forEach(function(it) {
      if (it.type === 'function') {
        // log(it, expr)
        var reg = new RegExp(it.p + '\\(([^)]*)\\)', 'g')
        expr = expr.replace(reg, function(s, m) {
          m = m.trim()
          return (
            it.p +
            '.call(' +
            names[names.length - 1] +
            (m ? ', ' + m : '') +
            ')'
          )
        })
      }
    })
    expr = '\nreturn ' + expr + ';' //IE全家 Function("return ")出错，需要Function("return ;")
  }

  /* jshint ignore:start */
  getter = scpCompile(
    names.concat(
      "'use strict';\ntry{\n  var " +
        assigns.join(',\n  ') +
        expr +
        '\n}catch(e){console.log(e)}'
    )
  )
  /* jshint ignore:end */

  return evaluatorPool.put(exprId, getter)
}

function normalizeExpr(code) {
  var hasExpr = rexpr.test(code) //比如:class="width{{w}}"的情况
  if (hasExpr) {
    var array = scanExpr(code)
    if (array.length === 1) {
      return array[0].expr
    }
    return array
      .map(function(el) {
        return el.type ? '(' + el.expr + ')' : quote(el.expr)
      })
      .join(' + ')
  } else {
    return code
  }
}

Anot.normalizeExpr = normalizeExpr
Anot.parseExprProxy = parseExpr

var rthimRightParentheses = /\)\s*$/
var rthimOtherParentheses = /\)\s*\|/g
var rquoteFilterName = /\|\s*([$\w]+)/g
var rpatchBracket = /"\s*\["/g
var rthimLeftParentheses = /"\s*\(/g
function parseFilter(filters) {
  filters =
    filters
      .replace(rthimRightParentheses, '') //处理最后的小括号
      .replace(rthimOtherParentheses, function() {
        //处理其他小括号
        return '],|'
      })
      .replace(rquoteFilterName, function(a, b) {
        //处理|及它后面的过滤器的名字
        return '[' + quote(b)
      })
      .replace(rpatchBracket, function() {
        return '"],["'
      })
      .replace(rthimLeftParentheses, function() {
        return '",'
      }) + ']'
  /* jshint ignore:start */
  return scpCompile(['return [' + filters + ']'])()
  /* jshint ignore:end */
}

/*********************************************************************
 *                          编译系统                                  *
 **********************************************************************/

var quote = JSON.stringify
/*********************************************************************
 *                           扫描系统                                 *
 **********************************************************************/

//http://www.w3.org/TR/html5/syntax.html#void-elements
var stopScan = oneObject(
  'area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,script,style,textarea'.toUpperCase()
)

function isRef(el) {
  return el.hasAttribute('ref') ? el.getAttribute('ref') : null
}

function checkScan(elem, callback, innerHTML) {
  var id = setTimeout(function() {
    var currHTML = elem.innerHTML
    clearTimeout(id)
    if (currHTML === innerHTML) {
      callback()
    } else {
      checkScan(elem, callback, currHTML)
    }
  })
}

function getBindingCallback(elem, name, vmodels) {
  var callback = elem.getAttribute(name)
  if (callback) {
    for (var i = 0, vm; (vm = vmodels[i++]); ) {
      if (vm.hasOwnProperty(callback) && typeof vm[callback] === 'function') {
        return vm[callback]
      }
    }
  }
}

function executeBindings(bindings, vmodels) {
  for (var i = 0, binding; (binding = bindings[i++]); ) {
    binding.vmodels = vmodels
    directives[binding.type].init(binding)

    Anot.injectBinding(binding)
    if (binding.getter && binding.element.nodeType === 1) {
      //移除数据绑定，防止被二次解析
      //chrome使用removeAttributeNode移除不存在的特性节点时会报错
      binding.element.removeAttribute(binding.name)
    }
  }
  bindings.length = 0
}

var roneTime = /^\s*::/
var rmsAttr = /:(\w+)-?(.*)|@(.*)/

var events = oneObject(
  'animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit'
)
var obsoleteAttrs = oneObject(
  'value,title,alt,checked,selected,disabled,readonly,loading,enabled,href,src'
)
function bindingSorter(a, b) {
  return a.priority - b.priority
}

var rnoCollect = /^(:\S+|data-\S+|on[a-z]+|style|class)$/
var filterTypes = ['html', 'text', 'attr', 'data']

function scanAttr(elem, vmodels, match) {
  var scanNode = true
  if (vmodels.length) {
    var attributes = elem.attributes
    var bindings = []
    var uniq = {}
    for (var i = 0, attr; (attr = attributes[i++]); ) {
      var name = attr.name
      if (uniq[name]) {
        //IE8下:for BUG
        continue
      }
      uniq[name] = 1
      if (attr.specified) {
        if ((match = name.match(rmsAttr))) {
          //如果是以指定前缀命名的
          var type = match[1]
          var param = match[2] || ''
          var eparam = match[3] || '' // 事件绑定的简写
          var value = attr.value
          if (obsoleteAttrs[type]) {
            param = type
            type = 'attr'
          }
          if (eparam) {
            param = eparam
            type = 'on'
          }
          if (directives[type]) {
            var newValue = value.replace(roneTime, '')
            var oneTime = value !== newValue
            var binding = {
              type: type,
              param: param,
              element: elem,
              name: name,
              expr: newValue,
              oneTime: oneTime,
              uuid: '_' + ++bindingID,
              priority:
                (directives[type].priority || type.charCodeAt(0) * 10) +
                (Number(param.replace(/\D/g, '')) || 0)
            }
            // 如果指令允许使用过滤器
            if (filterTypes.includes(type)) {
              var filters = getToken(value).filters
              binding.expr = binding.expr.replace(filters, '')
              binding.filters = filters
                .replace(rhasHtml, function() {
                  binding.type = 'html'
                  binding.group = 1
                  return ''
                })
                .trim() // jshint ignore:line
            } else if (type === 'duplex') {
              var hasDuplex = name
            } else if (name === ':if-loop') {
              binding.priority += 100
            } else if (name === ':attr-value') {
              var hasAttrValue = name
            }
            bindings.push(binding)
          }
        }
      }
    }
    if (bindings.length) {
      bindings.sort(bindingSorter)

      if (hasDuplex && hasAttrValue && elem.type === 'text') {
        log('warning!一个控件不能同时定义:attr-value与' + hasDuplex)
      }

      for (i = 0; (binding = bindings[i]); i++) {
        type = binding.type
        if (rnoscanAttrBinding.test(type)) {
          return executeBindings(bindings.slice(0, i + 1), vmodels)
        } else if (scanNode) {
          scanNode = !rnoscanNodeBinding.test(type)
        }
      }
      executeBindings(bindings, vmodels)
    }
  }
  if (scanNode && !stopScan[elem.tagName]) {
    scanNodeList(elem, vmodels) //扫描子孙元素
  }
}

var rnoscanAttrBinding = /^if|for$/
var rnoscanNodeBinding = /^html|include$/

function scanNodeList(elem, vmodels) {
  var nodes = Anot.slice(elem.childNodes)
  scanNodeArray(nodes, vmodels)
}

function scanNodeArray(nodes, vmodels) {
  function _delay_component(name) {
    setTimeout(function() {
      Anot.component(name)
    })
  }
  for (var i = 0, node; (node = nodes[i++]); ) {
    switch (node.nodeType) {
      case 1:
        var elem = node
        if (elem.parentNode && elem.parentNode.nodeType === 1) {
          // 非组件才检查 ref属性
          var ref = isRef(elem)
          if (ref && vmodels.length) {
            vmodels[0].$refs[ref] = elem
          }
        }

        scanTag(node, vmodels) //扫描元素节点

        if (node.msHasEvent) {
          Anot.fireDom(node, 'datasetchanged', {
            bubble: node.msHasEvent
          })
        }

        break
      case 3:
        if (rexpr.test(node.nodeValue)) {
          scanText(node, vmodels, i) //扫描文本节点
        }
        break
    }
  }
}

function scanTag(elem, vmodels) {
  //扫描顺序  skip(0) --> anot(1) --> :if(10) --> :for(90)
  //--> :if-loop(110) --> :attr(970) ...--> :duplex(2000)垫后
  var skip = elem.getAttribute('skip')
  var node = elem.getAttributeNode('anot')
  var vm = vmodels.concat()
  if (typeof skip === 'string') {
    return
  } else if (node) {
    var newVmodel = Anot.vmodels[node.value]
    var attrs = aslice.call(elem.attributes, 0)

    if (!newVmodel) {
      return
    }

    vm = [newVmodel]

    elem.removeAttribute(node.name) //removeAttributeNode不会刷新xx[anot]样式规则
    // 挂载VM对象到相应的元素上
    elem.__VM__ = newVmodel
    hideProperty(newVmodel, '$elem', elem)

    if (vmodels.length) {
      newVmodel.$up = vmodels[0]
      vmodels[0].$children.push(newVmodel)
      var props = {}
      attrs.forEach(function(attr) {
        if (/^:/.test(attr.name)) {
          var name = attr.name.match(rmsAttr)[1]
          var value = null
          if (!name || Anot.directives[name] || events[name]) {
            return
          }
          try {
            value = parseExpr(attr.value, vmodels, {}).apply(0, vmodels)
            value = toJson(value)
            elem.removeAttribute(attr.name)
            props[name] = value
          } catch (error) {
            log(
              'Props parse faild on (%s[class=%s]),',
              elem.nodeName,
              elem.className,
              attr,
              error + ''
            )
          }
        }
      })
      // 一旦设定了 props的类型, 就必须传入正确的值
      for (var k in newVmodel.props) {
        if (newVmodel.props[k] && newVmodel.props[k].type === 'PropsTypes') {
          if (newVmodel.props[k].check(props[k])) {
            newVmodel.props[k] = props[k]
            delete props[k]
          } else {
            console.error(
              new TypeError(
                'props.' +
                  k +
                  ' needs [' +
                  newVmodel.props[k].checkType +
                  '], but [' +
                  newVmodel.props[k].result +
                  '] given.'
              )
            )
          }
        }
      }
      Object.assign(newVmodel.props, props)
      props = undefined
    }
  }
  scanAttr(elem, vm) //扫描特性节点

  if (newVmodel) {
    setTimeout(function() {
      if (typeof newVmodel.$mounted === 'function') {
        newVmodel.$mounted()
      }
      delete newVmodel.$mounted
    })
  }
}
var rhasHtml = /\|\s*html(?:\b|$)/,
  r11a = /\|\|/g,
  rlt = /&lt;/g,
  rgt = /&gt;/g,
  rstringLiteral = /(['"])(\\\1|.)+?\1/g,
  rline = /\r?\n/g
function getToken(value) {
  if (value.indexOf('|') > 0) {
    var scapegoat = value.replace(rstringLiteral, function(_) {
      return Array(_.length + 1).join('1') // jshint ignore:line
    })
    var index = scapegoat.replace(r11a, '\u1122\u3344').indexOf('|') //干掉所有短路或
    if (index > -1) {
      return {
        type: 'text',
        filters: value.slice(index).trim(),
        expr: value.slice(0, index)
      }
    }
  }
  return {
    type: 'text',
    expr: value,
    filters: ''
  }
}

function scanExpr(str) {
  var tokens = [],
    value,
    start = 0,
    stop
  do {
    stop = str.indexOf(openTag, start)
    if (stop === -1) {
      break
    }
    value = str.slice(start, stop)
    if (value) {
      // {{ 左边的文本
      tokens.push({
        expr: value
      })
    }
    start = stop + openTag.length
    stop = str.indexOf(closeTag, start)
    if (stop === -1) {
      break
    }
    value = str.slice(start, stop)
    if (value) {
      //处理{{ }}插值表达式
      tokens.push(getToken(value.replace(rline, '')))
    }
    start = stop + closeTag.length
  } while (1)
  value = str.slice(start)
  if (value) {
    //}} 右边的文本
    tokens.push({
      expr: value
    })
  }
  return tokens
}

function scanText(textNode, vmodels, index) {
  var bindings = [],
    tokens = scanExpr(textNode.data)
  if (tokens.length) {
    for (var i = 0, token; (token = tokens[i++]); ) {
      var node = DOC.createTextNode(token.expr) //将文本转换为文本节点，并替换原来的文本节点
      if (token.type) {
        token.expr = token.expr.replace(roneTime, function() {
          token.oneTime = true
          return ''
        }) // jshint ignore:line
        token.element = node
        token.filters = token.filters.replace(rhasHtml, function() {
          token.type = 'html'
          return ''
        }) // jshint ignore:line
        token.pos = index * 1000 + i
        bindings.push(token) //收集带有插值表达式的文本
      }
      anotFragment.appendChild(node)
    }
    textNode.parentNode.replaceChild(anotFragment, textNode)
    if (bindings.length) executeBindings(bindings, vmodels)
  }
}
//使用来自游戏界的双缓冲技术,减少对视图的冗余刷新
var Buffer = function() {
  this.queue = []
}
Buffer.prototype = {
  render: function(isAnimate) {
    if (!this.locked) {
      this.locked = isAnimate ? root.offsetHeight + 10 : 1
      var me = this
      Anot.nextTick(function() {
        me.flush()
      })
    }
  },
  flush: function() {
    for (var i = 0, sub; (sub = this.queue[i++]); ) {
      sub.update && sub.update()
    }
    this.locked = 0
    this.queue = []
  }
}

var buffer = new Buffer()


var bools = [
  'autofocus,autoplay,async,allowTransparency,checked,controls',
  'declare,disabled,defer,defaultChecked,defaultSelected',
  'contentEditable,isMap,loop,multiple,noHref,noResize,noShade',
  'open,readOnly,selected'
].join(',')
var boolMap = {}
bools.replace(rword, function(name) {
  boolMap[name.toLowerCase()] = name
})

var attrDir = Anot.directive('attr', {
  init: function(binding) {
    //{{aaa}} --> aaa
    //{{aaa}}/bbb.html --> (aaa) + "/bbb.html"
    binding.expr = normalizeExpr(binding.expr.trim())
    if (binding.type === 'include') {
      var elem = binding.element
      effectBinding(elem, binding)
      binding.includeRendered = getBindingCallback(
        elem,
        'data-rendered',
        binding.vmodels
      )
      binding.includeLoaded = getBindingCallback(
        elem,
        'data-loaded',
        binding.vmodels
      )
      // 是否直接替换当前容器
      var outer = (binding.includeReplace = elem.hasAttribute('replace'))
      if (elem.hasAttribute('cache')) {
        binding.templateCache = {}
      }
      binding.start = DOC.createComment(':include')
      binding.end = DOC.createComment(':include-end')
      if (outer) {
        binding.element = binding.end
        binding._element = elem
        elem.parentNode.insertBefore(binding.start, elem)
        elem.parentNode.insertBefore(binding.end, elem.nextSibling)
      } else {
        elem.insertBefore(binding.start, elem.firstChild)
        elem.appendChild(binding.end)
      }
    }
  },
  update: function(val) {
    var elem = this.element
    var obj = {}

    val = toJson(val)

    if (this.param) {
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          obj[this.param] = val
        } else {
          if (Date.isDate(val)) {
            obj[this.param] = val.toISOString()
          } else {
            obj[this.param] = val
          }
        }
      } else {
        obj[this.param] = val
      }
    } else {
      if (
        !val ||
        typeof val !== 'object' ||
        Array.isArray(val) ||
        Date.isDate(val)
      ) {
        return
      }

      obj = val
    }

    for (var i in obj) {
      if (i === 'style') {
        elem.style.cssText = obj[i]
        continue
      }
      if (i === 'href' || i === 'src') {
        elem[i] = obj[i]
      } else {
        // 修正这些值的显示
        if (obj[i] === false || obj[i] === null || obj[i] === undefined) {
          obj[i] = ''
        }

        if (
          typeof elem[i] === 'boolean' ||
          typeof elem[boolMap[i]] === 'boolean'
        ) {
          var k = i
          if (boolMap[i] && k !== boolMap[i]) {
            k = boolMap[i]
          }
          //布尔属性必须使用el.xxx = true|false方式设值
          obj[i] = !!obj[i]
          elem[k] = obj[i]

          if (!obj[i]) {
            elem.removeAttribute(k)
            continue
          }
        }

        //SVG只能使用setAttribute(xxx, yyy), HTML的固有属性必须elem.xxx = yyy
        var isInnate = rsvg.test(elem) ? false : i in elem.cloneNode(false)
        if (isInnate) {
          elem[i] = obj[i]
        } else {
          if (typeof obj[i] === 'object') {
            obj[i] = Date.isDate(obj[i])
              ? obj[i].toISOString()
              : JSON.stringify(obj[i])
          }
          elem.setAttribute(i, obj[i])
        }
      }
    }
  }
})
//类名定义  :class="{xx: yy}" :class="xx"
Anot.directive('class', {
  init: function(binding) {
    binding.expr = binding.expr.replace(/\n/g, ' ').replace(/\s+/g, ' ')

    if (binding.type === 'hover' || binding.type === 'active') {
      var expr = new Function('return ' + binding.expr)()

      //确保只绑定一次
      if (!binding.hasBindEvent) {
        var elem = binding.element
        var $elem = Anot(elem)
        var activate = 'mouseenter' //在移出移入时切换类名
        var abandon = 'mouseleave'
        if (binding.type === 'active') {
          //在聚焦失焦中切换类名
          elem.tabIndex = elem.tabIndex || -1
          activate = 'mousedown'
          abandon = 'mouseup'
          var fn0 = $elem.bind('mouseleave', function() {
            $elem.removeClass(expr)
          })
        }
      }

      var fn1 = $elem.bind(activate, function() {
        $elem.addClass(expr)
      })
      var fn2 = $elem.bind(abandon, function() {
        $elem.removeClass(expr)
      })
      binding.rollback = function() {
        $elem.unbind('mouseleave', fn0)
        $elem.unbind(activate, fn1)
        $elem.unbind(abandon, fn2)
      }
      binding.hasBindEvent = true
    }
  },
  update: function(val) {
    if (this.type !== 'class') {
      return
    }
    var obj = val
    if (!obj || this.param)
      return log(
        'class指令语法错误 %c %s="%s"',
        'color:#f00',
        this.name,
        this.expr
      )

    if (typeof obj === 'string') {
      obj = {}
      obj[val] = true
    }

    if (!Anot.isPlainObject(obj)) {
      obj = obj.$model
    }

    for (var i in obj) {
      this.element.classList.toggle(i, !!obj[i])
    }
  }
})

'hover,active'.replace(rword, function(name) {
  directives[name] = directives['class']
})
//样式定义 :css-width="200"
//:css="{width: 200}"
Anot.directive('css', {
  init: directives.attr.init,
  update: function(val) {
    var $elem = Anot(this.element)
    if (this.param) {
      $elem.css(this.param, val)
    } else {
      if (typeof val !== 'object') {
        return log(
          ':css指令格式错误 %c %s="%s"',
          'color:#f00',
          this.name,
          this.expr
        )
      }
      var obj = val
      if (!Anot.isPlainObject(obj)) {
        obj = val.$model
      }
      $elem.css(obj)
    }
  }
})
//兼容2种写法 :data-xx="yy", :data="{xx: yy}"
Anot.directive('data', {
  priority: 100,
  init: directives.attr.init,
  update: function(val) {
    var $el = Anot(this.element)
    if (this.param) {
      $el.data(this.param, val)
    } else {
      if (typeof val !== 'object') {
        return log(
          ':data指令格式错误 %c %s="%s"',
          'color:#f00',
          this.name,
          this.expr
        )
      }
      var obj = val
      if (!Anot.isPlainObject(obj)) {
        obj = val.$model
      }
      for (var i in obj) {
        $el.data(i, obj[i])
      }
    }
  }
})
//双工绑定
var rduplexType = /^(?:checkbox|radio)$/
var rduplexParam = /^(?:radio|checked)$/
var rnoduplexInput = /^(file|button|reset|submit|checkbox|radio|range)$/
var duplexBinding = Anot.directive('duplex', {
  priority: 2000,
  init: function(binding, hasCast) {
    var elem = binding.element
    var vmodels = binding.vmodels
    binding.changed = getBindingCallback(elem, 'data-changed', vmodels) || noop
    var params = []
    var casting = oneObject('string,number,boolean,checked')
    if (elem.type === 'radio' && binding.param === '') {
      binding.param = 'checked'
    }

    binding.param.replace(rw20g, function(name) {
      if (rduplexType.test(elem.type) && rduplexParam.test(name)) {
        name = 'checked'
        binding.isChecked = true
        binding.xtype = 'radio'
      }

      if (casting[name]) {
        hasCast = true
      }
      Anot.Array.ensure(params, name)
    })
    if (!hasCast) {
      params.push('string')
    }
    binding.param = params.join('-')
    if (!binding.xtype) {
      binding.xtype =
        elem.tagName === 'SELECT'
          ? 'select'
          : elem.type === 'checkbox'
          ? 'checkbox'
          : elem.type === 'radio'
          ? 'radio'
          : /^change/.test(elem.getAttribute('data-event'))
          ? 'change'
          : 'input'
    }
    elem.expr = binding.expr
    //===================绑定事件======================
    var bound = (binding.bound = function(type, callback) {
      elem.addEventListener(type, callback, false)
      var old = binding.rollback
      binding.rollback = function() {
        elem.anotSetter = null
        Anot.unbind(elem, type, callback)
        old && old()
      }
    })
    function callback(value) {
      binding.changed.call(this, value)
    }
    var composing = false
    function compositionStart() {
      composing = true
    }
    function compositionEnd() {
      composing = false
      setTimeout(updateVModel)
    }
    var updateVModel = function(e) {
      var val = elem.value
      //防止递归调用形成死循环
      //处理中文输入法在minlengh下引发的BUG
      if (composing || val === binding.oldValue || binding.pipe === null) {
        return
      }

      var lastValue = binding.pipe(
        val,
        binding,
        'get'
      )
      binding.oldValue = val
      binding.setter(lastValue)

      callback.call(elem, lastValue)
      Anot.fireDom(elem, 'change')
    }
    switch (binding.xtype) {
      case 'radio':
        bound('click', function() {
          var lastValue = binding.pipe(
            elem.value,
            binding,
            'get'
          )
          binding.setter(lastValue)
          callback.call(elem, lastValue)
        })
        break
      case 'checkbox':
        bound('change', function() {
          var method = elem.checked ? 'ensure' : 'remove'
          var array = binding.getter.apply(0, binding.vmodels)
          if (!Array.isArray(array)) {
            log(':duplex应用于checkbox上要对应一个数组')
            array = [array]
          }
          var val = binding.pipe(
            elem.value,
            binding,
            'get'
          )
          Anot.Array[method](array, val)
          callback.call(elem, array)
        })
        break
      case 'change':
        bound('change', updateVModel)
        break
      case 'input':
        bound('input', updateVModel)
        bound('keyup', updateVModel)
        bound('compositionstart', compositionStart)
        bound('compositionend', compositionEnd)
        bound('DOMAutoComplete', updateVModel)
        break
      case 'select':
        bound('change', function() {
          var val = Anot(elem).val() //字符串或字符串数组
          if (Array.isArray(val)) {
            val = val.map(function(v) {
              return binding.pipe(
                v,
                binding,
                'get'
              )
            })
          } else {
            val = binding.pipe(
              val,
              binding,
              'get'
            )
          }
          if (val + '' !== binding.oldValue) {
            try {
              binding.setter(val)
            } catch (ex) {
              log(ex)
            }
          }
        })
        bound('datasetchanged', function(e) {
          if (e.bubble === 'selectDuplex') {
            var value = binding._value
            var curValue = Array.isArray(value) ? value.map(String) : value + ''
            Anot(elem).val(curValue)
            elem.oldValue = curValue + ''
            callback.call(elem, curValue)
          }
        })
        break
    }
    if (binding.xtype === 'input' && !rnoduplexInput.test(elem.type)) {
      if (elem.type !== 'hidden') {
        bound('focus', function() {
          elem.msFocus = true
        })
        bound('blur', function() {
          elem.msFocus = false
        })
      }
      elem.anotSetter = updateVModel //#765
      watchValueInTimer(function() {
        if (root.contains(elem)) {
          if (!elem.msFocus) {
            updateVModel()
          }
        } else if (!elem.msRetain) {
          return false
        }
      })
    }
  },
  update: function(value) {
    var elem = this.element,
      binding = this,
      curValue
    if (!this.init) {
      var cpipe = binding.pipe || (binding.pipe = pipe)
      cpipe(null, binding, 'init')
      this.init = 1
    }
    switch (this.xtype) {
      case 'input':
        elem.value = value
        break
      case 'change':
        curValue = this.pipe(
          value,
          this,
          'set'
        ) //fix #673
        if (curValue !== this.oldValue) {
          var fixCaret = false
          if (elem.msFocus) {
            try {
              var start = elem.selectionStart
              var end = elem.selectionEnd
              if (start === end) {
                var pos = start
                fixCaret = true
              }
            } catch (e) {}
          }
          elem.value = this.oldValue = curValue
          if (fixCaret && !elem.readOnly) {
            elem.selectionStart = elem.selectionEnd = pos
          }
        }
        break
      case 'radio':
        curValue = binding.isChecked ? !!value : value + '' === elem.value
        elem.checked = curValue
        break
      case 'checkbox':
        var array = [].concat(value) //强制转换为数组
        curValue = this.pipe(
          elem.value,
          this,
          'get'
        )
        elem.checked = array.indexOf(curValue) > -1
        break
      case 'select':
        //必须变成字符串后才能比较
        binding._value = value
        if (!elem.msHasEvent) {
          elem.msHasEvent = 'selectDuplex'
          //必须等到其孩子准备好才触发
        } else {
          Anot.fireDom(elem, 'datasetchanged', {
            bubble: elem.msHasEvent
          })
        }
        break
    }
  }
})

function fixNull(val) {
  return val == null ? '' : val
}
Anot.duplexHooks = {
  checked: {
    get: function(val, binding) {
      return !binding.oldValue
    }
  },
  string: {
    get: function(val) {
      //同步到VM
      return val
    },
    set: fixNull
  },
  boolean: {
    get: function(val) {
      return val === 'true'
    },
    set: fixNull
  },
  number: {
    get: function(val, binding) {
      var number = +val
      if (+val === number) {
        return number
      }
      return 0
    },
    set: fixNull
  }
}

function pipe(val, binding, action, e) {
  binding.param.replace(rw20g, function(name) {
    var hook = Anot.duplexHooks[name]
    if (hook && typeof hook[action] === 'function') {
      val = hook[action](val, binding)
    }
  })
  return val
}

var TimerID,
  ribbon = []

Anot.tick = function(fn) {
  if (ribbon.push(fn) === 1) {
    TimerID = setInterval(ticker, 60)
  }
}

function ticker() {
  for (var n = ribbon.length - 1; n >= 0; n--) {
    var el = ribbon[n]
    if (el() === false) {
      ribbon.splice(n, 1)
    }
  }
  if (!ribbon.length) {
    clearInterval(TimerID)
  }
}

var watchValueInTimer = noop
new function() {
  // jshint ignore:line
  try {
    //#272 IE9-IE11, firefox
    var setters = {}
    var aproto = HTMLInputElement.prototype
    var bproto = HTMLTextAreaElement.prototype
    function newSetter(value) {
      // jshint ignore:line
      setters[this.tagName].call(this, value)
      if (!this.msFocus && this.anotSetter) {
        this.anotSetter()
      }
    }
    var inputProto = HTMLInputElement.prototype
    Object.getOwnPropertyNames(inputProto) //故意引发IE6-8等浏览器报错
    setters['INPUT'] = Object.getOwnPropertyDescriptor(aproto, 'value').set

    Object.defineProperty(aproto, 'value', {
      set: newSetter
    })
    setters['TEXTAREA'] = Object.getOwnPropertyDescriptor(bproto, 'value').set
    Object.defineProperty(bproto, 'value', {
      set: newSetter
    })
  } catch (e) {
    //在chrome 43中 :duplex终于不需要使用定时器实现双向绑定了
    // http://updates.html5rocks.com/2015/04/DOM-attributes-now-on-the-prototype
    // https://docs.google.com/document/d/1jwA8mtClwxI-QJuHT7872Z0pxpZz8PBkf2bGAbsUtqs/edit?pli=1
    watchValueInTimer = Anot.tick
  }
}() // jshint ignore:line
/*-------------动画------------*/

Anot.directive('effect', {
  priority: 5,
  init: function(binding) {
    var text = binding.expr,
      className,
      rightExpr
    var colonIndex = text
      .replace(rexprg, function(a) {
        return a.replace(/./g, '0')
      })
      .indexOf(':') //取得第一个冒号的位置
    if (colonIndex === -1) {
      // 比如 :class/effect="aaa bbb ccc" 的情况
      className = text
      rightExpr = true
    } else {
      // 比如 :class/effect-1="ui-state-active:checked" 的情况
      className = text.slice(0, colonIndex)
      rightExpr = text.slice(colonIndex + 1)
    }
    if (!rexpr.test(text)) {
      className = quote(className)
    } else {
      className = normalizeExpr(className)
    }
    binding.expr = '[' + className + ',' + rightExpr + ']'
  },
  update: function(arr) {
    var name = arr[0]
    var elem = this.element
    if (elem.getAttribute('data-effect-name') === name) {
      return
    } else {
      elem.removeAttribute('data-effect-driver')
    }
    var inlineStyles = elem.style
    var computedStyles = window.getComputedStyle
      ? window.getComputedStyle(elem)
      : null
    var useAni = false
    if (computedStyles && (supportTransition || supportAnimation)) {
      //如果支持CSS动画
      var duration =
        inlineStyles[transitionDuration] || computedStyles[transitionDuration]
      if (duration && duration !== '0s') {
        elem.setAttribute('data-effect-driver', 't')
        useAni = true
      }

      if (!useAni) {
        duration =
          inlineStyles[animationDuration] || computedStyles[animationDuration]
        if (duration && duration !== '0s') {
          elem.setAttribute('data-effect-driver', 'a')
          useAni = true
        }
      }
    }

    if (!useAni) {
      if (Anot.effects[name]) {
        elem.setAttribute('data-effect-driver', 'j')
        useAni = true
      }
    }
    if (useAni) {
      elem.setAttribute('data-effect-name', name)
    }
  }
})

Anot.effects = {}
Anot.effect = function(name, callbacks) {
  Anot.effects[name] = callbacks
}

var supportTransition = false
var supportAnimation = false

var transitionEndEvent
var animationEndEvent
var transitionDuration = Anot.cssName('transition-duration')
var animationDuration = Anot.cssName('animation-duration')
new function() {
  // jshint ignore:line
  var checker = {
    TransitionEvent: 'transitionend',
    WebKitTransitionEvent: 'webkitTransitionEnd',
    OTransitionEvent: 'oTransitionEnd',
    otransitionEvent: 'otransitionEnd'
  }
  var tran
  //有的浏览器同时支持私有实现与标准写法，比如webkit支持前两种，Opera支持1、3、4
  for (var name in checker) {
    if (window[name]) {
      tran = checker[name]
      break
    }
    try {
      var a = document.createEvent(name)
      tran = checker[name]
      break
    } catch (e) {}
  }
  if (typeof tran === 'string') {
    supportTransition = true
    transitionEndEvent = tran
  }

  //大致上有两种选择
  //IE10+, Firefox 16+ & Opera 12.1+: animationend
  //Chrome/Safari: webkitAnimationEnd
  //http://blogs.msdn.com/b/davrous/archive/2011/12/06/introduction-to-css3-animat ions.aspx
  //IE10也可以使用MSAnimationEnd监听，但是回调里的事件 type依然为animationend
  //  el.addEventListener("MSAnimationEnd", function(e) {
  //     alert(e.type)// animationend！！！
  // })
  checker = {
    AnimationEvent: 'animationend',
    WebKitAnimationEvent: 'webkitAnimationEnd'
  }
  var ani
  for (name in checker) {
    if (window[name]) {
      ani = checker[name]
      break
    }
  }
  if (typeof ani === 'string') {
    supportTransition = true
    animationEndEvent = ani
  }
}()

var effectPool = [] //重复利用动画实例
function effectFactory(el, opts) {
  if (!el || el.nodeType !== 1) {
    return null
  }
  if (opts) {
    var name = opts.effectName
    var driver = opts.effectDriver
  } else {
    name = el.getAttribute('data-effect-name')
    driver = el.getAttribute('data-effect-driver')
  }
  if (!name || !driver) {
    return null
  }

  var instance = effectPool.pop() || new Effect()
  instance.el = el
  instance.driver = driver
  instance.useCss = driver !== 'j'
  if (instance.useCss) {
    opts && Anot(el).addClass(opts.effectClass)
    instance.cssEvent = driver === 't' ? transitionEndEvent : animationEndEvent
  }
  instance.name = name
  instance.callbacks = Anot.effects[name] || {}

  return instance
}

function effectBinding(elem, binding) {
  var name = elem.getAttribute('data-effect-name')
  if (name) {
    binding.effectName = name
    binding.effectDriver = elem.getAttribute('data-effect-driver')
    var stagger = +elem.getAttribute('data-effect-stagger')
    binding.effectLeaveStagger =
      +elem.getAttribute('data-effect-leave-stagger') || stagger
    binding.effectEnterStagger =
      +elem.getAttribute('data-effect-enter-stagger') || stagger
    binding.effectClass = elem.className || NaN
  }
}
function upperFirstChar(str) {
  return str.replace(/^[\S]/g, function(m) {
    return m.toUpperCase()
  })
}
var effectBuffer = new Buffer()
function Effect() {} //动画实例,做成类的形式,是为了共用所有原型方法

Effect.prototype = {
  contrustor: Effect,
  enterClass: function() {
    return getEffectClass(this, 'enter')
  },
  leaveClass: function() {
    return getEffectClass(this, 'leave')
  },
  // 共享一个函数
  actionFun: function(name, before, after) {
    if (document.hidden) {
      return
    }
    var me = this
    var el = me.el
    var isLeave = name === 'leave'
    name = isLeave ? 'leave' : 'enter'
    var oppositeName = isLeave ? 'enter' : 'leave'
    callEffectHook(me, 'abort' + upperFirstChar(oppositeName))
    callEffectHook(me, 'before' + upperFirstChar(name))
    if (!isLeave) before(el) //这里可能做插入DOM树的操作,因此必须在修改类名前执行
    var cssCallback = function(cancel) {
      el.removeEventListener(me.cssEvent, me.cssCallback)
      if (isLeave) {
        before(el) //这里可能做移出DOM树操作,因此必须位于动画之后
        Anot(el).removeClass(me.cssClass)
      } else {
        if (me.driver === 'a') {
          Anot(el).removeClass(me.cssClass)
        }
      }
      if (cancel !== true) {
        callEffectHook(me, 'after' + upperFirstChar(name))
        after && after(el)
      }
      me.dispose()
    }
    if (me.useCss) {
      if (me.cssCallback) {
        //如果leave动画还没有完成,立即完成
        me.cssCallback(true)
      }

      me.cssClass = getEffectClass(me, name)
      me.cssCallback = cssCallback

      me.update = function() {
        el.addEventListener(me.cssEvent, me.cssCallback)
        if (!isLeave && me.driver === 't') {
          //transtion延迟触发
          Anot(el).removeClass(me.cssClass)
        }
      }
      Anot(el).addClass(me.cssClass) //animation会立即触发

      effectBuffer.render(true)
      effectBuffer.queue.push(me)
    } else {
      callEffectHook(me, name, cssCallback)
    }
  },
  enter: function(before, after) {
    this.actionFun.apply(this, ['enter'].concat(Anot.slice(arguments)))
  },
  leave: function(before, after) {
    this.actionFun.apply(this, ['leave'].concat(Anot.slice(arguments)))
  },
  dispose: function() {
    //销毁与回收到池子中
    this.update = this.cssCallback = null
    if (effectPool.unshift(this) > 100) {
      effectPool.pop()
    }
  }
}

function getEffectClass(instance, type) {
  var a = instance.callbacks[type + 'Class']
  if (typeof a === 'string') return a
  if (typeof a === 'function') return a()
  return instance.name + '-' + type
}

function callEffectHook(effect, name, cb) {
  var hook = effect.callbacks[name]
  if (hook) {
    hook.call(effect, effect.el, cb)
  }
}

var applyEffect = function(el, dir /*[before, [after, [opts]]]*/) {
  var args = aslice.call(arguments, 0)
  if (typeof args[2] !== 'function') {
    args.splice(2, 0, noop)
  }
  if (typeof args[3] !== 'function') {
    args.splice(3, 0, noop)
  }
  var before = args[2]
  var after = args[3]
  var opts = args[4]
  var effect = effectFactory(el, opts)
  if (!effect) {
    before()
    after()
    return false
  } else {
    var method = dir ? 'enter' : 'leave'
    effect[method](before, after)
  }
}

Anot.mix(Anot.effect, {
  apply: applyEffect,
  append: function(el, _parent, after, opts) {
    return applyEffect(
      el,
      1,
      function() {
        _parent.appendChild(el)
      },
      after,
      opts
    )
  },
  before: function(el, target, after, opts) {
    return applyEffect(
      el,
      1,
      function() {
        target.parentNode.insertBefore(el, target)
      },
      after,
      opts
    )
  },
  remove: function(el, _parent, after, opts) {
    return applyEffect(
      el,
      0,
      function() {
        if (el.parentNode === _parent) _parent.removeChild(el)
      },
      after,
      opts
    )
  }
})
Anot.directive('html', {
  update: function(val) {
    var binding = this
    var elem = this.element
    var isHtmlFilter = elem.nodeType !== 1
    var _parent = isHtmlFilter ? elem.parentNode : elem
    if (!_parent) return
    val = val == null ? '' : val

    if (elem.nodeType === 3) {
      var signature = generateID('html')
      _parent.insertBefore(DOC.createComment(signature), elem)
      binding.element = DOC.createComment(signature + ':end')
      _parent.replaceChild(binding.element, elem)
      elem = binding.element
    }
    if (typeof val !== 'object') {
      //string, number, boolean
      var fragment = Anot.parseHTML(String(val))
    } else if (val.nodeType === 11) {
      //将val转换为文档碎片
      fragment = val
    } else if (val.nodeType === 1 || val.item) {
      var nodes = val.nodeType === 1 ? val.childNodes : val.item
      fragment = anotFragment.cloneNode(true)
      while (nodes[0]) {
        fragment.appendChild(nodes[0])
      }
    }

    nodes = Anot.slice(fragment.childNodes)
    //插入占位符, 如果是过滤器,需要有节制地移除指定的数量,如果是html指令,直接清空
    if (isHtmlFilter) {
      var endValue = elem.nodeValue.slice(0, -4)
      while (true) {
        var node = elem.previousSibling
        if (!node || (node.nodeType === 8 && node.nodeValue === endValue)) {
          break
        } else {
          _parent.removeChild(node)
        }
      }
      _parent.insertBefore(fragment, elem)
    } else {
      Anot.clearHTML(elem).appendChild(fragment)
    }
    scanNodeArray(nodes, binding.vmodels)
  }
})
Anot.directive('text', {
  update: function(val) {
    var elem = this.element
    val = val == null ? '' : val //不在页面上显示undefined null
    if (elem.nodeType === 3) {
      //绑定在文本节点上
      try {
        //IE对游离于DOM树外的节点赋值会报错
        elem.data = val
      } catch (e) {}
    } else {
      //绑定在特性节点上
      elem.textContent = val
    }
  }
})
Anot.directive('if', {
  priority: 10,
  update: function(val) {
    var binding = this
    var elem = this.element
    var stamp = (binding.stamp = Date.now())
    var par
    var after = function() {
      if (stamp !== binding.stamp) {
        return
      }
      binding.recoverNode = null
    }
    if (binding.recoverNode) {
      binding.recoverNode() // 还原现场，有移动节点的都需要还原现场
    }

    try {
      if (!elem.parentNode) return
      par = elem.parentNode
    } catch (e) {
      return
    }
    if (val) {
      //插回DOM树
      function alway() {
        // jshint ignore:line
        if (elem.getAttribute(binding.name)) {
          elem.removeAttribute(binding.name)
          scanAttr(elem, binding.vmodels)
        }
        binding.rollback = null
      }
      if (elem.nodeType === 8) {
        var keep = binding.keep
        var hasEffect = Anot.effect.apply(
          keep,
          1,
          function() {
            if (stamp !== binding.stamp) return
            elem.parentNode.replaceChild(keep, elem)
            elem = binding.element = keep //这时可能为null
            if (keep.getAttribute('_required')) {
              //#1044
              elem.required = true
              elem.removeAttribute('_required')
            }
            if (elem.querySelectorAll) {
              Anot.each(elem.querySelectorAll('[_required=true]'), function(
                el
              ) {
                el.required = true
                el.removeAttribute('_required')
              })
            }
            alway()
          },
          after
        )
        hasEffect = hasEffect === false
      }
      if (!hasEffect) alway()
    } else {
      //移出DOM树，并用注释节点占据原位置
      if (elem.nodeType === 1) {
        if (elem.required === true) {
          elem.required = false
          elem.setAttribute('_required', 'true')
        }
        try {
          //如果不支持querySelectorAll或:required,可以直接无视
          Anot.each(elem.querySelectorAll(':required'), function(el) {
            elem.required = false
            el.setAttribute('_required', 'true')
          })
        } catch (e) {}

        var node = (binding.element = DOC.createComment(':if')),
          pos = elem.nextSibling
        binding.recoverNode = function() {
          binding.recoverNode = null
          if (node.parentNode !== par) {
            par.insertBefore(node, pos)
            binding.keep = elem
          }
        }

        Anot.effect.apply(
          elem,
          0,
          function() {
            binding.recoverNode = null
            if (stamp !== binding.stamp) return
            elem.parentNode.replaceChild(node, elem)
            binding.keep = elem //元素节点
            ifGroup.appendChild(elem)
            binding.rollback = function() {
              if (elem.parentNode === ifGroup) {
                ifGroup.removeChild(elem)
              }
            }
          },
          after
        )
      }
    }
  }
})
//将所有远程加载的模板,以字符串形式存放到这里
var templatePool = (Anot.templateCache = {})

function getTemplateContainer(binding, id, text) {
  var div = binding.templateCache && binding.templateCache[id]
  if (div) {
    var dom = DOC.createDocumentFragment(),
      firstChild
    while ((firstChild = div.firstChild)) {
      dom.appendChild(firstChild)
    }
    return dom
  }
  return Anot.parseHTML(text)
}
function nodesToFrag(nodes) {
  var frag = DOC.createDocumentFragment()
  for (var i = 0, len = nodes.length; i < len; i++) {
    frag.appendChild(nodes[i])
  }
  return frag
}
Anot.directive('include', {
  init: directives.attr.init,
  update: function(val) {
    if (!val) {
      return
    }

    var binding = this
    var elem = this.element
    var vmodels = binding.vmodels
    var loaded = binding.includeLoaded // 加载完的回调
    var rendered = binding.includeRendered // 渲染完的回调
    var effectClass = binding.effectName && binding.effectClass // 是否开启动画
    var templateCache = binding.templateCache // 是否开启 缓存
    var outer = binding.includeReplace // 是否替换容器
    var target = outer ? elem.parentNode : elem
    var _ele = binding._element // replace binding.element === binding.end

    binding.recoverNodes = binding.recoverNodes || Anot.noop

    var scanTemplate = function(text) {
      var _stamp = (binding._stamp = Date.now()) // 过滤掉频繁操作
      if (loaded) {
        var newText = loaded.apply(target, [text].concat(vmodels))
        if (typeof newText === 'string') {
          text = newText
        }
      }
      if (rendered) {
        checkScan(
          target,
          function() {
            rendered.call(target)
          },
          NaN
        )
      }
      var lastID = binding.includeLastID || '_default' // 默认

      binding.includeLastID = val
      var leaveEl =
        (templateCache && templateCache[lastID]) ||
        DOC.createElement(elem.tagName || binding._element.tagName) // 创建一个离场元素

      if (effectClass) {
        leaveEl.className = effectClass
        target.insertBefore(leaveEl, binding.start) // 插入到start之前，防止被错误的移动
      }

      // cache or animate，移动节点
      ;(templateCache || {})[lastID] = leaveEl
      var fragOnDom = binding.recoverNodes() // 恢复动画中的节点
      if (fragOnDom) {
        target.insertBefore(fragOnDom, binding.end)
      }
      while (true) {
        var node = binding.start.nextSibling
        if (node && node !== leaveEl && node !== binding.end) {
          leaveEl.appendChild(node)
        } else {
          break
        }
      }

      // 元素退场
      Anot.effect.remove(
        leaveEl,
        target,
        function() {
          if (templateCache) {
            // write cache
            if (_stamp === binding._stamp) ifGroup.appendChild(leaveEl)
          }
        },
        binding
      )

      var enterEl = target,
        before = Anot.noop,
        after = Anot.noop

      var fragment = getTemplateContainer(binding, val, text)
      var nodes = Anot.slice(fragment.childNodes)

      if (outer && effectClass) {
        enterEl = _ele
        enterEl.innerHTML = '' // 清空
        enterEl.setAttribute('skip', '')
        target.insertBefore(enterEl, binding.end.nextSibling) // 插入到bingding.end之后避免被错误的移动
        before = function() {
          enterEl.insertBefore(fragment, null) // 插入节点
        }
        after = function() {
          binding.recoverNodes = Anot.noop
          if (_stamp === binding._stamp) {
            fragment = nodesToFrag(nodes)
            target.insertBefore(fragment, binding.end) // 插入真实element
            scanNodeArray(nodes, vmodels)
          }
          if (enterEl.parentNode === target) target.removeChild(enterEl) // 移除入场动画元素
        }
        binding.recoverNodes = function() {
          binding.recoverNodes = Anot.noop
          return nodesToFrag(nodes)
        }
      } else {
        before = function() {
          //新添加元素的动画
          target.insertBefore(fragment, binding.end)
          scanNodeArray(nodes, vmodels)
        }
      }

      Anot.effect.apply(enterEl, 'enter', before, after)
    }

    if (templatePool[val]) {
      Anot.nextTick(function() {
        scanTemplate(templatePool[val])
      })
    } else {
      fetch(val, {
        method: 'get',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
        .then(res => {
          if (res.status >= 200 && res.status < 300) {
            return res.text()
          } else {
            return Promise.reject(
              `获取网络资源出错, ${res.status} (${res.statusText})`
            )
          }
        })
        .then(text => {
          templatePool[val] = text
          scanTemplate(text)
        })
        .catch(err => {
          log(':include load [' + val + '] error\n%c%s', 'color:#f30', err)
        })
    }
  }
})
var rdash = /\(([^)]*)\)/
var onDir = Anot.directive('on', {
  priority: 3000,
  init: function(binding) {
    var value = binding.expr
    binding.type = 'on'
    var eventType = binding.param.replace(/-\d+$/, '') // :on-mousemove-10
    if (typeof onDir[eventType + 'Hook'] === 'function') {
      onDir[eventType + 'Hook'](binding)
    }
    if (value.indexOf('(') > 0 && value.indexOf(')') > -1) {
      var matched = (value.match(rdash) || ['', ''])[1].trim()
      if (matched === '' || matched === '$event') {
        // aaa() aaa($event)当成aaa处理
        value = value.replace(rdash, '')
      }
    }
    binding.expr = value
  },
  update: function(callback) {
    var binding = this
    var elem = this.element
    callback = function(e) {
      var fn = binding.getter || noop
      return fn.apply(binding.args[0], binding.args.concat(e))
    }

    var eventType = binding.param.replace(/-\d+$/, '') // :on-mousemove-10
    if (eventType === 'scan') {
      callback.call(elem, {
        type: eventType
      })
    } else if (typeof binding.specialBind === 'function') {
      binding.specialBind(elem, callback)
    } else {
      var removeFn = Anot.bind(elem, eventType, callback)
    }
    binding.rollback = function() {
      if (typeof binding.specialUnbind === 'function') {
        binding.specialUnbind()
      } else {
        Anot.unbind(elem, eventType, removeFn)
      }
    }
  }
})
Anot.directive('for', {
  priority: 90,
  init: function(binding) {
    var type = binding.type
    binding.cache = {} //用于存放代理VM
    binding.enterCount = 0

    var elem = binding.element
    if (elem.nodeType === 1) {
      var vars = binding.expr.split(' in ')
      binding.expr = vars.pop()
      if (vars.length) {
        vars = vars.pop().split(/\s+/)
      }
      binding.vars = vars
      elem.removeAttribute(binding.name)
      effectBinding(elem, binding)
      var rendered = getBindingCallback(elem, 'data-rendered', binding.vmodels)

      var signature = generateID(type)
      var start = DOC.createComment(signature + ':start')
      var end = (binding.element = DOC.createComment(signature + ':end'))
      binding.signature = signature
      binding.start = start
      binding.template = anotFragment.cloneNode(false)

      var _parent = elem.parentNode
      _parent.replaceChild(end, elem)
      _parent.insertBefore(start, end)
      binding.template.appendChild(elem)

      binding.element = end

      if (rendered) {
        var removeFn = Anot.bind(_parent, 'datasetchanged', function() {
          rendered.apply(_parent, _parent.args)
          Anot.unbind(_parent, 'datasetchanged', removeFn)
          _parent.msRendered = rendered
        })
      }
    }
  },
  update: function(value, oldValue) {
    var binding = this
    var xtype = this.xtype

    if (xtype === 'array') {
      if (!this.vars.length) {
        this.vars.push('$index', 'el')
      } else if (this.vars.length === 1) {
        this.vars.unshift('$index')
      }
      this.param = this.vars[1]
    } else {
      this.param = '__el__'
      if (!this.vars.length) {
        this.vars.push('$key', '$val')
      } else if (this.vars.length === 1) {
        this.vars.push('$val')
      }
    }

    this.enterCount += 1
    var init = !oldValue
    if (init) {
      binding.$outer = {}
      var check0 = this.vars[0]
      var check1 = this.vars[1]
      if (xtype === 'array') {
        check0 = '$first'
        check1 = '$last'
      }
      for (var i = 0, v; (v = binding.vmodels[i++]); ) {
        if (v.hasOwnProperty(check0) && v.hasOwnProperty(check1)) {
          binding.$outer = v
          break
        }
      }
    }
    var track = this.track
    var action = 'move'
    binding.$repeat = value
    var fragments = []
    var transation = init && anotFragment.cloneNode(false)
    var proxies = []
    var param = this.param
    var retain = Anot.mix({}, this.cache)
    var elem = this.element
    var length = track.length

    var _parent = elem.parentNode

    //检查新元素数量
    var newCount = 0
    for (i = 0; i < length; i++) {
      var keyOrId = track[i]
      if (!retain[keyOrId]) newCount++
    }
    var oldCount = 0
    for (i in retain) {
      oldCount++
    }
    var clear = (!length || newCount === length) && oldCount > 10 //当全部是新元素,且移除元素较多(10)时使用clear

    var kill = elem.previousSibling
    var start = binding.start

    if (clear) {
      while (kill !== start) {
        _parent.removeChild(kill)
        kill = elem.previousSibling
      }
    }

    for (i = 0; i < length; i++) {
      keyOrId = track[i] //array为随机数, object 为keyName
      var proxy = retain[keyOrId]
      if (!proxy) {
        // log(this)
        proxy = getProxyVM(this)
        proxy.$up = this.vmodels[0]
        if (xtype === 'array') {
          action = 'add'
          proxy.$id = keyOrId
          var valueItem = value[i]
          proxy[param] = valueItem //index
          if (Object(valueItem) === valueItem) {
            hideProperty(valueItem, '$ups', valueItem.$ups || {})
            valueItem.$ups[param] = proxy
          }
        } else {
          action = 'append'
          proxy[check0] = keyOrId
          proxy[check1] = value[keyOrId] //key
          var tmp = {}
          tmp[check0] = proxy[check0]
          tmp[check1] = proxy[check1]
          proxy[param] = tmp
        }
        this.cache[keyOrId] = proxy
        var node = proxy.$anchor || (proxy.$anchor = elem.cloneNode(false))
        node.nodeValue = this.signature
        shimController(
          binding,
          transation,
          proxy,
          fragments,
          init && !binding.effectDriver
        )
        decorateProxy(proxy, binding, xtype)
      } else {
        fragments.push({})
        retain[keyOrId] = true
      }

      //重写proxy
      if (this.enterCount === 1) {
        //防止多次进入,导致位置不对
        proxy.$active = false
        proxy.$oldIndex = proxy.$index
        proxy.$active = true
        proxy.$index = i
      }

      if (xtype === 'array') {
        proxy.$first = i === 0
        proxy.$last = i === length - 1
        proxy[this.vars[0]] = proxy.$index
      } else {
        proxy[check1] = toJson(value[keyOrId]) //这里是处理vm.object = newObject的情况
      }
      proxies.push(proxy)
    }
    this.proxies = proxies
    if (init && !binding.effectDriver) {
      _parent.insertBefore(transation, elem)
      fragments.forEach(function(fragment) {
        scanNodeArray(fragment.nodes || [], fragment.vmodels)
        //if(fragment.vmodels.length > 2)
        fragment.nodes = fragment.vmodels = null
      }) // jshint ignore:line
    } else {
      var staggerIndex = (binding.staggerIndex = 0)
      for (keyOrId in retain) {
        if (retain[keyOrId] !== true) {
          action = 'del'
          !clear && removeItem(retain[keyOrId].$anchor, binding, true)
          // 相当于delete binding.cache[key]
          proxyRecycler(this.cache, keyOrId, param)
          retain[keyOrId] = null
        }
      }

      for (i = 0; i < length; i++) {
        proxy = proxies[i]
        keyOrId = xtype === 'array' ? proxy.$id : proxy.$key
        var pre = proxies[i - 1]
        var preEl = pre ? pre.$anchor : binding.start
        if (!retain[keyOrId]) {
          //如果还没有插入到DOM树,进行插入动画
          ;(function(fragment, preElement) {
            var nodes = fragment.nodes
            var vmodels = fragment.vmodels
            if (nodes) {
              staggerIndex = mayStaggerAnimate(
                binding.effectEnterStagger,
                function() {
                  _parent.insertBefore(fragment.content, preElement.nextSibling)
                  scanNodeArray(nodes, vmodels)
                  !init && animateRepeat(nodes, 1, binding)
                },
                staggerIndex
              )
            }
            fragment.nodes = fragment.vmodels = null
          })(fragments[i], preEl) // jshint ignore:line
        } else if (proxy.$index !== proxy.$oldIndex) {
          //进行移动动画
          ;(function(proxy2, preElement) {
            staggerIndex = mayStaggerAnimate(
              binding.effectEnterStagger,
              function() {
                var curNode = removeItem(proxy2.$anchor)
                var inserted = Anot.slice(curNode.childNodes)
                _parent.insertBefore(curNode, preElement.nextSibling)
                animateRepeat(inserted, 1, binding)
              },
              staggerIndex
            )
          })(proxy, preEl) // jshint ignore:line
        }
      }
    }
    if (!value.$track) {
      //如果是非监控对象,那么就将其$events清空,阻止其持续监听
      for (keyOrId in this.cache) {
        proxyRecycler(this.cache, keyOrId, param)
      }
    }

    // :for --> duplex
    ;(function(args) {
      _parent.args = args
      if (_parent.msRendered) {
        //第一次事件触发,以后直接调用
        _parent.msRendered.apply(_parent, args)
      }
    })(kernel.newWatch ? arguments : [action])
    var id = setTimeout(function() {
      clearTimeout(id)
      //触发上层的select回调及自己的rendered回调
      Anot.fireDom(_parent, 'datasetchanged', {
        bubble: _parent.msHasEvent
      })
    })
    this.enterCount -= 1
  }
})

function animateRepeat(nodes, isEnter, binding) {
  for (var i = 0, node; (node = nodes[i++]); ) {
    if (node.className === binding.effectClass) {
      Anot.effect.apply(node, isEnter, noop, noop, binding)
    }
  }
}

function mayStaggerAnimate(staggerTime, callback, index) {
  if (staggerTime) {
    setTimeout(callback, ++index * staggerTime)
  } else {
    callback()
  }
  return index
}

function removeItem(node, binding, flagRemove) {
  var fragment = anotFragment.cloneNode(false)
  var last = node
  var breakText = last.nodeValue
  var staggerIndex = binding && Math.max(+binding.staggerIndex, 0)
  var nodes = Anot.slice(last.parentNode.childNodes)
  var index = nodes.indexOf(last)
  while (true) {
    var pre = nodes[--index] //node.previousSibling
    if (!pre || String(pre.nodeValue).indexOf(breakText) === 0) {
      break
    }
    if (!flagRemove && binding && pre.className === binding.effectClass) {
      node = pre
      ;(function(cur) {
        binding.staggerIndex = mayStaggerAnimate(
          binding.effectLeaveStagger,
          function() {
            Anot.effect.apply(
              cur,
              0,
              noop,
              function() {
                fragment.appendChild(cur)
              },
              binding
            )
          },
          staggerIndex
        )
      })(pre) // jshint ignore:line
    } else {
      fragment.insertBefore(pre, fragment.firstChild)
    }
  }
  fragment.appendChild(last)
  return fragment
}

function shimController(data, transation, proxy, fragments, init) {
  var content = data.template.cloneNode(true)
  var nodes = Anot.slice(content.childNodes)
  content.appendChild(proxy.$anchor)
  init && transation.appendChild(content)
  var itemName = data.param || 'el'
  var valueItem = proxy[itemName],
    nv

  nv = [proxy].concat(data.vmodels)

  var fragment = {
    nodes: nodes,
    vmodels: nv,
    content: content
  }
  fragments.push(fragment)
}
// {}  -->  {xx: 0, yy: 1, zz: 2} add
// {xx: 0, yy: 1, zz: 2}  -->  {xx: 0, yy: 1, zz: 2, uu: 3}
// [xx: 0, yy: 1, zz: 2}  -->  {xx: 0, zz: 1, yy: 2}

function getProxyVM(binding) {
  var agent = binding.xtype === 'object' ? withProxyAgent : eachProxyAgent
  var proxy = agent(binding)
  var node = proxy.$anchor || (proxy.$anchor = binding.element.cloneNode(false))
  node.nodeValue = binding.signature
  proxy.$outer = binding.$outer
  return proxy
}

function decorateProxy(proxy, binding, type) {
  if (type === 'array') {
    proxy.$remove = function() {
      binding.$repeat.removeAt(proxy.$index)
    }
    var param = binding.param
    proxy.$watch(param, function(val) {
      var index = proxy.$index
      binding.$repeat[index] = val
    })
  } else {
    var __k__ = binding.vars[0]
    var __v__ = binding.vars[1]
    proxy.$up.$watch(binding.expr + '.' + proxy[__k__], function(val) {
      proxy[binding.param][__v__] = val
      proxy[__v__] = val
    })
  }
}

var eachProxyPool = []

function eachProxyAgent(data, proxy) {
  var itemName = data.param || 'el'
  for (var i = 0, n = eachProxyPool.length; i < n; i++) {
    var candidate = eachProxyPool[i]
    if (candidate && candidate.hasOwnProperty(itemName)) {
      eachProxyPool.splice(i, 1)
      proxy = candidate
      break
    }
  }
  if (!proxy) {
    proxy = eachProxyFactory(data)
  }
  return proxy
}

function eachProxyFactory(data) {
  var itemName = data.param || 'el'
  var __k__ = data.vars[0]
  var source = {
    $outer: {},
    $index: 0,
    $oldIndex: 0,
    $anchor: null,
    //-----
    $first: false,
    $last: false,
    $remove: Anot.noop
  }
  source[__k__] = 0
  source[itemName] = NaN
  var force = {
    $last: 1,
    $first: 1,
    $index: 1
  }
  force[__k__] = 1
  force[itemName] = 1
  var proxy = modelFactory(
    { state: source },
    {
      force: force
    }
  )
  proxy.$id = generateID('proxy-each')
  return proxy
}

var withProxyPool = []

function withProxyAgent(data) {
  return withProxyPool.pop() || withProxyFactory(data)
}

function withProxyFactory(data) {
  var itemName = data.param || '__el__'
  var __k__ = data.vars[0]
  var __v__ = data.vars[1]
  var source = {
    $index: 0,
    $oldIndex: 0,
    $outer: {},
    $anchor: null
  }
  source[__k__] = ''
  source[__v__] = NaN
  source[itemName] = NaN
  var force = {
    __el__: 1,
    $index: 1
  }
  force[__k__] = 1
  force[__v__] = 1
  var proxy = modelFactory(
    { state: source },
    {
      force: force
    }
  )
  proxy.$id = generateID('proxy-with')
  return proxy
}

function proxyRecycler(cache, key, param) {
  var proxy = cache[key]
  if (proxy) {
    var proxyPool =
      proxy.$id.indexOf('proxy-each') === 0 ? eachProxyPool : withProxyPool
    proxy.$outer = {}

    for (var i in proxy.$events) {
      var a = proxy.$events[i]
      if (Array.isArray(a)) {
        a.length = 0
        if (i === param) {
          proxy[param] = NaN
        } else if (i === '$val') {
          proxy.$val = NaN
        }
      }
    }

    if (proxyPool.unshift(proxy) > kernel.maxRepeatSize) {
      proxyPool.pop()
    }
    delete cache[key]
  }
}
function parseDisplay(nodeName, val) {
  //用于取得此类标签的默认display值
  var key = '_' + nodeName
  if (!parseDisplay[key]) {
    var node = DOC.createElement(nodeName)
    root.appendChild(node)

    val = getComputedStyle(node, null).display

    root.removeChild(node)
    parseDisplay[key] = val
  }
  return parseDisplay[key]
}

Anot.parseDisplay = parseDisplay

Anot.directive('visible', {
  init: function(binding) {
    effectBinding(binding.element, binding)
  },
  update: function(val) {
    var binding = this,
      elem = this.element,
      stamp
    var noEffect = !this.effectName
    if (!this.stamp) {
      stamp = this.stamp = Date.now()
      if (val) {
        elem.style.display = binding.display || ''
        if (Anot(elem).css('display') === 'none') {
          elem.style.display = binding.display = parseDisplay(elem.nodeName)
        }
      } else {
        elem.style.display = 'none'
      }
      return
    }
    stamp = this.stamp = +new Date()
    if (val) {
      Anot.effect.apply(elem, 1, function() {
        if (stamp !== binding.stamp) return
        var driver = elem.getAttribute('data-effect-driver') || 'a'

        if (noEffect) {
          //不用动画时走这里
          elem.style.display = binding.display || ''
        }
        // "a", "t"
        if (driver === 'a' || driver === 't') {
          if (Anot(elem).css('display') === 'none') {
            elem.style.display = binding.display || parseDisplay(elem.nodeName)
          }
        }
      })
    } else {
      Anot.effect.apply(elem, 0, function() {
        if (stamp !== binding.stamp) return
        elem.style.display = 'none'
      })
    }
  }
})
/*********************************************************************
 *                             自带过滤器                             *
 **********************************************************************/

var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim
var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g
var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/gi
var rsanitize = {
  a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/gi,
  img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/gi,
  form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/gi
}
var rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
var rnoalphanumeric = /([^\#-~| |!])/g

function numberFormat(number, decimals, point, thousands) {
  //form http://phpjs.org/functions/number_format/
  //number 必需，要格式化的数字
  //decimals 可选，规定多少个小数位。
  //point 可选，规定用作小数点的字符串（默认为 . ）。
  //thousands 可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
    sep = thousands || ',',
    dec = point || '.',
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec)
      return '' + (Math.round(n * k) / k).toFixed(prec)
    }
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}

var filters = (Anot.filters = {
  uppercase: function(str) {
    return str.toUpperCase()
  },
  lowercase: function(str) {
    return str.toLowerCase()
  },
  //字符串截取，超过指定长度以mark标识接上
  truncate: function(str, len, mark) {
    len = len || 30
    mark = typeof mark === 'string' ? mark : '...'
    return str.slice(0, len) + (str.length <= len ? '' : mark)
  },
  //小值秒数转化为 时间格式
  time: function(str) {
    str = str >> 0
    var s = str % 60
    var m = Math.floor(str / 60)
    var h = Math.floor(m / 60)
    m = m % 60
    m = m < 10 ? '0' + m : m
    s = s < 10 ? '0' + s : s

    if (h > 0) {
      h = h < 10 ? '0' + h : h
      return h + ':' + m + ':' + s
    }
    return m + ':' + s
  },
  $filter: function(val) {
    for (var i = 1, n = arguments.length; i < n; i++) {
      var array = arguments[i]
      var fn = Anot.filters[array[0]]
      if (typeof fn === 'function') {
        var arr = [val].concat(array.slice(1))
        val = fn.apply(null, arr)
      }
    }
    return val
  },
  camelize: camelize,
  //https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  //    <a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a>
  //    <a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
  //    <a href="jav  ascript:alert('XSS');">IE67chrome</a>
  //    <a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
  //    <a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
  xss: function(str) {
    return str.replace(rscripts, '').replace(ropen, function(a, b) {
      var match = a.toLowerCase().match(/<(\w+)\s/)
      if (match) {
        //处理a标签的href属性，img标签的src属性，form标签的action属性
        var reg = rsanitize[match[1]]
        if (reg) {
          a = a.replace(reg, function(s, name, value) {
            var quote = value.charAt(0)
            return name + '=' + quote + 'javascript:void(0)' + quote // jshint ignore:line
          })
        }
      }
      return a.replace(ron, ' ').replace(/\s+/g, ' ') //移除onXXX事件
    })
  },
  escape: function(str) {
    //将字符串经过 str 转义得到适合在页面中显示的内容, 例如替换 < 为 &lt
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(rsurrogate, function(value) {
        var hi = value.charCodeAt(0)
        var low = value.charCodeAt(1)
        return '&#' + ((hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000) + ';'
      })
      .replace(rnoalphanumeric, function(value) {
        return '&#' + value.charCodeAt(0) + ';'
      })
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  },
  currency: function(amount, symbol, fractionSize) {
    return (
      (symbol || '\u00a5') +
      numberFormat(amount, isFinite(fractionSize) ? fractionSize : 2)
    )
  },
  number: numberFormat,
  //日期格式化，类似php的date函数，
  date: function(stamp, str) {
    var oDate = stamp

    if (!Date.isDate(oDate)) {
      var tmp = +oDate
      if (tmp === tmp) {
        oDate = tmp
      }

      oDate = new Date(oDate)
      if (oDate.toString() === 'Invalid Date') {
        return 'Invalid Date'
      }
    }
    return oDate.format(str)
  }
})


/*********************************************************************
 *                    DOMReady                                       *
 **********************************************************************/

  let readyList = []
  let isReady
  let fireReady = function(fn) {
    isReady = true
    while ((fn = readyList.shift())) {
      fn(Anot)
    }
  }

  if (DOC.readyState === 'complete') {
    setTimeout(fireReady) //如果在domReady之外加载
  } else {
    DOC.addEventListener('DOMContentLoaded', fireReady)
  }
  window.addEventListener('load', fireReady)
  Anot.ready = function(fn) {
    if (!isReady) {
      readyList.push(fn)
    } else {
      fn(Anot)
    }
  }
  window.Anot = Anot
  return Anot
})()
export default _Anot
