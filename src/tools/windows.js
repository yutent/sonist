/**
 * 各种窗口创建
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/26 18:28:22
 */

const { BrowserWindow } = require('electron')

/**
 * 应用主窗口
 */
exports.createMainWindow = function (icon) {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    title: 'sonist',
    width: 820,
    height: 460,
    frame: false,
    titleBarStyle: 'hiddenInset',
    resizable: false,
    maximizable: false,
    icon,
    transparent: true,
    backgroundColor: '#00ffffff',
    vibrancy: 'dark',
    visualEffectState: 'active',
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true,
      nodeIntegration: true
    },
    show: false
  })

  // 然后加载应用的 index.html。

  win.loadURL('app://local/index.html')

  win.on('ready-to-show', _ => {
    win.show()
    // win.openDevTools()
  })

  win.on('close', ev => {
    ev.preventDefault()
    win.hide()
  })

  return win
}

/**
 * 应用迷你窗口
 */
exports.createMiniWindow = function (screen) {
  let win = new BrowserWindow({
    title: '',
    width: 320,
    height: 60,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    x: screen.width - 320,
    y: 0,
    show: false,
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true,
      nodeIntegration: true
    }
  })

  win.loadURL('app://local/mini-win.html')
  return win
}
