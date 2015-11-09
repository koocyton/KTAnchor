(function($){

	var $ = jQuery;

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

			// 鼠标滚动的积累值
			wheel_delta : 0,

			// 如果是移动端浏览器
			mobile_browser : !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/)||!!navigator.userAgent.match(/AppleWebKit/),

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
				// init treemenu_container
				if (typeof(options.treemenu_container)=="string") {
					this.treemenu_container = options.treemenu_container;
				}
				// init mousewheel_container
				if (typeof(options.scroll_container)=="string") {
					this.scroll_container = options.scroll_container;
				}
			},

			hiddenDropdown: function(){
				$(document.body).find($.KTAnchor.dropdown_container).each(function(key, dropdown_bar){
					$(dropdown_bar).children().last().css("display", "none");
				});
				$(document.body).unbind("click", $.KTAnchor.hiddenDropdown);
			},

			showSlidMessage: function(message){
				if ($(".kt-message-pop").length==0) {
					$(document.body).append('<div class="shadow-3 radius-4 kt-message-pop"></div>');
				}
				$(".kt-message-pop").html(message);
				$(".kt-message-pop").css("bottom","-90px").css("display","block").animate({"bottom":"-5px"});
				$(".kt-message-pop").bind("click", function(ev){
					ev.stopPropagation();
				})
				$(document.body).bind("click touchend", $.KTAnchor.closeSlidMessage);
			},

			closeSlidMessage: function(){
				$('.kt-message-pop').animate({'bottom':'-90px'}, function(){
					$(".kt-message-pop").html("");
					$(".kt-message-pop").css("display","none");
					$(document.body).unbind("click touchend", $.KTAnchor.closeSlidMessage);
				});
			},

			inputError: function(input, message){
				// 关闭之间弹出的错误信息
				$(".input-error-pop").css("display", "none");
				// 获取 input , input 和 错误信息存放的容器，错误信息的层
				var $input = $(input);
				var $input_box = $input.parent().parent();
				var $error_pop = $input_box.find(".input-error-pop");
				// 如果错误信息层不存在，就创建
				if ($error_pop.length==0) {
					$input_box.append("<dd class=\"input-error-pop radius-4\"><b class=\"angle-up input-error-angle\"></b> &nbsp; "+message+"</dd>");
				}
				// 显示这个错误信息
				$error_pop.css("display", "block");
				$input.context.focus();

				if ($input.data("change")!=true) {
					$input.bind('input change blur',function(ev){
						if ($input_box.children(".input-error-pop").exist()) {
							$input_box.children(".input-error-pop").css("display", "none");
						}
					});
					$input.data("change", true);
				}
			},

			success: function(container, responseText){
				// $.KTLog("JQuery.KTAnchor.success : " + container, responseText);
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
					// 填充完后重新设定填充区域内的 KTLoader
					$(container).KTLoader();
					// 检查有无滚动条需要重置
					$(container).ktScrollReset();
				}
			},

			error: function(container, XMLHttpRequest){
				$.KTLog("JQuery.KTAnchor.error : " + container, XMLHttpRequest.responseText);
				$.KTAnchor.showSlidMessage("Error : " + XMLHttpRequest.status);
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

		// show request process
		showRequestProcess: function(now_process){
			now_process = (now_process+1) * 2;
			var full_process = $(".kt-request-progress").parent().width();
			$(".kt-request-progress").css({"width":now_process+"px","display":"block"});
			if (now_process<=full_process) {
				setTimeout(function(){$.showRequestProcess(now_process)}, 10);
			}
		},

		// http request function
		KTAjax: function(url, method, data, success, error, complete){
			// 如果没有进度条则创建一个
			if ($(".kt-request-progress").length==0) {
				$(document.body).append('<div class="kt-request-progress"></div>');
			}
			this.showRequestProcess(0);
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
				"headers" : {"Ajax-Request":"jQuery.KTAjax " + $.KTAnchor.version},
				"success" : function(responseText) {
					if ($.isFunction(success)) success(responseText);
				},
				"error" : function(XMLHttpRequest) {
					if ($.isFunction(error)) error(XMLHttpRequest);
				},
				"complete" : function(XMLHttpRequest) {
					$(".kt-request-progress").delay(800).fadeOut("fast");
					if ($.isFunction(complete)) complete(XMLHttpRequest);
				}
			});
		},

		KTTreeMenuHTML: {

			getMenuItemHtml: function(menu_item, menu_level) {
				var pushstate_html = "";
				if (typeof(menu_item.pushstate)=="string" && menu_item.pushstate=="no") {
					pushstate_html = "pushstate=\"no\"";
				}
				return '<a href="'+menu_item.href+'" '+pushstate_html+' class="tree-menu tree-menu-'+menu_level+'"><div>'+menu_item.text+'</div></a>';
			},

			getMenuFolderHtml: function(menu_item, menu_level) {
				if (menu_level=="0") {
					return '<a href="javascript:;" class="tree-menu tree-menu-0"><div>'+menu_item.text+'</div></a>';
				}
				else if (menu_level=="1") {
					var toggle_class = menu_item.open ? "tree-menu-open" : "tree-menu-close" ;
					return '<a href="javascript:;" class="tree-menu tree-menu-1 '+toggle_class+'"><div>'+menu_item.text+'</div></a>';
				}
			},

			getMenuHtml: function(menus_data, menu_level) {
				// 初始化 html
				var menu_html = "";
				// 初始化菜单等级
				var menu_level = (typeof(menu_level)!="number") ? 0 : menu_level;
				// 开始循环
				$.each(menus_data, function(name, menu_data) {
					// 如果有子菜单
					if ($.isArray(menu_data.menus)) {
						menu_html += $.KTTreeMenuHTML.getMenuFolderHtml(menu_data, menu_level);
						if (menu_level==0) {
							menu_html += '<div class="menu_layout" style="display: block;">'+$.KTTreeMenuHTML.getMenuHtml(menu_data.menus, 1+menu_level)+'</div>';
						}
						else if (menu_level==1) {
							var display = (typeof(menu_data.open)!="undefined" && menu_data.open==true) ? "block" : "none" ;
							menu_html += '<div class="menu_layout" style="display: '+display+';">'+$.KTTreeMenuHTML.getMenuHtml(menu_data.menus, 1+menu_level)+'</div>';
						}
					}
					// 如果没有子菜单
					else if (typeof(menu_data.href)=="string") {
						menu_html += $.KTTreeMenuHTML.getMenuItemHtml(menu_data, menu_level);
					}
				});
				return (menu_level==0) ? '<div class="'+$.KTAnchor.treemenu_container.substr(1)+'">'+menu_html+'</div>' : menu_html;
				// return menu_html;
			}
		}
	});

	$.fn.extend({

		exist: function() {
			return ($(this).length>=1) ? true : false;
		},

		actionApplication: function(CallFunction) {
			var icon = $(this).find("img");
			CallFunction = $.isFunction(CallFunction) ? CallFunction : $.noop();
			icon.animate({top:'-20px'}, 230).animate({top:'0px'}, 130).animate({top: '-10px'}, 100, "", CallFunction).animate({top:'0px'}, 100).animate({top: '-5px'}, 50).animate({top:'0px'},  50);
		},

		KTLoader: function() {
			// 加载
			$(this).KTPaging().KTTreeMenu().KTAnchor().KTForm().KTDropDown().KTMouseWheel();
		},

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
					// 如果设置了  <a pushstate="no" ... > 那么不做 url pushState
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
							$.isFunction(error) ? error(container, XMLHttpRequest) : $.KTAnchor.error(container, XMLHttpRequest);
						},
						// 结束 ( 成功或失败后 )
						function(XMLHttpRequest){
							$.isFunction(complete) ? complete(container, XMLHttpRequest) : $.KTAnchor.complete(container, XMLHttpRequest);
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
							$.isFunction(error) ? error(container, XMLHttpRequest) : $.KTAnchor.error(container, XMLHttpRequest);
						},
						// 结束 ( 成功或失败后 )
						function(XMLHttpRequest){
							$.isFunction(complete) ? complete(container, XMLHttpRequest) : $.KTAnchor.complete(container, XMLHttpRequest);
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
			this.find(container).each(function(key, paging_bar){
				// jQuery 对象
				var $paging_elt = $(paging_bar);
				// 获取主要的数据
				var tatal = 0 + $paging_elt.attr("tatal");
				var current = 0 + $paging_elt.attr("current");
				var limit = $paging_elt.attr("limit");
				if (typeof(limit)=="undefined") limit = $.KTAnchor.paging_limit;
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
				// class name
				var class_name = $paging_elt.attr("paging_class");
				if (typeof(class_name)=="undefined") {
					class_name = "paging-anchor radius-4";
				}
				// current class name
				var current_class_name = $paging_elt.attr("current_paging_class");
				if (typeof(current_class_name)=="undefined") {
					current_class_name = "paging-current-anchor radius-4";
				}
				// request url
				var request_url = $paging_elt.attr("request_url");
				if (typeof(request_url)=="undefined") {
					request_url = window.location.href;
				}
				// 分页参 连接 URL 的符号
				var paging_symbol = $paging_elt.attr("paging_symbol");
				if (!/[\&|\/]\w+/.test(paging_symbol)) {
					paging_symbol1 = $.KTAnchor.paging_symbol.substr(0, 1);
					paging_symbol2 = $.KTAnchor.paging_symbol.substr(1);
				}
				// 是否发生 pushstate
				var pushstate = $paging_elt.attr("pushstate");
				var pushstate_html = "";
				if (typeof(pushstate)=="string" && pushstate=="no") {
					pushstate_html = "pushstate=\"no\"";
				}
				// 输出页面
				var paging_html = "";
				for(var ii=0; ii<page_list.length; ii++) {
					var m = 1 + ( page_list[ii]-1 ) * limit;
					// $.KTLog(/\/p\/[0-9]+/, new RegExp("\/"+paging_symbol2+"\/[0-9]+"), /[\?\&]p=[0-9]+/, new RegExp("[\\?\\&]"+paging_symbol2+"=[0-9]+"));
					// get href
					if (paging_symbol1=="/") {
						var href = request_url.replace(new RegExp("\/"+paging_symbol2+"\/[0-9]+"), "")+"/"+paging_symbol2+"/"+m;
					}
					else {
						var href = request_url.replace(new RegExp("[\\?\\&]"+paging_symbol2+"=[0-9]+"), "");
						href = (/\?/.test(href)) ? href+"&"+paging_symbol2+"="+m : href+"?"+paging_symbol2+"="+m;
					}
					// 组织 html
					if (page_list[ii]=="...") {
						paging_html += "<span class=\""+class_name+"\" style=\"border:0;\">"+page_list[ii]+"</span>";
					}
					else if (page_list[ii]==current_page){
						paging_html += "<a href=\""+href+"\" class=\""+class_name+" "+current_class_name+"\" "+pushstate_html+">"+page_list[ii]+"</a>";
					}
					else {
						paging_html += "<a href=\""+href+"\" class=\""+class_name+"\" "+pushstate_html+">"+page_list[ii]+"</a>";
					}
				}
				$paging_elt.html(paging_html);
			});
			// 返回 JQuery 对象
			return this;
		},

		KTTreeMenu : function(){
			//  从配置中获取参数
			var container = $.KTAnchor.treemenu_container;
			// 开始遍历
			this.find(container).each(function(key, treemenu_elt){
				// 处理节点，绑定事件
				$(treemenu_elt).setMainMenuEvent();
			});
			return this;
		},

		setMainMenuEvent : function(){
			// 开始循环
			this.children("a").each(function(key, menu_elt) {
				// 取得一个节点
				var $menu_elt = $(menu_elt);
				// 取得下一个节点
				var $next_elt = $menu_elt.next("div");
				// 如果节点后有DIV，说明一个折叠菜单
				if ($next_elt.exist()) {
					// 绑定点击事件
					$menu_elt.bind("click", function() {
						// 打开菜单
						if ($next_elt.css("display")=="none") {
							$next_elt.css("display", "block");
							if ($menu_elt.hasClass("tree-menu-1")) $menu_elt.removeClass("tree-menu-close").addClass("tree-menu-open");
						}
						// 折叠菜单
						else {
							$next_elt.css("display", "none");
							if ($menu_elt.hasClass("tree-menu-1")) $menu_elt.removeClass("tree-menu-open").addClass("tree-menu-close");
						}
						// menu_elt 没错
						menu_elt.blur();
						return false;
					});
					// 循环的递归
					$next_elt.setMainMenuEvent();
				}
			});
		},

		KTDropDown : function() {
			// 从配置中获取参数配置
			var container = $.KTAnchor.dropdown_container;
			// 开始查找
			this.find(container).each(function(key, dropdown_bar){
				// 取节点
				var $click_elt = $(dropdown_bar).children().first();
				// 已经绑定了 click 事件，重复执行，不会在同节点上反复绑定
				if ($click_elt.data("click")==true) return;
				// 取弹窗
				var $popup_elt = $click_elt.next();
				// 绑定
				$click_elt.bind("click", function(e){
					// 不冒泡 ... ?
					e.stopPropagation();
					// 当前弹出窗关闭还是开启呢 ？
					var style_display = $popup_elt.css("display");
					// 先将弹出窗都关闭
					$(container).each(function(key, elt){
						$(elt).children().last().css("display", "none");
					});
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
				$popup_elt.bind("click", function(e){
					e.stopPropagation();
				});
				// 标注已经绑定了 click 事件，重复执行，不会在同节点上反复绑定
				$click_elt.data("click", true);
			});
			// 返回 JQuery 对象
			return this;
		},

		ktScrollReset : function(){
			var scroll_container = $(this).parent();
			// $.KTLog(scroll_container, $.KTAnchor.scroll_container.substr(1));
			if (scroll_container.hasClass($.KTAnchor.scroll_container.substr(1))) {
				// 如果是移动浏览器
				if ($.KTAnchor.mobile_browser==true) {
					scroll_container.scrollTop(0)
				}
				// 非移动浏览器
				else {
					scroll_container.children().css("top", "0px");
					scroll_container.find(".scroll-bar").css("top", "0px");
				}
			}
		},

		KTMouseWheel : function() {
			// 所有的自定义滚动条层
			var containers = this.find($.KTAnchor.scroll_container);
			// 查询匹配的节点
			containers.each(function(key, mousewheel_bar) {
				// 如果是移动的浏览器
				if ($.KTAnchor.mobile_browser==true) {
					// 绑定移动浏览器的滑动屏幕的事件
					// $(mousewheel_bar).bind("touchmove", function(ev){event.preventDefault();});
					$(mousewheel_bar).css({"overflow-y":"auto"});
				}
				else {
					// 初始化滚动条
					$(mousewheel_bar).css({"padding":"0 9px 0 0"}).append('<div class="scroll-floor"><dir class="scroll-bar radius-4"></div></div>');
					// 绑定滚动条拖动事件
					$(mousewheel_bar).ktScrollDrag();
					// 绑定滚轮事件
					$(mousewheel_bar).bind("mousewheel", function(ev, delta) {
						// 如果鼠标滚动的方向发生改变，就重初始化积累值
						if ((delta>0 && $.KTAnchor.wheel_delta<0) || (delta<0 && $.KTAnchor.wheel_delta>0)) {
							$.KTAnchor.wheel_delta = 0;
						}
						// 当滚轮移动一格时，既积累值正负移动一位，激活页面滚动
						if ($.KTAnchor.wheel_delta==0) {
							// 鼠标滚动，100 毫秒后，开始移动这个节点内的元素
							setTimeout($.fn.ktScrollSliding.bind(this), 20);
						}
						// 没有改变的话，就继续累积滚动值
						$.KTAnchor.wheel_delta = $.KTAnchor.wheel_delta + (delta*6);
					});
				}
			});

			// 调整窗口时时，
			$(window).bind("resize", function(){
				// 主内容的区域的高度，为浏览区域的高度，减去 40
				$("#left-container, #right-container").css("height", $(window).height()-40);
				// 如果不是移动的浏览器
				if ($.KTAnchor.mobile_browser==false) {
					// 窗口大小变化时调整滚动条的位置和高度
					containers.each(function(key, mousewheel_bar) {
						$(mousewheel_bar).ktScrollSliding();
					});
				}
			});
			// 手动触发一次
			$(window).trigger("resize");
		},

		// 滑动页面
		ktScrollSliding : function() {
			// 容器的高度
			var container_height = $(this).height();
			// 内容的高度container_height
			var content_height = 0;

			// 除去滚动条外的，滚动区域内的所有节点
			var content_childrens = [];
			// 除去滚动条外的，滚动区域内的所有节点
			var scroll_bar = $(this).find(".scroll-bar");

			// 一个索引
			var ii = 0;
			// 除去滚动条，滚动范围内的所有节点高度之和，是内容的高度
			$(this).children().each(function(key, children) {
				if ($(children).hasClass("scroll-floor")) {return;}
				content_height += $(children).height();
				ii = content_childrens.length;
				content_childrens[ii] = children;
			});
			content_childrens = $(content_childrens);

			/*
			 * 如果内容的高度 <= 容器的高度
			 * 滚动条 top 为 0，高度是 100%
			 * 滚动区节点的 top 为 0 , position 为 relative
			 */
			if (content_height<=container_height) {
				scroll_bar.css({"top":"0px", "height":"100%"});
				content_childrens.css({"top":"0px"})
			}
			else {
				var first_children = $(content_childrens[0]);
				var first_children_top = first_children.position().top;
				// 鼠标滚动越快，滑动越快，限定一个上限速度
				var drift_speed = Math.abs($.KTAnchor.wheel_delta)>9 ? 9 : Math.abs($.KTAnchor.wheel_delta);
				// 滑动的距离
				var children_drift = $.KTAnchor.wheel_delta>0 ? drift_speed*5 : drift_speed*-5;
				// 获取页面的 TOP
				first_children_top = first_children_top + children_drift;
				if (first_children_top>=0) {
					first_children_top = 0;
					// 到头了，不滚了
					$.KTAnchor.wheel_delta = 0;
				}
				else if (first_children_top<container_height - content_height) {
					first_children_top = container_height - content_height;
					// 到头了，不滚了
					$.KTAnchor.wheel_delta = 0;
				}
				content_childrens.css({"top":first_children_top + "px"});
				// 滚动条的长度
				var scroll_height = container_height / content_height * container_height;
				// 滚动条 top
				var scroll_top = -1*first_children_top/(content_height-container_height)*(container_height-scroll_height);
				scroll_bar.css({"top":scroll_top+"px", "height":scroll_height+"px"});
				// $.KTLog(scroll_height, scroll_top);

				// 如果积累滚动值已经用完
				if ($.KTAnchor.wheel_delta==0) {return null}
				// 移动次，将积累的滚动值减一
				$.KTAnchor.wheel_delta>0 ? $.KTAnchor.wheel_delta-- : $.KTAnchor.wheel_delta++;
				// 鼠标滚动，100 毫秒后，开始移动这个节点内的元素
				setTimeout($.fn.ktScrollSliding.bind(this), 26 - Math.abs($.KTAnchor.wheel_delta));
			}
		},

		ktScrollDrag : function() {
			// 容器另做一个实例
			var container = this;
			// 容器的高度
			var container_height = $(this).height();
			// 内容的高度container_height
			var content_height = 0;

			// 除去滚动条外的，滚动区域内的所有节点
			var content_childrens = [];
			// 除去滚动条外的，滚动区域内的所有节点
			var scroll_bar = $(this).find(".scroll-bar");

			// 一个索引
			var ii = 0;
			// 除去滚动条，滚动范围内的所有节点高度之和，是内容的高度
			$(this).children().each(function(key, children) {
				if ($(children).hasClass("scroll-floor")) {return;}
				content_height += $(children).height();
				ii = content_childrens.length;
				content_childrens[ii] = children;
			});
			content_childrens = $(content_childrens);


			// 设置鼠标拖动的事件
			$(scroll_bar).mousedown(function(ev) {

				container_height = $(container).height();
				content_height = 0;
				$(container).children().each(function(key, children) {
					if ($(children).hasClass("scroll-floor")) {return;}
					content_height += $(children).height();
				});

				// 鼠标按住滚动条时，滚动条的高度 和 鼠标的位置
				var begin_mouse_pagey = ev.pageY;
				var begin_scroll_top = $(scroll_bar).position().top;

				// 当鼠标在页面移动时
				$(window).mousemove(function(ev){

					// 拖动时，鼠标的位置和 新的滚动条的高度
					var now_mouse_pagey = ev.pageY;
					var now_scroll_top = begin_scroll_top + ( now_mouse_pagey - begin_mouse_pagey );

					// 滚动条框的高度，和滚动条的高度，差值是滚动条最远路径
					var scroll_height  = $(scroll_bar).height();

					// 设定滚动条的滑动范围
					if (now_scroll_top<=0) {
						now_scroll_top = 0;
					}
					else if (now_scroll_top>container_height-scroll_height) {
						now_scroll_top = container_height-scroll_height;
					}
					// 滚动条的高度
					scroll_bar.css("top", now_scroll_top + "px");
					// 内容的 top
					var children_top = -1*now_scroll_top/(container_height-scroll_height)*(content_height-container_height);
					content_childrens.css("top", children_top + "px");
					$.KTLog(container_height, scroll_height, content_height, children_top);
					return false;
				});
				$(window).mouseup(function(ev){
					$(window).unbind("mousemove");
					$(window).unbind("mouseup");
					return false;
				});
				return false;
			});
		}
	});

})(jQuery);

/* set KTAnchor default value */
$.KTAnchor.init({
	response_container: ".response-container", // Ajax, 设定默认 response 填充的区域
	paging_container: ".paging-container", // 分页，分页的容器
	paging_limit: 30, // 分页，默认每页 30 条记录
	paging_symbol: "&cc", // 分页，默认通过传统的 & 来分割，值通过 http.request.GET.cc 来传递
	dropdown_container: ".dropdown-container", // 弹出菜单，通过识别此节点，来绑定 下拉菜单的 事件
	treemenu_container: ".treemenu-container", // 树状菜单，通过识别此节点，来绑定 树状菜单 点击事件
	scroll_container: ".scroll-container" // 自定义相应鼠标滚动，通过识别此节点，来绑定
});
