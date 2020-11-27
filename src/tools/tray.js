/**
 * 顶栏图标
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/11/27 13:59:24
 */

const path = require('path')
const { ipcMain, Tray, Menu, nativeImage } = require('electron')

var playIcon = [
  path.join(__dirname, '../images/trays/playTemplate.png'),
  path.join(__dirname, '../images/trays/pauseTemplate.png')
]

function create(ico) {
  var tray = new Tray(ico)
  tray.setIgnoreDoubleClickEvents(true)
  return tray
}

exports.ctrlTrayBtn = function(win) {
  var next = create(path.join(__dirname, '../images/trays/nextTemplate.png'))
  var play = create(playIcon[1])
  var prev = create(path.join(__dirname, '../images/trays/prevTemplate.png'))
  var isPlaying = false

  play.on('click', _ => {
    isPlaying = !isPlaying
    if (isPlaying) {
      play.setImage(playIcon[0])
    } else {
      play.setImage(playIcon[1])
    }
    win.webContents.send('app', { type: 'tray-play', data: { isPlaying } })
  })
  prev.on('click', _ => {
    win.webContents.send('app', { type: 'tray-prev', data: { isPlaying } })
  })
  next.on('click', _ => {
    win.webContents.send('app', { type: 'tray-next', data: { isPlaying } })
  })
  console.log('ready', prev, play, next)
  return { prev, play, next }
}

exports.createAppTray = function(win) {
  var tray = create(path.join(__dirname, '../images/trays/tray.png'))
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

  return tray
}

exports.createLrcTray = function(win) {
  var nullImage = nativeImage.createEmpty()
  var tray = create(nullImage)
  tray.setTitle('这是顶栏歌词, blablablabla...')

  return tray
}
