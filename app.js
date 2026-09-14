// =========================
// نظام الأذان
// =========================

const ADHAN_CONFIG = {
    main: {
        name: "أذان مشاري العفاسي",
        url: "https://cdn.aladhan.com/audio/adhans/a9.mp3"
    },
    fajr: {
        name: "أذان الفجر",
        url: "https://cdn.aladhan.com/audio/adhans/a9.mp3"
    }
};

const PRAYER_NAMES = {
    Fajr: "الفجر",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء"
};

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

let adhanAudio = null;
let adhanIsPlaying = false;
let currentAdhanPrayer = null;
let adhanCheckTimer = null;


// إنشاء مشغل الأذان
function createAdhanAudio() {
    if (adhanAudio) return adhanAudio;

    adhanAudio = new Audio();
    adhanAudio.preload = "auto";
    adhanAudio.volume = Number(localStorage.getItem("adhanVolume") || 1);

    adhanAudio.addEventListener("play", () => {
        adhanIsPlaying = true;
        updateAdhanUI();
    });

    adhanAudio.addEventListener("pause", () => {
        adhanIsPlaying = false;
        updateAdhanUI();
    });

    adhanAudio.addEventListener("ended", () => {
        adhanIsPlaying = false;
        currentAdhanPrayer = null;
        updateAdhanUI();
    });

    adhanAudio.addEventListener("error", () => {
        adhanIsPlaying = false;
        updateAdhanUI();

        if (typeof showToast === "function") {
            showToast("تعذر تشغيل الأذان");
        }
    });

    return adhanAudio;
}


// اختيار ملف الأذان
function getAdhanSource(prayerKey) {
    if (prayerKey === "Fajr") {
        return ADHAN_CONFIG.fajr;
    }

    return ADHAN_CONFIG.main;
}


// تشغيل الأذان
async function playAdhan(prayerKey = null, testMode = false) {
    const audio = createAdhanAudio();

    const selectedPrayer = prayerKey || "Dhuhr";
    const config = getAdhanSource(selectedPrayer);

    try {
        audio.pause();
        audio.currentTime = 0;

        audio.src = config.url;
        audio.load();

        currentAdhanPrayer = selectedPrayer;

        await audio.play();

        adhanIsPlaying = true;
        updateAdhanUI();

        if (typeof showToast === "function") {
            showToast(
                testMode
                    ? `تشغيل أذان ${PRAYER_NAMES[selectedPrayer]} للتجربة`
                    : `حان الآن وقت أذان ${PRAYER_NAMES[selectedPrayer]}`
            );
        }

        if (!testMode) {
            showPrayerNotification(selectedPrayer);
        }

        return true;

    } catch (error) {
        console.error("Adhan playback error:", error);

        adhanIsPlaying = false;
        updateAdhanUI();

        if (typeof showToast === "function") {
            showToast("اضغط زر تجربة الأذان أولًا للسماح بتشغيل الصوت");
        }

        return false;
    }
}


// إيقاف الأذان
function stopAdhan(showMessage = true) {
    if (adhanAudio) {
        adhanAudio.pause();
        adhanAudio.currentTime = 0;
        adhanAudio.removeAttribute("src");
        adhanAudio.load();
    }

    adhanIsPlaying = false;
    currentAdhanPrayer = null;

    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
    }

    updateAdhanUI();

    if (showMessage && typeof showToast === "function") {
        showToast("تم إيقاف الأذان");
    }
}


// إنشاء واجهة التحكم بالأذان
function setupAdhanUI() {
    if (document.getElementById("adhanControls")) return;

    const alarmToggle = document.getElementById("alarmToggle");

    if (!alarmToggle) return;

    const settingRow = alarmToggle.closest(".setting-row");

    if (!settingRow) return;

    const wrapper = document.createElement("div");

    wrapper.id = "adhanControls";
    wrapper.className = "adhan-control-card";

    wrapper.innerHTML = `
        <div class="adhan-control-header">
            <div>
                <strong>🔊 الأذان</strong>
                <div id="adhanStatusText" class="adhan-note">
                    الأذان متوقف
                </div>
            </div>
        </div>

        <div class="adhan-control-buttons">

            <button
                id="testAdhanBtn"
                class="primary-btn"
                type="button">
                ▶️ تجربة الأذان
            </button>

            <button
                id="stopAdhanBtn"
                class="secondary-btn"
                type="button"
                disabled>
                ⏹️ إيقاف الأذان
            </button>

        </div>

        <div class="adhan-note">
            عند تفعيل التنبيه سيتم تشغيل الأذان عند دخول وقت الصلاة.
        </div>
    `;

    settingRow.insertAdjacentElement("afterend", wrapper);

    const testBtn = document.getElementById("testAdhanBtn");
    const stopBtn = document.getElementById("stopAdhanBtn");

    testBtn?.addEventListener("click", async () => {
        const prayer =
            localStorage.getItem("adhanTestPrayer") || "Dhuhr";

        await playAdhan(prayer, true);
    });

    stopBtn?.addEventListener("click", () => {
        stopAdhan(true);
    });

    updateAdhanUI();
}


// تحديث واجهة الأذان
function updateAdhanUI() {
    const statusText = document.getElementById("adhanStatusText");
    const stopBtn = document.getElementById("stopAdhanBtn");

    if (!statusText) return;

    if (adhanIsPlaying) {
        const prayerName =
            PRAYER_NAMES[currentAdhanPrayer] || "الصلاة";

        statusText.textContent =
            `🔊 يتم الآن تشغيل أذان ${prayerName}`;

    } else {
        statusText.textContent =
            "الأذان متوقف";
    }

    if (stopBtn) {
        stopBtn.disabled = !adhanIsPlaying;
    }
}
// =========================
// فحص وقت الصلاة وتشغيل الأذان
// =========================

/* =========================================================
   نور | app.js
   نظام تشغيل الموقع بالكامل
   ========================================================= */

"use strict";

/* =========================
   Service Worker
========================= */

if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .catch(error => console.error("Service Worker:", error));
    });
}


/* =========================
   الحالة العامة
========================= */

const state = {
    city: localStorage.getItem("city") || "عمّان",
    country: localStorage.getItem("country") || "الأردن",
    lastSurah: Number(localStorage.getItem("lastSurah") || 1),
    selectedReciter:
        localStorage.getItem("selectedReciter") || "fixed-yasser"
};

