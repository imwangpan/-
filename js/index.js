//公用方法调用
yx.public.navFn();		//导航栏
yx.public.lazyImgFn();		//图片懒加载
yx.public.backUpFn();		//回到顶部
yx.public.shopFn();		//调用购物车功能

//banner 图轮播
var bannerPic=new Carousel();
bannerPic.init({
	id:'bannerPic',
	autoplay:true,
	intervalTime:3000,
	loop:true,
	totalNum:5,
	moveNum:1,
	circle:true,
	moveWay:'opacity'
});

//新品首发轮播图
var newProduct=new Carousel();
newProduct.init({
	id:'newProduct',
	autoplay:false,
	intervalTime:3000,
	loop:false,
	totalNum:12,
	moveNum:4,
	circle:true,		//新品首发默认是没有小圆点了，这里设置为有小圆点是为了测试非循环运动的小圆点相关功能
	moveWay:'position'
});

/*
 * 添加自定义事件是在用户 new 完之后（调用组件生成实例之后）添加的
 * 
 * 添加自定义事件
 * 实例.on('事件名',函数)
 * 
 * 调用自定义事件
 * 实例.trigger('事件名')
 */
/*
 * #D0C4AF		普通状态颜色
 * #B19E7A		hover 状态颜色
 * #E7E2D7		不可点击状态颜色
 */
newProduct.on('rightEnd',function(){
	//alert('右边到头了');
	this.nextBtn.style.background='#E7E2D7';
	this.prevBtn.style.background='#D0C4AF';		//这里之所以要把左边按钮的颜色设置为普通状态颜色是为了让点击最后一个小圆点时（也就是通过点击小圆点让右边到头时）按钮显示正确的颜色
	//this.nextBtn.style.cursor='not-allowed';		//鼠标手势的改变可写可不写
});
newProduct.on('leftEnd',function(){
	//alert('左边到头了');
	this.prevBtn.style.background='#E7E2D7';
	this.nextBtn.style.background='#D0C4AF';			//这里之所以要把右边按钮的颜色设置为普通状态颜色是为了让点击第一个小圆点时（也就是通过点击小圆点让左边到头时）按钮显示正确的颜色
	//this.prevBtn.style.cursor='not-allowed';
});
newProduct.on('leftClick',function(){
	//alert('左边点击了');
	this.nextBtn.style.background='#D0C4AF';		//让右边按钮变为普通状态颜色
	//this.nextBtn.style.cursor='pointer';
});
newProduct.on('rightClick',function(){
	//alert('右边点击了');
	this.prevBtn.style.background='#D0C4AF';		//让左边按钮变为普通状态颜色
	//this.prevBtn.style.cursor='pointer';
});
//上面的四个自定义事件已经在 Carousel.js 里调用过了

//人气推荐选项卡
(function(){
	var titles=yx.ga("#recommend header li");
	var contents=yx.ga("#recommend .content");
	
	for(var i=0;i<titles.length;i++){
		titles[i].index=i;
		titles[i].onclick=function(){
			for(var i=0;i<titles.length;i++){
				titles[i].className='';
				contents[i].style.display='none';
			}
			titles[this.index].className='active';
			contents[this.index].style.display='block';
		};
	}
})();


//限时购
(function(){
	var timeBox=yx.g('#limit .timeBox');
	var spans=yx.ga('#limit .timeBox span');
	var timer=setInterval(showTime,1000);		//开启一个定时器，每隔一秒调用一下 showtime
	
	//倒计时
	showTime();
	function showTime(){
		var endTime=new Date(2019,0,1);		//结束时间，根据需要进行设置
		if(new Date()<endTime){		//如果当前的时间没有超过结束的时间才去做倒计时
			var overTime=yx.cutTime(endTime);		//调用 cutTime 后会对时间进行计算，结果返回在一个对象里
			spans[0].innerHTML=yx.format(overTime.h);		//对返回对象里的数据进行补 0 处理，使结果为两位数
			spans[1].innerHTML=yx.format(overTime.m);
			spans[2].innerHTML=yx.format(overTime.s);
		}else{
			clearInterval(timer);		//到达结束时间后，清除定时器
		}
	}
	
	//商品数据
	var boxWrap=yx.g('#limit .boxWrap');
	var str='';		//声明一个变量用来存储结构
	var item=json_promotion.itemList;		//从 limitTime.js 里获取到数据
	
	for(var i=0;i<item.length;i++){
		//字符串拼接。这里也可以用 ES6 中的模板字符串
		str+='<div class="limitBox">'+
				'<a href="#" class="left scaleImg"><img class="original" src="images/empty.gif" data-original="'+item[i].primaryPicUrl+'"/></a>'+
				'<div class="right">'+
					'<a href="#" class="title">'+item[i].itemName+'</a>'+
					'<p>'+item[i].simpleDesc+'</p>'+
					'<div class="numBar clearfix">'+
						'<div class="numCon"><span style="width:'+Number(item[i].currentSellVolume)/Number(item[i].totalSellVolume)*100+'%"></span></div>'+		//进度条是在这里进行计算的。剩下的数量除以重量，结果乘以 100，修正为百分比
						'<span class="numTips">还剩'+item[i].currentSellVolume+'件</span>'+
					'</div>'+
					'<div>'+
						'<span class="xianshi">限时价<span class="fuhao">¥</span><strong>'+item[i].actualPrice+'</strong></span>'+
						'<span class="yuan">原价 ¥'+item[i].retailPrice+'</span>'+
					'</div>'+
					'<a href="#" class="qianggou">立即抢购</a>'+
				'</div>'+
			'</div>';
	}
	
	boxWrap.innerHTML=str;
})();


//大家都在说轮播图
var say=new Carousel();
say.init({
	id:'sayPic',
	autoplay:true,
	intervalTime:3000,
	loop:true,
	totalNum:3,
	moveNum:1,
	circle:false,
	moveWay:'position'
});

