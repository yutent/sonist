/**
 * 菜单项
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/21 20:34:04
 */

'use strict'

const { Tray, Menu, shell } = require('electron')

module.exports = function(win) {
  let menuList = Menu.buildFromTemplate([
    {
      label: 'Sonist',
      submenu: [
        { role: 'about', label: '关于 Sonist' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤消重做' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '显示',
      submenu: [
        { label: '显示桌面歌词' },
        {
          type: 'separator'
        },
        { label: '迷你模式' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          role: 'minimize',
          label: '最小化',
          click() {
            win.minimize()
          }
        }
      ]
    },
    {
      role: 'help',
      label: '帮助',
      submenu: [
        {
          label: '官网',
          click() {
            shell.openExternal('https://github.com/yutent/sonist')
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menuList)
}
