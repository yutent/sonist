/**
 * 迷你模式
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/22 17:52:23
 */

'use strict'

import '/lib/anot.next.js'

const { remote } = require('electron')

const WIN = remote.getCurrentWindow()
const MAIN_WIN = WIN.getParentWindow()

window.WIN = WIN
Anot({
  $id: 'mini',
  state: {
    isPlaying: false,
    curr: {
      id: '',
      title: '假装不合适',
      artist: '',
      album: '',
      time: 0,
      duration: 0,
      cover: '/images/album.png'
    },
    pinned: true,
    playMode: Anot.ls('play-mode') >>> 0
  },
  mounted() {
    WIN.on('ktv-lrc', lrc => {
      this.lrc = lrc
    })
  },
  methods: {
    play() {},
    nextSong() {},

    handleTool(ev) {
      let key = ev.target.dataset.key
      switch (key) {
        case 'pin':
          this.pinned = !this.pinned
          WIN.setAlwaysOnTop(this.pinned)
          break
        case 'quit':
          WIN.hide()
          MAIN_WIN.show()
          break
        default:
          break
      }
    },
    handleAction(ev) {
      let key = ev.target.dataset.key
      switch (key) {
        case 'lrc':
          MAIN_WIN.emit('toggle-desktoplrc')
          break
        case 'mode':
          let mod = this.playMode
          mod++
          if (mod > 2) {
            mod = 0
          }
          this.playMode = mod
          MAIN_WIN.emit('play-mode', mod)
      }
    }
  }
})
