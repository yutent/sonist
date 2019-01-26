/**
 * 设置模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/27 02:02:54
 */

'use strict'

import '/lib/form/index.js'

const {
  remote: { app, dialog },
  ipcRenderer
} = require('electron')

const log = console.log

let appInit = ipcRenderer.sendSync('get-init')

export default Anot({
  $id: 'profile',
  state: {
    setting: {
      allowPlayOnBack: appInit.allowPlayOnBack,
      autoLrc: appInit.autoLrc,
      theme: appInit.theme || 1,
      musicPath: appInit.musicPath || ''
    }
  },
  watch: {
    'setting.theme'(v) {
      v = +v
      this.__APP__.theme = v
    }
  },
  methods: {
    __init__() {
      this.__APP__ = Anot.vmodels.app
    },
    openDir() {
      dialog.showOpenDialog(
        {
          properties: ['openDirectory'],
          defaultPath: appInit.musicPath || app.getPath('home')
        },
        dir => {
          if (dir) {
            this.setting.musicPath = dir[0]
          }
        }
      )
    },
    save() {
      let setting = this.setting.$model

      Object.assign(appInit, setting)

      ipcRenderer.send('set-init', appInit)

      Anot.ss('app-init', appInit)

      layer.toast('保存成功')

      this.__APP__.onProfileSaved()
    }
  }
})
