import Vue from 'vue'
import App from './index.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import CoordPicker from '../src'
window._AMapSecurityConfig = { securityJsCode: import.meta.env.VITE_APP_SCURITY_JS_CODE }
Vue.use(CoordPicker, {
  loadOptions: {
    key: import.meta.env.VITE_APP_AMAP_JS_API_KEY,
  },
  city: '',
  precision: 6,
  addressComponent: {
    province: true,
    city: true,
    district: true,
  }
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
