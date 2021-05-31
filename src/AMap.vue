<template>
  <el-dialog
    :visible.sync="show"
    :fullscreen="true"
    :append-to-body="true"
    :show-close="false"
    @close="$emit('update:show', false)"
    destroy-on-close
    v-if="show"
  >
    <!--<div slot="title" class="title">
      <span v-text="title||'坐标拾取'" class="title-text"/>
    </div>-->
    <div style="height:100%">
      <div class="autoComplete-wrapper">
        <span class="magnifier"/>
        <input id="autoComplete" tabindex="1" v-model="keyword" @keyup.enter="e=>{
          search()
          e.currentTarget.blur()
        }">
        <RegionSelect
          :label.sync='baseCity'
          class="region-select"
          placeholder="当前城市"
          :level='2'
          :show-all-levels="false"
          @change="initPlugins"
        />
      </div>
      <transition enter-active-class="animate__animated animate__backInLeft"
                  leave-active-class="animate__animated animate__backOutLeft">
        <div v-loading="searching"
             class="drawer"
             v-show="searchResult.length>0"
        >
          <div v-for="(v,i) of searchResult" :key="i" class="item" @click="locate(v)">
            <h3>{{ v.name }}</h3>
            <div style="margin:1rem;color:grey">{{ v.address }}</div>
          </div>
        </div>
      </transition>
      <!--<div class="meny-arrow">
        <i class="el-icon-search"/>
        <span>搜索</span>
      </div>-->
      <div
        ref="map-container"
        id="map-container"
        v-loading="loading"
        element-loading-custom-class="coord-picker-loading"
      />

      <div id="panel" class="scrollbar1">
        <ul id="myList"/>
      </div>
    </div>

    <Toolbar v-if="!loading">
      <el-tooltip effect="dark" content="绘制点位" placement="bottom">
        <a @click.stop="active='marker'"
           :class="{active:active==='marker'}">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M15 17h3v-3h2v3h3v2h-3v3h-2v-3h-3v-2M9 6.5c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5S6.5 10.4 6.5 9S7.6 6.5 9 6.5M9 2c3.9 0 7 3.1 7 7c0 5.2-7 13-7 13S2 14.2 2 9c0-3.9 3.1-7 7-7m0 2C6.2 4 4 6.2 4 9c0 1 0 3 5 9.7C14 12 14 10 14 9c0-2.8-2.2-5-5-5z"
              fill="currentColor"></path>
          </svg>
        </a>
      </el-tooltip>
      <el-tooltip effect="dark" content="绘制图层" placement="bottom" v-if="Img">
        <a :class="{active:active==='rectangle'}"
           @click.stop="active='rectangle'"
        >
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M21 15v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm.008-12c.548 0 .992.445.992.993V13h-2V5H4v13.999L14 9l3 3v2.829l-3-3L6.827 19H14v2H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016zM8 7a2 2 0 1 1 0 4a2 2 0 0 1 0-4z"
              fill="currentColor"></path>
          </svg>
        </a>
      </el-tooltip>
      <el-tooltip effect="dark" content="绘制轮廓" placement="bottom" v-if="BoundaryMaxCount>0">
        <a @click.stop="onPolygonBtnClick"
           :class="{active:active==='polygon'}">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path d="M17 15.7V13h2v4l-9 4l-7-7l4-9h4v2H8.3l-2.9 6.6l5 5l6.6-2.9M22 5v2h-3v3h-2V7h-3V5h3V2h2v3h3z"
                  fill="currentColor"></path>
          </svg>
        </a>
      </el-tooltip>
      <!--<el-tooltip effect="dark" content="重置" placement="bottom">
        <a @click.stop="()=>{reset();locate()}">
          <SvgIcon :data="require(`@icon/reset.svg`)"/>
        </a>
      </el-tooltip>-->
      <el-tooltip effect="dark" content="退出" placement="bottom">
        <a @click.stop="$emit('update:show', false)">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16zm0-9.414l2.828-2.829l1.415 1.415L13.414 12l2.829 2.828l-1.415 1.415L12 13.414l-2.828 2.829l-1.415-1.415L10.586 12L7.757 9.172l1.415-1.415L12 10.586z"
              fill="currentColor"></path>
          </svg>
        </a>
      </el-tooltip>
      <el-tooltip effect="dark" content="保存并关闭" placement="bottom">
        <a @click.stop="confirm">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M7 19v-6h10v6h2V7.828L16.172 5H5v14h2zM4 3h13l4 4v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm5 12v4h6v-4H9z"
              fill="currentColor"></path>
          </svg>
        </a>
      </el-tooltip>
    </Toolbar>

    <div class="absolute left-3px bottom-40px" style="position:absolute;left:3px;bottom:40px;" id="zoom">
      <span class="text-45px" style="color:#3297FD;font-size:35px;">{{ Zoom }}</span>
      <span class="text-10px" style="font-size:10px;"> 缩放级别</span>
    </div>
  </el-dialog>
