if ('serviceWorker' in navigator && location.protocol !== 'file:') { navigator.serviceWorker.register('service-worker.js').catch(()=>{}); }
// ===== الحالة العامة =====
const state = {
    city: localStorage.getItem("city") || "عمّان",
    country: localStorage.getItem("country") || "الأردن",
    lastSurah: Number(localStorage.getItem("lastSurah") || 1),
    selectedReciter: localStorage.getItem("selectedReciter") || "fixed-yasser",
    adhanEnabled: localStorage.getItem("adhanEnabled") === "1"
};

// ===== الدول العربية =====
const countries = [
    "الأردن", "السعودية", "الإمارات", "قطر", "الكويت", "البحرين",
    "عُمان", "اليمن", "العراق", "سوريا", "لبنان", "فلسطين",
    "مصر", "ليبيا", "تونس", "الجزائر", "المغرب", "موريتانيا",
    "السودان", "الصومال", "جيبوتي", "جزر القمر"
];

// ===== عاصمة كل دولة =====
const countryCapitals = {
    "الأردن": "عمّان", "السعودية": "الرياض", "الإمارات": "أبوظبي",
    "قطر": "الدوحة", "الكويت": "مدينة الكويت", "البحرين": "المنامة",
    "عُمان": "مسقط", "اليمن": "صنعاء", "العراق": "بغداد",
    "سوريا": "دمشق", "لبنان": "بيروت", "فلسطين": "القدس",
    "مصر": "القاهرة", "ليبيا": "طرابلس", "تونس": "تونس",
    "الجزائر": "الجزائر", "المغرب": "الرباط", "موريتانيا": "نواكشوط",
    "السودان": "الخرطوم", "الصومال": "مقديشو", "جيبوتي": "جيبوتي",
    "جزر القمر": "موروني"
};

// ===== خريطة أسماء الدول بالإنجليزية =====
const countryMapEN = {
    "الأردن": "Jordan", "السعودية": "Saudi Arabia", "الإمارات": "UAE",
    "قطر": "Qatar", "الكويت": "Kuwait", "البحرين": "Bahrain",
    "عُمان": "Oman", "اليمن": "Yemen", "العراق": "Iraq",
    "سوريا": "Syria", "لبنان": "Lebanon", "فلسطين": "Palestine",
    "مصر": "Egypt", "ليبيا": "Libya", "تونس": "Tunisia",
    "الجزائر": "Algeria", "المغرب": "Morocco", "موريتانيا": "Mauritania",
    "السودان": "Sudan", "الصومال": "Somalia", "جيبوتي": "Djibouti",
    "جزر القمر": "Comoros"
};

// ===== أسماء السور =====
const surahNames = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام",
    "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد",
    "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء",
    "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة",
    "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر",
    "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية",
    "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات",
    "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد",
    "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون",
    "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة",
    "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة",
    "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير",
    "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى",
    "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى",
    "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة",
    "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل",
    "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد",
    "الإخلاص", "الفلق", "الناس"
];

// ===== خريطة صفحات المصحف =====
const surahStartPage = {
    1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187,
    10: 208, 11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267,
    17: 282, 18: 293, 19: 305, 20: 312, 21: 322, 22: 332, 23: 342,
    24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
    31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446,
    38: 453, 39: 458, 40: 467, 41: 477, 42: 483, 43: 489, 44: 496,
    45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518, 51: 520,
    52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542,
    59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556, 65: 558,
    66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572,
    73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583,
    80: 585, 81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591,
    87: 591, 88: 592, 89: 593, 90: 594, 91: 595, 92: 595, 93: 596,
    94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
    101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602,
    107: 602, 108: 602, 109: 603, 110: 603, 111: 603, 112: 604,
    113: 604, 114: 604
};

