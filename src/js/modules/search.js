/**
 * 本地音乐模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/24 17:00:48
 */

'use strict'

import Api from '/js/api.js'

const log = console.log

const dict = {}

export default Anot({
  $id: 'search',
  state: {
    curr: '',
    history: [], // 搜索历史
    list: [] // 搜索结果列表
  },
  methods: {
    __init__() {},
    play(it, idx) {
      // SONIST.clear()
      log(it.hash, it.albumId)
      Api.getSongInfoByHash(it.hash, it.albumId).then(json => {
        log(json)
      })
    },
    delThis(it, ev) {
      this.history.remove(it)
      delete dict[it.key]
    },
    toggleHistory(it) {
      this.curr = it.key
      this.list.clear()
      this.list.pushArray(dict[it.key])
    },
    search(txt) {
      if (txt === this.last) {
        return
      }

      let load = layer.load(1)
      this.list.clear()

      let key = Buffer.from(txt).toString('base64')

      this.history.push({ txt, key })

      this.curr = key

      Api.search(txt, 1, 50).then(list => {
        dict[key] = list.map(it => {
          return {
            title: it.SongName,
            artist: it.SingerName,
            album: it.AlbumName,
            albumId: it.AlbumID,
            duration: it.Duration,
            hash: it.FileHash
          }
        })
        layer.close(load)
        this.list.pushArray(dict[key])
      })
    }
  }
})