</template>

<script>
import { isEmpty, notEmpty, typeOf } from 'kayran'
import 'kikimore/dist/style.css'
import { Swal } from 'kikimore'
const { error, warning, confirm, } = Swal
import { throttle as throttling, cloneDeep } from 'lodash-es'
import AMapLoader from '@amap/amap-jsapi-loader'
import '@tarekraafat/autocomplete.js/dist/css/autoComplete.css'
import autoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete'
//import './styles/meny-arrow.scss'
import './styles/autocomplete.scss'
import './styles/marker-list.scss'
import polygon from '@/mixins/polygon'
import rectangle from '@/mixins/rectangle'
import Toolbar from '@/components/Toolbar.vue'
import { getFinalProp } from '@/utils'
import globalProps from './config'
import { name } from '../package.json'
const prefix = `[${name}] `
import RegionSelect from 'region-select'

export default {
  name: 'CoordPicker',
  mixins: [polygon, rectangle],
  components: { Toolbar, RegionSelect },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    apiKey: String,
    lat: {
      validator: value => ['string', 'null', 'number'].includes(typeOf(value)),
    },
    lng: {
      validator: value => ['string', 'null', 'number'].includes(typeOf(value)),
    },
    address: {
      validator: value => ['string', 'null'].includes(typeOf(value)),
    },
    marker: {
      validator: value => ['object', 'array', 'null'].includes(typeOf(value)),
    },
    markerCount: [Number, Array],
    city: String,
    zoom: {
      validator: value => ['string', 'null', 'number'].includes(typeOf(value)),
    },
    img: {
      validator: value => ['string', 'null'].includes(typeOf(value)),
    },
    imgNorthEastLng: [Number, String],
    imgNorthEastLat: [Number, String],
    imgSouthWestLng: [Number, String],
    imgSouthWestLat: [Number, String],
    boundary: {
      validator: value => ['null', 'array'].includes(typeOf(value)),
    },
    precision: Number,
    addressComponent: [Object, Function],
    boundaryCount: [Number, Array],
  },
  data () {
    return {
      ...this.getInitData(),
      active: null,
      searching: false,
      keyword: '',
      searchResult: [],
      map: null,
      loading: true,
      markers: [],
      //meny: null,
      customClass: 'animate__animated animate__zoomIn',
      autoCompleting: false,
      autoCompleteList: [],
      autoCompleteInput: null,
      plugins: {
        Geocoder: null,
        AutoComplete: null,
        PlaceSearch: null,
        MarkerList: null,
        DistrictSearch: null,
        CitySearch: null,
      }
    }
  },
  computed: {
    BoundaryCount () {
      return getFinalProp(this.boundaryCount, globalProps.boundaryCount, 0)
    },
    BoundaryMaxCount () {
      return Array.isArray(this.BoundaryCount) ? this.BoundaryCount[1] : this.BoundaryCount
    },
    BoundaryMinCount () {
      return Array.isArray(this.BoundaryCount) ? this.BoundaryCount[0] : undefined
    },
    MarkerCount () {
      return getFinalProp(this.markerCount, globalProps.markerCount, 1)
    },
    MarkerMaxCount () {
      return Array.isArray(this.MarkerCount) ? this.MarkerCount[1] : this.MarkerCount
    },
    MarkerMinCount () {
      return Array.isArray(this.MarkerCount) ? this.MarkerCount[0] : undefined
    },
    Img () {
      return getFinalProp(this.img, globalProps.img)
    },
    Version () {
      return ''
    },
    /*title () {
      return this.curSpot.address + ((isEmpty(this.curSpot.lng) || isEmpty(this.curSpot.lat)) ? '' : `（${this.curSpot.lng}，${this.curSpot.lat}）`)
    },*/
    ApiKey () {
      return getFinalProp(this.apiKey, globalProps.apiKey)
    },
    Precision () {
      return getFinalProp(this.precision, globalProps.precision, 6)
    },
    AddressComponent () {
      return getFinalProp(this.addressComponent, globalProps.addressComponent, {
        province: true,
        city: true,
        district: true
      })
    },
  },
  watch: {
    show (newVal, oldVal) {
      if (newVal) {
        this.customClass = 'animate__animated animate__zoomIn'
        /*if (this.map) {
          this.reset()
        } else {*/
        AMapLoader.load({
          'key': this.ApiKey, // 申请好的Web端开发者Key，首次调用 load 时必填
          AMapUI: {
            version: '1.1',
            plugins: ['misc/MarkerList', 'overlay/SimpleMarker', 'overlay/SimpleInfoWindow']
          },
          ...this.Version ? { version: this.Version, } : {}, // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          'plugins': [
            'AMap.Scale',
            'AMap.MapType',
            //'AMap.ControlBar',
            'AMap.Geocoder',
            'AMap.CitySearch',
            'AMap.PlaceSearch',
            ...this.Version?.startsWith('2.') ?
              ['AMap.AutoComplete'] :
              ['AMap.Autocomplete'],
            ...this.Img ? [
              'AMap.MouseTool',
              'AMap.RectangleEditor',
            ] : [],
            ...this.boundary ? [
              'AMap.MouseTool',
              'AMap.Polygon',
              'AMap.ContextMenu',
              'AMap.DistrictSearch',
              ...this.Version?.startsWith('2.') ?
                ['AMap.PolygonEditor',] :
                ['AMap.PolyEditor',],
            ] : [],
          ]
        }).then(async AMap => {
          this.map = new AMap.Map('map-container', {
            //viewMode: '3D',
            ...notEmpty(this.Zoom) && { zoom: this.Zoom, }
          })

          // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
          this.map.addControl(new AMap.Scale())

          // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
          this.map.addControl(new AMap.MapType())

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
                      if (isEmpty(this.keyword)) {
                        this.searchResult = []
                        return []
                      } else {
                        return await this.fetchSuggestions()
                      }
                    },
                    key: ['name'],
                    cache: false
                  },
                  placeHolder: '搜索位置',              // Place Holder text                 | (Optional)
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
            //zIndex: 9999 // MarkerList始终比它高10
          })
          this.text.setMap(this.map)
          this.map.on('mousemove', this.setTextPosition)

          this.map.on('click', this.onMapClick)

          if (notEmpty(this.zoom)) {
            this.Zoom = Number(this.zoom)
          }
          this.map.on('zoomchange', e => {
            this.Zoom = this.map.getZoom()
          })

          if (this.Img || this.BoundaryMaxCount > 0) {
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
                e.obj.setOptions({
                  ...this.polygonStyle,
                  fillColor: '#00D3FC',
                })
                this.polygonObj.push(e.obj)
                this.editPolygon()
              }
              this.mouseTool.close()
            })
          }

          //this.map.addControl(new AMap.ControlBar())

          await this.locate()
        }).catch(e => {
          this.$emit('update:show', false)
          error(`地图初始化失败：${e}`)
        }).finally(e => {
        })
        //}
      } else {
        // 正常退出
        if (this.map) {
          this.customClass = 'animate__animated animate__zoomOut'
          this.reset()
          this.map.destroy()
        }
      }
    },
    keyword () {
      this.search()
    },
    active (newVal) {
      ({
        'marker': () => {
          this.mouseTool?.close()
          this.text.setText('单击绘制点位')
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
          this.text.setText('单击确定区域起点，双击结束绘制')
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
          let lnglats = result.locations // Array.<LngLat>
        }
      })
    },*/
    setCenter (args) {
      if (isEmpty(this.Zoom)) {
        this.map.setCenter(args)
      } else {
        this.map.setZoomAndCenter(this.Zoom, args)
      }
    },
    throttle (fnName, fn, param, delay) {
      //const functionName = /function\s*(\w*)/i.exec(fn.toString())[1]
      fnName += 'Throttle'
      if (!this[fnName]) {
        this[fnName] = throttling(fn, delay)
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
      this.plugins.Geocoder = new AMap.Geocoder(param)
      //兼容1.x
      this.plugins.AutoComplete = AMap.AutoComplete ?
        new AMap.AutoComplete(param) :
        new AMap.Autocomplete(param)
      this.plugins.PlaceSearch = new AMap.PlaceSearch(param)
      if (this.BoundaryMaxCount > 0) {
        this.plugins.DistrictSearch = new AMap.DistrictSearch({
          subdistrict: 0,   //获取边界不需要返回下级行政区
          extensions: 'all',  //返回行政区边界坐标组等具体信息
          level: 'district'  //行政级别
        })
      }
    },
    getInitData () {
      return cloneDeep({
        imageLayer: null,
        rectangleObj: null,
        rectangleEditor: null,
        markers: [],
        polygonObj: [],
        polygonEditor: [],
        curBoundary: [],
        Zoom: null,
        baseCity: '',
      })
    },
    reset () {
      this.plugins.MarkerList?.clearData()
      window.__CoordPicker__deleteMarker = undefined
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
      if (notEmpty(this.imgNorthEastLng) && notEmpty(this.imgSouthWestLng)) {
        this.curImg.imgNorthEastLng = Math.max(this.imgNorthEastLng, this.imgSouthWestLng)
        this.curImg.imgSouthWestLng = Math.min(this.imgNorthEastLng, this.imgSouthWestLng)
      }
      this.curImg.imgNorthEastLat = this.imgNorthEastLat
      this.curImg.imgSouthWestLat = this.imgSouthWestLat
      // 如果乾坤的子系统共享一个window对象 会导致报错——'禁止多种API加载方式混用'
      AMapLoader.reset()
    },
    getAddress ([lng, lat]) {
      return new Promise((resolve, reject) => {
        if (this.plugins.Geocoder) {
          this.useAmapApi('Geocoder.getAddress', [lng, lat])
          .then(result => {
            if (result.regeocode?.formattedAddress) {
              const { province, city, district, township } = result.regeocode.addressComponent
              const name = result.regeocode.formattedAddress.replace(province + city + district + township, '')
              if (typeof this.AddressComponent === 'function') {
                resolve({ address: this.AddressComponent(result.regeocode.addressComponent), name })
              } else {
                let address = result.regeocode.formattedAddress
                for (let k in this.AddressComponent) {
                  if (this.AddressComponent[k] === false) {
                    address = address.replace(result.regeocode.addressComponent[k], '')
                  }
                }
                resolve({ city, address, name })
              }
            } else {
              reject()
            }
          }).catch(e => {
            console.error(e)
          })
          .catch(result => {
            reject()
          })
        } else {
          // baseCity为空时
          resolve()
        }
      })
    },
    async onMapClick (e) {
      const { lng: longitude, lat: latitude } = e.lnglat
      const { address, name } = await this.getAddress([e.lnglat.lng, e.lnglat.lat])
      this.drawMarker({
        longitude,
        latitude,
        address,
        name
      })
    },
    fetchSuggestions (queryString, cb) {
      return new Promise((resolve, reject) => {
        this.useAmapApi('AutoComplete.search', this.keyword)
        .then(result => {
          resolve(result.tips || [])
        })
        .catch((result, status) => {
          debugger
          if (status === 'no_data') {
            resolve([])
          } else {
            error(result)
            reject()
          }
        })
      })
    },
    roundOff (value) {
      if (isEmpty(value)) {
        return ''
      } else {
        return {
          'number': () => value.toFixed(this.Precision).toString(),
          'string': () => Number(value).toFixed(this.Precision).toString()
        }[typeOf(value)]()
      }
    },
    confirm () {
      if (this.markerCount > 1) {
        const { lng, lat } = this.map.getCenter()
        this.$emit('update:lng', this.roundOff(lng))
        this.$emit('update:lat', this.roundOff(lat))
      } else {
        const { longitude, latitude, address } = this.markers[0] || {}
        this.$emit('update:lng', this.roundOff(longitude))
        this.$emit('update:lat', this.roundOff(latitude))
        this.$emit('update:address', address)
      }
      this.$emit('update:marker', cloneDeep(this.markers).map(v => {
        v.lng = this.roundOff(v.longitude)
        v.lat = this.roundOff(v.latitude)
        delete v.longitude
        delete v.latitude
        return v
      }))
      this.$emit('update:zoom', this.Zoom)
      if (this.Img) {
        //this.address || ((isEmpty(this.lng) || isEmpty(this.lat)) ? this.baseCity : '')
        this.$emit('update:imgNorthEastLng', this.roundOff(this.curImg.imgNorthEastLng))
        this.$emit('update:imgNorthEastLat', this.roundOff(this.curImg.imgNorthEastLat))
        this.$emit('update:imgSouthWestLng', this.roundOff(this.curImg.imgSouthWestLng))
        this.$emit('update:imgSouthWestLat', this.roundOff(this.curImg.imgSouthWestLat))
      }
      if (this.BoundaryMaxCount > 0) {
        this.syncPolygon()
        this.$emit('update:boundary', this.curBoundary)
      }
      this.$emit('update:show', false)
    },
    clearMarker () {
      this.markers.map(v => {
        if (v) {
          this.map.remove(v)
        }
      })
      this.markers.length = 0
    },
    drawMarker (markerOptions, isInit = false) {
      if (this.MarkerMaxCount > 1 && this.markers.length >= this.MarkerMaxCount && !isInit) {
        warning(`最多标记${this.MarkerMaxCount}个点位`)
      } else {
        /*const position = [lng, lat]
        const marker = new AMap.Marker({
          position,
        })
        this.map.add(marker)*/
        /*const marker = new AMapUI.SimpleMarker({
          containerClassNames: 'my-marker',
          // 背景图标样式
          iconStyle: 'red',
          // 前景文字
          iconLabel: {
            // A,B,C.....
            innerHTML: String.fromCharCode('A'.charCodeAt(0) + this.markers.length),
          },
          map: this.map,
          position: [lng, lat],
        })

        marker.on('mouseover', e => {
          console.log('mouseover', e)
          e.target.setIconStyle('blue')
        })

        marker.on('mouseout', e => {
          console.log('mouseout', e)
          e.target.setIconStyle('red')
        })

        marker.on('click', e => {
          console.log('click', e)
        })*/
        const { lng, lat, longitude, latitude } = markerOptions
        if (lng && !longitude) {
          markerOptions.longitude = lng
          delete markerOptions.lng
        }
        if (lat && !latitude) {
          markerOptions.latitude = lng
          delete markerOptions.lat
        }
        if (this.MarkerMaxCount > 1) {
          this.markers.push({
            ...markerOptions,
            //address: isInit ? this.address || await this.getAddress([lng, lat]),
          })
        } else {
          this.markers[0] = markerOptions
        }

        this.drawMarkerList(this.markers)
      }
    },
    drawMarkerList (marker) {
      this.plugins.MarkerList?.clearData()

      if (isEmpty(marker)) {
        return
      }

      const { MarkerList, SimpleMarker, SimpleInfoWindow } = AMapUI
      // 即jQuery/Zepto
      const $ = MarkerList.utils.$

      const defaultIconStyle = 'red', //默认的图标样式
        hoverIconStyle = 'blue', //鼠标hover时的样式
        selectedIconStyle = 'darkblue' //选中时的图标样式

      window.__CoordPicker__deleteMarker = index => {
        this.markers.splice(index, 1)
        this.drawMarkerList(this.markers)
      }

      this.plugins.MarkerList = new MarkerList({
        map: this.map,
        // ListElement对应的父节点或者ID
        listContainer: 'myList', //document.getElementById("myList"),
        // 选中后显示

        // 从数据中读取位置, 返回lngLat
        getPosition: function (item) {
          return [item.longitude, item.latitude]
        },
        // 数据ID，如果不提供，默认使用数组索引，即index
        getDataId: function (item, index) {
          return item.id
        },
        getInfoWindow: function (data, context, recycledInfoWindow) {
          if (recycledInfoWindow) {
            if (data.name) {
              recycledInfoWindow.setInfoTitle(data.name)
            }
            if (data.address) {
              recycledInfoWindow.setInfoBody(data.address)
            }
            return recycledInfoWindow
          }
          return new SimpleInfoWindow({
            infoTitle: data.name,
            infoBody: data.address,
            offset: new AMap.Pixel(0, -37)
          })
        },
        // 构造marker用的options对象, content和title支持模板，也可以是函数，返回marker实例，或者返回options对象
        getMarker: (data, context, recycledMarker) => {
          let label = String.fromCharCode('A'.charCodeAt(0) + context.index)
          if (recycledMarker) {
            recycledMarker.setIconLabel(label)
            return
          }
          const simpleMarker = new SimpleMarker({
            containerClassNames: 'my-marker',
            iconStyle: defaultIconStyle,
            iconLabel: label
          })

          const markerContextMenu = new AMap.ContextMenu()
          markerContextMenu.addItem('删除', e => {
            if (this.markers.length <= this.MarkerMinCount) {
              warning(`至少绘制${this.MarkerMinCount}个点位`)
            } else {
              this.markers.splice(context.index, 1)
              this.drawMarkerList(this.markers)
            }
          }, 0)

          simpleMarker.on('rightclick', e => {
            markerContextMenu.open(this.map, e.lnglat)
          })

          return simpleMarker
        },
        // 构造列表元素，与getMarker类似，可以是函数，返回一个dom元素，或者模板 html string
        getListElement: (data, context, recycledListElement) => {
          let label = String.fromCharCode('A'.charCodeAt(0) + context.index)
          // 使用模板创建

          const innerHTML = MarkerList.utils.template(`
            <div class="poi-info-left">
              <i class="el-icon-close" style="right:0;top:0;position:absolute;font-size:18px;" onclick="__CoordPicker__deleteMarker(${context.index})"></i>
              <h3 class="poi-title" <%- !data.name&&'style="display:"none"' %>>
                  <%- label %>. <%- data.name %>
              </h3>
              <div class="poi-info">
                  <span class="poi-price">
                      <%= data.price %>
                  </span>
                  <p class="poi-addr"><%- data.address %></p>
              </div>
            </div>`, {
            data: data,
            label: label
          })

          if (recycledListElement) {
            recycledListElement.innerHTML = innerHTML
            return recycledListElement
          }

          return '<li class="poibox">' +
            innerHTML +
            '</li>'
        },
        // 列表节点上监听的事件
        listElementEvents: ['click', 'mouseenter', 'mouseleave'],
        // marker上监听的事件
        markerEvents: ['click', 'mouseover', 'mouseout', 'rightclick'],
        // makeSelectedEvents:false,
        selectedClassNames: 'selected',
        autoSetFitView: false
      })

      /*this.plugins.MarkerList.on('markerRightclick', (event, info) => {
        //console.log(event, info)
      })*/

      this.plugins.MarkerList.on('selectedChanged', function (event, info) {
        //checkBtnStats()
        if (info.selected) {
          console.log(info)
          if (info.selected.marker) {
            //更新为选中样式
            info.selected.marker.setIconStyle(selectedIconStyle)
          }
          //选中并非由列表节点上的事件触发，将关联的列表节点移动到视野内
          if (!info.sourceEventInfo.isListElementEvent) {
            if (info.selected.listElement) {
              scrollListElementIntoView($(info.selected.listElement))
            }
          }
        }
        if (info.unSelected && info.unSelected.marker) {
          //更新为默认样式
          info.unSelected.marker.setIconStyle(defaultIconStyle)
        }
      })

      const that = this
      this.plugins.MarkerList.on('listElementMouseenter', function (event, record) {
        if (record && record.marker) {

          that.text.setText('右键删除')

          //this.openInfoWindowOnRecord(record);
          //非选中的id
          if (!this.isSelectedDataId(record.id)) {
            //设置为hover样式
            record.marker.setIconStyle(hoverIconStyle)
            //this.closeInfoWindow();
          }
        }
      })

      this.plugins.MarkerList.on('markerMouseover', function (event, record) {
        if (record && record.marker) {
          forcusMarker(record.marker)
          //this.openInfoWindowOnRecord(record);
          //非选中的id

          that.text.setText('右键删除')

          if (!this.isSelectedDataId(record.id)) {
            //设置为hover样式
            record.marker.setIconStyle(hoverIconStyle)
            //this.closeInfoWindow();
          }
        }
      })

      this.plugins.MarkerList.on('listElementMouseleave markerMouseout', function (event, record) {

        that.text.setText('单击绘制点位')

        if (record && record.marker) {
          if (!this.isSelectedDataId(record.id)) {
            //恢复默认样式
            record.marker.setIconStyle(defaultIconStyle)
          }
        }
      })

      // 数据输出完成
      /*this.plugins.MarkerList.on('renderComplete', function (event, records) {
        checkBtnStats()
      })*/

      // markerList.on('*', function(type, event, res) {
      //     console.log(type, event, res);
      // });

      //渲染数据
      this.plugins.MarkerList.render(marker)

      const forcusMarker = marker => {
        marker.setTop(true)

        //不在地图视野内
        if (!(this.map.getBounds().contains(marker.getPosition()))) {

          //移动到中心
          this.map.setCenter(marker.getPosition())
        }
      }

      const isElementInViewport = el => {
        let rect = el.getBoundingClientRect()

        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        )
      }

      function scrollListElementIntoView ($listEle) {
        if (!isElementInViewport($listEle.get(0))) {
          $('#panel').scrollTop($listEle.offset().top - $listEle.parent().offset().top)
        }
        //闪动一下
        $listEle
        .one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
          function (e) {
            $(this).removeClass('flash animated')
          }).addClass('flash animated')
      }
    },
    async locate (selectedLocation) {
      // 选中搜索项
      if (selectedLocation) {
        if (this.BoundaryMaxCount > 0) {
          this.useAmapApi('DistrictSearch.search', selectedLocation.name)
          .then(result => {
            const bounds = result.districtList?.[0]?.boundaries
            if (bounds?.length) {
              confirm(`是否绘制${selectedLocation.name}轮廓？`)
              .then(() => {
                this.drawPolygon(Array.from(bounds, v => ({ path: v })), false)
              })
            }
          })
          .catch((result, status) => {
          })
        }
        //this.meny.close()
        this.drawMarker({
          ...selectedLocation,
          longitude: selectedLocation.location.lng,
          latitude: selectedLocation.location.lat,
        })
        this.setCenter([selectedLocation.location.lng, selectedLocation.location.lat])
      }
      // 初始化
      else {
        this.baseCity = await this.getBaseCity()
        this.initPlugins()
        let centerDesignated = false, hasOverlay = false

        /**
         * 绘制覆盖物
         */
        // 传了图片 绘制图层
        if (this.Img &&
          notEmpty(this.curImg.imgSouthWestLng) &&
          notEmpty(this.curImg.imgSouthWestLat) &&
          notEmpty(this.curImg.imgNorthEastLng) &&
          notEmpty(this.curImg.imgNorthEastLat)
        ) {
          this.drawImg(new AMap.Bounds(
            new AMap.LngLat(this.curImg.imgSouthWestLng, this.curImg.imgSouthWestLat),
            new AMap.LngLat(this.curImg.imgNorthEastLng, this.curImg.imgNorthEastLat),
          ))
          hasOverlay = true
        }
        // 传了多边形 绘制多边形
        if (this.boundary?.length > 0) {
          this.drawPolygon(this.boundary)
          hasOverlay = true
        }

        /**
         * 中心点定位
         */
        // 传了中心点 将中心点当作一个点位
        if (notEmpty(this.lng) && notEmpty(this.lat)) {
          let address, name
          if (this.address) {
            address = this.address
          } else {
            const result = await this.getAddress([this.lng, this.lat])
            address = result.address
            name = result.name
          }

          this.markers = [{
            longitude: this.lng,
            latitude: this.lat,
            address,
            name,
          }]

          centerDesignated = true
        }
        // 传了点位 绘制点位
        if (this.marker?.length > 0) {
          cloneDeep(this.marker).map(v => {
            v.longitude = v.lng
            v.latitude = v.lat
            delete v.lng
            delete v.lat
            this.markers.push(v)
          })
        }
        // 如果点位只有一个 将其视为中心点
        if (this.markers.length === 1) {
          centerDesignated = true
        } else if (this.markers.length > 1) {
          hasOverlay = true
        }
        this.drawMarkerList(this.markers)
        // 如果没有传覆盖物且没有传zoom 给zoom赋默认值
        if (centerDesignated && isEmpty(this.Zoom)) {
          this.Zoom = 12
        }
        // 传了中心点 定位至该中心点
        if (notEmpty(this.lng) && notEmpty(this.lat)) {
          this.setCenter([this.lng, this.lat])
        }
        // 点位数量为1 定位至该点位
        else if (this.markers.length === 1 && notEmpty(this.markers[0].longitude) && notEmpty(this.markers[0].latitude)) {
          const { longitude, latitude } = this.markers[0]
          this.setCenter([longitude, latitude])
        }
        // 定位至address
        else if (this.address) {
          const result = await this.useAmapApi('Geocoder.getLocation', this.address)
          const { lng, lat } = result.geocodes[0]?.location
          if (notEmpty(lng) && notEmpty(lat)) {
            this.setCenter([lng, lat])
          }
        }
        // 存在覆盖物 将视图适配覆盖物
        else if (hasOverlay) {
          this.map.setFitView()
        }
        // 定位至baseCity
        else if (this.baseCity) {
          this.map.setCity(this.baseCity)
        }
      }
    },
    getBaseCity () {
      // 直辖市：['110100000000', '120100000000', '310100000000', '500100000000']
      const result = getFinalProp(this.city, globalProps.city, '')
      return new Promise((resolve, reject) => {
        if (result) {
          resolve(result)
        } else {
          this.plugins.CitySearch = new AMap.CitySearch()
          this.useAmapApi('CitySearch.getLocalCity')
          .then(result => {
            resolve(result.city)
          })
          .catch(result => {
            reject()
          })
        }
      })
    },
    search () {
      if (!this.keyword) {
        this.searchResult = []
        return
      }
      this.searching = true
      this.throttle('search', () => {

        this.useAmapApi('PlaceSearch.search', this.keyword)
        .then(result => {
          this.searchResult = result.poiList?.pois || []
        })
        .catch(result => {
          if (result.info === 'TIP_CITIES') {
            warning('尝试输入更精确的关键字哦')
          }
        })
        .finally(() => {
          this.searching = false
        })
      }, null, 500)
    },
    useAmapApi () {
      const loading = this.$loading({
        lock: false,
        background: 'transparent',
        customClass: 'coord-picker-loading'
      })
      const apiName = arguments[0]
      const [plugin, fn] = apiName.split('.')
      let args = Array.from(arguments)
      args.shift()
      return new Promise((resolve, reject) => {
        this.plugins[plugin][fn](...args, (status, result) => {
          console.log(prefix, `高德Web服务API ${apiName} 参数：`, args, '，返回值：\n', result, status)
          if (status === 'complete' && result.info === 'OK') {
            resolve(result, status)
          } else {
            reject(result, status)
          }
          loading.close()
        })
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
  display: none; // flex
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 0 0 10px 10px;
  min-height: 70px;
  padding: 0 20px;
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
      line-height: 25px;
      font-size: 22px;
      flex: 1;
      color: #003371;
      padding: 15px 0;
    }
  }
}

::v-deep .el-dialog__body {
  background-color: aliceblue;
  height: 100%;
  padding: 0;

  .region-select {
    display: inline-block;
    margin-left: 15px;
    width: 105px;

    input {
      border-radius: 20px;
    }
  }

  .drawer {
    box-sizing: border-box;
    //box-shadow: 50px 0 100px rgba(0, 0, 0, 0.5);
    width: 275px;
    height: 100%;
    overflow-y: auto;
    padding: 78px 16px 0 16px;
    position: absolute;
    z-index: 999;
    //background-image: linear-gradient(to left, #e6e9f0 0%, #eef1f5 100%);
    backdrop-filter: blur(2px);
    background-color: #f7f7f7ab;

    & > .item {
      padding: 0.5rem;
      cursor: pointer;

      &:hover {
        background-color: rgba(173, 216, 230, 0.4);
        border-radius: 25px;
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
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

::v-deep .amap-maptypecontrol {
  top: unset;
  bottom: 95px;
}
</style>

<style lang="scss">
.el-loading-mask.coord-picker-loading {
  left: 50%;
  top: 50%;
  bottom: unset;
  right: unset;
  transform: translate(-50%, -50%);
}
</style>
