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
      if (this.RectangleStatus === 'editable' && this.overlay.rectangleInstance.length >= this.RectangleMaxCount) {
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
    syncRectangleBounds ({ index, url, bounds }) {
      // 兼容1.x
      this.overlay.rectangle[index] = {
        ...this.overlay.rectangle[index],
        ...url && { url },
        northeast: {
          lng: bounds.northEast ? bounds.northEast.lng : bounds.northeast.lng,
          lat: bounds.northEast ? bounds.northEast.lat : bounds.northeast.lat
        },
        southwest: {
          lng: bounds.southWest ? bounds.southWest.lng : bounds.southwest.lng,
          lat: bounds.southWest ? bounds.southWest.lat : bounds.southwest.lat
        }
      }
      // 矩形可能不包含图层 所以需要判空
      this.overlay.imageLayerInstance[index]?.setBounds(bounds)
    },
    drawRectangle ({ url, bounds, editable = true }) {
      const rectangleInstance = new AMap.Rectangle({
        ...this.rectangleStyle,
        bounds,
      })
      this.overlay.rectangleInstance.push(rectangleInstance)
      rectangleInstance.on('click', this.onMapClick)
      rectangleInstance.setMap(this.map)
      let imageLayerInstance = null
      if (url) {
        imageLayerInstance = new AMap.ImageLayer({
          url,
          bounds,
        })

        const contextMenu = new AMap.ContextMenu()
        contextMenu.addItem('删除', e => {
          if (this.overlay.rectangleEditor.length <= this.RectangleMinCount) {
            warning(`至少绘制${this.RectangleMinCount}个矩形`)
          } else {
            this.overlay.rectangleEditor[index].close()
            this.overlay.rectangleEditor.splice(index, 1)
          }
        }, 0)
        imageLayerInstance.on('rightclick', e => {
          contextMenu.open(this.map, e.lnglat)
        })

        this.map.add(imageLayerInstance)
      }
      this.overlay.imageLayerInstance.push(imageLayerInstance)
      const index = this.overlay.rectangleInstance.length - 1
      this.syncRectangleBounds({ index, url, bounds })

      if (editable) {
        this.editRectangle({
          index,
          rectangleInstance
        })
      }
    },
    editRectangle ({ index, rectangleInstance }) {
      /*rectangleInstance.on('mousemove', e => {
        this.text.setText('拖拽角调整大小')
        this.setTextPosition(e)
      })
      rectangleInstance.on('mouseout', e => {
        this.text.setText('单击绘制点位')
      })*/

      const rectangleEditor = new AMap.RectangleEditor(this.map, rectangleInstance)

      this.overlay.rectangleEditor.push(rectangleEditor)

      /**
       * 移动选框时 同步图片
       */
      rectangleEditor.on('adjust', e => {
        // 兼容1.x
        this.syncRectangleBounds({
          index,
          bounds: e.bounds || e.Rd
        })
      })
      // 短距离平移触发
      /*this.text.on('mouseup', e => {
        this.syncRectangleBounds(rectangleInstance.getBounds())
      })*/
      // 短距离平移触发
      rectangleInstance.on('mouseup', e => {
        this.syncRectangleBounds({
          index,
          bounds: rectangleInstance.getBounds()
        })
      })
      // 长距离平移触发
      this.map.on('mouseup', e => {
        if (rectangleInstance) {
          this.syncRectangleBounds({
            index,
            bound: rectangleInstance.getBounds()
          })
        }
      })

      rectangleEditor.open()
    },
  }
}
