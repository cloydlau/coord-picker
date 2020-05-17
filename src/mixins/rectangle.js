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
    }
  },
  computed: {
    curImg () {
      return Vue.observable({
        imgNorthEastLng: this.$isEmpty(this.imgNorthEastLng) ? '' : this.imgNorthEastLng,
        imgNorthEastLat: this.$isEmpty(this.imgNorthEastLat) ? '' : this.imgNorthEastLat,
        imgSouthWestLng: this.$isEmpty(this.imgSouthWestLng) ? '' : this.imgSouthWestLng,
        imgSouthWestLat: this.$isEmpty(this.imgSouthWestLat) ? '' : this.imgSouthWestLat,
      })
    }
  },
  methods: {
    syncImgBounds (bounds) {
      //兼容1.x
      this.curImg.imgNorthEastLng = bounds.northEast ? bounds.northEast.lng : bounds.northeast.lng
      this.curImg.imgNorthEastLat = bounds.northEast ? bounds.northEast.lat : bounds.northeast.lat
      this.curImg.imgSouthWestLng = bounds.southWest ? bounds.southWest.lng : bounds.southwest.lng
      this.curImg.imgSouthWestLat = bounds.southWest ? bounds.southWest.lat : bounds.southwest.lat
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
      if (!this.imageLayer) {
        this.imageLayer = new AMap.ImageLayer({
          url: this.img,
          bounds,
        })
        this.map.add(this.imageLayer)
      }
      this.syncImgBounds(bounds)

      this.rectangleEditor = new AMap.RectangleEditor(this.map, this.rectangle)

      /**
       * 移动选框时 同步图片
       */
      this.rectangleEditor.on('adjust', e => {
        //兼容1.x
        this.syncImgBounds(e.bounds || e.Rd)
      })
      //短距离平移触发
      this.rectangle.on('mouseup', e => {
        this.syncImgBounds(this.rectangle.getBounds())
      })
      //长距离平移触发
      this.map.on('mouseup', e => {
        if (this.rectangle) {
          this.syncImgBounds(this.rectangle.getBounds())
        }
      })

      this.rectangleEditor.open()
    },
  }
}
