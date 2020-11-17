/**
 * 音乐APP接口
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/24 16:02:00
 */

'use strict'

import request from '/lib/request/index.js'

// `http://lyrics.kugou.com/search?client=pc&duration=188000&keyword=%E6%98%93%E7%83%8A%E5%8D%83%E7%8E%BA%20-%20%E4%BD%A0%E6%9B%BE%E6%98%AF%E5%B0%91%E5%B9%B4%20%28Live%29&man=no&ver=1`

// `http://lyrics.kugou.com/download?ver=1&client=pc&fmt=lrc&charset=utf8&accesskey=2128A0ED9B2F6B34C3AE23EA7ACC46A7&id=43066968`

const log = console.log

const BASE_API_URI = 'http://mobilecdnbj.kugou.com'

request.init({ dataType: 'json' })

const get = uri => {
  return request.get(BASE_API_URI + uri)
}

const post = uri => {
  return request.post(BASE_API_URI + uri)
}

export default {
  getLastHot100Artists() {
    return get('/api/v5/singer/list', {
      data: {
        sort: 1,
        showtype: 1,
        sextype: 0,
        musician: 0,
        pagesize: 100,
        plat: 2,
        type: 0,
        page: 1
      }
    }).then(res => {
      if (res.status === 200) {
        return res.body
      }
    })
  },

  getArtistList(sextype = 1, type = 1) {
    return get('/api/v5/singer/list', {
      data: {
        showtype: 2,
        musician: 0,
        type,
        sextype
      }
    }).then(res => {
      if (res.status === 200) {
        return res.body
      }
    })
  },

  getArtistInfo(singerid) {
    return get('/api/v3/singer/info', { data: { singerid } }).then(res => {
      if (res.status === 200) {
        return res.body
      }
    })
  },

  getArtistInfo(singerid) {
    return get('/api/v3/singer/info', { data: { singerid } }).then(res => {
      if (res.status === 200) {
        return res.body
      }
    })
  },

  getArtistSongs(singerid, page = 1) {
    return get('/api/v3/singer/song', {
      data: {
        sorttype: 2,
        pagesize: 50,
        singerid,
        area_code: 1,
        page
      }
    }).then(res => {
      if (res.status === 200) {
        return res.body
      }
    })
  },

  getArtistAlbums(singerid, page = 1) {
    return get('/api/v3/singer/album', {
      data: {
        pagesize: 50,
        singerid,
        area_code: 1,
        page
      }
    }).then(res => {
      if (res.status === 200) {
        return res.body
      }
    })
  },

  search(keyword, page = 1, pagesize = 20) {
    return request
      .get('https://songsearch.kugou.com/song_search_v2', {
        data: {
          keyword,
          platform: 'WebFilter',
          tag: '',
          page,
          pagesize
        }
      })
      .then(res => {
        if (res.status === 200) {
          return res.body.data.lists
        }
      })
  },

  getSongInfoByHash(hash, album_id = '') {
    return request
      .get('https://wwwapi.kugou.com/yy', {
        data: {
          r: 'play/getdata',
          hash,
          album_id
        }
      })
      .then(res => {
        if (res.status === 200) {
          return res.body.data
        }
      })
  }
}
