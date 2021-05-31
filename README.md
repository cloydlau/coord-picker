# coord-picker / 坐标拾取

![图片](./preview.png)

## Features

- √ 坐标拾取、绘制点位（双向绑定）
- √ 拖拉拽绘制、编辑图片图层（双向绑定角坐标）
- √ 拖拉拽绘制、编辑多边形（双向绑定轮廓坐标）
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
| city* | 初始行政区 | string | | |
| zoom.sync | 缩放级别 | number | | |
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
| marker.sync* | 点位列表 | object[] | | |
| markerCount* | 点位数量限制 | number, number[] | | 1 |

### 图层相关

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| img | 图片url | string | | |
| imgNorthEastLng.sync | 图片东北角经度 | number, string | | |
| imgNorthEastLat.sync | 图片东北角纬度 | number, string | | |
| imgSouthWestLng.sync | 图片西南角经度 | number, string | | |
| imgSouthWestLat.sync | 图片西南角纬度 | number, string | | |

### 轮廓相关

| Attribute | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| boundary.sync* | 区域轮廓列表 | object[] | | |
| boundaryCount* | 区域数量限制 | number, number[] | | 0 |

::: warning 坐标值类型  
number和string都能接收 但返回时 由于js的number类型存在精度丢失问题 故返回string
:::

### city

> 高德Web服务API的同名参数

可选值：指定城市的中文（如北京）、指定城市的中文全拼（beijing）、citycode（010）、adcode（110000），不支持县级市。当指定城市查询内容为空时，会进行全国范围内的地址转换检索。

adcode信息可参考[城市编码表](https://lbs.amap.com/api/webservice/download)获取

### markerCount, boundaryCount

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

## 绘制图层

### 如何启用

`img` 参数不为空时

### 图层数量

目前仅支持一个，二次绘制会覆盖先前的图层

<br>

## 绘制轮廓

### 如何启用

`boundaryCount` 参数的值大于0时

### 数据格式

```
[
  // 轮廓1
  {
    path: [
      { 'lng': '106.44294', 'lat': '26.644338' },
      { 'lng': '106.431267', 'lat': '26.504937' },
      { 'lng': '106.569282', 'lat': '26.585405' }
    ]
  },
  // 轮廓2
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
