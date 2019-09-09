/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2018-03-25 23:59:13
 * @version $Id$
 */

'use strict'
import Format from "./lib/format.js"

// 本地协议/头 判断正则
const rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/
const log = console.log

const noop = function(e, res) {
  this.defer.resolve(res)
}

let isLocal = false
try {
  isLocal = rlocalProtocol.test(location.protocol)
} catch (e) {}

let originAnchor = document.createElement('a')
originAnchor.href = location.href

const NOBODY_METHODS = ['GET', 'HEAD']
const ERRORS = {
  10001: 'Argument url is required',
  10012: 'Parse error',
  10100: 'Request canceled',
  10104: 'Request pending...',
  10200: 'Ok',
  10204: 'No content',
  10304: 'Not modified',
  10500: 'Internal Server Error',
  10504: 'Connected timeout'
}

const FORM_TYPES = {
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  json: 'application/json; charset=UTF-8',
  text: 'text/plain; charset=UTF-8'
}

const convert = {
  text(val) {
    return val
  },
  xml(val, xml) {
    return xml !== undefined ? xml : Format.parseXML(val)
  },
  html(val) {
    return Format.parseHTML(val)
  },
  json(val) {
    return JSON.parse(val)
  },
  script(val) {
    return Format.parseJS(val)
  }
}

