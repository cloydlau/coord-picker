import 'cozyalert/dist/style.css'
import { warning } from 'cozyalert'
import { notEmpty } from 'kayran'
import { conclude } from 'vue-global-config'
import { globalProps } from '../index'

export default {
  props: {
    polyline: {},
    polylineCount: {},
  },
  computed: {
    Polyline() {
      return conclude([this.polyline, globalProps.polyline], {
        name: 'polyline',
        type: ['array', 'null']
      })
    },
    PolylineStatus() {
      if (this.PolylineMaxCount > 0) {
        return 'editable'
      } else if (this.Polyline?.length > 0) {
        return 'readonly'
      }
    },
    PolylineCount() {
      return conclude([this.polylineCount, globalProps.polylineCount, 0], {
        name: 'polylineCount',
        type: ['number', 'array']
      })
    },
    PolylineMaxCount() {
      return Array.isArray(this.PolylineCount) ? this.PolylineCount[1] : this.PolylineCount
    },
    PolylineMinCount() {
      return Array.isArray(this.PolylineCount) ? this.PolylineCount[0] : undefined
    },
  },
  data() {
    return {
      polylineStyle: {
        strokeColor: '#00B2D5',
        strokeWeight: 3,
        zIndex: 51,
      },
    }
  },
  methods: {
    onPolylineBtnClick() {
      // 只读模式点击无效果
      if (this.PolylineMaxCount > 0) {
        if (this.overlay.polylineInstance.length >= this.PolylineMaxCount) {
          warning(`最多绘制${this.PolylineMaxCount}条折线`)
        } else {
          this.active = 'polyline'
        }
      }
    },
    syncPolyline() {
      // 同步可能经过删除、节点变化的折线
      this.overlay.polyline = []
      this.overlay.polylineInstance.map(v => {
        if (v) {
          // 新创建的 polyline，getPath() 获取的 lng 和 lat 默认只保留6位小数 而 R 和 Q 是完整的
          this.overlay.polyline.push({
            path: Array.from(v.getPath(), v => ({ lng: this.roundOff(v.R), lat: this.roundOff(v.Q) }))
          })
        }
      })
    },
    drawPolyline({ polyline, editable }) {
      if (polyline) {
        for (let i = 0; i < polyline.length; i++) {
          const path = []
          for (let v of polyline[i]?.path || []) {
            if (notEmpty(v.lng) && notEmpty(v.lat)) {
              path.push([v.lng, v.lat])
            }
          }
          if (path.length > 0) {
            this.overlay.polylineInstance.push(new AMap.Polyline({
              ...this.polylineStyle,
              path
            }))
            this.editPolyline({ editable })
          }
        }
      } else {
        this.mouseTool.polyline({
          ...this.polylineStyle,
        })
      }
    },
    // 用途：
    // 1. 初始化时开启对覆盖物的编辑
    // 2. 
    editPolyline({ editable }) {
      const i = this.overlay.polylineInstance.length - 1

      if (this.PolylineStatus === 'editable') {
        const polylineContextMenu = new AMap.ContextMenu()
        polylineContextMenu.addItem('删除', e => {
          if (this.overlay.polylineInstance.length <= this.PolylineMinCount) {
            warning(`至少绘制${this.PolylineMinCount}条折线`)
          } else {
            if (editable) {
              this.overlay.polylineEditor[i].close()
              this.overlay.polylineEditor.splice(i, 1)
            }
            this.overlay.polylineInstance[i].setMap(null)
            this.overlay.polylineInstance.splice(i, 1)
          }
        }, 0)
        this.overlay.polylineInstance[i].on('rightclick', e => {
          polylineContextMenu.open(this.map, e.lnglat)
        })
      }

      this.overlay.polylineInstance[i].on('click', this.onMapClick)

      let polylineEditor = null
      if (editable) {
        polylineEditor = AMap.PolylineEditor ?
          new AMap.PolylineEditor(this.map, this.overlay.polylineInstance[i]) :
          new AMap.PolyEditor(this.map, this.overlay.polylineInstance[i])
        polylineEditor.open()
      }
      this.overlay.polylineEditor.push(polylineEditor)
      this.overlay.polylineInstance[i].setMap(this.map)
    },
  }
}
