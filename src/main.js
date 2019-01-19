const {
  app,
  BrowserWindow,
  protocol,
  Tray,
  Menu,
  MenuItem,
  session
} = require('electron')
const path = require('path')
const fs = require('iofs')
const log = console.log

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
    label: '显示Sonist',
    type: 'normal',
    click: () => {
      win.show()
    }
  },
  {
    type: 'separator'
  },
  {
    label: '退出应用',
    type: 'normal',
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
  MENU_TMPL.unshift({
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
    }
  })

  // 然后加载应用的 index.html。
  win.loadURL('app://sonist/index.html')
}
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
app.on('ready', () => {
  protocol.registerBufferProtocol('app', (req, cb) => {
    let file = req.url.replace(/^app:\/\/sonist\//, '')
    let ext = path.extname(req.url).slice(1)
    let buf = fs.cat(path.resolve(ROOT, file))
    cb({ data: buf, mimeType: MIME_TYPES[ext] })
  })

  tray = new Tray(path.resolve(ROOT, './images/trays/trayTemplate.png'))

  if (process.platform === 'darwin') {
    tray.on('click', _ => {
      win.show()
    })
  } else {
    tray.setContextMenu(traymenuList)
  }
  Menu.setApplicationMenu(menubarList)

  // const ses = session.defaultSession
  // ses.setUserAgent('Hello wolrd')

  createWindow()
  // win.tray = tray
  win.webContents.openDevTools()
})
