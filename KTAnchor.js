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

		KTAnchor: {

			// version
			version : "1.0.1",

			// set default response_container
			response_container : "#response-container",

			// set default paging_limit
			paging_limit : 30,

			// 分页时 url 怎么传  &p=1 或 /p/1
			paging_symbol : "&",

			// 初始化
			init: function(options){

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
			$(this).find("a[native!='yes']").each(function(key, anchor){
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
					if ($.isFunction(begin)) begin(container);
					// ajax 请求，并回调
					$.KTAjax(request_url, "GET", null,
						// 成功
						function(responseText){
							if ($.isFunction(success)) success(container, responseText);
						},
						// 错误
						function(XMLHttpRequest){
							if ($.isFunction(error)) error(container, XMLHttpRequest);
						},
						// 结束 ( 成功或失败后 )
						function(XMLHttpRequest){
							if ($.isFunction(complete)) complete(container, XMLHttpRequest);
						}
					);
					// 防止链接点击生效
					return false;
				});
			});
			return this;
		},

		KTForm : function(inputError, success, error, begin, complete) {
			// 查找 form，如果 native="yes" 则跳过
			$(this).find("form[native!='yes']").each(function(key, form){
				// jQuery 对象
				var $form = $(form);
				// 将 form 绑定 submit 时间
				$form.bind("submit", function(){
					// 检查表单
					if ($.isFunction(inputError) && !$(this).checkInputs(inputError)) {return false};
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
					if ($.isFunction(begin)) begin(container);
					// ajax 请求，并回调
					$.KTAjax(request_url, method, data,
						// 成功
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
							if ($.isFunction(inputError)) {inputError(input_elt, "Can not be empty")};
							field_ok = false;
							return false;
						}
					}
					// 请输入邮箱
					else if (/\/email:(.+)\//.test(validation)) {
						if (!/^([0-9A-Za-z\-_\.]+)@([0-9A-Za-z\-_\.]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g.test(input_value)){
							var match = validation.match(/\/email:(.+)\//);
							if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
					// 请输入密码，并不小于 8 位长
					else if (/\/password:(.+)\//.test(validation)) {
						if (input_value.length<8) {
							var match = validation.match(/\/password:(.+)\//);
							if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
					// 修改密码，要么留空，要么不小于8 位长
					else if (/\/edpassword:(.+)\//.test(validation)) {
						if (input_value.length>=1) {
							if (input_value.length<8) {
								var match = validation.match(/\/edpassword:(.+)\//);
								if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
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
						if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
					// 如果空就弹出后面的提示
					else if (/\/!empty:(.+)\//.test(validation)) {
						if (input_value.length<1) {
							var match = validation.match(/\/!empty:(.+)\//);
							if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
					// 手机号判断
					else if (/\/mobile:(.+)\//.test(validation)) {
						if (!/^1\d{10}$/g.test(input_value)){
							var match = validation.match(/\/mobile:(.+)\//);
							if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
					// 年-月-日 时间判断
					else if (/\/date:(.+)\//.test(validation)) {
						if (!/^[1|2]\d{3}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[1-2])$/g.test(input_value)){
							var match = validation.match(/\/date:(.+)\//);
							if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
					// 年-月-日 时:分:秒时间判断
					else if (/\/datetime:(.+)\//.test(validation)) {
						if (!/^[1|2]\d{3}\-(0[1-9]|1[0-2])\-(0[1-9]|[1-2][0-9]|3[1-2]) ([0|1][0-9]|2[0-4])\:([0-5][0-9])\:([0-5][0-9])$/g.test(input_value)){
							var match = validation.match(/\/datetime:(.+)\//);
							if ($.isFunction(inputError)) {inputError(input_elt, match[1])};
							field_ok = false;
							return false;
						}
					}
				}
			});
			return field_ok;
		},

		KTPaging : function() {
		},

		KTDropdown : function() {
		},

		KTTreemenu : function() {
		}
	});

})(jQuery);

// run
$.KTAnchor.init({response_container:"#response-container", paging_limit:30, paging_symbol:"&"});
