/*
 * 组件 api 说明
 * 	1、依赖 move.js，组件前一定要引入 move.js
 * 	2、轮播图需要有一个父级，这个父级一定要给一个 id
 */


//自执行函数 ;(function(){})();
;(function(window,undefined){
	var Carousel=function(){
		//默认参数
		this.settings={
			id:'pic',				//轮播图父级的 id，必需传的参数
			autoplay:true,			//自动播放，true 为自动，false 为不自动，默认为 true
			intervalTime:1000,		//间隔时间，运动后停顿的时间，默认 1s
			loop:true,				//循环播放，true 为循环，false 为不循环，默认为 true
			totalNum:5,				//图片总量（严格来说是运动对象总量，因为运动的不一定是图片）
			moveNum:1,				//单次运动的图片（对象）数量（图片总量必须为运动数量的整倍数）
			initImg:0,		//初始显示的图片索引值，默认为 0，也就是显示第一张。
			circle:true,				//小圆点功能，true 为显示，false 为不显示，默认显示
			moveWay:'opacity'		//运动方式，opacity 为透明度过渡，position 为位置过渡
		};
	};
	
	Carousel.prototype={
		constructor:Carousel,		//修正 constructor 值，使构造函数为 Carousel
		
		//初始化函数
		init:function(opt){
			//初始化参数
			var opt=opt||this.settings;		//如果用户有传参数，就用用户传的参数，如果没有就用默认的参数
			//配置参数
			for(var attr in opt){
				this.settings[attr]=opt[attr];		//用用户传的参数覆盖默认的参数
			}
			
			this.createDom();
		},
		
		//创建轮播图结构。轮播图中只有图片是用户传的，左右按钮、小圆点都是通过 JS 生成的
		createDom:function(){			//创建结构
			var This=this;		//点击事件里的 this 指向的不是我们需要的 this，所以需要在外面用一个变量存储一下需要的 this。
			this.box=document.getElementById(this.settings.id);		//获取到轮播图父级
			
			//创建上一个按钮
			this.prevBtn=document.createElement("div");
			this.prevBtn.className='prev';
			this.prevBtn.innerHTML='<';
			this.prevBtn.onclick=function(){
				This.prev();		//点击事件里的 this 指向的不是我们需要的 this，所以需要在外面用一个变量存储一下需要的 this。
				This.trigger('leftClick');		//上一个按钮发生点击事件时，调用一下 leftClick 事件
			};
			this.box.appendChild(this.prevBtn);
			
			//创建下一个按钮
			this.nextBtn=document.createElement("div");
			this.nextBtn.className='next';
			this.nextBtn.innerHTML='>';
			this.nextBtn.onclick=function(){
				This.next();		//调用下一个按钮（向右按钮）点击功能
				This.trigger('rightClick');		//下一个按钮发生点击事件时，调用一下 rightClick 事件
			};
			this.box.appendChild(this.nextBtn);
			
			//创建圆点
			/*this.circleWrap=document.createElement("div");
			this.circleWrap.className='circle';
			this.circles=[];		//存圆点，后面需要修改圆点的 class，弄一个数组存起来会方便些
			
			//如果每次走多张图片的话，圆点数量就不是图片总量了，所以要拿总量除以单次走的图片的数量，得到的值才是圆点数量
			for(var i=0;i<this.settings.totalNum/this.settings.moveNum;i++){
				var span=document.createElement("span");
				span.index=i;
				
				span.onclick=function(){
					This.cn=this.index;
					This[This.settings.moveWay+'Fn']();
				};
				this.circleWrap.appendChild(span);
				this.circles.push(span);
			}
			this.circles[0].className='active';
			if(this.settings.circle){		//这里可以先判断是否有小圆点，然后再进行创建等
				this.box.appendChild(this.circleWrap);
			}*/
			
			//创建圆点
			if(this.settings.circle){		//这里可以先判断是否有小圆点，然后再进行相关元素的创建等。减少资源占用
			//如果是先判断再生成的话，后面需要用到小圆点 span 的地方，也要先进行判断才能使用，否则会因为元素还没生成就使用而出现报错。
				
				this.circleWrap=document.createElement("div");		//小圆点父级
				this.circleWrap.className='circle';
				this.circles=[];		//存圆点，后面需要修改圆点的 class，弄一个数组存起来会方便些
				
				//如果每次走多张图片的话，圆点数量就不是图片总量了，所以要拿总量除以单次走的图片的数量，得到的值才是圆点数量
				for(var i=0;i<this.settings.totalNum/this.settings.moveNum;i++){
					//每一次循环创建一个小圆点元素，并给它添加点击事件
					var span=document.createElement("span");
					span.index=i;
					span.onclick=function(){
						This.cn=this.index;
						This[This.settings.moveWay+'Fn']();
						This.endFn();		//小圆点点击事件发生时，调用一下 endFn。之所以要调用这个事件，是为了当通过点击小圆点到达左右尽头时，能够让对应的左右按钮显示为不可点击状态
					};

					this.circleWrap.appendChild(span);		//把小圆点元素添加到父级
					this.circles.push(span);		//把小圆点元素存放到数组中
				}
				this.circles[this.settings.initImg].className='active';		//默认让初始显示图片对应的小圆点处于 active 状态
				this.box.appendChild(this.circleWrap);		//把小圆点添加到轮播图父级
			}		
			this.moveInit();		//调用运动初始化功能
		},
		
		//运动初始化：运动有两种形式，一种是位置运动，一种是透明度运动，针对不同运动做相应准备工作
		moveInit:function(){			//运动初始化功能
			this.cn=this.settings.initImg;		//当前运动元素的索引
			//this.cn=imgIndex;		//这里不能直接设置为全局变量 imgIndex（初始值为 0）的值。因为它的值会在 product.js 中被修改，这样会影响到其它调用轮播图组件的地方。
			this.ln=0;				//上一个运动元素的索引
			this.canClick=true;		//是否可以再次点击
			this.endNum=this.settings.totalNum/this.settings.moveNum;		//轮播图边界条件，轮播次数，轮播的最后一个元素的索引值
			this.opacityItem=this.box.children[0].children;			//运动透明度的所有元素
			this.positionItemWrap=this.box.children[0].children[0];	//运动位置的元素的父级
			this.positionItem=this.positionItemWrap.children;		//运动位置的所有元素
			
			switch(this.settings.moveWay){		//这里用 switch 的另一个好处是以后需要增加新的运动形式时可以直接接在后面写
				case 'opacity':		//如果运动的是透明度，需要设置透明度与 transition
					for(var i=0;i<this.opacityItem.length;i++){
						this.opacityItem[i].style.opacity=0;		//先把所有元素的透明度都设置为 0
						this.opacityItem[i].style.transition='0.3s opacity';		//这里具体写上 opacity 可以一定程度上避免 transitionend 事件多次触发
						this.opacityItem[i].style.zIndex=0;		//先把所以元素的层级都设置为 0
						/*这里之所以要对层级进行设置，是因为当元素透明度为 0 时，虽然在视觉上没有显示，但是实际上它还是在页面中占据了相应位置。而此处轮播图图片通过定位堆叠在一起，如果不改变它们的层级，那么始终都是最后一张图片显示在最上层，在页面上进行相关点击操作时，点击的始终是最后一张图片，这与我们的需求不服，所以需要对元素层级进行设置，让当前显示的图片在最上层。*/
					}
					this.opacityItem[this.settings.initImg].style.opacity=1;		//再把初始显示元素的透明度设置为 1
					this.opacityItem[this.settings.initImg].style["z-index"]=1;		//再把初始显示元素的层级设置为 1
					/*带有横杠属性的操作方法：如果想用点操作符去获取带横杠的属性，那首先要把横杠去掉，然后把横杠后面的第一个字母大写；或者使用中括号 [] 的方式去操作属性。*/
					/*this.opacityItem[0].style.zIndex=1;*/
					
					break;		/*跳出 switch 并接着执行 switch 之后的语句*/
					
				case 'position':		//如果运动的是位置，需要设置父级的宽度
					//这里需要注意一下，一定要加上元素的 margin
					//获取 margin 不能直接写，要分别获取各个方向的 margin 值
					var leftMargin=parseInt(getComputedStyle(this.positionItem[0]).marginLeft);
					var rightMargin=parseInt(getComputedStyle(this.positionItem[0]).marginRight);
					
					//一个运动元素的实际宽度
					this.singleWidth=leftMargin+this.positionItem[0].offsetWidth+rightMargin;
					
					//如果运动是循环的，需要复制一份内容
					if(this.settings.loop){
						this.positionItemWrap.innerHTML+=this.positionItemWrap.innerHTML;
					}
					
					//复制内容后才能设置宽度
					this.positionItemWrap.style.width=this.singleWidth*this.positionItem.length+'px';
					
					//break;		/*switch 语句中最后一个 case 子句的 break 可以省略，不影响结果*/
			}
			
			//如果设置了自动播放，则在运动初始化中调用 autoPlay
			if(this.settings.autoplay){
				this.autoPlay();
			}
		},
		
		//透明度运动
		opacityFn:function(){			//透明度运动方式
			
			//运动条件判断：判断是否到边界，以及是否为循环运动
			//当运动到最左边：左边到头
			if(this.cn<0){
				//当轮播图循环播放时
				if(this.settings.loop){
					this.cn=this.endNum-1;
				}else{		//当轮播图不循环播放时
					this.cn=0;
					this.canClick=true;		//解决非循环运动点击第一张或者最后一张后，不能再次点击的问题。因为 canClick 为 true 是在 transitionend 里面设置的，但是不循环运动点击第一张或者最后一张后，图片还是停留在当前位置，transitionend 事件不会发生，所以 canClick 的值 false 不会被改变，这样就会出现不能再次点击的问题。
				}
			}
			
			//当运动到最右边：右边到头
			if(this.cn>this.endNum-1){
				//当轮播图循环播放时
				if(this.settings.loop){
					this.cn=0;
				}else{		//当轮播图不循环播放时
					this.cn=this.endNum-1;
					this.canClick=true;
				}
			}
			
			imgIndex=this.cn;		//全局变量 imgIndex（在 product.js 中声明）存储轮播图中当前显示图片的索引值
			
			//有圆点时设置、清除圆点样式
			if(this.settings.circle){
				this.circles[this.ln].className='';
				this.circles[this.cn].className='active';
			}
			
			//设置上一个运动元素的样式
			this.opacityItem[this.ln].style.opacity=0;
			this.opacityItem[this.ln].style.zIndex=0;
			//this.circles[this.ln].className='';
			
			//设置当前运动元素的样式
			this.opacityItem[this.cn].style.opacity=1;
			this.opacityItem[this.cn].style.zIndex=1;
			//this.circles[this.cn].className='active';
			
			var This=this;
			var en=0;
			//什么时候运动结束？运动是通过 transition 实现的，所以 transitionend 事件发生时就表示运动结束了。
			//transitionend 事件会多次触发（因为 transition 形式有很多，变化的数值也很多，所以每一个 transition 完成后 transitionend 事件都会触发），需要避免该事件多次触发
			this.opacityItem[this.cn].addEventListener('transitionend',function(){
				en++;
				if(en==1){		//单条件成立时，说明 transitionend 事件已经触发过一次了
					This.canClick=true;		//在 transitionend 事件发生时才会将 canClick 设置为 true（表示不能再次进行点击），所以当 transitionend 事件没发生，且可以再次点击时（非循环运动的第一张和最后一张图片），需要将 canClick 设置为 true。
					This.ln=This.cn;
					
					This.endFn();		//调用自定义事件。在运动结束后，调用 endFn 判断一下是否运动到边界了
				}
			});
		},
		
		//定位运动（位置运动）
		positionFn:function(){
			//运动条件判断：判断是否到边界，以及是否为循环运动
			//当运动到最左边：左边到头
			if(this.cn<0){
				//当轮播图循环播放时
				if(this.settings.loop){
					/*
					 * 当轮播图图片显示为第一张时（也就是到了最左边时），继续点击“向左”按钮（也就是条件 this.cn<0 成立），因为轮播图是循环播放，所以这时候需要显示为最后一张图。如何让第一张图的左边是最后一张图？当显示为第一张图时，让整个父级跳转到复制的那份内容的第一张图片，这样点击“向左”按钮后，就会显示为第一份内容的最后一张图，而这张图片的索引值就是 this.endNum-1。
					 * 1	2	3	1	2	3
					 * （到 1 了，想让 1 左边是 3，就先跳转到第二个 1 的位置，然后左边就是 3，当显示为 3 时，它的索引值就是图片数量 3 减去 1，也就是 2）
					 * 
					 * 综上，在这里需要做两件事情
					 * 	1、先让父级的位置到中间（也就是显示为复制的那份内容的第一张图片），这样的话它的左边是最后一张图片
					 * 	2、同时需要修改索引值，图片显示为复制的那份内容的第一张图片，接着父级就要向右移动显示第一份内容的最后一张，而这张图片的索引值就是 this.endNum-1（到了中间了，并不是停在那了，而是要运动出到前一份内容的最后一张，所以索引值是第一份内容的最后一张图片的索引值）
					 */
					//console.log(this.endNum);
					this.positionItemWrap.style.left=-this.positionItemWrap.offsetWidth/2+'px';
					this.cn=this.endNum-1;
				}else{		//当轮播图不循环播放时
					this.cn=0;
				}
			}
			
			//当运动到最右边：右边到头
			/*if(this.cn>this.endNum-1){
				if(this.settings.loop){		//当轮播图循环播放时
					//这里不用做任何事情，因为轮播图的内容复制了一份，到最右边时，点击“向右”按钮，会接着显示第二份内容。
					//需要在运动结束后去做条件判断
				}else{		//当轮播图不循环播放时
					this.cn=this.endNum-1;
				}
			}*/
			//这是上面的简写形式
			if(this.cn>this.endNum-1 && !this.settings.loop){
				this.cn=this.endNum-1;
			}
			
			imgIndex=this.cn;		//全局变量 imgIndex（在 product.js 中声明）存储轮播图中当前显示图片的索引值
			
			//有圆点时设置、清除圆点样式
			if(this.settings.circle){		//有圆点且非循环运动
				this.circles[this.ln].className='';
				this.circles[this.cn].className='active';
			}
			
			//运动
			var This=this;
			
			//left 的值=一个元素的宽度*当前 cn 的值*一次运动元素的个数
			//move(运动的对象，运动的属性-放在一个对象里，时间，运动的方式，回调函数)
			move(this.positionItemWrap,{left:-this.cn*this.singleWidth*this.settings.moveNum},300,'linear',function(){
				
				//当走到复制的内容的第一张图片（第二份内容的第一屏）时，就需要让运动的父级的 left 值变成 0，也就是回到第一份内容的第一张图片
				if(This.cn==This.endNum){
					//这个条件成立，说明现在已经到了第二份内容的第一屏了
					this.style.left=0;		//move 运动框架回调函数里的 this 指向的是运动的对象（元素）
					This.cn=0;
				}
				
				This.endFn();		//调用自定义事件。在运动结束后，调用 endFn 判断一下是否运动到边界了
				
				This.canClick=true;
				This.ln=This.cn;
			});
		},
		
		//上一个按钮（向左按钮）点击功能
		prev:function(){			//上一个按钮点击功能
			//当元素正在运动过程中时，按钮应该不能点击，避免连续点击时出现的问题
			//所以需要进行判断，能否进行下一次点击
			if(!this.canClick){		//条件成立时，表示不能再次进行点击
				return;
			}
			
			this.canClick=false;		//点击按钮后，将 canClick 的值设置为 false，表示不能再次进行点击。如果此时继续点击，上面的判断条件成立，会直接 return，不再执行下面代码。
			this.cn--;
			
			//这里不能直接写 opacityFn 或 positionFn，需要根据用户传的参数动态去设置
			this[this.settings.moveWay+'Fn']();
		},
		
		//下一个按钮（向右按钮）点击功能
		next:function(){			//下一个按钮点击功能
			if(!this.canClick){
				return;
			}
			
			this.canClick=false;
			this.cn++;
			this[this.settings.moveWay+'Fn']();
		},
		
		//自动播放功能
		autoPlay:function(){			//自动播放功能需要用到定时器
			var This=this;		//定时器里访问不到需要的 this，在外面声明一个变量储存一下
			this.timer=setInterval(function(){
				This.next();
			},this.settings.intervalTime);		//定时器第二个参数要用用户传进来的时间
			
			//鼠标放上去的时候停止
			this.box.onmouseenter=function(){		//鼠标移入事件
				clearInterval(This.timer);
				This.timer=null;
			};
			
			//鼠标离开的时候继续播放
			this.box.onmouseleave=function(){		//鼠标移出事件
				This.autoPlay();
			};
		},
		
		//添加自定义事件
		//添加自定义事件是在调用组件生成实例后
		on:function(type,listener){		//type 表示事件的名字，listener 表示事件触发的函数
			//console.log(this.events)
			this.events=this.events||{};		//初始时 this.events 未定义，让它等于一个空对象，从第二次开始，先获取到第一次的内容，然后再通过下面代码添加内容
			this.events[type]=this.events[type]||[];		//this.events 是一个对象，里面的数据以键值对的形式存储。把 type 作为这个数组的 key，初始时里面没有内容，让这个 key 对应的值为一个空数组，这里之所以用数组，是因为一个事件的名字（type）可以对应多个函数，把这些函数放到一个数组中。从第二次开始，就是先获取到上一次添加的内容。
			this.events[type].push(listener);		//把事件触发的函数添加到对应的数组中
		},
		
		//调用自定义事件
		trigger:function(type){		//type 表示事件的名称		trigger 触发器、触发
			//因为有的实例有自定义事件，有的没有。所以需要做一个判断，只有用户添加了自定义事件的实例才能执行下面的代码
			if(this.events&&this.events[type]){		//当 this.events 存在，且名字为 type 的事件对应的函数存在说明用户有添加自定义事件
				for(var i=0;i<this.events[type].length;i++){
					this.events[type][i].call(this);		//调用函数且修正 this 指向
				}
			}
		},
		/*
		 * 添加自定义事件是在用户 new 完之后（调用组件生成实例之后）添加的
		 * 
		 * 添加自定义事件
		 * 实例.on('事件名',函数)
		 * 
		 * 调用自定义事件
		 * 实例.trigger('事件名')
		 * 如果是在组件内调用 this.trigger('事件名')
		 */
		
		//运动到边界时
		endFn:function(){
			//这个函数是用来判断运动是否为非循环运动，且轮播图是否运动到边界了，并在满足条件时调用相应的自定义事件。
			if(!this.settings.loop){		//非循环运动
				//console.log(this.cn,this.endNum)		//可以观察运动到左右边界时这两个值
				if(this.cn==0){
					//这个条件满足的时候说明左边的运动已经到头了
					this.trigger('leftEnd');		//调用自定义事件。添加自定义事件是在用户 new 完之后（调用组件生成实例之后）添加的
				}
				
				if(this.cn==this.endNum-1){
					//这个条件满足的时候说明右边已经运动到头了
					this.trigger('rightEnd');
				}
			}
		}
	};
	window.Carousel=Carousel;		//把函数挂载到 window 身上，这样在外面就能直接调用了
})(window,undefined);		//传入两个实参 window、undefined
