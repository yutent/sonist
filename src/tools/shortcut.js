/**
 * 全局局势键
 * @author yutent<yutent@doui.cc>
 * @date 2019/02/04 23:12:46
 */

'use strict'

const { globalShortcut: GS } = require('electron')

module.exports = {
  __init__(win) {
    // 播放控制...
    GS.register('MediaNextTrack', _ => {
      win.emit('gs-ctrl', 'next')
    })
    GS.register('MediaPreviousTrack', _ => {
      win.emit('gs-ctrl', 'prev')
    })
    GS.register('MediaStop', _ => {
      win.emit('gs-ctrl', 'stop')
    })
    GS.register('MediaPlayPause', _ => {
      win.emit('gs-ctrl', 'play')
    })

    // others

    GS.register('Super+Alt+Space', _ => {
      win.emit('gs-ctrl', 'play')
    })

    GS.register('Super+Alt+Left', _ => {
      win.emit('gs-ctrl', 'prev')
    })

    GS.register('Super+Alt+Right', _ => {
      win.emit('gs-ctrl', 'next')
    })

    GS.register('Super+Alt+Up', _ => {
      win.emit('gs-ctrl', 'vu')
    })

    GS.register('Super+Alt+Down', _ => {
      win.emit('gs-ctrl', 'vd')
    })

    GS.register('Super+Alt+R', _ => {
      win.emit('gs-ctrl', 'lrc')
    })

    GS.register('Super+Alt+Shift+M', _ => {
      win.emit('gs-ctrl', 'mini')
    })
  }
}
