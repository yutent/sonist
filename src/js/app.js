/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/16 16:21:52
 */

import Anot from '/js/lib/anot.js'
import '/js/lib/scroll/index.js'
import app from '/js/lib/socket.js'

// const id3 = require('jsmediatags')
const id3 = require('music-metadata')

Anot({
  $id: 'app',
  state: {
    isplaying: true,
    playmode: 1,
    mute: false,
    curr: 2,
    list: []
  },
  async mounted() {
    var list = app.dispatch('scan-dir', { path: '/Volumes/extends/music' })

    this.list = list

    for (let it of this.list) {
      let { album, artist, title, duration } = await this.getID3(it.path)

      it.name = title || it.name
      it.artist = artist || '未知歌手'
      it.album = album
      it.duration = Anot.filters.time(duration)
    }
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
    },
    getID3(file) {
      return id3.parseFile(file).then(res => {
        let {
          common: { album, artist, title },
          format: { duration }
        } = res
        return { album, artist, title, duration: ~~duration }
      })
    }
  }
})
