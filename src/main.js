/**
 * 主入口
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/18 09:27:09
 */

const { app, session, protocol, globalShortcut } = require('electron')
const path = require('path')
const fs = require('iofs')
// const {exec} = require('child_process')

require('./tools/init.js')
const { createAppTray, createLrcTray } = require('./tools/tray.js')
const createMenu = require('./tools/menu.js')
const { createMainWindow, createMiniWindow } = require('./tools/windows.js')

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
  protocol.registerBufferProtocol('app', (req, cb) => {
    let file = decodeURIComponent(req.url.replace(/^app:\/\/local\//, ''))
    let ext = path.extname(req.url)
    let buff = fs.cat(path.resolve(__dirname, file))
    cb({ data: buff, mimeType: MIME_TYPES[ext] })
  })

  protocol.registerBufferProtocol('sonist', (req, cb) => {
    let file = decodeURIComponent(req.url.replace(/^sonist:[\/]+/, '/'))
    let ext = path.extname(req.url)
    let buff = fs.cat(file)
    cb({ data: buff, mimeType: MIME_TYPES[ext] || MIME_TYPES.all })
  })
  // 修改app的UA
  session.defaultSession.setUserAgent(
    'KugouMusic/2.9.5 (Mac OS X Version 10.15.7 (Build 19H2))'
  )

  let win = createMainWindow(path.resolve(__dirname, './images/app.png'))

  createAppTray(win)
  createLrcTray(win)
  createMenu(win)

  // mac专属事件,点击dock栏图标,可激活窗口
  app.on('activate', _ => {
    if (win) {
      win.webContents.send('dock-click')
    }
  })
})

// 退出前清空所有快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
