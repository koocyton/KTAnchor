# KTAnchor

KTAnchor is a Pjax LIB on JQuery, And there are more extensions

KTAnchor 是一个基于 jQuery 的 Pjax 库，你可以单独用他的 Pjax 部分，也可以用其他扩充的功能

Next is three demo page .

### web application : https://wat.doopp.com/webapp.html

### admin system : https://wat.doopp.com/manager.html

### account login : https://wat.doopp.com/login.html

### 使用
``` html
	<script>
	$(document).ready(function(){
		$(document.body).KTLoader();
	});
	</script>
```

### default init / 默认的参数初始化，已经在加载 JS 时完成，你可以再次调用 init 来设置你的环境

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

### 如可以用下面的办法，将分页的参数通过 /pn=... 来传递 而不是 默认的额 ?cc=...
以适合你的 write 环境

``` javascript
$.KTAnchor.init({
	paging_symbol: "/pn"
});
```
