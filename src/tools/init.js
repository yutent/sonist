/**
 * 配置/DB通讯
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/26 18:11:26
 */

'use strict'

const { app, ipcMain, globalShortcut: GS } = require('electron')
const path = require('path')
const fs = require('iofs')
const Shortcut = require('./shortcut')

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

const HOME = app.getPath('home')

const APP_ROOT = path.resolve(HOME, '.sonist/')
const LRC_DIR = path.join(APP_ROOT, 'lyrics')
const CACHE_DIR = path.join(APP_ROOT, 'cache')
const INIT_FILE = path.join(APP_ROOT, 'app.ini')
const DB_FILE = path.join(APP_ROOT, 'music.db')
const TEMP_DB = path.join(APP_ROOT, 'temp.db')

if (!fs.exists(APP_ROOT)) {
  fs.mkdir(APP_ROOT)
  fs.mkdir(LRC_DIR)
  fs.mkdir(CACHE_DIR)
  fs.echo('{}', INIT_FILE)
  fs.echo('[]', TEMP_DB)
  fs.echo('[]', DB_FILE)
}
const SUPPORTED_EXTS = ['.mp3', '.webm', '.ogg', '.flac', '.m4a', '.aac']

const DB = {
  read(file) {
    let cache = (fs.cat(file) || '[]').toString('utf-8')
    try {
      return JSON.parse(cache)
    } catch (err) {
      return cache
    }
  },
  save(file, data) {
    fs.echo(JSON.stringify(data), file)
  }
}
/* ----------------------------------------------------------------- */
/* ---------------------       事件开始     ------------------------- */
/* ---------------------------------------------------------------- */

ipcMain.on('sonist', (ev, conn) => {
  switch (conn.type) {
    // 获取应用配置
    case 'get-init':
      ev.returnValue = DB.read(INIT_FILE)
      break
    // 设置应用配置
    case 'set-init':
      DB.save(INIT_FILE, conn.data)
      break
    // 获取音乐数据库
    case 'get-music':
      ev.returnValue = DB.read(DB_FILE)
      break
    // 更新音乐数据库
    case 'set-music':
      DB.save(DB_FILE, conn.data)
      break
    // 获取临时音乐数据库
    case 'get-temp':
      ev.returnValue = DB.read(TEMP_DB)
      break
    // 更新临时音乐数据库
    case 'set-temp':
      DB.save(TEMP_DB, conn.data)
      break
    // 读取歌词文件
    case 'read-lrc':
      let lrc = path.join(LRC_DIR, `${conn.id}.lrc`)
      if (fs.exists(lrc)) {
        ev.returnValue = DB.read(lrc)
      } else {
        ev.returnValue = null
      }
      break
    // 保存歌词文件
    case 'save-lrc':
      fs.echo(conn.data, path.join(LRC_DIR, `${conn.id}.lrc`))
      break
    // 保存音乐文件
    case 'save-cache':
      let file = path.join(CACHE_DIR, conn.file)
      fs.echo(conn.data, file)
      ev.returnValue = `file://${file}`
      break

    // 扫描目录
    case 'scan-dir':
      if (fs.isdir(conn.path)) {
        let list = fs.ls(conn.path, true).filter(_ => {
          if (fs.isdir(_)) {
            return false
          } else {
            let { ext, name } = path.parse(_)
            if (!ext || name.startsWith('.')) {
              return false
            }
            return SUPPORTED_EXTS.includes(ext)
          }
        })
        ev.returnValue = list
      } else {
        ev.returnValue = null
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
