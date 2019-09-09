/**
 * 全局局势键
 * @author yutent<yutent@doui.cc>
 * @date 2019/02/04 23:12:46
 */

'use strict'

const { app, globalShortcut: GS } = require('electron')

module.exports = {
  __init__() {
    // 播放控制...
    GS.register('MediaNextTrack', _ => {
      app.__MAIN__.emit('gs-ctrl', 'next')
    })
    GS.register('MediaPreviousTrack', _ => {
      app.__MAIN__.emit('gs-ctrl', 'prev')
    })
    GS.register('MediaStop', _ => {
      app.__MAIN__.emit('gs-ctrl', 'stop')
    })
    GS.register('MediaPlayPause', _ => {
      app.__MAIN__.emit('gs-ctrl', 'play')
    })

    // others

    GS.register('Super+Alt+Space', _ => {
      app.__MAIN__.emit('gs-ctrl', 'play')
    })

    GS.register('Super+Alt+Left', _ => {
      app.__MAIN__.emit('gs-ctrl', 'prev')
    })

    GS.register('Super+Alt+Right', _ => {
      app.__MAIN__.emit('gs-ctrl', 'next')
    })

    GS.register('Super+Alt+Up', _ => {
      app.__MAIN__.emit('gs-ctrl', 'vu')
    })

    GS.register('Super+Alt+Down', _ => {
      app.__MAIN__.emit('gs-ctrl', 'vd')
    })

    GS.register('Super+Alt+R', _ => {
      app.__MAIN__.emit('gs-ctrl', 'lrc')
    })

    GS.register('Super+Alt+Shift+M', _ => {
      app.__MAIN__.emit('gs-ctrl', 'mini')
    })
  }
}
