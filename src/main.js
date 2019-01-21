const { app, BrowserWindow, protocol, session, ipcMain } = require('electron')
const path = require('path')
const fs = require('iofs')
const { exec } = require('child_process')
const log = console.log

const createTray = require('./tools/tray')
const createMenu = require('./tools/menu')

/* ******************************* */
/* **********修复环境变量*********** */
/* ******************************* */
let PATH_SET = new Set()
process.env.PATH.split(':').forEach(_ => {
  PATH_SET.add(_)
})
PATH_SET.add('/usr/local/bin')
PATH_SET.add('/usr/local/sbin')

process.env.PATH = Array.from(PATH_SET).join(':')
PATH_SET = null

const ROOT = __dirname
const HOME = app.getPath('home')
const MIME_TYPES = {
  js: 'application/javascript',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  jpg: 'image/jpg',
  png: 'image/png',
  gif: 'image/gif'
}

/* ----------------------------------------------------- */
app.commandLine.appendSwitch('--lang', 'zh-CN')
app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

app.setPath('appData', path.resolve(HOME, '.sonist/'))
protocol.registerStandardSchemes(['app'], { secure: true })

let appPath = app.getPath('appData')
if (!fs.exists(appPath)) {
  fs.mkdir(appPath)
  fs.mkdir(path.join(appPath, 'lyrics'))
  fs.mkdir(path.join(appPath, 'cache'))
  fs.echo('{}', path.join(appPath, 'app.ini'))
  fs.echo('[]', path.join(appPath, 'music.db'))
}
/* ----------------------------------------------------- */
let win = null

function createWindow() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    title: 'sonist',
    width: 1024,
    height: 640,
    frame: false,
    resizable: false,
    icon: path.resolve(ROOT, './images/app.png'),
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true
    },
    show: false
  })

  // 然后加载应用的 index.html。
  win.loadURL('app://sonist/index.html')
}
/* ****************************************** */
/* *************   init   ******************* */
/* ****************************************** */

//  创建窗口
app.once('ready', () => {
  protocol.registerBufferProtocol('app', (req, cb) => {
    let file = req.url.replace(/^app:\/\/sonist\//, '')
    let ext = path.extname(req.url).slice(1)
    let buf = fs.cat(path.resolve(ROOT, file))
    cb({ data: buf, mimeType: MIME_TYPES[ext] })
  })

  exec('which ffprobe', (err, res) => {
    if (res) {
      session.defaultSession.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      )

      createWindow()

      createTray(win)
      createMenu(win)

      win.on('ready-to-show', _ => {
        win.show()
      })
      win.openDevTools()
    } else {
      win = new BrowserWindow({
        width: 600,
        height: 360,
        skipTaskbar: true,
        maximizable: false,
        minimizable: false,
        resizable: false,
        titleBarStyle: 'hiddenInset'
      })
      win.setMenuBarVisibility(false)
      win.loadURL('app://sonist/depends.html')
      win.on('closed', _ => {
        app.exit()
      })
    }
  })
})

app.on('activate', _ => {
  if (win) {
    win.show()
  }
})
