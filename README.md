# KTAnchor

`KTAnchor` is a Pjax LIB on JQuery, And there are more extensions

`KTAnchor` 是一个基于 jQuery 的 Pjax 库，你可以单独用他的 Pjax 部分，也可以用其他扩充的功能

##### demo

`web application` : https://wat.doopp.com/webapp.html

`admin system` : https://wat.doopp.com/manager.html

`account login` : https://wat.doopp.com/login.html

##### 快速使用
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

##### `$.fn.KTLoader()` 

`$.fn.KTLoader()` 是一个方便的调用，如果你做了上面的操作，他实际上是执行了
`$.fn.KTPaging()`; `$.fn.KTTreeMenu()`; `$.fn.KTAnchor()`; `$.fn.KTForm()`; `$.fn.KTDropDown()`; `$.fn.KTMouseWheel()`;

你可以拆开了调用他们，以便符合自己的实际。比如，你只需要将所有的 `A` TAG 转变为 `Pjax` 请求

``` html
<script>
$(document).ready(function(){
	$(document.body).KTAnchor();
});
</script>
```

##### `$.fn.KTAnchor()` 将指定节点内 <a> 转为 Pjax 请求。`$.fn.KTForm()` 将指定节点内 <form> 转为 ajax  或 Pjax 请求
``` javascript
$.fn.extend({
	KTAnchor : function(success, error, begin, complete)
	KTForm : function(inputError, success, error, begin, complete)
})
```

`$.fn.KTAnchor` 接受 4 个回调函数参数，依次为 `成功`，`错误`，`开始` 和 `完成` 的回调

`$.fn.KTForm` 接受 5 个回调函数参数，依次为 `表单验证失败`, `成功`，`错误`，`开始` 和 `完成` 的回调

如果不传参数，`$.fn.KTAnchor` 和 `$.fn.KTForm` 会回调默认的方法，等于如下效果

``` javascript
$.fn.KTAnchor($.KTAnchor.success, $.KTAnchor.error, $.KTAnchor.begin, $.KTAnchor.complete)
$.fn.KTForm($.KTAnchor.inputError, $.KTAnchor.success, $.KTAnchor.error, $.KTAnchor.begin, $.KTAnchor.complete)
```

你可以自定义回调，比如返回含有 [error-message] => ? 时，alert(?) 的内容出来

``` html
<script>
// container 是 init 设定的指定的节点
// responseText 是请求返回的 字符
function mySuccess(container, responseText){
	// 将错误弹出
	if (/\[error-message\] => ([^\n]+)/.test(responseText)) {
		var error_message = responseText.match(/\[error-message\] => ([^\n]+)/);
		alert(error_message);
	}
	// 正常的内容填充到指定的容器
	else {
		$(container).empty();
		$(container).html(responseText);
		$(container).KTAnchor();
	}
}
$(document).ready(function(){
	// 用自定的回调函数
	$(document.body).KTAnchor(mySuccess);
});
</script>
```


##### `如果打算在移动端浏览器上使用`，建议如下

```html
<meta name="viewport" content="width=device-width,initial-scale=0.5,minimum-scale=0.5,maximum-scale=0.5,user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="format-detection" content="telephone=no"/>
<meta name="apple-mobile-web-app-status-bar-style" content="white" />
```

##### 初始化

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