window.prayers = window.prayers || null;


/* =========================
   أسماء الصلوات
========================= */

const PRAYER_NAMES = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء"
};

const PRAYER_KEYS = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
];


/* =========================
   القراء
========================= */

const RECITERS = {
    "fixed-yasser": {
        name: "ياسر الدوسري",
        base: "https://server6.mp3quran.net/yasser/"
    },

    "fixed-afasy": {
        name: "مشاري العفاسي",
        base: "https://server8.mp3quran.net/afs/"
    },

    "fixed-luhaidan": {
        name: "محمد اللحيدان",
        base: "https://server8.mp3quran.net/lhdan/"
    },

    "fixed-islam": {
        name: "إسلام صبحي",
        base: "https://server11.mp3quran.net/islam/"
    },

    "fixed-sudais": {
        name: "عبد الرحمن السديس",
        base: "https://server11.mp3quran.net/sds/"
    },

    "fixed-muaiqly": {
        name: "ماهر المعيقلي",
        base: "https://server12.mp3quran.net/maher/"
    },

    "fixed-husary": {
        name: "محمود خليل الحصري",
        base: "https://server13.mp3quran.net/husr/"
    }
};


/* =========================
   السور
========================= */

const SURAHS = [
    "الفاتحة",
    "البقرة",
    "آل عمران",
    "النساء",
    "المائدة",
    "الأنعام",
    "الأعراف",
    "الأنفال",
    "التوبة",
    "يونس",
    "هود",
    "يوسف",
    "الرعد",
    "إبراهيم",
    "الحجر",
    "النحل",
    "الإسراء",
    "الكهف",
    "مريم",
    "طه",
    "الأنبياء",
    "الحج",
    "المؤمنون",
    "النور",
    "الفرقان",
    "الشعراء",
    "النمل",
    "القصص",
    "العنكبوت",
    "الروم",
    "لقمان",
    "السجدة",
    "الأحزاب",
    "سبأ",
    "فاطر",
    "يس",
    "الصافات",
    "ص",
    "الزمر",
    "غافر",
    "فصلت",
    "الشورى",
    "الزخرف",
    "الدخان",
    "الجاثية",
    "الأحقاف",
    "محمد",
    "الفتح",
    "الحجرات",
    "ق",
    "الذاريات",
    "الطور",
    "النجم",
    "القمر",
    "الرحمن",
    "الواقعة",
    "الحديد",
    "المجادلة",
    "الحشر",
    "الممتحنة",
    "الصف",
    "الجمعة",
    "المنافقون",
    "التغابن",
    "الطلاق",
    "التحريم",
    "الملك",
    "القلم",
    "الحاقة",
    "المعارج",
    "نوح",
    "الجن",
    "المزمل",
    "المدثر",
    "القيامة",
    "الإنسان",
    "المرسلات",
    "النبأ",
    "النازعات",
    "عبس",
    "التكوير",
    "الانفطار",
    "المطففين",
    "الانشقاق",
    "البروج",
    "الطارق",
    "الأعلى",
    "الغاشية",
    "الفجر",
    "البلد",
    "الشمس",
    "الليل",
    "الضحى",
    "الشرح",
    "التين",
    "العلق",
    "القدر",
    "البينة",
    "الزلزلة",
    "العاديات",
    "القارعة",
    "التكاثر",
    "العصر",
    "الهمزة",
    "الفيل",
    "قريش",
    "الماعون",
    "الكوثر",
    "الكافرون",
    "النصر",
    "المسد",
    "الإخلاص",
    "الفلق",
    "الناس"
];

