window.yx={
	//工具类函数
	g:function(name){		//获取一个元素
		return document.querySelector(name);
	},
	ga:function(name){		//获取一组元素
		return document.querySelectorAll(name);
	},
	//事件监听
	addEvent:function(obj,ev,fn){		//参数一：添加事件的元素（对象），参数二：事件名，参数三：执行的函数（功能）
		//兼容性处理
		if(obj.addEventListener){		//这个条件成立说明是标准浏览器
			obj.addEventListener(ev,fn);
		}else{
			obj.attachEvent('on'+ev,fn);		//针对 IE 浏览器
		}
	},
	removeEvent:function(obj,ev,fn){
		if(obj.removeEventListener){
			obj.removeEventListener(ev,fn);
		}else{
			obj.detachEvent('on'+ev,fn);
		}
	},
	getTopValue:function(obj){		//获取元素离 html 的距离
		var top=0;
		while(obj.offsetParent){		//offsetParent 获取离元素最近的有定位的父级。如果父级都没有定位，则返回 body。body 是没有 offsetParent
			top+=obj.offsetTop;		//offsetTop 返回离元素最近的、有定位的父级的距离，如果找不到，则返回到 html 的距离
			obj=obj.offsetParent;
		}
		return top;
	},
	
	//倒计时
	cutTime:function(target){		//倒计时
		var currentDate=new Date();
		var v=Math.abs(target-currentDate);		//结束时间减去当前时间，结果取绝对值
		
		return {
			d:parseInt(v/(24*3600000)),
			h:parseInt(v%(24*3600000)/3600000),
			m:parseInt(v%(24*3600000)%3600000/60000),
			s:parseInt(v%(24*3600000)%3600000%60000/1000)
		};
	},
	
	//将时间转为两位数
	format:function(v){		//给时间补 0，让时间显示为两位数
		return v<10?'0'+v:v;
	},
	
	//装换时间（将毫秒数装换为标准时间）
	formatDate:function(time){
		var d=new Date(time);
		return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())+' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
		//注意：月份从 0 开始，实际月份要加 1
	},
	
	//通过正则将 url 里的参数解析成对象
	parseUrl:function(url){		//把 url 后面的参数解析成对象
		//id=1143021		需要从 url 里匹配出这种格式的字符
		var reg=/(\w+)=(\w+)/ig;		//\w 表示数字、字母、下划线，+ 表示多个，i 表示连续、g 表示全局匹配，() 表示子项
		var result={};
		
		url.replace(reg,function(a,b,c){
			//console.log(a,b,c)		//a 是通过 reg 匹配到的字符，b 是 reg 中第一个子项匹配到内容，c 是 reg 中第二个子项匹配到内容
			//eg：id=1143021 id 1143021
			result[b]=c;
		});
		
		return result;
	},
	//这个对象里放一些公用的功能（例如导航栏、回到顶部按钮、购物车等）
	public:{
		navFn:function(){		//导航功能
			var nav=yx.g('.nav');
			var lis=yx.ga('.navBar li');
			var subNav=yx.g('.subNav');
			var uls=yx.ga('.subNav ul');
			var newLis=[];		//存储实际有用的 li，也就是鼠标放上去会出现选项栏的 li
			
			//首页（第一个 li）是没有 hover 状态，所以要从 1 开始循环，后面的两个个 li 也没有 hover 状态，所以要多减 2。
			for(var i=1;i<lis.length-3;i++){
				newLis.push(lis[i]);		//把所有有 hover 状态的 li 存储到 newLis 中
			}
			
			for(var i=0;i<newLis.length;i++){
				newLis[i].index=uls[i].index=i;
				var n;		//声明一个变量用来储存索引值
				newLis[i].onmouseenter=function(){
					n=this.index;
					newLis[this.index].className='active';
					uls[this.index].style.display='block';
				};
				//这里之所以要给 ul 的父级（的父级）添加事件，是因为 ul（的父级）设置了宽度，而想要的效果是鼠标放在整个区域都让 ul 显示，所以给宽度为 100% 的元素添加事件
				subNav.onmouseenter=function(){
					newLis[n].className='active';
					uls[n].style.display='block';
				}
				newLis[i].onmouseleave=function(){
					n=this.index;
					newLis[this.index].className='';
					uls[this.index].style.display='none';
				};
				subNav.onmouseleave=function(){
					newLis[n].className='';
					uls[n].style.display='none';
				}
			}
			
			yx.addEvent(window,'scroll',setNavPos);
			setNavPos();
			function setNavPos(){
				/*if(window.pageYOffset>nav.offsetTop){
					nav.id='navFix':'';
				}else{
					nav.id='';
				}*/
				//三目运算符
				nav.id=window.pageYOffset>nav.offsetTop?'navFix':'';
				//滚动条的距离（纵向）大于 nav 离页面顶部的距离
			}
		},
		//购物车功能
		shopFn(){		//购物车功能
			/*
			 * localStorage		本地存储
			 * 	可以把数据存储在用户的浏览器缓存里面，相当于在用户的本地创建了一个数据库，存储的形式是一个对象
			 * 	localStorage.setItem(key,value)		存储一条数据
			 * 	localStorage.getItem(key)			获取某条数据的 value
			 * 	localStorage.removeItem(key)		删除某条数据
			 * 	localStorage.clear()					删除所有数据
			 * 	localStorage.length					获取数据的长度
			 * 	localStorage.key(i)					获取某条数据的 key
			 * 
			 * 生命周期		只要不清除就一直存在
			 * 注意：
			 * 	1、IE 不支持本地操作，需要放在服务器环境下。尽量都在服务器环境下操作
			 * 	2、如果设置的是重复的 key，不会增加，而是修改已有的数据
			 * 			
			 */
			
			/*
			localStorage.setItem('name','小明');
			localStorage.setItem('QQ','123456');
			localStorage.setItem('网站','http://www.xxxx.com');
			console.log(localStorage.getItem('name'));		//小明
			
			for(var i=0;i<localStorage.length;i++){
				console.log(localStorage.key(i));		//QQ name 网站
			}
			//localStorage.removeItem('网站');
			
			//localStorage.clear();
			console.log(localStorage);
			*/
			
			//localStorage.clear();
			
			//购物车添加商品展示
			var productNum=0;		//总共添加的商品数量（购物车图标右上角显示）
			(function(local){
				var totalPrice=0;		//商品合计
				var ul=yx.g('.cart ul');
				var li='';
				ul.innerHTML='';
				
				//local 是形参，localStorage 是传的实参
				//判断本地存储中是否有商品数据。可以把这个功能做成一个函数，需要用到的地方直接调用。后面也需要进行判断
				for(var i=0;i<local.length;i++){
					var attr=local.key(i);			//取到每个key
					var value=JSON.parse(local[attr]);		//通过 JSON 方法将字符串转为对象
					
					if(value&&value.sign=='productLocal'){		//value 存在且对象中包含了标识
						//这个条件成立说明现在获取到的 local 就是我们主动添加的 local，也就是存储有商品数据
						li+='<li data-id="'+value.id+'">'+		//循环的时候添加自定义属性 data-id，属性值为 value.id，后面可以通过属性操作的方法获取到商品对应的 value.id，而它就是 localStorage 中的 key
								'<a href="#" class="img"><img src="'+value.img+'"/></a>'+
								'<div class="message">'+
									'<p><a href="#">'+value.name+'</a></p>'+
									'<p>'+value.spec.join(' ')+' x '+value.num+'</p>'+		//value.spec 是一个数组，直接转字符串是用逗号拼接，如果不想用逗号拼接就需要调用 join 方法
								'</div>'+
								'<div class="price">¥'+value.price+'.00</div>'+
								'<div class="close">X</div>'+
							'</li>';
							
						productNum+=Number(value.num)		//商品总数为所有商品数量的和（购物车图标右上角显示）
						totalPrice+=parseFloat(value.price)*Number(value.num);		//总价格：每一样商品的总数乘以价格，然后把它们相加
						//假如商品价格本来就有小数时，可以使用 toFixed() 方法保留相应位数的小数
					}
				}
				ul.innerHTML=li;
				
				//ul.children.length;		//购物车里商品种类
				
				yx.g('.cartWrap i').innerHTML=productNum>99?'99+':productNum;		//更新商品数量的值，如果数量太大时显示为“99+”
				//假如商品价格本来就有小数时，可以使用 toFixed() 方法保留相应位数的小数
				yx.g('.cartWrap .total span').innerHTML='¥'+totalPrice+'.00';		//更新总价格
				
				//删除商品功能
				var closeBtns=yx.ga('.cart .list .close');
				for(var i=0;i<closeBtns.length;i++){
					closeBtns[i].onclick=function(){
						//这里删除商品不能直接用 DOM 方法从结构里删除，而是要从本地数据中去删除对应的数据，然后再根据本地数据生成购物车里的商品。
						localStorage.removeItem(this.parentNode.getAttribute('data-id'));
						//添加商品时将 key 存储在自定义属性 data-id 中
						//console.log(localStorage)
						yx.public.shopFn();		//本地数据有了变化后调用 shopFn 生成相关结构数据
						
						//如果购物车里没有商品时，隐藏购物车
						if(ul.children.length==0){
							yx.g('.cart').style.display='none';
						}
					};
				}
				
				//给购物车（包括购物车图标、购物车主体）添加事件：隐藏、显示
				var cartWrap=yx.g('.cartWrap');
				var timer;		//为了解决购物车图标与购物车主体之间的间隙导致的购物车图标鼠标移出事件
				
				//购物车鼠标移入事件
				cartWrap.onmouseenter=function(){
					clearTimeout(timer);		//鼠标移入时先清除一下定时器，避免鼠标迅速移出又移入时（这时应该为显示），由于时间很短，移出事件里设置的定时器时间没到，“隐藏”还没执行，就先执行了移入事件里的“显示”，这时候定时器设置的时间到了，然后执行“隐藏”，就出现了与预期不相符的情况。
					
					//只有在购物车里有商品的时候才让购物车主体显示
					//购物车里是否有商品应该通过本地存储中的数据来判断，在移入事件发生时，需要先遍历一下本地存储中的数据（这样的话，在商品页面添加商品后，在其它页面如主页鼠标移入购物车图标后也能正确显示购物车），如果有相应数据，则需要让购物车显示，且购物车显示相关商品，同时购物车图标上需要显示正确数字，并根据情况显示滚动条。
					//可以把判断本地存储中是否有商品数据做成一个函数，需要用到的地方直接调用
					for(var i=0;i<local.length;i++){
						var attr=local.key(i);			//取到每个key
						var value=JSON.parse(local[attr]);		//通过 JSON 方法将字符串转为对象
					
						if(value&&value.sign=='productLocal'){
							//这个条件成立说明现在本地存储中有添加的商品信息
							
							yx.public.shopFn();		//本地存储中有商品信息后调用 shopFn 生成购物车相关结构数据以及购物车图标数字
							scrollFn();		//购物车里有商品后，调用 scrollFn 进行滚动条的相关设置
							yx.g('.cart').style.display='block';		//让购物车显示
						};
					};
				};
				//鼠标移出事件
				cartWrap.onmouseleave=function(){
					//购物车图标与购物车主体间有一定的间隙，这样鼠标从购物车图标上移动到购物车主体上就会触发移出事件，导致购物车主体隐藏，而我们这时是不需要让购物车隐藏的，所以设置一个定时器让购物车主体延迟一定时间隐藏
					timer=setTimeout(function(){
						yx.g('.cart').style.display='none';	
					},100);
				};
				
			})(localStorage);
			
			
			//购物车的滚动条功能
			function scrollFn(){
				var contentWrap=yx.g('.cart .list');		//购物车上部分内容的父级
				var content=yx.g('.cart .list ul');		//购物车里商品列表的父级，也就是需要运动的元素
				var scrollBar=yx.g('.cart .scrollBar');		//滚动条父级
				var slide=yx.g('.cart .slide');		//滚动条滑块
				var slideWrap=yx.g('.cart .slideWrap');		//滚动条滑块父级，决定了滑块运动范围
				var btns=yx.ga('.scrollBar span');		//滚动条里的上箭头按钮、下箭头按钮
				var timer;		//定时器。滚动，运动效果，需要用到定时器
				
				//滑块的高度会随着购物车里商品数量的增加而减小，具体是根据比例（倍数）计算的
				
				//倍数（用来设置滚动条的高度）
				var beishu=content.offsetHeight/contentWrap.offsetHeight;		//商品列表的父级高度除以购物车上部分内容的父级高度（也就是购物车里显示出商品列表的区域的高度）
				
				//设置滚动条显示与否
				//scrollBar.style.display=beishu<=1?'none':'block';		//当商品列表的父级高度不超过购物车上部分内容的父级高度时，让滚动条隐藏
				
				//倍数小于等于 1 时除了让滚动条隐藏外，还要让 content 的 top 值为 0
				//因为当购物车里商品很多时，滚动滚动条到底部（滚动时会设置 content 的 top 值），然后点击 X 减少商品种类，随着商品数量的减少，beishu 的值也会减少，当它的值小于等于 1 时，滚动条隐藏了，但是 content 的 top 值还是之前滚动滚动条时设置的值
				if(beishu<=1){
					scrollBar.style.display='none';
					content.style.top=0;
				}else{
					scrollBar.style.display='block';
				}
				
				//给倍数设置一下最大值，假如商品数量很大时，不能让滑块高度无限减少
				if(beishu>20){
					beishu=20;
				}
				
				//商品列表的父级与购物车上部分内容的父级的倍数，滑块与滑块父级的倍数，这两个倍数是相等的，所以根据上面计算的倍数设置滑块的高度
				slide.style.height=slideWrap.offsetHeight/beishu+'px';
				
				
				//滑块拖拽
				var scrollTop=0;		//滑块走的距离
				var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;		//滑块能够走的最大距离
				
				slide.onmousedown=function(ev){
					var disY=ev.clientY-slide.offsetTop;		//offsetTop 返回的是离该元素最近且具有定位的元素的距离。
					//差值为鼠标点击点离滑块上边的距离加上离滑块最近且有定位的父级到浏览器顶部的距离
					
					document.onmousemove=function(ev){
						scrollTop=ev.clientY-disY;		//差值刚好为滑块里父级顶部的距离
						scroll();
					};
					document.onmouseup=function(){
						this.onmousemove=null;
					};
					
					ev.cancelBubble=true;		//阻止事件冒泡
					return false;		//阻止默认事件
				};
				
				//滚轮滚动的功能
				myScroll(contentWrap,function(){
					scrollTop-=10;
					scroll();
					
					clearInterval(timer);
				},function(){
					scrollTop+=10;
					scroll();
					
					clearInterval(timer);
				});
				
				//上下箭头点击的功能
				for(var i=0;i<btns.length;i++){
					btns[i].index=i;
					btns[i].onmousedown=function(){
						var n=this.index;		//根据 n 的值为 0 还是 1 来判断上、下按钮
						timer=setInterval(function(){
							scrollTop=n?scrollTop+5:scrollTop-5;		//三目运算符
							scroll();
						},16);
						
					};
					btns[i].onmouseup=function(){
						clearInterval(timer);
					};
				}
				
				//滑块区域点击的功能
				slideWrap.onmousedown=function(ev){
					timer=setInterval(function(){
						var slideTop=slide.getBoundingClientRect().top+slide.offsetHeight/2;
						if(ev.clientY<slideTop){
							//这个条件成立说明现在鼠标在滑块的上面，滚动条应该往上走
							scrollTop-=5;
						}else if(ev.clientY>slideTop){
							scrollTop+=5;
						}
						
						//因为 scrollTop 的值是以 5 的倍数在变化（加 5 或减 5），所以有些值 scrollTop 永远无法达到，而当鼠标的位置也就是 ev.clientY 的值是这些值时，就会导致 scrollTop 的值在这些值两边来回波动，也就导致滑块在目标点来回抖动。
						//解决方法“如果 ev.clientY 和 slideTop 的差的绝对值小于 5 了，就可以认为到达终点了，这个时候清除掉定时器，就能够解决抖动的问题
						if(Math.abs(ev.clientY-slideTop)<5){
							clearInterval(timer);
						}
						
						scroll();
					},16);
				};
				
				//滚动条的主体功能
				function scroll(){
					//设置滑块滚动范围
					if(scrollTop<0){
						scrollTop=0;
					}else if(scrollTop>maxHeight){
						scrollTop=maxHeight;
					}
					
					var scaleY=scrollTop/maxHeight;
					slide.style.top=scrollTop+'px';
					content.style.top=-(content.offsetHeight-contentWrap.offsetHeight)*scaleY+'px';
					//商品列表能够走的最远距离乘以比例，注意定位值是负的
				}
				
				//滚轮事件
				function myScroll(obj,fnUp,fnDown){
					obj.onmousewheel=fn;
					obj.addEventListener('DOMMouseScroll',fn);		//兼容性处理
					
					function fn(ev){
						if(ev.wheelDelta>0 || ev.detail<0){		//鼠标向上滚。兼容性处理
							fnUp.call(obj);
						}else{
							fnDown.call(obj);
						}
						
						ev.preventDefault();
						return false;		//阻止默认事件。兼容性处理
					}
				}
			}
		},
		//图片懒加载功能
		lazyImgFn:function(){
			yx.addEvent(window,'scroll',delayImg);
			delayImg();
			function delayImg(){
				var originals=yx.ga('.original');		//所有要懒加载的图片
				var scrollTop=window.innerHeight+window.pageYOffset;		//这个距离是可视区的高度与滚动条的距离之和
				
				for(var i=0;i<originals.length;i++){
					//如果图片离 html 的上边的距离小于滚动条的距离与可视区的距离之和的话，就表示图片已经进入到可视区了
					if(yx.getTopValue(originals[i])<scrollTop){
						originals[i].src=originals[i].getAttribute('data-original');
						originals[i].removeAttribute('class');		//如果这个图片的地址已经换成真实的地址，那就把它身上的 class 去掉，那么上面的获取需要懒加载图片的代码就不会再次获取到这张图片了。
					}
				}
				//当所有图片都加载了真确的地址后，滚动滚动条，这个函数仍然会执行，会浪费系统资源，所有需要在图片都加载后，从滚动条事件中移除这个函数。那么如何判断所有图片都被加载了呢？
				//当最后一张懒加载图片的 src 被改过，说明所有图片都已经加载了，此时就不需要再执行函数了。
				if(originals[originals.length-1].getAttribute('src')!='images/empty.gif'){
					//当这个条件成立的时候，说明现在所有的图片的地址都已经换成真实的地址了，这个时候就不需要再执行这个函数了
					yx.removeEvent(window,'scroll',delayImg);
				}
			}
		},
		//回到顶部功能
		backUpFn:function(){
			var back=yx.g('.back');
			var timer;
			back.onclick=function(){
				var top=window.pageYOffset;
				
				timer=setInterval(function(){
					top-=150;
					if(top<=0){
						top=0;
						clearInterval(timer);		//清除定时器
					}
					window.scrollTo(0,top);		//设置滚动条距离
				},16);
			};
		}
	}
}
