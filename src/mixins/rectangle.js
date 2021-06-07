import Vue from 'vue'
import { isEmpty } from 'kayran'

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
      //兼容1.x
      this.overlay.imgNorthEastLng = bounds.northEast ? bounds.northEast.lng : bounds.northeast.lng
      this.overlay.imgNorthEastLat = bounds.northEast ? bounds.northEast.lat : bounds.northeast.lat
      this.overlay.imgSouthWestLng = bounds.southWest ? bounds.southWest.lng : bounds.southwest.lng
      this.overlay.imgSouthWestLat = bounds.southWest ? bounds.southWest.lat : bounds.southwest.lat
      this.overlay.imageLayer.setBounds(bounds)
    },
    drawImg (bounds) {
      this.overlay.rectangle = new AMap.Rectangle({
        ...this.rectangleStyle,
        bounds,
      })
      this.overlay.rectangle.setMap(this.map)
      this.editImg(bounds)
    },
    editImg (bounds) {
      if (!this.overlay.imageLayer) {
        this.overlay.imageLayer = new AMap.ImageLayer({
          url: this.img,
          bounds,
        })
        this.map.add(this.overlay.imageLayer)
      }
      this.syncImgBounds(bounds)

      this.overlay.rectangle.on('click', this.onMapClick)

      /*this.overlay.rectangle.on('mousemove', e => {
        this.text.setText('拖拽角调整大小')
        this.setTextPosition(e)
      })
      this.overlay.rectangle.on('mouseout', e => {
        this.text.setText('单击绘制点位')
      })*/

      this.overlay.rectangleEditor = new AMap.RectangleEditor(this.map, this.overlay.rectangle)

      /**
       * 移动选框时 同步图片
       */
      this.overlay.rectangleEditor.on('adjust', e => {
        //兼容1.x
        this.syncImgBounds(e.bounds || e.Rd)
      })
      //短距离平移触发
      /*this.text.on('mouseup', e => {
        this.syncImgBounds(this.overlay.rectangle.getBounds())
      })*/
      //短距离平移触发
      this.overlay.rectangle.on('mouseup', e => {
        this.syncImgBounds(this.overlay.rectangle.getBounds())
      })
      //长距离平移触发
      this.map.on('mouseup', e => {
        if (this.overlay.rectangle) {
          this.syncImgBounds(this.overlay.rectangle.getBounds())
        }
      })

      this.overlay.rectangleEditor.open()
    },
  }
}
