/**
 * 歌词模块
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/04 16:25:25
 */

'use strict'

const log = console.log
const fs = require('iofs')
const { EventEmitter } = require('events')
const util = require('util')

class Lyrics {
  // 歌词初始化
  __init__(lrcFile) {
    this.lib = []
    this.curr = []
    this.lrc = {
      l: { bg: '', txt: '' },
      r: { bg: '', txt: '' }
    }

    if (!lrcFile || !fs.exists(lrcFile)) {
      log('no lrc file', lrcFile)
      return false
    }

    this.__LRC__ = lrcFile

    // log(this.__LRC__)

    let lrc = fs
      .cat(lrcFile)
      .toString('utf8')
      .split('\n')

    this.lib = lrc
      .map(it => {
        if (it) {
          let matches = it.match(/^\[([0-9\.\:]+)\](.+)/)
          let time = matches[1]
          let txt = matches[2]
          time = time.split(/[:\.]/).map(t => +t)
          let start = time[0] * 60 + time[1] + time[2] / 100
          return { start, txt }
        }
        return
      })
      .filter(it => it)

    this.lib.sort((a, b) => {
      return a.start - b.start
    })

    let lrcPreView = ''

    for (let i = 0, it; (it = this.lib[i++]); ) {
      if (this.lib[i]) {
        it.duration = +(this.lib[i].start - it.start).toFixed(2)
        it.end = this.lib[i].start
      } else {
        it.duration = 3
        it.end = it.start + 3
      }
      lrcPreView += it.txt + '\n'
    }

    this.emit('view-all', lrcPreView)
    this.tmpLib = this.lib.concat()

    return this.lib.length > 0
  }

  // 歌词跳转
  seek(time) {
    this.tmpLib = []
    this.curr = [] //清除当前输出, 避免进度向前跳转的时候歌词无法更新
    for (let it of this.lib) {
      if (it.start > time) {
        this.tmpLib.push(it)
      }
    }
  }

  // 歌词向前调整指定时间
  forward(time = 0) {
    if (!this.__LRC__) {
      return
    }
    clearTimeout(this.__TIMER__)
    // 避免时间小于0
    if (this.lib[0].start < time) {
      return
    }
    let lrc = ''
    for (let it of this.lib) {
      // 这里使用减法, 才与期望的 "前进" 一致
      it.start = +(it.start - time).toFixed(2)
      it.end = +(it.end - time).toFixed(2)
      let _t = (it.start + '').split('.')
      if (_t.length < 2) {
        _t[1] = 0
      }
      _t[0] = Anot.filters.time(_t[0])
      _t[1] = (_t[1] + '').padStart(2, '0')
      lrc += `[${_t[0]}.${_t[1]}]${it.txt}\n`
    }

    // 延时3秒写入
    this.__TIMER__ = setTimeout(() => {
      fs.echo(lrc, this.__LRC__)
    }, 3000)
  }

  //更新当前时间, 并自动触发当前歌词返回
  update(time) {
    if (!this.lib.length) {
      this.lrc = {
        l: { bg: '#fff', txt: '暂无歌词...' },
        r: { bg: '', txt: '' }
      }

      this.emit('ctrl-lrc', this.lrc.l.txt)
      this.emit('ktv-lrc', this.lrc)
      return
    }
    if (!this.curr.length && this.tmpLib.length) {
      this.curr = this.tmpLib.splice(0, 2)
    }
    let stat = 0

    // 当前时间小于第1句的结束时间
    if (time <= this.curr[0].end) {
      //  如果第2句比第1句的时间要小,需要补新
      if (this.curr[1].start < this.curr[0].start && time > this.curr[1].end) {
        if (this.tmpLib.length) {
          this.curr[1] = this.tmpLib.shift()
        }
      }
    } else {
      if (time < this.curr[1].end) {
        //  如果第1句比第2句的时间要小,需要补新
        if (this.curr[0].start < this.curr[1].start) {
          if (this.tmpLib.length) {
            this.curr[0] = this.tmpLib.shift()
          }
        }
      } else {
        if (this.tmpLib.length) {
          this.curr = this.tmpLib.splice(0, 2)
        }
      }
    }

    stat = (this.curr[0].start < this.curr[1].start) ^ 1

    this.lrc.l.txt = this.curr[0].txt
    this.lrc.r.txt = this.curr[1].txt

    if (stat === 0) {
      let pp = (
        ((time - this.curr[0].start) / this.curr[0].duration) *
        100
      ).toFixed(2)
      this.lrc.l.bg = `linear-gradient(to right, #ff5061 ${pp}%, #fff ${pp}%)`
      this.lrc.r.bg = '#fff'
      this.emit('ctrl-lrc', this.lrc.l.txt)
    } else {
      let pp = (
        ((time - this.curr[1].start) / this.curr[1].duration) *
        100
      ).toFixed(2)
      this.lrc.l.bg = '#fff'
      this.lrc.r.bg = `linear-gradient(to right, #ff5061 ${pp}%, #fff ${pp}%)`
      this.emit('ctrl-lrc', this.lrc.r.txt)
    }

    this.emit('ktv-lrc', this.lrc)
  }
}

util.inherits(Lyrics, EventEmitter)

export default Lyrics
