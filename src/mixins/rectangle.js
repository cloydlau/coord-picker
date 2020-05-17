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
        this.syncImgBounds(e.bounds)
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
