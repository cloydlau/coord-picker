<template>
  <el-dialog visible :close-on-click-modal="false" :show-close="false" title="coord-picker">


    <CoordPicker :show.sync="show"
                 :api-key='apiKey'

                 :city="city"
                 :lng.sync="lng"
                 :lat.sync="lat"
                 :address.sync="address"
                 :zoom.sync="zoom"
                 :precision="precision"
                 :addressComponent="addressComponent"

                 :img="img"
                 :imgNorthEastLng.sync="imgNorthEastLng"
                 :imgNorthEastLat.sync="imgNorthEastLat"
                 :imgSouthWestLng.sync="imgSouthWestLng"
                 :imgSouthWestLat.sync="imgSouthWestLat"

                 :boundary.sync="boundary"
    />


    <el-form label-position="right"
             label-width="148px"
    >
      <el-form-item label="city">
        <el-input v-model="city" clearable/>
      </el-form-item>
      <el-form-item label="address">
        <el-input v-model="address" clearable/>
      </el-form-item>
      <el-form-item label="lng">
        <el-input v-model="lng" clearable/>
      </el-form-item>
      <el-form-item label="lat">
        <el-input v-model="lat" clearable/>
      </el-form-item>
      <el-form-item label="zoom">
        <el-input v-model="zoom" clearable/>
      </el-form-item>
      <el-form-item label="precision">
        <el-input-number v-model="precision" clearable :min="0"/>
      </el-form-item>
      <el-form-item label="addressComponent">
        <el-radio-group v-model="addressComponent__" @change="e => {
           addressComponent = e ? JSON.parse(e) : undefined
        }">
          <el-radio-button :label="undefined">完整地址</el-radio-button>
          <el-radio-button :label="JSON.stringify({province:false})">去掉省</el-radio-button>
          <el-radio-button :label="JSON.stringify({province:false,city:false})">去掉省市</el-radio-button>
          <el-radio-button :label="JSON.stringify({province:false,city:false,district:false})">去掉省市县
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="img">
        <el-input v-model="img" clearable/>
      </el-form-item>
      <el-form-item label="imgNorthEastLng">
        <el-input v-model="imgNorthEastLng" clearable/>
      </el-form-item>
      <el-form-item label="imgNorthEastLat">
        <el-input v-model="imgNorthEastLat" clearable/>
      </el-form-item>
      <el-form-item label="imgSouthWestLng">
        <el-input v-model="imgSouthWestLng" clearable/>
      </el-form-item>
      <el-form-item label="imgSouthWestLat">
        <el-input v-model="imgSouthWestLat" clearable/>
      </el-form-item>
      <el-form-item label="boundary">
        <json-editor-vue v-model="boundary"/>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="show=true" type="primary">open</el-button>
    </div>
  </el-dialog>
</template>

<script>
//import CoordPicker from '../src/AMap'
//todo: import 'coord-picker/dist/coord-picker.css'
//todo: import {CoordPicker} from 'coord-picker'

import { JsonEditorVue } from 'json-editor-vue'

export default {
  components: { JsonEditorVue },
  data () {
    return {
      /**
       * 必填项
       */
      //开关
      show: false,
      //高德地图js api key（如果全局引入时已经传入 这里可以不传）
      apiKey: '',

      /**
       * 点位相关
       */
      //初始点位经度
      lng: 106.679306,
      //初始点位维度
      lat: 26.601421,
      //初始地址
      address: '',
      //初始城市（也支持省份）
      city: '',

      /**
       * 图片相关
       */
      //图片地址
      img: 'https://pic4.zhimg.com/80/v2-670a8e55fc0dcb76fc4860c18963aaa8_720w.jpg',
      //图片东北角经度
      imgNorthEastLng: 106.682739,
      //图片东北角纬度
      imgNorthEastLat: 26.610016,
      //图片西南角经度
      imgSouthWestLng: 106.790543,
      //图片西南角纬度
      imgSouthWestLat: 26.506218,

      boundary: [
        {
          'data': [{ 'longitude': '106.44294', 'latitude': '26.644338' }, {
            'longitude': '106.431267',
            'latitude': '26.504937'
          }, { 'longitude': '106.569282', 'latitude': '26.585405' }]
        }, {
          'data': [{ 'longitude': '106.623527', 'latitude': '26.52767' }, {
            'longitude': '106.602241',
            'latitude': '26.415188'
          }, { 'longitude': '106.721031', 'latitude': '26.472979' }]
        }
      ],

      //初始缩放比例
      zoom: 12,

      //坐标精度 默认6位小数
      precision: 6,

      //地址成分
      addressComponent: undefined,
      addressComponent__: undefined,
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  min-width: 600px;
}

.el-input {
  width: 90%;
}
</style>
