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

  win.loadURL('http://127.0.0.1:10240/desktop-lrc.html')
  return win
}

export const createMiniWindow = function(screen, pwin) {
  let win = new BrowserWindow({
    title: '',
    width: 320,
    height: 60,
    frame: false,
    parent: pwin,
    resizable: false,
    alwaysOnTop: true,
    x: screen.size.width - 320,
    y: 0,
    skipTaskbar: true,
    show: false
  })

  win.loadURL('http://127.0.0.1:10240/mini-win.html')
  return win
}
