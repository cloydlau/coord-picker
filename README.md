# coord-picker

![图片](./preview.png)

## 特性

- 坐标拾取、绘制点位（双向绑定坐标）
- 拖拉拽绘制折线（双向绑定坐标）
- 拖拉拽绘制矩形、内嵌贴图的矩形（双向绑定坐标）
- 拖拉拽绘制多边形（双向绑定坐标）
- 覆盖物支持只读模式 & 编辑模式
- 支持限定覆盖物的数量上限、下限
- POI 搜索、搜索关键字自动补全
- 根据传参情况智能初始化至合适的位置
- 全局或局部引入，参数支持全局或局部配置（[vue-global-config](https://github.com/cloydlau/vue-global-config.git) 提供技术支持）

<br>

## 安装

![NPM](https://nodei.co/npm/coord-picker.png)

```bash
npm add coord-picker element-ui
```

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
  <CoordPicker v-bind="{/* 局部配置 */}"/>
</template>

<script>
import 'coord-picker/dist/style.css'
import CoordPicker from 'coord-picker'

export default {
  components: { CoordPicker },
}
</script>
```

<br>

## 参数

### 基础参数

| 名称 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| show.sync | 开关 | boolean | | false |
| loadOptions | [AMapLoader.load 的参数](https://lbs.amap.com/api/jsapi-v2/guide/abc/load/) ，其中 `loadOptions.key` 必传 | object | | |
| mapOptions[.sync] | [AMap.Map 的参数2](https://lbs.amap.com/api/javascript-api/reference/map) | object | | |
| city | 初始行政区 | string | | |
| precision | 坐标精度（保留几位小数） | number | | 6 |
| addressComponent* | 地址成分 | object, function | | |

### 中心点相关

| 名称 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| lng.sync | 经度 | number, string | | |
| lat.sync | 纬度 | number, string | | |
| address.sync | 地址 | string | | |

### 点位相关

| 名称 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| marker.sync | 点位列表 | object[] | | |
| markerCount | 点位数量限制 | number, number[] | | 1 |

### 折线相关

| 名称 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| polyline.sync | 折线列表 | object[] | | |
| polylineCount | 折线数量限制 | number, number[] | | 0 |

### 矩形相关

| 名称 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| rectangle.sync | 矩形 | object[] | | |
| rectangleCount | 矩形数量限制 | number, number[] | | 0 |
| rectangleImage | 嵌在矩形内的贴图url | string, string[] | | |

### 多边形相关

| 名称 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| polygon.sync | 多边形列表 | object[] | | |
| polygonCount | 多边形数量限制 | number, number[] | | 0 |

坐标值类型：

- number 和 string 都能接收，但返回时，由于 js 的 number 类型存在精度丢失问题，故返回 string

### city

> 高德 Web 服务 API 的同名参数

可选值：指定城市的中文（如北京）、指定城市的中文全拼（beijing）、citycode（010）、adcode（110000），不支持县级市。当指定城市查询内容为空时，会进行全国范围内的地址转换检索。

adcode 信息可参考[城市编码表](https://lbs.amap.com/api/webservice/download) 获取

长度超过6位数？

组件内部做了处理，如果你传入的 city 超过6位数，也会以仅保留前6位的形式支持。

### markerCount, rectangleCount, polygonCount

- number

数量上限

- number[]

    0. 数量下限
    1. 数量上限

### addressComponent

获取的 address 默认是包含省市区的完整地址，你可以用以下两种方式来自定义地址成分：

- object

```
{ 
  province: true, // address 中是否包含省
  city: true,     // address 中是否包含市
  district: true  // address 中是否包含区县
}
```

- function

自由组合

```
({ province, city, district ... }) => `${province} - ${city} - ${district}`
```

### mapOptions

为什么支持双向绑定？

- mapOptions 包含可能发生变化的属性，如缩放比例（`zoom`）

<br>

## Events

| 名称 | 说明 | 回调参数 |
| --- | --- | --- |
| load | 高德地图加载完成时，即[AMapLoader.load().then](https://lbs.amap.com/api/jsapi-v2/guide/abc/load/) | AMap（同高德） |
| error | 调用高德API报错时，含[AMapLoader.load().catch](https://lbs.amap.com/api/jsapi-v2/guide/abc/load/) | 同高德 |
| confirm | 点击确认按钮时 | |
| cancel | 点击取消按钮时 | |
| ...el-dialog事件 |

<br>

## 参数配置规则

- 双向绑定参数（`v-model` / `value` / `*.sync`）仅支持局部配置
- 其余参数均支持全局或局部配置

权重：

- 局部配置高于全局配置
- 对于对象类型的参数，局部配置会与全局配置进行合并，同名属性会被局部配置覆盖

<br>

## 定位优先级

`“根据传参情况智能初始化至合适的位置”`，具体参数权重排序如下：

1. 中心点

2. 点位（单个）

3. 详细地址

4. 覆盖物、点位（多个）

5. 参数指定的行政区

6. IP所在行政区（调用高德 `CitySearch` 接口）

> 1、2、3以 `setCenter` 方式定位，4以 `setFitView` 方式定位，5、6以 `setCity` 方式定位

<br>

## 绘制点位

> 使用 `AMap.Marker`

### 如何启用

- `markerCount > 0` 时，开启编辑点位功能

- `markerCount === 0` 时，也会依据 marker 参数渲染点位（只读）

### 数据格式

```
[
  // 点位1
  {
    lng: '',
    lat: '',
    address: '',
    name: ''
  },
  // 点位2
  {
    lng: '',
    lat: '',
    address: '',
    name: ''
  }
]
```

<br>

## 绘制矩形

> 使用 `AMap.Rectangle` 和 `AMap.ImageLayer`

### 如何启用

- `rectangleCount > 0` 时，开启编辑矩形功能

- `rectangleCount === 0` 时，也会依据 rectangle 参数渲染矩形（只读）

### 数据格式

```
[
  // 矩形1
  {
    image: '贴图链接',
    southwest: { lng: '经度', lat: '纬度' }, // 西南角坐标（兼容东南角）
    northeast: { lng: '经度', lat: '纬度' }, // 东北角坐标（兼容西北角）
  },
  // 矩形2
  {
    image: '贴图链接',
    southwest: { lng: '经度', lat: '纬度' }, // 西南角坐标（兼容东南角）
    northeast: { lng: '经度', lat: '纬度' }, // 东北角坐标（兼容西北角）
  },
]
```

<br>

## 绘制多边形

### 如何启用

- `polygonCount > 0` 时，开启编辑多边形功能

- `polygonCount === 0` 时，也会依据 polygon 参数渲染多边形（只读）

### 数据格式

```
[
  // 多边形1
  {
    path: [
      { 'lng': '106.44294', 'lat': '26.644338' },
      { 'lng': '106.431267', 'lat': '26.504937' },
      { 'lng': '106.569282', 'lat': '26.585405' }
    ]
  },
  // 多边形2
  {
    path: [
      { 'lng': '106.623527', 'lat': '26.52767' },
      { 'lng': '106.602241', 'lat': '26.415188' },
      { 'lng': '106.721031', 'lat': '26.472979' }
    ]
  }
]
```

<br>

## 命名规则

为什么不使用全称 `longitude` 和 `latitude` ？

- 高德自己的 API 也没有完全统一，有的用简称有的用全称，coord-picker 为方便起见统一使用简称 `lng` 和 `lat`
- 如果命名/格式与你所需不一致，可考虑二次封装

<br>

## 坐标系统

高德、腾讯地图通用的 GCJ-02

<br>

## 高德 JS-API 版本

`1.4.15`（2.0存在诸多问题，性能也不如1.x，等待后续更新）

<br>

## Notice

在打开 coord-picker 之前，请确保所有参数已传入，为避免与用户的操作发生冲突，组件内部不会监听参数后续的变化

<br>
