# coord-picker / 坐标拾取

![图片](./preview.png)

## Features

- √ 坐标拾取、绘制点位（双向绑定）
- √ 拖拉拽绘制、编辑矩形/贴图（双向绑定角坐标）
- √ 拖拉拽绘制、编辑多边形（双向绑定多边形坐标）
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

### 基础参数

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| show.sync | 开关 | boolean | | false |
| apiKey | 高德地图 js api key | string | | |
| city | 初始行政区 | string | | |
| mapOptions.sync | [地图初始化参数对象](https://lbs.amap.com/api/javascript-api/reference/map) | object | | |
| precision | 坐标精度（保留几位小数） | number | | 6 |
| addressComponent* | 地址成分 | object, function | | |

### 中心点相关

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| lng.sync | 经度 | number, string | | |
| lat.sync | 纬度 | number, string | | |
| address.sync | 地址 | string | | |

### 点位相关

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| marker.sync | 点位列表 | object[] | | |
| markerCount | 点位数量限制 | number, number[] | | 1 |

### 矩形相关

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| rectangle.sync | 矩形 | object[] | | |
| rectangleCount | 矩形数量限制 | number, number[] | | 0 |
| rectangleImage | 嵌在矩形内的贴图url | string, string[] | | |

### 多边形相关

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| polygon.sync | 多边形列表 | object[] | | |
| polygonCount | 多边形数量限制 | number, number[] | | 0 |

::: warning 坐标值类型  
number和string都能接收 但返回时 由于js的number类型存在精度丢失问题 故返回string
:::

### city

> 高德Web服务API的同名参数

可选值：指定城市的中文（如北京）、指定城市的中文全拼（beijing）、citycode（010）、adcode（110000），不支持县级市。当指定城市查询内容为空时，会进行全国范围内的地址转换检索。

adcode信息可参考[城市编码表](https://lbs.amap.com/api/webservice/download)获取

::: tip 长度超过6位数？  
组件内部做了处理，如果你传入的city超过6位数，也会以仅保留前6位的形式支持。
:::

### markerCount, rectangleCount, polygonCount

- number

数量上限

- number[]

    0. 数量下限
    1. 数量上限

### addressComponent

获取的address默认是包含省市区的完整地址，你可以用以下两种方式来自定义地址成分：

- object

```
{ 
  province: true, // address中是否包含省
  city: true,     // address中是否包含市
  district: true  // address中是否包含区县
}
```

- function

自由组合

```
({ province, city, district ... }) => `${province} - ${city} - ${district}`
```

### mapOptions

::: tip 为什么支持双向绑定？  
mapOptions包含可能发生变化的属性，如缩放比例（`zoom`）
:::

<br>

## Config rules

- 双向绑定参数（`v-model` / `value` / `*.sync`）仅支持局部配置
- 其余参数均支持全局或局部配置

权重：

- 局部配置高于全局配置
- 对于对象类型的参数 局部配置会与全局配置进行合并 同名属性会被局部配置覆盖

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

### 如何启用

- `markerCount > 0` 时，开启编辑点位功能

- `markerCount === 0` 时，也会依据marker参数渲染点位（只读）

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

### 如何启用

- `rectangleCount > 0` 时，开启编辑矩形功能

- `rectangleCount === 0` 时，也会依据rectangle参数渲染矩形（只读）

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

- `polygonCount === 0` 时，也会依据polygon参数渲染多边形（只读）

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

- 高德自己的API也没有完全统一，有的用简称有的用全称，coord-picker为方便起见统一使用简称 `lng` 和 `lat`
- 如果命名/格式与你所需不一致，可考虑二次封装

<br>

## 坐标系统

高德、腾讯地图通用的 `GCJ-02`

<br>

## 高德 JS-API 版本

`1.4.15`（2.0存在诸多问题，性能也不如1.x，等待后续更新）

<br>

## Notice

在打开coord-picker之前，请确保所有参数已传入，为避免与用户的操作发生冲突，组件内部不会监听参数后续的变化

<br>
