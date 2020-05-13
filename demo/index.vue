<template>
  <el-dialog :visible.sync="showDialog" :close-on-click-modal="false" title="地图选点">


    <CoordPicker :show.sync="show"
                 :api-key='apiKey'

                 :city="city"
                 :lng.sync="lng"
                 :lat.sync="lat"
                 :address.sync="address"
                 :zoom.sync="zoom"

                 :img="img"
                 :imgNorthEastLng.sync="imgNorthEastLng"
                 :imgNorthEastLat.sync="imgNorthEastLat"
                 :imgSouthWestLng.sync="imgSouthWestLng"
                 :imgSouthWestLat.sync="imgSouthWestLat"

                 :area.sync="area"
    />


    <el-form
            label-position="right"
            label-width="113px"
    >
      <el-form-item label="城市">
        <el-input v-model="city" clearable/>
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="address" clearable/>
      </el-form-item>
      <el-form-item label="经度">
        <el-input v-model="lng" clearable/>
      </el-form-item>
      <el-form-item label="纬度">
        <el-input v-model="lat" clearable/>
      </el-form-item>
      <el-form-item label="缩放级别">
        <el-input v-model="zoom" clearable/>
      </el-form-item>
      <el-form-item label="图片地址">
        <el-input v-model="img" clearable/>
      </el-form-item>
      <el-form-item label="图片东北角经度">
        <el-input v-model="imgNorthEastLng" clearable/>
      </el-form-item>
      <el-form-item label="图片东北角纬度">
        <el-input v-model="imgNorthEastLat" clearable/>
      </el-form-item>
      <el-form-item label="图片西南角经度">
        <el-input v-model="imgSouthWestLng" clearable/>
      </el-form-item>
      <el-form-item label="图片西南角纬度">
        <el-input v-model="imgSouthWestLat" clearable/>
      </el-form-item>
      <el-form-item label="多边形">
        <el-input v-model="JSON.stringify(area)" clearable disabled/>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="show=true" type="danger">开启</el-button>
    </div>
  </el-dialog>
</template>

<script>
//import CoordPicker from '../src/AMap'
//todo: import 'coord-picker/dist/coord-picker.css'
//todo: import {CoordPicker} from 'coord-picker'

export default {
  //components: { CoordPicker },
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
      lng: '',
      //初始点位维度
      lat: '',
      //初始地址
      address: '',
      //初始城市
      city: '',

      /**
       * 图片相关
       */
      //图片地址
      img: 'https://pic4.zhimg.com/80/v2-670a8e55fc0dcb76fc4860c18963aaa8_720w.jpg',
      //图片东北角经度
      imgNorthEastLng: '',
      //图片东北角维度
      imgNorthEastLat: '',
      //图片西南角经度
      imgSouthWestLng: '',
      //图片西南角维度
      imgSouthWestLat: '',

      /*area: [
        {data:[{ longitude: '116.368904', latitude: '39.913423' },
        { longitude: '116.382122', latitude: '39.901176' },
        { longitude: '116.387271', latitude: '39.912501' },
        { longitude: '116.398258', latitude: '39.904600' },]}
      ],*/
      area: null,

      //初始缩放比例
      zoom: '',

      showDialog: true,
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.el-input {
  width: 90%;
}
</style>
