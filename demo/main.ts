import Vue from 'vue'
import App from './index.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

Vue.use(ElementUI)

import CoordPicker from '../src/main.ts'
//import '../dist/coord-picker.css'
//import CoordPicker from '../dist/coord-picker.umd.js'

Vue.use(CoordPicker, {
    //全局高德地图js api key（权重低于props）
    apiKey: process.env.VUE_APP_AMAP_JS_API_KEY,
    //全局初始城市（也支持省份，权重低于props）
    city: '贵阳',
    //全局坐标精度 默认6位小数（权重低于props）
    precision: 6,
    //地址成分 默认完整（权重低于props）
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