const SURAH_AYAH_COUNTS = [
    7,286,200,176,120,165,206,75,129,109,
    123,111,43,52,99,128,111,110,98,135,
    112,78,118,64,77,227,93,88,69,60,
    34,30,73,54,45,83,182,88,75,85,
    54,53,89,59,37,35,38,29,18,45,
    60,49,62,55,78,96,29,22,24,13,
    14,11,11,18,12,12,30,52,52,44,
    28,28,20,56,40,31,50,40,46,42,
    29,19,36,25,22,17,19,26,30,20,
    15,21,11,8,8,19,5,8,8,11,
    11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

const SURAHS_DATA = SURAHS.map((name, index) => ({
    number: index + 1,
    name,
    ayahs: SURAH_AYAH_COUNTS[index] || 0
}));


/* =========================
   الأذكار
========================= */

const AZKAR = {

    morning: [
        [
            "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
            1
        ],
        [
            "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً.",
            3
        ],
        [
            "سبحان الله وبحمده.",
            100
        ],
        [
            "أستغفر الله وأتوب إليه.",
            100
        ],
        [
            "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
            1
        ]
    ],

    evening: [
        [
            "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
            1
        ],
        [
            "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً.",
            3
        ],
        [
            "أعوذ بكلمات الله التامات من شر ما خلق.",
            3
        ],
        [
            "سبحان الله وبحمده.",
            100
        ],
        [
            "أستغفر الله وأتوب إليه.",
            100
        ]
    ],

    sleep: [
        [
            "باسمك اللهم أموت وأحيا.",
            1
        ],
        [
            "اللهم قني عذابك يوم تبعث عبادك.",
            3
        ],
        [
            "سبحان الله.",
            33
        ],
        [
            "الحمد لله.",
            33
        ],
        [
            "الله أكبر.",
            34
        ]
    ],

    dua: [
        [
            "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.",
            1
        ],
        [
            "رب اشرح لي صدري ويسر لي أمري.",
            1
        ],
        [
            "رب اغفر لي ولوالدي وللمؤمنين يوم يقوم الحساب.",
            1
        ],
        [
            "اللهم أعني على ذكرك وشكرك وحسن عبادتك.",
            1
        ]
    ],

    quran: [
        [
            "ربنا لا تزغ قلوبنا بعد إذ هديتنا وهب لنا من لدنك رحمة إنك أنت الوهاب.",
            1
        ],
        [
            "ربنا ظلمنا أنفسنا وإن لم تغفر لنا وترحمنا لنكونن من الخاسرين.",
            1
        ],
        [
            "رب زدني علماً.",
            1
        ],
        [
            "ربنا أفرغ علينا صبراً وتوفنا مسلمين.",
            1
        ]
    ]
};


/* =========================
   الأحاديث
========================= */

const HADITHS = [
    ["إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.", "متفق عليه"],
    ["من لا يرحم لا يُرحم.", "متفق عليه"],
    ["المسلم من سلم المسلمون من لسانه ويده.", "متفق عليه"],
    ["خيركم من تعلم القرآن وعلمه.", "رواه البخاري"],
    ["الكلمة الطيبة صدقة.", "متفق عليه"],
    ["لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.", "متفق عليه"],
    ["الدين النصيحة.", "رواه مسلم"],
    ["يسروا ولا تعسروا، وبشروا ولا تنفروا.", "متفق عليه"],
    ["من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت.", "متفق عليه"],
    ["تبسمك في وجه أخيك لك صدقة.", "رواه الترمذي"],
    ["أحب الأعمال إلى الله أدومها وإن قل.", "متفق عليه"],
    ["اتق الله حيثما كنت.", "رواه الترمذي"],
    ["الطهور شطر الإيمان.", "رواه مسلم"],
    ["الراحمون يرحمهم الرحمن.", "رواه الترمذي"],
    ["من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة.", "رواه مسلم"]
];


/* =========================
   أسماء الله الحسنى
========================= */

const ASMA = [
    "الرحمن","الرحيم","الملك","القدوس","السلام",
    "المؤمن","المهيمن","العزيز","الجبار","المتكبر",
    "الخالق","البارئ","المصور","الغفار","القهار",
    "الوهاب","الرزاق","الفتاح","العليم","القابض",
    "الباسط","الخافض","الرافع","المعز","المذل",
    "السميع","البصير","الحكم","العدل","اللطيف",
    "الخبير","الحليم","العظيم","الغفور","الشكور",
    "العلي","الكبير","الحفيظ","المقيت","الحسيب",
    "الجليل","الكريم","الرقيب","المجيب","الواسع",
    "الحكيم","الودود","المجيد","الباعث","الشهيد",
    "الحق","الوكيل","القوي","المتين","الولي",
    "الحميد","المحصي","المبدئ","المعيد","المحيي",
    "المميت","الحي","القيوم","الواجد","الماجد",
    "الواحد","الأحد","الصمد","القادر","المقتدر",
    "المقدم","المؤخر","الأول","الآخر","الظاهر",
    "الباطن","الوالي","المتعالي","البر","التواب",
    "المنتقم","العفو","الرؤوف","مالك الملك",
    "ذو الجلال والإكرام","المقسط","الجامع","الغني",
    "المغني","المانع","الضار","النافع","النور",
    "الهادي","البديع","الباقي","الوارث","الرشيد",
    "الصبور"
];


/* =========================================================
   أدوات عامة
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function arabicDigits(value) {
    return String(value).replace(
        /\d/g,
        digit => "٠١٢٣٤٥٦٧٨٩"[digit]
    );
}


function showToast(message) {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

window.showToast = showToast;


function saveState() {

    localStorage.setItem("city", state.city);

    localStorage.setItem(
        "country",
        state.country
    );

    localStorage.setItem(
        "lastSurah",
        String(state.lastSurah)
    );

    localStorage.setItem(
        "selectedReciter",
        state.selectedReciter
    );
}


/* =========================================================
   التنقل بين الأقسام
========================================================= */

function goToSection(sectionId) {

    const target = $(sectionId);

    if (!target) {
        console.warn("Section not found:", sectionId);
        return;
    }

    document
        .querySelectorAll(".section-page")
        .forEach(section => {
            section.classList.remove("active-page");
        });

    target.classList.add("active-page");

    document
        .querySelectorAll(".nav-btn[data-go]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.go === sectionId
            );
        });

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (sectionId === "favoritesSection") {
        renderFavorites();
    }

    if (sectionId === "calendarSection") {
        updateCalendar();
    }

    if (
        sectionId === "prayerSection" &&
        !window.prayers
    ) {
        loadPrayerTimes();
    }
}


function setupNavigation() {

    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-go]");

        if (!button) return;

        const target =
            button.dataset.go;

        if (!target) return;

        event.preventDefault();

        goToSection(target);
    });
}


/* =========================================================
   الوضع الليلي
========================================================= */

function applyTheme(isLight) {

    document.body.classList.toggle(
        "light",
        isLight
    );

    const themeButton = $("themeToggle");

    if (themeButton) {

        themeButton.textContent =
            isLight ? "☀️" : "🌙";

        themeButton.title =
            isLight
                ? "الوضع الليلي"
                : "الوضع النهاري";
    }

    localStorage.setItem(
        "theme",
        isLight ? "light" : "dark"
    );
}


function setupTheme() {

    const isLight =
        localStorage.getItem("theme") === "light";

    applyTheme(isLight);

    $("themeToggle")?.addEventListener(
        "click",
        () => {
            applyTheme(
                !document.body.classList.contains("light")
            );
        }
    );
}


/* =========================================================
   القائمة الهاتفية
========================================================= */

function closeMobileMenu() {

    const nav = $("mainNav");

    const button =
        $("mobile-menu-toggle");

    if (nav) {
        nav.classList.remove("mobile-open");
    }

    if (button) {

        button.classList.remove("is-open");

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


function setupMobileMenu() {

    const button =
        $("mobile-menu-toggle");

    const nav =
        $("mainNav");

    if (!button || !nav) return;

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            nav.classList.toggle(
                "mobile-open"
            );

            button.classList.toggle(
                "is-open"
            );

            button.setAttribute(
                "aria-expanded",
                nav.classList.contains(
                    "mobile-open"
                )
            );
        }
    );


    nav.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".nav-btn"
                )
            ) {
                closeMobileMenu();
            }
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !nav.contains(event.target) &&
                !button.contains(event.target)
            ) {
                closeMobileMenu();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeMobileMenu();
            }
        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }
    );
}


/* =========================================================
   القرآن
========================================================= */

function renderSurahs(filter = "") {

    const list = $("surahList");

    if (!list) return;

    const query =
        String(filter)
            .trim()
            .toLowerCase();

    const filtered =
        SURAHS_DATA.filter(surah => {

            return (
                !query ||
                surah.name
                    .toLowerCase()
                    .includes(query) ||
                String(surah.number) === query ||
                arabicDigits(surah.number)
                    .includes(query)
            );
        });


    if (!filtered.length) {

        list.innerHTML =
            `<div class="empty-state">
                لم يتم العثور على سورة.
            </div>`;

        return;
    }


    list.innerHTML =
        filtered.map(surah => `

            <div
                class="surah-row"
                data-surah="${surah.number}"
            >

                <div class="surah-number">
                    ${arabicDigits(surah.number)}
                </div>

                <div class="surah-info">

                    <strong>
                        ${escapeHTML(surah.name)}
                    </strong>

                    <small>
                        ${arabicDigits(surah.ayahs)}
                        آية
                    </small>

                </div>

                <button
                    class="save-surah-btn"
                    type="button"
                    data-save-surah="${surah.number}"
                >
                    ☆
                </button>

            </div>

        `).join("");


    updateSaveButtons();
}


