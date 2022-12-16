<h1 align="center">
  <a href="https://npmjs.com/package/coord-picker" target="_blank" rel="noopener noreferrer">
    Coord Picker <sup><img alt="version" src="https://versionbadg.es/cloydlau/coord-picker.svg"></sup>
  </a>
</h1>

<p align="center">
  坐标拾取工具。
</p>

<p align="center">
  <a href="https://bundlephobia.com/package/coord-picker"><img alt="minzipped size" src="https://img.shields.io/bundlephobia/minzip/coord-picker"></a>
  <a href="https://eslint.org"><img alt="code style" src="https://img.shields.io/badge/code_style-ESLint-4B32C3.svg?logo=eslint"></a>
  <a href="https://conventionalcommits.org"><img alt="conventional commits" src="https://img.shields.io/badge/commits-Conventional-FE5196.svg?logo=conventionalcommits&logoColor=white"></a>
</p>

<p align="center">
  <img alt="preview" src="https://raw.githubusercontent.com/cloydlau/coord-picker/main/preview.png">
</p>

<br>

## 特性

- 坐标拾取、绘制点位（双向绑定坐标）
- 拖拉拽绘制折线（双向绑定坐标）
- 拖拉拽绘制矩形、内嵌贴图的矩形（双向绑定坐标）
- 拖拉拽绘制多边形（双向绑定坐标）
- 覆盖物支持只读模式 & 编辑模式
- 支持限定覆盖物的数量上限、下限
- POI 搜索、搜索关键字自动补全
- 根据传参情况智能初始化至合适的位置
- 局部注册 + 局部传参，也可以全局注册 + 全局传参（[vue-global-config](https://github.com/cloydlau/vue-global-config) 提供技术支持）

<br>

## 安装

```shell
npm add coord-picker
```

### 外置依赖

- `vue@2`
- `element-ui`

### 局部注册

```vue
<template>
  <CoordPicker v-bind="{/* 局部配置 */}" />
</template>

<script>
import CoordPicker from 'coord-picker'

export default {
  components: { CoordPicker },
}
</script>
```

### 全局注册

```ts
import CoordPicker from 'coord-picker'

Vue.use(CoordPicker, {
  // 全局配置
})
```

### CDN + ESM

> ⚠ 暂不支持（ElementUI 未提供 ESM 导出）

### CDN + UMD

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link
    rel="stylesheet"
    href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"
  >
</head>

<body>
  <div id="app">
    <coord-picker
      show
      :load-options="loadOptions"
    ></coord-picker>
  </div>
  <script src="https://unpkg.com/vue@2"></script>
  <script src="https://unpkg.com/element-ui/lib/index.js"></script>
  <script src="https://unpkg.com/coord-picker@0.8"></script>
  <script>
    window._AMapSecurityConfig = { serviceHost: 'xxx/_AMapService/' }

    new Vue({
      components: { CoordPicker },
      data() {
        return {
          loadOptions: {
            key: 'xxx',
          },
        }
      },
    }).$mount('#app')
  </script>
</body>

</html>

```

<br>

## Props

> 这里仅列出基础参数，覆盖物的参数请在相关章节查看

| 名称              | 说明                                                                                                      | 类型                                                                                                                           | 默认值  |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| show[.sync]       | 开关                                                                                                      | boolean                                                                                                                        | `false` |
| loadOptions       | [AMapLoader.load 的参数](https://lbs.amap.com/api/jsapi-v2/guide/abc/load/) ，其中 `loadOptions.key` 必传 | object                                                                                                                         |         |
| mapOptions[.sync] | [AMap.Map 的参数2](https://lbs.amap.com/api/javascript-api/reference/map)                                 | object                                                                                                                         |         |
| city              | 初始行政区                                                                                                | string                                                                                                                         |         |
| lng[.sync]        | 经度                                                                                                      | string / number                                                                                                                |
| lat[.sync]        | 纬度                                                                                                      | string / number                                                                                                                |
| precision         | 坐标精度（保留几位小数）                                                                                  | number                                                                                                                         | `6`     |
| address[.sync]    | 地址                                                                                                      | string                                                                                                                         |
| addressComponent  | 地址成分                                                                                                  | object / (addressComponent: [AddressComponent](https://lbs.amap.com/api/javascript-api/reference/lnglat-to-address)) => string |         |

> ⚠ 在打开 `coord-picker` 之前，请确保所有参数已传入，为避免与用户的操作发生冲突，组件内部不会监听参数后续的变化。

### city

高德 Web 服务 API 的同名参数。

可选值: 指定城市的中文（如北京）、指定城市的中文全拼（beijing）、citycode（010）、adcode（110000），不支持县级市。当指定城市查询内容为空时，会进行全国范围内的地址转换检索。

adcode 信息可参考[城市编码表](https://lbs.amap.com/api/webservice/download)获取。

长度超过6位数？

组件内部做了处理，如果你传入的 city 超过6位数，也会以仅保留前6位的形式支持。

### addressComponent

获取的 address 默认是包含省市区的完整地址，你可以用以下两种方式来自定义地址成分:

- object

```json
{
  "province": true, // address 中是否包含省
  "city": true, // address 中是否包含市
  "district": true // address 中是否包含区县
}
```

- function

```ts
({ province, city, district }) => `${province} - ${city} - ${district}`
```

### mapOptions

为什么支持双向绑定？

- mapOptions 包含可能发生变化的属性，如缩放比例 `zoom`

<br>

## 绘制点位

### Props

| 名称          | 说明         | 类型                        | 默认值 |
| ------------- | ------------ | --------------------------- | ------ |
| marker[.sync] | 点位列表     | object[]                    |        |
| markerCount   | 点位数量限制 | number / [number?, number?] | `1`    |

#### markerCount

类型
- number: 数量上限
- [number?, number?]: [数量下限, 数量上限]

值
- `markerCount > 0`: 开启编辑点位功能
- `markerCount === 0`: 依据 marker 参数渲染点位（只读）

#### marker

```json
[
  // 点位1
  {
    "lng": "",
    "lat": "",
    "address": "",
    "name": ""
  },
  // 点位2
  {
    "lng": "",
    "lat": "",
    "address": "",
    "name": ""
  }
]
```

<br>

## 绘制折线

### Props

| 名称            | 说明         | 类型                        | 默认值 |
| --------------- | ------------ | --------------------------- | ------ |
| polyline[.sync] | 折线列表     | object[]                    |        |
| polylineCount   | 折线数量限制 | number / [number?, number?] | `0`    |

#### polylineCount

类型
- number: 数量上限
- [number?, number?]: [数量下限, 数量上限]

值
- `polylineCount > 0`: 开启编辑折线功能
- `polylineCount === 0`: 依据 polyline 参数渲染折线（只读）

#### polyline

```json
[
  // 折线1
  {
    "path": [
      { "lng": "106.627636", "lat": "26.692251" },
      { "lng": "106.604633", "lat": "26.647459" },
      { "lng": "106.682224", "lat": "26.658505" }
    ]
  },
  // 折线2
  {
    "path": [
      { "lng": "106.707973", "lat": "26.676606" },
      { "lng": "106.688404", "lat": "26.628739" },
      { "lng": "106.748486", "lat": "26.678447" }
    ]
  }
]
```

<br>

## 绘制矩形

### Props

| 名称             | 说明                 | 类型                        | 默认值 |
| ---------------- | -------------------- | --------------------------- | ------ |
| rectangle[.sync] | 矩形                 | object[]                    |        |
| rectangleCount   | 矩形数量限制         | number / [number?, number?] | `0`    |
| rectangleImage   | 嵌在矩形内的贴图链接 | string / string[]           |        |

#### rectangleCount

类型
- number: 数量上限
- [number?, number?]: [数量下限, 数量上限]

值
- `rectangleCount > 0`: 开启编辑矩形功能
- `rectangleCount === 0`: 依据 rectangle 参数渲染矩形（只读）

#### rectangle

```json
[
  // 矩形1
  {
    "image": "贴图链接",
    "southwest": { "lng": "经度", "lat": "纬度" }, // 西南角坐标（兼容东南角）
    "northeast": { "lng": "经度", "lat": "纬度" } // 东北角坐标（兼容西北角）
  },
  // 矩形2
  {
    "image": "贴图链接",
    "southwest": { "lng": "经度", "lat": "纬度" }, // 西南角坐标（兼容东南角）
    "northeast": { "lng": "经度", "lat": "纬度" } // 东北角坐标（兼容西北角）
  }
]
```

<br>

## 绘制多边形

### Props

| 名称           | 说明           | 类型                        | 默认值 |
| -------------- | -------------- | --------------------------- | ------ |
| polygon[.sync] | 多边形列表     | object[]                    |        |
| polygonCount   | 多边形数量限制 | number / [number?, number?] | `0`    |

#### polygonCount

类型
- number: 数量上限
- [number?, number?]: [数量下限, 数量上限]

值
- `polygonCount > 0`: 开启编辑多边形功能
- `polygonCount === 0`: 依据 polygon 参数渲染多边形（只读）

#### polygon

```json
[
  // 多边形1
  {
    "path": [
      { "lng": "106.44294", "lat": "26.644338" },
      { "lng": "106.431267", "lat": "26.504937" },
      { "lng": "106.569282", "lat": "26.585405" }
    ]
  },
  // 多边形2
  {
    "path": [
      { "lng": "106.623527", "lat": "26.52767" },
      { "lng": "106.602241", "lat": "26.415188" },
      { "lng": "106.721031", "lat": "26.472979" }
    ]
  }
]
```

<br>

## Events

| 名称    | 说明                                                                                                 | 回调参数 |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| load    | 高德地图加载完成时，即 [AMapLoader.load().then](https://lbs.amap.com/api/jsapi-v2/guide/abc/load/)   | `AMap`   |
| error   | 调用高德 API 报错时，含 [AMapLoader.load().catch](https://lbs.amap.com/api/jsapi-v2/guide/abc/load/) | 同高德   |
| confirm | 点击确认按钮时                                                                                       |          |
| cancel  | 点击取消按钮时                                                                                       |          |
| ...     | `el-dialog` 的 events                                                                                |          |

<br>

## 坐标系统

高德、腾讯地图通用的 GCJ-02

<br>

## 坐标值数据类型

number 和 string 都能接收，但返回时，由于 JS 的 number 类型存在精度丢失问题，故返回 string

<br>

## 高德 JS-API 版本

1.4.15

> 2.0存在诸多问题，性能也不如1.x，等待后续更新

<br>

## 命名

为什么不使用全称 longitude 和 latitude ？

- 高德自己的 API 也没有完全统一，有的用简称有的用全称，coord-picker 为方便起见统一使用简称 lng 和 lat
- 如果命名 / 格式与你所需不一致，可考虑二次封装

<br>

## 更新日志

各版本详细改动请参考 [release notes](https://github.com/cloydlau/coord-picker/releases) 。

<br>
