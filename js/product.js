//公用方法调用
yx.public.navFn();		//导航功能
yx.public.backUpFn();		//回到顶部功能
var imgIndex=0;		//声明一个全局变量存储轮播图中当前显示图片的索引值。也是评价中当前点击小图（显示大图）的索引值
console.log(productList);

/*
 真正做项目时，是这样的流程
 请求的地址：http://www.XXXX.com/getData.php?id=1131017
 把地址通过 Ajax 发送到后端，后端通过识别 id 后会返回对应的数据
 */
/*
在这个本地项目中，是把数据放在 product_listData.js 中，里面有三个产品 ID 以及对应的产品数据。
ID 分别为 1143021、1092014、1113019
可以在地址栏 url 结尾添加 ?id=1143021 观察效果
eg：http://127.0.0.1:8020/前端学习/js%20笔记/19%20第十九章-网易严选（项目实战）/product.html?id=1143021
http://127.0.0.1:8020/前端学习/js%20笔记/19%20第十九章-网易严选（项目实战）/product.html?id=1092014
http://127.0.0.1:8020/前端学习/js%20笔记/19%20第十九章-网易严选（项目实战）/product.html?id=1113019
*/

//解析 url
var params=yx.parseUrl(window.location.href);		//window.location.href 返回浏览器地址栏中从 ? 开始到 # 结束的一段字符串，然后把这段字符串通过common.js 中的 parseUrl 进行处理，返回一个对象
var pageId=params.id;		//产品对应的 id
//console.log(pageId)
var curData=productList[pageId];		//产品对应的数据

//404 页面。实际开发中，404 判断是后端做的
if(!pageId || !curData){		//找不到对应的 ID 或者数据时
	//这个就是 404 页面出现在条件
	window.location.href='404.html';
}

//面包屑功能，表示当前页面所在的位置
//页面所在的位置是通过数据获取的
var positionFn=yx.g('#position');
positionFn.innerHTML='<a href="#">首页</a> >';
for(var i=0;i<curData.categoryList.length;i++){
	positionFn.innerHTML+=' <a href="#">'+curData.categoryList[i].name+'</a> >';
}
positionFn.innerHTML+=curData.name;


