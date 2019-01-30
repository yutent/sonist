/**
 * 配置/DB通讯
 * @author yutent<yutent@doui.cc>
 * @date 2019/01/26 18:11:26
 */

'use strict'

const { app, ipcMain } = require('electron')
const path = require('path')
// const http = require('http')
const fs = require('iofs')

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

/* ----------------------------------------------------------------- */
/* ---------------------       事件开始     ------------------------- */
/* ---------------------------------------------------------------- */

// 获取应用配置
ipcMain.on('get-init', (ev, val) => {
  let cache = fs.cat(INIT_FILE).toString('utf-8')
  cache = JSON.parse(cache)
  ev.returnValue = cache
})

// 设置应用配置
ipcMain.on('set-init', (ev, val) => {
  fs.echo(JSON.stringify(val), INIT_FILE)
})

// 获取音乐数据库
ipcMain.on('get-music', (ev, val) => {
  let cache = fs.cat(DB_FILE).toString('utf-8')
  cache = JSON.parse(cache)
  ev.returnValue = cache
})

// 更新音乐数据库
ipcMain.on('set-music', (ev, val) => {
  fs.echo(JSON.stringify(val), DB_FILE)
})

// 获取临时音乐数据库
ipcMain.on('get-temp', (ev, val) => {
  let cache = (fs.cat(TEMP_DB) || '[]').toString('utf-8')
  cache = JSON.parse(cache)
  ev.returnValue = cache
})

// 更新临时音乐数据库
ipcMain.on('set-temp', (ev, val) => {
  fs.echo(JSON.stringify(val), TEMP_DB)
})

/**
 *  保存歌词文件
 */
ipcMain.on('save-lrc', (ev, obj) => {
  fs.echo(obj.lrc, path.join(LRC_DIR, `${obj.id}.lrc`))
})

/**
 *  读取歌词文件
 */
ipcMain.on('read-lrc', (ev, id) => {
  let file = path.join(LRC_DIR, `${id}.lrc`)
  if (fs.exists(file)) {
    ev.returnValue = fs.cat(file).toString('utf8')
  } else {
    ev.returnValue = null
  }
})

/**
 *  保存音乐文件
 */
ipcMain.on('save-cache', (ev, obj) => {
  let savefile = path.join(CACHE_DIR, obj.file)
  fs.echo(obj.buff, savefile)
  ev.returnValue = `file://${savefile}`
})

/**
 * 扫描目录
 */
ipcMain.on('scan-dir', (ev, dir) => {
  if (fs.isdir(dir)) {
    let list = fs.ls(dir, true).filter(_ => {
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
})
