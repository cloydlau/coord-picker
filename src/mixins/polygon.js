export default {
  data () {
    return {
      polygonStyle: {
        strokeColor: '#00B2D5',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        fillColor: '#00D3FC',
        fillOpacity: 0.5,
        cursor: 'pointer',
        zIndex: 50,
      },
    }
  },
  methods: {
    syncPolygon () {
      //同步可能经过删除、节点变化的多边形
      this.curBoundary = []
      this.polygonObj.map(v => {
        if (v) {
          this.curBoundary.push({
            data: Array.from(v.getPath(), v => ({ longitude: v.lng, latitude: v.lat }))
          })
        }
      })
    },
    drawPolygon (boundary) {
      if (boundary) {
        for (let i = 0; i < boundary.length; i++) {
          this.polygonObj.push(new AMap.Polygon({
            ...this.polygonStyle,
            map: this.map,
            path: boundary[i]?.data?.map(v => [v.longitude, v.latitude]),
          }))
          this.editPolygon()
        }
      } else {
        this.mouseTool.polygon(this.polygonStyle)
      }
    },
    editPolygon () {
      const i = this.polygonObj.length - 1

      const polygonContextMenu = new AMap.ContextMenu()
      polygonContextMenu.addItem('删除', e => {
        this.polygonEditor[i].close()
        this.polygonEditor[i] = null
        this.polygonObj[i].setMap(null)
        this.polygonObj[i] = null
      }, 0)

      this.polygonObj[i].on('mousemove', e => {
        this.text.setText('拖拽角可调整形状，右键可删除该区域')
        this.setTextPosition(e)
      })
      this.polygonObj[i].on('mouseout', e => {
        this.text.setText('点击获取坐标')
      })

      this.polygonObj[i].on('click', this.onMapClick)

      this.polygonObj[i].on('rightclick', e => {
        polygonContextMenu.open(this.map, e.lnglat)
      })

      this.polygonEditor.push(AMap.PolygonEditor ?
        new AMap.PolygonEditor(this.map, this.polygonObj[i]) :
        new AMap.PolyEditor(this.map, this.polygonObj[i])
      )
      this.polygonEditor[i].open()
      this.polygonObj[i].setMap(this.map)
    },
  }
}
