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
      polygon: {
        obj: [],
        editor: [],
        area: [],
        contextMenu: null
      },
    }
  },
  methods: {
    drawPolygon (area) {
      if (area) {
        for (let i = 0; i < area.length; i++) {
          this.polygon.obj.push(new AMap.Polygon({
            ...this.polygonStyle,
            map: this.map,
            path: area[i]?.data?.map(v => [v.longitude, v.latitude]),
          }))
          this.editPolygon()
        }
      } else {
        this.mouseTool.polygon(this.polygonStyle)
      }
    },
    editPolygon (path) {
      if (path) {
        this.polygon.area.push({
          data: path.map(v => ({ longitude: v.lng, latitude: v.lat }))
        })
      }
      const i = this.polygon.obj.length - 1
      let polygon = this.polygon.obj[i]

      /*const polygonContextMenu = new AMap.ContextMenu()
      polygonContextMenu.addItem('删除', e => {
        this.polygon.area[i] = null
        this.polygon.editor[i].close()
        this.polygon.editor[i] = null
        polygon.setMap(null)
        polygon = null
      }, 0)

      polygon.on('rightclick', e => {
        console.log(e.lnglat)
        console.log(polygonContextMenu)
        polygonContextMenu.open(this.map, e.lnglat)
      })*/

      polygon.setMap(this.map)
      this.polygon.editor.push(new AMap.PolyEditor(this.map, polygon))
      this.polygon.editor[i].open()
    },
  }
}
