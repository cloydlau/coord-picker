# coord-picker / 坐标拾取

![图片](./preview.png)

### Features

- √ 坐标拾取（双向绑定）
- √ 拖拉拽绘制/编辑图片图层（双向绑定角坐标）
- √ 拖拉拽绘制/编辑多边形（双向绑定轮廓坐标）
- √ POI搜索、搜索关键字自动补全
- √ 根据传参情况智能初始化至合适的位置
- √ 全局安装/局部引入 通用参数仅需配置一次

### Installation
![NPM](https://nodei.co/npm/coord-picker.png)
``` bash
$ yarn add coord-picker
```

**依赖**：vue element-ui

```js
import 'coord-picker/dist/coord-picker.css'
import CoordPicker from 'coord-picker'

// 组件内引入
components: { CoordPicker }

// 全局引入
Vue.use(CoordPicker) 
```

### Quick Start

```html
<CoordPicker :show.sync="" apiKey=""/>
```

| Attribute | Description | Configuration Mode | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- | --- |
| show.sync | 开关 | props | boolean | | false |
| apiKey | 高德地图js api key | props, global | string | | |
| city | 初始地区 | props, global | string | 城市名称 / 省份名称 | |
| address.sync | 地址 | props | string | | |
| lng.sync | 经度 | props | number / string | | |
| lat.sync | 纬度 | props | number / string | | |
| zoom.sync | 缩放级别 | props | number | | |
| precision | 坐标精度（保留几位小数） | props, global | number | | 6 |
| addressComponent | 地址成分 可以指定选中的address是否包含省/市/区 | props, global | object | | { province:true, city:true, district:true } |
| img | 图片链接（用于图片图层） | props | string | | |
| imgNorthEastLng.sync | 图片东北角经度（用于图片图层） | props | number / string | | |
| imgNorthEastLat.sync | 图片东北角纬度（用于图片图层） | props | number / string | | |
| imgSouthWestLng.sync | 图片西南角经度（用于图片图层） | props | number / string | | |
| imgSouthWestLat.sync | 图片西南角纬度（用于图片图层） | props | number / string | | |
| boundary.sync | 区域轮廓（用于绘制区域） | props | array | | |

> 坐标系：高德/腾讯地图通用的GCJ-02

> 高德JS-API版本：1.4.15（2.0存在诸多问题，性能也不如1.x，等待后续更新）

> 坐标值类型：number和string都能接收 但返回时 由于js的number类型存在精度丢失问题 故返回string

<br/>

**boundary格式**

```
[
  // 轮廓1
  {
    data: [
      { 'longitude': '106.44294', 'latitude': '26.644338' },
      { 'longitude': '106.431267', 'latitude': '26.504937' },
      { 'longitude': '106.569282', 'latitude': '26.585405' }
    ]
  },
  // 轮廓1 
  {
    data: [
      { 'longitude': '106.623527', 'latitude': '26.52767' },
      { 'longitude': '106.602241', 'latitude': '26.415188' },
      { 'longitude': '106.721031', 'latitude': '26.472979' }
    ]
  }
]
```
