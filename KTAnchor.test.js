// -*- coding:utf-8;mode:javascript-mode;-*-

/*
 * KTAjax For JQuery 包含如下功能
 *
 * $.KTAjax.init({
 *    default-response-container : "response-container",
 *    default-paging-limit : 30,
 *    init-root-element : document
 * });
 *
 * onBegin : function() {}
 *
 * onComplete : function() {}
 *
 * onError : function() {}
 *
 * onSuccess : function(container, response)
 * {
 * }
 *
 * $(document).anchorKTAjax(onBegin, onComplete, onSuccess, onError);
 *
 * $(document).formKTAjax(onBegin, onComplete, onSuccess, onError);
 *
 * 1、<a href="" pushstate="no" container="#load-response" native="yes" confirm="确认要删除此项 ？">DELETE</a>
 *    将指定节点里的 <A> tag 统一绑定为 ajax 请求，并完成页面的 pushstate
 *    pushstate 选填  当 pushstate 设置为 no，不会做 window.history.pushstate
 *    container 选填  指定 response 会填充到哪个节点，默认尝试填充到 #response-container
 *    native  选填  如果值为 yes 或 1 ，这个节点不会绑定事件
 *    confirm  选填  点击会弹出一个 window.confirm ，点击 确认后，才会发送请求
 *    注: 当 href="javascript:..." 时，相当于设置了 native="yes"
 *
 * 2、将指定节点里的 <FORM> tag 统一绑定为 ajax 请求，
 *    当 method="get" 时会 window.history.pushstate
 *    container 选填  指定 response 会填充到哪个节点，默认尝试填充到 #response-container
 *    native  选填  如果值为 yes 或 1 ，这个节点不会绑定事件
 *
 * 3、<div class="paging-bar" total="" current="" limit="" request-url="" response-container="" pushstate=""></TAG>
 *    <div class="paging-bar" 符合 $("div.paging-bar") 会尝试
 *    tatal 必填，总共有多少条记录数
 *    current 必填，当前从第几条记录开始
 *    limit 选填，每页多少条记录，默认是 30
 *    request-url 选填，如果此项有填，那么不会从 windown.location.href 获取路径了
 *    response-container 选填，指定 response 填充的节点，默认填充到 #response-container
 *    pushstate 选填，设置为 no 时，不会做 window.history.pushstate，需要和 request-url 配合使用
 *
 *
 */