//产品图功能
(function(){
	//左边图片切换功能
	var bigImg=yx.g('#productImg .left img');
	var smallImgs=yx.ga('#productImg .smallImg img');
	
	bigImg.src=smallImgs[0].src=curData.primaryPicUrl;		//设置第一张大图、第一张小图
	
	//图片切换。选项卡原理
	var last=smallImgs[0];		//上一张图片
	for(var i=0;i<smallImgs.length;i++){
		if(i){		//因为第一张小图已经在上面设置了，所以这里不需要设置第一张小图，即排除 i=0
			//这个条件满足的话，说明现在是后四张图片
			smallImgs[i].src=curData.itemDetail['picUrl'+i];
		}
		
		smallImgs[i].index=i;
		smallImgs[i].onmouseover=function(){
			bigImg.src=this.src;		//让大图的图片为鼠标放上去的小图的图片
			last.className='';
			this.className='active';
			
			last=this;
		};
	}
	
	//右边图片相关信息更换
	yx.g('#productImg .info h2').innerHTML=curData.name;
	yx.g('#productImg .info p').innerHTML=curData.simpleDesc;
	yx.g('#productImg .info .price').innerHTML='<div><span>售价</span><strong>¥'+curData.retailPrice+'.00</strong></div><div><span>促销</span><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="tag">'+curData.hdrkDetailVOList[0].activityType+'</a><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="discount">'+curData.hdrkDetailVOList[0].name+'</a></div><div><span>服务</span><a href="#" class="service"><i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元免邮费<i></i>网易自营品牌</a></div>';
	
	//创建规格 DOM
	var format=yx.g('#productImg .format');
	var dds=[];			//把所有的 dd 标签存起来，为了后面要用
	for(var i=0;i<curData.skuSpecList.length;i++){
		var dl=document.createElement("dl");
		var dt=document.createElement("dt");
		dt.innerHTML=curData.skuSpecList[i].name;
		dl.appendChild(dt);
		
		for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){
			var dd=document.createElement("dd");
			dd.innerHTML=curData.skuSpecList[i].skuSpecValueList[j].value;
			dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id)		//通过设置自定义属性来判断点击的是哪一个
			
			dd.onclick=function(){
				changeProduct.call(this);		//调用函数时改变它的 this 指向为当前点击对象（这里是 dd）
			};
			
			dds.push(dd);
			dl.appendChild(dd);
		}
		
		format.appendChild(dl);
	}
	
	/*
	 * 规格部分如何实现选取类别一里面的某子项后，类别二里的某些子项无法点击？
	 * 网易严选实现原理：首先将类别一里的第一个子项的 id 与类别二里的每一个子项的 id 分别拼接成字符串作为一个对象的不同 key，然后每一项 key 值（也是一个对象）里有一项属性反应的就是这两个子项同时被选中时的剩余数量，当该属性值为 0 时，即表示这两个子项不能同时被点击（选中）。
	 */
	//点击规格功能
	function changeProduct(){
		//当按钮不能点击时直接返回，不需要执行下面代码
		
		//相比 className=='noclick'，下面的写法更为严谨。因为 class 的值可能不止一个
		if(this.className.indexOf('noclick')!=-1){
			return;
		}
		
		var curId=this.getAttribute('data-id');		//点击的那个元素的 id
		var othersDd=[];			//另一个类别的所有的 dd，需要操作它们的 class。eg：点击“型号”里面的项目，需要获取到“颜色”里的所有子项，操作它们的 class
		var mergeId=[];			//与点击元素的 id 组合的所有 id（用来去数据里查一下这个组合的产品余量是否为 0）
		
		//另一个类别的所有 dd 以及组合后的 id
		//数据对象里的 key 是“点击的 id;对方的 id”，所以只要能查到点击元素的 id ，它就包含了所有对方的 id。（对方的 id 就是另一个类别的 dd 的 id）
		for(var attr in curData.skuMap){
			if(attr.indexOf(curId)!=-1){
				//这个条件成立，说明在数据里找到了当前点击元素的 id 能组合到的所有 id
				
				//1132095;1132097		;1132097		1132097
				var otherId=attr.replace(curId,'').replace(';','');		//另一个类别的 dd 的 id
				//先从字符串中把当前 id 替换为空，再从返回结果中把 ; 替换为空，这样就能得到对方的 id
				
				//通过对方的 id 找到对方的 dd
				for(var i=0;i<dds.length;i++){
					if(dds[i].getAttribute('data-id')==otherId){
						othersDd.push(dds[i]);
					}
				}
				mergeId.push(attr);		//把找到的所有与点击元素的 id 组合的 id 放在数组里
			}
		}
		//console.log(othersDd,mergeId)		//验证一下是否找到正确的值
		
		//点击的功能
		/*
		 * 点击的时候判断
		 * 	1、自己是末选中状态，点击时要做三件事
		 * 		1)、兄弟节点
		 * 			兄弟节点有选中的话要取消选中，有不能点击的不用处理
		 * 		2)、让自己成为选中状态
		 * 		3)、对方节点
		 * 			先去掉有 noclick 的 class 的元素，再给不能点击的加上 noclick
		 * 		
		 * 	2、自己是选中状态，点击时要做两件事
		 * 		1)、取消自己选中
		 * 			（兄弟节点不用处理）
		 * 		2)、对方节点
		 * 			如果有不能点击的要去掉 noclick 的 class
		 */
		
		var brothers=this.parentNode.querySelectorAll('dd');		//兄弟节点。先找到父级，然后找到父级下所有的 dd 元素。
		//选中状态
		if(this.className=='active'){		//这里可以直接判断 this.className 是否存在，严谨一点的写法是 this.className=='active'，更严谨一点的写法是 this.className.indexOf('active'!=-1)
			this.className='';
			
			for(var i=0;i<othersDd.length;i++){
				if(othersDd[i].className=='noclick'){
					othersDd[i].className='';
				}
			}
		}else{		//末选中状态
			//兄弟节点有选中
			for(var i=0;i<brothers.length;i++){
				if(brothers[i].className=='active'){
					brothers[i].className='';
				}
			}
			
			this.className='active';
			
			//对方节点
			for(var i=0;i<othersDd.length;i++){
				if(othersDd[i].className=='noclick'){
					othersDd[i].className='';
				}
				if(curData.skuMap[mergeId[i]].sellVolume==0){
					othersDd[i].className='noclick';
				}
			}
		}
		addNum();		//加减功能函数要在每一次 dd 点击事件发生时调用
	}
	
	//加减功能
	addNum();
	function addNum(){
		var actives=yx.ga('#productImg .format .active');		//获取到所有被选中的 dd
		var btnParent=yx.g('#productImg .number div');		//加、减、数字按钮的父级
		var btns=btnParent.children;		//加、减、数字按钮
		var ln=curData.skuSpecList.length;		//规格（类别）的数量
		
		//是否打开加减功能（加减按钮能否点击）
		//console.log(actives.length,ln)
		if(actives.length==ln){		//当选中的 dd 数量等于类别数量时，就表示所有类别都被选择了。因为上面的类别点击功能决定了每个类别只能选中一个选项。
			//这个条件成立说明用户选中所有的规格了，这个时候就要把加减的功能打开
			btnParent.className='';
			if(btns[1].value==1){
				btns[0].className="noClick"
			}
		}else{
			btnParent.className='noClick';
		}
		
		//减号点击
		btns[0].onclick=function(){
			if(btnParent.className||btns[1].value==1){		//当父级有 class（也就是 noClick，这种写法不是很严谨）或数量为 1 时，直接 return
				return;
			}
			btns[1].value--;		//这里是不需要对数量进行判断的，因为初始数量为 1，初始能点击的是加号按钮
			if(btns[1].value==1){		//当点击减号按钮，数量减 1 后变为 1 时，需要让减号按钮不可点击
				this.className="noClick"
			}
			/*if(btns[1].value>1){
				btns[1].value--;
				if(btns[1].value==1){
					this.className="noClick"
				}
			}*/
		};
		
		//input 点击
		btns[1].onfocus=function(){		//获取焦点事件
			if(btnParent.className){
				//如果父级是不能点击的时候，就要让输入框永远失去焦点
				this.blur();		//失去焦点
			}
		};
		
		//加号点击
		btns[2].onclick=function(){
			if(btnParent.className){
				return;
			}
			btns[0].className="";
			btns[1].value++;
			//数量增加一般没有上限，也可以根据库存数量或者人为设置的上限进行限制
		};
	}
})();


