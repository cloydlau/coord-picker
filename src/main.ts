import CoordPicker from './AMap.vue'
import {init} from './config.ts'

const install = (Vue, opts = {}) => {
    if (install.installed) {
        return
    }
    init(opts)
    Vue.component(CoordPicker.name, CoordPicker)
}

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}

export default {
    install,
    CoordPicker,
}
