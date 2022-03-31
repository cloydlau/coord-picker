<template>
  <el-dialog
    :visible="show"
    :fullscreen="true"
    :append-to-body="true"
    :show-close="false"
    @close="$emit('update:show', false)"
    destroy-on-close
    v-if="show"
    custom-class="coord-picker"
    v-on="$listeners"
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
        <KiSelect
          class="region-selector"
          ref="regionKiSelect"
          placeholder="当前城市"
          :label.sync='baseCity'
          :props="{
            value: 'id',
            label: 'name',
            groupLabel: 'name',
            groupOptions: 'cities',
          }"
          :options="cities"
        />
      </div>
      <transition enter-active-class="animate__animated animate__backInLeft"
                  leave-active-class="animate__animated animate__backOutLeft">
        <div
          v-loading="searching"
          class="drawer"
          v-show="searchResult.length>0"
        >
          <div v-for="(v,i) of searchResult" :key="i" class="item" @click="locate(v)">
            <div>{{ v.name }}</div>
            <div>{{ v.address }}</div>
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
        v-loading="Loading"
        element-loading-custom-class="map-container"
      />

      <div id="panel" class="scrollbar1">
        <ul id="myList"/>
      </div>
    </div>

    <Toolbar>
      <el-tooltip effect="dark" content="使用帮助" placement="bottom">
        <a @click.stop="help">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
               role="img" width="32" height="32" preserveAspectRatio="xMidYMid meet"
               viewBox="0 0 24 24">
            <path
              d="M11 18h2v-2h-2v2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2a2 2 0 0 1 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4z"
              fill="currentColor"
            />
          </svg>
        </a>
      </el-tooltip>
      <el-dropdown
        @command="command=>{this[command](['marker'])}"
        :class="{active:active==='marker'}"
      >
        <a @click.stop="active='marker'">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M15 17h3v-3h2v3h3v2h-3v3h-2v-3h-3v-2M9 6.5c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5S6.5 10.4 6.5 9S7.6 6.5 9 6.5M9 2c3.9 0 7 3.1 7 7c0 5.2-7 13-7 13S2 14.2 2 9c0-3.9 3.1-7 7-7m0 2C6.2 4 4 6.2 4 9c0 1 0 3 5 9.7C14 12 14 10 14 9c0-2.8-2.2-5-5-5z"
              fill="currentColor"
            />
          </svg>
        </a>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="reset">重置点位</el-dropdown-item>
          <el-dropdown-item command="clear">清除点位</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown
        v-if="(rectangle && rectangle.length) || RectangleMaxCount > 0"
        @command="command=>{this[command](['rectangle'])}"
        :class="{active:active==='rectangle'}"
      >
        <a @click.stop="onRectangleBtnClick">
          <svg
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
            role="img" width="32" height="32" preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
            :class="!RectangleMaxCount && 'disabled'"
          >
            <path d="M19 6h3v2h-3v3h-2V8h-3V6h3V3h2v3m-2 11v-3h2v5H3V6h8v2H5v9h12z" fill="currentColor"></path>
          </svg>
        </a>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="setCurImage" v-if="RectangleMaxCount > 0 && RectangleImage.length > 0">选择贴图
          </el-dropdown-item>
          <el-dropdown-item command="reset">重置矩形</el-dropdown-item>
          <el-dropdown-item command="clear">清除矩形</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown
        v-if="(polygon && polygon.length) || PolygonMaxCount > 0"
        @command="command=>{this[command](['polygon'])}"
        :class="{active:active==='polygon'}"
      >
        <a @click.stop="onPolygonBtnClick">
          <svg
            :class="!PolygonMaxCount && 'disabled'"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path d="M17 15.7V13h2v4l-9 4l-7-7l4-9h4v2H8.3l-2.9 6.6l5 5l6.6-2.9M22 5v2h-3v3h-2V7h-3V5h3V2h2v3h3z"
                  fill="currentColor"
            />
          </svg>
        </a>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="reset">重置多边形</el-dropdown-item>
          <el-dropdown-item command="clear">清除多边形</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-tooltip effect="dark" content="取消" placement="bottom">
        <a @click.stop="cancel">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16zm0-9.414l2.828-2.829l1.415 1.415L13.414 12l2.829 2.828l-1.415 1.415L12 13.414l-2.828 2.829l-1.415-1.415L10.586 12L7.757 9.172l1.415-1.415L12 10.586z"
              fill="currentColor"
            />
          </svg>
        </a>
      </el-tooltip>
      <el-tooltip :class="Loading&&'invisible'" effect="dark" content="确定" placement="bottom">
        <a @click.stop="confirm">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              d="M7 19v-6h10v6h2V7.828L16.172 5H5v14h2zM4 3h13l4 4v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm5 12v4h6v-4H9z"
              fill="currentColor"
            />
          </svg>
        </a>
      </el-tooltip>
    </Toolbar>

    <div
      v-show="!Loading"
      class="absolute left-3px bottom-40px"
      style="position:absolute;left:3px;bottom:40px;"
      id="zoom"
    >
      <span class="text-45px" style="color:#3297FD;font-size:35px;">{{ MapOptions.zoom }}</span>
      <span class="text-10px" style="font-size:10px;"> 缩放级别</span>
    </div>

    <KiFormDialog
      :show.sync="imagePicker.show"
      v-model="imagePicker.data"
      append-to-body
      :retrieve="imagePicker.retrieve"
      :submit="imagePicker.submit"
      title="选择嵌在矩形内的贴图"
      custom-class="imagePicker"
    >
      <PicViewer :value="RectangleImage" :viewerjs="false">
        <template v-slot="{ src, index }">
          <div class="inline-block relative">
            <img :src="src" class="h-148px cursor-pointer" alt="" @click="changeCurImage(src)">
            <svg
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
              role="img" width="32" height="32" preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 24 24"
              class="absolute -right-3 -top-3 w-25px"
              v-show="imagePicker.data===src"
            >
              <path
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="#409eff"
              />
            </svg>
          </div>
        </template>
      </PicViewer>
    </KiFormDialog>
  </el-dialog>
