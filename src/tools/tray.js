/**
 * 托盘
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/21 20:42:07
 */

'use strict'

const { app, Tray, Menu } = require('electron')
const path = require('path')
const ROOT = __dirname

module.exports = function(win) {
  app.__TRAY__ = new Tray(path.join(ROOT, '../images/trays/trayTemplate.png'))
  let menuList = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click() {
        win.webContents.send('dock-click')
      }
    },
    { type: 'separator' },
    { label: '退出', role: 'quit' }
  ])

  if (process.platform === 'darwin') {
    app.__TRAY__.on('click', _ => {
      win.webContents.send('dock-click')
    })
    app.__TRAY__.on('right-click', _ => {
      app.__TRAY__.popUpContextMenu(menuList)
    })
  } else {
    app.__TRAY__.setContextMenu(menuList)
  }
}
