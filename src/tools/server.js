/**
 * 内置HTTP静态服务
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/23 02:43:03
 */

'use strict'

const http = require('http')
const path = require('path')
const fs = require('iofs')

const MIME_TYPES = {
  '.js': 'text/javascript; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg',
  '.ico': 'image/ico'
}

module.exports = function(root) {
  http
    .createServer((req, res) => {
      let { ext } = path.parse(req.url)
      let file = path.resolve(root, req.url.slice(1))
      let buff = fs.cat(file)
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || MIME_TYPES['.html']
      })
      res.end(buff)
    })
    .listen(10240)
}
