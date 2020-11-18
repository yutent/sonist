/**
 * 托盘
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/21 20:42:07
 */

'use strict'

const { ipcMain, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

function ctrlTrayBtn() {
  var prev = new Tray(path.join(__dirname, '../images/ctrl/prev.png'))
  var next = new Tray(path.join(__dirname, '../images/ctrl/next.png'))
}

exports.createAppTray = function(win) {
  var tray = new Tray(path.join(__dirname, '../images/trays/trayTemplate.png'))
  tray.setIgnoreDoubleClickEvents(true)
  // let menuList = Menu.buildFromTemplate([
  //   {
  //     label: '显示主窗口',
  //     click() {
  //       win.webContents.send('dock-click')
  //     }
  //   },
  //   { type: 'separator' },
  //   { label: '退出', role: 'quit' }
  // ])
  // if (process.platform === 'darwin') {
  //   tray.on('click', _ => {
  //     win.webContents.send('dock-click')
  //   })
  //   tray.on('right-click', _ => {
  //     tray.popUpContextMenu(menuList)
  //   })
  // } else {
  //   tray.setContextMenu(menuList)
  // }
}

exports.createLrcTray = function(win) {
  var nullImage = nativeImage.createEmpty()
  var topbarLrc = new Tray(nullImage)
  topbarLrc.setTitle('这是顶栏歌词, blablablabla...')
  topbarLrc.setIgnoreDoubleClickEvents(true)

  // ctrlTrayBtn()
}
