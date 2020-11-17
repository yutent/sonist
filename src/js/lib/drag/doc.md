# 拖拽插件
> 该插件可以让任意一个元素可以被拖拽,而不需要该元素是否具有定位属性。
> 使用时,在目标元素上添加`:drag`属性即可以实现拖拽功能。

## 依赖
> 依赖`Anot`框架

## 浏览器兼容性
+ chrome
+ firefox
+ safari
+ IE10+


## 用法
> 只需要在要拖拽的元素上添加`:drag`即可;
> 如果要拖拽的元素不是当前元素,只需要给该属性增加一个值为想要拖拽元素的类名或ID。
> 具体请看示例:
> **注意:** `拖拽的元素不是本身时,只会往父级一级一级找相匹配的` 

```html

<!DOCTYPE html>
<html>
<head>
<style>
  * {margin:0;padding:0}
  .box {width:200px;height:100px;background:#aaa;}
  .box .handle {width:200px;height:30px;background:#f30;}
</style>
</head>
<body :controller="test">

<div class="box" :drag></div>

<div class="box">
  <div class="handle" :drag="box"></div>
</div>

<script>
import Anot from 'lib/drag/index.js'
Anot({
  $id: 'test'
}) 
</script>

</body>
</html>

```


## 额外参数

### `data-limit`
> 用于限制元素的拖动范围,默认没有限制。 可选值为 "window"和"parent", 分别为 "限制在可视区"和"限制在父级元素的范围"

### `data-axis`
> 用于限制拖动的方向, 默认值为 "xy",即不限制方向。可选值为 "x"和"y", 即只能在"x轴"或"y轴"方向拖动。

### `data-beforedrag`
> 拖动前的回调,如果有设置回调方法, 则该回调的返回值,可决定该元素是否能被拖拽, 可用于在特殊场景下,临时禁用拖拽。
> `注:`
> 1. 该回调方法,会传入3个参数, 第1个为被拖拽的元素(dom对象), 第2个参数为 该元素的x轴绝对坐标, 第3个元素为y轴绝对坐标;
> 2. 该回调方法, 返回false时, 本次拖拽将临时失效, 返回其他值,或没有返回值,则忽略。


### `data-dragging`
> 元素被拖动时的回调。
> `注:`
> 1.该回调方法,会传入3个参数, 第1个为被拖拽的元素(dom对象), 第2个参数为 该元素的x轴绝对坐标, 第3个元素为y轴绝对坐标;


### `data-dragged`
> 元素被拖动结束后的回调。
> `注:`
> 1. 该回调方法,会传入3个参数, 第1个为被拖拽的元素(dom对象), 第2个参数为 该元素的x轴绝对坐标, 第3个元素为y轴绝对坐标;








