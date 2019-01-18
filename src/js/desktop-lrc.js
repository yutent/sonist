/**
 * {桌面歌词}
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/17 19:35:29
 */

'use strict'

import '/lib/anot.next.js'

const { remote } = require('electron')

const WIN = remote.getCurrentWindow()

Anot({
  $id: 'lrc',
  state: {
    lrc: {
      l: { bg: '#fff', txt: '暂无歌词...' },
      r: { bg: '', txt: '' }
    },
    isLock: false
  },
  mounted() {
    WIN.on('ktv-lrc', lrc => {
      this.lrc = lrc
    })
  },
  methods: {
    quit(force) {
      // WIN.close()
      WIN.hide()
    },
    lock() {
      WIN.setMovable(this.isLock)
      this.isLock = !this.isLock
    }
  }
})
