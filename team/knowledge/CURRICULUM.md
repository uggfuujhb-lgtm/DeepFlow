# منهج خبير الأبحاث (من الصفر لين الاحتراف)

> كل جلسة دراسة تاخذ **أول بند ما انعلّم عليه ✅**، وتدرسه بعمق من مصادر عامة. وتكتب ملف المفهوم في `team/knowledge/`: الشرح، والأمثلة بالأرقام، والأخطاء الشائعة، والربط بطريقتنا، و3 أسئلة اختبار، والمصادر.
> بعدها تعلّم ✅ على البند وتكتب اسم الملف جنبه. وإذا البند يحتاج أكثر من جلسة، تكمل عليه في الجلسة اللي بعدها.
> **كل سبت:** اختبار ذاتي على دروس الأسبوع، يُكتب في `team/out/research/exam-YYYY-MM-DD.md`، والدرس اللي يطلع ضعيف يرجع للمنهج.

## المسار 1: نظرية المزاد (Auction Market Theory)
- [x] 1.1 منطقة البزنس، والقيمة، والـPOC ← business-area.md
- [x] 1.2 أصول نظرية المزاد: ستيدلماير والـMarket Profile ورسم TPO ← market-profile-tpo.md (الأداة tpo.py)
- [x] 1.3 التوازن وعدم التوازن ← balance-imbalance.md (باك تست: inside_day)
- [x] 1.4 أنواع الأيام ← day-types.md (bt_intraday.py daytype + bt_daily.py trend_day)
- [x] 1.5 Initial Balance وعلاقته بالأوبن رينج ← initial-balance.md (bt_intraday.py ib)
- [x] 1.6 القبول والرفض والمزاد الفاشل ← acceptance-rejection.md (bt_daily.py failed_auction)
- [x] 1.7 Poor highs/lows، والـSingle prints، والـExcess ← poor-highs-single-prints.md (tpo.py --structure)
- [x] 1.8 Composite Profile ومناطق القيمة متعددة الأيام ← composite-profile.md (tpo.py مركّب + bt_daily.py bracket_break)
- [x] 1.9 من يتحكم: Other Timeframe ضد Day Timeframe ← otf-vs-dtf.md (bt_intraday.py opentype + bt_daily.py open_location)
- [x] 1.10 خطة يوم كاملة من نظرية المزاد بس ← auction-day-plan.md (bt_daily.py plan_open). **المسار 1 خلص.**

## المسار 2: الأوردر فلو
- [x] 2.1 دفتر الأوامر (DOM): الأوامر المعلّقة والسوقية، ومن «يهاجم» ← dom-order-book.md (غير قابل للاختبار ببياناتنا)
- [x] 2.2 الفوليوم بروفايل بعمق: HVN وLVN، والجلسة ضد النطاق الثابت ← hvn-lvn.md (بروفايل الوقت، لأن SPX ما له فوليوم)
- [x] 2.3 VWAP وانحرافاته: متى يكون مغناطيس، ومتى يكون جدار ← vwap.md (bt_intraday.py vwap، تقريب TWAP)
- [x] 2.4 الفوتبرنت: Bid×Ask، والدلتا لكل شمعة، والـImbalance ← footprint.md (bt_intraday.py flowdelta، بديل من تدفق الأوبشن)
- [x] 2.5 الـCVD والدلتا التراكمية والتباعد (Divergence) ← cvd-divergence.md (bt_intraday.py cvd، بديل من تدفق الأوبشن)
- [x] 2.6 الامتصاص (Absorption) والإنهاك (Exhaustion) ← absorption-exhaustion.md (bt_intraday.py absorb)
- [x] 2.7 Icebergs، والسحب والتعبئة (Spoofing / Pulling)، وقراءة الهيت ماب ← icebergs-spoofing-heatmap.md (غير قابل للاختبار ببياناتنا)
- [x] 2.8 طريقة فابيو: Direction ← Location ← Aggression (من المصادر العامة) ← fabio-dla.md (bt_daily.py dla)
- [x] 2.9 إدارة المخاطرة عند السكالبرز: 0.25%، وأين الوقف، ونسب العائد ← risk-management.md (risk_sim.py)
- [x] 2.10 خطة يوم كاملة: أوردر فلو + منطقة البزنس ← full-day-plan.md (bt_daily.py weak_close، ومسودة الاثنين 9 نوفمبر)

