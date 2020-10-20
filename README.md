# coord-picker / 坐标拾取

![图片](./preview.png)

### Features

- √ 坐标拾取（双向绑定）
- √ 拖拉拽绘制/编辑图片图层（双向绑定角坐标）
- √ 拖拉拽绘制/编辑多边形（双向绑定轮廓坐标）
- √ POI搜索、搜索关键字自动补全
- √ 支持全局安装/单独引入
- √ 定位灵活：根据传参情况智能初始化至合适的位置

### Installation
![NPM](https://nodei.co/npm/coord-picker.png)
``` bash
$ yarn add coord-picker
```

**依赖**：vue element-ui
___

**全局引入**
```js
import 'coord-picker/dist/coord-picker.css'
import CoordPicker from 'coord-picker'
Vue.use(CoordPicker)
```

**局部引入**
```js
import 'coord-picker/dist/coord-picker.css'
import { CoordPicker } from 'coord-picker'
components: { CoordPicker }
```

### Quick Start

```html
<CoordPicker :show.sync="" apiKey=""/>
```

| 参数 | 说明 | 是否支持全局配置 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- | --- |
| show.sync | 开关 | | Boolean | | false |
| apiKey | 高德地图js api key | 支持 | String | | |
| city | 初始地区 | 支持 | String | 城市名称 / 省份名称 | |
| address.sync | 地址 | | String | | |
| lng.sync | 经度 | | Number / String | | |
| lat.sync | 纬度 | | Number / String | | |
| zoom.sync | 缩放级别 | | Number | | |
| precision | 坐标精度（保留几位小数） | 支持 | Number | | 6 |
| addressComponent | 地址成分 可以指定选中的address是否包含省/市/区 | 支持 | Object | | { province:true, city:true, district:true } |
| img | 图片链接（用于图片图层） | | String | | |
| imgNorthEastLng.sync | 图片东北角经度（用于图片图层） | | Number / String | | |
| imgNorthEastLat.sync | 图片东北角纬度（用于图片图层） | | Number / String | | |
| imgSouthWestLng.sync | 图片西南角经度（用于图片图层） | | Number / String | | |
| imgSouthWestLat.sync | 图片西南角纬度（用于图片图层） | | Number / String | | |
| boundary.sync | 区域轮廓（用于绘制区域） | | Array | | |

> 坐标系：高德/腾讯地图通用的GCJ-02

> 高德JS-API版本：1.4.15（曾采用动态版本，但2.0存在诸多问题，性能也不如1.x，等待后续更新吧）

> 坐标值类型：Number和String都能接收 但返回时 由于js的Number类型存在精度丢失问题 故返回String

<br/>

boundary格式：

```
[
  // 轮廓1
  {
    data: [
      { longitud: '', latitude: '' },
      { longitud: '', latitude: '' }
    ]
  },
  // 轮廓2
  {
    data: [
      { longitud: '', latitude: '' },
      { longitud: '', latitude: '' }
    ]
  }
]
```
