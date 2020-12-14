/**
 * 各种窗口创建
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/27 13:59:55
 */

const { BrowserWindow } = require('electron')

const { createAppTray, createLrcTray, ctrlTrayBtn } = require('./tray.js')
const createMenu = require('./menu.js')

/**
 * 应用主窗口
 */
exports.createMainWindow = function(icon) {
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

  createAppTray(win)
  ctrlTrayBtn(win)
  createLrcTray(win)

  createMenu(win)

  win.on('ready-to-show', _ => {
    win.show()
    win.openDevTools()
  })

  win.on('close', ev => {
    ev.preventDefault()
    win.hide()
  })

  return win
}
