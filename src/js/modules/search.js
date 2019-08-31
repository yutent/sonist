/**
 * 本地音乐模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/24 17:00:48
 */

'use strict'

import Api from '/js/api.js'

const { ipcRenderer } = require('electron')

const log = console.log

const dict = {}

export default Anot({
  $id: 'search',
  state: {
    tab: 'audition',
    curr: '', //当前播放
    history: [], // 搜索历史
    list: [] // 搜索结果列表
  },
  mounted() {
    dict.audition = ipcRenderer.sendSync('sonist', { type: 'get-temp' })
    TS.insert(dict.audition)

    this.__APP__ = Anot.vmodels.app

    this.__init__()
  },
  methods: {
    __init__() {
      if (!this.list.length) {
        this.list.pushArray(dict.audition)
      }
    },
    play(item, idx) {
      let song = item.$model

      // 如果之前是本地播放, 则将播放列表清空再切为试听列表
      if (SONIST.target === 'local') {
        SONIST.target = 'temp'
        SONIST.clear()
        SONIST.push(TS.getAll())
      }

      /**------------------------------
       * 在试听列表
      ------------------------------- */

      if (this.tab === 'audition') {
        if (song.id === this.curr) {
          return
        }
        return SONIST.play(idx).then(it => {
          this.__APP__.play(it)
          this.curr = it.id
        })
      }

      /**------------------------------
       * 在搜索列表
      ------------------------------- */

      // 避免重复增加
      if (TS.get(song.kgHash)) {
        if (song.kgHash === this.curr) {
          return
        }

        // 找到索引id
        for (let i = 0; i < dict.audition.length; i++) {
          if (dict.audition[i].id === song.kgHash) {
            idx = i
            break
          }
        }

        return SONIST.play(idx).then(it => {
          this.__APP__.play(it)
          this.curr = it.id
        })
      }

      song.id = song.kgHash

      Api.getSongInfoByHash(song.kgHash, song.albumId).then(json => {
        log(json)

        song.cover = json.img

        ipcRenderer.send('sonist', {
          type: 'save-lrc',
          id: song.id,
          data: json.lyrics
        })

        request.get(json.play_url, { dataType: 'arraybuffer' }).then(res => {
          song.path = ipcRenderer.sendSync('sonist', {
            type: 'save-cache',
            data: Buffer.from(res.body),
            file: song.kgHash
          })
          TS.insert(song)
          dict.audition.push(song)

          SONIST.push([song])
          SONIST.play(dict.audition.length - 1).then(it => {
            this.__APP__.play(it)
            this.curr = it.id
          })

          ipcRenderer.send('sonist', { type: 'set-temp', data: TS.getAll() })
        })
      })
    },
    delThis(it, ev) {
      this.history.remove(it)
      delete dict[it.key]
    },
    toggleHistory(it) {
      this.tab = it.key
      this.list.clear()
      this.list.pushArray(dict[it.key])
    },
    search(txt) {
      if (txt === this.last) {
        return
      }

      let load = layer.load(2)
      this.list.clear()

      Api.search(txt, 1, 50).then(list => {
        layer.close(load)
        if (!Array.isArray(list) || list.length < 1) {
          return layer.toast(`没有找到有关[${txt}]的音乐`)
        }

        let key = Buffer.from(txt).toString('base64')
        this.history.push({ txt, key })
        this.tab = key

        dict[key] = list.map(it => {
          return {
            title: it.SongName,
            artist: it.SingerName,
            album: it.AlbumName,
            albumId: it.AlbumID,
            duration: it.Duration,
            kgHash: it.FileHash
          }
        })

        this.list.pushArray(dict[key])
      })
    }
  }
})
