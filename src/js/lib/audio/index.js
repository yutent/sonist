/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/19 17:32:19
 */

import fetch from '../fetch/index.js'

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
    hide(this, '__AUDIO__', new Audio())
    hide(this, 'props', {
      curr: '',
      stat: 'ready',
      volume: 0.5,
      mode: 'all', // 循环模式, all, single, rand
      time: 0,
      duration: 0
    })
    hide(this, 'track', null)
  }

  load(list) {
    this.stop()
    this.__LIST__ = list
  }

  async _getTrack(file) {
    this.__AUDIO__.src = URL.createObjectURL(
      await fetch(file).then(r => r.blob())
    )
    console.log(this.__AUDIO__)
    return this.__AC__.createMediaElementSource(this.__AUDIO__)
  }

  get volume() {
    return this.props.volume
  }

  set volume(val) {
    val = +val || 0.5
    if (val < 0) {
      val = 0
    }
    if (val > 1) {
      val = 1
    }
    this.props.volume = val
  }

  get mode() {
    return this.props.mode
  }

  set mode(val) {
    this.props.mode = val
  }

  get time() {
    return this.props.time
  }

  get stat() {
    return this.props.stat
  }

  async play(id) {
    var url, gain

    if (id === undefined) {
      if (this.track) {
        if (this.stat === 'playing') {
          this.props.time = this.track.context.currentTime
          this.__AUDIO__.pause()
          this.props.stat = 'paused'
        } else if (this.stat === 'paused') {
          this.__AUDIO__.play()
          this.props.stat = 'playing'
        }
      }
    } else {
      url = this.__LIST__[id]
      if (!url || this.props.curr === url) {
        return
      }

      gain = this.__AC__.createGain()

      if (this.track) {
        this.stop()
      }

      gain.gain.value = this.volume

      this.track = await this._getTrack(url)
      this.track.connect(gain).connect(this.__AC__.destination)

      this.__AUDIO__.play()
      this.props.stat = 'playing'
    }
  }

  seek(time) {
    this.props.time = time
  }

  stop() {
    if (this.track) {
      this.__AUDIO__.pause()
      this.track = null
      this.props.time = 0
      this.props.stat = 'stoped'
    }
  }
}
