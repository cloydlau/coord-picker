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
      if (this.BoundaryMaxCount > 0 && this.polygonObj.length >= this.BoundaryMaxCount) {
        warning(`最多绘制${this.BoundaryMaxCount}个区域`)
      } else {
        this.active = 'polygon'
      }
    },
    syncPolygon () {
      // 同步可能经过删除、节点变化的多边形
      this.curBoundary = []
      this.polygonObj.map(v => {
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
            this.polygonObj.push(new AMap.Polygon({
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
      const i = this.polygonObj.length - 1

      const polygonContextMenu = new AMap.ContextMenu()
      polygonContextMenu.addItem('删除', e => {
        if (this.polygonObj.length <= this.BoundaryMinCount) {
          warning(`至少绘制${this.BoundaryMinCount}个区域`)
        } else {
          if (draggable) {
            this.polygonEditor[i].close()
            this.polygonEditor.splice(i, 1)
          }
          this.polygonObj[i].setMap(null)
          this.polygonObj.splice(i, 1)
        }
      }, 0)

      this.polygonObj[i].on('mouseout', e => {
        this.text.setText('单击绘制点位')
      })

      this.polygonObj[i].on('click', this.onMapClick)

      this.polygonObj[i].on('rightclick', e => {
        polygonContextMenu.open(this.map, e.lnglat)
      })

      this.polygonObj[i].on('mousemove', e => {
        this.text.setText((draggable ? '拖拽角调整形状，' : '') + '右键删除')
        this.setTextPosition(e)
      })

      if (draggable) {
        this.polygonEditor.push(AMap.PolygonEditor ?
          new AMap.PolygonEditor(this.map, this.polygonObj[i]) :
          new AMap.PolyEditor(this.map, this.polygonObj[i])
        )
        this.polygonEditor[i].open()
      }
      this.polygonObj[i].setMap(this.map)
    },
  }
}
