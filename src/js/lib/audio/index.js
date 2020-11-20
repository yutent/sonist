/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/19 17:32:19
 */

import $ from '../utils.js'
import fetch from '../fetch/index.js'

const { EventEmitter } = require('events')
const util = require('util')

function hide(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    enumerable: false,
    configurable: true
  })
}

export default class Player {
  constructor() {
    hide(this, '__LIST__', [])
    hide(this, '__AC__', new AudioContext())
    hide(this, 'props', {
      curr: '',
      stat: 'ready',
      volume: 0.5,
      duration: 0
    })
    hide(this, 'track', null)
    hide(this, 'gain', null)

    this.__main__()
  }

  __main__() {
    hide(this, '__AUDIO__', new Audio())

    this.__playFn = $.bind(this.__AUDIO__, 'timeupdate', _ => {
      this.emit('play', this.__AUDIO__.currentTime)
    })
    this.__stopFn = $.bind(this.__AUDIO__, 'ended', _ => {
      this.props.stat = 'paused'
      this.emit('stop')
    })
  }

  __destroy__() {
    $.unbind(this.__AUDIO__, 'timeupdate', this.__playFn)
    $.unbind(this.__AUDIO__, 'ended', this.__stopFn)

    this.__AUDIO__.pause()
    this.__AUDIO__.currentTime = 0

    delete this.__playFn
    delete this.__stopFn
  }

  load(list) {
    this.stop()
    this.__LIST__ = list
  }

  async _getTrack(file) {
    this.__main__()
    this.__AUDIO__.src = URL.createObjectURL(
      await fetch(file).then(r => r.blob())
    )

    this.gain = this.__AC__.createGain()
    this.gain.gain.value = this.volume

    this.track = this.__AC__.createMediaElementSource(this.__AUDIO__)
    this.track.connect(this.gain).connect(this.__AC__.destination)
  }

  get volume() {
    return this.props.volume
  }

  set volume(val) {
    val = +val
    if (val < 0) {
      val = 0
    }
    if (val > 1) {
      val = 1
    }
    this.props.volume = val
    if (this.gain) {
      this.gain.gain.value = val
    }
  }

  get time() {
    return this.__AUDIO__.currentTime
  }

  get stat() {
    return this.props.stat
  }

  /**
   * id: 歌曲序号
   * force: 强制重新播放
   */
  play(id, force = false) {
    if (id === -1) {
      if (this.track) {
        if (force) {
          this.seek(0)
          this.props.stat = 'paused'
        }
        if (this.stat === 'playing') {
          this.__AUDIO__.pause()
          this.props.stat = 'paused'
        } else if (this.stat === 'paused') {
          this.__AUDIO__.play()
          this.props.stat = 'playing'
        }
      }
    } else {
      var url = this.__LIST__[id]
      if (!url || this.props.curr === url) {
        return
      }

      if (this.track) {
        this.stop()
      }

      this.props.curr = url
      this._getTrack(url)

      this.__AUDIO__.play()
      this.props.stat = 'playing'
    }
  }

  seek(time) {
    if (this.track) {
      this.__AUDIO__.currentTime = time
    }
  }

  stop() {
    if (this.track) {
      this.track = null
      this.gain = null
      this.__destroy__()
      this.props.stat = 'stoped'
    }
  }
}

util.inherits(Player, EventEmitter)
