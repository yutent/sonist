/**
 * 迷你模式
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/22 17:52:23
 */

'use strict'

import '/lib/anot.next.js'

const { remote, ipcRenderer } = require('electron')

const WIN = remote.getCurrentWindow()

ipcRenderer.on('post-main', (ev, val) => {
  window.__MAIN__ = val
})

Anot({
  $id: 'mini',
  state: {
    isPlaying: false,
    curr: {
      id: '',
      title: '',
      artist: '',
      album: '',
      time: 0,
      duration: 0,
      cover: ''
    },
    pinned: true,
    playMode: Anot.ls('play-mode') >>> 0
  },
  mounted() {
    WIN.on('mini-init', song => {
      this.curr = song
      if (song.id) {
        this.isPlaying = true
      }
      this.playMode = Anot.ls('play-mode') >>> 0
    })
  },
  methods: {
    handleCtrl(ev) {
      let key = ev.target.dataset.key

      switch (key) {
        case 'prev':
          remote.app.__MAIN__.emit('mini-ctrl', 'prev')
          break
        case 'play':
          this.isPlaying = !this.isPlaying
          remote.app.__MAIN__.emit('mini-ctrl', 'play')
          break
        case 'next':
          remote.app.__MAIN__.emit('mini-ctrl', 'next')
          break
        default:
          break
      }
    },

    handleTool(ev) {
      let key = ev.target.dataset.key
      switch (key) {
        case 'pin':
          this.pinned = !this.pinned
          WIN.setAlwaysOnTop(this.pinned)
          break
        case 'quit':
          WIN.hide()
          remote.app.__MAIN__.show()
          break
        default:
          break
      }
    },
    handleAction(ev) {
      let key = ev.target.dataset.key
      switch (key) {
        case 'lrc':
          remote.app.__MAIN__.emit('mini-ctrl', 'desktoplrc')
          break
        case 'mode':
          let mod = this.playMode
          mod++
          if (mod > 2) {
            mod = 0
          }
          this.playMode = mod
          remote.app.__MAIN__.emit('mini-ctrl', {
            name: 'play-mode',
            value: mod
          })
      }
    }
  }
})
