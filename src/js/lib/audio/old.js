/**
 * 播放器
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/23 23:14:40
 */

'use strict'

const { EventEmitter } = require('events')
const util = require('util')
const path = require('path')

class AudioPlayer {
  constructor() {
    this.__PLAYER__ = new Audio()
    this.__IS_PLAYED__ = false
    this.__CURR__ = -1 // 当前播放的歌曲的id
    this.__LIST__ = [] //播放列表
    this.__PLAY_MODE__ = 'all' // all | single | random
    this.__PLAYER__.volume = 0.7

    this.__init__()
  }

  __init__() {
    this.__PLAYER__.addEventListener(
      'timeupdate',
      _ => {
        this.emit('play', this.__PLAYER__.currentTime)
      },
      false
    )

    this.__PLAYER__.addEventListener(
      'ended',
      _ => {
        this.emit('stop')
      },
      false
    )
  }

  get stat() {
    return this.__LIST__.length ? 'ready' : 'stop'
  }

  get IS_MUTED() {
    return this.__PLAYER__.muted
  }

  set volume(val) {
    this.__PLAYER__.muted = false
    this.__PLAYER__.volume = val / 100
  }

  set mode(val = 'all') {
    this.__PLAY_MODE__ = val
  }

  clear() {
    this.__LIST__ = []
  }

  push(songs) {
    this.__LIST__.push.apply(this.__LIST__, songs)
  }

  getCurrSong() {
    if (this.__CURR__ > -1) {
      return this.__LIST__[this.__CURR__]
    }
    return null
  }

  // 上一首
  prev() {
    let id = this.__CURR__

    switch (this.__PLAY_MODE__) {
      case 'all':
        id--
        if (id < 0) {
          id = this.__LIST__.length - 1
        }
        break
      case 'random':
        id = (Math.random() * this.__LIST__.length) >>> 0
        break
      // single
      default:
        break
    }

    this.play(id)
    return Promise.resolve(this.__LIST__[id])
  }

  // 下一首
  next() {
    let id = this.__CURR__

    switch (this.__PLAY_MODE__) {
      case 'all':
        id++
        if (id >= this.__LIST__.length) {
          id = 0
        }
        break
      case 'random':
        id = (Math.random() * this.__LIST__.length) >>> 0
        break
      // single
      default:
        break
    }

    this.play(id)
    return Promise.resolve(this.__LIST__[id])
  }

  // 播放
  play(id) {
    // 播放列表里没有数据的话, 不作任何处理
    if (!this.__LIST__.length) {
      return Promise.reject(this.__LIST__)
    }

    // 有ID的话,不管之前是否在播放,都切换歌曲
    if (id !== undefined) {
      let song = this.__LIST__[id]
      if (song) {
        this.__CURR__ = id
        this.__IS_PLAYED__ = true

        this.__PLAYER__.pause()
        this.__PLAYER__.currentTime = 0
        this.__PLAYER__.src = song.path
        this.__PLAYER__.play()

        Anot.ls('last-play', id)
        return Promise.resolve(song)
      }
      return Promise.reject('song not found')
    } else {
      if (!this.__IS_PLAYED__) {
        this.__IS_PLAYED__ = true
        this.__PLAYER__.play()
      }
      return Promise.resolve(true)
    }
  }

  // 暂停
  pause() {
    if (!this.__IS_PLAYED__) {
      return
    }
    this.__IS_PLAYED__ = false

    this.__PLAYER__.pause()
  }

  // 切换静音
  mute() {
    if (this.__CURR__ < 0) {
      return false
    }
    this.__PLAYER__.muted = !this.__PLAYER__.muted
    return this.__PLAYER__.muted
  }

  // 跳到指定位置播放
  seek(time) {
    if (this.__CURR__ < 0) {
      return
    }
    this.__PLAYER__.currentTime = time
  }
}

util.inherits(AudioPlayer, EventEmitter)

export default AudioPlayer