## المسار 3: الأوبشن فلو
- [x] 3.1 صناع السوق: ليش يتحوّطون، وكيف ← market-makers-hedging.md (bt_daily.py opex)
- [x] 3.2 GEX بعمق: الحساب، والافتراضات، وحدوده (وليش أداتنا «تقريبية») ← gex-deep.md
- [x] 3.3 Gamma Flip / الزيرو قاما: الحد بين القاما الموجبة والسالبة ← zero-gamma.md (تعريف المالك، والأداة zero_gamma.py)
- [x] 3.4 Call Wall وPut Wall وHVL: وكيف تنحسب عند المنصات المختلفة ← walls-hvl.md
- [x] 3.5 DEX وجدران الدلتا ← dex-walls.md
- [x] 3.6 عقود 0DTE: حجمها، وأثرها خلال اليوم، وPin risk ← 0dte.md (bt_daily.py zerodte)
- [x] 3.7 الانتهاء الشهري وOPEX والـCharm Flows حوله ← opex-charm.md (bt_daily.py opex_week)
- [x] 3.8 قراءة الفلو اللحظي: Sweeps وBlocks، والفرق بين Opening وClosing ← flow-feed.md (غير قابل للاختبار، وانضاف أرشيف السلسلة)
- [x] 3.9 الـSkew وسطح التذبذب، وش يقول عن الخوف ← skew-vol-surface.md (bt_daily.py skew)
- [x] 3.10 VIX والـTerm Structure وعلاقتها بالقاما ← vix-term-structure.md (bt_daily.py term)

## المسار 4: اليونانيات
- [x] 4.1 الدلتا: التعريف، والاحتمال، والتحوّط ← delta.md (bt_daily.py delta_prob)
- [x] 4.2 القاما: سرعة الدلتا، وليش تنفجر قرب الانتهاء ← gamma-greek.md
- [x] 4.3 الثيتا: تآكل الوقت وعلاقته بالقاما ← theta.md (bt_daily.py theta_gamma)
- [x] 4.4 الفيقا: حساسية التذبذب ← vega.md (bt_daily.py vega)
- [x] 4.5 الفانا (Vanna): تغيّر الدلتا مع التذبذب، وتدفقات الفانا ← vanna.md (bt_daily.py vanna)
- [x] 4.6 التشارم (Charm): تغيّر الدلتا مع الوقت، وتدفقات آخر اليوم ← charm.md (bt_intraday.py charm)
- [x] 4.7 اليونانيات من الدرجة الثالثة: Speed وZomma وColor (باختصار) ← third-order-greeks.md
- [x] 4.8 بلاك-شولز ببساطة: وش يفترض، ووين يخرب ← black-scholes.md (bt_daily.py bs_tails)
- [x] 4.9 كيف تتجمّع يونانيات صناع السوق وتصير «جدران» ← greeks-to-walls.md (chain_walls.py)
- [x] 4.10 مثال كامل: يوم سباكس من اليونانيات للتدفقات للسعر ← full-day-greeks.md (chain_walls.py)

## المسار 5: الدمج (النبوغ)
- [x] 5.1 جدار قاما على حافة منطقة بزنس: أقوى منطقة ← edge-plus-wall.md (bt_daily.py edge_strike)
- [x] 5.2 نظام القاما + نوع اليوم في نظرية المزاد ← regime-daytype.md (bt_daily.py regime_daytype)
- [x] 5.3 أوبن رينج + Initial Balance + القاما ← or-ib-gamma.md (bt_intraday.py ib)
- [x] 5.4 دراسة حالات: 10 أيام من سباكس بالطرق الثلاث ← case-studies.md (6 من 10 أيام، والباقي يُضاف مع الأرشيف)
- [x] 5.5 كتابة منهج «المستوى المتقدم» للدورة من كل اللي فات ← في Google Drive بس (مجلد trading: «منهج المستوى المتقدم - مسودة»)، محتوى دورة ما يرتفع هنا
