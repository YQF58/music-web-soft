/**************************************************
 * MKOnlinePlayer v2.31
 * 歌词解析及滚动模块
 * 编写：mengkun(http://mkblog.cn)
 * 时间：2017-9-13
 *************************************************/
 
var lyricArea = $("#lyric");    // 歌词显示容器

// 在歌词区显示提示语（如歌词加载中、无歌词等）
function lyricTip(str) {
    rem.lyric = [];
    rem.lastLyric = -1;
    lyricArea.html("<li class='lyric-tip'>"+str+"</li>");     // 显示内容
}

// 歌曲加载完后的回调函数
// 参数：原歌词、歌词ID、翻译歌词、音乐来源
function lyricCallback(str, id, translatedStr, source) {
    var currentList = musicList[1] && musicList[1].item ? musicList[1].item : [];
    var currentMusic = currentList[rem.playid];
    var expectedLyricId = currentMusic ? (currentMusic.lyric_id || currentMusic.id) : null;
    if(!currentMusic || String(id) !== String(expectedLyricId) || (source && source !== currentMusic.source)) return;

    var originalCues = parseLyric(str || '');
    var translatedCues = parseLyric(translatedStr || '');
    rem.lyric = mergeTranslatedLyrics(originalCues, translatedCues);

    if(!rem.lyric.length) {
        lyricTip('没有歌词');
        return false;
    }

    lyricArea.html('');
    lyricArea.scrollTop(0);
    rem.lastLyric = -1;

    for(var i = 0; i < rem.lyric.length; i++) {
        var cue = rem.lyric[i];
        var li = $("<li data-no='" + i + "' class='lrc-item'></li>");
        $("<span class='lrc-original'></span>").text(cue.text || "\u00a0").appendTo(li);
        if(cue.translation) {
            li.addClass('has-translation');
            $("<small class='lrc-translation'></small>").text(cue.translation).appendTo(li);
        }
        lyricArea.append(li);
    }
}

// 强制刷新当前时间点的歌词
function refreshLyric(time) {
    return scrollLyric(time);
}

// 按毫秒级时间轴选择当前歌词并滚动到真实行高的中心。
function scrollLyric(time) {
    if(!rem.lyric || !rem.lyric.length) return false;

    var currentTime = Number(time);
    if(!isFinite(currentTime)) return false;

    var activeIndex = -1;
    for(var i = 0; i < rem.lyric.length; i++) {
        if(rem.lyric[i].time > currentTime + 0.05) break;
        activeIndex = i;
    }
    if(activeIndex < 0 || rem.lastLyric === activeIndex) return activeIndex >= 0;

    rem.lastLyric = activeIndex;
    $(".lplaying").removeClass("lplaying");
    var activeLine = lyricArea.children(".lrc-item[data-no='" + activeIndex + "']");
    activeLine.addClass("lplaying");

    var viewportHeight = lyricArea.innerHeight() || $(".lyric").height();
    var scroll = activeLine.length ? activeLine[0].offsetTop - (viewportHeight / 2) + (activeLine.outerHeight() / 2) : 0;
    lyricArea.stop().animate({scrollTop: Math.max(0, scroll)}, 650);
    return true;
}

// 解析 LRC 并保留毫秒，支持一行多个时间标签。
function parseLyric(lrc) {
    if(!lrc || typeof lrc !== 'string') return [];

    var cues = [];
    var lines = lrc.replace(/\r/g, '').split("\n");
    var timeReg = /\[(\d{1,3}):(\d{1,2})(?:[\.:](\d{1,3}))?\]/g;

    for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var text = line.replace(timeReg, '').trim();
        timeReg.lastIndex = 0;
        var match;
        while((match = timeReg.exec(line)) !== null) {
            var fraction = match[3] || '';
            var milliseconds = fraction ? Number(fraction) / Math.pow(10, fraction.length) : 0;
            cues.push({
                time: Number(match[1]) * 60 + Number(match[2]) + milliseconds,
                text: text
            });
        }
        timeReg.lastIndex = 0;
    }

    cues.sort(function(a, b) { return a.time - b.time; });
    return cues;
}

// 将平台提供的译词匹配到原词；时间戳最多允许 0.35 秒偏差。
function mergeTranslatedLyrics(original, translated) {
    if(!original.length && translated.length) {
        return translated.map(function(cue) {
            return {time: cue.time, text: cue.text, translation: ''};
        });
    }

    var pairs = [];
    for(var originalIndex = 0; originalIndex < original.length; originalIndex++) {
        for(var translatedIndex = 0; translatedIndex < translated.length; translatedIndex++) {
            var difference = Math.abs(translated[translatedIndex].time - original[originalIndex].time);
            if(difference <= 0.35) {
                pairs.push({original: originalIndex, translated: translatedIndex, difference: difference});
            }
        }
    }
    pairs.sort(function(a, b) { return a.difference - b.difference; });

    var usedOriginal = {};
    var usedTranslated = {};
    var matches = {};
    for(var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
        var pair = pairs[pairIndex];
        if(usedOriginal[pair.original] || usedTranslated[pair.translated]) continue;
        usedOriginal[pair.original] = true;
        usedTranslated[pair.translated] = true;
        matches[pair.original] = pair.translated;
    }

    return original.map(function(cue, index) {
        var translation = matches[index] !== undefined ? (translated[matches[index]].text || '') : '';
        if(normalizeLyricText(translation) === normalizeLyricText(cue.text)) translation = '';
        return {time: cue.time, text: cue.text, translation: translation};
    });
}

function normalizeLyricText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}
