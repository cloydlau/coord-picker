# coord-picker / 坐标拾取

![图片](./preview.png)

## Features

- √ 坐标拾取（双向绑定）
- √ 拖拉拽绘制/编辑图片图层（双向绑定角坐标）
- √ 拖拉拽绘制/编辑多边形（双向绑定轮廓坐标）
- √ POI搜索、搜索关键字自动补全
- √ 根据传参情况智能初始化至合适的位置
- √ 全局或局部引入 参数支持全局或局部配置

<br>

## Installation

![NPM](https://nodei.co/npm/coord-picker.png)

Dependencies: vue element-ui

```ts
// 全局引入

import 'coord-picker/dist/style.css'
import CoordPicker from 'coord-picker'

Vue.use(CoordPicker, {
  // 全局配置
})
```

```vue
<!-- 局部引入 -->

<template>
  <CoordPicker v-bind="config"/>
</template>

<script>
import 'coord-picker/dist/style.css'
import CoordPicker from 'coord-picker'

export default {
  components: { CoordPicker },
  data () {
    return {
      config: {
        // 局部配置
      }
    }
  }
}
</script>
```

<br>

## Props

| Attribute | Description | Configuration Mode | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- | --- |
| show.sync | 开关 | props | boolean | | false |
| apiKey | 高德地图js api key | props, global | string | | |
| city | 初始行政区 | props, global | string | 城市名称 / 省份名称 | |
| address.sync | 地址 | props | string | | |
| lng.sync | 经度 | props | number / string | | |
| lat.sync | 纬度 | props | number / string | | |
| zoom.sync | 缩放级别 | props | number | | |
| precision | 坐标精度（保留几位小数） | props, global | number | | 6 |
| addressComponent* | 地址成分 | props, global | object, string | | { province: true, city: true, district: true } |
| img | 图片链接（用于图片图层） | props | string | | |
| imgNorthEastLng.sync | 图片东北角经度（用于图片图层） | props | number / string | | |
| imgNorthEastLat.sync | 图片东北角纬度（用于图片图层） | props | number / string | | |
| imgSouthWestLng.sync | 图片西南角经度（用于图片图层） | props | number / string | | |
| imgSouthWestLat.sync | 图片西南角纬度（用于图片图层） | props | number / string | | |
| boundary.sync* | 区域轮廓（用于绘制区域） | props | array | | |

::: warning 坐标值类型  
number和string都能接收 但返回时 由于js的number类型存在精度丢失问题 故返回string
:::

### addressComponent

### boundary

返回格式：

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
  // 轮廓2
  {
    data: [
      { 'longitude': '106.623527', 'latitude': '26.52767' },
      { 'longitude': '106.602241', 'latitude': '26.415188' },
      { 'longitude': '106.721031', 'latitude': '26.472979' }
    ]
  }
]
```

<br>

## Config rules

- 双向绑定参数（`v-model` / `value` / `*.sync`）仅支持局部配置
- 其余参数均支持全局或局部配置

权重：

- 局部配置高于全局配置
- 对于对象类型的参数 局部配置会与全局配置进行合并 同名属性会被局部配置覆盖

<br>

## 坐标系统

高德、腾讯地图通用的 `GCJ-02`

<br>

## 高德JS-API版本

1.4.15（2.0存在诸多问题，性能也不如1.x，等待后续更新）

<br>