</template>

<script>
import { isEmpty, notEmpty, typeOf, waitFor } from 'kayran'
import 'kikimore/dist/style.css'
import { Swal, Select as KiSelect, FormDialog as KiFormDialog } from 'kikimore'

const { error, warning, confirm, } = Swal
import { throttle as throttling, cloneDeep, merge } from 'lodash-es'
import AMapLoader from '@amap/amap-jsapi-loader'
import '@tarekraafat/autocomplete.js/dist/css/autoComplete.css'
import autoComplete from '@tarekraafat/autocomplete.js/dist/js/autoComplete'
//import './styles/meny-arrow.scss'
import './styles/autocomplete.scss'
import './styles/marker-list.scss'
import polygon from '@/mixins/polygon'
import rectangle from '@/mixins/rectangle'
import Toolbar from '@/components/Toolbar.vue'
import { getFinalProp } from 'kayran'
import globalProps from './config'
import { name } from '../package.json'

const prefix = `[${name}] `
import cities from './assets/city.json'
import 'pic-viewer/dist/style.css'
import PicViewer from 'pic-viewer'

export default {
  name: 'CoordPicker',
  mixins: [polygon, rectangle],
  components: { Toolbar, KiSelect, KiFormDialog, PicViewer },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    lat: {
      validator: value => ['string', 'null', 'number'].includes(typeOf(value)),
    },
    lng: {
      validator: value => ['string', 'null', 'number'].includes(typeOf(value)),
    },
    address: {
      validator: value => ['string', 'null'].includes(typeOf(value)),
    },
    marker: {},
    markerCount: {},
    city: {},
    polygon: {},
    precision: {},
    addressComponent: {},
    polygonCount: {},
    mapOptions: {},
    loadOptions: {},
    rectangleImage: {},
    rectangle: {},
    rectangleCount: {},
  },
  data () {
    return {
      ...this.getInitData(),
      cities,
      active: null,
      initializing: true,
      loading: false,
      //meny: null,
      //customClass: 'animate__animated animate__zoomIn',
      keyword: '',
      searching: false,
      searchResult: [],
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
    MarkerStatus () {
      if (this.MarkerMaxCount > 0) {
        return 'editable'
      } else if (this.Marker?.length > 0) {
        return 'readonly'
      }
    },
    RectangleStatus () {
      if (this.RectangleMaxCount > 0) {
        return 'editable'
      } else if (this.Rectangle?.length > 0) {
        return 'readonly'
      }
    },
    PolygonStatus () {
      if (this.PolygonMaxCount > 0) {
        return 'editable'
      } else if (this.Polygon?.length > 0) {
        return 'readonly'
      }
    },
    Marker () {
      return getFinalProp([this.marker, globalProps.marker], {
        name: 'marker',
        type: ['object', 'array', 'null']
      })
    },
    Polygon () {
      return getFinalProp([this.polygon, globalProps.polygon], {
        name: 'polygon',
        type: ['array', 'null']
      })
    },
    Rectangle () {
      return getFinalProp([this.rectangle, globalProps.rectangle], {
        name: 'rectangle',
        type: ['array', 'null']
      })
    },
    RectangleCount () {
      return getFinalProp([this.rectangleCount, globalProps.rectangleCount, 0], {
        name: 'rectangleCount',
        type: ['number', 'array']
      })
    },
    RectangleMaxCount () {
      return Array.isArray(this.RectangleCount) ? this.RectangleCount[1] : this.RectangleCount
    },
    RectangleMinCount () {
      return Array.isArray(this.RectangleCount) ? this.RectangleCount[0] : undefined
    },
    PolygonCount () {
      return getFinalProp([this.polygonCount, globalProps.polygonCount, 0], {
        name: 'polygonCount',
        type: ['number', 'array']
      })
    },
    PolygonMaxCount () {
      return Array.isArray(this.PolygonCount) ? this.PolygonCount[1] : this.PolygonCount
    },
    PolygonMinCount () {
      return Array.isArray(this.PolygonCount) ? this.PolygonCount[0] : undefined
    },
    MarkerCount () {
      return getFinalProp([this.markerCount, globalProps.markerCount, 1], {
        name: 'markerCount',
        type: ['number', 'array']
      })
    },
    MarkerMaxCount () {
      return Array.isArray(this.MarkerCount) ? this.MarkerCount[1] : this.MarkerCount
    },
    MarkerMinCount () {
      return Array.isArray(this.MarkerCount) ? this.MarkerCount[0] : undefined
    },
    RectangleImage () {
      const temp = getFinalProp([this.rectangleImage, globalProps.rectangleImage, []], {
        name: 'rectangleImage',
        type: ['string', 'array']
      })
      return (typeof temp === 'string') ? [temp] : temp
    },
    /*title () {
      return this.curSpot.address + ((isEmpty(this.curSpot.lng) || isEmpty(this.curSpot.lat)) ? '' : `（${this.curSpot.lng}，${this.curSpot.lat}）`)
    },*/
    Precision () {
      return getFinalProp([this.precision, globalProps.precision, 6], {
        name: 'precision',
        type: 'number'
      })
    },
    AddressComponent () {
      return getFinalProp([this.addressComponent, globalProps.addressComponent, {
        province: true,
        city: true,
        district: true
      }], {
        name: 'addressComponent',
        type: ['object', 'function']
      })
    },
    Loading () {
      return this.loading || this.initializing
    },
    LoadOptions () {
      return getFinalProp([this.loadOptions, globalProps.loadOptions, {
        AMapUI: {
          version: '1.1',
          plugins: ['misc/MarkerList', 'overlay/SimpleMarker', 'overlay/SimpleInfoWindow']
        },
        //version: '1.4.15', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          'AMap.Scale',
          'AMap.MapType',
          //'AMap.ControlBar',
          'AMap.Geocoder',
          'AMap.CitySearch',
          'AMap.PlaceSearch',
          'AMap.Autocomplete', // 2.x为AMap.AutoComplete
          ...this.RectangleStatus === 'editable' ? [
            'AMap.MouseTool',
            'AMap.RectangleEditor',
          ] : [],
          ...this.PolygonStatus === 'editable' ? [
            'AMap.Polygon',
            'AMap.MouseTool',
            'AMap.ContextMenu',
            'AMap.DistrictSearch',
            'AMap.PolyEditor', // 2.x为AMap.PolygonEditor
          ] : [],
          ...this.PolygonStatus === 'readonly' ? [
            'AMap.Polygon',
          ] : [],
        ]
      }], {
        name: 'loadOptions',
        required: true,
        type: 'object',
        camelCase: false,
      })
    }
  },
  watch: {
    show (n, o) {
      if (n) {
        this.MapOptions = getFinalProp([this.mapOptions, globalProps.mapOptions, {
          //viewMode: '3D',
        }], {
          name: 'mapOptions',
          type: 'object'
        })

        //this.customClass = 'animate__animated animate__zoomIn'
        AMapLoader.load(this.LoadOptions)
        .then(async AMap => {
          this.map = new AMap.Map('map-container', this.MapOptions)

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

              this.initializing = false
            })
          })

          this.active = 'marker'

          /*this.text = new AMap.Text({
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
          this.map.on('mousemove', this.setTextPosition)*/

          this.map.on('click', this.onMapClick)

          if (notEmpty(this.MapOptions.zoom)) {
            this.MapOptions.zoom = Number(this.MapOptions.zoom)
          }

          if (this.RectangleStatus === 'editable' || this.PolygonStatus === 'editable') {
            this.mouseTool = new AMap.MouseTool(this.map)
            this.mouseTool.on('draw', e => {
              //1.x：e.obj.CLASS_NAME==='AMap.Polygon'
              //2.x：e.obj.className==='Overlay.Rectangle'
              if (this.active === 'rectangle') {
                this.active = 'marker'
                // 如果矩形只允许有一个 清除之前绘制的
                /*if (
                  this.Rectangle?.length === 1 &&
                  this.overlay.rectangleInstance.length === 1 &&
                  this.RectangleMaxCount === 1
                ) {
                  this.overlay.rectangleInstance.pop().setMap(null)
                  this.overlay.rectangleEditor.pop().close()
                }*/
                //this.overlay.rectangleInstance.push(e.obj)
                //this.editRectangle(this.overlay.rectangleInstance.getBounds()) 1.x中编辑绘制出来矩形会报错
                e.obj.setMap(null) // 1.x改为销毁绘制出来的矩形并新建一个矩形对象

                this.drawRectangle({
                  image: this.curImage,
                  bounds: e.obj.getBounds()
                })

                /*this.$nextTick(() => {
                  this.mouseTool.rectangle(this.rectangleStyle)
                })*/
              }
                // 1.x：e.obj.CLASS_NAME==='AMap.Polygon'
              // 2.x：e.obj.className==='Overlay.Polygon'
              else if (this.active === 'polygon') {
                this.active = 'marker'
                e.obj.setOptions({
                  ...this.polygonStyle,
                  fillColor: '#00D3FC',
                })
                this.overlay.polygonInstance.push(e.obj)
                this.editPolygon({ editable: true })
              }
              this.mouseTool.close()
            })
          }

          //this.map.addControl(new AMap.ControlBar())

          await this.locate()

          this.$emit('load', AMap)
        })
        .catch(e => {
          this.$emit('update:show', false)
          this.$emit('error', e)
          console.error(e)
          error(`高德地图初始化失败：${JSON.stringify(e)}`)
        })
        .finally(e => {
        })
      } else {
        // 正常退出
        if (this.map) {
          //this.customClass = 'animate__animated animate__zoomOut'
          window.__CoordPicker__deleteMarker = undefined
          this.searchResult = []
          this.keyword = ''
          this.map.destroy()
          // 如果乾坤的子系统共享一个window对象 会导致报错——'禁止多种API加载方式混用'
          AMapLoader.reset()
          this.clear()
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
          //this.text.setText('单击绘制点位')
          //this.text.on('click', this.onMapClick)
          this.map.on('click', this.onMapClick)
          //this.overlay.rectangleInstance?.on('click', this.onMapClick)
        },
        'rectangle': () => {
          //this.text.setText('按住左键并拖动绘制矩形')
          //this.text.off('click', this.onMapClick)
          this.map.off('click', this.onMapClick)
          //this.overlay.rectangleInstance?.off('click', this.onMapClick)
          this.mouseTool.rectangle(this.rectangleStyle)
        },
        'polygon': () => {
          //this.text.setText('单击确定多边形起点，双击结束绘制')
          //this.text.off('click', this.onMapClick)
          this.map.off('click', this.onMapClick)
          //this.overlay.rectangleInstance?.off('click', this.onMapClick)
          this.drawPolygon({ editable: true })
        },
      })[newVal]()
    },
    baseCity (n) {
      if (this.show) {
        this.initPlugins()
        if (this.baseCityInitialized) {
          this.map.setCity(n)
          this.drawDistrict(n)
        } else {
          if (n && isNaN(n)) {
            this.$refs.regionKiSelect.$refs.elSelect.selectedLabel = n
          }
          this.baseCityInitialized = true
        }
      }
    },
  },
  methods: {
    /*convertLngLat () {
      new AMap.convertFrom(gps, 'gps', function (status, result) {
        if (result.info === 'ok') {
          let lnglats = result.locations // Array.<LngLat>
        }
      })
    },*/
    cancel () {
      confirm(`不保存并退出`).then(() => {
        this.$emit('update:show', false)
        this.$emit('cancel')
      })
    },
    changeCurImage (src) {
      this.imagePicker.data = this.imagePicker.data === src ? '' : src
    },
    setCurImage () {
      this.imagePicker.show = true
    },
    help () {
      Swal.confirm({
        titleText: '使用帮助',
        html: `
<ul style="text-align:left">
  ${this.MarkerStatus === 'editable' ? `
  <li>点位</li>
    <ul style="margin-bottom:1rem">
      <li>添加：选中点位工具 → 点击地图；搜索位置 → 点击搜索结果</li>
      <li>删除：右键点位 → 点击[删除]；点位列表 → 点击右上角[×]</li>
      <li>重置：点位工具下拉菜单 → 重置点位</li>
      <li>清除：点位工具下拉菜单 → 清除点位</li>
    </ul>` : ''}
  ${this.RectangleStatus === 'editable' ? `
  <li>矩形</li>
    <ul style="margin-bottom:1rem">
      <li>添加：选中矩形工具 → 长按左键并拖动，松开完成绘制</li>
      <li>选择贴图：矩形工具下拉菜单 → 选择贴图</li>
      <li>调整形状：拖动矩形角上的圆点处</li>
      <li>删除：右键矩形 → 点击[删除]</li>
      <li>重置：矩形工具下拉菜单 → 重置矩形</li>
      <li>清除：矩形工具下拉菜单 → 清除矩形</li>
    </ul>` : ''}
  ${this.PolygonStatus === 'editable' ? `
  <li>多边形</li>
    <ul style="margin-bottom:1rem">
      <li>添加：选中多边形工具 → 单击地图确定起点，双击结束绘制</li>
      <li>调整形状：拖动多边形角上的圆点处</li>
      <li>删除：右键多边形 → 点击[删除]</li>
      <li>重置：多边形工具下拉菜单 → 重置多边形</li>
      <li>清除：多边形工具下拉菜单 → 清除多边形</li>
    </ul>` : ''}
</ul>
                    `,
        width: 700,
        confirmButtonText: `ok`,
        cancelButtonText: `不再提示`,
        showCancelButton: false,
      })
    },
    setCenter (args) {
      if (isEmpty(this.MapOptions.zoom)) {
        this.map.setCenter(args)
      } else {
        this.map.setZoomAndCenter(this.MapOptions.zoom, args)
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
    /*setTextPosition (e) {
      this.throttle('setTextPosition', e => {
        this.text.setPosition([e.lnglat.lng, e.lnglat.lat])
      }, e, 30)
    },*/
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
      if (this.PolygonStatus === 'editable') {
        this.plugins.DistrictSearch = new AMap.DistrictSearch({
          subdistrict: 0,   //获取边界不需要返回下级行政区
          extensions: 'all',  //返回行政区边界坐标组等具体信息
          level: 'district'  //行政级别
        })
      }
    },
    getInitData (arr) {
      let result = {
        overlay: {}
      }
      const base = {
        map: null,
        baseCity: '',
        baseCityInitialized: false,
        MapOptions: {},
        imagePicker: {
          show: false,
          data: '',
          retrieve: () => {
            this.imagePicker.data = this.curImage
          },
          submit: () => {
            this.curImage = this.imagePicker.data
            this.active = 'rectangle'
            if (!this.curImage) {
              return confirm({
                title: `您没有选取任何贴图，绘制的矩形将是空心的`,
                customClass: {
                  popup: 'coord-picker-confirm',
                }
              })
            }
          }
        },
        curImage: ''
      }
      const overlay = {
        marker: {
          markerInstance: [],
        },
        rectangle: {
          imageLayerInstance: [],
          rectangleInstance: [],
          rectangleEditor: [],
          rectangle: [],
        },
        polygon: {
          polygonInstance: [],
          polygonEditor: [],
          polygon: [],
        }
      }
      if (!arr) {
        result = {
          ...base,
        }
      }
      for (let k in overlay) {
        if (!arr || arr.includes(k)) {
          result.overlay = {
            ...result.overlay,
            ...overlay[k]
          }
        }
      }

      return cloneDeep(result)
    },
    reset (arr) {
      this.clear(arr)
      this.initOverlays(arr)
    },
    isClearable (overlays = ['marker', 'rectangle', 'polygon']) {
      for (let v of overlays) {
        switch (v) {
          case 'marker': {
            if (this.MarkerMinCount > 0 && this.overlay.markerInstance.length > 0) {
              warning(`至少绘制${this.MarkerMinCount}个点位`)
              return false
            }
            break
          }
          case 'rectangle': {
            if (this.RectangleMinCount > 0 && this.overlay.rectangleInstance.length > 0) {
              warning(`至少绘制${this.RectangleMinCount}个矩形`)
              return false
            }
            break
          }
          case 'polygon':
            if (this.PolygonMinCount > 0 && this.overlay.polygonInstance.length > 0) {
              warning(`至少绘制${this.PolygonMinCount}个多边形`)
              return false
            }
        }
      }
      return true
    },
    clear (arr) {
      if (Array.isArray(arr)) {
        if (arr.includes('marker')) {
          if (!this.isClearable(arr)) {
            return
          }

          this.overlay.markerInstance.map(v => {
            if (v) {
              this.map.remove(v)
            }
          })
          this.overlay.markerInstance.length = 0
          this.plugins.MarkerList?.clearData()
        }

        if (arr.includes('rectangle')) {
          for (let i = 0; i < this.overlay.rectangle.length; i++) {
            this.overlay.imageLayerInstance[i]?.setMap(null)
            this.overlay.rectangleInstance[i].setMap(null)
            this.overlay.rectangleEditor[i]?.close() // 只读模式 rectangleEditor 为空
          }
          this.overlay.rectangle.length = 0
        }

        if (arr.includes('polygon')) {
          if (!this.isClearable(arr)) {
            return
          }

          for (let i = 0; i < this.overlay.polygonInstance.length; i++) {
            this.overlay.polygonInstance[i].setMap(null)
            this.overlay.polygonEditor[i]?.close()
          }
        }

        Object.assign(this.$data, {
          overlay: {
            ...this.overlay,
            ...this.getInitData(arr).overlay
          }
        })
      } else {
        /*if (!this.isClearable()) {
          return
        }*/

        this.map.clearMap()
        Object.assign(this.$data, this.getInitData(arr))
      }
    },
    getAddress ([lng, lat]) {
      return new Promise((resolve, reject) => {
        if (this.plugins.Geocoder) {
          this.useAMapAPI('Geocoder.getAddress', [lng, lat])
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
      const [{ address, name }] = await waitFor(this.getAddress([e.lnglat.lng, e.lnglat.lat]))
      this.drawMarker({
        longitude,
        latitude,
        address,
        name
      })
    },
    fetchSuggestions (queryString, cb) {
      return new Promise((resolve, reject) => {
        this.useAMapAPI('AutoComplete.search', this.keyword)
        .then(result => {
          resolve(result.tips || [])
        })
        .catch((result, status) => {
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
        const { longitude, latitude, address } = this.overlay.markerInstance[0] || {}
        this.$emit('update:lng', this.roundOff(longitude))
        this.$emit('update:lat', this.roundOff(latitude))
        this.$emit('update:address', address)
      }
      this.$emit('update:marker', cloneDeep(this.overlay.markerInstance).map(v => {
        v.lng = this.roundOff(v.longitude)
        v.lat = this.roundOff(v.latitude)
        delete v.longitude
        delete v.latitude
        return v
      }))
      this.$emit('update:mapOptions', this.MapOptions)
      if (this.RectangleStatus === 'editable') {
        //this.address || ((isEmpty(this.lng) || isEmpty(this.lat)) ? this.baseCity : '')
        this.$emit('update:rectangle', this.overlay.rectangle)
      }
      if (this.PolygonStatus === 'editable') {
        this.syncPolygon()
        this.$emit('update:polygon', this.overlay.polygon)
      }
      this.$emit('update:show', false)
      this.$emit('confirm')
    },
    drawMarker (markerOptions, isInit = false) {
      if (this.MarkerMaxCount > 1 && this.overlay.markerInstance.length >= this.MarkerMaxCount && !isInit) {
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
            innerHTML: String.fromCharCode('A'.charCodeAt(0) + this.overlay.markerInstance.length),
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
          this.overlay.markerInstance.push({
            ...markerOptions,
            //address: isInit ? this.address || await this.getAddress([lng, lat]),
          })
        } else {
          this.overlay.markerInstance[0] = markerOptions
        }

        this.drawMarkerList(this.overlay.markerInstance)
      }
    },
    drawMarkerList (marker) {
      this.plugins.MarkerList?.clearData()

      if (isEmpty(marker)) {
        return
      }

      const { MarkerList, SimpleMarker, SimpleInfoWindow } = window.AMapUI
      // 即jQuery/Zepto
      const $ = MarkerList.utils.$

      const defaultIconStyle = 'red', //默认的图标样式
        hoverIconStyle = 'blue', //鼠标hover时的样式
        selectedIconStyle = 'darkblue' //选中时的图标样式

      window.__CoordPicker__deleteMarker = index => {
        this.overlay.markerInstance.splice(index, 1)
        this.drawMarkerList(this.overlay.markerInstance)
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

          const contextMenu = new AMap.ContextMenu()
          contextMenu.addItem('删除', e => {
            if (this.overlay.markerInstance.length <= this.MarkerMinCount) {
              warning(`至少绘制${this.MarkerMinCount}个点位`)
            } else {
              this.overlay.markerInstance.splice(context.index, 1)
              this.drawMarkerList(this.overlay.markerInstance)
            }
          }, 0)
          simpleMarker.on('rightclick', e => {
            contextMenu.open(this.map, e.lnglat)
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

      //const that = this
      this.plugins.MarkerList.on('listElementMouseenter', function (event, record) {
        if (record && record.marker) {

          //that.text.setText('右键删除')

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

          //that.text.setText('右键删除')

          if (!this.isSelectedDataId(record.id)) {
            //设置为hover样式
            record.marker.setIconStyle(hoverIconStyle)
            //this.closeInfoWindow();
          }
        }
      })

      this.plugins.MarkerList.on('listElementMouseleave markerMouseout', function (event, record) {

        //that.text.setText('单击绘制点位')

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
    drawDistrict (districtName) {
      if (districtName && this.PolygonStatus === 'editable') {
        this.useAMapAPI('DistrictSearch.search', districtName)
        .then(result => {
          const bounds = result.districtList?.[0]?.boundaries
          if (bounds?.length) {
            confirm(`是否绘制${districtName}轮廓？`)
            .then(() => {
              this.drawPolygon({
                polygon: Array.from(bounds, v => ({ path: v })),
                editable: false
              })
            })
          }
        })
        .catch((result, status) => {
        })
      }
    },
    async initOverlays (arr) {
      let centerDesignated = false, hasOverlay = false

      if (!arr || arr.includes('rectangle')) {
        if (this.RectangleImage.length === 1) {
          this.curImage = this.RectangleImage[0]
        }

        if (this.Rectangle?.length > 0) {
          this.Rectangle.map(v => {
            const { image, southwest, northeast } = v || {}
            const { lng: southwestLng, lat: southwestLat } = southwest || {}
            const { lng: northeastLng, lat: northeastLat } = northeast || {}

            if (notEmpty(southwestLng) && notEmpty(southwestLat) && notEmpty(northeastLng) && notEmpty(northeastLat)) {
              this.drawRectangle({
                image,
                bounds: new AMap.Bounds(
                  // 西南角
                  new AMap.LngLat(
                    // 经度 1.x版本不兼容输入东南角
                    (isEmpty(northeastLng) || isEmpty(southwestLng)) ? '' :
                      Math.min(northeastLng, southwestLng),
                    // 纬度
                    southwestLat
                  ),
                  // 东北角
                  new AMap.LngLat(
                    // 经度 1.x版本不兼容输入西北角
                    (isEmpty(northeastLng) || isEmpty(southwestLng)) ? '' :
                      Math.max(northeastLng, southwestLng),
                    // 纬度
                    northeastLat
                  ),
                ),
                editable: this.RectangleStatus === 'editable'
              })

              hasOverlay = true
            }
          })
        }
      }

      if (!arr || arr.includes('polygon')) {
        if (this.Polygon?.length > 0) {
          this.drawPolygon({
            polygon: this.Polygon,
            editable: this.PolygonStatus === 'editable'
          })
          hasOverlay = true
        }
      }

      if (!arr || arr.includes('marker')) {
        // 传了点位 绘制点位
        if (this.Marker?.length > 0) {
          cloneDeep(this.Marker).map(v => {
            v.longitude = v.lng
            v.latitude = v.lat
            delete v.lng
            delete v.lat
            this.overlay.markerInstance.push(v)
          })
        }
        // 只传了中心点 将中心点当作一个点位
        else if (notEmpty(this.lng) && notEmpty(this.lat)) {
          let address, name
          if (this.address) {
            address = this.address
          } else {
            const [result] = await waitFor(this.getAddress([this.lng, this.lat]))
            address = result.address
            name = result.name
          }

          this.overlay.markerInstance = [{
            longitude: this.lng,
            latitude: this.lat,
            address,
            name,
          }]

          centerDesignated = true
        }
        this.drawMarkerList(this.overlay.markerInstance)
        // 如果点位只有一个 将其视为中心点
        if (this.overlay.markerInstance.length === 1) {
          centerDesignated = true
        } else if (this.overlay.markerInstance.length > 1) {
          hasOverlay = true
        }
      }

      return {
        centerDesignated,
        hasOverlay,
      }
    },
    watchZoom () {
      this.map.on('zoomchange', e => {
        this.MapOptions.zoom = this.map.getZoom()
      })
    },
    async locate (selectedLocation) {
      if (this.show) {
        // 选中搜索项
        if (selectedLocation) {
          this.drawDistrict(selectedLocation.name)
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
          this.baseCity = (await waitFor(this.getBaseCity()))[0]
          this.initPlugins()

          /**
           * 绘制覆盖物
           */
          const [result] = await waitFor(this.initOverlays())
          let centerDesignated = result.centerDesignated,
            hasOverlay = result.hasOverlay

          /**
           * 中心点定位
           */
          // 如果没有传覆盖物且没有传zoom 给zoom赋默认值
          if (centerDesignated && isEmpty(this.MapOptions.zoom)) {
            this.MapOptions.zoom = 12
          }
          // 传了中心点 定位至该中心点
          if (notEmpty(this.lng) && notEmpty(this.lat)) {
            this.setCenter([this.lng, this.lat])
            centerDesignated = true
          }
          // 点位数量为1 定位至该点位
          else if (this.overlay.markerInstance.length === 1 && notEmpty(this.overlay.markerInstance[0].longitude) && notEmpty(this.overlay.markerInstance[0].latitude)) {
            const { longitude, latitude } = this.overlay.markerInstance[0]
            this.setCenter([longitude, latitude])
            centerDesignated = true
          }
          // 定位至address
          else if (this.address) {
            const [result] = await waitFor(this.useAMapAPI('Geocoder.getLocation', this.address))
            const { lng, lat } = result?.geocodes[0]?.location || {}
            if (notEmpty(lng) && notEmpty(lat)) {
              this.setCenter([lng, lat])
              centerDesignated = true
            }
          }
          if (!centerDesignated) {
            // 存在覆盖物 将视图适配覆盖物
            if (hasOverlay) {
              this.map.setFitView()
            }
            // 定位至baseCity
            else if (this.baseCity) {
              this.map.setCity(this.baseCity)
            }
            // setCity和setZoom同步调用时后者无效
            setTimeout(() => {
              this.map.setZoom(this.MapOptions.zoom)
              // setZoom和setCity会立即触发zoomchange
              setTimeout(() => {
                this.watchZoom()
              }, 500)
            }, 500)
          } else {
            this.watchZoom()
          }
        }
      }
    },
    getBaseCity () {
      // 直辖市：['110100', '120100', '310100', '500100']
      let result = getFinalProp([this.city, globalProps.city, ''], {
        name: 'city',
        type: 'string'
      })
      // 兼容非6位的行政区编码
      if (!isNaN(result)) {
        if (result.length < 6) {
          result = result.padEnd(6, '0')
        } else if (result.length > 6) {
          result = result.substring(0, 6)
        }
      }
      return new Promise((resolve, reject) => {
        if (result) {
          resolve(result)
        } else {
          this.plugins.CitySearch = new AMap.CitySearch()
          this.useAMapAPI('CitySearch.getLocalCity')
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

        this.useAMapAPI('PlaceSearch.search', this.keyword)
        .then(result => {
          this.searchResult = result.poiList?.pois || []
        })
        .catch(result => {
          if (result.info === 'TIP_CITIES') {
            this.$message.info('未找到相关结果，尝试输入更精确的关键字，或切换城市哦')
          }
        })
        .finally(() => {
          this.searching = false
        })
      }, null, 500)
    },
    useAMapAPI () {
      this.loading = true
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
            this.$emit('error', status, result)
          }
          this.loading = false
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

::v-deep .coord-picker > .el-dialog.is-fullscreen {
  overflow: hidden;
}

::v-deep .coord-picker > .el-dialog__header {
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

::v-deep .coord-picker > .el-dialog__body {
  height: 100%;
  padding: 0;

  .region-selector {
    display: inline-block;
    margin-left: 15px;
    width: 105px;

    input {
      border-radius: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      border-color: rgba(64, 158, 255, 0.2) !important;

      &:hover, &:focus {
        box-shadow: rgba(0, 51, 113, 0.1) 0 0 20px 5px;
      }
    }
  }

  .drawer {
    box-sizing: border-box;
    //box-shadow: 50px 0 100px rgba(0, 0, 0, 0.5);
    width: 272px;
    height: 100%;
    overflow-y: auto;
    padding: 78px 16px 0 16px;
    position: absolute;
    z-index: 999;
    //background-image: linear-gradient(to left, #e6e9f0 0%, #eef1f5 100%);
    backdrop-filter: blur(2px);
    background-color: #f7f7f7ab;

    & > .item {
      padding: 10px;
      cursor: pointer;

      & > :first-child {
        font-weight: bold;
      }

      & > :nth-child(2) {
        margin-top: 5px;
      }

      &:hover {
        background-color: rgba(173, 216, 230, 0.3);
        border-radius: 8px;
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
  bottom: 115px;
}

::v-deep .imagePicker .el-dialog__body {
  padding: 25px;

  .footer {
    padding: 10px 0 0 0;
  }
}
</style>

<style lang="scss">
.map-container {
  &.el-loading-mask {
    left: 50%;
    top: 50%;
    bottom: unset;
    right: unset;
    transform: translate(-50%, -50%);
  }
}

.coord-picker-confirm {
  width: fit-content;
}
</style>