function setupQuranSearch() {

    $("quranSearch")?.addEventListener(
        "input",
        event => {
            renderSurahs(
                event.target.value
            );
        }
    );


    $("surahList")?.addEventListener(
        "click",
        event => {

            const saveButton =
                event.target.closest(
                    "[data-save-surah]"
                );

            if (saveButton) {

                event.stopPropagation();

                toggleFavorite(
                    Number(
                        saveButton.dataset
                            .saveSurah
                    )
                );

                return;
            }


            const row =
                event.target.closest(
                    "[data-surah]"
                );

            if (row) {

                openSurah(
                    Number(
                        row.dataset.surah
                    )
                );
            }
        }
    );


    $("openLastSurah")?.addEventListener(
        "click",
        () => {
            openSurah(
                state.lastSurah || 1
            );
        }
    );
}


/* =========================================================
   قارئ القرآن
========================================================= */

function buildAudioUrl(number) {

    const reciter =
        RECITERS[
            state.selectedReciter
        ] ||
        RECITERS["fixed-yasser"];

    return (
        reciter.base +
        String(number).padStart(3, "0") +
        ".mp3"
    );
}


async function openSurah(number) {

    if (!SURAHS_DATA[number - 1]) {
        return;
    }

    state.lastSurah = number;

    saveState();

    goToSection(
        "readerSection"
    );

    const surah =
        SURAHS_DATA[number - 1];


    if ($("readerTitle")) {

        $("readerTitle").textContent =
            surah.name;
    }


    if ($("readerMeta")) {

        $("readerMeta").textContent =
            `سورة رقم ${arabicDigits(
                surah.number
            )} • ${arabicDigits(
                surah.ayahs
            )} آية`;
    }


    const audio =
        $("quranAudio");


    const status =
        $("audioStatus");


    if (audio) {

        audio.pause();

        audio.src =
            buildAudioUrl(number);

        audio.load();
    }


    if (status) {
        status.textContent =
            "جاري تحميل الآيات…";
    }


    await loadSurahVerses(
        number
    );


    if (status) {

        status.textContent =
            `${
                RECITERS[
                    state.selectedReciter
                ]?.name || "القارئ"
            } — اضغط تشغيل التلاوة`;
    }
}


async function loadSurahVerses(number) {

    const container =
        $("readerVerses");

    if (!container) return;

    container.innerHTML =
        `<div class="empty-state">
            جاري تحميل السورة…
        </div>`;


    try {

        const response =
            await fetch(
                `https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`
            );


        if (!response.ok) {
            throw new Error(
                "Quran API error"
            );
        }


        const data =
            await response.json();


        const ayahs =
            data?.data?.ayahs || [];


        if (!ayahs.length) {
            throw new Error(
                "No verses"
            );
        }


        container.innerHTML =
            ayahs.map(ayah => `

                <article class="verse-card">

                    <div class="verse-number">
                        ${arabicDigits(
                            ayah.numberInSurah
                        )}
                    </div>

                    <p>
                        ${escapeHTML(
                            ayah.text
                        )}
                    </p>

                </article>

            `).join("");


    } catch (error) {

        console.error(
            "Quran loading:",
            error
        );

        container.innerHTML =
            `<div class="empty-state">
                تعذر تحميل الآيات.
                تحقق من اتصال الإنترنت.
            </div>`;
    }
}


function setupReader() {

    const reciter =
        $("reciterSelect");

    const audio =
        $("quranAudio");

    const playButton =
        $("playAudioBtn");

    const status =
        $("audioStatus");


    if (reciter) {

        reciter.value =
            state.selectedReciter;

        reciter.addEventListener(
            "change",
            () => {

                state.selectedReciter =
                    reciter.value;

                saveState();

                if (audio) {

                    audio.pause();

                    audio.src =
                        buildAudioUrl(
                            state.lastSurah
                        );

                    audio.load();
                }


                if (status) {

                    status.textContent =
                        `${
                            RECITERS[
                                state.selectedReciter
                            ]?.name || "القارئ"
                        } — اضغط تشغيل التلاوة`;
                }
            }
        );
    }


    playButton?.addEventListener(
        "click",
        async () => {

            if (!audio) return;

            if (
                !audio.src ||
                audio.src === location.href
            ) {

                audio.src =
                    buildAudioUrl(
                        state.lastSurah || 1
                    );
            }


            try {

                await audio.play();

            } catch {

                if (status) {

                    status.textContent =
                        "اضغط الزر مرة أخرى للسماح بتشغيل الصوت";
                }
            }
        }
    );


    audio?.addEventListener(
        "play",
        () => {

            if (status) {
                status.textContent =
                    "جاري تشغيل التلاوة";
            }
        }
    );


    audio?.addEventListener(
        "pause",
        () => {

            if (status) {
                status.textContent =
                    "التلاوة متوقفة";
            }
        }
    );


    audio?.addEventListener(
        "ended",
        () => {

            if (status) {
                status.textContent =
                    "انتهت التلاوة";
            }
        }
    );


    $("readerBack")?.addEventListener(
        "click",
        () => {
            goToSection(
                "quranSection"
            );
        }
    );
}


/* =========================================================
   المفضلة
========================================================= */

function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "favoriteSurahs"
            ) || "[]"
        )
        .map(Number)
        .filter(Boolean);

    } catch {

        return [];
    }
}


function setFavorites(list) {

    localStorage.setItem(
        "favoriteSurahs",
        JSON.stringify(
            [...new Set(list)]
        )
    );
}


function toggleFavorite(number) {

    let favorites =
        getFavorites();


    if (favorites.includes(number)) {

        favorites =
            favorites.filter(
                n => n !== number
            );

        showToast(
            "تمت إزالة السورة من المحفوظات"
        );

    } else {

        favorites.push(number);

        showToast(
            "تم حفظ السورة ⭐"
        );
    }


    setFavorites(favorites);

    updateSaveButtons();

    renderFavorites();

    updateFavoriteCount();
}


