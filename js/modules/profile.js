/**
 * 设置模块
 * @author yutent<yutent@doui.cc>
 * @date 2018/12/27 02:02:54
 */

'use strict'

import '/lib/form/index.js'

const fs = require('iofs')
const path = require('path')
const { app, dialog } = require('electron').remote
const log = console.log

const HOME_PATH = app.getPath('appData')
const APP_INI_PATH = path.join(HOME_PATH, 'app.ini')

let appInit = fs.cat(APP_INI_PATH)

appInit = JSON.parse(appInit)

export default Anot({
  $id: 'profile',
  state: {
    setting: {
      allowPlayOnBack: appInit.allowPlayOnBack,
      autoLrc: appInit.autoLrc,
      theme: appInit.theme || 1,
      musicPath: appInit.musicPath
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
          defaultPath: app.getPath('home')
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

      let cache = JSON.stringify(appInit, '', 2)
      fs.echo(cache, APP_INI_PATH)
      Anot.ss('app-init', cache)

      layer.toast('保存成功')

      this.__APP__.onProfileSaved()
    }
  }
})
