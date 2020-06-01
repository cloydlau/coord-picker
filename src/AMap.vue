<template>
  <el-dialog :visible.sync="show"
             :fullscreen="true"
             :append-to-body="true"
             :show-close="false"
             @close="$emit('update:show', false)"
             destroy-on-close
             v-if="show"
  >
    <div slot="title" class="title">
      <span v-text="title||'坐标拾取'" class="title-text"/>
    </div>
    <div style="height:100%">
      <div class="autoComplete-wrapper">
        <input id="autoComplete" tabindex="1" v-model="keyword" @keyup.enter="e=>{
          search()
          e.currentTarget.blur()
        }">
      </div>
      <transition enter-active-class="animate__animated animate__backInLeft"
                  leave-active-class="animate__animated animate__backOutLeft">
        <div v-loading="searching"
             class="drawer"
             v-show="searchResult.length>0"
        >
          <div v-for="(v,i) of searchResult" :key="i" class="item" @click="locate(v)">
            <h3>{{v.name}}</h3>
            <div style="margin:1rem;color:grey">{{v.address}}</div>
          </div>
        </div>
      </transition>
      <!--<div class="meny-arrow">
        <i class="el-icon-search"/>
        <span>搜索</span>
      </div>-->
      <div ref="map-container" id="map-container" v-loading="loading"/>
    </div>

    <Toolbar v-if="!loading">
      <el-tooltip effect="dark" content="选取点位" placement="bottom">
        <a @click.stop="active='marker'"
           :class="{active:active==='marker'}">
          <svg-icon icon-class="locate"/>
        </a>
      </el-tooltip>
      <el-tooltip effect="dark" content="绘制图层" placement="bottom" v-if="img">
        <a :class="{active:active==='rectangle'}"
           @click.stop="active='rectangle'"
        >
          <svg-icon icon-class="draw-img"/>
        </a>
      </el-tooltip>
      <el-tooltip effect="dark" content="绘制轮廓" placement="bottom" v-if="boundary">
        <a @click.stop="active='polygon'"
           :class="{active:active==='polygon'}">
          <svg-icon icon-class="draw-polygon"/>
        </a>
      </el-tooltip>
      <!--<el-tooltip effect="dark" content="重置" placement="bottom">
        <a @click.stop="()=>{reset();locate()}">
          <svg-icon icon-class="reset"/>
        </a>
      </el-tooltip>-->
      <el-tooltip effect="dark" content="退出" placement="bottom">
        <a @click.stop="$emit('update:show', false)">
          <svg-icon icon-class="close"/>
        </a>
      </el-tooltip>
      <el-tooltip effect="dark" content="确定" placement="bottom">
        <a @click.stop="confirm">
          <svg-icon icon-class="save"/>
        </a>
      </el-tooltip>
    </Toolbar>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { isEmpty, err, warn, SvgIcon } from 'plain-kit'
import _ from 'lodash'
import AMapLoader from '@amap/amap-jsapi-loader'
import '@tarekraafat/autocomplete.js/dist/css/autoComplete.css'
import autoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete'
//import './styles/meny-arrow.scss'
import './styles/autocomplete.scss'
import polygon from '@/mixins/polygon'
import rectangle from '@/mixins/rectangle'
import Toolbar from '@/components/Toolbar'
import { apiKey, city, precision } from './config.ts'

const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(require.context('@/assets/svg-sprite', false, /\.svg$/))
Vue.component('SvgIcon', SvgIcon)

Vue.mixin({
  methods: {
    $isEmpty: isEmpty,
    $err: err,
    $warn: warn,
  }
})

Vue.prototype._ = _

