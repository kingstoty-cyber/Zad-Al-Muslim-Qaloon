/* زاد المسلم — قارئ القرآن الكريم
 * النص: Tanzil Project (CC BY 3.0)، موزع دون تغيير عبر quran-json.
 */
(function () {
    'use strict';

    const DATA_URL = 'quran-data/uthmani.json';
    const META_URL = 'quran-data/chapters.json';
    const KEYS = {
        last: 'zad_quran_last_read',
        bookmarks: 'zad_quran_bookmarks',
        completed: 'quran_v3',
        fontSize: 'zad_quran_font_size',
        mode: 'zad_quran_reading_mode'
    };
    let quranData = null;
    let chapters = null;
    let currentSurah = null;
    let currentAyahElement = null;

    function readJson(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch (_) { return fallback; }
    }

    async function loadQuranData() {
        if (quranData && chapters) return;
        const [textResponse, metaResponse] = await Promise.all([fetch(DATA_URL), fetch(META_URL)]);
        if (!textResponse.ok || !metaResponse.ok) throw new Error('تعذر تحميل ملفات المصحف');
        quranData = await textResponse.json();
        const metadata = await metaResponse.json();
        chapters = metadata.chapters;
        const verses = Object.values(quranData).reduce((sum, surah) => sum + surah.length, 0);
        if (chapters.length !== 114 || verses !== 6236) throw new Error('فشل التحقق من اكتمال نص القرآن');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
    }

    function normalizeArabic(text) {
        return String(text || '')
            .normalize('NFD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
            .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ـ/g, '')
            .toLowerCase().trim();
    }

    function loadingMarkup() {
        return '<div class="card quran-loading"><i class="fas fa-spinner fa-spin"></i><p>جاري فتح المصحف…</p></div>';
    }

    function errorMarkup(error) {
        return `<div class="card quran-error"><i class="fas fa-triangle-exclamation"></i><h3>تعذر فتح المصحف</h3><p>${escapeHtml(error.message)}</p><button class="btn-primary" onclick="renderQuran()">إعادة المحاولة</button></div>`;
    }

    async function renderQuran() {
        const content = document.getElementById('page-content');
        content.className = 'fade-in quran-page';
        content.innerHTML = loadingMarkup();
        try {
            await loadQuranData();
            renderQuranHome();
        } catch (error) {
            console.error(error);
            content.innerHTML = errorMarkup(error);
        }
    }

    function quranMode() { return localStorage.getItem(KEYS.mode) === 'qaloon' ? 'qaloon' : 'uthmani'; }

    function setQuranMode(mode) {
        localStorage.setItem(KEYS.mode, mode === 'qaloon' ? 'qaloon' : 'uthmani');
        renderQuranHome();
    }

    function modeSwitch(mode) {
        return `<div class="quran-mode-switch" role="tablist" aria-label="اختيار المصحف">
            <button type="button" role="tab" aria-selected="${mode==='uthmani'}" class="${mode==='uthmani'?'active':''}" onclick="setQuranMode('uthmani')"><i class="fas fa-book-open"></i><span><strong>النص العثماني</strong><small>القراءة النصية الحالية</small></span></button>
            <button type="button" role="tab" aria-selected="${mode==='qaloon'}" class="${mode==='qaloon'?'active':''}" onclick="setQuranMode('qaloon')"><i class="fas fa-book-quran"></i><span><strong>مصحف ليبيا — قالون</strong><small>تلاوة قالون وبياناته المستقلة</small></span></button>
        </div>`;
    }

    function renderQuranHome(filter = '') {
        currentSurah = null;
        const content = document.getElementById('page-content');
        const mode = quranMode();
        const last = readJson(KEYS.last, null);
        const completed = readJson(KEYS.completed, []);
        const bookmarks = readJson(KEYS.bookmarks, []);
        const query = normalizeArabic(filter);
        const visible = chapters.filter(ch => !query || normalizeArabic(ch.name).includes(query) || String(ch.id) === query);
        const percent = Math.round((completed.length / 114) * 100);
        const qaloonState = window.ZadQaloon?.state?.() || {surah:1,ayah:1,page:1};

        content.innerHTML = `
            <section class="quran-hero">
                <div class="quran-hero-icon"><i class="fas fa-book-quran"></i></div>
                <div><h2>القرآن الكريم</h2><p>اختر طريقة القراءة ثم السورة</p></div>
            </section>
            ${modeSwitch(mode)}
            ${mode==='uthmani' && last ? `<button class="quran-continue" onclick="openSurah(${last.surah}, ${last.ayah || 1})">
                <i class="fas fa-book-open"></i><span><small>متابعة القراءة</small><strong>سورة ${escapeHtml(chapters[last.surah - 1].name)} — الآية ${last.ayah || 1}</strong></span><i class="fas fa-chevron-left"></i>
            </button>` : ''}
            ${mode==='qaloon' ? `<button class="quran-continue qaloon-continue" onclick="openQaloonSurah(${qaloonState.surah||1}, ${qaloonState.ayah||1})">
                <i class="fas fa-book-quran"></i><span><small>متابعة قالون</small><strong>سورة ${escapeHtml(chapters[(qaloonState.surah||1)-1]?.name||'الفاتحة')} — الآية ${qaloonState.ayah||1}</strong></span><i class="fas fa-chevron-left"></i>
            </button>` : ''}
            ${mode==='uthmani' ? `<div class="quran-stats"><div><strong>${completed.length}</strong><span>سورة مكتملة</span></div><div><strong>${percent}%</strong><span>نسبة الختمة</span></div><div><strong>${bookmarks.length}</strong><span>علامة محفوظة</span></div></div><div class="progress-bar quran-progress"><div class="progress-fill" style="width:${percent}%"></div></div>` : `<div class="qaloon-safety-note"><i class="fas fa-shield-halved"></i><span>قالون مستقل عن ترقيم النص العثماني. لن نستخدم نص 6236 لتحديد آيات قالون 6214.</span></div>`}
            <div class="quran-tools">
                <label class="quran-search"><i class="fas fa-magnifying-glass"></i><input id="surah-search" type="search" placeholder="ابحث باسم السورة أو رقمها" value="${escapeHtml(filter)}" oninput="filterSurahs(this.value)"></label>
                ${mode==='uthmani'?`<button onclick="showQuranBookmarks()" title="العلامات"><i class="fas fa-bookmark"></i></button><button onclick="showQuranTextSearch()" title="البحث في الآيات"><i class="fas fa-align-right"></i></button>`:''}
            </div>
            <div class="surah-list quran-index-list">
                ${visible.map(ch => mode==='qaloon' ? `<button class="surah-row qaloon-surah-row" onclick="openQaloonSurah(${ch.id},1)"><span class="surah-number">${ch.id}</span><span class="surah-title"><strong>سورة ${escapeHtml(ch.name)}</strong><small>مصحف ليبيا • رواية قالون</small></span><i class="fas fa-chevron-left surah-arrow"></i></button>` : (()=>{const done=completed.includes(ch.id);return `<article class="surah-row" onclick="openSurah(${ch.id},1)"><span class="surah-number">${ch.id}</span><span class="surah-title"><strong>سورة ${escapeHtml(ch.name)}</strong><small>${ch.type === 'meccan' ? 'مكية' : 'مدنية'} • ${ch.total_verses} آية</small></span><button class="surah-complete ${done ? 'done' : ''}" onclick="event.stopPropagation();toggleSurahComplete(${ch.id})" aria-label="${done ? 'إلغاء إتمام السورة' : 'تعليم السورة كمكتملة'}"><i class="fas fa-check"></i></button><i class="fas fa-chevron-left surah-arrow"></i></article>`})()).join('') || '<div class="quran-empty">لا توجد سورة مطابقة.</div>'}
            </div>
            <p class="quran-attribution">${mode==='uthmani'?'النص العثماني من مشروع Tanzil، نُقل دون تغيير.':'وضع قالون يستخدم بيانات 6214 المستقلة. عرض صفحة المصحف الليبي الأصلية يبقى منفصلًا حتى اعتماد مصدر الصفحة.'}</p>`;
    }

    let qaloonTextData = null;

    async function loadQaloonText() {
        if (qaloonTextData) return qaloonTextData;
        const response = await fetch('quran-libya-data/qaloon-text.json');
        if (!response.ok) throw new Error('تعذر تحميل نص قالون');
        const data = await response.json();
        const count = Object.values(data.verses || {}).reduce((n, verses) => n + verses.length, 0);
        if (count !== 6214 || (data.surahs || []).length !== 114) throw new Error('فشل التحقق من اكتمال نص قالون');
        qaloonTextData = data;
        return data;
    }

    function selectQaloonAyah(surahId, ayah) {
        window.ZadQaloon?.save?.({surah:+surahId,ayah:+ayah,rangeStart:+ayah,rangeEnd:+ayah});
        window.ZadQaloon?.stop?.();
        window.ZadQaloon?.activate?.(+surahId,+ayah);
        window.ZadQaloon?.attach?.(document.getElementById('qaloon-controls-host'),surahId,ayah);
        window.ZadQaloon?.regionFor?.(surahId,ayah).then(region=>{
            if(!region)return;
            const pos=document.getElementById('qaloon-text-position');
            if(pos)pos.textContent=`الآية ${ayah} • الصفحة ${region.page}`;
            mountQaloonPage(region.page,+surahId,+ayah);
        }).catch(()=>{});
    }

    async function mountQaloonPage(page, surahId, ayah) {
        const host=document.getElementById('qaloon-page-reader');
        if(!host)return;
        await window.ZadLibyaPage?.mountTextPage?.(host,+page,{surah:+surahId,ayah:+ayah});
        host.dataset.page=String(page);
        const n=document.getElementById('qaloon-page-number'); if(n)n.textContent=`صفحة ${page} من 602`;
        document.getElementById('qaloon-prev-page')?.toggleAttribute('disabled',+page<=1);
        document.getElementById('qaloon-next-page')?.toggleAttribute('disabled',+page>=602);
    }

    async function changeQaloonPage(delta) {
        const host=document.getElementById('qaloon-page-reader'); if(!host)return;
        const page=Math.max(1,Math.min(602,+(host.dataset.page||1)+delta));
        const ayahs=await window.ZadLibyaPage?.pageAyahs?.(page);
        if(!ayahs?.length)return;
        const first=ayahs[0];
        window.ZadQaloon?.save?.({surah:+first.surah,ayah:+first.ayah,page});
        await mountQaloonPage(page,+first.surah,+first.ayah);
        window.ZadQaloon?.activate?.(+first.surah,+first.ayah);
    }

    function toggleQaloonFullscreen() {
        const reader=document.getElementById('qaloon-reading-stage'); if(!reader)return;
        if(document.fullscreenElement){ document.exitFullscreen?.(); return; }
        if(reader.requestFullscreen){ reader.requestFullscreen().catch(()=>reader.classList.toggle('qaloon-fullscreen-fallback')); }
        else reader.classList.toggle('qaloon-fullscreen-fallback');
    }

    async function openQaloonSurah(surahId, ayahNumber = 1) {
        if (!chapters) return renderQuran();
        try { await loadQaloonText(); } catch (error) { document.getElementById('page-content').innerHTML=errorMarkup(error); return; }
        const chapter = chapters[surahId - 1];
        localStorage.setItem(KEYS.mode, 'qaloon');
        window.ZadQaloon?.save?.({surah:+surahId, ayah:+ayahNumber, rangeStart:+ayahNumber, rangeEnd:+ayahNumber});
        const content = document.getElementById('page-content');
        content.innerHTML = `<div class="reader-toolbar"><button onclick="renderQuranHome()"><i class="fas fa-arrow-right"></i><span>الفهرس</span></button><div><strong>سورة ${escapeHtml(chapter.name)}</strong><small>مصحف ليبيا • رواية قالون</small></div><button onclick="toggleQaloonFullscreen()" aria-label="ملء الشاشة"><i class="fas fa-expand"></i></button></div>
            <div id="qaloon-reading-stage" class="qaloon-reading-stage">
              <div class="surah-ornament"><span>رواية قالون</span><h2>${escapeHtml(chapter.name)}</h2></div>
              <div class="qaloon-page-toolbar"><button id="qaloon-prev-page" onclick="changeQaloonPage(-1)" aria-label="الصفحة السابقة"><i class="fas fa-chevron-right"></i></button><strong id="qaloon-page-number">صفحة</strong><button onclick="toggleQaloonFullscreen()" aria-label="ملء الشاشة"><i class="fas fa-expand"></i></button><button id="qaloon-next-page" onclick="changeQaloonPage(1)" aria-label="الصفحة التالية"><i class="fas fa-chevron-left"></i></button></div>
              <div id="qaloon-text-position" class="qaloon-text-position">الآية ${ayahNumber}</div>
              <div id="qaloon-page-reader" class="qaloon-page-reader"></div>
            </div>
            <div id="qaloon-controls-host"></div>
            <div class="reader-navigation"><button ${surahId<=1?'disabled':''} onclick="openQaloonSurah(${surahId-1},1)"><i class="fas fa-chevron-right"></i> السابقة</button><button onclick="renderQuranHome()"><i class="fas fa-list"></i> الفهرس</button><button ${surahId>=114?'disabled':''} onclick="openQaloonSurah(${surahId+1},1)">التالية <i class="fas fa-chevron-left"></i></button></div>`;
        window.ZadQaloon?.attach?.(document.getElementById('qaloon-controls-host'), surahId, ayahNumber);
        const region=await window.ZadQaloon?.regionFor?.(surahId,ayahNumber);
        if(region) await mountQaloonPage(region.page,+surahId,+ayahNumber);
        window.ZadQaloon?.activate?.(+surahId,+ayahNumber);
    }


    function openSurah(surahId, ayahNumber = 1) {
        if (!quranData || !chapters) return renderQuran();
        const chapter = chapters[surahId - 1];
        const verses = quranData[String(surahId)] || [];
        const opening = splitOpeningBasmala(verses[0], surahId);
        currentSurah = surahId;
        const fontSize = Number(localStorage.getItem(KEYS.fontSize)) || 30;
        const completed = readJson(KEYS.completed, []);
        const isDone = completed.includes(surahId);
        const marked = new Set(readJson(KEYS.bookmarks, []).map(item => `${item.surah}:${item.ayah}`));
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="reader-toolbar">
                <button onclick="renderQuranHome()"><i class="fas fa-arrow-right"></i><span>الفهرس</span></button>
                <div><strong>سورة ${escapeHtml(chapter.name)}</strong><small>${chapter.type === 'meccan' ? 'مكية' : 'مدنية'} • ${chapter.total_verses} آية</small></div>
                <button onclick="toggleReaderSettings()"><i class="fas fa-font"></i></button>
            </div>
            <div id="reader-settings" class="reader-settings" hidden>
                <span>حجم الخط</span><button onclick="changeQuranFont(-2)">−</button><output id="quran-font-value">${fontSize}</output><button onclick="changeQuranFont(2)">+</button>
            </div>
            <div class="surah-ornament"><span>سورة</span><h2>${escapeHtml(chapter.name)}</h2></div>
            ${opening.basmala ? `<div class="bismillah">${escapeHtml(opening.basmala)}</div>` : ''}
            <div id="quran-verses" class="quran-verses" style="--quran-font-size:${fontSize}px">
                ${verses.map(verse => verseMarkup(verse, surahId, marked)).join('')}
            </div>
            <div class="reader-finish">
                <button class="btn-primary" onclick="toggleSurahComplete(${surahId})"><i class="fas fa-check-circle"></i> ${isDone ? 'السورة مكتملة — إلغاء العلامة' : 'أتممت قراءة السورة'}</button>
            </div>
            <div class="reader-navigation">
                <button ${surahId <= 1 ? 'disabled' : ''} onclick="openSurah(${surahId - 1},1)"><i class="fas fa-chevron-right"></i> السابقة</button>
                <button onclick="renderQuranHome()"><i class="fas fa-list"></i> الفهرس</button>
                <button ${surahId >= 114 ? 'disabled' : ''} onclick="openSurah(${surahId + 1},1)">التالية <i class="fas fa-chevron-left"></i></button>
            </div>`;
        // Qaloon is intentionally not attached to the 6236 Uthmani DOM; the two numbering systems stay isolated.
        if (typeof window.onQuranSurahOpened === 'function') {
            window.onQuranSurahOpened({surahId, ayahNumber, chapter, verses});
        }
        requestAnimationFrame(() => {
            const target = document.getElementById(`ayah-${surahId}-${ayahNumber}`);
            if (target) target.scrollIntoView({block: 'center'});
        });
    }

    function verseMarkup(verse, surahId, bookmarks) {
        const marked = bookmarks.has(`${surahId}:${verse.verse}`);
        return `<article class="ayah ${marked ? 'bookmarked' : ''}" id="ayah-${surahId}-${verse.verse}" data-surah="${surahId}" data-ayah="${verse.verse}">
            <p>${escapeHtml(splitOpeningBasmala(verse, surahId).text)} <span class="ayah-number">${verse.verse}</span></p>
            <div class="ayah-actions">
                <button type="button" data-ayah-action="bookmark"><i class="${marked ? 'fas' : 'far'} fa-bookmark"></i><span>${marked ? 'محفوظة' : 'حفظ'}</span></button>
                <button type="button" data-ayah-action="play"><i class="fas fa-play"></i><span>استماع</span></button>
                <button type="button" data-ayah-action="copy"><i class="far fa-copy"></i><span>نسخ</span></button>
                <button type="button" data-ayah-action="share"><i class="fas fa-share-nodes"></i><span>مشاركة</span></button>
                <button type="button" data-ayah-action="image"><i class="fas fa-image"></i><span>مشاركة صورة</span></button>
            </div>
        </article>`;
    }

    // نص Tanzil يضع البسملة في بداية الآية الأولى من السور (عدا التوبة).
    // نعرضها سطراً مستقلاً للمصحف، مع إبقاء النص الأصلي محفوظاً دون أي تعديل.
    function splitOpeningBasmala(verse, surahId) {
        const text = verse?.text || '';
        if (surahId === 1 || surahId === 9 || verse?.verse !== 1) return { basmala: '', text };
        const match = text.match(/^(ب[ِّ]*سْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ)\s*/);
        if (!match) return { basmala: '', text };
        return { basmala: match[1], text: text.slice(match[0].length) };
    }

    function saveReadingPosition(surah, ayah, silent = true) {
        localStorage.setItem(KEYS.last, JSON.stringify({surah, ayah, updatedAt: Date.now()}));
        currentAyahElement?.classList.remove('current');
        currentAyahElement = document.getElementById(`ayah-${surah}-${ayah}`) || null;
        currentAyahElement?.classList.add('current');
        if (!silent) notify('تم حفظ موضع القراءة');
    }

    function toggleSurahComplete(id) {
        const completed = readJson(KEYS.completed, []);
        const index = completed.indexOf(id);
        if (index >= 0) completed.splice(index, 1); else completed.push(id);
        completed.sort((a, b) => a - b);
        localStorage.setItem(KEYS.completed, JSON.stringify(completed));
        if (currentSurah === id) openSurah(id, 1); else renderQuranHome(document.getElementById('surah-search')?.value || '');
    }

    function toggleAyahBookmark(surah, ayah) {
        const bookmarks = readJson(KEYS.bookmarks, []);
        const index = bookmarks.findIndex(item => item.surah === surah && item.ayah === ayah);
        if (index >= 0) bookmarks.splice(index, 1);
        else bookmarks.unshift({surah, ayah, savedAt: Date.now()});
        localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
        saveReadingPosition(surah, ayah);
        openSurah(surah, ayah);
    }

    function showQuranBookmarks() {
        const content = document.getElementById('page-content');
        const bookmarks = readJson(KEYS.bookmarks, []);
        content.innerHTML = `<div class="reader-toolbar"><button onclick="renderQuranHome()"><i class="fas fa-arrow-right"></i><span>القرآن</span></button><div><strong>العلامات المحفوظة</strong><small>${bookmarks.length} علامة</small></div><span></span></div>
            <div class="bookmark-list">${bookmarks.map(item => {
                const verse = quranData[String(item.surah)]?.[item.ayah - 1];
                return verse ? `<article class="bookmark-card" onclick="openSurah(${item.surah},${item.ayah})"><strong>سورة ${escapeHtml(chapters[item.surah - 1].name)} — ${item.ayah}</strong><p>${escapeHtml(verse.text)}</p><button onclick="event.stopPropagation();toggleAyahBookmark(${item.surah},${item.ayah})"><i class="fas fa-trash"></i></button></article>` : '';
            }).join('') || '<div class="quran-empty">لم تحفظ أي آية بعد.</div>'}</div>`;
    }

    function showQuranTextSearch() {
        const content = document.getElementById('page-content');
        content.innerHTML = `<div class="reader-toolbar"><button onclick="renderQuranHome()"><i class="fas fa-arrow-right"></i><span>القرآن</span></button><div><strong>البحث في القرآن</strong><small>ابحث في نص الآيات</small></div><span></span></div>
            <label class="quran-search quran-text-search"><i class="fas fa-magnifying-glass"></i><input id="ayah-search" type="search" minlength="2" placeholder="اكتب كلمتين أو أكثر" oninput="searchQuranText(this.value)"></label>
            <div id="quran-search-results" class="search-results"><div class="quran-empty">اكتب كلمة للبحث في 6236 آية.</div></div>`;
        document.getElementById('ayah-search')?.focus();
    }

    function searchQuranText(value) {
        const box = document.getElementById('quran-search-results');
        const query = normalizeArabic(value);
        if (query.length < 2) { box.innerHTML = '<div class="quran-empty">اكتب حرفين على الأقل.</div>'; return; }
        const results = [];
        for (const chapter of chapters) {
            for (const verse of quranData[String(chapter.id)]) {
                if (normalizeArabic(verse.text).includes(query)) results.push({chapter, verse});
                if (results.length >= 100) break;
            }
            if (results.length >= 100) break;
        }
        box.innerHTML = results.map(({chapter, verse}) => `<article class="search-result" onclick="openSurah(${chapter.id},${verse.verse})"><strong>سورة ${escapeHtml(chapter.name)} — الآية ${verse.verse}</strong><p>${escapeHtml(verse.text)}</p></article>`).join('') || '<div class="quran-empty">لم يُعثر على نتيجة.</div>';
    }

    async function copyAyah(surah, ayah) {
        const verse = quranData[String(surah)][ayah - 1];
        const text = `${verse.text} ﴿${ayah}﴾\nسورة ${chapters[surah - 1].name}`;
        notify('جارٍ نسخ الآية…');
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
            await navigator.clipboard.writeText(text);
        } catch (_) {
            if (!fallbackCopy(text)) { notify('تعذر النسخ على هذا الجهاز'); return false; }
        }
        notify('تم نسخ الآية');
        return true;
    }

    function fallbackCopy(text) {
        const area = document.createElement('textarea');
        area.value = text; area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
        document.body.appendChild(area); area.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch (_) {}
        area.remove();
        return copied;
    }

    async function shareAyah(surah, ayah) {
        const verse = quranData[String(surah)][ayah - 1];
        const text = `${verse.text} ﴿${ayah}﴾\nسورة ${chapters[surah - 1].name}`;
        const share = window.Capacitor?.Plugins?.Share;
        try {
            if (window.Capacitor?.isNativePlatform?.() && share?.share) {
                await share.share({title: 'آية من القرآن الكريم', text, dialogTitle: 'مشاركة الآية'});
            } else if (navigator.share) {
                await navigator.share({title: 'آية من القرآن الكريم', text});
            } else {
                await copyAyah(surah, ayah);
            }
        } catch (error) {
            if (error?.name !== 'AbortError') notify('تعذرت المشاركة؛ يمكنك نسخ الآية بدلًا من ذلك');
        }
    }

    function wrapCanvasText(ctx, text, maxWidth) {
        const lines = []; let line = '';
        for (const word of text.split(/\s+/)) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
            else line = candidate;
        }
        if (line) lines.push(line);
        return lines;
    }

    async function createAyahImage(surah, ayah) {
        await document.fonts?.load('700 64px Amiri');
        const verse = quranData[String(surah)][ayah - 1];
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas غير متاح');
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#08251a'); gradient.addColorStop(1, '#14543a');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(225,196,112,.85)'; ctx.lineWidth = 4;
        ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
        ctx.direction = 'rtl'; ctx.textAlign = 'center';
        ctx.fillStyle = '#e4c878'; ctx.font = '700 48px Tajawal, sans-serif';
        ctx.fillText(`سورة ${chapters[surah - 1].name}`, canvas.width / 2, 190);
        let fontSize = 66, lines;
        const text = `${verse.text} ﴿${ayah}﴾`;
        do {
            ctx.font = `${fontSize}px Amiri, serif`;
            lines = wrapCanvasText(ctx, text, canvas.width - 160);
            if (lines.length > 10) fontSize -= 4;
        } while (lines.length > 10 && fontSize > 42);
        const lineHeight = fontSize * 1.55;
        const blockHeight = lines.length * lineHeight;
        let y = Math.max(360, (canvas.height - blockHeight) / 2 + fontSize);
        ctx.fillStyle = '#fffaf0';
        lines.forEach(line => { ctx.fillText(line, canvas.width / 2, y); y += lineHeight; });
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '500 34px Tajawal, sans-serif';
        ctx.fillText('زاد المسلم', canvas.width / 2, canvas.height - 130);
        return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('تعذر إنشاء الصورة')), 'image/png'));
    }

    async function shareAyahImage(surah, ayah, button) {
        if (button?.disabled) return;
        const original = button?.innerHTML;
        if (button) { button.disabled = true; button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>جاري إنشاء الصورة...</span>'; }
        notify('جاري إنشاء الصورة...');
        try {
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const blob = await createAyahImage(surah, ayah);
            const name = `zad-ayah-${surah}-${ayah}.png`;
            if (window.nativeShareBlob && await window.nativeShareBlob(blob, name)) { notify('تم فتح مشاركة الصورة'); return; }
            const file = new File([blob], name, {type: 'image/png'});
            if (navigator.canShare?.({files: [file]}) && navigator.share) {
                await navigator.share({title: 'آية من القرآن الكريم', files: [file]});
                return;
            }
            const url = URL.createObjectURL(blob), link = document.createElement('a');
            link.href = url; link.download = name; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1500);
            notify('تم إنشاء الصورة وتنزيلها');
        } catch (error) {
            if (error?.name !== 'AbortError') notify(`تعذر إنشاء أو مشاركة الصورة: ${error.message}`);
        } finally {
            if (button) { button.disabled = false; button.innerHTML = original; }
        }
    }

    function handleVerseClick(event) {
        const button = event.target.closest('[data-ayah-action]');
        const article = button?.closest('.ayah[data-surah]') || event.target.closest('.ayah[data-surah]');
        if (!article || !article.closest('#quran-verses')) return;
        if (button) {
            event.preventDefault(); event.stopPropagation();
            const surah = Number(article.dataset.surah), ayah = Number(article.dataset.ayah);
            switch (button.dataset.ayahAction) {
                case 'bookmark': toggleAyahBookmark(surah, ayah); break;
                case 'play': window.playQuranAyah?.(surah, ayah); break;
                case 'copy': copyAyah(surah, ayah); break;
                case 'share': shareAyah(surah, ayah); break;
                case 'image': shareAyahImage(surah, ayah, button); break;
            }
            return;
        }
        saveReadingPosition(Number(article.dataset.surah), Number(article.dataset.ayah));
    }

    function changeQuranFont(delta) {
        const current = Number(localStorage.getItem(KEYS.fontSize)) || 30;
        const next = Math.max(22, Math.min(46, current + delta));
        localStorage.setItem(KEYS.fontSize, String(next));
        document.getElementById('quran-verses')?.style.setProperty('--quran-font-size', `${next}px`);
        const output = document.getElementById('quran-font-value'); if (output) output.textContent = next;
    }

    function toggleReaderSettings() {
        const settings = document.getElementById('reader-settings'); if (settings) settings.hidden = !settings.hidden;
    }

    function notify(message) {
        let toast = document.getElementById('quran-toast');
        if (!toast) { toast = document.createElement('div'); toast.id = 'quran-toast'; toast.className = 'quran-toast'; document.body.appendChild(toast); }
        toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 1800);
    }

    function filterSurahs(value) { renderQuranHome(value); document.getElementById('surah-search')?.focus(); }

    window.addEventListener('zad:quran-ayah-active', async (e)=>{
        const host=document.getElementById('qaloon-page-reader');
        if(!host || !e.detail)return;
        try{const r=await window.ZadQaloon?.regionFor?.(e.detail.surah,e.detail.ayah);if(r && +host.dataset.page!==+r.page) await mountQaloonPage(r.page,+e.detail.surah,+e.detail.ayah);}catch(_){}
    });

    window.renderQuran = renderQuran;
    window.renderQuranHome = renderQuranHome;
    window.setQuranMode = setQuranMode;
    window.selectQaloonAyah = selectQaloonAyah;
    window.openQaloonSurah = openQaloonSurah;
    window.changeQaloonPage = changeQaloonPage;
    window.toggleQaloonFullscreen = toggleQaloonFullscreen;
    window.openSurah = openSurah;
    window.filterSurahs = filterSurahs;
    window.toggleSurahComplete = toggleSurahComplete;
    window.toggleAyahBookmark = toggleAyahBookmark;
    window.showQuranBookmarks = showQuranBookmarks;
    window.showQuranTextSearch = showQuranTextSearch;
    window.searchQuranText = searchQuranText;
    window.saveReadingPosition = saveReadingPosition;
    window.copyAyah = copyAyah;
    window.shareAyah = shareAyah;
    window.changeQuranFont = changeQuranFont;
    window.toggleReaderSettings = toggleReaderSettings;
    document.addEventListener('click', handleVerseClick);
})();
