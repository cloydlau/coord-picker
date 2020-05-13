<template>
  <el-dialog :visible.sync="show"
             :fullscreen="true"
             :append-to-body="true"
             :show-close="false"
             @close="$emit('update:show', false)"
             :custom-class="customClass"
             v-loading="loading"
  >
    <div slot="title" class="title">
      <span v-text="title||'地图选点'" class="title-text"/>
      <span>
        <el-button @click="$emit('update:show', false)" round>关 闭</el-button>
        <el-button v-if="!curPolygon" @click="drawPolygon" round>添加区域</el-button>
        <el-button type="primary" @click="confirm" round>确 定</el-button>
      </span>
    </div>
    <div style="display:flex;height:100%">
      <div class="drawer" v-loading="searching">
        <input id="autoComplete" tabindex="1" v-model="keyword">
        <div v-for="(v,i) of searchResult" :key="i" class="item" @click="locate(v)">
          <h3>{{v.name}}</h3>
          <div style="margin:1rem;color:grey">{{v.address}}</div>
        </div>
      </div>
      <div class="meny-arrow">
        <i class="el-icon-search"/>
        <span>搜索</span>
      </div>
      <div ref="map-container" id="map-container"/>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { isEmpty, err, Meny } from 'plain-kit'
import _ from 'lodash'
import AMapLoader from '@amap/amap-jsapi-loader'
import '@tarekraafat/autocomplete.js/dist/css/autoComplete.css'
import autoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete'
import './styles/meny-arrow.scss'
import './styles/autocomplete.scss'
import { apiKey, city } from './config.ts'

Vue.mixin({
  methods: {
    $isEmpty: isEmpty,
    $err: err,
  }
})

Vue.prototype._ = _

