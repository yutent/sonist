/**
 * 顶栏图标
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/27 13:59:24
 */

const path = require('path')
const { ipcMain, Tray, Menu, nativeImage } = require('electron')

const ICON_DICT = {
  app: path.join(__dirname, '../images/trays/tray.png'),
  play: path.join(__dirname, '../images/trays/playTemplate.png'),
  pause: path.join(__dirname, '../images/trays/pauseTemplate.png'),
  next: path.join(__dirname, '../images/trays/nextTemplate.png'),
  prev: path.join(__dirname, '../images/trays/prevTemplate.png')
}

function create(ico = nativeImage.createEmpty()) {
  var tray = new Tray(ico)
  tray.setIgnoreDoubleClickEvents(true)
  return tray
}

exports.ctrlTrayBtn = function (win) {
  var next = create(ICON_DICT.next)
  var play = create(ICON_DICT.pause)
  var prev = create(ICON_DICT.prev)
  var isPlaying = false

  play.on('click', _ => {
    isPlaying = !isPlaying
    if (isPlaying) {
      play.setImage(ICON_DICT.play)
    } else {
      play.setImage(ICON_DICT.pause)
    }
    win.webContents.send('app', { type: 'tray-play', data: { isPlaying } })
  })
  prev.on('click', _ => {
    win.webContents.send('app', { type: 'tray-prev', data: { isPlaying } })
  })
  next.on('click', _ => {
    win.webContents.send('app', { type: 'tray-next', data: { isPlaying } })
  })

  win.__prev__ = prev
  win.__play__ = play
  win.__next__ = next
  return { prev, play, next }
}

exports.createAppTray = function (win) {
  var tray = create(ICON_DICT.app)
  var menuList = Menu.buildFromTemplate([
    {
      label: '退出 Sonist',
      accelerator: 'Command+Q',
      click(a, b, ev) {
        win.destroy()
      }
    }
  ])

  tray.on('click', _ => {
    win.restore()
  })
  tray.on('right-click', _ => {
    tray.popUpContextMenu(menuList)
  })

  win.__tray__ = tray
  return tray
}

exports.createLrcTray = function (win) {
  var tray = create()
  tray.setTitle('这是顶栏歌词, blablablabla...')

  win.__lrc__ = tray
  return tray
}
