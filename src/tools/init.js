/**
 * 配置/DB通讯
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/26 18:11:26
 */

const { app, ipcMain, globalShortcut: GS } = require('electron')
const path = require('path')
const fs = require('iofs')
const sec = require('crypto.js')

const Shortcut = require('./shortcut')
const Sqlite = require('./db')
const dbinit = require('./db/init')

const HOME = path.resolve(app.getPath('userData'))

/* ********** 修复环境变量 start *********** */
let PATH_SET = new Set()
process.env.PATH.split(':').forEach(_ => {
  PATH_SET.add(_)
})
PATH_SET.add('/usr/local/bin')
PATH_SET.add('/usr/local/sbin')

process.env.PATH = Array.from(PATH_SET).join(':')
PATH_SET = null

/* ********** 修复环境变量 end *********** */

const DB_FILE = path.join(HOME, 'sqlite3.cache')
const INIT_FILE = path.join(HOME, 'app.ini')
const CACHE_DIR = path.join(HOME, 'other_cache')
const SUPPORTED_EXTS = ['.mp3', '.webm', '.ogg', '.flac', '.m4a', '.aac']

var isFirstTimeLaunch = false
var db = null

if (!fs.exists(DB_FILE)) {
  fs.echo('{}', INIT_FILE)
  fs.mkdir(CACHE_DIR)
  isFirstTimeLaunch = true
}

db = new Sqlite(DB_FILE)

if (isFirstTimeLaunch) {
  dbinit(db)
}

/* ----------------------------------------------------------------- */
/* ---------------------       事件开始     ------------------------- */
/* ---------------------------------------------------------------- */

ipcMain.on('app', (ev, conn) => {
  switch (conn.type) {
    // 获取所有书籍
    case 'get-playlist':
      db.getAll('SELECT * FROM `playlist`')
        .then(res => {
          ev.returnValue = res
        })
        .catch(err => {
          ev.returnValue = err
        })
      break
    // 获取应用配置
    case 'get-init':
      var ini = fs.cat(INIT_FILE).toString('')
      ev.returnValue = JSON.parse(ini)
      break
    // 设置应用配置
    case 'set-init':
      fs.echo(JSON.stringify(conn.data, null, 2), INIT_FILE)
      break

    case 'add-song':
      var {
        name,
        artist = '',
        album = '',
        duration,
        cover = '',
        file_path,
        lrc = ''
      } = conn.data
      db.query(
        'INSERT INTO `songs` (name, artist, album, duration, cover, file_path, lrc) VALUES ($name, $artist, $album, $duration, $cover, $file_path, $lrc)',
        {
          $name: name,
          $artist: artist,
          $album: album,
          $duration: duration,
          $cover: cover,
          $file_path: file_path,
          $lrc: lrc
        }
      )
      ev.returnValue = true
      break

    case 'get-all-songs':
      db.getAll('SELECT id, name, duration, artist, file_path FROM songs')
        .then(res => {
          ev.returnValue = res
        })
        .catch(err => {
          ev.returnValue = err
        })
      break

    case 'get-songs':
      db.getAll(
        'SELECT id, name, duration, artist, file_path ' +
          'FROM songs ' +
          'WHERE id IN ' +
          '(SELECT sid FROM relations WHERE pid = $pid)',
        { $pid: conn.pid }
      )
        .then(res => {
          ev.returnValue = res
        })
        .catch(err => {
          ev.returnValue = err
        })
      break

    // 扫描目录
    case 'scan-dir':
      var { dir } = conn.data
      if (fs.isdir(dir)) {
        let list = fs
          .ls(dir, true)
          .filter(it => {
            if (fs.isdir(it)) {
              return false
            } else {
              let { ext, name } = path.parse(it)
              if (!ext || name.startsWith('.')) {
                return false
              }
              return SUPPORTED_EXTS.includes(ext)
            }
          })
          .map(it => {
            var { ext, name } = path.parse(it)
            var buf = fs.origin.createReadStream(it, {
              start: 0,
              end: 256,
              encoding: 'base64'
            })
            return {
              name,
              file_path: it,
              artist: '',
              album: '',
              duration: '00:00'
            }
          })
        ev.returnValue = list
      } else {
        ev.returnValue = []
      }
      break

    // 启用全局快捷键
    case 'enable-gs':
      Shortcut.__init__()
      break

    // 禁用全局快捷键
    case 'disable-gs':
      GS.unregisterAll()
      break
  }
})