//加入购物车功能
(function(){
	yx.public.shopFn();
	
	var joinBtn=yx.g('#productImg .join');		//加入购物车按钮
	/*var lastNum=0;		//声明一个变量存储之前加入购物车的商品数量
	var lastID=null;		//声明一个变量存储之前加入购物车的商品规格*/
	var lastIndex={};		//声明一个变量存储之前加入购物车的商品规格以及对应的数量
	
	//初始时应该先读取一下 localStorage 中的数据，如果有的话更新 lastIndex
	for(attr1 in curData.skuMap){		//遍历数据中的商品规格
		for(attr2 in localStorage){		//遍历 localStorage 中本地数据
			if(attr1==attr2){		//如果有相同的 key 值说明之前往购物车中添加过这种商品
				//localStorage 中存储的 value 是字符串，需要用 JSON 方法将其转为对象，然后获取对象的 value
				console.log(JSON.parse(localStorage[attr2]))
				lastIndex[attr2]=JSON.parse(localStorage[attr2]).num
			}
		}
	}
	//console.log(lastIndex)
	
	//“加入购物车”按钮点击事件
	joinBtn.onclick=function(){
		clearTimeout(addTimer);		//先清除一下定时器，避免连续点击“加入购物车”时，购物车显示异常
		var actives=yx.ga('#productImg .format .active');			//选中规格的类别，必须要选中所有类别的规格
		var selectNum=Number(yx.g('#productImg .number input').value);		//用户选中的产品个数，商品数量要大于 0
		//上述两个条件都成立时才能加入购物车，否则要弹出提示
		if(actives.length<curData.skuSpecList.length || selectNum<1){
			alert('请选择正确的规格以及数量');
			return;
		}
		
		var id='';			//用拼接的 id 做为 key
		var spec=[];			//规格的组成有多种，所以放在一个数组里
		
		for(var i=0;i<actives.length;i++){
			id+=actives[i].getAttribute('data-id')+';';		//这样拼接会在结尾多一个分号
			spec.push(actives[i].innerHTML);
		}
		id=id.substring(0,id.length-1);		//通过字符串方法去掉最后一个字符：分号
		
		for(attr in lastIndex){		//遍历之前加入购物车的商品规格、数量的对象
			if(id==attr){		//如果当前商品规格在对象中，说明之前有往购物车中添加过该商品规格、数量
				selectNum=selectNum+lastIndex[attr]		//更新商品数量
			}
		}
		
		//这个对象用来存放商品的相关数据
		var select={
			//这里的 key 值必需要放在双引号里，因为后面会将其转换为 JSON 数据
			"id":id,
			"name":curData.name,
			"price":curData.retailPrice,
			"num":selectNum,
			"spec":spec,
			"img":curData.skuMap[id].picUrl,
			"sign":"productLocal"		//给自己的 local 取一个标识，避免取到其它人的 local
			//因为在页面中可能在其它地方也用了 localStorage，而在使用时需要用到对应的 localStorage
		};
		
		/*lastNum=select.num
		lastID=select.id
		lastIndex[lastID]=lastNum*/
		
		lastIndex[select.id]=select.num		//更新对象中的商品规格对应的数量
		//console.log(lastIndex)
		
		//把声明的对象存到 localStorage 里面
		//以 id 为 key，存储了商品相关数据的对象为 value
		localStorage.setItem(id,JSON.stringify(select));		//这里不能直接写 select，因为 localStorage 存储的是字符串，如果直接将对象作为参数传进去，会把对象转为字符串 [object Object]。
		//需要先通过 JSON.stringify(select) 将对象转为字符串（直接在对象外面加一对引号）
		
		//localStorage.clear()
		
		yx.public.shopFn();		//每一次点击后都调用一下 shopFn
		
		var cartWrap=yx.g('.cartWrap');
		//“加入购物车”按钮点击事件发生后，让购物车显示，购物车显示后需要调用购物车滚动条功能 scrollFn。这时候可以直接调用购物车的鼠标移入事件，因为这个事件就是让购物车显示，并调用购物车滚动条功能 scrollFn
		cartWrap.onmouseenter();		//这里相当于通过函数名的方式调用函数
		
		//2s 后让购物车主体隐藏
		var addTimer=setTimeout(function(){		//通过 var 声明的局部变量，会在局部函数内预解析，这样局部函数最前面需要清除定时器 addTimer 就不会报错
			yx.g('.cart').style.display='none';
		},2000);
		//问题：添加商品后，购物车显示，2s 后购物车隐藏。如果添加商品后立刻将鼠标移动到购物车上，购物车仍然 2s 后隐藏。需要让鼠标移动到购物车上时，购物车不隐藏。
		//解决：在购物车鼠标移入事件中清除定时器 addTimer。因为在 common.js 中给购物车添加了鼠标移入事件（on 方式），如果在这里继续以 on 方式添加鼠标移入事件，就会出现覆盖情况。
		//解决：可以通过 addEventListener() 给购物车添加多个鼠标移入事件，然后在这里清除定时器
		cartWrap.addEventListener("mouseenter",function(){
			clearTimeout(addTimer);
		})
	};
})();