export default {
  name: 'CoordPicker',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    apiKey: String,
    lat: {
      validator: value => ['String', 'Null', 'Number'].includes(({}).toString.call(value).slice(8, -1)),
    },
    lng: {
      validator: value => ['String', 'Null', 'Number'].includes(({}).toString.call(value).slice(8, -1)),
    },
    address: {
      validator: value => ['String', 'Null'].includes(({}).toString.call(value).slice(8, -1)),
    },
    city: String,
    zoom: {
      validator: value => ['String', 'Null', 'Number'].includes(({}).toString.call(value).slice(8, -1)),
      default: 5,
    },
    img: {
      validator: value => ['String', 'Null'].includes(({}).toString.call(value).slice(8, -1)),
    },
    imgNorthEastLng: [Number, String],
    imgNorthEastLat: [Number, String],
    imgSouthWestLng: [Number, String],
    imgSouthWestLat: [Number, String],
    polygon: {
      validator: value => ['Array', 'Null'].includes(({}).toString.call(value).slice(8, -1)),
    }
  },
  data () {
    return {
      searching: false,
      keyword: '',
      searchResult: [],
      baseCity: '',
      map: null,
      marker: null,
      meny: null,
      customClass: 'animated zoomIn',
      imageLayer: null,
      loading: true,
      geocoder: null,
      autoComplete: null,
      placeSearch: null,
      autoCompleting: false,
      autoCompleteList: [],
      selfZoom: null,
    }
  },
  computed: {
    title () {
      return this.curSpot.address + ((this.$isEmpty(this.curSpot.lng) || this.$isEmpty(this.curSpot.lat)) ? '' : `（${this.curSpot.lng}，${this.curSpot.lat}）`)
    },
    curSpot () {
      return Vue.observable({
        lng: this.$isEmpty(this.lng) ? '' : Number(this.lng),
        lat: this.$isEmpty(this.lat) ? '' : Number(this.lat),
        address: this.address || ((this.$isEmpty(this.lng) && this.$isEmpty(this.lat)) ? this.baseCity : '')
      })
    },
    curImg () {
      return Vue.observable({
        imgNorthEastLng: this.$isEmpty(this.imgNorthEastLng) ? '' : Number(this.imgNorthEastLng),
        imgNorthEastLat: this.$isEmpty(this.imgNorthEastLat) ? '' : Number(this.imgNorthEastLat),
        imgSouthWestLng: this.$isEmpty(this.imgSouthWestLng) ? '' : Number(this.imgSouthWestLng),
        imgSouthWestLat: this.$isEmpty(this.imgSouthWestLat) ? '' : Number(this.imgSouthWestLat),
      })
    },
    curPolygon () {
      return this.polygon
    },
    key () {
      return this.apiKey || apiKey
    },
  },
  watch: {
    show (newVal, oldVal) {
      if (newVal) {
        this.customClass = 'animated zoomIn'
        if (!this.map) {
          AMapLoader.load({
            'key': this.key,   // 申请好的Web端开发者Key，首次调用 load 时必填
            'version': '2.0',   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            'plugins': [
              'AMap.ControlBar',
              'AMap.Rectangle',
              'AMap.RectangleEditor',
              'AMap.Geocoder',
              'AMap.CitySearch',
              'AMap.AutoComplete',
              'AMap.PlaceSearch',
              'AMap.Polygon',
              'AMap.PolyEditor',
            ]
          }).then(AMap => {
            this.map = new AMap.Map('map-container', {
              viewMode: '3D',
              zoom: this.selfZoom,
            })

            this.map.on('complete', () => {
            })

            this.locate()

            this.map.on('click', e => {
              this.clearSelection()
              this.curSpot.lng = e.lnglat.lng.toFixed(6)
              this.curSpot.lat = e.lnglat.lat.toFixed(6)
              this.geocoder.getAddress([this.curSpot.lng, this.curSpot.lat], (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                  this.curSpot.address = result.regeocode?.formattedAddress || ''
                }
              })
              this.drawMarker()
            })

            this.map.on('zoomchange', e => {
              this.selfZoom = this.map.getZoom()
            })

            this.map.addControl(new AMap.ControlBar())
          }).catch(e => {
            this.$err(e)
          })

          this.$nextTick(() => {
            this.meny = Meny.create({
              // The element that will be animated in from off screen
              menuElement: document.querySelector('.drawer'),
              // The contents that gets pushed aside while Meny is active
              contentsElement: document.querySelector('#map-container'),
              // [optional] The alignment of the menu (top/right/bottom/left)
              position: Meny.getQuery().p || 'left',
              // [optional] The height of the menu (when using top/bottom position)
              height: 200,
              // [optional] The width of the menu (when using left/right position)
              width: 384,
              // [optional] Distance from mouse (in pixels) when menu should open
              threshold: 40,
              // [optional] Use mouse movement to automatically open/close
              mouse: true,
              // [optional] Use touch swipe events to open/close
              touch: true,
              angle: 15.5
            })

            new autoComplete({
              data: {                              // Data src [Array, Function, Async] | (REQUIRED)
                src: async () => this.$isEmpty(this.keyword) ? [] : await this.fetchSuggestions(),
                key: ['name'],
                cache: false
              },
              placeHolder: '搜索地点',              // Place Holder text                 | (Optional)
              selector: '#autoComplete',           // Input field selector              | (Optional)
              threshold: 1,                        // Min. Chars length to start Engine | (Optional)
              debounce: 300,                       // Post duration for engine to start | (Optional)
              searchEngine: 'loose',               // Search Engine type/mode           | (Optional)
              resultsList: {                       // Rendered results list object      | (Optional)
                render: true,
              },
              maxResults: 10,                      // Max. number of rendered results | (Optional)
              highlight: true,                     // Highlight matching results      | (Optional)
              onSelection: feedback => {           // Action script onSelection event | (Optional)
                //console.log(feedback.selection.value.image_url)
                this.search()
              }
            })
          })
        }
      } else {
        this.customClass = 'animated zoomOut'
      }
    },
  },
  created () {
    this.selfZoom = this.zoom || 11
  },
  methods: {
    syncImg (bounds) {
      if (this.imageLayer) {
        this.curImg.imgNorthEastLng = bounds.northEast.lng
        this.curImg.imgNorthEastLat = bounds.northEast.lat
        this.curImg.imgSouthWestLng = bounds.southWest.lng
        this.curImg.imgSouthWestLat = bounds.southWest.lat
        this.imageLayer.setBounds(bounds)
      }
    },
    fetchSuggestions (queryString, cb) {
      return new Promise((resolve, reject) => {
        this.autoComplete.search(this.keyword, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result.tips || [])
          } else if (status === 'no_data') {
            resolve([])
          } else {
            this.$err(result)
            reject()
          }
        })
      })
    },
    confirm () {
      this.$emit('update:lat', this.curSpot.lat)
      this.$emit('update:lng', this.curSpot.lng)
      this.$emit('update:address', this.curSpot.address)
      this.$emit('update:zoom', this.selfZoom)
      if (this.img) {
        this.$emit('update:imgNorthEastLng', this.curImg.imgNorthEastLng)
        this.$emit('update:imgNorthEastLat', this.curImg.imgNorthEastLat)
        this.$emit('update:imgSouthWestLng', this.curImg.imgSouthWestLng)
        this.$emit('update:imgSouthWestLat', this.curImg.imgSouthWestLat)
      }
      if (this.polygon) {
        this.$emit('update:polygon', this.curPolygon)
      }
      this.$emit('update:show', false)
    },
    clearSelection () {
      if (this.marker) {
        this.curSpot.lng = ''
        this.curSpot.lat = ''
        this.curSpot.address = ''
        this.map.remove(this.marker)
      }
    },
    drawPolygon (polygon) {
      let path
      if (polygon) {
        path = polygon.map(v => [v.longitude, v.latitude])
      } else {
        const { northEastLng, northEastLat, southWestLng, southWestLat } = this.getCurViewRect()
        path = [
          [northEastLng, northEastLat],
          [southWestLng, southWestLat],
          [northEastLng, southWestLat],
          [southWestLng, northEastLat],
        ]
      }

      const p = new AMap.Polygon({
        map: this.map,
        path,
        strokeColor: '#0000ff',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#f5deb3',
        fillOpacity: 0.35
      })

      p.setMap(this.map)
      this.polylineEditor = new AMap.PolyEditor(this.map, p)
      this.polylineEditor.open()
      this.map.setFitView()
    },
    drawMarker () {
      const position = [this.curSpot.lng, this.curSpot.lat]
      this.marker = new AMap.Marker({
        position,
      })
      this.map.add(this.marker)
      this.map.panTo(position)
    },
    drawImgEditor () {
      const editRectangle = bounds => {
        this.rectangle = new AMap.Rectangle({
          bounds,
          strokeColor: 'red',
          strokeWeight: 6,
          strokeOpacity: 0.5,
          strokeDasharray: [30, 10],
          // strokeStyle还支持 solid
          strokeStyle: 'dashed',
          fillColor: 'transparent',
          fillOpacity: 0,
          cursor: 'pointer',
          zIndex: 50,
        })

        this.rectangle.setMap(this.map)

        let rectangleEditor = new AMap.RectangleEditor(this.map, this.rectangle)

        rectangleEditor.on('adjust', e => {
          this.syncImg(e.bounds)
        })

        //短距离平移触发
        this.rectangle.on('mouseup', e => {
          this.syncImg(this.rectangle.getBounds())
        })

        //长距离平移触发
        this.map.on('mouseup', e => {
          this.syncImg(this.rectangle.getBounds())
        })

        //rectangleEditor.on('end', e => {
        //})

        rectangleEditor.open()
        //rectangleEditor.close()
        this.map.setFitView()
      }

      if (this.$isEmpty(this.curImg.imgSouthWestLng) ||
        this.$isEmpty(this.curImg.imgSouthWestLat) ||
        this.$isEmpty(this.curImg.imgNorthEastLng) ||
        this.$isEmpty(this.curImg.imgNorthEastLat)
      ) {
        //图片角坐标不全时 定位至当前地图视野
        this.getBaseCity(true, () => {
          const { northEastLng, northEastLat, southWestLng, southWestLat } = this.getCurViewRect()
          this.curImg.imgNorthEastLng = northEastLng
          this.curImg.imgNorthEastLat = northEastLat
          this.curImg.imgSouthWestLng = southWestLng
          this.curImg.imgSouthWestLat = southWestLat
          exec()
        })
      } else {
        exec()
      }

      const exec = () => {
        const bounds = new AMap.Bounds(
          [this.curImg.imgSouthWestLng, this.curImg.imgSouthWestLat],
          [this.curImg.imgNorthEastLng, this.curImg.imgNorthEastLat],
        )
        this.imageLayer = new AMap.ImageLayer({
          url: this.img,
          bounds,
        })
        this.map.add(this.imageLayer)

        editRectangle(bounds)
      }
    },
    getCurViewRect () {
      const curBounds = this.map.getBounds()
      const northEast = curBounds.getNorthEast()
      const southWest = curBounds.getSouthWest()
      const lngQuarter = (northEast.lng - southWest.lng) / 4
      const latQuarter = (northEast.lng - southWest.lng) / 4
      return {
        northEastLng: northEast.lng - lngQuarter,
        northEastLat: northEast.lat - latQuarter,
        southWestLng: southWest.lng + lngQuarter,
        southWestLat: southWest.lat + latQuarter
      }
    },
    initPlugins () {
      this.geocoder = new AMap.Geocoder({
        city: this.baseCity
      })
      this.autoComplete = new AMap.AutoComplete({
        city: this.baseCity
      })
      this.placeSearch = new AMap.PlaceSearch({
        city: this.baseCity
      })
      this.loading = false
    },
    locate (selectedLocation) {
      //选中搜索项
      if (selectedLocation) {
        this.clearSelection()
        this.meny.close()
        this.curSpot.lat = selectedLocation.location.lat
        this.curSpot.lng = selectedLocation.location.lng
        this.curSpot.address = (selectedLocation.address || '') + (selectedLocation.title || '')
        this.drawMarker()
      }
      //初始化
      else {
        //直辖市：['110100000000', '120100000000', '310100000000', '500100000000']
        this.baseCity = this.city || city || ''
        this.initPlugins()
        let centerDesignated = false

        //传了图片 定位至该图片
        if (this.img) {
          centerDesignated = true
          this.drawImgEditor()
        }
        //传了多边形 定位至多边形
        else if (this.polygon && this.polygon.length > 0) {
          centerDesignated = true
          this.drawPolygon(this.polygon)
        }
        //传了点位 定位至该点位
        else if (!this.$isEmpty(this.curSpot.lat) && !this.$isEmpty(this.curSpot.lng)) {
          centerDesignated = true
          this.drawMarker()
        }
        this.getBaseCity(centerDesignated)
      }
    },
    getBaseCity (centerDesignated, callback) {
      //传了城市且未指定地图中心 定位至该城市
      if (this.baseCity) {
        if (!centerDesignated) {
          this.geocoder.getLocation(this.baseCity, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
              const { lng, lat } = result.geocodes[0]?.location
              if (!this.$isEmpty(lng) && !this.$isEmpty(lat)) {
                this.map.setCenter([lng, lat])
                callback && callback()
              }
            }
          })
        }
      }
      //没有传城市 ip定位城市
      else {
        const citySearch = new AMap.CitySearch()
        citySearch.getLocalCity((status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            this.baseCity = result.city
            this.initPlugins()
            //未指定地图中心 定位至该城市
            if (!centerDesignated) {
              this.map.setCity(this.baseCity)
            }
            callback && callback()
          }
        })
      }
    },
    search () {
      if (!this.keyword) {
        this.searchResult = []
        return
      }
      this.searching = true
      if (!this.doSearch) {
        this.doSearch = this._.throttle(() => {
          this.placeSearch.search(this.keyword, (status, result) => {
            if (status === 'complete' && result.info === 'OK' && result.poiList && result.poiList.pois) {
              this.searchResult = result.poiList.pois
            } else {
              this.searchResult = []
            }
            this.searching = false
          })
        }, 500)
      }
      this.doSearch()
    }
  }
}
</script>

