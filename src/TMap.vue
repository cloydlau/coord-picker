<template>
  <el-dialog :visible.sync="show"
             :fullscreen="true"
             :append-to-body="true"
             :show-close="false"
             @close="$emit('update:show', false)"
             :custom-class="customClass"
  >
    <div slot="title" class="title">
      <span v-text="title||'地图选点'" class="title-text"/>
      <span>
        <el-button @click="$emit('update:show', false)" round>关 闭</el-button>
        <el-button type="primary" @click="confirm" round>确 定</el-button>
      </span>
    </div>
    <div style="display:flex;height:100%">
      <div class="drawer" v-loading="searching">
        <el-autocomplete v-model.trim="keyword"
                         :fetch-suggestions="fetchSuggestions"
                         placeholder="搜索"
                         :trigger-on-focus="false"
                         @select="search"
                         @clear="search"
                         clearable
        />
        <div v-for="(v,i) of searchResult" :key="i" class="item" @click="locate(v)">
          <h3>{{v.title}}</h3>
          <div style="margin:1rem;color:grey">{{v.address}}</div>
        </div>
      </div>
      <div class="meny-arrow"/>
      <div ref="map-container" id="map-container"/>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import { apiKey, city } from './config.ts'
import Vue from 'vue'
import { isEmpty, err, Meny } from 'plain-kit'
import _ from 'lodash'

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
    show: Boolean,
    apiKey: String,
    lat: [Number, String],
    lng: [Number, String],
    address: String,
    city: String,
  },
  data () {
    return {
      searching: false,
      keyword: '',
      searchResult: [],
      baseCity: '',
      map: null,
      marker: null,
      zoom: 11,
      meny: null,
      customClass: 'animate__animated animate__zoomIn'
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
        address: this.address || (this.$isEmpty(this.lng) && this.$isEmpty(this.lat) ? this.baseCity : '')
      })
    },
    key () {
      return this.apiKey || apiKey
    },
  },
  watch: {
    show (newVal, oldVal) {
      if (newVal) {
        this.customClass = 'animate__animated animate__zoomIn'
        if (!this.map) {
          if (window.qq) {
            this.$nextTick(__initCoordPicker)
          } else {
            this.loadScript()
          }
        } else {
          this.locate()
        }
        if (!this.meny) {
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
          })
        }
      } else {
        this.customClass = 'animate__animated animate__zoomOut'
      }
    }
  },
  created () {
    window.__initCoordPicker = function () {
      this.map = new qq.maps.Map(this.$refs.map, {
        zoom: this.zoom
      })

      this.locate()

      qq.maps.event.addListener(this.map, 'click', e => {
        this.clearSelection()
        this.curSpot.lng = e.latLng.lng.toFixed(6)
        this.curSpot.lat = e.latLng.lat.toFixed(6)
        this.marker = new qq.maps.Marker({
          position: new qq.maps.LatLng(e.latLng.lat, e.latLng.lng),
          map: this.map
        })
        this.get('https://apis.map.qq.com/ws/geocoder/v1', {
          location: `${this.curSpot.lat},${this.curSpot.lng}`
        }).then(data => {
          this.curSpot.address = (data.result?.address || '') + (data.result?.formatted_addresses?.recommend || '')
        })
      })

      qq.maps.event.addListener(this.map, 'zoom_changed', e => {
        this.zoom = this.map.getZoom()
      })
    }.bind(this)
  },
  methods: {
    get (url, params) {
      return new Promise((resolve, reject) => {
        axios.get(`https://bird.ioliu.cn/v1?url=${url}` + qs.stringify({
          ...params,
          key: this.key
        }, { addQueryPrefix: true })).then(res => {
          if (res.data.status === 0) {
            if (!this.$isEmpty(res.data)) {
              resolve(res.data)
            }
          } else {
            this.$err(res.data.message)
          }
        }).catch(e => {
          reject()
        })
      })
    },
    fetchSuggestions (queryString, cb) {
      this.get('https://apis.map.qq.com/ws/place/v1/suggestion', {
        keyword: this.keyword,
        region: `region=${this.baseCity}`,
      }).then(res => {
        cb(res.data?.map(v => {
          v.value = v.title
          return v
        }))
      })
    },
    confirm () {
      this.$emit('update:lat', this.curSpot.lat)
      this.$emit('update:lng', this.curSpot.lng)
      this.$emit('update:address', this.curSpot.address)
      this.$emit('update:show', false)
    },
    clearSelection () {
      if (this.marker) {
        this.curSpot.lng = ''
        this.curSpot.lat = ''
        this.curSpot.address = ''
        this.marker.setMap(null)
      }
    },
    locate (selectedLocation) {
      //选中搜索项
      if (selectedLocation) {
        this.clearSelection()
        this.meny.close()
        this.curSpot.lat = selectedLocation.location.lat
        this.curSpot.lng = selectedLocation.location.lng
        this.curSpot.address = (selectedLocation.address || '') + (selectedLocation.title || '')
        const position = new qq.maps.LatLng(this.curSpot.lat, this.curSpot.lng)
        this.marker = new qq.maps.Marker({
          position,
          map: this.map
        })
        this.map.panTo(position)
        this.map.zoomTo(18)
      }
      //初始化
      else {
        //直辖市 ['110100000000', '120100000000', '310100000000', '500100000000']
        this.baseCity = this.city || city

        const fn = () => {
          const position = new qq.maps.LatLng(this.curSpot.lat, this.curSpot.lng)
          this.marker = new qq.maps.Marker({
            position,
            map: this.map
          })
          this.map.setCenter(position)
        }

        //指定城市
        if (this.baseCity) {
          if (this.$isEmpty(this.curSpot.lat) && this.$isEmpty(this.curSpot.lng)) {
            this.get('https://apis.map.qq.com/ws/geocoder/v1', {
              address: this.baseCity
            }).then(data => {
              this.curSpot.lat = data.result?.location?.lat
              this.curSpot.lng = data.result?.location?.lng
              fn()
            })
          } else {
            fn()
          }
        }
        //ip定位城市
        else {
          this.get('https://apis.map.qq.com/ws/location/v1/ip').then(data => {
            this.baseCity = data.result?.ad_info?.city
            if (this.$isEmpty(this.curSpot.lat) && this.$isEmpty(this.curSpot.lng)) {
              this.curSpot.lat = data.result?.location?.lat
              this.curSpot.lng = data.result?.location?.lng
              fn()
            } else {
              fn()
            }
          })
        }
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
          this.get('https://apis.map.qq.com/ws/place/v1/search', {
            keyword: this.keyword,
            boundary: `region(${this.baseCity},1)`,
          }).then(res => {
            this.searchResult = res.data || []
          }).finally(e => {
            this.searching = false
          })
        }, 500)
      }
      this.doSearch()
    },
    loadScript () {
      let script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://map.qq.com/api/js?v=2.exp&key=' + this.key + '&callback=__initCoordPicker'
      document.body.appendChild(script)
    }
  }
}
</script>

<style lang="scss" scoped>
#map-container {
  flex: 1;
  height: 100%;
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
  background-color: #ffffff8c !important;

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

    .el-autocomplete {
      width: 100%;
    }

    .el-input input {
      border-color: #003371;
      border-radius: 20px;
    }

    .el-input input::-webkit-input-placeholder {
      color: #003371;
    }

    .el-input {
      margin-bottom: 16px;
    }

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
