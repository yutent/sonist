/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/16 16:21:52
 */

import Anot from '/js/lib/anot.js'
import '/js/lib/scroll/index.js'

import Keyboard from '/js/lib/keyboard/index.js'
import app from '/js/lib/socket.js'

// const id3 = require('jsmediatags')
const id3 = require('music-metadata')

var kb = new Keyboard()

Anot({
  $id: 'app',
  state: {
    isplaying: true,
    playmode: 1,
    mute: false,
    preview: {
      name: '',
      album: '',
      artist: '',
      cover: ''
    },
    song: {
      name: '',
      artist: '',
      src: '',
      time: 0,
      duration: 0
    },
    curr: 2,
    list: []
  },
  async mounted() {
    var list = app.dispatch('scan-dir', { path: '/Volumes/extends/music' })

    this.list = list

    for (let it of this.list) {
      let { album, artist, title, duration } = await this.getID3(it.path)

      it.name = title || it.name
      it.artist = artist
      it.album = album
      it.duration = duration
    }

    kb.on(['left'], ev => {
      var time = this.song.time - 5
      if (time < 0) {
        time = 0
      }
      this.song.time = time
    })
    kb.on(['right'], ev => {
      var time = this.song.time + 5
      if (time > this.song.duration) {
        time = this.song.duration
      }
      this.song.time = time
    })
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
    },
    prviewSong(it, i) {
      var { album, artist, name, cover } = it
      Object.assign(this.preview, { album, artist, name, cover })
    },
    playSong(it, i) {
      //
      this.curr = i
      this.song.name = it.name
      this.song.artist = it.artist
      this.song.duration = it.duration
      this.song.src = `file://${it.path}`
      this.song.time = 0
    }
  }
})