//大家都在看
//数据是存放在 recommend_data.js 里
(function(){
	var ul=yx.g('#look ul');
	var str='';
	
	for(var i=0;i<recommendData.length;i++){
		str+='<li>'+
				'<a href="#"><img src="'+recommendData[i].listPicUrl+'"/></a>'+
				'<a href="#">'+recommendData[i].name+'</a>'+
				'<span>¥'+recommendData[i].retailPrice+'</span>'+
			'</li>';
	}
	ul.innerHTML=str;
	
	//调用组件
	var allLook=new Carousel();
	allLook.init({
		id:'allLook',
		autoplay:false,
		intervalTime:3000,
		loop:false,
		totalNum:8,
		moveNum:4,
		circle:false,
		moveWay:'position'
	});
	//调用自定义事件
	allLook.on('leftEnd',function(){
		this.prevBtn.style.background='#dddddd'
	})
	allLook.on('rightEnd',function(){
		this.nextBtn.style.background='#dddddd'
	})
	allLook.on('leftClick',function(){
		this.nextBtn.style.background='#d0c5af'
	})
	allLook.on('rightClick',function(){
		this.prevBtn.style.background='#d0c5af'
	})
})();


//详情功能
(function(){
	//详情与评价选项卡
	var buttons=yx.ga('#bottom .title a');		//获取到按钮
	var tabs=yx.ga('#bottom .content>div');		//获取到内容。（获取到 .content 下所有第一层 div）
	var ln=0;
	
	for(var i=0;i<buttons.length;i++){
		buttons[i].index=i;
		buttons[i].onclick=function(){
			buttons[ln].className='';
			tabs[ln].style.display='none';
			
			this.className='active';
			tabs[this.index].style.display='block';
			
			ln=this.index;
		};
	}
	
	//详情内容产品参数
	var tbody=yx.g('.details tbody');
	for(var i=0;i<curData.attrList.length;i++){
		/*
		 * 以 id=1143021 的产品为例
		 * 1、产品参数是以数组形式存储的，数组里存了 6 个对象，每个对象又包含两个数据，也就是总共需要 12 个 td，而结构里是每行 4 个 td，所以需要创建 3 个 tr。
		 * 2、一个对象里包含两个数据，就需要两个 td，所以每循环数组一次要创建两个 td
		 * 3、一个 tr 里包含了四个 td，所以循环两次数组创建一个 tr（也就是在 6 次循环里需要创建 3 个 tr）
		 * 
		 */
		
		if(i%2==0){		//i 的值为 0、2、4 时条件成立，也可以将条件设置为 (i+1)%2==0
			//这个条件是 2 的倍数
			var tr=document.createElement("tr");
		}
		
		//每次循环时创建两个 td，它们的内容分别为 attrName、attrValue
		var td1=document.createElement("td");
		td1.innerHTML=curData.attrList[i].attrName;
		var td2=document.createElement("td");
		td2.innerHTML=curData.attrList[i].attrValue;
		
		tr.appendChild(td1);
		tr.appendChild(td2);
		
		tbody.appendChild(tr);
	}
	
	//详情内容图片列表
	var img=yx.g('.details .img');
	img.innerHTML=curData.itemDetail.detailHtml;
})();


