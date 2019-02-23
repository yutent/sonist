/**
 * 播放器控制条
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/21 21:16:29
 */

'use strict'

const COLORS = [
  {
    title: '#62778d',
    lrc: '#98acae',
    bar1: '#dae1e9',
    bar2: '#3fc2a7'
  },
  {
    title: '#fff',
    lrc: '#d7d8db',
    bar1: '#454545',
    bar2: '#fff'
  }
]

const FONTS_NAME =
  ' Helvetica, Arial,"WenQuanYi Micro Hei","PingFang SC","Hiragino Sans GB","Segoe UI", "Microsoft Yahei", sans-serif'

export default {
  methods: {
    __draw__() {
      let play = this.isPlaying
      let rx = (play ? 112 : 40) + this.__HEIGHT__ / 2 // 旋转唱片的圆心坐标X
      let ry = this.__HEIGHT__ / 2 // 旋转唱片的圆心坐标Y
      let pw = this.__WIDTH__ - this.__HEIGHT__ - 180 // 进度条总长度
      let wl = this.__HEIGHT__ + 180 // 文字的坐标X

      let { time, duration, title, artist } = this.curr
      let lrc = this.ctrlLrc
      let pp = time / duration // 进度百分比
      time = Anot.filters.time(time)
      duration = Anot.filters.time(duration)

      this.__CTX__.clearRect(0, 0, this.__WIDTH__, this.__HEIGHT__)
      this.__CTX__.save()

      // 将原点移到唱片圆心, 旋转完再回到初始值
      this.__CTX__.translate(rx, ry)
      this.__CTX__.rotate(this.__DEG__ * Math.PI)
      this.__CTX__.translate(-rx, -ry)

      this.__CTX__.drawImage(
        this.__img1__,
        play ? 112 : 40,
        0,
        this.__HEIGHT__,
        this.__HEIGHT__
      )

      this.__CTX__.restore()

      this.__CTX__.drawImage(
        this.__img2__,
        0,
        0,
        this.__HEIGHT__,
        this.__HEIGHT__
      )

      // 歌曲标题和歌手
      this.__CTX__.fillStyle = COLORS[this.ktvMode].title
      this.__CTX__.font = '56px' + FONTS_NAME
      this.__CTX__.fillText(`${title} - ${artist}`, wl, 100)

      // 时间
      this.__CTX__.fillStyle = COLORS[this.ktvMode].lrc
      this.__CTX__.font = '48px' + FONTS_NAME
      this.__CTX__.fillText(`${time} / ${duration}`, this.__WIDTH__ - 280, 100)

      // 歌词
      this.__CTX__.fillStyle = COLORS[this.ktvMode].lrc
      this.__CTX__.font = '48px' + FONTS_NAME
      this.__CTX__.fillText(lrc, wl, 180)

      // 进度条
      this.__CTX__.fillStyle = COLORS[this.ktvMode].bar1
      this.__CTX__.fillRect(wl, 230, pw, 16)
      this.__CTX__.fillStyle = COLORS[this.ktvMode].bar2
      this.__CTX__.fillRect(wl, 230, pw * pp, 16)

      this.__DEG__ += 0.02
    },

    draw(force) {
      //主窗口隐藏时, 暂停绘制,  以降低CPU开销
      if (!this.winShow) {
        return clearInterval(this.timer)
      }
      if (force) {
        this.__img1__ = new Image()
        this.__img2__ = new Image()

        let p1 = Promise.defer()
        let p2 = Promise.defer()

        this.__img1__.onload = p1.resolve
        this.__img2__.onload = p2.resolve
        this.__img1__.src = '/images/disk.png'
        this.__img2__.src = this.curr.cover || '/images/album.png'

        Promise.all([p1.promise, p2.promise]).then(_ => {
          clearInterval(this.timer)
          this.__DEG__ = 0.01
          if (this.isPlaying) {
            this.timer = setInterval(_ => {
              this.__draw__()
            }, 40)
          } else {
            this.__draw__()
          }
        })
      } else {
        clearInterval(this.timer)
        if (this.isPlaying) {
          this.timer = setInterval(_ => {
            this.__draw__()
          }, 40)
        } else {
          this.__draw__()
        }
      }
    }
  }
}
