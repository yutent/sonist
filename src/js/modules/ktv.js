/**
 * ktv模块
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/13 21:43:50
 */

'use strict'

import Api from '/js/api.js'
import Local from '/js/modules/local.js'

const { ipcRenderer } = require('electron')
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

    closeKtvMode() {
      this.ktvMode = 0
      this.lrcSearchBoxShow = false
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
        })
      }
    },

    useThisLrc(it) {
      Api.getSongInfoByHash(it.hash, it.albumId).then(json => {
        if (json.lyrics) {
          let { id } = SONIST.getCurrSong()

          // 本地音乐才需要更新一些额外字段
          // 试听列表的音乐, 只更新歌词
          if (SONIST.target === 'local') {
            let song = LS.get(id)

            song.album = json.album_name
            song.albumId = json.album_id
            song.kgHash = json.hash
            song.cover = json.img

            LS.update(id, song)
            Local.list.set(SONIST.__CURR__, song)

            SONIST.clear()
            SONIST.push(LS.getAll())

            ipcRenderer.send('sonist', { type: 'set-music', data: LS.getAll() })

            this.updateCurr(song)
            this.draw(true)
          }

          ipcRenderer.send('sonist', {
            type: 'save-lrc',
            id,
            data: json.lyrics
          })
          LYRICS.__init__(id)

          layer.toast('歌词应用成功...')

          this.closeLrcSearch()
        } else {
          layer.alert('该歌曲没有上传歌词...')
        }
      })
    }
  }
}
