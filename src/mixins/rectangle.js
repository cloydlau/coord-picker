import 'kikimore/dist/style.css'
import { Swal } from 'kikimore'
const { warning } = Swal

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
    onRectangleBtnClick () {
      if (this.RectangleMaxCount > 0 && this.overlay.rectangleInstance.length >= this.RectangleMaxCount) {
        warning(`最多绘制${this.PolygonMaxCount}个矩形`)
      } else if (!this.curImage.data && this.Image.length > 1) {
        this.curImage.submit = () => {
          this.active = 'rectangle'
        }
        this.curImage.show = true
      } else {
        this.active = 'rectangle'
      }
    },
    syncImgBounds (bounds) {
      //兼容1.x
      this.overlay.imgNorthEastLng = bounds.northEast ? bounds.northEast.lng : bounds.northeast.lng
      this.overlay.imgNorthEastLat = bounds.northEast ? bounds.northEast.lat : bounds.northeast.lat
      this.overlay.imgSouthWestLng = bounds.southWest ? bounds.southWest.lng : bounds.southwest.lng
      this.overlay.imgSouthWestLat = bounds.southWest ? bounds.southWest.lat : bounds.southwest.lat
      this.overlay.imageLayerInstance.setBounds(bounds)
    },
    drawImage ({ url, bounds, editable = true }) {
      this.overlay.rectangleInstance = new AMap.Rectangle({
        ...this.rectangleStyle,
        bounds,
      })
      this.overlay.rectangleInstance.setMap(this.map)
      if (!this.overlay.imageLayerInstance) {
        this.overlay.imageLayerInstance = new AMap.ImageLayer({
          url,
          bounds,
        })
        this.map.add(this.overlay.imageLayerInstance)
      }
      this.overlay.rectangleInstance.on('click', this.onMapClick)
      this.syncImgBounds(bounds)
      if (editable) {
        this.editImage()
      }
    },
    editImage () {
      /*this.overlay.rectangleInstance.on('mousemove', e => {
        this.text.setText('拖拽角调整大小')
        this.setTextPosition(e)
      })
      this.overlay.rectangleInstance.on('mouseout', e => {
        this.text.setText('单击绘制点位')
      })*/

      this.overlay.rectangleEditor = new AMap.RectangleEditor(this.map, this.overlay.rectangleInstance)

      /**
       * 移动选框时 同步图片
       */
      this.overlay.rectangleEditor.on('adjust', e => {
        //兼容1.x
        this.syncImgBounds(e.bounds || e.Rd)
      })
      //短距离平移触发
      /*this.text.on('mouseup', e => {
        this.syncImgBounds(this.overlay.rectangleInstance.getBounds())
      })*/
      //短距离平移触发
      this.overlay.rectangleInstance.on('mouseup', e => {
        this.syncImgBounds(this.overlay.rectangleInstance.getBounds())
      })
      //长距离平移触发
      this.map.on('mouseup', e => {
        if (this.overlay.rectangleInstance) {
          this.syncImgBounds(this.overlay.rectangleInstance.getBounds())
        }
      })

      this.overlay.rectangleEditor.open()
    },
  }
}
