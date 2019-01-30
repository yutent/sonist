/**
 * 各种窗口创建
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/26 18:28:22
 */

'use strict'

const { BrowserWindow } = require('electron')

/**
 * 应用主窗口
 */
exports.createMainWindow = function(icon) {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    title: 'sonist',
    width: 1024,
    height: 640,
    frame: false,
    resizable: false,
    icon,
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true
    },
    show: false
  })

  // 然后加载应用的 index.html。

  win.loadURL('app://local/index.html')

  win.on('ready-to-show', _ => {
    win.show()
    // win.openDevTools()
  })

  return win
}

/**
 * 依赖异常显示窗口
 */
exports.createErrorWindow = function() {
  let win = new BrowserWindow({
    width: 600,
    height: 360,
    skipTaskbar: true,
    maximizable: false,
    minimizable: false,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      devTools: false
    }
  })
  win.setMenuBarVisibility(false)
  win.loadURL('app://local/depends.html')
  win.on('closed', _ => {
    app.exit()
  })
}

/**
 * 桌面歌词窗口
 */
exports.createDesktopLrcWindow = function(screen) {
  let win = new BrowserWindow({
    title: '',
    width: 1024,
    height: 100,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    x: (screen.size.width - 1024) / 2,
    y: screen.size.height - 100,
    skipTaskbar: true,
    hasShadow: false,
    thickFrame: false,
    transparent: true,
    show: false,
    webPreferences: {
      devTools: false
    }
  })

  win.loadURL('app://local/desktop-lrc.html')
  return win
}

/**
 * 应用迷你窗口
 */
exports.createMiniWindow = function(screen) {
  let win = new BrowserWindow({
    title: '',
    width: 320,
    height: 60,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    x: screen.size.width - 320,
    y: 0,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      devTools: false
    }
  })

  win.loadURL('app://local/mini-win.html')
  return win
}
