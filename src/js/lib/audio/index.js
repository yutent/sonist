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

class AudioTrack {
  constructor(elem) {
    var AC = new AudioContext()

    this._el = elem

    this.gain = AC.createGain()

    this._track = AC.createMediaElementSource(elem)
      .connect(this.gain)
      .connect(AC.destination)

    this.__playFn = $.bind(elem, 'timeupdate', _ => {
      this.emit('play', elem.currentTime)
    })
    this.__stopFn = $.bind(elem, 'ended', _ => {
      this.emit('stop')
    })
  }

  set volume(val) {
    if (this.gain) {
      this.gain.gain.value = val
    }
  }

  destroy() {
    $.unbind(this._el, 'timeupdate', this.__playFn)
    $.unbind(this._el, 'ended', this.__stopFn)
    this.removeAllListeners()

    this._track.disconnect()

    this._el.src = ''
    this._el.currentTime = 0
    this._el.pause()

    delete this.__playFn
    delete this.__stopFn
    delete this._el
    delete this.gain
    delete this._track
  }
}

export default class Player {
  constructor() {
    hide(this, '__LIST__', [])
    hide(this, 'props', {
      curr: '',
      stat: 'ready',
      volume: 0.5,
      duration: 0
    })
    hide(this, 'track', null)
  }

  load(list) {
    this.stop()
    this.__LIST__ = list
  }

  async _getTrack(file) {
    hide(this, '__AUDIO__', new Audio())

    this.__AUDIO__.src = URL.createObjectURL(
      await fetch(file).then(r => r.blob())
    )

    this.track = new AudioTrack(this.__AUDIO__)
    this.track.volume = this.props.volume

    this.track.on('play', t => this.emit('play', t))
    this.track.on('stop', _ => this.emit('stop'))
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
    if (this.track) {
      this.track.volume = val
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
  async play(id, force = false) {
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
      await this._getTrack(url)

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
      this.track.destroy()
      this.props.stat = 'stoped'
    }
  }
}

util.inherits(AudioTrack, EventEmitter)
util.inherits(Player, EventEmitter)
