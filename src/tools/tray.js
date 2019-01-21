/**
 * 托盘
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/21 20:42:07
 */

'use strict'

const { Tray, Menu } = require('electron')
const path = require('path')
const ROOT = __dirname

module.exports = function(win) {
  let tray = new Tray(
    path.resolve(__dirname, '../images/trays/trayTemplate.png')
  )
  let menuList = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click() {
        win.show()
      }
    },
    { type: 'separator' },
    { label: '退出', role: 'quit' }
  ])

  if (process.platform === 'darwin') {
    tray.on('click', _ => {
      win.show()
    })
    tray.on('right-click', _ => {
      tray.popUpContextMenu(menuList)
    })
  } else {
    tray.setContextMenu(menuList)
  }
}
