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
    list: [] //歌手列表
  },
  methods: {
    __init__() {},
    play() {}
  }
})
