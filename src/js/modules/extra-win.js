/**
 * 额外的小窗口
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/21 21:24:04
 */

'use strict'

const {
  remote: { BrowserWindow }
} = require('electron')

export const createDesktopLrcWindow = function(screen) {
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
    show: false
  })

  win.loadURL('app://sonist/desktop-lrc.html')
  return win
}

export const createMiniWindow = function(screen) {
  let win = new BrowserWindow({
    title: '',
    width: 480,
    height: 60,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    x: screen.size.width - 480,
    y: 0,
    skipTaskbar: true,
    show: false
  })

  win.loadURL('app://sonist/mini-win.html')
  return win
}