// ===== القرّاء =====
const RECITERS = {
    'fixed-yasser': { name: 'ياسر الدوسري', server: 'https://server11.mp3quran.net/yasser/', total: 114 },
    'fixed-afasy': { name: 'مشاري العفاسي', server: 'https://server8.mp3quran.net/afs/', total: 114 },
    'fixed-luhaidan': { name: 'محمد اللحيدان', server: 'https://server8.mp3quran.net/lhdan/', total: 114 },
    'fixed-islam': { name: 'إسلام صبحي', server: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/', total: 109 },
    'fixed-sudais': { name: 'عبد الرحمن السديس', server: 'https://server11.mp3quran.net/sds/', total: 114 },
    'fixed-muaiqly': { name: 'ماهر المعيقلي', server: 'https://server12.mp3quran.net/maher/', total: 114 },
    'fixed-husary': { name: 'محمود خليل الحصري', server: 'https://server13.mp3quran.net/husr/', total: 114 }
};

// ===== الأذكار =====
const azkar = {
    morning: [
        "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
        "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.",
        "رضيت بالله رباً وبالإسلام ديناً وبمحمد ﷺ نبياً.",
        "اللهم إني أسألك خير هذا اليوم، فتحه ونصره ونوره وبركته وهداه.",
        "اللهم ما أصبح بي من نعمة فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.",
        "اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر.",
        "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير."
    ],
    evening: [
        "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
        "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.",
        "رضيت بالله رباً وبالإسلام ديناً وبمحمد ﷺ نبياً.",
        "اللهم إني أسألك خير هذه الليلة، فتحها ونصرها ونورها وبركتها وهداها.",
        "اللهم ما أمسى بي من نعمة فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.",
        "اللهم إني أعوذ بك من الكسل والهرم، وأعوذ بك من عذاب القبر.",
        "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير."
    ],
    sleep: [
        "باسمك اللهم أموت وأحيا.",
        "اللهم قني عذابك يوم تبعث عبادك.",
        "اللهم أسلمت نفسي إليك، ووجهت وجهي إليك، وفوضت أمري إليك.",
        "آمنت بكتابك الذي أنزلت، ونبيك الذي أرسلت.",
        "سبحان الله والحمد لله والله أكبر (33 مرة)."
    ],
    dua: [
        "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
        "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً.",
        "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا.",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ.",
        "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.",
        "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا."
    ],
    quran: [
        "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا. (البقرة 286)",
        "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً. (آل عمران 8)",
        "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ. (آل عمران 16)",
        "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ. (البقرة 250)",
        "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ وَنَجِّنَا بِرَحْمَتِكَ. (يونس 85-86)",
        "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ. (الحشر 10)"
    ]
};

// ===== الأحاديث =====
const hadiths = [
    { text: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.", source: "رواه البخاري ومسلم" },
    { text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.", source: "رواه البخاري" },
    { text: "مَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالْآخِرَةِ.", source: "رواه مسلم" },
    { text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.", source: "رواه البخاري ومسلم" },
    { text: "لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ.", source: "رواه أبو داود والترمذي" },
    { text: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ.", source: "رواه البخاري ومسلم" },
    { text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.", source: "رواه البخاري ومسلم" },
    { text: "الدُّعَاءُ هُوَ الْعِبَادَةُ.", source: "رواه أبو داود والترمذي" },
    { text: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ.", source: "رواه الطبراني" },
    { text: "مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا.", source: "رواه مسلم" },
    { text: "الْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ.", source: "رواه البخاري ومسلم" },
    { text: "إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ.", source: "رواه البخاري ومسلم" },
    { text: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ.", source: "رواه أبو داود والترمذي" },
    { text: "مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ.", source: "رواه البخاري ومسلم" },
    { text: "السَّمْعُ وَالطَّاعَةُ عَلَى الْمَرْءِ الْمُسْلِمِ فِيمَا أَحَبَّ وَكَرِهَ، مَا لَمْ يُؤْمَرْ بِمَعْصِيَةٍ.", source: "رواه البخاري ومسلم" }
];

// ===== أسماء الله الحسنى =====
const asmaAllah = [
    { name: "الرحمن", meaning: "الذي وسعت رحمته كل شيء" },
    { name: "الرحيم", meaning: "الذي يرحم عباده المؤمنين" },
    { name: "الملك", meaning: "المالك المتصرف في ملكه" },
    { name: "القدوس", meaning: "المنزه عن كل نقص" },
    { name: "السلام", meaning: "الذي سلم من كل عيب" },
    { name: "المؤمن", meaning: "المصدق رسله" },
    { name: "المهيمن", meaning: "الشاهد على خلقه" },
    { name: "العزيز", meaning: "المنيع القاهر" },
    { name: "الجبار", meaning: "المصلح أمور خلقه" },
    { name: "المتكبر", meaning: "المتصف بالكبرياء والعظمة" },
    { name: "الخالق", meaning: "المبدئ المقدر" },
    { name: "البارئ", meaning: "المخترع المنشئ" },
    { name: "المصور", meaning: "المصور خلقه" },
    { name: "الغفار", meaning: "الغافر لذنوب عباده" },
    { name: "القهار", meaning: "القاهر فوق عباده" },
    { name: "الوهاب", meaning: "الذي يهب عطاياه" },
    { name: "الرزاق", meaning: "الذي خلق الأرزاق" },
    { name: "الفتاح", meaning: "الذي يفتح أبواب رحمته" },
    { name: "العليم", meaning: "المحيط علمه بكل شيء" },
    { name: "القابض", meaning: "القابض الأرزاق والأرواح" },
    { name: "الباسط", meaning: "الباسط الرزق" },
    { name: "الخافض", meaning: "الخافض لأعدائه" },
    { name: "الرافع", meaning: "الرافع لعباده المؤمنين" },
    { name: "المعز", meaning: "المعز لمن شاء" },
    { name: "المذل", meaning: "المذل لمن شاء" },
    { name: "السميع", meaning: "الذي يسمع كل شيء" },
    { name: "البصير", meaning: "الذي يرى كل شيء" },
    { name: "الحكم", meaning: "الذي يفصل بين خلقه" },
    { name: "العدل", meaning: "العادل في قضائه" },
    { name: "اللطيف", meaning: "الذي يوصل إحسانه" },
    { name: "الخبير", meaning: "المطلع على خفايا الأمور" },
    { name: "الحليم", meaning: "الذي يتجاوز عن الذنوب" },
    { name: "العظيم", meaning: "الذي عظم عن كل شيء" },
    { name: "الغفور", meaning: "الذي يغفر الذنوب" },
    { name: "الشكور", meaning: "الذي يشكر القليل" },
    { name: "العلي", meaning: "الذي ترفع درجته" },
    { name: "الكبير", meaning: "الذي كل شيء دونه" },
    { name: "الحفيظ", meaning: "الحافظ لخلقه" },
    { name: "المقيت", meaning: "المقتدر على الشيء" },
    { name: "الحسيب", meaning: "المحاسب لخلقه" },
    { name: "الجليل", meaning: "المتصف بالعظمة" },
    { name: "الكريم", meaning: "الذي يعطي ولا ينفد" },
    { name: "الرقيب", meaning: "المطلع على كل شيء" },
    { name: "المجيب", meaning: "المجيب لدعاء عباده" },
    { name: "الواسع", meaning: "الذي وسع علمه" },
    { name: "الحكيم", meaning: "المتقن لخلقه" },
    { name: "الودود", meaning: "المحب لأوليائه" },
    { name: "المجيد", meaning: "الكامل في ذاته" },
    { name: "الباعث", meaning: "الباعث عباده" },
    { name: "الشهيد", meaning: "المطلع على كل شيء" },
    { name: "الحق", meaning: "الثابت لا يزول" },
    { name: "الوكيل", meaning: "المتكفل بأمور خلقه" },
    { name: "القوي", meaning: "القاهر" },
    { name: "المتين", meaning: "القوي الشديد" },
    { name: "الولي", meaning: "الناصر لأوليائه" },
    { name: "الحميد", meaning: "المحمود في أفعاله" },
    { name: "المحصي", meaning: "المحيط بكل شيء" },
    { name: "المبدئ", meaning: "الذي بدأ الخلق" },
    { name: "المعيد", meaning: "الذي يعيد الخلق" },
    { name: "المحيي", meaning: "الذي يحيي العظام" },
    { name: "المميت", meaning: "الذي يميت الخلق" },
    { name: "الحي", meaning: "الذي لا يموت" },
    { name: "القيوم", meaning: "القائم على كل شيء" },
    { name: "الواجد", meaning: "الذي لا يعجزه شيء" },
    { name: "الماجد", meaning: "كثير المجد" },
    { name: "الواحد", meaning: "المنفرد بذاته" },
    { name: "الأحد", meaning: "المنفرد بالألوهية" },
    { name: "الصمد", meaning: "الذي لا يحتاج إلى شيء" },
    { name: "القادر", meaning: "القادر على كل شيء" },
    { name: "المقتدر", meaning: "القاهر القادر" },
    { name: "المقدم", meaning: "المقدم لعباده" },
    { name: "المؤخر", meaning: "المؤخر لمن شاء" },
    { name: "الأول", meaning: "الموجود قبل كل شيء" },
    { name: "الآخر", meaning: "الباقي بعد كل شيء" },
    { name: "الظاهر", meaning: "الظاهر بآياته" },
    { name: "الباطن", meaning: "الباطن في علمه" },
    { name: "الوالي", meaning: "المالك المتصرف" },
    { name: "المتعالي", meaning: "المتعالي عن صفات الخلق" },
    { name: "البر", meaning: "العطوف" },
    { name: "التواب", meaning: "الذي يقبل التوبة" },
    { name: "المنتقم", meaning: "المنتقم من الكفار" },
    { name: "العفو", meaning: "المتجاوز عن الذنوب" },
    { name: "الرؤوف", meaning: "الشديد الرحمة" },
    { name: "مالك الملك", meaning: "المالك للملك" },
    { name: "ذو الجلال والإكرام", meaning: "المتصف بالجلال والإكرام" },
    { name: "المقسط", meaning: "المنصف في حكمه" },
    { name: "الجامع", meaning: "الذي يجمع خلقه" },
    { name: "الغني", meaning: "الغني عن خلقه" },
    { name: "المغني", meaning: "المغني لعباده" },
    { name: "المانع", meaning: "المانع لما يشاء" },
    { name: "الضار", meaning: "الذي يضرب عباده" },
    { name: "النافع", meaning: "الذي ينفع عباده" },
    { name: "النور", meaning: "الهادي المبين" },
    { name: "الهادي", meaning: "الذي يهدي عباده" },
    { name: "البديع", meaning: "المبدع في خلقه" },
    { name: "الباقي", meaning: "الباقي لا يزول" },
    { name: "الوارث", meaning: "الوارث لعباده" },
    { name: "الرشيد", meaning: "الرشيد في فعله" },
    { name: "الصبور", meaning: "الذي يصبر على خلقه" }
];

// ===== دوال مساعدة =====
const $ = id => document.getElementById(id);
const QURAN_CDN = "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/";

// دالة تحويل الوقت إلى نظام 12 ساعة
function formatTime12(time24) {
    if (!time24) return "--:--";
    const parts = String(time24).split(":");
    let hours = Number(parts[0]);
    const minutes = parts[1] || "00";
    const period = hours >= 12 ? "م" : "ص";
    if (hours === 0) hours = 12;
    else if (hours > 12) hours = hours - 12;
    return `${hours}:${minutes} ${period}`;
}

function saveState() {
    localStorage.setItem("city", state.city);
    localStorage.setItem("country", state.country);
    localStorage.setItem("lastSurah", state.lastSurah);
    localStorage.setItem("selectedReciter", state.selectedReciter);
    localStorage.setItem("adhanEnabled", state.adhanEnabled ? "1" : "0");
}

function toast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function applyTheme() {
    const isLight = localStorage.getItem("theme") === "light";
    document.body.classList.toggle("light", isLight);
    if ($("themeToggle2")) $("themeToggle2").checked = isLight;
}

function showSection(id) {
    document.querySelectorAll(".section-page").forEach(s => s.classList.remove("active-page"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active-page");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.go === id));
    if (id === "favoritesSection") renderFavorites();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-go]");
    if (btn) {
        const target = btn.dataset.go;
        if (target) showSection(target);
    }
});

// ============================================
// ===== الوضع الليلي / النهاري =====
// ============================================
function setupTheme() {
    applyTheme();
    const toggle = $("themeToggle");
    if (toggle) {
        toggle.onclick = () => {
            const isLight = localStorage.getItem("theme") === "light";
            localStorage.setItem("theme", isLight ? "dark" : "light");
            applyTheme();
            toast(isLight ? "🌙 الوضع الليلي" : "☀️ الوضع النهاري");
        };
    }
    const toggle2 = $("themeToggle2");
    if (toggle2) {
        toggle2.onchange = (e) => {
            localStorage.setItem("theme", e.target.checked ? "light" : "dark");
            applyTheme();
            toast(e.target.checked ? "☀️ الوضع النهاري" : "🌙 الوضع الليلي");
        };
    }
}

// ============================================
// ===== مواقيت الصلاة =====
// ============================================
function setupCountries() {
    const countrySelect = $("countrySelect");
    if (!countrySelect) return;
    countrySelect.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join("");
    countrySelect.value = state.country;
    state.city = countryCapitals[state.country] || state.city;
    saveState();
    updateLocationDisplay();
    countrySelect.onchange = () => {
        state.country = countrySelect.value;
        state.city = countryCapitals[state.country] || state.city;
        saveState();
        updateLocationDisplay();
        loadPrayerTimes();
        toast(`📍 ${state.city}، ${state.country}`);
    };
}

function updateLocationDisplay() {
    if ($("locationText")) {
        $("locationText").textContent = `${state.city}، ${state.country}`;
    }
}

async function loadPrayerTimes() {
    const d = new Date();
    const date = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    try {
        const country = countryMapEN[state.country] || state.country;
        const url = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(state.city)}&country=${encodeURIComponent(country)}&method=4`;
        const r = await fetch(url);
        const j = await r.json();
        if (!j.data?.timings) throw new Error("No data");
        window.prayers = j.data.timings;
        renderPrayerTimes();
    } catch {
        if ($("prayerStatus")) $("prayerStatus").textContent = "⚠️ تعذر جلب المواقيت";
    }
}

function renderPrayerTimes() {
    const names = { Fajr: "الفجر", Sunrise: "الشروق", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
    const p = window.prayers;
    if (!p) return;
    if ($("prayerStatus")) $("prayerStatus").textContent = `${state.city}، ${state.country}`;
    const container = $("prayerTimes");
    if (container) {
        container.innerHTML = Object.entries(names).map(([k, v]) =>
            `<div class="prayer-item"><span>${v}</span><strong>${formatTime12(p[k])}</strong></div>`
        ).join("");
    }
    clearInterval(window._prayerTimer);
    window._prayerTimer = setInterval(updateNextPrayer, 1000);
    updateNextPrayer();
}

function updateNextPrayer() {
    const p = window.prayers;
    if (!p) return;
    const now = new Date();
    const keys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const labels = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
    let next = null;
    for (const k of keys) {
        const [h, m] = String(p[k]).split(":").map(Number);
        const d = new Date(now);
        d.setHours(h, m, 0, 0);
        if (d > now) { next = { k, d }; break; }
    }
    if (!next) {
        const [h, m] = String(p.Fajr).split(":").map(Number);
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        d.setHours(h, m, 0, 0);
        next = { k: "Fajr", d };
    }
    const ms = next.d - now;
    const hh = Math.floor(ms / 3600000);
    const mm = Math.floor((ms % 3600000) / 60000);
    const ss = Math.floor((ms % 60000) / 1000);
    const txt = `${labels[next.k]} بعد ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    if ($("nextPrayer")) $("nextPrayer").textContent = txt;
    if ($("nextPrayerLarge")) $("nextPrayerLarge").textContent = txt;
}

function useLocation() {
    if (!navigator.geolocation) return toast("⚠️ المتصفح لا يدعم تحديد الموقع");
    toast("📍 جاري تحديد موقعك...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=ar`);
            const d = await r.json();
            const detectedCountry = d.countryName || state.country;
            if (countries.includes(detectedCountry)) {
                state.country = detectedCountry;
            }
            state.city = countryCapitals[state.country] || d.city || state.city;
            if ($("countrySelect")) $("countrySelect").value = state.country;
            saveState();
            updateLocationDisplay();
            loadPrayerTimes();
            toast(`✅ ${state.city}، ${state.country}`);
        } catch {
            toast("⚠️ تعذر تحديد المدينة");
        }
    }, () => toast("⚠️ الرجاء السماح بتحديد الموقع"));
}

// ============================================
// ===== المحفوظات =====
// ============================================
function getFavorites() {
    return JSON.parse(localStorage.getItem("noor_saved_surahs") || "[]");
}

function saveFavorites(favs) {
    localStorage.setItem("noor_saved_surahs", JSON.stringify(favs));
    updateFavCount();
}

function updateFavCount() {
    const favs = getFavorites();
    if ($("favCount")) $("favCount").textContent = favs.length;
}

function isSurahSaved(surahId) {
    return getFavorites().some(f => f.surahId === surahId);
}

async function toggleSurahSave(surahId, event) {
    if (event) event.stopPropagation();
    let favs = getFavorites();
    const existing = favs.findIndex(f => f.surahId === surahId);
    if (existing > -1) {
        favs.splice(existing, 1);
        saveFavorites(favs);
        toast("تم إزالة السورة من المحفوظات");
        renderChapters(window.chapters || []);
        renderFavorites();
    } else {
        toast("جاري حفظ السورة...");
        try {
            const r = await fetch(`${QURAN_CDN}${surahId}.json`);
            const j = await r.json();
            const verses = (j.verses || []).map(v => ({
                number: v.verseNumber || v.number,
                text: v.text || v.text_ar || v.text_uthmani || ""
            }));
            if (!verses.length) throw new Error("فشل تحميل الآيات");
            favs.push({
                surahId: surahId,
                surahName: surahNames[surahId - 1],
                versesCount: verses.length,
                verses: verses,
                savedAt: new Date().toISOString()
            });
            saveFavorites(favs);
            toast(`✅ تم حفظ سورة ${surahNames[surahId - 1]} كاملة`);
            renderChapters(window.chapters || []);
            renderFavorites();
        } catch (err) {
            toast("⚠️ تعذر حفظ السورة، حاول مرة أخرى");
        }
    }
}

window.toggleSurahSave = toggleSurahSave;

function renderFavorites() {
    const container = $("favoritesList");
    if (!container) return;
    const favs = getFavorites();
    if (favs.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <h3>لا توجد سور محفوظة بعد</h3>
                <p>اذهب إلى قسم القرآن واضغط على أيقونة القلب ♡ بجانب أي سورة لحفظها كاملة هنا مع تلاوتها.</p>
                <button class="primary-btn" data-go="quranSection">اذهب إلى القرآن</button>
            </div>
        `;
        return;
    }
    container.innerHTML = favs.map((fav, idx) => `
        <div class="favorite-card" onclick="openFavoriteSurah(${fav.surahId})">
            <div class="favorite-header">
                <span class="surah-num">${fav.surahId}</span>
                <span class="surah-name">${fav.surahName}</span>
                <span class="surah-verses">${fav.versesCount} آية</span>
            </div>
            <div class="favorite-info">
                <div>
                    <small>${new Date(fav.savedAt).toLocaleDateString("ar-JO")}</small>
                </div>
                <div class="favorite-actions">
                    <button onclick="event.stopPropagation(); openFavoriteSurah(${fav.surahId})" title="فتح السورة">📖</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteFavorite(${idx})" title="حذف من المحفوظات">🗑️</button>
                </div>
            </div>
        </div>
    `).join("");
}

window.openFavoriteSurah = function(surahId) {
    openSurah(surahId);
};

window.deleteFavorite = function(idx) {
    if (!confirm("هل تريد حذف هذه السورة من المحفوظات؟")) return;
    const favs = getFavorites();
    favs.splice(idx, 1);
    saveFavorites(favs);
    renderFavorites();
    renderChapters(window.chapters || []);
    toast("🗑️ تم حذف السورة من المحفوظات");
};

// ============================================
// ===== القرآن =====
// ============================================
function loadChapters() {
    const list = surahNames.map((name, i) => ({ id: i + 1, name: name }));
    renderChapters(list);
    window.chapters = list;
}

function renderChapters(list) {
    const searchInput = $("quranSearch");
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const filtered = list.filter(s => !q || s.name.includes(q) || String(s.id).includes(q));
    const container = $("surahList");
    if (!container) return;
    container.innerHTML = filtered.map(s => {
        const saved = isSurahSaved(s.id);
        return `
            <div class="surah-row-wrapper">
                <button class="surah-row" data-surah="${s.id}">
                    <span class="surah-number">${s.id}</span>
                    <strong>${s.name}</strong>
                </button>
                <button class="save-surah-btn ${saved ? 'saved' : ''}" 
                        onclick="toggleSurahSave(${s.id}, event)" 
                        title="${saved ? 'إزالة من المحفوظات' : 'حفظ السورة'}">
                    ${saved ? '♥' : '♡'}
                </button>
            </div>
        `;
    }).join("");
    document.querySelectorAll("[data-surah]").forEach(b => {
        b.onclick = () => openSurah(+b.dataset.surah);
    });
}

let currentViewMode = "verses";

async function openSurah(id) {
    state.lastSurah = id;
    saveState();
    showSection("readerSection");
    if ($("readerTitle")) $("readerTitle").textContent = surahNames[id - 1] || `السورة ${id}`;
    if ($("readerMeta")) $("readerMeta").textContent = `سورة رقم ${id}`;
    if ($("viewModeToggle")) $("viewModeToggle").textContent = "📄 عرض الصفحة";
    currentViewMode = "verses";
    if ($("readerVerses")) {
        $("readerVerses").innerHTML = '<div class="location-card loading">جاري تحميل السورة...</div>';
    }
    if ($("quranAudio")) {
        $("quranAudio").removeAttribute("src");
        $("quranAudio").load();
    }
    if ($("audioStatus")) $("audioStatus").textContent = "🎙️ جاري تحميل التلاوة...";
    const savedFav = getFavorites().find(f => f.surahId === id);
    if (savedFav && savedFav.verses && savedFav.verses.length) {
        renderVerses(savedFav.verses.map(v => ({
            key: `${id}:${v.number}`,
            number: v.number,
            text: v.text
        })));
    } else {
        try {
            const r = await fetch(`${QURAN_CDN}${id}.json`);
            const j = await r.json();
            const verses = (j.verses || []).map(v => ({
                key: v.verse_key || `${id}:${v.verseNumber || v.number}`,
                number: v.verseNumber || v.number,
                text: v.text || v.text_ar || v.text_uthmani || ""
            }));
            if (verses.length) renderVerses(verses);
            else throw new Error("No verses");
        } catch {
            if ($("readerVerses")) {
                $("readerVerses").innerHTML = '<div class="location-card loading">⚠️ تعذر تحميل السورة، تأكد من الاتصال بالإنترنت</div>';
            }
        }
    }
    await loadAudio(id);
}

function renderVerses(verses) {
    const container = $("readerVerses");
    if (!container) return;
    container.innerHTML = verses.map(v => `
        <div class="verse-card">
            <div class="verse-text">${v.text} <span class="ayah-number">﴿${v.number}﴾</span></div>
            <div class="verse-actions">
                <button onclick="copyVerse(this)">📋 نسخ</button>
            </div>
        </div>
    `).join("");
}

window.copyVerse = function(btn) {
    const text = btn.closest(".verse-card").querySelector(".verse-text").textContent;
    navigator.clipboard.writeText(text)
        .then(() => toast("📋 تم نسخ الآية"))
        .catch(() => toast("⚠️ تعذر النسخ"));
};

async function loadAudio(id) {
    const reciter = state.selectedReciter || "fixed-yasser";
    const r = RECITERS[reciter] || RECITERS['fixed-yasser'];
    if (id > r.total) {
        if ($("audioStatus")) $("audioStatus").textContent = `⚠️ السورة ${id} غير متوفرة لهذا القارئ`;
        return;
    }
    const file = String(id).padStart(3, '0') + '.mp3';
    const audioUrl = r.server + file;
    const audio = $("quranAudio");
    if (audio) {
        audio.src = audioUrl;
        audio.load();
    }
    if ($("audioStatus")) $("audioStatus").textContent = `🎙️ تلاوة ${r.name}`;
}
// ============================================
// ===== الأذكار =====
// ============================================
function renderAzkar(type = "morning") {
    const list = azkar[type] || [];
    const container = $("azkarList");
    if (!container) return;
    container.innerHTML = list.map((text, i) =>
        `<div class="zekr-card">
            <div class="zekr-text">${text}</div>
            <div class="zekr-footer">
                <span>الذكر ${i + 1}</span>
                <button class="zekr-button" onclick="markZekr(this)">✅ تمت القراءة</button>
            </div>
        </div>`
    ).join("");
}

window.markZekr = function(btn) {
    btn.textContent = "✅ تم";
    btn.disabled = true;
    toast("🤲 جزاك الله خيراً");
};

// ============================================
// ===== الأحاديث =====
// ============================================
function renderHadiths() {
    const container = $("hadithList");
    if (!container) return;
    container.innerHTML = hadiths.map(h =>
        `<div class="hadith-card" onclick="copyHadith(this)">
            <div class="hadith-text">${h.text}</div>
            <span class="hadith-source">📌 ${h.source}</span>
        </div>`
    ).join("");
    if ($("hadithCount")) $("hadithCount").textContent = hadiths.length;
}

window.copyHadith = function(card) {
    const text = card.querySelector(".hadith-text").textContent;
    navigator.clipboard.writeText(text)
        .then(() => toast("📋 تم نسخ الحديث"))
        .catch(() => toast("⚠️ تعذر النسخ"));
};

// ============================================
// ===== أسماء الله =====
// ============================================
function renderAsma() {
    const container = $("asmaGrid");
    if (!container) return;
    container.innerHTML = asmaAllah.map(a =>
        `<div class="asma-card" onclick="asmaClick('${a.name}')">
            <div class="asma-name">${a.name}</div>
            <div class="asma-meaning">${a.meaning}</div>
        </div>`
    ).join("");
    if ($("asmaCount")) $("asmaCount").textContent = asmaAllah.length;
}

window.asmaClick = function(name) {
    toast(`🤲 اللهم إنك ${name}`);
};

// ============================================
// ===== التقويم =====
// ============================================
function updateCalendar() {
    const d = new Date();
    if ($("gregorianDate")) {
        $("gregorianDate").textContent = d.toLocaleDateString("ar-JO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
    if ($("hijriDate")) {
        $("hijriDate").textContent = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }).format(d);
    }
}

// ============================================
// ===== صفحة المصحف =====
// ============================================
function showMushafPage(surahId) {
    const pageNumber = surahStartPage[surahId] || 1;
    window.currentMushafPage = pageNumber;
    const container = $("readerVerses");
    if (!container) return;
    container.innerHTML = '<div class="location-card loading">جاري تحميل صفحة المصحف...</div>';
    const imageUrl = `https://api.kalamalah.com/api/mushaf/qatar-mushaf/${pageNumber - 1}`;
    container.innerHTML = `
        <div class="mushaf-page-container">
            <img src="${imageUrl}" alt="صفحة ${pageNumber} من المصحف" 
                 class="mushaf-page-image"
                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=&quot;location-card loading&quot;>⚠️ تعذر تحميل صورة الصفحة.</div>'">
        </div>
        <div class="page-navigation">
            <button class="primary-btn" onclick="changeMushafPage('prev')">← الصفحة السابقة</button>
            <span>الصفحة ${pageNumber}</span>
            <button class="primary-btn" onclick="changeMushafPage('next')">الصفحة التالية →</button>
        </div>
    `;
}

window.changeMushafPage = function(direction) {
    if (!window.currentMushafPage) return;
    let newPage = window.currentMushafPage;
    if (direction === "next" && newPage < 604) newPage++;
    else if (direction === "prev" && newPage > 1) newPage--;
    else {
        toast(direction === "next" ? "هذه آخر صفحة" : "هذه أول صفحة");
        return;
    }
    window.currentMushafPage = newPage;
    const imageUrl = `https://api.kalamalah.com/api/mushaf/qatar-mushaf/${newPage - 1}`;
    const container = $("readerVerses");
    if (!container) return;
    container.innerHTML = `
        <div class="mushaf-page-container">
            <img src="${imageUrl}" alt="صفحة ${newPage} من المصحف" 
                 class="mushaf-page-image"
                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=&quot;location-card loading&quot;>⚠️ تعذر تحميل صورة الصفحة.</div>'">
        </div>
        <div class="page-navigation">
            <button class="primary-btn" onclick="changeMushafPage('prev')">← الصفحة السابقة</button>
            <span>الصفحة ${newPage}</span>
            <button class="primary-btn" onclick="changeMushafPage('next')">الصفحة التالية →</button>
        </div>
    `;
};

// ============================================
// ===== الإشعارات =====
// ============================================
async function requestNotifications() {
    if (!("Notification" in window)) {
        toast("⚠️ الإشعارات غير مدعومة في هذا المتصفح");
        return;
    }
    
    if (Notification.permission === "granted") {
        toast("🔔 الإشعارات مفعّلة بالفعل");
        showWelcomeNotification();
        return;
    }
    
    if (Notification.permission === "denied") {
        toast("❌ الإشعارات محظورة. افتح إعدادات المتصفح للسماح بها");
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            toast("✅ تم تفعيل الإشعارات بنجاح");
            const btn = $("notificationBtnTop");
            if (btn) btn.classList.add("notif-active");
            showWelcomeNotification();
        } else {
            toast("❌ لم يتم السماح بالإشعارات");
        }
    } catch (err) {
        toast("⚠️ حدث خطأ أثناء طلب الإشعارات");
    }
}

function showWelcomeNotification() {
    try {
        const notif = new Notification("🕌 نور", {
            body: "ستصلك تنبيهات بمواقيت الصلاة والأذكار اليومية",
            icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='38' fill='%230d1119'/><text x='96' y='132' font-size='120' font-weight='bold' text-anchor='middle' fill='%23c9a961' font-family='serif'>%D9%86</text></svg>",
            badge: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='38' fill='%230d1119'/><text x='96' y='132' font-size='120' font-weight='bold' text-anchor='middle' fill='%23c9a961' font-family='serif'>%D9%86</text></svg>",
            tag: "noor-welcome"
        });
        notif.onclick = () => {
            window.focus();
            notif.close();
        };
    } catch (err) {
        console.log("Notification error:", err);
    }
}

function setupNotificationButton() {
    const notifBtnTop = $("notificationBtnTop");
    if (notifBtnTop) {
        if ("Notification" in window && Notification.permission === "granted") {
            notifBtnTop.classList.add("notif-active");
        }
        notifBtnTop.onclick = requestNotifications;
    }
}

// ============================================
// ===== نظام الأذان التلقائي =====
// ============================================
let adhanAudio = null;
let adhanPlayedFor = {};
let isAdhanPlaying = false;

function initAdhan() {
    adhanAudio = new Audio('adhan.mp3');
    adhanAudio.preload = 'auto';
    adhanAudio.volume = 1.0;

    adhanAudio.onended = () => {
        isAdhanPlaying = false;
        const stopBtn = document.getElementById('stopAdhanBtn');
        if (stopBtn) stopBtn.style.display = 'none';
        toast('🤲 تم الأذان');
    };

    if (!document.getElementById('stopAdhanBtn')) {
        const btn = document.createElement('button');
        btn.id = 'stopAdhanBtn';
        btn.className = 'danger-btn';
        btn.textContent = '⏹️ إيقاف الأذان';
        btn.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: none;
            padding: 12px 24px;
            font-size: 15px;
            border-radius: 14px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        `;
        btn.onclick = stopAdhan;
        document.body.appendChild(btn);
    }
}

function playAdhan(prayerName) {
    if (!state.adhanEnabled) return;
    if (!adhanAudio) initAdhan();
    if (isAdhanPlaying) return;

    const today = new Date().toDateString();
    const key = `${prayerName}-${today}`;
    if (adhanPlayedFor[key]) return;

    const isFajr = (prayerName === 'الفجر');
    const adhanFile = isFajr ? 'adhan-fajr.mp3' : 'adhan.mp3';

    if (adhanAudio.src.indexOf(adhanFile) === -1) {
        adhanAudio.src = adhanFile;
        adhanAudio.load();
    }

    isAdhanPlaying = true;
    adhanPlayedFor[key] = true;

    adhanAudio.play().then(() => {
        const stopBtn = document.getElementById('stopAdhanBtn');
        if (stopBtn) stopBtn.style.display = 'block';
        toast(`🕌 حان وقت صلاة ${prayerName}`);
        if (Notification.permission === 'granted') {
            new Notification('🕌 نور', {
                body: `حان الآن وقت صلاة ${prayerName}`,
                icon: 'icon-192.png'
            });
        }
    }).catch(() => {
        isAdhanPlaying = false;
        toast(`⚠️ تعذر تشغيل أذان ${prayerName}، تأكد من وجود ملف ${adhanFile}`);
    });
}

function stopAdhan() {
    if (adhanAudio) {
        adhanAudio.pause();
        adhanAudio.currentTime = 0;
    }
    isAdhanPlaying = false;
    const stopBtn = document.getElementById('stopAdhanBtn');
    if (stopBtn) stopBtn.style.display = 'none';
    toast('⏹️ تم إيقاف الأذان');
}

function checkAdhanTime() {
    if (!state.adhanEnabled) return;
    if (!window.prayers) return;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const prayerNames = {
        Fajr: 'الفجر',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
    };

    for (const [key, name] of Object.entries(prayerNames)) {
        if (window.prayers[key] && window.prayers[key] === currentTime) {
            playAdhan(name);
            break;
        }
    }
}

function setupAdhanToggle() {
    const toggle = $("adhanToggle");
    if (toggle) {
        toggle.checked = state.adhanEnabled;
        toggle.onchange = (e) => {
            state.adhanEnabled = e.target.checked;
            saveState();
            toast(state.adhanEnabled ? "🔔 تم تفعيل الأذان التلقائي" : "🔕 تم إيقاف الأذان التلقائي");
        };
    }
}

// ✅ دالة ربط أزرار تجربة الأذان
function setupAdhanTestButtons() {
    const testNormal = document.getElementById("testAdhanNormal");
    const testFajr = document.getElementById("testAdhanFajr");
    
    if (testNormal) {
        testNormal.onclick = () => {
            adhanPlayedFor = {};
            state.adhanEnabled = true;
            playAdhan("الظهر");
        };
    }
    
    if (testFajr) {
        testFajr.onclick = () => {
            adhanPlayedFor = {};
            state.adhanEnabled = true;
            playAdhan("الفجر");
        };
    }
}

// ============================================
// ===== التهيئة عند التحميل =====
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }
    setupTheme();
    setupCountries();
    
    loadPrayerTimes();
    loadChapters();
    renderAzkar("morning");
    renderHadiths();
    renderAsma();
    updateCalendar();
    updateFavCount();
    renderFavorites();
    
    setupNotificationButton();
    initAdhan();
    setupAdhanToggle();
    setupAdhanTestButtons();
    
    const quranSearch = $("quranSearch");
    if (quranSearch) {
        quranSearch.oninput = () => renderChapters(window.chapters || []);
    }
    
    if ($("openLastSurah")) {
        $("openLastSurah").onclick = () => openSurah(state.lastSurah);
    }
    if ($("readerBack")) {
        $("readerBack").onclick = () => showSection("quranSection");
    }
    
    if ($("viewModeToggle")) {
        $("viewModeToggle").onclick = () => {
            if (currentViewMode === "verses") {
                currentViewMode = "page";
                $("viewModeToggle").textContent = "📖 عرض الآيات";
                showMushafPage(state.lastSurah);
            } else {
                currentViewMode = "verses";
                $("viewModeToggle").textContent = "📄 عرض الصفحة";
                openSurah(state.lastSurah);
            }
        };
    }
    
    if ($("reciterSelect")) {
        $("reciterSelect").value = state.selectedReciter;
        $("reciterSelect").onchange = function() {
            state.selectedReciter = this.value;
            saveState();
            if ($("readerSection") && $("readerSection").classList.contains("active-page")) {
                loadAudio(state.lastSurah);
            }
        };
    }
    
    if ($("playAudioBtn")) {
        $("playAudioBtn").onclick = () => {
            const audio = $("quranAudio");
            if (audio && audio.src) {
                audio.play().catch(() => toast("⚠️ لا يوجد ملف تلاوة"));
            } else {
                toast("⚠️ اختر سورة أولاً");
            }
        };
    }
    
    if ($("useLocation")) {
        $("useLocation").onclick = useLocation;
    }
    
    if ($("alarmToggle")) {
        $("alarmToggle").checked = localStorage.getItem("alarm") === "1";
        $("alarmToggle").onchange = (e) => localStorage.setItem("alarm", e.target.checked ? "1" : "0");
    }
    
    document.querySelectorAll("[data-zekr]").forEach(tab => {
        tab.onclick = function() {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            renderAzkar(this.dataset.zekr);
        };
    });
    
    if ($("notificationBtn")) {
        $("notificationBtn").onclick = requestNotifications;
    }
    
    if ($("clearData")) {
        $("clearData").onclick = () => {
            if (confirm("هل تريد مسح جميع البيانات؟")) {
                localStorage.clear();
                location.reload();
            }
        };
    }
    
    if ($("clearFavorites")) {
        $("clearFavorites").onclick = () => {
            if (getFavorites().length === 0) {
                toast("لا توجد محفوظات لمسحها");
                return;
            }
            if (confirm("هل تريد حذف جميع المحفوظات؟")) {
                saveFavorites([]);
                renderFavorites();
                renderChapters(window.chapters || []);
                toast("🗑️ تم مسح جميع المحفوظات");
            }
        };
    }
    
    showSection("homeSection");
    
    setInterval(updateCalendar, 60000);
    setInterval(checkAdhanTime, 1000);
});

// ============================================
// ===== قائمة الأقسام للهاتف =====
// ============================================
(function setupMobileMenu() {
    const menuButton = document.getElementById("mobileMenuToggle");
    const mainNav = document.getElementById("mainNav");

    if (!menuButton || !mainNav) return;

    const closeMenu = () => {
        mainNav.classList.remove("mobile-open");
        menuButton.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
    };

    const toggleMenu = () => {
        const isOpen = mainNav.classList.toggle("mobile-open");
        menuButton.classList.toggle("is-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
    };

    menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    mainNav.addEventListener("click", (event) => {
        const sectionButton = event.target.closest("[data-go]");
        if (sectionButton) closeMenu();
    });

    document.addEventListener("click", (event) => {
        if (!mainNav.classList.contains("mobile-open")) return;
        if (!mainNav.contains(event.target) && !menuButton.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeMenu();
    });
})();