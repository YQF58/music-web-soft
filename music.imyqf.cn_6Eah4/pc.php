<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0, viewport-fit=cover">
    <meta name="renderer" content="webkit">
    <meta name="author" content="mengkun">
    <meta name="generator" content="KodCloud">
    <meta http-equiv="Cache-Control" content="no-siteapp">
    <meta name="theme-color" content="#080a12">
    
    <!-- 强制移动设备以app模式打开页面(即在移动设备下全屏，仅支持部分浏览器) -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="full-screen" content="yes"><!--UC强制全屏-->
    <meta name="browsermode" content="application"><!--UC应用模式-->
    <meta name="x5-fullscreen" content="true"><!--QQ强制全屏-->
    <meta name="x5-page-mode" content="app"><!--QQ应用模式-->
    
    <title>YQF 音乐 — 沉浸式在线音乐播放器</title>
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

    <!-- 视觉主题与背景交互（不参与播放器核心逻辑） -->
    <script src="js/aurora.js?v=20260811-4"></script>
    
    <!-- 播放器样式表文件 -->
    <link rel="stylesheet" type="text/css" href="css/player.css">
    
    <!-- 小屏幕样式修复 -->
    <link rel="stylesheet" type="text/css" href="css/small.css">
    
    <!-- 滚动条美化样式文件 -->
    <link rel="stylesheet" type="text/css" href="css/jquery.mCustomScrollbar.min.css">
    
    <!-- layer弹窗插件样式文件 -->
    <link rel="stylesheet" href="plugns/layer/skin/default/layer.css?v=3.0.2302" id="layuicss-skinlayercss">

    <!-- 液态玻璃视觉主题（最后加载以覆盖旧版视觉） -->
    <link rel="stylesheet" type="text/css" href="css/aurora.css?v=20260811-4">
</head>
<body class="music-app is-booting">

<div class="startup-screen" id="startup-screen" role="status" aria-live="polite" aria-label="YQF 音乐正在启动">
    <div class="startup-screen__aura startup-screen__aura--one" aria-hidden="true"></div>
    <div class="startup-screen__aura startup-screen__aura--two" aria-hidden="true"></div>
    <div class="startup-screen__content">
        <div class="startup-screen__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
                <path d="M12 23V8.5l12-2.7v13.4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19.9c-3.5-.7-6.4.7-6.4 3.1 0 1.9 2 3 4.3 2.4 1.5-.4 2.1-1.3 2.1-2.4m12-7c-3.5-.7-6.4.7-6.4 3.1 0 1.9 2 3 4.3 2.4 1.5-.4 2.1-1.3 2.1-2.4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="startup-equalizer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <p class="startup-screen__eyebrow">YOUR PRIVATE SOUNDSCAPE</p>
        <h1>YQF <span>音乐</span></h1>
        <p class="startup-screen__copy">正在准备你的私人声场</p>
        <div class="startup-progress" aria-hidden="true"><span></span></div>
    </div>
</div>

<div class="scene-background" aria-hidden="true">
    <img class="scene-background__image" src="https://api.imyqf.cn/imgapi/" alt="" decoding="async" fetchpriority="high" referrerpolicy="no-referrer">
</div>
<div class="scene-scrim" aria-hidden="true"></div>
<div class="ambient-orb ambient-orb--one" aria-hidden="true"></div>
<div class="ambient-orb ambient-orb--two" aria-hidden="true"></div>

<div id="blur-img"></div>

<!-- 头部logo -->
<div class="header">
    <div class="brand">
        <div class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9.2 17.4V6.7l9-1.9v10.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.2 15.1c-2.5-.5-4.7.6-4.7 2.3 0 1.4 1.5 2.2 3.2 1.8 1.1-.3 1.5-.9 1.5-1.8m9-4.7c-2.5-.5-4.7.6-4.7 2.3 0 1.4 1.5 2.2 3.2 1.8 1.1-.3 1.5-.9 1.5-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="brand-copy">
            <div class="logo" title="YQF Music · Based on Meting">YQF 音乐</div>
            <span class="brand-subtitle">Music for every moment</span>
        </div>
    </div>
    <div class="header-actions">
        <div class="live-pill" aria-label="音乐服务在线">
            <span class="live-dot" aria-hidden="true"></span>
            <span>音乐在线</span>
        </div>
        <button class="utility-btn background-refresh" type="button" data-background-refresh aria-label="换一张背景" title="换一张背景">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 11a8 8 0 1 0-2.3 5.7" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M20 5v6h-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <button class="utility-btn theme-toggle" type="button" data-theme-toggle aria-label="切换主题" title="切换主题">
            <svg class="theme-icon--moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15Z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg class="theme-icon--sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3.6" stroke-width="1.8"/>
                <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <span class="sr-only">切换深浅色主题</span>
        </button>
    </div>
</div>  <!--class="header"-->

<!-- 中间主体区域 -->
<div class="center">
    <div class="container">
        <div class="btn-bar">
            <!-- tab按钮区 -->
            <div class="btn-box" id="btn-area">
                <span class="btn" data-action="player">播放器</span>
                <span class="btn" data-action="playing" title="正在播放列表">正在播放</span>
                <span class="btn" data-action="sheet" title="音乐播放列表">播放列表</span>
                <span class="btn" data-action="search" title="点击搜索音乐">歌曲搜索</span>
            </div>
        </div>  <!--class="btn-bar"-->
        
        <div class="data-area">
            <!--歌曲歌单-->
            <div id="sheet" class="data-box"></div>
            
            <!--音乐播放列表-->
            <div id="main-list" class="music-list data-box"></div>
        </div>  <!--class="data-area"-->
        
        <!-- 右侧封面及歌词展示 -->
        <div class="player" id="player">
            <!--歌曲封面-->
            <div class="cover">
                <img src="images/player_cover.png" class="music-cover" id="music-cover" alt="当前歌曲封面">
            </div>
            <div class="track-glance" aria-live="polite">
                <strong id="visual-track-title">静候旋律</strong>
                <span id="visual-track-artist">选择一首喜欢的音乐</span>
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








<!-- layer弹窗插件 -->
<script src="plugns/layer/layer.js"></script>

<!-- 播放器数据加载模块 -->
<script src="js/ajax.js?v=20260811-4"></script>

<!-- 播放器歌词解析模块 -->
<script src="js/lyric.js?v=20260811-4"></script>

<!-- 音乐列表配置 -->
<script src="js/musicList.js"></script>

<!-- 封装函数及ui交互模块 -->
<script src="js/functions.js?v=20260811-2"></script>

<!-- 播放器主体功能模块 -->
<script src="js/player.js?v=20260811-2"></script>

<!-- 滚动条美化插件 -->
<script src="js/jquery.mCustomScrollbar.concat.min.js"></script>

<!-- 背景模糊化插件 -->
<script src="js/background-blur.min.js"></script>

</body>
</html>
