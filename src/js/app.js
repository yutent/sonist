/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/16 16:21:52
 */

import Anot from '/js/lib/anot.js'
import '/js/lib/scroll/index.js'

Anot({
  $id: 'app',
  state: {
    isplaying: true,
    playmode: 1,
    mute: false
  },
  methods: {
    play() {
      this.isplaying = !this.isplaying
    },
    switchMode() {
      var n = this.playmode + 1
      if (n > 3) {
        n = 1
      }
      this.playmode = n
    },
    toggleMute() {
      this.mute = !this.mute
    }
  }
})
