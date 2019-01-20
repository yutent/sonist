const {
  app,
  BrowserWindow,
  protocol,
  Tray,
  Menu,
  session
} = require('electron')
const path = require('path')
const fs = require('iofs')
const { exec } = require('child_process')
const log = console.log

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

let win = null
let tray = null

/* ----------------------------------------------------- */

const TRAYMENU_TMPL = [
  {
    label: '显示主窗口',
    click: () => {
      win.show()
    }
  },
  {
    type: 'separator'
  },
  {
    label: '退出',
    role: 'quit'
  }
]
const MENUBAR_TMPL = [
  {
    label: 'View',
    submenu: [{ role: 'zoomin' }, { role: 'zoomout' }]
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }]
  }
]

if (process.platform === 'darwin') {
  MENUBAR_TMPL.unshift({
    label: 'Sonist',
    submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }]
  })

  // Window menu
  MENUBAR_TMPL[2].submenu = [{ role: 'minimize' }]
}

let traymenuList = Menu.buildFromTemplate(TRAYMENU_TMPL)
let menubarList = Menu.buildFromTemplate(MENUBAR_TMPL)

/* ----------------------------------------------------- */

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
app.commandLine.appendSwitch('--lang', 'zh-CN')
app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

app.setPath('appData', path.resolve(HOME, '.sonist/'))
protocol.registerStandardSchemes(['app'], { secure: true })

let appPath = app.getPath('appData')
if (!fs.exists(appPath)) {
  fs.mkdir(appPath)
  fs.mkdir(path.join(appPath, 'lyrics'))
  fs.echo('{}', path.join(appPath, 'app.ini'))
  fs.echo('[]', path.join(appPath, 'music.db'))
}

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
      tray = new Tray(path.resolve(ROOT, './images/trays/trayTemplate.png'))

      if (process.platform === 'darwin') {
        tray.on('click', _ => {
          win.show()
        })
        tray.on('right-click', _ => {
          tray.popUpContextMenu(traymenuList)
        })
      } else {
        tray.setContextMenu(traymenuList)
      }
      Menu.setApplicationMenu(menubarList)

      session.defaultSession.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
      )

      createWindow()

      win.on('ready-to-show', _ => {
        win.show()
      })
      // win.openDevTools()
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
