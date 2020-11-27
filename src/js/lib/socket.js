/**
 * 与主进程的通讯
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/07/14 11:42:02
 */

const { ipcRenderer } = require('electron')
const EventEmitter = require('events')
const util = require('util')

class Socket {
  constructor() {
    ipcRenderer.on('app', (ev, conn) => {
      // console.log(ev, conn)
      this.emit(conn.type, conn.data)
    })
  }

  dispatch(type = '', data = {}) {
    return ipcRenderer.sendSync('app', { data, type })
  }
}

util.inherits(Socket, EventEmitter)

export default new Socket()
