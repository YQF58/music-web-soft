/**
 * YQF Music visual enhancements.
 * Theme, background and purely presentational state only — no player/API logic.
 */
(function () {
    "use strict";

    var root = document.documentElement;
    var themeStorageKey = "yqf-visual-theme";
    var backgroundEndpoint = "https://api.imyqf.cn/imgapi/";
    var explicitTheme = null;

    try {
        explicitTheme = window.localStorage.getItem(themeStorageKey);
    } catch (error) {
        explicitTheme = null;
    }

    if (explicitTheme !== "light" && explicitTheme !== "dark") {
        explicitTheme = null;
    }

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            return "light";
        }
        return "dark";
    }

    function getInitialTheme() {
        return explicitTheme === "light" || explicitTheme === "dark" ? explicitTheme : getSystemTheme();
    }

    function updateThemeMeta(theme) {
        var themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) {
            themeMeta.setAttribute("content", theme === "light" ? "#eef1f8" : "#080a12");
        }
    }

    function updateThemeButtons(theme) {
        var buttons = document.querySelectorAll("[data-theme-toggle]");
        var nextLabel = theme === "light" ? "切换到深色模式" : "切换到浅色模式";

        for (var index = 0; index < buttons.length; index += 1) {
            buttons[index].setAttribute("aria-label", nextLabel);
            buttons[index].setAttribute("title", nextLabel);
            buttons[index].setAttribute("aria-pressed", theme === "light" ? "true" : "false");
        }
    }

    function applyTheme(theme, shouldPersist) {
        root.setAttribute("data-theme", theme);
        updateThemeMeta(theme);
        updateThemeButtons(theme);

        if (shouldPersist) {
            explicitTheme = theme;
            try {
                window.localStorage.setItem(themeStorageKey, theme);
            } catch (error) {
                // The visual theme still works when storage is unavailable.
            }
        }
    }

    // Apply before the full document is parsed to minimize a theme flash.
    applyTheme(getInitialTheme(), false);

    function toggleTheme() {
        var nextTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(nextTheme, true);
    }

    function refreshBackground(button) {
        var backdrop = document.querySelector(".scene-background");
        var currentImage = backdrop ? backdrop.querySelector(".scene-background__image:not(.scene-background__image--next)") : null;
        var image = new Image();
        var separator = backgroundEndpoint.indexOf("?") === -1 ? "?" : "&";
        var nextImage = backgroundEndpoint + separator + "refresh=" + Date.now();

        if (!backdrop || backdrop.classList.contains("is-loading")) {
            return;
        }

        backdrop.classList.add("is-loading");
        if (button) {
            button.classList.add("is-spinning");
            button.disabled = true;
        }

        function finishLoading() {
            backdrop.classList.remove("is-loading");
            if (button) {
                button.classList.remove("is-spinning");
                button.disabled = false;
            }
        }

        image.onload = function () {
            image.className = "scene-background__image scene-background__image--next";
            image.alt = "";
            image.setAttribute("aria-hidden", "true");
            backdrop.appendChild(image);

            window.requestAnimationFrame(function () {
                image.classList.add("is-visible");
                if (currentImage) {
                    currentImage.classList.add("is-leaving");
                }
            });

            window.setTimeout(function () {
                if (currentImage && currentImage.parentNode) {
                    currentImage.parentNode.removeChild(currentImage);
                }
                image.classList.remove("scene-background__image--next", "is-visible");
                finishLoading();
            }, 720);
        };

        image.onerror = function () {
            finishLoading();
            if (button) {
                button.classList.add("has-error");
                window.setTimeout(function () {
                    button.classList.remove("has-error");
                }, 1200);
            }
        };

        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.src = nextImage;
    }

    function closeNotice(notice) {
        if (!notice || notice.classList.contains("is-closing")) {
            return;
        }

        notice.classList.add("is-closing");
        window.setTimeout(function () {
            if (notice.parentNode) {
                notice.parentNode.removeChild(notice);
            }
        }, 240);
    }

    function createEnhancedUi() {
        var headerActions = document.querySelector(".header-actions");
        var refreshButton = document.querySelector("[data-background-refresh]");
        var compactPlayer = document.getElementById("player");

        if (headerActions && !document.querySelector("[data-focus-open].header-focus-launch")) {
            var headerLaunch = document.createElement("button");
            headerLaunch.className = "utility-btn header-focus-launch";
            headerLaunch.type = "button";
            headerLaunch.setAttribute("data-focus-open", "");
            headerLaunch.setAttribute("aria-label", "打开沉浸播放");
            headerLaunch.setAttribute("title", "沉浸播放");
            headerLaunch.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5m13 5h5v-5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            headerActions.insertBefore(headerLaunch, refreshButton || null);
        }

        if (compactPlayer && !compactPlayer.querySelector("[data-focus-open]")) {
            compactPlayer.insertAdjacentHTML("afterbegin", '<button class="focus-entry" type="button" data-focus-open><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5m13 5h5v-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>沉浸播放</span></button>');
        }

        if (!document.getElementById("search-overlay")) {
            document.body.insertAdjacentHTML("beforeend", `
                <div class="search-overlay" id="search-overlay" hidden aria-hidden="true">
                    <button class="search-overlay__backdrop" type="button" data-close-search tabindex="-1" aria-label="关闭搜索"></button>
                    <section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="search-panel-title">
                        <span class="search-panel__glow" aria-hidden="true"></span>
                        <header class="search-panel__header">
                            <div class="search-panel__heading">
                                <span class="search-panel__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none"><circle cx="10.7" cy="10.7" r="6.2" stroke="currentColor" stroke-width="1.8"/><path d="m15.4 15.4 4.1 4.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                                </span>
                                <div><span>EXPLORE MUSIC</span><h2 id="search-panel-title">搜索你的下一首歌</h2></div>
                            </div>
                            <button class="search-panel__close" type="button" data-close-search aria-label="关闭搜索">&times;</button>
                        </header>
                        <form onsubmit="return searchSubmit()">
                            <div id="search-area">
                                <div class="search-group">
                                    <label class="search-input-shell" for="search-wd">
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.2" stroke="currentColor" stroke-width="1.8"/><path d="m15.4 15.4 4.1 4.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                                        <input type="search" name="wd" id="search-wd" maxlength="80" autocomplete="off" placeholder="输入歌手、歌曲或专辑" required>
                                    </label>
                                    <button class="search-submit" type="submit"><span>搜索音乐</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                                </div>
                                <div class="source-heading"><span>选择音乐源</span><small>部分歌曲受版权限制可能无法播放</small></div>
                                <div class="radio-group source-grid" id="music-source">
                                    <label class="source-option source-option--netease"><input type="radio" name="source" value="netease" checked><span class="source-option__mark">云</span><span class="source-option__copy"><strong>网易云</strong><small>热门曲库</small></span><i></i></label>
                                    <label class="source-option source-option--tencent"><input type="radio" name="source" value="tencent"><span class="source-option__mark">Q</span><span class="source-option__copy"><strong>QQ 音乐</strong><small>流行音乐</small></span><i></i></label>
                                    <label class="source-option source-option--kugou"><input type="radio" name="source" value="kugou"><span class="source-option__mark">K</span><span class="source-option__copy"><strong>酷狗</strong><small>备用搜索</small></span><i></i></label>
                                </div>
                                <p class="search-panel__tip"><span aria-hidden="true">↵</span> 输入关键词后按 Enter 即可搜索</p>
                            </div>
                        </form>
                    </section>
                </div>
            `);
        }

        if (!document.getElementById("focus-player")) {
            document.body.insertAdjacentHTML("beforeend", `
                <section class="focus-player" id="focus-player" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="focus-track-title">
                    <div class="focus-player__shade" aria-hidden="true"></div>
                    <img class="focus-player__art-glow" data-focus-art-glow src="images/player_cover.png" alt="" aria-hidden="true">
                    <header class="focus-player__topbar">
                        <div class="focus-player__brand"><span class="live-dot" aria-hidden="true"></span><span>YQF IMMERSIVE</span></div>
                        <div class="focus-player__top-actions">
                            <span class="focus-player__hint">ESC 退出</span>
                            <button class="focus-player__close" type="button" data-focus-close aria-label="退出沉浸播放"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
                        </div>
                    </header>
                    <div class="focus-player__layout">
                        <section class="focus-player__artwork-column">
                            <div class="focus-player__artwork-shell">
                                <span class="focus-player__orbit" aria-hidden="true"></span>
                                <img class="focus-player__cover" data-focus-cover src="images/player_cover.png" alt="当前歌曲封面">
                                <span class="focus-player__vinyl-center" aria-hidden="true"></span>
                            </div>
                            <div class="focus-player__meta">
                                <span class="focus-player__eyebrow" data-focus-source>NOW PLAYING</span>
                                <h2 id="focus-track-title" data-focus-title>静候旋律</h2>
                                <p data-focus-artist>选择一首喜欢的音乐</p>
                                <small data-focus-album>YQF MUSIC</small>
                            </div>
                        </section>
                        <section class="focus-player__lyrics-column">
                            <header><div><span>LYRICS</span><h3>歌词</h3></div><small data-focus-status>准备播放</small></header>
                            <div class="focus-player__lyrics-viewport" data-focus-lyrics-viewport>
                                <ul class="focus-player__lyrics-list" data-focus-lyrics><li class="focus-player__line focus-player__line--empty">选择一首歌曲，歌词将在这里流动</li></ul>
                            </div>
                        </section>
                    </div>
                    <footer class="focus-player__controls">
                        <div class="focus-player__timeline">
                            <span data-focus-current>00:00</span>
                            <button class="focus-player__seek" type="button" data-focus-seek role="slider" aria-label="调整播放进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="00:00 / 00:00"><i data-focus-progress></i><output class="focus-player__seek-preview" data-focus-preview>00:00</output></button>
                            <span data-focus-duration>00:00</span>
                        </div>
                        <div class="focus-player__transport">
                            <button type="button" data-focus-action="prev" aria-label="上一首"><span class="focus-control-prev" aria-hidden="true"></span></button>
                            <button class="focus-player__play" type="button" data-focus-action="play" aria-label="播放或暂停"><span aria-hidden="true"></span></button>
                            <button type="button" data-focus-action="next" aria-label="下一首"><span class="focus-control-next" aria-hidden="true"></span></button>
                        </div>
                    </footer>
                </section>
            `);
        }
    }

    function finishStartup() {
        var startup = document.getElementById("startup-screen");
        if (!startup) {
            document.body.classList.remove("is-booting");
            return;
        }

        window.setTimeout(function () {
            startup.classList.add("is-leaving");
            document.body.classList.remove("is-booting");
            window.setTimeout(function () {
                if (startup.parentNode) {
                    startup.parentNode.removeChild(startup);
                }
            }, 720);
        }, 1050);
    }

    var focusReturnTarget = null;

    function openFocusPlayer(trigger) {
        var focusPlayer = document.getElementById("focus-player");
        if (!focusPlayer) {
            return;
        }
        if (typeof closeSearchBox === "function") {
            closeSearchBox();
        }
        focusReturnTarget = trigger || document.activeElement;
        focusPlayer.removeAttribute("hidden");
        focusPlayer.setAttribute("aria-hidden", "false");
        syncTrackMeta();
        rebuildFocusLyrics();
        syncFocusProgress();
        window.requestAnimationFrame(function () {
            focusPlayer.classList.add("is-open");
            document.body.classList.add("is-focus-player-open");
            var closeButton = focusPlayer.querySelector("[data-focus-close]");
            if (closeButton) {
                closeButton.focus();
            }
        });
    }

    function closeFocusPlayer() {
        var focusPlayer = document.getElementById("focus-player");
        if (!focusPlayer || focusPlayer.hasAttribute("hidden")) {
            return;
        }
        focusPlayer.classList.remove("is-open");
        focusPlayer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-focus-player-open");
        window.setTimeout(function () {
            if (!focusPlayer.classList.contains("is-open")) {
                focusPlayer.setAttribute("hidden", "hidden");
            }
        }, 460);
        if (focusReturnTarget && typeof focusReturnTarget.focus === "function") {
            focusReturnTarget.focus();
        }
    }

    function getCurrentMusic() {
        if (typeof rem === "undefined" || typeof musicList === "undefined" || rem.playid === undefined || rem.playid < 0) {
            return null;
        }
        if (musicList[1] && musicList[1].item && musicList[1].item[rem.playid]) {
            return musicList[1].item[rem.playid];
        }
        if (rem.playlist !== undefined && musicList[rem.playlist] && musicList[rem.playlist].item) {
            return musicList[rem.playlist].item[rem.playid] || null;
        }
        return null;
    }

    function getCleanText(element) {
        if (!element) {
            return "";
        }
        return (element.textContent || element.innerText || "").replace(/\s+/g, " ").trim();
    }

    function syncTrackMeta() {
        var music = getCurrentMusic();
        var playingRow = document.querySelector("#main-list .list-playing");
        var title = music && music.name ? music.name : "";
        var artist = music && music.artist ? music.artist : "";
        var album = music && music.album ? music.album : "";
        var source = music && music.source ? music.source : "";

        if (!title && playingRow) {
            title = getCleanText(playingRow.querySelector(".music-name-cult") || playingRow.querySelector(".music-name"));
            artist = getCleanText(playingRow.querySelector(".auth-name"));
            album = getCleanText(playingRow.querySelector(".music-album"));
        }

        title = title || "静候旋律";
        artist = artist || "选择一首喜欢的音乐";
        album = album || "YQF MUSIC";

        var titleTargets = document.querySelectorAll("#visual-track-title, [data-focus-title]");
        var artistTargets = document.querySelectorAll("#visual-track-artist, [data-focus-artist]");
        var albumTargets = document.querySelectorAll("[data-focus-album]");
        var sourceTargets = document.querySelectorAll("[data-focus-source]");
        var sourceNames = {
            netease: "NETEASE · NOW PLAYING",
            tencent: "QQ MUSIC · NOW PLAYING",
            kugou: "KUGOU · NOW PLAYING"
        };

        for (var titleIndex = 0; titleIndex < titleTargets.length; titleIndex += 1) {
            titleTargets[titleIndex].textContent = title;
            titleTargets[titleIndex].setAttribute("title", title);
        }
        for (var artistIndex = 0; artistIndex < artistTargets.length; artistIndex += 1) {
            artistTargets[artistIndex].textContent = artist;
            artistTargets[artistIndex].setAttribute("title", artist);
        }
        for (var albumIndex = 0; albumIndex < albumTargets.length; albumIndex += 1) {
            albumTargets[albumIndex].textContent = album;
        }
        for (var sourceIndex = 0; sourceIndex < sourceTargets.length; sourceIndex += 1) {
            sourceTargets[sourceIndex].textContent = sourceNames[source] || "NOW PLAYING";
        }

        var compactCover = document.getElementById("music-cover");
        var coverSource = compactCover ? compactCover.getAttribute("src") : "";
        if (coverSource) {
            var focusCover = document.querySelector("[data-focus-cover]");
            var focusGlow = document.querySelector("[data-focus-art-glow]");
            if (focusCover && focusCover.getAttribute("src") !== coverSource) {
                focusCover.setAttribute("src", coverSource);
                focusCover.setAttribute("alt", title + " 的歌曲封面");
            }
            if (focusGlow && focusGlow.getAttribute("src") !== coverSource) {
                focusGlow.setAttribute("src", coverSource);
            }
        }
    }

    function syncPlaybackState() {
        var playButton = document.querySelector(".btn-play");
        if (!playButton || !document.body) {
            return;
        }
        var isPlaying = playButton.classList.contains("btn-state-paused");
        document.body.classList.toggle("is-playing", isPlaying);
        var focusStatus = document.querySelector("[data-focus-status]");
        if (focusStatus) {
            focusStatus.textContent = isPlaying ? "正在播放" : (getCurrentMusic() ? "已暂停" : "准备播放");
        }
        syncTrackMeta();
    }

    function rebuildFocusLyrics() {
        var source = document.getElementById("lyric");
        var target = document.querySelector("[data-focus-lyrics]");
        if (!source || !target) {
            return;
        }

        target.innerHTML = "";
        if (!source.children.length) {
            target.innerHTML = '<li class="focus-player__line focus-player__line--empty">选择一首歌曲，歌词将在这里流动</li>';
            return;
        }

        var fragment = document.createDocumentFragment();
        for (var index = 0; index < source.children.length; index += 1) {
            var sourceLine = source.children[index];
            var line = document.createElement("li");
            line.className = "focus-player__line";
            line.setAttribute("data-focus-line", index);
            var sourceOriginal = sourceLine.querySelector(".lrc-original");
            var sourceTranslation = sourceLine.querySelector(".lrc-translation");
            if (sourceOriginal) {
                var originalLine = document.createElement("span");
                originalLine.className = "focus-player__line-original";
                originalLine.textContent = getCleanText(sourceOriginal) || " ";
                line.appendChild(originalLine);

                if (sourceTranslation && getCleanText(sourceTranslation)) {
                    var translatedLine = document.createElement("small");
                    translatedLine.className = "focus-player__line-translation";
                    translatedLine.textContent = getCleanText(sourceTranslation);
                    line.appendChild(translatedLine);
                }
            } else {
                line.textContent = getCleanText(sourceLine) || " ";
            }
            if (sourceLine.classList.contains("lyric-tip")) {
                line.classList.add("focus-player__line--empty");
            }
            if (sourceLine.classList.contains("lplaying")) {
                line.classList.add("is-current");
            }
            fragment.appendChild(line);
        }
        target.appendChild(fragment);
        syncFocusLyricActive(false);
    }

    function syncFocusLyricActive(shouldAnimate) {
        var source = document.getElementById("lyric");
        var target = document.querySelector("[data-focus-lyrics]");
        var viewport = document.querySelector("[data-focus-lyrics-viewport]");
        if (!source || !target || !viewport) {
            return;
        }

        var activeIndex = -1;
        for (var index = 0; index < source.children.length; index += 1) {
            if (source.children[index].classList.contains("lplaying")) {
                activeIndex = index;
                break;
            }
        }

        var focusLines = target.querySelectorAll("[data-focus-line]");
        for (var lineIndex = 0; lineIndex < focusLines.length; lineIndex += 1) {
            focusLines[lineIndex].classList.toggle("is-current", lineIndex === activeIndex);
        }

        if (activeIndex >= 0 && focusLines[activeIndex]) {
            var nextTop = focusLines[activeIndex].offsetTop - (viewport.clientHeight / 2) + (focusLines[activeIndex].offsetHeight / 2);
            if (viewport.scrollTo) {
                viewport.scrollTo({top: Math.max(0, nextTop), behavior: shouldAnimate === false ? "auto" : "smooth"});
            } else {
                viewport.scrollTop = Math.max(0, nextTop);
            }
        }
    }

    var focusAudio = null;
    var focusSeekDragging = false;
    var focusSeekPointerId = null;
    var focusSeekSuppressClick = false;

    function formatFocusTime(value) {
        if (!isFinite(value) || value < 0) {
            return "00:00";
        }
        var minutes = Math.floor(value / 60);
        var seconds = Math.floor(value % 60);
        return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    function renderFocusProgress(current, duration) {
        var currentTarget = document.querySelector("[data-focus-current]");
        var durationTarget = document.querySelector("[data-focus-duration]");
        var progressTarget = document.querySelector("[data-focus-progress]");
        var previewTarget = document.querySelector("[data-focus-preview]");
        var seekTarget = document.querySelector("[data-focus-seek]");
        var percent = duration > 0 ? Math.min(100, Math.max(0, current / duration * 100)) : 0;
        if (currentTarget) currentTarget.textContent = formatFocusTime(current);
        if (durationTarget) durationTarget.textContent = formatFocusTime(duration);
        if (progressTarget) progressTarget.style.width = percent + "%";
        if (previewTarget) previewTarget.textContent = formatFocusTime(current);
        if (seekTarget) {
            seekTarget.style.setProperty("--focus-seek-position", percent + "%");
            seekTarget.setAttribute("aria-valuenow", Math.round(percent));
            seekTarget.setAttribute("aria-valuetext", formatFocusTime(current) + " / " + formatFocusTime(duration));
        }
    }

    function syncFocusProgress() {
        if (focusSeekDragging) {
            return;
        }
        var current = focusAudio ? focusAudio.currentTime : 0;
        var duration = focusAudio && isFinite(focusAudio.duration) ? focusAudio.duration : 0;
        renderFocusProgress(current, duration);
    }

    function commitFocusSeek(time) {
        if (!focusAudio || !isFinite(focusAudio.duration) || focusAudio.duration <= 0) {
            return;
        }
        focusAudio.currentTime = Math.min(focusAudio.duration, Math.max(0, time));
        if (typeof refreshLyric === "function") {
            refreshLyric(focusAudio.currentTime);
        }
        renderFocusProgress(focusAudio.currentTime, focusAudio.duration);
    }

    function previewFocusSeek(clientX, shouldCommit) {
        var seekTarget = document.querySelector("[data-focus-seek]");
        if (!seekTarget || !focusAudio || !isFinite(focusAudio.duration) || focusAudio.duration <= 0) {
            return;
        }
        var seekRect = seekTarget.getBoundingClientRect();
        var percent = Math.min(1, Math.max(0, (clientX - seekRect.left) / seekRect.width));
        var previewTime = focusAudio.duration * percent;
        renderFocusProgress(previewTime, focusAudio.duration);
        if (shouldCommit) {
            commitFocusSeek(previewTime);
        }
    }

    function bindFocusSeek() {
        var seekTarget = document.querySelector("[data-focus-seek]");
        if (!seekTarget) {
            return;
        }

        seekTarget.addEventListener("pointerdown", function (event) {
            if (!focusAudio || !isFinite(focusAudio.duration) || focusAudio.duration <= 0 || (event.button !== undefined && event.button !== 0)) {
                return;
            }
            focusSeekDragging = true;
            focusSeekPointerId = event.pointerId;
            focusSeekSuppressClick = true;
            seekTarget.classList.add("is-dragging");
            if (seekTarget.setPointerCapture) {
                try { seekTarget.setPointerCapture(event.pointerId); } catch (error) {}
            }
            previewFocusSeek(event.clientX, false);
            event.preventDefault();
        });

        document.addEventListener("pointermove", function (event) {
            if (!focusSeekDragging || event.pointerId !== focusSeekPointerId) {
                return;
            }
            previewFocusSeek(event.clientX, false);
            event.preventDefault();
        });

        document.addEventListener("pointerup", function (event) {
            if (!focusSeekDragging || event.pointerId !== focusSeekPointerId) {
                return;
            }
            previewFocusSeek(event.clientX, true);
            focusSeekDragging = false;
            focusSeekPointerId = null;
            seekTarget.classList.remove("is-dragging");
            if (seekTarget.hasPointerCapture && seekTarget.hasPointerCapture(event.pointerId)) {
                try { seekTarget.releasePointerCapture(event.pointerId); } catch (error) {}
            }
            syncFocusProgress();
            window.setTimeout(function () { focusSeekSuppressClick = false; }, 0);
        });

        document.addEventListener("pointercancel", function (event) {
            if (!focusSeekDragging || event.pointerId !== focusSeekPointerId) {
                return;
            }
            focusSeekDragging = false;
            focusSeekPointerId = null;
            focusSeekSuppressClick = false;
            seekTarget.classList.remove("is-dragging");
            syncFocusProgress();
        });

        seekTarget.addEventListener("lostpointercapture", function (event) {
            if (!focusSeekDragging || event.pointerId !== focusSeekPointerId) {
                return;
            }
            focusSeekDragging = false;
            focusSeekPointerId = null;
            focusSeekSuppressClick = false;
            seekTarget.classList.remove("is-dragging");
            syncFocusProgress();
        });

        seekTarget.addEventListener("keydown", function (event) {
            if (!focusAudio || !isFinite(focusAudio.duration) || focusAudio.duration <= 0) {
                return;
            }
            var nextTime = focusAudio.currentTime;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextTime -= 5;
            else if (event.key === "ArrowRight" || event.key === "ArrowUp") nextTime += 5;
            else if (event.key === "Home") nextTime = 0;
            else if (event.key === "End") nextTime = focusAudio.duration;
            else return;

            event.preventDefault();
            seekTarget.classList.add("is-dragging");
            commitFocusSeek(nextTime);
            window.setTimeout(function () { seekTarget.classList.remove("is-dragging"); }, 180);
        });
    }

    function bindFocusAudio(attempt) {
        focusAudio = document.querySelector("audio");
        if (!focusAudio) {
            if (attempt < 20) {
                window.setTimeout(function () { bindFocusAudio(attempt + 1); }, 120);
            }
            return;
        }
        focusAudio.addEventListener("timeupdate", syncFocusProgress);
        focusAudio.addEventListener("durationchange", syncFocusProgress);
        focusAudio.addEventListener("loadedmetadata", syncFocusProgress);
        focusAudio.addEventListener("play", syncPlaybackState);
        focusAudio.addEventListener("pause", syncPlaybackState);
        syncFocusProgress();
    }

    function triggerFocusAction(action) {
        var selectors = {prev: ".btn-prev", play: ".btn-play", next: ".btn-next"};
        if (!selectors[action]) {
            return;
        }
        var control = document.querySelector(selectors[action]);
        if (control) {
            control.click();
        }
    }

    function initVisualObservers() {
        if (!("MutationObserver" in window)) {
            return;
        }

        var playButton = document.querySelector(".btn-play");
        var mainList = document.getElementById("main-list");
        var cover = document.getElementById("music-cover");
        var lyrics = document.getElementById("lyric");

        if (playButton) {
            new MutationObserver(syncPlaybackState).observe(playButton, {
                attributes: true,
                attributeFilter: ["class"]
            });
        }

        if (mainList) {
            var trackSyncQueued = false;
            new MutationObserver(function () {
                if (trackSyncQueued) {
                    return;
                }
                trackSyncQueued = true;
                window.requestAnimationFrame(function () {
                    trackSyncQueued = false;
                    syncTrackMeta();
                });
            }).observe(mainList, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["class"]
            });
        }

        if (cover) {
            new MutationObserver(syncTrackMeta).observe(cover, {
                attributes: true,
                attributeFilter: ["src"]
            });
        }

        if (lyrics) {
            var lyricsSyncQueued = false;
            var lyricsNeedRebuild = false;
            new MutationObserver(function (records) {
                for (var recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
                    if (records[recordIndex].type === "childList" || records[recordIndex].type === "characterData") {
                        lyricsNeedRebuild = true;
                        break;
                    }
                }
                if (lyricsSyncQueued) {
                    return;
                }
                lyricsSyncQueued = true;
                window.requestAnimationFrame(function () {
                    lyricsSyncQueued = false;
                    if (lyricsNeedRebuild) {
                        lyricsNeedRebuild = false;
                        rebuildFocusLyrics();
                    } else {
                        syncFocusLyricActive(true);
                    }
                });
            }).observe(lyrics, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ["class"]
            });
        }
    }

    function init() {
        createEnhancedUi();
        finishStartup();
        updateThemeButtons(root.getAttribute("data-theme") || getInitialTheme());

        var themeButtons = document.querySelectorAll("[data-theme-toggle]");
        for (var themeIndex = 0; themeIndex < themeButtons.length; themeIndex += 1) {
            themeButtons[themeIndex].addEventListener("click", toggleTheme);
        }

        var refreshButtons = document.querySelectorAll("[data-background-refresh]");
        for (var refreshIndex = 0; refreshIndex < refreshButtons.length; refreshIndex += 1) {
            refreshButtons[refreshIndex].addEventListener("click", function () {
                refreshBackground(this);
            });
        }

        var sourceInputs = document.querySelectorAll("#music-source input[name='source']");
        var syncSelectedSource = function () {
            for (var sourceIndex = 0; sourceIndex < sourceInputs.length; sourceIndex += 1) {
                var sourceLabel = sourceInputs[sourceIndex].closest(".source-option");
                if (sourceLabel) {
                    sourceLabel.classList.toggle("is-selected", sourceInputs[sourceIndex].checked);
                }
            }
        };
        for (var sourceIndex = 0; sourceIndex < sourceInputs.length; sourceIndex += 1) {
            sourceInputs[sourceIndex].addEventListener("change", syncSelectedSource);
        }
        syncSelectedSource();

        document.addEventListener("click", function (event) {
            var eventTarget = event.target && event.target.closest ? event.target : null;
            var searchClose = eventTarget ? eventTarget.closest("[data-close-search]") : null;
            var focusOpen = eventTarget ? eventTarget.closest("[data-focus-open]") : null;
            var focusClose = eventTarget ? eventTarget.closest("[data-focus-close]") : null;
            var focusAction = eventTarget ? eventTarget.closest("[data-focus-action]") : null;
            var focusSeek = eventTarget ? eventTarget.closest("[data-focus-seek]") : null;

            if (searchClose) {
                if (typeof closeSearchBox === "function") closeSearchBox();
                return;
            }
            if (focusOpen) {
                openFocusPlayer(focusOpen);
                return;
            }
            if (focusClose) {
                closeFocusPlayer();
                return;
            }
            if (focusAction) {
                triggerFocusAction(focusAction.getAttribute("data-focus-action"));
                return;
            }
            if (focusSeek && focusAudio && isFinite(focusAudio.duration) && focusAudio.duration > 0) {
                if (focusSeekSuppressClick || event.detail === 0) {
                    return;
                }
                previewFocusSeek(event.clientX, true);
                return;
            }

            var closeTrigger = event.target.closest ? event.target.closest("[data-close-notice]") : null;
            if (closeTrigger) {
                closeNotice(closeTrigger.closest(".web_notice"));
                return;
            }
            if (event.target.classList && event.target.classList.contains("web_notice")) {
                closeNotice(event.target);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                var focusPlayer = document.getElementById("focus-player");
                var searchOverlay = document.getElementById("search-overlay");
                if (focusPlayer && !focusPlayer.hasAttribute("hidden")) {
                    closeFocusPlayer();
                } else if (searchOverlay && !searchOverlay.hasAttribute("hidden")) {
                    if (typeof closeSearchBox === "function") closeSearchBox();
                } else {
                    closeNotice(document.querySelector(".web_notice"));
                }
            }
        });

        syncPlaybackState();
        syncTrackMeta();
        rebuildFocusLyrics();
        initVisualObservers();
        bindFocusSeek();
        window.setTimeout(function () { bindFocusAudio(0); }, 0);
    }

    if (window.matchMedia) {
        var colorSchemeQuery = window.matchMedia("(prefers-color-scheme: light)");
        var handleSystemTheme = function () {
            if (!explicitTheme) {
                applyTheme(getSystemTheme(), false);
            }
        };

        if (colorSchemeQuery.addEventListener) {
            colorSchemeQuery.addEventListener("change", handleSystemTheme);
        } else if (colorSchemeQuery.addListener) {
            colorSchemeQuery.addListener(handleSystemTheme);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
