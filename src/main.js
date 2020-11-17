/**
 * 主入口
 * @author yutent<yutent@doui.cc>
 * @date 2019/12/13 00:37:04
 */

'use strict'

const { app, session, protocol, globalShortcut } = require('electron')
const path = require('path')
const fs = require('iofs')
const { exec } = require('child_process')
const log = console.log
const MIME_TYPES = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.htm': 'text/plain',
  '.css': 'text/css',
  '.jpg': 'image/jpg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/ico'
}

require('./tools/init')
const createTray = require('./tools/tray')
const createMenu = require('./tools/menu')

const { createMainWindow, createErrorWindow } = require('./tools/windows')

const ROOT = __dirname

/* ----------------------------------------------------- */
app.commandLine.appendSwitch('--lang', 'zh-CN')
app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

/* ----------------------------------------------------- */

//  初始化应用
app.once('ready', () => {
  // 注册协议
  protocol.registerBufferProtocol('app', (req, cb) => {
    let file = req.url.replace(/^app:\/\/local\//, '')
    let ext = path.extname(req.url)
    let buff = fs.cat(path.resolve(ROOT, file))
    cb({ data: buff, mimeType: MIME_TYPES[ext] })
  })
  // 修改app的UA
  session.defaultSession.setUserAgent(
    'KugouMusic/2.9.5 (Mac OS X Version 10.15.7 (Build 19H2))'
  )

  let win = createMainWindow(path.resolve(ROOT, './images/app.png'))

  createTray(win)
  createMenu(win)

  app.__MAIN__ = win

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
