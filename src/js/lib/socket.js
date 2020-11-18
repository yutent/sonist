/**
 * 与主进程的通讯
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/07/14 11:42:02
 */

const { ipcRenderer } = require('electron')

export default {
  dispatch(type = '', params = {}) {
    return ipcRenderer.sendSync('app', Object.assign(params, { type }))
  }
}
