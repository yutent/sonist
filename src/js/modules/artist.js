/**
 * 歌手模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/24 17:00:48
 */

'use strict'

import Api from '/js/api.js'

const log = console.log

export default Anot({
  $id: 'artist',
  state: {
    filter: 'hot',
    list: [], //歌手列表
    display: 'artist', // list | artist | album
    artist: {
      avatar:
        'http://singerimg.kugou.com/uploadpic/softhead/240/20181023/20181023141706176.jpg',
      id: 3060,
      name: '薛之谦',
      info: '',
      songCount: 0,
      mvCount: 0,
      albumCount: 0
    },
    songList: [], //单曲列表
    albumList: [] //专辑列表
  },
  methods: {
    __init__() {
      // Api.getArtistList().then(json => {
      //   log(json)
      // })
      // this.getHotArtist()
      this.getArtistInfo()
    },
    search(ev) {
      let target = ev.target
      if (target.tagName !== 'SECTION') {
        return
      }
      let key = target.dataset.key

      this.filter = key

      switch (key) {
        case 'hot':
          this.getHotArtist()
          break
        default:
          key = key.split(',')
          this.getArtistList.apply(this, key)
      }
    },

    pickArtist(ev) {
      if (ev.target === ev.currentTarget) {
        return
      }
      let target = ev.target
      while (target.tagName !== 'LI') {
        target = target.parentNode
      }

      let { index } = target.dataset

      let artist = this.list[index]

      this.artist.id = artist.id
      this.artist.name = artist.name
      this.artist.avatar = artist.avatar

      this.display = 'artist'

      this.getArtistInfo()
    },

    showArtistInfo() {
      layer.open({
        type: 7,
        title: '歌手详细介绍',
        content: this.artist.info,
        fixed: true,
        maskClose: true,
        extraClass: 'artist-desc-layer'
      })
    },

    toArtistListPage() {
      this.display = 'list'
    },

    getArtistInfo() {
      Api.getArtistInfo(this.artist.id).then(json => {
        log(json)

        this.artist.info = json.data.intro.replace(/\n/g, '<br>')
        this.artist.songCount = json.data.songcount
        this.artist.mvCount = json.data.mvcount
        this.artist.albumCount = json.data.albumcount
      })
    },

    getHotArtist() {
      let cache = Anot.ss('hot-artist')
      if (cache) {
        cache = JSON.parse(cache)
        this.list.clear()
        this.list.pushArray(cache)
      } else {
        Api.getLastHot100Artists().then(json => {
          log(json)
          let list = json.data.info.map(it => {
            return {
              id: it.singerid,
              name: it.singername,
              avatar: it.imgurl.replace('{size}', '240'),
              fans: it.fanscount
            }
          })

          Anot.ss('hot-artist', JSON.stringify(list))

          this.list.clear()
          this.list.pushArray(list)
        })
      }
    },

    getArtistList(type, sextype) {
      // Api.getArtistList().then(json => {
      //   log(json)
      // })
    }
  }
})