function updateSaveButtons() {

    const favorites =
        getFavorites();


    document
        .querySelectorAll(
            "[data-save-surah]"
        )
        .forEach(button => {

            const number =
                Number(
                    button.dataset
                        .saveSurah
                );

            button.textContent =
                favorites.includes(number)
                    ? "★"
                    : "☆";
        });
}


function renderFavorites() {

    const list =
        $("favoritesList");

    if (!list) return;

    const favorites =
        getFavorites();


    if (!favorites.length) {

        list.innerHTML =
            `<div class="empty-state">
                لا توجد سور محفوظة حتى الآن.
            </div>`;

        updateFavoriteCount();

        return;
    }


    list.innerHTML =
        favorites.map(number => {

            const surah =
                SURAHS_DATA[number - 1];

            if (!surah) return "";


            return `

                <div class="surah-row">

                    <div class="surah-number">
                        ${arabicDigits(
                            surah.number
                        )}
                    </div>

                    <div class="surah-info">

                        <strong>
                            ${escapeHTML(
                                surah.name
                            )}
                        </strong>

                        <small>
                            ${arabicDigits(
                                surah.ayahs
                            )}
                            آية
                        </small>

                    </div>

                    <button
                        class="primary-btn"
                        type="button"
                        data-open-fav="${number}"
                    >
                        فتح
                    </button>

                    <button
                        class="save-surah-btn"
                        type="button"
                        data-remove-fav="${number}"
                    >
                        ★
                    </button>

                </div>

            `;

        }).join("");


    list
        .querySelectorAll(
            "[data-open-fav]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    openSurah(
                        Number(
                            button.dataset
                                .openFav
                        )
                    );
                }
            );
        });


    list
        .querySelectorAll(
            "[data-remove-fav]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    toggleFavorite(
                        Number(
                            button.dataset
                                .removeFav
                        )
                    );
                }
            );
        });


    updateFavoriteCount();
}


function updateFavoriteCount() {

    const count =
        $("favCount");

    if (count) {
        count.textContent =
            getFavorites().length;
    }
}


function setupFavorites() {

    $("clearFavorites")?.addEventListener(
        "click",
        () => {

            if (!getFavorites().length) {

                showToast(
                    "لا توجد محفوظات لمسحها"
                );

                return;
            }


            if (
                !confirm(
                    "هل تريد مسح جميع السور المحفوظة؟"
                )
            ) {
                return;
            }


            localStorage.removeItem(
                "favoriteSurahs"
            );

            renderFavorites();

            updateSaveButtons();

            updateFavoriteCount();

            showToast(
                "تم مسح المحفوظات"
            );
        }
    );
}


/* =========================================================
   مواقيت الصلاة
========================================================= */

async function loadPrayerTimes() {

    const city =
        String(
            state.city || "عمّان"
        ).trim();

    const country =
        String(
            state.country || "الأردن"
        ).trim();


    const box =
        $("prayerTimes");


    if (box) {

        box.innerHTML =
            `<div class="empty-state">
                جاري تحميل مواقيت الصلاة…
            </div>`;
    }


    try {

        const url =
            `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`;


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Prayer API"
            );
        }


        const data =
            await response.json();


        const timings =
            data?.data?.timings;


        if (!timings) {
            throw new Error(
                "No timings"
            );
        }


        window.prayers = {

            Fajr:
                timings.Fajr,

            Dhuhr:
                timings.Dhuhr,

            Asr:
                timings.Asr,

            Maghrib:
                timings.Maghrib,

            Isha:
                timings.Isha
        };


        renderPrayerTimes(
            timings
        );


        updateNextPrayer();


        updateCalendar(
            data?.data?.date
        );


        startAdhanChecker();


    } catch (error) {

        console.error(
            "Prayer times:",
            error
        );

        window.prayers = null;


        if (box) {

            box.innerHTML =
                `<div class="empty-state">
                    تعذر تحميل المواقيت.
                    تحقق من المدينة والإنترنت.
                </div>`;
        }
    }
}


function renderPrayerTimes(
    timings
) {

    const box =
        $("prayerTimes");

    if (!box) return;


    box.innerHTML =
        PRAYER_KEYS.map(
            key => `

                <div class="prayer-item">

                    <span>
                        ${PRAYER_NAMES[key]}
                    </span>

                    <strong>
                        ${escapeHTML(
                            String(
                                timings[key] || "--"
                            ).split(" ")[0]
                        )}
                    </strong>

                </div>

            `
        ).join("");
}


function parsePrayerTime(
    value,
    date = new Date()
) {

    const clean =
        String(value || "")
            .split(" ")[0];

    const parts =
        clean.split(":")
            .map(Number);


    if (
        parts.length < 2 ||
        parts.some(
            Number.isNaN
        )
    ) {
        return null;
    }


    const result =
        new Date(date);

    result.setHours(
        parts[0],
        parts[1],
        0,
        0
    );

    return result;
}