<style lang="scss" scoped>
#map-container {
  flex: 1;
  height: 100%;
  cursor: crosshair !important;
}

::v-deep .el-dialog.is-fullscreen {
  overflow: hidden;
}

::v-deep .el-dialog__header {
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 0 0 10px 10px;
  height: 70px;
  padding: 0 20px;
  display: flex;
  position: fixed;
  top: 0;
  left: 400px;
  width: calc(100% - 800px);
  z-index: 1;
  backdrop-filter: blur(4px);
  background-color: #ffffff7a !important;

  .title {
    font-size: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .title-text {
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      display: -webkit-box;
      //-webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      line-height: normal;
      flex: 1;
      color: #003371;
    }
  }
}

::v-deep .el-dialog__body {
  background-color: aliceblue;
  height: 100%;
  padding: 0;

  .drawer {
    box-sizing: border-box;
    //box-shadow: 50px 0 100px rgba(0, 0, 0, 0.5);
    width: 384px;
    height: 100%;
    overflow-y: auto;
    padding: 1rem;
    position: absolute;
    z-index: 1;
    background-image: linear-gradient(to left, #e6e9f0 0%, #eef1f5 100%);
    backdrop-filter: blur(4px);

    .item {
      padding: 0.5rem;
      cursor: pointer;
    }

    .item:hover {
      background-color: #add8e65c;
      border-radius: 25px;
    }
  }
}
</style>