//评价功能
(function(){
	console.log(commentData);		//评价的内容放在 comment_data.js
	//修改标题上的文字（评价数量）
	var evaluateNum=commentData[pageId].data.result.length;		//当前评论的数量
	var evaluateText=evaluateNum>1000?'999+':evaluateNum;		//如果数量过大时让它显示为 999+
	yx.ga('#bottom .title a')[1].innerHTML='评价<span>（'+evaluateText+'）</span>';
	
	var allData=[[],[]];		//二维数组。第一个代表全部评价，第二个代表有图的评价
	for(var i=0;i<evaluateNum;i++){
		//把全部评论 push 到第一个数组
		allData[0].push(commentData[pageId].data.result[i]);
		
		//如果评论带图，就将数据 push 到第二个数组中
		if(commentData[pageId].data.result[i].picList.length){
			allData[1].push(commentData[pageId].data.result[i]);
		}
	}
	yx.ga('#bottom .eTitle span')[0].innerHTML='全部（'+allData[0].length+'）';
	yx.ga('#bottom .eTitle span')[1].innerHTML='有图（'+allData[1].length+'）';
	
	
	var curData=allData[0];			//代表当前显示的评论类型（全部或有图）
	var btns=yx.ga('#bottom .eTitle div');
	var ln=0;
	
	for(var i=0;i<btns.length;i++){
		btns[i].index=i;
		btns[i].onclick=function(){
			btns[ln].className='';
			this.className='active';
			
			ln=this.index;
			
			curData=allData[this.index];
			showComment(10,0);		//点击事件发生时调用显示评价函数，显示对应的评论
			
			createPage(10,curData.length);		//切换全部、有图时，调用生成页码函数，生成对应的页码
		};
	}
	
	
	//显示评价数据
	showComment(10,0);
	function showComment(pn,cn){
		//pn			一页显示几条
		//cn			现在是哪页（从第 0 页开始）
		
		var ul=yx.g('#bottom .border>ul');
		var dataStart=pn*cn;		//数据起始的值
		var dataEnd=dataStart+pn;		//数据结束的值
		
		//如果结束的值大于了数据的总量，循环的时候就会报错，所以要把结束的值改成数量总量
		if(dataEnd>curData.length){
			dataEnd=curData.length;
		}
		
		//主体结构
		var str='';
		ul.innerHTML='';
		for(var i=dataStart;i<dataEnd;i++){
			//var avatart=curData[i].frontUserAvatar?curData[i].frontUserAvatar:'images/avatar.png';		//设置头像地址。如果数据中有头像地址，就用数据中的地址，否则就用默认的头像。三目运算符
			var avatart=curData[i].frontUserAvatar||'images/avatar.png';		//逻辑或
			
			var smallImg='';		//小图的父级，要放在 if 外面，之所以放外面是因为当 if 条件不成立时，里面代码不会走，假如放在里面，也就不会声明 smallImg，这样下面代码中用到 smallImg 的地方就会报错。而放在外面声明的话，下面代码中用到 smallImg 的地方就不会报错。
			var dialog='';		//轮播图的父级，要放在 if 外面，原因同上。
			
			if(curData[i].picList.length){
				//这个条件满足的话，说明这条评论有小图以及轮播图
				var span='';			//小图片的父级是个 span 标签
				var li='';			//轮播图图片的父级是个 li 标签
				for(var j=0;j<curData[i].picList.length;j++){
					span+='<span><img src="'+curData[i].picList[j]+'" alt=""></span>';		//拼小图片结构
					li+='<li><img src="'+curData[i].picList[j]+'" alt=""></li>';		//拼轮播图结构
					//小图、大图的地址是一样的
				}
				
				smallImg='<div class="smallImg clearfix">'+span+'</div>';
				dialog='<div class="dialog" id="commmetImg'+i+'" data-imgnum="'+curData[i].picList.length+'">'+
								'<div class="carouselImgCon">'+
									'<ul>'+li+'</ul>'+
								'</div>'+
								'<div class="close">X</div>'+
							'</div>';
				//ID 不能重复，且在轮播图组件中需要用到，所以在 ID 后添加变量 i 加以区分。这里用 i 就是所有评论里的顺序，如果用 j 就是所有带图评论里的顺序。
				/*问题：
				1、轮播图组件 new 的时候是手动添加 ID 的，而这里无法手动添加。因为这里的结构是自动生成的，所以需要动态的去获取到 ID。
				2、轮播图组件 new 的时候需要输入图片总数，这里无法知道。所以在生成结构的时候添加一个自定义属性 data-imgnum，并把它的值设置为 curData[i].picList.length，这个值就是图片的数量。*/
			}
			
			str+='<li>'+
					'<div class="avatar">'+
						'<img src="'+avatart+'" alt="">'+
						'<a href="#" class="vip1"></a><span>'+curData[i].frontUserName+'</span>'+
					'</div>'+
					'<div class="text">'+
						'<p>'+curData[i].content+'</p>'+smallImg+
						'<div class="color clearfix">'+
							'<span class="left">'+curData[i].skuInfo+'</span>'+		//这里是隐式类型的数组转字符串。skuInfo 是一个数组，在字符串拼接时会自动转为字符串
							'<span class="right">'+yx.formatDate(curData[i].createTime)+'</span>'+		//调用 common.js 中的转换时间方法，将毫秒数转化为标准时间
						'</div>'+dialog+
					'</div>'+
				'</li>';
		}
		
		ul.innerHTML=str;
		
		showImg();
	}
	
	//调用轮播图组件
	function showImg(){
		var spans=yx.ga('#bottom .smallImg span');		//获取到的是评价里所有小图的父级 span 标签
		for(var i=0;i<spans.length;i++){
			
			spans[i].onclick=function(){
				var dialog=this.parentNode.parentNode.lastElementChild;		//获取到当前点击评价的轮播图（大图）父级
				var ul=dialog.firstElementChild.firstElementChild;		//获取到当前点击评价的 ul 标签
				var liWidth=yx.g('#bottom .carouselImgCon ul li:first-of-type').offsetWidth		//获取到子级 li 的宽度。584
				
				//点击哪张小图就显示对应的大图
				var spansCn=this.parentNode.querySelectorAll('span')		//当前点击的评论里所有小图的父级 span 标签
				for(var j=0;j<spansCn.length;j++){
					if(spansCn[j]==this){		//当条件成立时，则获取到点击的小图在当前评论所有小图中的索引值
						//console.log(imgIndex)
						
						//当这两个条件都成立时，表示大图已经显示且第二次点击同一个小图，这时就需要让大图隐藏
						if(dialog.style.opacity==1&&j==imgIndex){
							dialog.style.opacity=0;
							dialog.style.height=0;
							return;		//大图隐藏后终止后续代码
						}else{
							imgIndex=j;		//更新当前点击小图（显示大图）的索引值
						}
						//console.log(imgIndex)
						
						//ul.style.left=-liWidth*j+'px'		//改变图片父级的定位置，使显示的是小图对应的大图。li 的宽度乘以当前点击图片在当前评论中的索引值
						//move(ul,{left:-liWidth*j},300,'linear')		//调用 move 函数，添加运动效果
						//上面两行代码最终效果是一样的，区别在于第二行有动画效果
						
						//这个判断条件是为了根据大图显示与否来决定小图是否有运动的效果
						if(dialog.style.opacity==0){		//大图还未显示时
							ul.style.left=-liWidth*j+'px'		//直接显示对应的小图，不需要小图左右移动的动画效果
						}else{
							move(ul,{left:-liWidth*j},300,'linear')		//大图显示时（opacity 为 1），切换小图添加动画效果
						}
						
						//注意：上面这两个判断条件很类似的 if 判断语句不能合并为一个。合并为一个后，四个判断条件里只会执行一个判断条件里的代码，而我们需要的是第一个判断语句执行一个判断条件里的代码，第二个判断语句执行一个判断条件里的代码。
					}
				}
				
				//让大图显示（之所以把代码放到这里，是因为前面需要根据 opacity 值进行判断）
				dialog.style.opacity=1;
				dialog.style.height='510px';		//高度是在样式中设置的固定值
				
				
				//当大图显示时才调用轮播图组件，如果大图隐藏了直接 return
				var commentImg=new Carousel();
				commentImg.init({
					id:dialog.id,
					totalNum:dialog.getAttribute('data-imgnum'),
					autoplay:false,
					loop:false,
					moveNum:1,
					initImg:imgIndex,		//轮播图初始显示图片索引值。这里必需把索引值作为参数传到轮播图组件，不能在轮播图组件中直接获取全局变量 imgIndex 的值，因为这样会影响到其它调用轮播图组件的地方。
					circle:false,
					moveWay:'position'
				});
				//细节完善：这里还可以添加自定义事件：图片到边界时改变左右按钮的状态
				
				//关闭按钮
				var closeBtn=dialog.querySelector('.close');
				closeBtn.onclick=function(){
					dialog.style.opacity=0;
					dialog.style.height=0;
				};
			};
		}
	}
	
	//页码功能（翻页功能）
	createPage(10,curData.length);		//curData 表示当前条件下的评论数据（全部或有图），它的 length 即为当前评论的总数
	function createPage(pn,tn){
		//pn			显示页码的数量（每页显示的数据数量）
		//tn			数据的总数
		//n			每页显示的数据数量，这里先固定为 10
		var page=yx.g('.page');
		var totalNum=Math.ceil(tn/10);		//最多能显示的页码数量（数据总量除以每页显示的数据数量）。Math.ceil() 往上取整
		
		//如果用户给的页码数量比最大页码数量还要大，就把它的值改为最大页码数量
		if(pn>totalNum){
			pn=totalNum;
		}
		page.innerHTML='';		//因为页码会反复的创建，所以在开始时将它的 innerHTML 设为空，避免页码重复累加
		
		var cn=0;		//当前点击的页码的索引
		var last=0;		//用来储存上一次点击的数字页码的索引值
		var spans=[];		//用来存放页码中显示数字的页码按钮
		var div=document.createElement("div");
		div.className='mainPage';
		
		//创建页码的公用函数
		//这个函数是用来创建功能性页码按钮：首页、尾页、上一页、下一页
		function pageFn(inner,fn){
			//inner		页码按钮显示的内容，即它的 innerHTML
			//fn			页码按钮点击时需要执行的操作
			
			if(pn<2){		//如果页码数量没超过 2 页就不创建功能页码
				return;
			}
			
			var span=document.createElement("span");
			span.innerHTML=inner;
			span.onclick=fn;
			page.appendChild(span);
			
			return span;			//把创建的标签返回出去，在外面能用得到
		}
		
		//创建首页页码按钮
		//调用函数 pageFn，并把它的返回值赋给 indexPage。函数 pageFn 的返回值有可能为 undefined
		var indexPage=pageFn('首页',function(){
			for(var i=0;i<pn;i++){
				spans[i].innerHTML=i+1;
			}
			cn=0;		//修正当前点击数字按钮的索引值，last 值不需要在这里修改，而是在 changePage 里修改
			
			showComment(10,0);
			changePage();
		});
		//初始时让首页隐藏
		if(indexPage){		//加上判断条件是为了避免页码的数量小于 2 时，函数 pageFn 的返回值是 undefined，设置样式就会报错
			indexPage.style.display='none';
		}
		
		//创建上一页页码
		//调用函数 pageFn，并把它的返回值赋给 indexPage。函数 pageFn 的返回值有可能为 undefined
		var prvePage=pageFn('<上一页',function(){
			/*
			//这种写法是有问题的：当前选中按钮为 10 且它在数字按钮列表最左边时，点击上一页还是跳转到按钮 10
			 if(cn>0){
				cn--;
			}
			showComment(10,spans[cn].innerHTML-1);
			changePage();
			*/
			
			/*下列代码的逻辑：当前选中按钮为 10 且它在数字按钮列表最左边时，点击上一页应该跳转到 9。按钮 10 的索引值为 0，减 1 后为 -1，会报错，所以先执行点击按钮 10 的代码，目的是为了重新生成一个数字按钮列表（changePage），然后获取到按钮 10 在新的数字按钮列表中的索引值（这时候按钮 10 在新的数字按钮列表的最右边），将其减 1 后就是按钮 9 在新数字按钮列表中的索引值*/
			cn--;
			if(cn<0){		//当条件成立时，cn 的值为 -1，也就是 cn 的值原本为 0，cn-- 后为 -1。说明原本选中的是数字按钮中最左边的那个，现在要选中更左边的数字按钮。
				cn=0;		//所以先修正 cn 的值为 0（为 -1 时后面会报错），执行点击的是数字按钮中最左边按钮的情况
				changePage();		//调用 changePage，会生成一个新的数字按钮列表，并对 cn 以及相关数据的值进行修正，此时会获得一个新的 cn 值
				//console.log(cn)		//此时 cn 的值已经不是 0 了
				
				spans[cn].className='';		//去除在新数字按钮列表中的原本选中数字按钮（具有相同的 innerHTML/页码）
				cn--		//将索引值修正为原本选中的数字按钮的左边
				//console.log(cn)		//当前选中数字按钮的索引值
				
				spans[cn].className='active';		//给当前选中的数字按钮添加 active
				showComment(10,spans[cn].innerHTML-1);		//显示对应的评论
				last=cn		//修正上一次点击按钮的索引值
			}else{
				showComment(10,spans[cn].innerHTML-1);
				changePage();
			}
		});
		//初始时让上一页隐藏
		if(prvePage){		//加上判断条件是为了避免页码的数量小于 2 时，函数 pageFn 的返回值是 undefined，设置样式就会报错
			prvePage.style.display='none';
		}
		
		//创建数字页码
		for(var i=0;i<pn;i++){
			var span=document.createElement("span");
			span.index=i;
			span.innerHTML=i+1;		//i 从 0 开始，页码从 1 开始
			spans.push(span);
			
			//给第 1 个页码加上class
			span.className=i?'':'active';		//非 0 时为空，0 时为 active
			
			span.onclick=function(){
				cn=this.index;
				showComment(10,this.innerHTML-1);		//调用显示评论函数，参数一：每页显示几条评论，参数二：是第几页。页码是从 1 开始，而页码的索引是从 0 开始
				changePage();		//这里如果用 call(this) 调用会有局限性
			};
			
			div.appendChild(span);		//每一次循环都把创建的数字页码元素添加到它们的父级中
		}
		page.appendChild(div);
		
		
		//创建下一页页码
		var nextPage=pageFn('下一页>',function(){
			
			/*
			 if(cn<spans.length-1){
				cn++;
			}
			showComment(10,spans[cn].innerHTML-1);
			changePage();
			*/
			/*下列代码的逻辑：当前选中按钮为 11 且它在数字按钮列表最右边时，点击下一页应该跳转到 12。按钮 11 的索引值为 spans.length-1，加 1 后为 spans.length，会报错，所以先执行点击按钮 11 的代码，目的是为了重新生成一个数字按钮列表（changePage），然后获取到按钮 11 在新的数字按钮列表中的索引值（这时候按钮 11 在新的数字按钮列表的最左边），将其加 1 后就是按钮 12 在新数字按钮列表中的索引值*/
			cn++;
			if(cn>spans.length-1){
				cn=spans.length-1;
				changePage();
				//console.log(cn)
				
				spans[cn].className='';
				cn++
				//console.log(cn)
				
				spans[cn].className='active';
				showComment(10,spans[cn].innerHTML-1);
				last=cn
			}else{
				showComment(10,spans[cn].innerHTML-1);
				changePage();
			}
		});
		
		//创建尾页页码
		var endPage=pageFn('尾页',function(){
			var end=totalNum;		//声明一个变量存储 totalNum 的值，然后对这个变量进行相关操作，而不是直接去操作 totalNum，那样会改变 totalNum 的值，导致其它使用 totalNum 的地方出错。
			for(var i=pn-1;i>=0;i--){		//倒着循环，从最后一个数字页码开始
				spans[i].innerHTML=end--;
			}
			cn=spans.length-1;
			
			showComment(10,totalNum-1);
			changePage();
		});
		
		
		//更新页码功能
		function changePage(){
			var cur=spans[cn];		//当前点击的那个数字页码
			var curInner=cur.innerHTML;		//当前点击的数字页码的内容，后面需要用它做判断
			
			var differ=spans[spans.length-1].innerHTML-spans[0].innerHTML;		//差值：拿最后一个页码的数字减去第一个页码的数字，算出的差就是页码要增加或者减少的数量。同时在需要的时候修改这个差值，保证新生成的数字页码不会超出最大页码。点击的那个数字页码会出现在更新后的页码里面
			
			/*
			这里可以把判断条件里执行的代码合写到下面 for 循环里，加入合写的话，cur.innerHTML 的值要在 for 循环外面获取
			//如果点击的是最后一个数字页码（页码要增加）
			if(cur.index==spans.length-1){
				if(Number(cur.innerHTML)+differ>totalNum){		//大于左边界。innerHTML 返回的是字符串，需要转成数字再进行加法运算，否则会进行字符串拼接。
				//如果当前点击的数字按钮加上差值后的页码数值比总页码数还要大（右边到头了），说明页码的数值范围已经超出了，所以需要重新设置一下差值，让最大页码数为 totalNum
					differ=totalNum-cur.innerHTML;		//减号有隐式类型转换，会将字符串转为数字
					//修正 differ 的值为最大页码数减去当前点击的页码数
				}
			}
			
			//如果点击的是第一个数字页码（页码要减少）
			if(cur.index==0){
				if(cur.innerHTML-differ<1){		//小于右边界
					//如果当前点击的数字按钮减去差值后的页码数值比 1 还要小（左边到头了），说明页码的数值范围已经超出了，所以需要重新设置一下差值，让页码从 1 开始。
					differ=cur.innerHTML-1;
				}
			}*/
			
			//设置上一次点击的数字按钮的 class
			spans[last].className='';
			
			//不能在 for 循环里直接使用 cur.innerHTML，要先在外面获取（刚好前面声明变量获取了它的值 var curInner=cur.innerHTML;）。如果是在 for 循环里面获取，每一次循环的时候都会重新获取一下 cur.innerHTML 的值（用于条件判断），而它的值在 for 循环中会被修改，就会造成判断条件出现问题，从而导致得不到想要的结果。
			for(var i=0;i<spans.length;i++){
				//如果点击的是最后一个数字页码，那么所有的数字页码都需要进行增加
				if(cur.index==spans.length-1){
					
					if(Number(curInner)+differ>totalNum){		//大于左边界。innerHTML 返回的是字符串，需要转成数字再进行加法运算，否则会进行字符串拼接。
					//如果当前点击的数字按钮加上差值后的页码数值比总页码数还要大（右边到头了），说明页码的数值范围已经超出了，所以需要重新设置一下差值，让最大页码数为 totalNum
						differ=totalNum-cur.innerHTML;		//减号有隐式类型转换，会将字符串转为数字
						//修正 differ 的值为最大页码数减去当前点击的页码数
					}
					
					spans[i].innerHTML=Number(spans[i].innerHTML)+differ;
				}
				//如果点击的是第一个数字页码，那么所有的数字页码都需要进行减少
				if(cur.index==0){
					
					if(Number(curInner)-differ<1){		//小于右边界
					//如果当前点击的数字按钮减去差值后的页码数值比 1 还要小（左边到头了），说明页码的数值范围已经超出了，所以需要重新设置一下差值，让页码从 1 开始。
						differ=cur.innerHTML-1;
					}
					spans[i].innerHTML-=differ;
				}
				
				//设置 class
				//这里也可以通过 for 循环先将所有 span 的 class 设置为空，再给当前点击的 span 添加 active。
				//spans[i].className='';
				
				//因为数字页码的位置会发生变化，也就是内容对应的索引值会发生变化（eg：初始时点击页码 10，原本它的索引值为 9，点击后位置变为第一个，索引值为 0），所以不能直接给 cur 添加 active
				if(spans[i].innerHTML==curInner){		//在 for 循环中，循环判断所有数字页码的 innerHTML 是否和初始存储的当前点击数字页码的内容是否相同，条件成立时，给对应数字按钮添加 active
					spans[i].className='active';
					last=cn=spans[i].index;		//更新当前点击数字页码（也就是相对下一次点击的上一次点击数字页码）的索引值
				}
			}
			
			//显示与隐藏功能页码（当页码里面有功能页码也就是至少有两页时，才去执行下面的代码）
			//前面 pageFn 里已经对 pn 进行了判断，当 pn<2 时，直接 return，不会创建功能性页码元素，也就不存在显示与否了，所以这里不需要对 pn 值进行判断，因为代码走这里时，pn 必然大于 1
			/*if(pn>1){*/
				//当点的是第一个数字页码时，就让首页与上一页隐藏
				var dis=curInner==1?'none':'inline-block';		//把三目运算符的返回值赋值给 dis
				indexPage.style.display=prvePage.style.display=dis;
				
				//当点击的是最后一个数字页码时，就让下一页与尾页隐藏
				dis=curInner==totalNum?'none':'inline-block';
				nextPage.style.display=endPage.style.display=dis;
			/*}*/
			
		}
	};
})();
