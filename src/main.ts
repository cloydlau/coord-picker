import 'virtual:windi.css'

import CoordPicker from './AMap.vue'
import { init } from './config'

interface installInterface {
  installed?: boolean

  (Vue: any, opts?: object): void
}

const install: installInterface = (Vue, opts = {}) => {
  if (install.installed) {
    return
  }
  init(opts)
  Vue.component(CoordPicker.name, CoordPicker)
  install.installed = true
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

// @ts-ignore
CoordPicker.install = install

export default CoordPicker
