import 'kikimore/dist/style.css'
import { Swal } from 'kikimore'
const { error, warning, confirm, } = Swal
import { notEmpty } from 'kayran'

export default {
  data () {
    return {
      polygonStyle: {
        strokeColor: '#00B2D5',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        fillOpacity: 0.5,
        cursor: 'pointer',
        zIndex: 50,
      },
    }
  },
  methods: {
    onPolygonBtnClick () {
      if (this.BoundaryMaxCount > 0 && this.overlay.polygon.length >= this.BoundaryMaxCount) {
        warning(`最多绘制${this.BoundaryMaxCount}个区域`)
      } else {
        this.active = 'polygon'
      }
    },
    syncPolygon () {
      // 同步可能经过删除、节点变化的多边形
      this.curBoundary = []
      this.overlay.polygon.map(v => {
        if (v) {
          // 新创建的polygon getPath()获取的lng和lat默认只保留6位小数 而R和Q是完整的
          this.curBoundary.push({
            path: Array.from(v.getPath(), v => ({ lng: this.roundOff(v.R), lat: this.roundOff(v.Q) }))
          })
        }
      })
    },
    drawPolygon (boundary, draggable) {
      if (boundary) {
        for (let i = 0; i < boundary.length; i++) {
          const path = []
          for (let v of boundary[i]?.path || []) {
            if (notEmpty(v.lng) && notEmpty(v.lat)) {
              path.push([v.lng, v.lat])
            }
          }
          if (path.length > 0) {
            this.overlay.polygon.push(new AMap.Polygon({
              ...this.polygonStyle,
              fillColor: '#00D3FC',
              map: this.map,
              path
            }))
            this.editPolygon(draggable)
          }
        }
      } else {
        this.mouseTool.polygon({
          ...this.polygonStyle,
          fillColor: 'transparent'
        })
      }
    },
    editPolygon (draggable = true) {
      const i = this.overlay.polygon.length - 1

      const polygonContextMenu = new AMap.ContextMenu()
      polygonContextMenu.addItem('删除', e => {
        if (this.overlay.polygon.length <= this.BoundaryMinCount) {
          warning(`至少绘制${this.BoundaryMinCount}个区域`)
        } else {
          if (draggable) {
            this.overlay.polygonEditor[i].close()
            this.overlay.polygonEditor.splice(i, 1)
          }
          this.overlay.polygon[i].setMap(null)
          this.overlay.polygon.splice(i, 1)
        }
      }, 0)

      this.overlay.polygon[i].on('mouseout', e => {
        this.text.setText('单击绘制点位')
      })

      this.overlay.polygon[i].on('click', this.onMapClick)

      this.overlay.polygon[i].on('rightclick', e => {
        polygonContextMenu.open(this.map, e.lnglat)
      })

      this.overlay.polygon[i].on('mousemove', e => {
        this.text.setText((draggable ? '拖拽角调整形状，' : '') + '右键删除')
        this.setTextPosition(e)
      })

      if (draggable) {
        this.overlay.polygonEditor.push(AMap.PolygonEditor ?
          new AMap.PolygonEditor(this.map, this.overlay.polygon[i]) :
          new AMap.PolyEditor(this.map, this.overlay.polygon[i])
        )
        this.overlay.polygonEditor[i].open()
      }
      this.overlay.polygon[i].setMap(this.map)
    },
  }
}
