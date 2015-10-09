(function($){

	$.extend({

		KTAnchor: {

			// version
			version : "1.0.1",

			// ajax : set default response_container
			response_container : "#response-container",

			// paging : set default paging_container
			paging_container : "#paging-container",

			// paging : set default paging_limit
			paging_limit : 30,

			// paging : the paging url parment ,  &.. or /..
			paging_symbol : "&cc",

			/* init parment
			 *
			 * options.response_container
			 * options.paging_limit
			 * options.paging_symbol
			 */
			init: function(options){

				// init response_container
				if (typeof(options.response_container)=="string") {
					this.response_container = options.response_container;
				}
				// init paging_limit
				if (typeof(options.paging_limit)=="number" && options.paging_limit>=1) {
					this.paging_limit = options.paging_limit;
				}
				// init paging_symbol
				if (typeof(options.paging_symbol)=="string" && /[\/|&]\w+/.test(options.paging_symbol)) {
					this.paging_symbol = options.paging_symbol;
				}
				// init paging_container
				if (typeof(options.paging_container)=="string") {
					this.paging_container = options.paging_container;
				}
				// init dropdown_container
				if (typeof(options.dropdown_container)=="string") {
					this.dropdown_container = options.dropdown_container;
				}
			},

			hiddenDropdown: function(){

					$(".dropdown-toggle").next().css("display", "none");
					$(document.body).unbind("click", $.gii.hiddenDropdown);
			},

			inputError: function(input, message){
				$.KTLog("JQuery.KTAnchor.inputError : " + message, input);
			},

			success: function(container, responseText){

				// 举例：如果想输入一个脚本的处理方式
				if (/^<script/.test(responseText)) {
					$(responseText).appendTo(container).delay(800).remove();
				}
				// 举例：自定义的匹配处理
				else if (/\[exception-message\:.+\] => ([^\n]+)/.test(responseText)) {
					var exception_message = responseText.match(/\[exception-message\:.+\] => ([^\n]+)/);
					$.KTLog(exception_message);
				}
				// 请求到的文本
				else {
					// 填充
					$(container).empty();
					$(container).html(responseText);
					// 填充后将容器内的节点遍历，并绑定符合条件的 <a> 和  <form>
					$(container).KTAnchor($.KTAnchor.success, $.KTAnchor.error, $.KTAnchor.begin, $.KTAnchor.complete);
					$(container).KTForm($.KTAnchor.inputError, $.KTAnchor.success, $.KTAnchor.error, $.KTAnchor.begin, $.KTAnchor.complete);
					$(container).KTPaging();
					$(container).KTDropdown();
				}
			},

			error: function(container, XMLHttpRequest){
				$.KTLog("JQuery.KTAnchor.error : " + container);
			},

			begin: function(){
				$.KTLog("JQuery.KTAnchor.begin");
			},

			complete: function(container, XMLHttpRequest){
				$.KTLog("JQuery.KTAnchor.complete : " + container);
			}
		},

		// print_r arguments
		KTLog: function(){
			if (window.console && window.console.log && arguments.length>=1){
				window.console.log("arguments.length : " + arguments.length);
				for (var ii=0; ii<arguments.length; ii++){
					window.console.log(arguments[ii]);
				}
			}
		},

		// http request function
		KTAjax: function(url, method, data, success, error, complete)
		{
			// stop before one ajax request
			if (typeof(window.currentKTAjax)=="object") {
				try{window.currentKTAjax.abort()}catch(e){;}
			}
			// set ajax request
			window.currentKTAjax = $.ajax({
				"url"  : url,
				"type" : method,
				"data" : data,
				"contentType" : false,
				"processData" : false,
				"headers" : {"Ajax-Request":"jQuery.KTAjaxRequest " + $.KTAnchor.version},
				"success" : function(responseText) {
					if ($.isFunction(success)) success(responseText);
				},
				"error" : function(XMLHttpRequest) {
					if ($.isFunction(error)) error(XMLHttpRequest);
				},
				"complete" : function(XMLHttpRequest) {
					if ($.isFunction(complete)) complete(XMLHttpRequest);
				}
			});
		}
	});

	$.fn.extend({

		KTAnchor : function(success, error, begin, complete) {
			// 取得 某文档下 所有没有被标注为原生的 anchor
			this.find("a[native!='yes']").each(function(key, anchor){
				// jQuery 对象
				var $anchor = $(anchor);
				// 如果是 <a href="javascript:..." 也是不能去绑定
				if (/^javascript\:/.test($anchor.attr("href"))) return;
				// 绑定点击事件
				$anchor.bind("click", function(){
					// 如果有 confirm 属性
					if (typeof($anchor.attr("confirm"))!="undefined" && $anchor.attr("confirm").length>1) {
						if (!confirm($anchor.attr("confirm"))) {
							return false;
						}
					}
					// 聚焦会使得点击处框上虚线
					anchor.blur();
					// 获取要请求的地址
					var request_url = $anchor.attr("href");
					// 获取当前的地址
					var request_ref = window.location.href;
					// 如果设置了  <a pushstat="no" ... > 那么不做 url pushStat
					if (typeof($anchor.attr("pushstate"))=="undefined" || $anchor.attr("pushstate")!="no") {
						window.history.pushState(null, "", request_url);
					}
					var container = $.KTAnchor.response_container;
					if (typeof($anchor.attr("container"))!="undefined" && $anchor.attr("container").length>1) {
						container = $anchor.attr("container");
					}
					// 开始
					$.isFunction(begin) ? begin() : $.KTAnchor.begin();
					// ajax 请求，并回调
					$.KTAjax(request_url, "GET", null,
						// 成功
						function(responseText){
							$.isFunction(success) ? success(container, responseText) : $.KTAnchor.success(container, responseText);
						},
						// 错误
						function(XMLHttpRequest){
							$.isFunction(error) ? error(container, XMLHttpRequest) : $.KTAnchor.error(container, responseText);
						},
						// 结束 ( 成功或失败后 )
						function(XMLHttpRequest){
							$.isFunction(complete) ? complete(container, XMLHttpRequest) : $.KTAnchor.complete(container, responseText);
						}
					);
					// 防止链接点击生效
					return false;
				});
			});
			// 返回 JQuery 对象
			return this;
		},

		KTForm : function(inputError, success, error, begin, complete) {
			// 查找 form，如果 native="yes" 则跳过
			this.find("form[native!='yes']").each(function(key, form){
				// jQuery 对象
				var $form = $(form);
				// 将 form 绑定 submit 时间
				$form.bind("submit", function(){
					// 检查表单
					// 自定义的错误处理
					if ($.isFunction(inputError)) {
						 if (!$(this).checkInputs(inputError)) return false;
					}
					// 默认的错误处理，会输出到浏览器的控制台
					else {
						 if (!$(this).checkInputs($.KTAnchor.inputError)) return false;
					}
					// 获取 url
					var request_url = $form.attr("action");
					// 默认是 Form method 是 POST
					var method = "POST";
					// 获取表单数据
					var data = new FormData(this);
					// 获取返回数据将填充哪个节点
					var container = $.KTAnchor.response_container;
					if (typeof($form.attr("container"))!="undefined" && $form.attr("container").length>1) {
						container = $form.attr("container");
					}
					// 开始
					$.isFunction(begin) ? begin() : $.KTAnchor.begin();
					// ajax 请求，并回调
					$.KTAjax(request_url, method, data,
						// 成功
						function(responseText){
							$.isFunction(success) ? success(container, responseText) : $.KTAnchor.success(container, responseText);
						},
						// 错误
						function(XMLHttpRequest){
							$.isFunction(error) ? error(container, XMLHttpRequest) : $.KTAnchor.error(container, responseText);
						},
						// 结束 ( 成功或失败后 )
						function(XMLHttpRequest){
							$.isFunction(complete) ? complete(container, XMLHttpRequest) : $.KTAnchor.complete(container, responseText);
						}
					);
					// 禁止表单继续提交
					return false;
				});
			});
			// 返回 JQuery 对象
			return this;
		},

		checkInputs : function(inputError) {
			var field_ok = true;
			$(this).find("input").each(function(key, input_elt){
				var validation = $(input_elt).attr("validation");
				if (typeof(validation)=="string" && validation.length>=1) {
					var input_value = $(input_elt).val();
					// 不能为空
					if (validation=="/!empty/") {
						if (input_value.length<1) {
							inputError(input_elt, "Can not be empty");
							field_ok = false;
							return false;
						}
					}
					// 请输入邮箱
					else if (/\/email:(.+)\//.test(validation)) {
						if (!/^([0-9A-Za-z\-_\.]+)@([0-9A-Za-z\-_\.]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g.test(input_value)){
							var match = validation.match(/\/email:(.+)\//);
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
					// 请输入密码，并不小于 8 位长
					else if (/\/password:(.+)\//.test(validation)) {
						if (input_value.length<8) {
							var match = validation.match(/\/password:(.+)\//);
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
					// 修改密码，要么留空，要么不小于8 位长
					else if (/\/edpassword:(.+)\//.test(validation)) {
						if (input_value.length>=1) {
							if (input_value.length<8) {
								var match = validation.match(/\/edpassword:(.+)\//);
								inputError(input_elt, match[1]);
								field_ok = false;
								return false;
							}
						}
					}
					// 重复输入密码要和前面输入的密码一样
					else if (/\/repassword:(.+):(.+)\//.test(validation)) {
						var match = validation.match(/\/repassword:(.+):(.+)\//);
						var password_value = $(form_elt).find("input[name="+match[1]+"]").val();
						if (password_value!=input_value) {
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
					// 如果空就弹出后面的提示
					else if (/\/!empty:(.+)\//.test(validation)) {
						if (input_value.length<1) {
							var match = validation.match(/\/!empty:(.+)\//);
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
					// 手机号判断
					else if (/\/mobile:(.+)\//.test(validation)) {
						if (!/^1\d{10}$/g.test(input_value)){
							var match = validation.match(/\/mobile:(.+)\//);
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
					// 年-月-日 时间判断
					else if (/\/date:(.+)\//.test(validation)) {
						if (!/^[1|2]\d{3}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[1-2])$/g.test(input_value)){
							var match = validation.match(/\/date:(.+)\//);
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
					// 年-月-日 时:分:秒时间判断
					else if (/\/datetime:(.+)\//.test(validation)) {
						if (!/^[1|2]\d{3}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[1-2]) ([0|1][0-9]|2[0-4])\:([0-5][0-9])\:([0-5][0-9])$/g.test(input_value)){
							var match = validation.match(/\/datetime:(.+)\//);
							inputError(input_elt, match[1]);
							field_ok = false;
							return false;
						}
					}
				}
			});
			return field_ok;
		},

		KTPaging : function() {
			// 从配置中获取参数配置
			var container = $.KTAnchor.paging_container;
			// 开始查找
			this.find(container).each(function(key, pagingbar){
				// jQuery 对象
				var $pagingbar = $(pagingbar);
				// 获取主要的数据
				var tatal = 0 + $pagingbar.attr("tatal");
				var current = 0 + $pagingbar.attr("current");
				var limit = $pagingbar.attr("limit");
				if (typeof(limit)=="undefined") limit = $.KTAjax.paging_limit;
				// 最大页码 当前页码
				var max_page = Math.ceil(tatal / limit);
				var current_page = Math.ceil(current / limit);
				// 分页最长显示 7 个
				var page_list = [1,2,3,4,5,6,7];
				// 数组最后一个单元，不能大于 max_page
				if (max_page<=7) {
					page_list = page_list.slice(0, max_page);
				}
				else {
					// 如果当前页前 3 页
					if (current_page-1<=3) {
						page_list = [1,2,3,4,5,6,"...",max_page];
					}
					// 如果当前页为后 3 页
					else if (max_page-current_page<=3) {
						page_list = [1,"...",max_page-5,max_page-4,max_page-3,max_page-2,max_page-1,max_page];
					}
					// 当前页，离最大，最小，都超过 2 个单位
					else {
						page_list = [1,"...",current_page-2,current_page-1,current_page,current_page+1,current_page+2,"...",max_page];
					}
				}
				// class
				var class_name = $pagingbar.attr("paging_class");
				// request url
				var request_url = $pagingbar.attr("request_url");
				// get location
				if (typeof(request_url)=="undefined") {
					request_url = window.location.href;
				}
				// 分页参 连接 URL 的符号
				var paging_symbol = $pagingbar.attr("paging_symbol");
				if (typeof(paging_symbol)=="undefined") {
					paging_symbol = $.KTAjax.paging_symbol;
				}
				// 是否发生 pushstate
				var pushstate = $pagingbar.attr("pushstate");
				var pushstate_html = "";
				if (typeof(pushstate)=="string" && pushstate=="no") {
					pushstate_html = "pushstate=\"no\"";
				}
				// 输出页面
				var paging_html = "";
				for(var ii=0; ii<page_list.length; ii++) {
					var cc = 1 + ( page_list[ii]-1 ) * limit;
					// get href
					if (paging_symbol=="/") {
						var href = request_url.replace(/\/p\/[0-9]+/, "")+"/p/"+cc;
					}
					else {
						var href = request_url.replace(/[\?\&]p=[0-9]+/, "");
						href = (/\?/.test(href)) ? href+"&p="+cc : href+"?p="+cc;
					}
					// 组织 html
					if (page_list[ii]=="...") {
						paging_html += "<span class=\""+class_name+"\" style=\"border:0;\">"+page_list[ii]+"</span>";
					}
					else if (page_list[ii]==current_page){
						paging_html += "<a href=\""+href+"\" class=\""+class_name+"\" style=\"background-color:#aaa;color:#666;\" "+pushstate_html+">"+page_list[ii]+"</a>";
					}
					else {
						paging_html += "<a href=\""+href+"\" class=\""+class_name+"\" "+pushstate_html+">"+page_list[ii]+"</a>";
					}
				}
				$pagingbar.html(paging_html);
			});
			// 返回 JQuery 对象
			return this;
		},

		KTDropdown : function() {
			// 从配置中获取参数配置
			var container = $.KTAnchor.dropdown_container;
			// 开始查找
			this.find(container).each(function(key, dropdownbar){
				// 取节点
				var $click_elt = $(dropdownbar).children().first();
				// 已经绑定了 click 事件，重复执行，不会在同节点上反复绑定
				if ($click_elt.data("click")==true) return;
				// 取弹窗
				var $popup_elt = click_elt.next();
				// 绑定
				$click_elt.bind("click", function(e){
					// 不冒泡 ... ?
					e.stopPropagation();
					// 当前弹出窗关闭还是开启呢 ？
					var style_display = $popup_elt.css("display");
					// 如果本来下拉菜单已经弹出
					if (style_display=="none") {
						// 显示下拉菜单
						$popup_elt.css("display","block");
						// 绑定 document.click 事件
						$(document.body).bind("click", $.KTAnchor.hiddenDropdown);
						// 被点击的按钮不聚焦
						$click_elt.blur();
					}
					else {
						// 关闭下拉菜单
						$popup_elt.css("display","none");
						// 解绑 document.click 事件
						$(document.body).unbind("click", $.KTAnchor.hiddenDropdown);
					}
				});
				// 弹出窗不冒泡，避免上面的链接点了后，立刻窗口隐藏，有点怪怪的
				$popup_elt.bind("click", function(e){e.stopPropagation()});
				// 标注已经绑定了 click 事件，重复执行，不会在同节点上反复绑定
				$click_elt.data("click", true);
			});
			// 返回 JQuery 对象
			return this;
		}
	});

})(jQuery);

/* set KTAnchor default value */
$.KTAnchor.init({
	response_container: "#response-container", // Ajax, 设定默认 response 填充的区域
	paging_container: "#paging-container", // 分页，分页的容器
	paging_limit: 30, // 分页，默认每页 30 条记录
	paging_symbol: "&cc", // 分页，默认通过传统的 & 来分割，值通过 http.request.GET.cc 来传递
	dropdown_container: ".dropdown-container", // 弹出菜单，通过识别此节点，来绑定 下拉菜单的 事件
});
