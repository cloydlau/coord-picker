import Vue from 'vue'
import App from './index.vue'

import 'normalize.css/normalize.css'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

Vue.use(ElementUI)

import CoordPicker from '../src/main.ts'

Vue.use(CoordPicker, {
    //全局高德地图js api key（权重低于props）
    apiKey: '',
    //全局初始城市（权重低于props）
    city: '香港'
})

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
