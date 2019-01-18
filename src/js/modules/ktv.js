/**
 * ktv模块
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/13 21:43:50
 */

'use strict'

import Api from '/js/api.js'
import Local from '/js/modules/local.js'

const fs = require('iofs')
const path = require('path')
const { app } = require('electron').remote

const HOME_PATH = app.getPath('appData')
const MUSIC_DB_PATH = path.join(HOME_PATH, 'music.db')
const LYRICS_PATH = path.join(HOME_PATH, 'lyrics')
const log = console.log

export default {
  data: {
    allLrcView: false,
    allLrc: '',
    lrc: {
      l: { bg: '', txt: '' },
      r: { bg: '', txt: '' }
    },
    lrcSearchBoxShow: false,
    lrcForm: {
      input: '',
      __input__: '', //缓存之前的搜索词
      result: []
    }
  },
  methods: {
    forwardLrc(time) {
      LYRICS.forward(time)
      layer.toast(`歌词已${time > 0 ? '提前' : '延后'} ${time} 秒`)
    },
    toggleLrcView() {
      this.allLrcView = !this.allLrcView
    },
    showLrcSearch() {
      this.lrcForm.input = `${this.curr.artist} ${this.curr.title}`
      this.lrcSearchBoxShow = true
      this.searchLrc({ keyCode: 13 })
    },
    closeLrcSearch() {
      this.lrcSearchBoxShow = false
    },
    searchLrc(e) {
      if (e.keyCode === 13) {
        let { input, __input__ } = this.lrcForm

        // 搜索词未变,直接忽略
        if (input === __input__) {
          return
        }

        Api.search(input).then(list => {
          this.lrcForm.__input__ = input
          this.lrcForm.result = list.map(it => {
            return {
              title: it.SongName,
              artist: it.SingerName,
              album: it.AlbumName,
              albumId: it.AlbumID,
              duration: it.Duration,
              hash: it.FileHash
            }
          })
          log(list, this.lrcForm.result)
        })
      }
    },

    useThisLrc(it) {
      Api.getSongInfoByHash(it.hash, it.albumId).then(json => {
        if (json.lyrics) {
          let { id } = SONIST.getCurrSong()

          let song = LS.get(id)

          song.album = json.album_name
          song.albumId = json.album_id
          song.kgHash = json.hash
          song.cover = json.img
          song.lyrics = path.join(LYRICS_PATH, `${song.id}.lrc`)

          LS.insert(song)
          Local.list.set(SONIST.__CURR__, song)

          SONIST.clear()
          SONIST.push(LS.getAll())

          this.updateCurr(song)
          this.draw(true)

          fs.echo(json.lyrics, song.lyrics)
          fs.echo(JSON.stringify(LS.getAll(), '', 2), MUSIC_DB_PATH)

          LYRICS.__init__(song.lyrics)

          layer.toast('歌词应用成功...')

          this.closeLrcSearch()
        } else {
          layer.alert('该歌曲没有上传歌词...')
        }
      })
    }
  }
}
