/**
 * 本地音乐模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/24 17:00:48
 */

'use strict'

import Api from '/js/api.js'

const log = console.log

export default Anot({
  $id: 'search',
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
  methods: {}
})
