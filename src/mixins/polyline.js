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
      labelMarkerStyle: {
        "direction": "top",
        "offset": [0, 0],
        "style": {
          "fontSize": 12,
          "fontWeight": "normal",
          "fillColor": "black",
          "backgroundColor": "#fff",
          "padding": [2, 5, 2, 5],
        }
      }
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
    // 给折线的交点添加文本标记
    addLabelsForPolylineNodes(i) {
      const path = this.overlay.polylineInstance[i].w.path
      path.map(({ R, Q }, index) => {
        let content = String(index + 1)
        if (index === 0) {
          content = '起点'
        } else if (index === path.length - 1) {
          content = '终点'
        }

        this.plugins.LabelsLayer.add(new AMap.LabelMarker({
          position: [R, Q],
          text: {
            ...this.labelMarkerStyle,
            content,
          },
          extData: {
            index
          }
        }))
      })

      this.map.add(this.plugins.LabelsLayer)
    },
    // 执行时机：绘制完成时
    editPolyline({ editable }) {
      const i = this.overlay.polylineInstance.length - 1

      // 右键删除
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

      this.addLabelsForPolylineNodes(i)

      // 形状改变时
      this.overlay.polylineInstance[i].on('change', e => {
        this.addLabelsForPolylineNodes(i)
      })

      // 初始化折线编辑器
      let polylineEditor = null
      if (editable) {
        polylineEditor = new AMap.PolyEditor(this.map, this.overlay.polylineInstance[i])
        polylineEditor.open()
      }
      this.overlay.polylineEditor.push(polylineEditor)
      this.overlay.polylineInstance[i].setMap(this.map)

      // 恢复点位绘制
      this.overlay.polylineInstance[i].on('click', this.onMapClick)
    },
  }
}
