/**
 * 本地音乐模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/24 17:00:48
 */

'use strict'

import Api from '/js/api.js'
import { ID3 } from '/lib/audio/index.js'

const path = require('path')
const crypto = require('crypto.js')
const { remote, ipcRenderer } = require('electron')

const log = console.log

let appInit = {}
let dbCache = []

export default Anot({
  $id: 'local',
  state: {
    list: [],
    curr: '',
    editMode: false,
    form: {
      id: '',
      title: '',
      artist: '',
      album: '',
      path: ''
    }
  },
  mounted() {
    appInit = JSON.parse(Anot.ss('app-init'))
    dbCache = ipcRenderer.sendSync('get-music')

    LS.insert(dbCache)

    dbCache = null
    this.__APP__ = Anot.vmodels.app
    this.list = LS.getAll()

    SONIST.clear()
    SONIST.push(LS.getAll())

    // this.__APP__.play()
  },
  watch: {
    'props.curr'(v) {
      this.curr = v
    }
  },
  methods: {
    __init__() {
      appInit = JSON.parse(Anot.ss('app-init'))
    },

    play(song, idx) {
      if (song.id === this.curr) {
        return
      }
      SONIST.play(idx).then(it => {
        this.__APP__.play(it)
        this.curr = it.id

        this.__updateSong__(it, idx)
      })
    },

    __updateSong__(it, idx) {
      if (!it.cover) {
        if (idx === undefined) {
          idx = SONIST.__CURR__
        }
        let _P = Promise.resolve(true)
        if (!it.kgHash) {
          _P = Api.search(`${it.artist} ${it.title}`).then(list => {
            if (list.length) {
              let { AlbumID, FileHash } = list[0]
              it.kgHash = FileHash
              it.albumId = AlbumID
              return true
            }
            return false
          })
        }
        _P.then(next => {
          if (next) {
            Api.getSongInfoByHash(it.kgHash, it.albumId).then(json => {
              delete it.time
              it.album = json.album_name
              it.albumId = json.album_id
              it.kgHash = json.hash
              it.cover = json.img

              LS.insert(it)
              this.list.set(idx, it)

              SONIST.clear()
              SONIST.push(LS.getAll())

              this.__APP__.updateCurr(it)
              this.__APP__.draw(true)

              ipcRenderer.send('save-lrc', {
                id: it.id,
                lrc: json.lyrics
              })
              ipcRenderer.send('set-music', LS.getAll())

              LYRICS.__init__(it.id)
            })
          }
        })
      }
    },

    __checkSong__(el) {
      let song = this.__LIST__.pop()

      let scaned = this.__WAIT_FOR_SCAN__ - this.__LIST__.length
      this.__APP__.progress = ((100 * scaned) / this.__WAIT_FOR_SCAN__) >>> 0

      if (!song) {
        el.textContent = '重新扫描'
        el = null

        LS.clear(true)
        LS.insert(this.__tmp__)
        LS.sort('artist', true)
        dbCache = LS.getAll()
        this.list.clear()
        this.list.pushArray(dbCache)

        SONIST.clear()
        SONIST.push(dbCache)

        ipcRenderer.send('set-music', dbCache)
        dbCache = null

        layer.toast(`刷新缓存完成,新增${this.__NEW_NUM__}首`)

        this.__APP__.loading = false
        this.__APP__.progress = 0

        delete this.__NEW_NUM__
        delete this.__tmp__
        return
      }

      Anot.nextTick(() => {
        let hash = crypto.md5Sign(song)
        let item = LS.get(hash)
        if (item) {
          item.path = `file://${song}`
          delete item.lyrics
          // 不直接修改数数据库的数据,避免文件被删除时,数据库中的记录还在
          // 先存入临时数组, 最后再统一存入数据库
          this.__tmp__.push(item)
          return this.__checkSong__(el)
        }
        this.__NEW_NUM__++
        ID3(song).then(tag => {
          this.__tmp__.push({
            id: hash,
            title: tag.title,
            album: tag.album,
            artist: tag.artist,
            path: `file://${song}`,
            duration: tag.duration
          })
          this.__checkSong__(el)
        })
      })
    },
    refresh(ev) {
      if (this.__APP__.loading) {
        return
      }
      if (appInit.musicPath) {
        this.__LIST__ = ipcRenderer.sendSync('scan-dir', appInit.musicPath)
        if (this.__LIST__) {
          this.__tmp__ = [] //创建一个临时的数组, 用于存放扫描的音乐
          this.__APP__.loading = true
          this.__WAIT_FOR_SCAN__ = this.__LIST__.length
          this.__NEW_NUM__ = 0

          ev.target.textContent = '正在扫描, 请稍候...'
          this.__checkSong__(ev.target)
        } else {
          layer.alert('当前设置的音乐目录不存在...<br>请检查后重新尝试!')
        }
      } else {
        layer.toast('请先设置音乐目录', 'error')
      }
    },
    closeEditByEnter(ev) {
      if (ev.keyCode === 13 && ev.ctrlKey) {
        this.closeEdit()
      }
    },
    closeEdit() {
      this.editMode = false
      let song = this.list[this.__idx__].$model

      Object.assign(song, {
        title: this.form.title,
        artist: this.form.artist,
        album: this.form.album,
        cover: '',
        kgHash: ''
      })

      this.list.set(this.__idx__, song)
      delete this.__idx__

      let col = new Intl.Collator('zh')
      // this.list.sort((a, b) => {
      //   return col.compare(a.artist, b.artist)
      // })

      LS.update(song.id, song)
      // LS.sort('artist', true)

      SONIST.clear()
      SONIST.push(LS.getAll())

      ipcRenderer.send('set-music', LS.getAll())
    },
    handleMenu(it, idx, ev) {
      let that = this

      layer.open({
        type: 7,
        menubar: false,
        maskClose: true,
        fixed: true,
        extraClass: 'do-mod-contextmenu__fixed',
        offset: [ev.pageY, 'auto', 'auto', ev.pageX],
        shift: {
          top: ev.pageY,
          left: ev.pageX
        },
        content: `<ul class="do-mod-contextmenu" :click="onClick">
          <li data-key="del"><i class="do-icon-trash"></i>删除歌曲</li>
          <li data-key="edit"><i class="do-icon-edit"></i>编辑信息</li>
        </ul>`,
        onClick(ev) {
          if (ev.currentTarget === ev.target) {
            return
          }
          let target = ev.target
          let act = null
          if (target.nodeName === 'I') {
            target = target.parentNode
          }
          act = target.dataset.key
          this.close()
          if (act === 'del') {
            layer.confirm(
              '此操作只会将当前选中的歌曲从列表中移出<br>并不会将其从硬盘中删除!',
              `是否删除 (${it.title}) ?`,
              function() {
                this.close()
                that.list.splice(idx, 1)
                LS.remove(it.id)

                SONIST.clear()
                SONIST.push(LS.getAll())

                ipcRenderer.send('set-music', LS.getAll())
              }
            )
          } else {
            that.__idx__ = idx
            that.editMode = true
            that.form.id = it.id
            that.form.path = it.path.slice(7)
            that.form.title = it.title
            that.form.artist = it.artist
            that.form.album = it.album
          }
        }
      })
    }
  }
})