class _Request {
  constructor(url = '', method = 'GET', param = {}) {
    if (!url) {
      throw new Error(ERRORS[10001])
    }

    // url规范化
    url = url.replace(/#.*$/, '')

    if (request.BASE_URL) {
      if (!/^([a-z]+:|\/\/)/.test(url)) {
        url = request.BASE_URL + url
      }
    }

    method = method.toUpperCase()

    this.xhr = new XMLHttpRequest()
    this.defer = Promise.defer()
    this.opt = {
      url,
      method,
      headers: {},
      data: {},
      dataType: 'text',
      withCredentials: false // 跨域选项,是否验证凭证
    }

    // 取消网络请求
    this.defer.promise.abort = () => {
      this.cancel = true
      this.xhr.abort()
    }
    this.__next__(Object.assign({}, request.__INIT__, param))
    return this.defer.promise
  }

  __next__(param) {
    /* -------------------------------------------------------------- */
    /* ------------------------  1»» 配置头信息  ---------------------- */
    /* -------------------------------------------------------------- */
    if (param.headers) {
      Object.assign(this.opt.headers, param.headers)
    }

    /* -------------------------------------------------------------- */
    /* ---------  2»» 设置表单类型, 其中 form-data不能手动设置  ---------- */
    /* -------------------------------------------------------------- */
    let hasAttach = false
    if (param.formType) {
      switch (param.formType) {
        case 'form':
          this.__set__('form')
          break
        case 'json':
          this.__set__('json')
          break
        case 'form-data':
          this.opt.method = 'POST'
          hasAttach = true
          break
        default:
          if (NOBODY_METHODS.includes(this.opt.method)) {
            this.__set__('form')
          } else {
            this.__set__('text')
          }
      }
    } else {
      this.__set__('form')
    }

    /* -------------------------------------------------------------- */
    /* -------------------  3»» 设置缓存  ---------------------------- */
    /* -------------------------------------------------------------- */
    if (param.cache) {
      if (NOBODY_METHODS.includes(this.opt.method)) {
        this.opt.cache = true
      }
    }

    /* -------------------------------------------------------------- */
    /* -------------------  4»» 设置超时时间(毫秒) --------------------- */
    /* -------------------------------------------------------------- */
    param.timeout = param.timeout >>> 0
    if (param.timeout > 0) {
      this.opt.timeout = param.timeout
    }

    /* -------------------------------------------------------------- */
    /* --------------------------  5»» 请求的内容 --------------------- */
    /* -------------------------------------------------------------- */
    if (param.data) {
      let type = typeof param.data

      switch (type) {
        case 'number':
        case 'string':
          this.__set__('text')
          this.opt.data = param.data
          break
        case 'object':
          // 解析表单DOM
          if (param.data.nodeName === 'FORM') {
            this.opt.method = param.data.method.toUpperCase() || 'POST'

            this.opt.data = Format.parseForm(param.data)
            hasAttach = this.opt.data.constructor === FormData

            if (hasAttach) {
              delete this.opt.headers['content-type']
            }
            // 如果是一个 FormData对象
            // 则直接改为POST
          } else if (param.data.constructor === FormData) {
            hasAttach = true
            this.opt.method = 'POST'
            delete this.opt.headers['content-type']
            this.opt.data = param.data
          } else {
            // 有附件,则改为FormData
            if (hasAttach) {
              this.opt.data = Format.mkFormData(param.data)
            } else {
              this.opt.data = param.data
            }
          }
      }
    }

    /* -------------------------------------------------------------- */
    /* --------------------------  6»» 处理跨域  --------------------- */
    /* -------------------------------------------------------------- */
    if (param.withCredentials) {
      this.opt.withCredentials = true
    }
    try {
      let anchor = document.createElement('a')
      anchor.href = this.opt.url

      this.opt.crossDomain =
        originAnchor.protocol !== anchor.protocol ||
        originAnchor.host !== anchor.host
    } catch (err) {}

    // 6.1»» 进一步处理跨域
    // 非跨域或跨域但支持Cors时自动加上一条header信息，用以标识这是ajax请求
    // 如果是跨域,开启Cors会需要服务端额外返回一些headers

    if (this.opt.crossDomain) {
      if (this.opt.withCredentials) {
        this.xhr.withCredentials = true
        this.opt.headers['X-Requested-With'] = 'XMLHttpRequest'
      }
    } else {
      this.opt.headers['X-Requested-With'] = 'XMLHttpRequest'
    }

    /* -------------------------------------------------------------- */
    /* ------------- 7»» 根据method类型, 处理g表单数据  ---------------- */
    /* -------------------------------------------------------------- */
    // 是否允许发送body
    let allowBody = !NOBODY_METHODS.includes(this.opt.method)
    if (allowBody) {
      if (!hasAttach) {
        if (param.formType === 'json') {
          this.opt.data = JSON.stringify(this.opt.data)
        } else {
          this.opt.data = Format.param(this.opt.data)
        }
      }
    } else {
      // 否则拼接到url上
      this.opt.data = Format.param(this.opt.data)

      if (this.opt.data) {
        this.opt.url += (/\?/.test(this.opt.url) ? '&' : '?') + this.opt.data
      }

      if (this.opt.cache === false) {
        this.opt.url +=
          (/\?/.test(this.opt.url) ? '&' : '?') + '_=' + Math.random()
      }
    }

    /* -------------------------------------------------------------- */
    /* -------------       8»» 设置响应的数据类型       ---------------- */
    /* -------------------------------------------------------------- */
    // arraybuffer | blob | document | json | text
    if (param.dataType) {
      this.opt.dataType = param.dataType.toLowerCase()
    }
    this.xhr.responseType = this.opt.dataType

    /* -------------------------------------------------------------- */
    /* -------------           9»» 构造请求           ---------------- */
    /* -------------------------------------------------------------- */

    // response ready
    this.xhr.onreadystatechange = ev => {
      if (this.opt.timeout > 0) {
        this.opt['time' + this.xhr.readyState] = ev.timeStamp
        if (this.xhr.readyState === 4) {
          this.opt.isTimeout =
            this.opt.time4 - this.opt.time1 > this.opt.timeout
        }
      }

      if (this.xhr.readyState !== 4) {
        return
      }

      this.__dispatch__(this.opt.isTimeout)
    }

    // 9.1»» 初始化xhr
    this.xhr.open(this.opt.method, this.opt.url, true)

    // 9.2»» 设置头信息
    for (let i in this.opt.headers) {
      this.xhr.setRequestHeader(i, this.opt.headers[i])
    }

    // 9.3»» 发起网络请求
    this.xhr.send(this.opt.data)

    // 9.4»» 超时处理
    if (this.opt.timeout && this.opt.timeout > 0) {
      this.xhr.timeout = this.opt.timeout
    }
  }

  __set__(type) {
    this.opt.headers['content-type'] = FORM_TYPES[type]
  }

  __dispatch__(isTimeout) {
    let result = {
      status: 200,
      statusText: 'ok',
      text: '',
      body: '',
      error: null
    }

    // 主动取消
    if (this.cancel) {
      return this.__cancel__(result)
    }

    // 超时
    if (isTimeout) {
      return this.__timeout__(result)
    }

    // 是否请求成功(resful规范)
    let isSucc = this.xhr.status >= 200 && this.xhr.status < 400

    let headers = this.xhr.getAllResponseHeaders().split('\n') || []
    let contentType = ''

    //处理返回的 Header, 拿到content-type
    for (let it of headers) {
      it = it.trim()
      if (it) {
        it = it.split(':')
        let tmp = it.shift().toLowerCase()
        if (tmp === 'content-type') {
          contentType = it
            .join(':')
            .trim()
            .toLowerCase()
          break
        }
      }
    }

    if (isSucc) {
      result.status = this.xhr.status
      if (result.status === 204) {
        result.statusText = ERRORS[10204]
      } else if (result.status === 304) {
        result.statusText = ERRORS[10304]
      }
    } else {
      result.status = this.xhr.status || 500
      result.statusText = this.xhr.statusText || ERRORS[10500]
      result.error = new Error(result.statusText)
    }
    // log(this.opt.dataType, this.xhr)
    switch (this.opt.dataType) {
      case 'arraybuffer':
      case 'blob':
      case 'document':
      case 'json':
        result.text = result.body = this.xhr.response
        break
      // text
      default:
        try {
          //处理返回的数据
          let dataType = contentType.match(/json|xml|script|html/)

          dataType = (dataType && dataType[0].toLowerCase()) || 'text'

          result.text = this.xhr.response
          result.body = convert[dataType](result.text, this.xhr.response)
        } catch (err) {
          result.error = err
          result.statusText = ERRORS[10012]
        }
        break
    }
    this.__success__(isSucc, result)
  }

  __success__(isSucc, result) {
    if (isSucc) {
      this.defer.resolve(result)
    } else {
      this.defer.reject(result)
    }
    delete this.xhr
    delete this.opt
    delete this.defer
  }

  __cancel__(result) {
    result.status = 0
    result.statusText = ERRORS[10100]
    result.error = new Error(ERRORS[10100])

    this.defer.reject(result)

    delete this.xhr
    delete this.opt
    delete this.defer
  }

  __timeout__(result) {
    result.status = 504
    result.statusText = ERRORS[10504]
    result.error = new Error(ERRORS[10504])

    this.defer.reject(result)

    delete this.xhr
    delete this.opt
    delete this.defer
  }
}

if (!window.request) {
  window.request = {
    get(url, param = {}) {
      return new _Request(url, 'GET', param)
    },
    post(url, param = {}) {
      return new _Request(url, 'POST', param)
    },
    upload(url, param = {}) {
      param.formType = 'form-data'
      return this.post(url, param)
    },
    download(url, param = {}) {
      param.dataType = 'blob'
      return this.get(url, param)
    },
    open(url, method = 'GET', param = {}) {
      if (typeof method === 'object') {
        param = method
        method = 'GET'
      }
      return new _Request(url, method, param)
    },
    version: '2.0.0-normal',
    init(param = {}) {
      this.__INIT__ = param
    }
  }
  Anot.ui.request = request.version
}

export default request
