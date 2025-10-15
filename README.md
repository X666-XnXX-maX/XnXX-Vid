Static Video Site (Cyberpunk) - v2

تغييرات في النسخة هذه:
- واجهة تسجيل دخول جديدة وفخمة مع animation.
- حماية بسيطة في video.html تمنع الوصول المباشر إلا بعد فتح القفل (localStorage 'unlocked_v1').
- أداة Node: generate_videos_json.js لتوليد videos.json تلقائيًا من ملفات داخل مجلد video/.
- الإصلاحات: encode/decode للروابط في video.html لتحسين تشغيل الفيديو.

كيفية الاستخدام:
1) ضع ملفات الفيديو داخل مجلد 'video/'.
2) شغّل: node generate_videos_json.js  --> سيولّد videos.json تلقائيًا.
3) لتعيين PIN جديد: node gen_pin_hash.js YOUR_PIN  --> انسخ الهـاش الناتج والصقه في script.js عند PIN_HASH.
4) افتح index.html محليًا أو ارفع المشروع إلى GitHub Pages.
