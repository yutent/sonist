/**
 * 主入口
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/18 09:27:09
 */

const { app, session, protocol, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const fs = require('iofs')

require('./tools/init.js')

const { createMainWindow } = require('./tools/windows.js')

const MIME_TYPES = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.htm': 'text/plain',
  '.css': 'text/css',
  '.jpg': 'image/jpg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/ico',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/m4a',
  '.aac': 'audio/x-aac',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/x-wav',
  '.flac': 'audio/flac',
  all: 'audio/*'
}

/* ----------------------------------------------------- */
app.commandLine.appendSwitch('--lang', 'zh-CN')
app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
  { scheme: 'sonist', privileges: { secure: true, standard: true } }
])

/* ----------------------------------------------------- */

//  初始化应用
app.once('ready', () => {
  // 注册协议
  protocol.registerStreamProtocol('app', function(req, cb) {
    var file = decodeURIComponent(req.url.replace(/^app:\/\/local\//, ''))
    var ext = path.extname(req.url)
    file = path.resolve(__dirname, file)

    cb({
      data: fs.origin.createReadStream(file),
      mimeType: MIME_TYPES[ext],
      headers: {
        'Cache-Control': 'max-age=144000000'
      }
    })
  })

  protocol.registerStreamProtocol('sonist', function(req, cb) {
    var file = decodeURIComponent(req.url.replace(/^sonist:[\/]+/, '/'))
    var ext = path.extname(req.url)
    cb({
      data: fs.origin.createReadStream(file),
      mimeType: MIME_TYPES[ext] || MIME_TYPES.all,
      headers: {
        'Cache-Control': 'max-age=144000000'
      }
    })
  })
  // 修改app的UA
  session.defaultSession.setUserAgent(
    'KugouMusic/2.9.5 (Mac OS X Version 10.15.7 (Build 19H2))'
  )

  let win = createMainWindow(path.resolve(__dirname, './images/app.png'))

  // mac专属事件,点击dock栏图标,可激活窗口
  app.on('activate', _ => {
    if (win) {
      win.restore()
    }
  })

  ipcMain.on('app', (ev, conn) => {
    switch (conn.type) {
      case 'update-lrc':
        win.__lrc__.setTitle(conn.data.lrc)
        ev.returnValue = true
        break

      default:
        break
    }
  })
})

// 退出前清空所有快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
