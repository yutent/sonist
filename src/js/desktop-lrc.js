/**
 * {桌面歌词}
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/17 19:35:29
 */

'use strict'

import '/lib/anot.js'

const { remote } = require('electron')

const WIN = remote.getCurrentWindow()

const $doc = Anot(document)
const log = console.log

window.WIN = WIN

Anot({
  $id: 'lrc',
  state: {
    isMac: process.platform === 'darwin',
    lrc: {
      l: { bg: '#fff', txt: '暂无歌词...' },
      r: { bg: '', txt: '' }
    },
    isLock: +Anot.ls('lock-lrc')
  },
  mounted() {
    WIN.on('ktv-lrc', lrc => {
      this.lrc = lrc
    })
  },
  skip: ['isMac'],
  methods: {
    quit(force) {
      WIN.hide()
    },
    lock() {
      WIN.setMovable(!!this.isLock)
      this.isLock = this.isLock ^ 1
      Anot.ls('lock-lrc', this.isLock)
    }
  }
})
