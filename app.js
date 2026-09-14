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

function getTodayKey() {
    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
}


function getPrayerDate(timeString) {
    const now = new Date();

    const cleanTime = String(timeString || "")
        .split(" ")[0]
        .trim();

    const parts = cleanTime.split(":");

    if (parts.length < 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    const prayerDate = new Date(now);

    prayerDate.setHours(hours, minutes, 0, 0);

    return prayerDate;
}


function getAdhanPlayedKey(prayerKey) {
    return `adhanPlayed_${getTodayKey()}_${state.city}_${state.country}_${prayerKey}`;
}


function wasAdhanPlayed(prayerKey) {
    return localStorage.getItem(
        getAdhanPlayedKey(prayerKey)
    ) === "1";
}


function markAdhanPlayed(prayerKey) {
    localStorage.setItem(
        getAdhanPlayedKey(prayerKey),
        "1"
    );
}


// فحص أوقات الصلاة كل ثانية
function checkPrayerAlarm() {
    const alarmToggle = document.getElementById("alarmToggle");

    if (!alarmToggle || !alarmToggle.checked) {
        return;
    }

    if (!window.prayers) {
        return;
    }

    const now = new Date();

    for (const prayerKey of PRAYER_KEYS) {

        const timeString = window.prayers[prayerKey];

        if (!timeString) continue;

        const prayerDate = getPrayerDate(timeString);

        if (!prayerDate) continue;

        const difference =
            (now.getTime() - prayerDate.getTime()) / 1000;

        // من وقت الصلاة وحتى 90 ثانية بعدها
        if (difference >= 0 && difference <= 90) {

            if (wasAdhanPlayed(prayerKey)) {
                continue;
            }

            const played = playAdhan(prayerKey, false);

            Promise.resolve(played).then(success => {
                if (success) {
                    markAdhanPlayed(prayerKey);
                }
            });
        }
    }
}


// تشغيل الفحص بشكل مستمر
function startAdhanChecker() {

    if (adhanCheckTimer) {
        clearInterval(adhanCheckTimer);
    }

    adhanCheckTimer = setInterval(() => {
        checkPrayerAlarm();
    }, 1000);

    checkPrayerAlarm();
}


// طلب إذن الإشعارات فقط
async function requestNotificationPermissionOnly() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "default") {
        try {
            await Notification.requestPermission();
        } catch (error) {
            console.log("Notification permission error:", error);
        }
    }
}


// إشعار وقت الصلاة
async function showPrayerNotification(prayerKey) {

    const prayerName =
        PRAYER_NAMES[prayerKey] || "الصلاة";

    const title = `حان الآن وقت صلاة ${prayerName}`;

    const options = {
        body: `حان الآن وقت أذان ${prayerName}`,
        icon: "icons/icon-192.png",
        badge: "icons/icon-192.png",
        tag: `prayer-${prayerKey}`,
        requireInteraction: true,
        dir: "rtl",
        lang: "ar"
    };

    try {

        if (
            "serviceWorker" in navigator &&
            navigator.serviceWorker.controller
        ) {
            const registration =
                await navigator.serviceWorker.ready;

            await registration.showNotification(
                title,
                options
            );

            return;
        }

        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {
            new Notification(title, options);
        }

    } catch (error) {
        console.log("Prayer notification error:", error);
    }
}


// إعداد مفتاح تشغيل الأذان
function setupPrayerAlarm() {

    const alarmToggle =
        document.getElementById("alarmToggle");

    if (!alarmToggle) return;

    alarmToggle.checked =
        localStorage.getItem("adhanAlarm") === "1";

    alarmToggle.addEventListener("change", async () => {

        const enabled = alarmToggle.checked;

        localStorage.setItem(
            "adhanAlarm",
            enabled ? "1" : "0"
        );

        if (enabled) {

            createAdhanAudio();

            await requestNotificationPermissionOnly();

            startAdhanChecker();

            if (typeof showToast === "function") {
                showToast("تم تفعيل تنبيه الأذان 🔔");
            }

        } else {

            stopAdhan(false);

            if (typeof showToast === "function") {
                showToast("تم إيقاف تنبيه الأذان");
            }
        }
    });

    setupAdhanUI();
    startAdhanChecker();
}