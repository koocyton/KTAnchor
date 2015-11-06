# KTAnchor

`KTAnchor` is a Pjax LIB on JQuery, And there are more extensions

`KTAnchor` 是一个基于 jQuery 的 Pjax 库，你可以单独用他的 Pjax 部分，也可以用其他扩充的功能

###### demo

`web application` : https://wat.doopp.com/webapp.html

`admin system` : https://wat.doopp.com/manager.html

`account login` : https://wat.doopp.com/login.html

###### 快速使用
``` html
<html>
<script src="jquery-1.4.1.min.js"></script>
<script src="KTAnchor.js"></script>
<link rel="stylesheet" href="KTAnchor.css"></link>
<link rel="stylesheet" href="octicons/octicons.css"></link>
...
<body>
...
<script>
$(document).ready(function(){
	$(document.body).KTLoader();
});
</script>
</body>
</html>
```

`$.fn.KTLoader()` 是一个方便的调用，如果你做了上面的操作，他实际上是执行了
$.fn.KTPaging(); $.fn.KTTreeMenu(); $.fn.KTAnchor(); $.fn.KTForm(); $.fn.KTDropDown(); $.fn.KTMouseWheel();
你可以拆开了调用他们，以便符合自己的实际。
比如，你只需要将所有的 A TAG 转变为 PJax 请求
``` html
<script>
$(document).ready(function(){
	$(document.body).KTAnchor();
});
</script>
```

`如果打算在移动端浏览器上使用`，建议如下
```html
<meta name="viewport" content="width=device-width,initial-scale=0.5,minimum-scale=0.5,maximum-scale=0.5,user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="format-detection" content="telephone=no"/>
<meta name="apple-mobile-web-app-status-bar-style" content="white" />
```

###### 初始化
`$.KTAnchor.init(options)` 用来初始化你的一些环境，在加载 KTAnchor.js 时，默认环境参数设置，
你在调用 $.fn.KTLoader() 之前，可以自己做一次初始化，以适合你的使用环境

`options.response_container` 这个值表示默认情况下，你的请求返回会填充到 $(options.response_container)

``` javascript
$.KTAnchor.init({
	response_container: ".response-container", // Ajax, 设定默认 response 填充的区域
	paging_container: ".paging-container", // 分页，分页的容器
	paging_limit: 30, // 分页，默认每页 30 条记录
	paging_symbol: "&cc", // 分页，默认通过传统的 & 来分割，值通过 http.request.GET.cc 来传递
	dropdown_container: ".dropdown-container", // 弹出菜单，通过识别此节点，来绑定 下拉菜单的 事件
	treemenu_container: ".treemenu-container", // 树状菜单，通过识别此节点，来绑定 树状菜单 点击事件
	scroll_container: ".scroll-container" // 自定义相应鼠标滚动，通过识别此节点，来绑定
});
```

###### 如，分页的参数通过 /pn=... 来传递 而不是 默认的额 ?cc=... 以适合你的 write 环境

``` javascript
$.KTAnchor.init({
	paging_symbol: "/pn"
});
```