export default {
  name: 'CoordPicker',
  mixins: [polygon, rectangle],
  components: { Toolbar },
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
    boundary: {
      validator: value => ['Array'].includes(({}).toString.call(value).slice(8, -1)),
    },
    precision: Number
  },
  data () {
    return {
      ...this.getInitData(),
      active: null,
      searching: false,
      keyword: '',
      searchResult: [],
      baseCity: '',
      map: null,
      loading: true,
      marker: null,
      //meny: null,
      customClass: 'animate__animated animate__zoomIn',
      geocoder: null,
      autoComplete: null,
      placeSearch: null,
      autoCompleting: false,
      autoCompleteList: [],
      autoCompleteInput: null
    }
  },
  computed: {
    version () {
      return ''
    },
    title () {
      return this.curSpot.address + ((this.$isEmpty(this.curSpot.lng) || this.$isEmpty(this.curSpot.lat)) ? '' : `（${this.curSpot.lng}，${this.curSpot.lat}）`)
    },
    curSpot () {
      return Vue.observable({
        lng: this.$isEmpty(this.lng) ? '' : this.lng,
        lat: this.$isEmpty(this.lat) ? '' : this.lat,
        address: this.address || ((this.$isEmpty(this.lng) && this.$isEmpty(this.lat)) ? this.baseCity : '')
      })
    },
    key () {
      return this.apiKey || apiKey
    },
    Precision () {
      return this.precision || precision || 6
    }
  },
  watch: {
    show (newVal, oldVal) {
      if (newVal) {
        this.customClass = 'animate__animated animate__zoomIn'
        /*if (this.map) {
          this.reset()
        } else {*/
        AMapLoader.load({
          'key': this.key,   // 申请好的Web端开发者Key，首次调用 load 时必填
          ...this.version ? { version: this.version, } : {}, // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          'plugins': [
            ...this.version && this.version.startsWith('2.') ?
              ['AMap.AutoComplete', 'AMap.PolygonEditor',] :
              ['AMap.Autocomplete', 'AMap.PolyEditor',],
            //'AMap.ControlBar',
            'AMap.RectangleEditor',
            'AMap.Geocoder',
            'AMap.CitySearch',
            'AMap.PlaceSearch',
            'AMap.Polygon',
            'AMap.ContextMenu',
            'AMap.MouseTool',
          ]
        }).then(AMap => {
          this.map = new AMap.Map('map-container', {
            //viewMode: '3D',
            zoom: this.selfZoom,
          })

          this.map.on('complete', () => {
            this.$nextTick(() => {
              /*this.meny = Meny.create({
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
              })*/

              const autoCompleteEl = document.querySelector('#autoComplete')
              autoCompleteEl.addEventListener('blur', e => {
                let el = document.querySelector('#autoComplete_list')
                if (el) {
                  el.style.visibility = 'hidden'
                }
              })
              autoCompleteEl.addEventListener('focus', e => {
                let el = document.querySelector('#autoComplete_list')
                if (el) {
                  document.querySelector('#autoComplete_list').style.visibility = 'visible'
                }
              })

              if (!this.autoCompleteInput) {
                this.autoCompleteInput = new autoComplete({
                  data: {                              // Data src [Array, Function, Async] | (REQUIRED)
                    src: async () => {
                      if (this.$isEmpty(this.keyword)) {
                        this.searchResult = []
                        return []
                      } else {
                        return await this.fetchSuggestions()
                      }
                    },
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
                    this.keyword = feedback.selection.value.name
                    document.querySelector('#autoComplete_list').style.visibility = 'hidden'
                  }
                })
              }

              this.loading = false
            })
          })

          this.active = 'marker'

          this.text = new AMap.Text({
            anchor: 'center', // 设置文本标记锚点
            offset: new AMap.Pixel(0, -20),
            style: {
              'border-radius': '17.5px',
              'padding': '5px 10px',
              'border-width': 0,
              'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
              'text-align': 'center',
            },
          })
          this.text.setMap(this.map)
          this.map.on('mousemove', this.setTextPosition)

          this.map.on('click', this.onMapClick)

          this.mouseTool = new AMap.MouseTool(this.map)
          this.mouseTool.on('draw', e => {
            //1.x：e.obj.CLASS_NAME==='AMap.Polygon'
            //2.x：e.obj.className==='Overlay.Rectangle'
            if (this.active === 'rectangle') {
              this.active = 'marker'
              //图层只允许有一个 清除之前绘制的
              if (this.rectangleObj) {
                this.rectangleEditor.close()
                this.rectangleEditor = null
                this.rectangleObj.setMap(null)
              }
              this.rectangleObj = e.obj
              //this.editImg(this.rectangleObj.getBounds()) 1.x中编辑绘制出来矩形会报错
              e.obj.setMap(null) //1.x改为销毁绘制出来的矩形并新建一个矩形对象
              this.drawImg(this.rectangleObj.getBounds())
            }
              //1.x：e.obj.CLASS_NAME==='AMap.Polygon'
            //2.x：e.obj.className==='Overlay.Polygon'
            else if (this.active === 'polygon') {
              this.active = 'marker'
              this.polygonObj.push(e.obj)
              this.editPolygon()
            }
            this.mouseTool.close()
          })

          this.map.on('zoomchange', e => {
            this.selfZoom = this.map.getZoom()
          })

          //this.map.addControl(new AMap.ControlBar())

          this.locate()
        }).catch(e => {
          this.$err(e)
        })
        //}
      } else {
        this.customClass = 'animate__animated animate__zoomOut'
        this.reset()
        this.map.destroy()
      }
    },
    keyword () {
      this.search()
    },
    active (newVal) {
      ({
        'marker': () => {
          this.mouseTool.close()
          this.text.setText('点击获取坐标')
          this.text.on('click', this.onMapClick)
          this.map.on('click', this.onMapClick)
        },
        'rectangle': () => {
          this.text.setText('按住左键并拖动绘制图层')
          this.text.off('click', this.onMapClick)
          this.map.off('click', this.onMapClick)
          this.mouseTool.rectangle(this.rectangleStyle)
        },
        'polygon': () => {
          this.text.setText('单击确定起点，双击结束绘制')
          this.text.off('click', this.onMapClick)
          this.map.off('click', this.onMapClick)
          this.drawPolygon()
        },
      })[newVal]()
    }
  },
  methods: {
    /*convertLngLat () {
      new AMap.convertFrom(gps, 'gps', function (status, result) {
        if (result.info === 'ok') {
          var lnglats = result.locations // Array.<LngLat>
        }
      })
    },*/
    throttle (fnName, fn, param, delay) {
      //const functionName = /function\s*(\w*)/i.exec(fn.toString())[1]
      fnName += 'Throttle'
      if (!this[fnName]) {
        this[fnName] = this._.throttle(fn, delay)
      }
      this[fnName](param)
    },
    setTextPosition (e) {
      this.throttle('setTextPosition', e => {
        this.text.setPosition([e.lnglat.lng, e.lnglat.lat])
      }, e, 30)
    },
    initPlugins () {
      /**
       * 不写在watch原因：需要同步执行
       */
      const param = {
        city: this.baseCity
      }
      this.geocoder = new AMap.Geocoder(param)
      //兼容1.x
      this.autoComplete = AMap.AutoComplete ?
        new AMap.AutoComplete(param) :
        new AMap.Autocomplete(param)
      this.placeSearch = new AMap.PlaceSearch(param)
    },
    getInitData () {
      return this._.cloneDeep({
        selfZoom: this.zoom || 12,
        imageLayer: null,
        rectangleObj: null,
        rectangleEditor: null,
        polygonObj: [],
        polygonEditor: [],
        curBoundary: []
      })
    },
    reset () {
      this.searchResult = []
      this.keyword = ''
      if (this.imageLayer) {
        this.imageLayer.setMap(null)
        this.rectangleEditor.close()
      }
      if (this.polygonEditor.length > 0) {
        this.polygonEditor.map(v => {
          if (v) {
            v.close()
          }
        })
      }
      //this.map.clearMap() 某些情况下未知报错
      Object.assign(this.$data, this.getInitData())
      this.curImg.imgNorthEastLng = Math.max(this.imgNorthEastLng, this.imgSouthWestLng)
      this.curImg.imgNorthEastLat = this.imgNorthEastLat
      this.curImg.imgSouthWestLng = Math.min(this.imgNorthEastLng, this.imgSouthWestLng)
      this.curImg.imgSouthWestLat = this.imgSouthWestLat
      this.curSpot.lng = this.$isEmpty(this.lng) ? '' : this.lng
      this.curSpot.lat = this.$isEmpty(this.lat) ? '' : this.lat
      this.curSpot.address = this.address || ((this.$isEmpty(this.lng) && this.$isEmpty(this.lat)) ? this.baseCity : '')
    },
    onMapClick (e) {
      this.clearMarker()
      this.curSpot.lng = e.lnglat.lng.toFixed(this.Precision)
      this.curSpot.lat = e.lnglat.lat.toFixed(this.Precision)
      this.geocoder.getAddress([this.curSpot.lng, this.curSpot.lat], (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          this.curSpot.address = result.regeocode?.formattedAddress || ''
        }
      })
      this.drawMarker()
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
      if (this.boundary) {
        this.syncPolygon()
        this.$emit('update:boundary', this.curBoundary)
      }
      this.$emit('update:show', false)
    },
    clearMarker () {
      if (this.marker) {
        this.curSpot.lng = ''
        this.curSpot.lat = ''
        this.curSpot.address = ''
        this.map.remove(this.marker)
      }
    },
    drawMarker () {
      const position = [this.curSpot.lng, this.curSpot.lat]
      this.marker = new AMap.Marker({
        position,
      })
      this.map.add(this.marker)
    },
    locate (selectedLocation) {
      //选中搜索项
      if (selectedLocation) {
        this.clearMarker()
        //this.meny.close()
        this.curSpot.lat = selectedLocation.location.lat
        this.curSpot.lng = selectedLocation.location.lng
        this.geocoder.getAddress([this.curSpot.lng, this.curSpot.lat], (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            const { province, city, district } = result.regeocode?.addressComponent
            this.curSpot.address = (province || '') + (city || '') + (district || '') + (selectedLocation.address || '') + (selectedLocation.name || '')
          }
        })
        this.drawMarker()
        this.map.setCenter([this.curSpot.lng, this.curSpot.lat])
      }
      //初始化
      else {
        //直辖市：['110100000000', '120100000000', '310100000000', '500100000000']
        this.baseCity = this.city || city || ''
        if (this.baseCity) {
          this.initPlugins()
        }

        new Promise((resolve, reject) => {
          let centerDesignated = false
          //传了图片 绘制图层
          if (this.img &&
            !this.$isEmpty(this.curImg.imgSouthWestLng) &&
            !this.$isEmpty(this.curImg.imgSouthWestLat) &&
            !this.$isEmpty(this.curImg.imgNorthEastLng) &&
            !this.$isEmpty(this.curImg.imgNorthEastLat)
          ) {
            this.drawImg(new AMap.Bounds(
              new AMap.LngLat(this.curImg.imgSouthWestLng, this.curImg.imgSouthWestLat),
              new AMap.LngLat(this.curImg.imgNorthEastLng, this.curImg.imgNorthEastLat),
            ))
            centerDesignated = true
          }
          //传了多边形 绘制多边形
          if (this.boundary && this.boundary.length > 0) {
            this.drawPolygon(this.boundary)
            centerDesignated = true
          }
          //传了点位 定位至该点位
          if (!this.$isEmpty(this.curSpot.lat) && !this.$isEmpty(this.curSpot.lng)) {
            this.drawMarker()
            this.map.setCenter([this.curSpot.lng, this.curSpot.lat])
            centerDesignated = true
          }
          //否则将视图适配覆盖物
          else if (centerDesignated) {
            this.map.setFitView()
          }
          //仅传了地址 定位至该地址 并将该地址所在的城市设置为baseCity
          if (!centerDesignated && this.curSpot.address) {
            this.geocoder.getLocation(this.curSpot.address, (status, result) => {
              console.log('【address逆解析】')
              console.log(result)
              if (status === 'complete' && result.info === 'OK') {
                const { lng, lat } = result.geocodes[0]?.location
                this.baseCity = result.geocodes[0]?.addressComponent.city
                this.initPlugins()
                if (!this.$isEmpty(lng) && !this.$isEmpty(lat)) {
                  this.map.setCenter([lng, lat])
                  resolve(true)
                }
              }
              resolve(false)
            })
          } else {
            resolve(centerDesignated)
          }
        }).then(centerDesignated => {
          this.getBaseCity(centerDesignated)
        })
      }
    },
    getBaseCity (centerDesignated) {
      //传了城市（非城市编码）且未指定地图中心 定位至该城市
      if (this.baseCity && isNaN(this.baseCity)) {
        if (!centerDesignated) {
          this.geocoder.getLocation(this.baseCity, (status, result) => {
            console.log('【city解析】')
            console.log(result)
            if (status === 'complete' && result.info === 'OK') {
              const { lng, lat } = result.geocodes[0]?.location
              if (!this.$isEmpty(lng) && !this.$isEmpty(lat)) {
                this.map.setCenter([lng, lat])
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
      this.throttle('search', () => {
        this.placeSearch.search(this.keyword, (status, result) => {
          console.log('【搜索结果】')
          console.log(result)
          if (status === 'complete') {
            if (result.info === 'OK' && result.poiList && result.poiList.pois) {
              this.searchResult = result.poiList.pois || []
            } else if (result.info === 'TIP_CITIES') {
              this.$warn('尝试输入更加精确的关键字哦')
            }
          }
          this.searching = false
        }, null, 500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#map-container {
  height: 100%;
  width: 100%;
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
      //display: -webkit-box;
      text-align: center;
      //-webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      line-height: 22px;
      font-size: 22px;
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
    padding: 75px 16px;
    position: absolute;
    z-index: 1;
    //background-image: linear-gradient(to left, #e6e9f0 0%, #eef1f5 100%);
    backdrop-filter: blur(2px);
    background-color: #f7f7f7ab;

    & > .item {
      padding: 0.5rem;
      cursor: pointer;

      &:hover {
        background-color: #add8e69e;
        border-radius: 25px;
      }
    }

    &::-webkit-scrollbar {
      width: 10px;
      height: 1px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: skyblue;
      background-image: -webkit-linear-gradient(
                      45deg,
                      rgba(255, 255, 255, 0.2) 25%,
                      transparent 25%,
                      transparent 50%,
                      rgba(255, 255, 255, 0.2) 50%,
                      rgba(255, 255, 255, 0.2) 75%,
                      transparent 75%,
                      transparent
      );
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: #ededed;
      //border-radius: 10px;
    }
  }
}
</style>