(function($){

	$.extend({

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
		KTAjax: function(url, method, data, success, error, begin, complete)
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
				"headers" : {"Ajax-Request":"jQuery.KTAjaxRequest " + this.version},
				"success" : function(responseText) {
					if ($.isFunction(success)) success(responseText);
				},
				"error" : function(XMLHttpRequest) {
					if ($.isFunction(error)) error(XMLHttpRequest);
				},
				"beforeSend" : function(XMLHttpRequest) {
					if ($.isFunction(begin)) begin(XMLHttpRequest);
				},
				"complete" : function(XMLHttpRequest) {
					if ($.isFunction(complete)) complete(XMLHttpRequest);
				}
			});
		}
	});

	$.fn.extend({

		KTAnchor : function() {
			// 取得 某文档下 所有没有被标注为原生的 anchor
			$(elt).find("a[native!='yes']").each(function(key, anchor){
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
					// 如果有启动时的回调方法
					if ($.isFunction(onBegin)){onBegin()};
					// 获取要请求的地址
					var request_url = $anchor.attr("href");
					// 获取当前的地址
					var request_ref = window.location.href;
					// 如果设置了  <a pushstat="no" ... > 那么不做 url pushStat
					if (typeof($anchor.attr("pushstate"))=="undefined" || $anchor.attr("pushstate")!="no") {
						window.history.pushState(null, "", request_url);
					}
					var container = $.KTAjax.response_container;
					if (typeof($anchor.attr("container"))!="undefined" && $anchor.attr("container").length>1) {
						container = $anchor.attr("container");
					}
					// ajax 请求，并回调
					$.KTAjax.asyncRequest(request_url, "GET", null, false, false,
						function(responseText){
							if ($.isFunction(onSuccess)) onSuccess(container, responseText);
						},
						// 错误
						function(XMLHttpRequest){
							if ($.isFunction(onError)) onError(container, XMLHttpRequest);
						},
						// 结束 ( 成功或失败后 )
						function(XMLHttpRequest){
							if ($.isFunction(onComplete)) onComplete(container, XMLHttpRequest);
						}
					);
					// 防止链接点击生效
					return false;
				});
			});
			return $(elt);
		},

		KTForm : function() {
		},

		KTPaging : function() {
		},

		KTDropdown : function() {
		},

		KTTreemenu : function() {
		}
	});

	$.extend({

		KTAnchor: {

			// version
			version : "1.0.1",

			// set default response_container
			response_container : "#response-container",

			// set default paging_limit
			paging_limit : 30,

			// 分页时 url 怎么传  &p=1 或 /p/1
			paging_symbol : "&",

			// 判断节点是否存在
			isElement: function(elt) {
				return ($(elt).length>=1) ? true : false;
			},

			// 输出日志
			log: function(){
				if (window.console && window.console.log && arguments.length>=1){
					window.console.log("arguments.length : " + arguments.length);
					for (var ii=0; ii<arguments.length; ii++){
						window.console.log(arguments[ii]);
					}
				}
			},

			// 初始化
			init: function(options){

				// 防止一个页面内重复初始化
				if ($.isFunction($.fn["anchorKTAjax"])){return}

				// init response_container
				if (typeof(options.response_container)=="string") {
					this.response_container = options.response_container;
				}

				// init paging_limit
				if (typeof(options.paging_limit)=="number") {
					this.paging_limit = options.paging_limit;
				}

				// init paging_limit
				if (typeof(options.paging_symbol)=="string") {
					this.paging_symbol = options.paging_symbol;
				}

				// extend $.fn
				$.fn.extend({
					// 下拉菜单
					dropdownKTAjax: function(){
						return $.KTAjax.dropdownKTAjax(this);
					},
					// 绑定 <a>
					pagingKTAjax: function() {
						return $.KTAjax.pagingKTAjax(this);
					},
					// 绑定 <a>
					anchorKTAjax: function(onSuccess, onError, onBegin, onComplete) {
						return $.KTAjax.anchorKTAjax(this, onSuccess, onError, onBegin, onComplete);
					},
					// 绑定 <form>
					formKTAjax: function(onCheckError, onSuccess, onError, onBegin, onComplete) {
						return $.KTAjax.formKTAjax(this, onCheckError, onSuccess, onError, onBegin, onComplete);
					},
					// 表单验证
					checkInput: function(onCheckError) {
						return $.KTAjax.checkInput(this, onCheckError);
					}
				});
			},

			// 封装的网络请求
			asyncRequest:function(request_url, request_method, request_data, content_type, process_data, onSuccess, onError, onComplete) {
				// 停止之间的 ajax 请求
				if (typeof(window.currentAjax)=="object") {
					try {
						window.currentAjax.abort();
					}catch(e){}
				}
				window.currentAjax = $.ajax({
					"url"  : request_url,
					"type" : request_method,
					"data" : request_data,
					"contentType" : content_type,
					"processData" : process_data,
					"headers" : {"Ajax-Request":"jQuery.KTAjax " + this.version},
					"success" : function(responseText) {
						if ($.isFunction(onSuccess)) onSuccess(responseText);
					},
					"error" : function(XMLHttpRequest) {
						if ($.isFunction(onError)) onError(XMLHttpRequest);
					},
					"complete" : function(XMLHttpRequest) {
						if ($.isFunction(onComplete)) onComplete(XMLHttpRequest);
					}
				});
			},

			// 处理 elt 内的 <div class="ktajax-pagingbar">
			pagingKTAjax: function(elt)
			{
				$(elt).find(".ktajax-pagingbar").each(function(key, pagingbar){
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
						var p = 1 + ( page_list[ii]-1 ) * limit;
						// get href
						if (paging_symbol=="/") {
							var href = request_url.replace(/\/p\/[0-9]+/, "")+"/p/"+p;
						}
						else {
							var href = request_url.replace(/[\?\&]p=[0-9]+/, "");
							href = (/\?/.test(href)) ? href+"&p="+p : href+"?p="+p;
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
				return $(elt);
			},

			anchorKTAjax: function(elt, onSuccess, onError, onBegin, onComplete)
			{
				// 取得 某文档下 所有没有被标注为原生的 anchor
				$(elt).find("a[native!='yes']").each(function(key, anchor){
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
						// 如果有启动时的回调方法
						if ($.isFunction(onBegin)){onBegin()};
						// 获取要请求的地址
						var request_url = $anchor.attr("href");
						// 获取当前的地址
						var request_ref = window.location.href;
						// 如果设置了  <a pushstat="no" ... > 那么不做 url pushStat
						if (typeof($anchor.attr("pushstate"))=="undefined" || $anchor.attr("pushstate")!="no") {
							window.history.pushState(null, "", request_url);
						}
						var container = $.KTAjax.response_container;
						if (typeof($anchor.attr("container"))!="undefined" && $anchor.attr("container").length>1) {
							container = $anchor.attr("container");
						}
						// ajax 请求，并回调
						$.KTAjax.asyncRequest(request_url, "GET", null, false, false,
							function(responseText){
								if ($.isFunction(onSuccess)) onSuccess(container, responseText);
							},
							// 错误
							function(XMLHttpRequest){
								if ($.isFunction(onError)) onError(container, XMLHttpRequest);
							},
							// 结束 ( 成功或失败后 )
							function(XMLHttpRequest){
								if ($.isFunction(onComplete)) onComplete(container, XMLHttpRequest);
							}
						);
						// 防止链接点击生效
						return false;
					});
				});
				return $(elt);
			},

			formKTAjax: function(elt, onCheckError, onSuccess, onError, onBegin, onComplete)
			{
				// 查找 form，如果 native="yes" 则跳过
				$(elt).find("form[native!='yes']").each(function(key, form){
					// jQuery 对象
					var $form = $(form);
					// 将 form 绑定 submit 时间
					$form.bind("submit", function(){
						// 检查表单
						if ($.isFunction(onCheckError) && !$(this).checkInput(onCheckError)) {return false};
						// 如果有启动时的回调方法
						if ($.isFunction(onBegin)){onBegin()};
						// 获取 url
						var request_url = $form.attr("action");
						// 默认是 Form method 是 POST
						var method = "POST";
						// 获取表单数据
						var data = new FormData(this);
						// 获取返回数据将填充哪个节点
						var container = $.KTAjax.response_container;
						if (typeof($form.attr("container"))!="undefined" && $form.attr("container").length>1) {
							container = $form.attr("container");
						}
						// ajax 请求，并回调
						$.KTAjax.asyncRequest(request_url, method, data, false, false,
							function(responseText){
								if ($.isFunction(onSuccess)) onSuccess(container, responseText);
							},
							// 错误
							function(XMLHttpRequest){
								if ($.isFunction(onError)) onError(container, XMLHttpRequest);
							},
							// 结束 ( 成功或失败后 )
							function(XMLHttpRequest){
								if ($.isFunction(onComplete)) onComplete(container, XMLHttpRequest);
							}
						);
						// 禁止表单继续提交
						return false;
					});
				});
				return $(elt);
			},

			// 检查表单
			checkInput: function(form, onCheckError)
			{
				var field_ok = true;
				$(form).find("input").each(function(key, input_elt){
					var validation = $(input_elt).attr("validation");
					if ($.type(validation)=="string" && validation.length>=1) {
						var input_value = $(input_elt).val();
						// 不能为空
						if (validation=="/!empty/") {
							if (input_value.length<1) {
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, "Can not be empty")};
								field_ok = false;
								return false;
							}
						}
						// 请输入邮箱
						else if (/\/email:(.+)\//.test(validation)) {
							if (!/^([0-9A-Za-z\-_\.]+)@([0-9A-Za-z\-_\.]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g.test(input_value)){
								var match = validation.match(/\/email:(.+)\//);
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
						// 请输入密码，并不小于 8 位长
						else if (/\/password:(.+)\//.test(validation)) {
							if (input_value.length<8) {
								var match = validation.match(/\/password:(.+)\//);
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
						// 修改密码，要么留空，要么不小于8 位长
						else if (/\/edpassword:(.+)\//.test(validation)) {
							if (input_value.length>=1) {
								if (input_value.length<8) {
									var match = validation.match(/\/edpassword:(.+)\//);
									if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
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
							if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
						// 如果空就弹出后面的提示
						else if (/\/!empty:(.+)\//.test(validation)) {
							if (input_value.length<1) {
								var match = validation.match(/\/!empty:(.+)\//);
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
						// 手机号判断
						else if (/\/mobile:(.+)\//.test(validation)) {
							if (!/^1\d{10}$/g.test(input_value)){
								var match = validation.match(/\/mobile:(.+)\//);
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
						// 年-月-日 时间判断
						else if (/\/date:(.+)\//.test(validation)) {
							if (!/^[1|2]\d{3}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[1-2])$/g.test(input_value)){
								var match = validation.match(/\/date:(.+)\//);
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
						// 年-月-日 时:分:秒时间判断
						else if (/\/datetime:(.+)\//.test(validation)) {
							if (!/^[1|2]\d{3}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[1-2]) ([0|1][0-9]|2[0-4])\:([0-5][0-9])\:([0-5][0-9])$/g.test(input_value)){
								var match = validation.match(/\/datetime:(.+)\//);
								if ($.isFunction(onCheckError)) {onCheckError(input_elt, match[1])};
								field_ok = false;
								return false;
							}
						}
					}
				});
				return field_ok;
			},

			dropdownKTAjax: function(elt)
			{
				$(elt).find(".ktajax-pagingbar").each(function(key, pagingbar){
				});
			}
		}
	});
})(jQuery);

// run
$.KTAjax.init({response_container:"#response-container", paging_limit:30, paging_symbol:"/"});
