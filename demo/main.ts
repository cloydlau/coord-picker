import Vue from 'vue'
import App from './index.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import CoordPicker from '../src/main.ts'
Vue.use(CoordPicker, {
  apiKey: process.env.VUE_APP_AMAP_JS_API_KEY,
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
