/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/16 16:21:52
 */

import Anot from '/js/lib/anot.js'
import '/js/lib/scroll/index.js'

import Keyboard from '/js/lib/keyboard/index.js'
import app from '/js/lib/socket.js'
import fetch from '/js/lib/fetch/index.js'

import Player from '/js/lib/audio/index.js'

const id3 = require('music-metadata')

const MODE_DICT = { 1: 'all', 2: 'single', 3: 'random' }

var kb = new Keyboard()

var player = new Player()

window.fetch = fetch
window.player = player

Anot({
  $id: 'app',
  state: {
    defaultCover: '/images/disk.png',
    isplaying: false,
    playmode: +Anot.ls('app_mode') || 1,
    mute: false,
    volume: +Anot.ls('app_volume') || 50,
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
    progress: 0,
    curr: -1,
    list: []
  },
  async mounted() {
    var list = app.dispatch('get-all-songs')
    // var list = app.dispatch('scan-dir', { dir: '/Volumes/extends/music' })

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
    kb.on(['down'], ev => {
      var vol = +this.volume - 5
      if (vol < 0) {
        vol = 0
      }
      this.volume = vol
    })
    kb.on(['up'], ev => {
      var vol = +this.volume + 5
      if (vol > 100) {
        vol = 100
      }
      this.volume = vol
    })

    // for (let it of list) {
    //   let { album, artist, title, duration } = await this.getID3(it.file_path)

    //   it.name = title || it.name
    //   it.artist = artist
    //   it.album = album
    //   it.duration = duration
    //   app.dispatch('add-song', {
    //     name: it.name,
    //     artist,
    //     album,
    //     duration,
    //     file_path: it.path
    //   })
    // }
    this.list = list

    player.volume = this.volume / 100
    player.load(list.map(it => `sonist://${it.file_path}`))

    player.on('play', time => {
      this.song.time = time
    })
    player.on('stop', _ => {
      var idx = this.curr
      var repeat = false
      switch (this.playmode) {
        case 1: // all
          idx++
          if (idx >= this.list.length) {
            idx = 0
          }
          break
        case 2: // single
          repeat = true
          break
        case 3: // random
          idx = ~~(Math.random() * this.list.length)
          break
      }

      this.playSong(this.list[idx], idx, repeat)
    })
  },
  watch: {
    volume(v) {
      Anot.ls('app_volume', v)
      player.volume = v / 100
    },
    playmode(v) {
      Anot.ls('app_mode', v)
    },
    progress(v) {
      var t = +(this.song.duration * (v / 712)).toFixed(2)
      player.seek(t)
    }
  },
  methods: {
    play(act) {
      var idx = this.curr
      var repeat = false

      switch (act) {
        case 0:
          if (idx > -1) {
            player.play(-1)
          } else {
            this.playSong(0)
          }
          this.isplaying = !this.isplaying
          break

        default:
          switch (this.playmode) {
            case 1: // all
              idx += act
              if (idx < 0) {
                idx = this.list.length - 1
              }
              if (idx >= this.list.length) {
                idx = 0
              }
              break
            case 2: // single
              if (idx === -1) {
                idx = ~~(Math.random() * this.list.length)
              }
              repeat = true
              break
            case 3: // random
              idx = ~~(Math.random() * this.list.length)
              break
          }

          this.playSong(idx, repeat)

          break
      }
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
    previewSong(it) {
      var { album, artist, name, cover } = it
      Object.assign(this.preview, { album, artist, name, cover })
    },
    playSong(i, repeat) {
      //
      var it = this.list[i]

      if (this.curr === i) {
        if (repeat) {
          this.song.time = 0
          player.play(-1, repeat)
        }
        return
      }
      this.curr = i
      this.song.name = it.name
      this.song.artist = it.artist
      this.song.duration = it.duration
      this.song.src = `file://${it.file_path}`
      this.song.time = 0
      this.isplaying = true
      this.previewSong(it)
      player.play(i)
    }
  }
})
