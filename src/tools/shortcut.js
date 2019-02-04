/**
 * 全局局势键
 * @author yutent<yutent@doui.cc>
 * @date 2019/02/04 23:12:46
 */

'use strict'

const { app, globalShortcut: GS } = require('electron')

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

    // 音量控制
    GS.register('VolumeUp', _ => {
      win.emit('gs-ctrl', 'vu')
    })
    GS.register('VolumeDown', _ => {
      win.emit('gs-ctrl', 'vd')
    })
    GS.register('VolumeMute', _ => {
      win.emit('gs-ctrl', 'mute')
    })
  }
}
