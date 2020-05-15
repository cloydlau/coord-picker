import Vue from 'vue'
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
      polygonObj: [],
      polygonEditor: [],
      curBoundary: []
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
      console.log(boundary)
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
        this.map.off('click', this.onMapClick)
        this.mouseTool.polygon(this.polygonStyle)
      }
    },
    editPolygon () {
      const i = this.polygonObj.length - 1
      let polygon = this.polygonObj[i]

      const polygonContextMenu = new AMap.ContextMenu()
      polygonContextMenu.addItem('删除', e => {
        this.polygonEditor[i].close()
        this.polygonEditor[i] = null
        this.polygonObj[i].setMap(null)
        this.polygonObj[i] = null
      }, 0)

      polygon.on('rightclick', e => {
        polygonContextMenu.open(this.map, e.lnglat)
      })

      polygon.setMap(this.map)
      this.polygonEditor.push(new AMap.PolyEditor(this.map, polygon))
      this.polygonEditor[i].open()
    },
  }
}
