<template>
  <el-dialog visible :close-on-click-modal="false" :show-close="false"
    title="coord-picker" @confirm="console.log('confirm')"
    @cancel="console.log('cancel')">
    <CoordPicker v-bind.sync="props" @cancel="console.log('cancel')"
      @confirm="console.log('confirm')" />
    <JsonEditorVue v-model="props" />
  </el-dialog>
</template>

<script>
import JsonEditorVue from 'json-editor-vue'

export default {
  components: { JsonEditorVue },
  data() {
    return {
      console,
      props: {
        show: false,
        lng: 106.679306,
        lat: 26.601421,
        address: '',
        city: '',
        marker: [
          /*{
            address: '望京阜通东大街6号院3号楼',
            lat: '39.989684',
            lng: '116.480989',
            name: '北京方恒假日酒店',
            //pic: 'http://store.is.autonavi.com/showpic/1d84ec20efa80ceb6166abbd78c17e45?operate=merge&w=160&h=150&position=5',
            //price: '<font color=\'#999999\'>起价:</font><font color=\'#f53623\'>￥</font><font color=\'#f53623\'>611</font>',
            //rating: '4.6',
          },
          {
            address: '望京阜通东大街8号',
            lat: '39.988911',
            lng: '116.479856',
            name: '国际竹藤大厦',
            pic: 'http://store.is.autonavi.com/showpic/18a7b09e5679767b4016d27bc2b85573?operate=merge&w=160&h=150&position=5',
            //price: '<font color=\'#999999\'>起价:</font><font color=\'#f53623\'>￥</font><font color=\'#f53623\'>414</font>',
            //rating: '4',
          }*/
        ],
        markerCount: 20,
        rectangleImage: 'https://pic4.zhimg.com/80/v2-670a8e55fc0dcb76fc4860c18963aaa8_720w.jpg',
        rectangle: [
          {
            image: 'https://pic4.zhimg.com/80/v2-670a8e55fc0dcb76fc4860c18963aaa8_720w.jpg',
            southwest: { lng: 106.790543, lat: 26.506218 },
            northeast: { lng: 106.682739, lat: 26.610016 },
          }
        ],
        rectangleCount: 2,
        polygon: [
          {
            'path': [
              { 'lng': '106.44294', 'lat': '26.644338' },
              { 'lng': '106.431267', 'lat': '26.504937' },
              { 'lng': '106.569282', 'lat': '26.585405' }
            ]
          }, {
            'path': [
              { 'lng': '106.623527', 'lat': '26.52767' },
              { 'lng': '106.602241', 'lat': '26.415188' },
              { 'lng': '106.721031', 'lat': '26.472979' }
            ]
          }
        ],
        polygonCount: 3,
        polyline: [
          {
            path: [
              { "lng": "106.627636", "lat": "26.692251" },
              { "lng": "106.604633", "lat": "26.647459" },
              { "lng": "106.682224", "lat": "26.658505" }
            ]
          }
        ],
        polylineCount: 2,
        precision: 6,
        addressComponent: undefined,
        mapOptions: {
          zoom: 12,
          //zooms: [12, 15]
        }
      },
      /*addressComponent ({ province, city, district }) {
        return province + city + district
      },*/
      addressComponentType__: 'object',
      addressComponentObject__: undefined,
    }
  },
  watch: {
    addressComponentType__() {
      this.addressComponent = undefined
    },
    addressComponentObject__(n) {
      this.addressComponent = n ? JSON.parse(n) : undefined
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
