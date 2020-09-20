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
        imgNorthEastLng:
          (this.$isEmpty(this.imgNorthEastLng) || this.$isEmpty(this.imgSouthWestLng)) ?
            '' :
            Math.max(this.imgNorthEastLng, this.imgSouthWestLng), //1.x版本不兼容输入西北角
        imgNorthEastLat: this.imgNorthEastLat,
        imgSouthWestLng:
          (this.$isEmpty(this.imgNorthEastLng) || this.$isEmpty(this.imgSouthWestLng)) ?
            '' :
            Math.min(this.imgNorthEastLng, this.imgSouthWestLng), //1.x版本不兼容输入东南角
        imgSouthWestLat: this.imgSouthWestLat,
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
      this.rectangleObj = new AMap.Rectangle({
        ...this.rectangleStyle,
        bounds,
      })
      this.rectangleObj.setMap(this.map)
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

      this.rectangleObj.on('click', this.onMapClick)

      this.rectangleObj.on('mousemove', e => {
        this.text.setText('拖拽角可改变形状')
        this.setTextPosition(e)
      })
      this.rectangleObj.on('mouseout', e => {
        this.text.setText('点击获取坐标')
      })

      this.rectangleEditor = new AMap.RectangleEditor(this.map, this.rectangleObj)

      /**
       * 移动选框时 同步图片
       */
      this.rectangleEditor.on('adjust', e => {
        //兼容1.x
        this.syncImgBounds(e.bounds || e.Rd)
      })
      //短距离平移触发
      this.text.on('mouseup', e => {
        this.syncImgBounds(this.rectangleObj.getBounds())
      })
      //短距离平移触发
      this.rectangleObj.on('mouseup', e => {
        this.syncImgBounds(this.rectangleObj.getBounds())
      })
      //长距离平移触发
      this.map.on('mouseup', e => {
        if (this.rectangleObj) {
          this.syncImgBounds(this.rectangleObj.getBounds())
        }
      })

      this.rectangleEditor.open()
    },
  }
}
