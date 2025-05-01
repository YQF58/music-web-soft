<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">
    <meta name="renderer" content="webkit">
    <meta name="author" content="mengkun">
    <meta name="generator" content="KodCloud">
    <meta http-equiv="Cache-Control" content="no-siteapp">
    
    <!-- 强制移动设备以app模式打开页面(即在移动设备下全屏，仅支持部分浏览器) -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="full-screen" content="yes"><!--UC强制全屏-->
    <meta name="browsermode" content="application"><!--UC应用模式-->
    <meta name="x5-fullscreen" content="true"><!--QQ强制全屏-->
    <meta name="x5-page-mode" content="app"><!--QQ应用模式-->
    
    <title>有云音乐网</title>
    <meta name="description" content="一款开源的基于网易云音乐api的在线音乐播放器。具有音乐搜索、播放、下载、歌词同步显示、个人音乐播放列表同步等功能。"/>
    <meta name="keywords" content="云意播放器,在线音乐播放器,Tool2OnlinePlayer,网易云音乐,音乐api,音乐播放器源代码"/>
    
    <!-- 不支持IE8及以下版本浏览器 -->
    <!--[if lte IE 8]>
        <script>window.location.href="plugns/killie/"</script>
    <![endif]--> 
    
    <!-- favicon图标 -->
    <link rel="shortcut icon" href="favicon.ico">
    
    <!-- jQuery文件 -->
    <script src="js/jquery.min.js"></script>
    
    <!-- 播放器样式表文件 -->
    <link rel="stylesheet" type="text/css" href="css/player.css">
    
    <!-- 小屏幕样式修复 -->
    <link rel="stylesheet" type="text/css" href="css/small.css">
    
    <!-- 滚动条美化样式文件 -->
    <link rel="stylesheet" type="text/css" href="css/jquery.mCustomScrollbar.min.css">
    
    <!-- layer弹窗插件样式文件 -->
    <link rel="stylesheet" href="plugns/layer/skin/default/layer.css?v=3.0.2302" id="layuicss-skinlayercss">
</head>
<body>








<div id="blur-img"></div>

<!-- 头部logo -->
<div class="header">
    <div class="logo" title="Version 2.4; Based on Meting; Powered by Tool2">
        随身助手音乐
    </div>
</div>  <!--class="header"-->





<!-- 中间主体区域 -->
<div class="center">
    <div class="container">
        <div class="btn-bar">
            <!-- tab按钮区 -->
            <div class="btn-box" id="btn-area">
                <span class="btn" data-action="player" hidden>播放器</span>
                <span class="btn" data-action="playing" title="正在播放列表">正在播放</span>
                <span class="btn" data-action="sheet" title="音乐播放列表">播放列表</span>
                <span class="btn" data-action="search" title="点击搜索音乐">歌曲搜索</span>
            </div>
        </div>  <!--class="btn-bar"-->
        
        <div class="data-area">
            <!--歌曲歌单-->
            <div id="sheet" class="data-box" hidden></div>
            
            <!--音乐播放列表-->
            <div id="main-list" class="music-list data-box"></div>
        </div>  <!--class="data-area"-->
        
        <!-- 右侧封面及歌词展示 -->
        <div class="player" id="player">
            <!--歌曲封面-->
            <div class="cover">
                <img src="images/player_cover.png" class="music-cover" id="music-cover">
            </div>
            <!--滚动歌词-->
            <div class="lyric">
                <ul id="lyric"></ul>
            </div>
            <div id="music-info" title="点击查看歌曲信息"></div>
        </div>
    </div>  <!--class="container"-->
</div>  <!--class="center"-->

<!-- 播放器底部区域 -->
<div class="footer">
    <div class="container">
        <div class="con-btn">
            <a href="javascript:;" class="player-btn btn-prev" title="上一首"></a>
            <a href="javascript:;" class="player-btn btn-play" title="暂停/继续"></a>
            <a href="javascript:;" class="player-btn btn-next" title="下一首"></a>
			<a href="javascript:;" class="player-btn btn-order" title="循环控制"></a>
        </div>  <!--class="con-btn"-->
        
        <div class="vol">
            <div class="quiet">
                <a href="javascript:;" class="player-btn btn-quiet" title="静音"></a>
            </div>
            <div class="volume">
                <div class="volume-box">  
                    <div id="volume-progress" class="mkpgb-area"></div>
                </div>
            </div>
        </div>  <!--class="footer"-->
        
        <div class="progress">
            <div class="progress-box">  
                <div id="music-progress" class="mkpgb-area"></div>
            </div>
        </div>  <!--class="progress"-->
    </div>  <!--class="container"-->
</div>  <!--class="footer"-->




<!-- 弹窗代码开始 blog.bin00.com -->
<div class="web_notice" style="position: fixed;top: 0;left: 0;width: 50%;height: 30%;background: rgba(0,0,0,0.3);z-index: 99999;">
<div style="position: fixed;top: 50%;left: 50%;width: 300px;background: #FFF;transform: translate(-50%, -50%);border-radius: 40px;padding: 50px 40px;">
<h3 style="font-weight: bold;text-align: center;font-size: 30px;
">有云音乐平台</h3><div style="font-size: 16px;margin-top: 26px;line-height: 30px;color: #999;
">一切都是为了更好的服务您<a href=""><b>有云音乐</b></a></div><a style="display: block;background: #98a3ff;color: #FFF;text-align: center;font-weight: bold;font-size: 19px;line-height: 60px;margin: 0 auto;margin-top: 45px;border-radius: 32px;width:50%;" onclick="javascript:document.querySelector('.web_notice').remove()">我知道了</ a></div></div>
<!-- 弹窗代码结束 blog.bin00.com -->






<!-- layer弹窗插件 -->
<script src="plugns/layer/layer.js"></script>

<!-- 播放器数据加载模块 -->
<script src="js/ajax.js"></script>

<!-- 播放器歌词解析模块 -->
<script src="js/lyric.js"></script>

<!-- 音乐列表配置 -->
<script src="js/musicList.js"></script>

<!-- 封装函数及ui交互模块 -->
<script src="js/functions.js?=r20210628"></script>

<!-- 播放器主体功能模块 -->
<script src="js/player.js"></script>

<!-- 滚动条美化插件 -->
<script src="js/jquery.mCustomScrollbar.concat.min.js"></script>

<!-- 背景模糊化插件 -->
<script src="js/background-blur.min.js"></script>

<!-- 站长统计代码 -->
<span style="display: none">
     <script type="text/javascript" src=""></script>
</span>

</body>
</html>