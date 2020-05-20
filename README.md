# coord-picker / 坐标拾取

![图片](./preview.png)

### Intro / 介绍

- √ 坐标拾取（双向绑定）
- √ 拖拉拽绘制/编辑图片图层（双向绑定角坐标）
- √ 拖拉拽绘制/编辑多边形（双向绑定轮廓坐标）
- √ POI搜索、搜索关键字自动补全
- √ 支持全局安装/单独引入
- √ 定位灵活：根据传参情况智能初始化至合适的位置
- 坐标系：高德/腾讯地图通用的GCJ-02
```
* 动态高德JS-API版本：
图片图层2.x（1.x图片图层不能平移） 
多边形1.x（2.x中多边形编辑拖拽、右键菜单等存在问题）
```


### Installation / 安装
```
yarn add coord-picker / npm i coord-picker
依赖项：vue element-ui plain-kit

全局引入：
import 'coord-picker/dist/coord-picker.css'
import CoordPicker from 'coord-picker'
Vue.use(CoordPicker)

局部引入：
import 'coord-picker/dist/coord-picker.css'
import { CoordPicker } from 'coord-picker'
components: { CoordPicker }
```


### Usage / 使用
```
请参考/demo中极简示例
```