function updateNextPrayer() {

    if (!window.prayers) return;


    const now =
        new Date();

    let next = null;


    for (
        const prayerKey of PRAYER_KEYS
    ) {

        const date =
            parsePrayerTime(
                window.prayers[
                    prayerKey
                ],
                now
            );


        if (
            date &&
            date > now
        ) {

            next = {
                key: prayerKey,
                date
            };

            break;
        }
    }


    if (!next) {

        const tomorrow =
            new Date(now);

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        const date =
            parsePrayerTime(
                window.prayers.Fajr,
                tomorrow
            );


        if (date) {

            next = {
                key: "Fajr",
                date
            };
        }
    }


    if (!next) return;


    const diff =
        Math.max(
            0,
            next.date.getTime() -
            now.getTime()
        );


    const totalSeconds =
        Math.floor(
            diff / 1000
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    const text =
        `${PRAYER_NAMES[next.key]} بعد ` +
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;


    if ($("nextPrayer")) {

        $("nextPrayer").textContent =
            text;
    }


    if ($("nextPrayerLarge")) {

        $("nextPrayerLarge").textContent =
            text;
    }
}


/* =========================================================
   إعدادات المدينة
========================================================= */

function setupPrayerControls() {

    $("updateCity")?.addEventListener(
        "click",
        async () => {

            const input =
                $("cityInput");

            if (!input) return;


            const city =
                input.value.trim();


            if (!city) {

                showToast(
                    "اكتب اسم المدينة أولاً"
                );

                return;
            }


            state.city =
                city;


            const countrySelect =
                $("countrySelect");


            if (
                countrySelect &&
                countrySelect.value
            ) {

                state.country =
                    countrySelect.value;
            }


            saveState();


            await loadPrayerTimes();


            showToast(
                "تم تحديث مواقيت الصلاة"
            );
        }
    );


    $("useLocation")?.addEventListener(
        "click",
        () => {

            if (!navigator.geolocation) {

                showToast(
                    "المتصفح لا يدعم تحديد الموقع"
                );

                return;
            }


            showToast(
                "جاري تحديد موقعك…"
            );


            navigator.geolocation.getCurrentPosition(
                async position => {

                    try {

                        const lat =
                            position.coords.latitude;

                        const lon =
                            position.coords.longitude;


                        const response =
                            await fetch(
                                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`
                            );


                        if (!response.ok) {
                            throw new Error(
                                "location"
                            );
                        }


                        const data =
                            await response.json();


                        const city =
                            data.city ||
                            data.locality ||
                            data.principalSubdivision ||
                            state.city;


                        const country =
                            data.countryName ||
                            state.country;


                        state.city =
                            city;

                        state.country =
                            country;


                        saveState();


                        if ($("cityInput")) {

                            $("cityInput").value =
                                city;
                        }


                        await loadPrayerTimes();


                        showToast(
                            `تم تحديد ${city}`
                        );


                    } catch {

                        showToast(
                            "تعذر تحديد المدينة تلقائياً"
                        );
                    }
                },

                () => {

                    showToast(
                        "لم يتم السماح بالوصول إلى الموقع"
                    );
                }
            );
        }
    );
}


/* =========================================================
   الأذكار
========================================================= */

function renderAzkar(
    category = "morning"
) {

    const list =
        $("azkarList");

    if (!list) return;


    const items =
        AZKAR[category] ||
        AZKAR.morning;


    list.innerHTML =
        items.map(
            (item, index) => `

                <article class="zekr-card">

                    <p>
                        ${escapeHTML(
                            item[0]
                        )}
                    </p>

                    <div class="zekr-actions">

                        <span class="zekr-count">
                            التكرار:
                            ${arabicDigits(
                                item[1]
                            )}
                        </span>

                        <button
                            class="zekr-button"
                            type="button"
                            data-copy-zekr="${index}"
                            data-zekr-text="${escapeHTML(item[0])}"
                        >
                            نسخ
                        </button>

                    </div>

                </article>

            `
        ).join("");


    list
        .querySelectorAll(
            "[data-copy-zekr]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            button.dataset.zeкrText ||
                            button.getAttribute(
                                "data-zekr-text"
                            ) ||
                            ""
                        );

                        showToast(
                            "تم نسخ الذكر"
                        );

                    } catch {

                        showToast(
                            "تعذر النسخ من المتصفح"
                        );
                    }
                }
            );
        });
}


function setupAzkar() {

    document
        .querySelectorAll(
            "#azkarTabs [data-zekr]"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            "#azkarTabs .tab"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    tab.classList.add(
                        "active"
                    );


                    renderAzkar(
                        tab.dataset.zeкr ||
                        tab.dataset.zekr ||
                        "morning"
                    );
                }
            );
        });


    renderAzkar(
        "morning"
    );
}


/* =========================================================
   الأحاديث
========================================================= */

function renderHadiths() {

    const list =
        $("hadithList");

    if (!list) return;


    list.innerHTML =
        HADITHS.map(
            (hadith, index) => `

                <article class="hadith-card">

                    <span class="hadith-number">
                        ${arabicDigits(
                            index + 1
                        )}
                    </span>

                    <p>
                        ${escapeHTML(
                            hadith[0]
                        )}
                    </p>

                    <small>
                        ${escapeHTML(
                            hadith[1]
                        )}
                    </small>

                </article>

            `
        ).join("");


    if ($("hadithCount")) {

        $("hadithCount").textContent =
            HADITHS.length;
    }
}


/* =========================================================
   أسماء الله
========================================================= */

function renderAsma() {

    const grid =
        $("asmaGrid");

    if (!grid) return;


    grid.innerHTML =
        ASMA.map(
            (name, index) => `

                <div class="asma-card">

                    <span>
                        ${arabicDigits(
                            index + 1
                        )}
                    </span>

                    <strong>
                        ${escapeHTML(
                            name
                        )}
                    </strong>

                </div>

            `
        ).join("");


    if ($("asmaCount")) {

        $("asmaCount").textContent =
            ASMA.length;
    }
}


/* =========================================================
   التقويم
========================================================= */

function updateCalendar(
    apiDate = null
) {

    const now =
        new Date();


    const gregorian =
        apiDate?.gregorian?.date ||
        now.toLocaleDateString(
            "ar-JO",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    const hijri =
        apiDate?.hijri
            ? `${apiDate.hijri.day} ${
                apiDate.hijri.month?.ar || ""
              } ${apiDate.hijri.year}`

            : new Intl.DateTimeFormat(
                "ar-SA-u-ca-islamic",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ).format(now);


    if ($("gregorianDate")) {

        $("gregorianDate").textContent =
            gregorian;
    }


    if ($("hijriDate")) {

        $("hijriDate").textContent =
            hijri;
    }
}


/* =========================================================
   الإشعارات
========================================================= */

async function requestNotificationPermissionOnly() {

    if (!("Notification" in window)) {

        showToast(
            "المتصفح لا يدعم الإشعارات"
        );

        return "unsupported";
    }


    if (
        Notification.permission ===
        "default"
    ) {

        try {

            return await Notification.requestPermission();

        } catch {

            return "denied";
        }
    }


    return Notification.permission;
}


async function showPrayerNotification(
    prayerKey
) {

    if (
        !("Notification" in window) ||
        Notification.permission !==
        "granted"
    ) {
        return;
    }


    const name =
        PRAYER_NAMES[prayerKey] ||
        "الصلاة";


    try {

        if (
            "serviceWorker" in
            navigator
        ) {

            const registration =
                await navigator
                    .serviceWorker
                    .ready;


            await registration.showNotification(
                `حان الآن وقت صلاة ${name}`,
                {
                    body:
                        `حان الآن وقت أذان ${name}`,
                    icon:
                        "./icons/icon-192.png",
                    badge:
                        "./icons/icon-192.png",
                    tag:
                        `prayer-${prayerKey}`,
                    requireInteraction:
                        true,
                    dir: "rtl",
                    lang: "ar"
                }
            );

            return;
        }


        new Notification(
            `حان الآن وقت صلاة ${name}`,
            {
                body:
                    `حان الآن وقت أذان ${name}`,
                icon:
                    "./icons/icon-192.png"
            }
        );

    } catch (error) {

        console.log(
            "Notification error:",
            error
        );
    }
}


function setupNotificationButton() {

    const buttons = [
        $("notificationBtn"),
        $("notificationBtnTop")
    ].filter(Boolean);


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const permission =
                    await requestNotificationPermissionOnly();


                if (
                    permission ===
                    "granted"
                ) {

                    localStorage.setItem(
                        "notificationsEnabled",
                        "1"
                    );

                    showToast(
                        "تم تفعيل الإشعارات 🔔"
                    );

                } else if (
                    permission ===
                    "denied"
                ) {

                    showToast(
                        "الإشعارات محظورة من إعدادات المتصفح"
                    );

                } else {

                    showToast(
                        "الإشعارات غير متاحة"
                    );
                }
            }
        );
    });
}


/* =========================================================
   نظام الأذان
========================================================= */

const ADHAN_CONFIG = {

    main: {
        name:
            "أذان مشاري العفاسي",

        url:
            "https://cdn.aladhan.com/audio/adhans/a9.mp3"
    },

    fajr: {
        name:
            "أذان الفجر",

        url:
            "https://cdn.aladhan.com/audio/adhans/a9.mp3"
    }
};


let adhanAudio = null;

let adhanIsPlaying = false;

let currentAdhanPrayer = null;

let adhanCheckTimer = null;


function createAdhanAudio() {

    if (adhanAudio) {
        return adhanAudio;
    }


    adhanAudio =
        new Audio();


    adhanAudio.preload =
        "auto";


    adhanAudio.volume =
        Number(
            localStorage.getItem(
                "adhanVolume"
            ) || 1
        );


    adhanAudio.addEventListener(
        "play",
        () => {

            adhanIsPlaying =
                true;

            updateAdhanUI();
        }
    );


    adhanAudio.addEventListener(
        "pause",
        () => {

            adhanIsPlaying =
                false;

            updateAdhanUI();
        }
    );


    adhanAudio.addEventListener(
        "ended",
        () => {

            adhanIsPlaying =
                false;

            currentAdhanPrayer =
                null;

            updateAdhanUI();
        }
    );


    adhanAudio.addEventListener(
        "error",
        () => {

            adhanIsPlaying =
                false;

            updateAdhanUI();

            showToast(
                "تعذر تشغيل الأذان"
            );
        }
    );


    return adhanAudio;
}


function getAdhanSource(
    prayerKey
) {

    if (
        prayerKey ===
        "Fajr"
    ) {

        return ADHAN_CONFIG.fajr;
    }


    return ADHAN_CONFIG.main;
}


async function playAdhan(
    prayerKey = null,
    testMode = false
) {

    const audio =
        createAdhanAudio();


    const selectedPrayer =
        prayerKey || "Dhuhr";


    const config =
        getAdhanSource(
            selectedPrayer
        );


    try {

        audio.pause();

        audio.currentTime =
            0;

        audio.src =
            config.url;

        audio.load();


        currentAdhanPrayer =
            selectedPrayer;


        await audio.play();


        adhanIsPlaying =
            true;


        updateAdhanUI();


        showToast(
            testMode
                ? `تشغيل أذان ${PRAYER_NAMES[selectedPrayer]} للتجربة`
                : `حان الآن وقت أذان ${PRAYER_NAMES[selectedPrayer]}`
        );


        if (!testMode) {

            showPrayerNotification(
                selectedPrayer
            );
        }


        return true;


    } catch (error) {

        console.error(
            "Adhan playback error:",
            error
        );


        adhanIsPlaying =
            false;


        updateAdhanUI();


        showToast(
            "اضغط زر تجربة الأذان أولاً للسماح بتشغيل الصوت"
        );


        return false;
    }
}


function stopAdhan(
    showMessage = true
) {

    if (adhanAudio) {

        adhanAudio.pause();

        adhanAudio.currentTime =
            0;

        adhanAudio.removeAttribute(
            "src"
        );

        adhanAudio.load();
    }


    adhanIsPlaying =
        false;


    currentAdhanPrayer =
        null;


    if (
        "speechSynthesis" in
        window
    ) {

        speechSynthesis.cancel();
    }


    updateAdhanUI();


    if (showMessage) {

        showToast(
            "تم إيقاف الأذان"
        );
    }
}


function setupAdhanUI() {

    if ($("adhanControls")) {
        return;
    }


    const alarmToggle =
        $("alarmToggle");


    if (!alarmToggle) {
        return;
    }


    const settingRow =
        alarmToggle.closest(
            ".setting-row"
        );


    if (!settingRow) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.id =
        "adhanControls";


    wrapper.className =
        "adhan-control-card";


    wrapper.innerHTML = `

        <div class="adhan-control-header">

            <div>

                <strong>
                    🔊 الأذان
                </strong>

                <div
                    id="adhanStatusText"
                    class="adhan-note"
                >
                    الأذان متوقف
                </div>

            </div>

        </div>


        <div class="adhan-control-buttons">

            <button
                id="testAdhanBtn"
                class="primary-btn"
                type="button"
            >
                ▶️ تجربة الأذان
            </button>


            <button
                id="stopAdhanBtn"
                class="secondary-btn"
                type="button"
                disabled
            >
                ⏹️ إيقاف الأذان
            </button>

        </div>


        <div class="adhan-note">

            عند تفعيل التنبيه سيتم تشغيل
            الأذان عند دخول وقت الصلاة.

        </div>
    `;


    settingRow.insertAdjacentElement(
        "afterend",
        wrapper
    );


    $("testAdhanBtn")?.addEventListener(
        "click",
        async () => {

            const prayer =
                localStorage.getItem(
                    "adhanTestPrayer"
                ) || "Dhuhr";


            await playAdhan(
                prayer,
                true
            );
        }
    );


    $("stopAdhanBtn")?.addEventListener(
        "click",
        () => {

            stopAdhan(true);
        }
    );


    updateAdhanUI();
}


function updateAdhanUI() {

    const status =
        $("adhanStatusText");


    const stopButton =
        $("stopAdhanBtn");


    if (status) {

        status.textContent =
            adhanIsPlaying

                ? `🔊 يتم الآن تشغيل أذان ${
                    PRAYER_NAMES[
                        currentAdhanPrayer
                    ] || "الصلاة"
                  }`

                : "الأذان متوقف";
    }


    if (stopButton) {

        stopButton.disabled =
            !adhanIsPlaying;
    }
}


function getTodayKey() {

    const now =
        new Date();


    return [
        now.getFullYear(),

        String(
            now.getMonth() + 1
        ).padStart(2, "0"),

        String(
            now.getDate()
        ).padStart(2, "0")

    ].join("-");
}


function getAdhanPlayedKey(
    prayerKey
) {

    return (
        `adhanPlayed_` +
        `${getTodayKey()}_` +
        `${state.city}_` +
        `${state.country}_` +
        `${prayerKey}`
    );
}


function wasAdhanPlayed(
    prayerKey
) {

    return (
        localStorage.getItem(
            getAdhanPlayedKey(
                prayerKey
            )
        ) === "1"
    );
}


function markAdhanPlayed(
    prayerKey
) {

    localStorage.setItem(
        getAdhanPlayedKey(
            prayerKey
        ),
        "1"
    );
}


function checkPrayerAlarm() {

    const alarmToggle =
        $("alarmToggle");


    if (
        !alarmToggle ||
        !alarmToggle.checked
    ) {
        return;
    }


    if (!window.prayers) {
        return;
    }


    const now =
        new Date();


    for (
        const prayerKey of
        PRAYER_KEYS
    ) {

        const prayerDate =
            parsePrayerTime(
                window.prayers[
                    prayerKey
                ],
                now
            );


        if (!prayerDate) {
            continue;
        }


        const difference =
            (
                now.getTime() -
                prayerDate.getTime()
            ) / 1000;


        if (
            difference >= 0 &&
            difference <= 90
        ) {

            if (
                wasAdhanPlayed(
                    prayerKey
                )
            ) {
                continue;
            }


            if (adhanIsPlaying) {
                continue;
            }


            playAdhan(
                prayerKey,
                false
            ).then(
                success => {

                    if (success) {

                        markAdhanPlayed(
                            prayerKey
                        );
                    }
                }
            );


            break;
        }
    }
}


function startAdhanChecker() {

    if (adhanCheckTimer) {

        clearInterval(
            adhanCheckTimer
        );
    }


    adhanCheckTimer =
        setInterval(
            () => {

                checkPrayerAlarm();

                updateNextPrayer();

            },
            1000
        );


    checkPrayerAlarm();
}


function setupPrayerAlarm() {

    const alarmToggle =
        $("alarmToggle");


    if (!alarmToggle) {
        return;
    }


    alarmToggle.checked =
        localStorage.getItem(
            "adhanAlarm"
        ) === "1";


    alarmToggle.addEventListener(
        "change",
        async () => {

            const enabled =
                alarmToggle.checked;


            localStorage.setItem(
                "adhanAlarm",
                enabled ? "1" : "0"
            );


            if (enabled) {

                createAdhanAudio();

                await requestNotificationPermissionOnly();

                startAdhanChecker();

                showToast(
                    "تم تفعيل تنبيه الأذان 🔔"
                );

            } else {

                stopAdhan(false);

                showToast(
                    "تم إيقاف تنبيه الأذان"
                );
            }
        }
    );


    setupAdhanUI();

    startAdhanChecker();
}


/* =========================================================
   تثبيت التطبيق PWA
========================================================= */

let deferredInstallPrompt =
    null;


function setupInstallButton() {

    const button =
        $("installAppBtn");


    if (!button) {
        return;
    }


    const installed =
        localStorage.getItem(
            "pwaInstalled"
        ) === "1" ||

        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||

        window.navigator.standalone === true;


    if (installed) {

        button.style.display =
            "none";
    }


    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();

            deferredInstallPrompt =
                event;

            button.style.display =
                "grid";
        }
    );


    window.addEventListener(
        "appinstalled",
        () => {

            localStorage.setItem(
                "pwaInstalled",
                "1"
            );

            deferredInstallPrompt =
                null;

            button.style.display =
                "none";

            showToast(
                "تم تثبيت نور على جهازك ✓"
            );
        }
    );


    button.addEventListener(
        "click",
        async () => {

            if (!deferredInstallPrompt) {

                showToast(
                    "افتح قائمة المتصفح واختر تثبيت التطبيق"
                );

                return;
            }


            deferredInstallPrompt.prompt();


            try {

                await deferredInstallPrompt
                    .userChoice;

            } catch {}


            deferredInstallPrompt =
                null;
        }
    );
}


/* =========================================================
   حذف البيانات
========================================================= */

function setupClearData() {

    $("clearData")?.addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "سيتم حذف الإعدادات والمحفوظات المحلية. هل تريد المتابعة؟"
                )
            ) {
                return;
            }


            const theme =
                localStorage.getItem(
                    "theme"
                );


            localStorage.clear();


            if (theme) {

                localStorage.setItem(
                    "theme",
                    theme
                );
            }


            state.city =
                "عمّان";

            state.country =
                "الأردن";

            state.lastSurah =
                1;

            state.selectedReciter =
                "fixed-yasser";


            renderFavorites();

            updateFavoriteCount();

            loadPrayerTimes();


            showToast(
                "تم مسح البيانات"
            );
        }
    );
}


/* =========================================================
   تشغيل الموقع
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            setupNavigation();

            setupTheme();

            setupMobileMenu();


            renderSurahs();

            setupQuranSearch();

            setupReader();


            setupFavorites();

            renderFavorites();


            setupPrayerControls();


            setupAzkar();

            renderHadiths();

            renderAsma();

            updateCalendar();


            setupNotificationButton();

            setupInstallButton();

            setupClearData();


            setupPrayerAlarm();


            if ($("cityInput")) {

                $("cityInput").value =
                    state.city;
            }


            loadPrayerTimes();


            updateFavoriteCount();


            console.log(
                "نور: تم تحميل app.js بنجاح"
            );


        } catch (error) {

            console.error(
                "نور app.js initialization error:",
                error
            );


            showToast(
                "حدث خطأ أثناء تشغيل الموقع"
            );
        }
    }
);