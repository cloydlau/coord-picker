# coord-picker / 坐标拾取

![preview](./preview.png)

### Intro / 介绍

- √ 坐标拾取（双向绑定）
- √ 拖拉拽绘制/编辑图片图层（双向绑定角坐标）
- √ 拖拉拽绘制/编辑多边形（双向绑定轮廓坐标）
- √ POI搜索自动补全提示
- √ 支持全局安装/单独引入
- √ 定位灵活：根据传参情况智能初始化至合适的位置

- 高德JS-API版本：2.0
- 坐标系：高德/腾讯地图通用的GCJ-02


### Installation / 安装
```
yarn add coord-picker / npm i coord-picker
依赖项：vue element-ui plain-kit

全局引入：
import CoordPicker from 'coord-picker'
Vue.use(CoordPicker)

局部引入：
import { CoordPicker } from 'coord-picker'
components: { CoordPicker }
```


### Usage / 使用
```
请参考极简demo：
cd node_modules/coord-picker/demo
```
