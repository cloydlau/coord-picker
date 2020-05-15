import Vue from 'vue'
export default {
  data () {
    return {
      rectangleStyle: {
        strokeColor: '#00B2D5',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        fillColor: 'transparent',
        fillOpacity: 0,
        cursor: 'pointer',
        zIndex: 50,
      },
      imageLayer: null,
      rectangle: null,
      rectangleEditor: null,
    }
  },
  computed: {
    curImg () {
      return Vue.observable({
        imgNorthEastLng: this.$isEmpty(this.imgNorthEastLng) ? '' : Number(this.imgNorthEastLng),
        imgNorthEastLat: this.$isEmpty(this.imgNorthEastLat) ? '' : Number(this.imgNorthEastLat),
        imgSouthWestLng: this.$isEmpty(this.imgSouthWestLng) ? '' : Number(this.imgSouthWestLng),
        imgSouthWestLat: this.$isEmpty(this.imgSouthWestLat) ? '' : Number(this.imgSouthWestLat),
      })
    },
  },
  methods: {
    syncImgBounds (bounds) {
      this.curImg.imgNorthEastLng = bounds.northEast.lng
      this.curImg.imgNorthEastLat = bounds.northEast.lat
      this.curImg.imgSouthWestLng = bounds.southWest.lng
      this.curImg.imgSouthWestLat = bounds.southWest.lat
      this.imageLayer.setBounds(bounds)
    },
    drawImg (bounds) {
      this.rectangle = new AMap.Rectangle({
        ...this.rectangleStyle,
        bounds,
      })
      this.rectangle.setMap(this.map)
      this.editImg(bounds)
    },
    editImg (bounds) {
      if (this.imageLayer) {
        this.syncImgBounds(bounds)
      } else {
        this.imageLayer = new AMap.ImageLayer({
          url: this.img,
          bounds,
        })
        this.map.add(this.imageLayer)
      }

      this.rectangleEditor = new AMap.RectangleEditor(this.map, this.rectangle)

      /**
       * 移动选框时 同步图片
       */
      this.rectangleEditor.on('adjust', e => {
        this.syncImgBounds(e.bounds)
      })
      //短距离平移触发
      this.rectangle.on('mouseup', e => {
        this.syncImgBounds(this.rectangle.getBounds())
      })
      //长距离平移触发
      this.map.on('mouseup', e => {
        this.syncImgBounds(this.rectangle.getBounds())
      })

      this.rectangleEditor.open()
    },
  }
}
