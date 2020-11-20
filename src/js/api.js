/**
 * 部分远程接口
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/20 19:07:32
 */

import fetch from './lib/fetch/index.js'

function tojson(r) {
  return r.json()
}

export default {
  searchLrc(keyword, duration) {
    return fetch('http://lyrics.kugou.com/search', {
      body: {
        client: 'pc',
        duration: duration * 1000,
        keyword,
        man: 'no',
        ver: 1
      }
    })
      .then(tojson)
      .then(r => {
        if (r.candidates && r.candidates.length) {
          return r.candidates.map(it => ({
            id: it.id,
            accesskey: it.accesskey,
            duration: it.duration,
            singer: it.singer,
            song: it.song
          }))
        }
        return []
      })
  },

  downloadLrc(id, accesskey) {
    return fetch('http://lyrics.kugou.com/download', {
      body: {
        client: 'pc',
        id,
        accesskey,
        ver: 1,
        fmt: 'lrc',
        charset: 'utf8'
      }
    })
      .then(tojson)
      .then(r => {
        if (r.status === 200 && r.content) {
          var lrc
          try {
            lrc = Buffer.from(r.content, 'base64').toString()
            lrc = lrc.split(/[\r\n]+/).join('\n')
          } catch (e) {
            console.error(e, r)
          }
          return lrc
        }
      })
  }
}
