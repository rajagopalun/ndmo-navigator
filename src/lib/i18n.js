import { domains, controls, specifications, maturityQuestions } from '../ndmoData.js'
import { resetUniverse } from './items.js'
export const LD = { ar: null }
let CUR = 'en'; export const getLang = () => CUR
const RAW = `
NDMO / NDI Compliance Tracker=متتبع الامتثال لـ NDMO / NDI
Home=الرئيسية
Dashboard=لوحة المؤشرات
Tasks=المهام
Reports=التقارير
Library=المكتبة
NDMO=NDMO
NDI=المؤشر الوطني للبيانات (NDI)
NDI OE=التميز التشغيلي (NDI OE)
PDPL=نظام حماية البيانات الشخصية
Change password=تغيير كلمة المرور
Log off=تسجيل الخروج
Search requirement ID or keyword=ابحث برقم المتطلب أو بكلمة مفتاحية
Search requirements=بحث في المتطلبات
Find any requirement=ابحث عن أي متطلب
Search by requirement ID, keyword, domain, owner, department, status or deadline=ابحث برقم المتطلب أو الكلمة المفتاحية أو المجال أو المسؤول أو الإدارة أو الحالة أو الموعد النهائي
My tasks=مهامي
Overdue=متأخرة
Missing evidence=أدلة ناقصة
Due in 14 days=مستحقة خلال 14 يومًا
Under review=قيد المراجعة
More filters=المزيد من عوامل التصفية
Hide filters=إخفاء عوامل التصفية
Search=بحث
Search results=نتائج البحث
All requirements=جميع المتطلبات
Any domain=أي مجال
Any status=أي حالة
Any owner=أي مسؤول
Any department=أي إدارة
Deadline from=الموعد النهائي من
Deadline to=الموعد النهائي إلى
Data Management and Personal Data Protection Standards=معايير إدارة البيانات وحماية البيانات الشخصية
National Data Index – maturity and evidence=المؤشر الوطني للبيانات – النضج والأدلة
Operational Excellence metrics=مقاييس التميز التشغيلي
Personal Data Protection Law (articles)=نظام حماية البيانات الشخصية (المواد)
verified compliant=متوافق (تم التحقق)
Filters=عوامل التصفية
Regulation=النظام / اللائحة
All=الكل
All regulations=جميع الأنظمة
Domain=المجال
Workflow status=حالة سير العمل
Owner=المسؤول
Department=الإدارة
Clear all filters=مسح جميع عوامل التصفية
Show more=عرض المزيد
Requirement ID or keyword=رقم المتطلب أو كلمة مفتاحية
No evidence=لا يوجد دليل
Due in 14 days=مستحقة خلال 14 يومًا
overview=نظرة عامة
Expand all=توسيع الكل
Collapse=طي
Add section=إضافة قسم
Hide menu=إخفاء القائمة
Show menu=إظهار القائمة
Side menu=القائمة الجانبية
Breadcrumb=مسار التنقل
Official regulatory text=النص التنظيمي الرسمي
Reading aid – key points=أداة مساعدة للقراءة – النقاط الرئيسية
Implementation steps=خطوات التنفيذ
Evidence checklist (acceptance evidence from the NDI document)=قائمة الأدلة (أدلة القبول الواردة في وثيقة المؤشر الوطني للبيانات)
Evidence checklist – tick each item when submitted=قائمة الأدلة – ضع علامة على كل بند عند تقديمه
Status, ownership & review history=الحالة والمسؤولية وسجل المراجعة
Cross-references=الإحالات المرجعية
NDI maturity questions=أسئلة النضج في المؤشر
NDI OE metrics in this domain=مقاييس التميز التشغيلي في هذا المجال
None for this domain.=لا يوجد لهذا المجال.
Suggested practice only – these steps are not official NDMO text.=ممارسة مقترحة فقط – هذه الخطوات ليست نصًا رسميًا.
Each point is taken from the official text above (obligation words highlighted). No requirements are added.=كل نقطة مأخوذة من النص الرسمي أعلاه. لم تتم إضافة أي متطلبات.
Wording is reproduced from the document.=الصياغة منقولة من الوثيقة.
Source: =المصدر: 
Goal: produce=الهدف: إعداد
that satisfies this specification.=يحقق هذه المواصفة.
Roles named in the text:=الأدوار المذكورة في النص:
Frequency stated:=الدورية المذكورة:
Sub-sections=الأقسام الفرعية
Requirements=المتطلبات
Evidence submitted=تم تقديم الدليل
Verified compliant=متوافق (تم التحقق)
Not Started=لم يبدأ
In Progress=قيد التنفيذ
Evidence Submitted=تم تقديم الدليل
Under Review=قيد المراجعة
Verified Compliant=متوافق (تم التحقق)
Partially Compliant=متوافق جزئيًا
Non-Compliant=غير متوافق
Level=المستوى
Priority=الأولوية
Control=الضابط
Article=المادة
Evidence:=الدليل:
Acceptance criteria=معايير القبول
Acceptance criterion:=معيار القبول:
NDMO specifications evidenced at this level=مواصفات NDMO المدعومة بأدلة في هذا المستوى
All NDMO specifications for this question=جميع مواصفات NDMO لهذا السؤال
No evidence items listed for this level.=لا توجد بنود أدلة مدرجة لهذا المستوى.
None mapped at this level.=لا توجد مواصفات مرتبطة بهذا المستوى.
items submitted=بنود تم تقديمها
Level description=وصف المستوى
Metric description=وصف المقياس
Mark this metric target as achieved / completed=تحديد هدف المقياس كمحقق / مكتمل
Details, evidence & history=التفاصيل والأدلة والسجل
Hide details=إخفاء التفاصيل
Review comment (saved with the next status change)=تعليق المراجعة (يُحفظ مع تغيير الحالة)
Owner (username or name)=المسؤول (اسم المستخدم أو الاسم)
Reviewer (username)=المراجع (اسم المستخدم)
Evidence reference (doc no. / link)=مرجع الدليل (رقم الوثيقة / رابط)
Start date=تاريخ البدء
Deadline=الموعد النهائي
% complete=نسبة الإنجاز %
Notes=ملاحظات
Evidence attachments=مرفقات الأدلة
No files attached yet.=لم يتم إرفاق ملفات بعد.
Attach evidence files=إرفاق ملفات الأدلة
Uploading…=جارٍ الرفع…
Review history=سجل المراجعة
No review history yet.=لا يوجد سجل مراجعة بعد.
Loading history…=جارٍ تحميل السجل…
Save=حفظ
Save changes=حفظ التغييرات
Saving…=جارٍ الحفظ…
Discard changes=تجاهل التغييرات
Unsaved changes – press Save to record them and log the review history.=تغييرات غير محفوظة – اضغط حفظ لتسجيلها وتسجيل سجل المراجعة.
Selected files are uploaded when you press Save.=يتم رفع الملفات المختارة عند الضغط على حفظ.
Submitted=تم التقديم
Due=مستحق
Overall compliance=الامتثال الإجمالي
Completed (verified)=مكتمل (تم التحقق)
Awaiting review=بانتظار المراجعة
Pending evidence=أدلة معلقة
Overdue tasks=مهام متأخرة
Upcoming deadlines=مواعيد قادمة
verified compliant ÷ total=متوافق (تم التحقق) ÷ الإجمالي
not yet submitted=لم يتم التقديم بعد
next 14 days=الأيام الـ14 القادمة
Overview=نظرة عامة
NDI maturity=نضج المؤشر الوطني
Metrics table=جدول المقاييس
Power BI export & guide=تصدير Power BI والدليل
NDMO + NDI + NDI OE=NDMO + NDI + NDI OE (جميع الأنظمة)
All workflow statuses=جميع حالات سير العمل
Evidence submitted or later=تم تقديم الدليل أو ما بعده
Not submitted=لم يتم التقديم
Search items…=بحث في البنود…
All domains=جميع المجالات
All owners=جميع المسؤولين
Due from=الموعد من
Due to=الموعد إلى
Clear=مسح
Compliance workflow status (click a bar to filter)=حالة سير عمل الامتثال (انقر على عمود للتصفية)
Status split (click a slice to filter)=توزيع الحالات (انقر على جزء للتصفية)
Progress by domain (click a bar to filter)=التقدم حسب المجال (انقر على عمود للتصفية)
By priority / level / platform=حسب الأولوية / المستوى / المنصة
Completions over time=الإنجازات عبر الزمن
Items due by month (not yet completed)=البنود المستحقة حسب الشهر (غير المكتملة)
Overdue and due within 14 days=المتأخرة والمستحقة خلال 14 يومًا
Completed=مكتمل
Pending=معلق
Cumulative=التراكمي
Total items=إجمالي البنود
Metric / item name=اسم المقياس / البند
Group=المجموعة
Priority / level=الأولوية / المستوى
Status=الحالة
Workflow=سير العمل
Reviewer=المراجع
Files=الملفات
Open=فتح
Previous=السابق
Next=التالي
Export CSV=تصدير CSV
Export PDF=تصدير PDF
Page=صفحة
Export to Power BI=التصدير إلى Power BI
Regulatory Library=المكتبة التنظيمية
Evidence Library=مكتبة الأدلة
Download PDF=تحميل PDF
Add document=إضافة وثيقة
Search file or requirement=بحث عن ملف أو متطلب
All uploaders=جميع الرافعين
File=الملف
Requirement=المتطلب
Uploaded by=رُفع بواسطة
Date=التاريخ
Size=الحجم
No evidence files yet. Attach evidence on any requirement page.=لا توجد ملفات أدلة بعد. أرفق الأدلة من صفحة أي متطلب.
Official documents used by this tracker. Always check SDAIA for the latest published version.=وثائق رسمية يستخدمها هذا النظام. يرجى التحقق دائمًا من أحدث نسخة منشورة لدى سدايا.
Official Arabic text=النص العربي الرسمي
Official English text=النص الإنجليزي الرسمي
Open the Arabic PDF in a new tab=فتح ملف PDF العربي في تبويب جديد
Open in new tab=فتح في تبويب جديد
Personal Data Protection Law=نظام حماية البيانات الشخصية
Overall compliance report=تقرير الامتثال الإجمالي
Overdue tasks=المهام المتأخرة
Awaiting review=بانتظار المراجعة
Verified compliant=متوافق (تم التحقق)
Email templates (whole portfolio)=قوالب البريد (المحفظة بالكامل)
Data exports=تصدير البيانات
Sign in=تسجيل الدخول
Signing in…=جارٍ تسجيل الدخول…
Sign in to continue=سجّل الدخول للمتابعة
Username=اسم المستخدم
Password=كلمة المرور
Demo access (read-only viewer)=دخول تجريبي (عارض للقراءة فقط)
Username:=اسم المستخدم:
Password:=كلمة المرور:
Invalid username or password=اسم المستخدم أو كلمة المرور غير صحيحة
All rights reserved.=جميع الحقوق محفوظة.
Current password=كلمة المرور الحالية
New password (min 8 characters)=كلمة المرور الجديدة (8 أحرف على الأقل)
Confirm new password=تأكيد كلمة المرور الجديدة
Update password=تحديث كلمة المرور
Set a new password to continue=عيّن كلمة مرور جديدة للمتابعة
Signed in as=تم الدخول باسم
role:=الدور:
Header reports:=تقارير الرأس:
Export domain report=تصدير تقرير المجال
Email team=إرسال بريد للفريق
Submit evidence=تقديم الأدلة
Export section report=تصدير تقرير القسم
Email section team=إرسال بريد لفريق القسم
Submit section evidence=تقديم أدلة القسم
Evidence submitted for this specification=تم تقديم الدليل لهذه المواصفة
Evidence submitted for this article=تم تقديم الدليل لهذه المادة
Mark this item as completed=تحديد هذا البند كمكتمل
Introduction=مقدمة
Regulatory documents=الوثائق التنظيمية
Domains and sections=المجالات والأقسام
reports, exports and email templates=التقارير والتصدير وقوالب البريد
Bulk update (admin only)=التحديث الجماعي (للمدير فقط)
Bulk export CSV=تصدير جماعي CSV
Bulk import CSV=استيراد جماعي CSV
Custom section=قسم مخصص
Content=المحتوى
Sub-menus=القوائم الفرعية
Edit title & content=تعديل العنوان والمحتوى
+ Add sub-menu=+ إضافة قائمة فرعية
Delete=حذف
Page not found.=الصفحة غير موجودة.
Loading…=جارٍ التحميل…
Show=عرض
Official text=النص الرسمي
Arabic official text=النص العربي الرسمي
ACTION REQUIRED=مطلوب إجراء
EVIDENCE SUBMITTED=تم تقديم الأدلة
Dear Team,=السادة الفريق المحترم،
Dear Reviewer,=السادة المراجعون المحترمون،
Please complete the compliance requirement below and send the evidence by=يرجى استكمال متطلب الامتثال أدناه وإرسال الأدلة قبل
Requirement=المتطلب
Explanation=الشرح
How to implement=كيفية التنفيذ
What needs to be completed=المطلوب استكماله
pending of=معلق من أصل
Evidence to submit=الأدلة المطلوب تقديمها
Deadline:=الموعد النهائي:
Reply with the evidence attached (PDF / screenshots / logs) and the document reference numbers.=يرجى الرد مع إرفاق الأدلة (PDF / لقطات شاشة / سجلات) وأرقام مراجع الوثائق.
Please find the evidence for=مرفق الأدلة الخاصة بـ
Summary=الملخص
Evidence logged=الأدلة المسجلة
Still outstanding=ما زال معلقًا
Attachments:=المرفقات:
evidence file(s) attached to this email.=ملف(ات) أدلة مرفقة بهذه الرسالة.
Regards,=وتفضلوا بقبول فائق التحية،
Tracker:=النظام:
Action required=مطلوب إجراء
Evidence submission=تقديم الأدلة
Acceptance criteria:=معايير القبول:
Item=البند
Reference=المرجع
No items completed yet.=لم يكتمل أي بند بعد.
Generated=تاريخ الإنشاء
by=بواسطة
Authorised signature=التوقيع المعتمد
Evidence reference / notes=مرجع الدليل / ملاحظات
Completion=نسبة الإنجاز
`
const PAIRS = RAW.split('\n').map(l => { const i = l.indexOf('='); return i > 0 ? [l.slice(0, i), l.slice(i + 1)] : null }).filter(Boolean)
const MAP = new Map(PAIRS), FRAG = PAIRS.filter(([k]) => k.length >= 5 && /[a-z]/.test(k)).sort((a, b) => b[0].length - a[0].length).map(([k, v]) => [new RegExp('(?<![A-Za-z])' + k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])', 'g'), v])
export function tr(s) {
  if (!s || !/[A-Za-z]/.test(s)) return s
  const t = s.trim(), hit = MAP.get(t); if (hit) return s.replace(t, hit)
  let o = s; for (const [re, v] of FRAG) o = o.replace(re, v); return o
}
export const trHtml = h => h.replace(/>([^<>]+)</g, (m, t) => '>' + tr(t) + '<')
export const trLines = t => t.split('\n').map(tr).join('\n')
let obs = null
const ATT = ['placeholder', 'title', 'aria-label']
const skip = n => (n.nodeType === 3 ? n.parentElement : n)?.closest?.('[data-noi18n],script,style,textarea')
function walk(n) {
  if (skip(n)) return
  if (n.nodeType === 3) { const v = n.nodeValue, t = tr(v); if (t !== v) n.nodeValue = t; return }
  if (n.nodeType !== 1) return
  for (const a of ATT) { const v = n.getAttribute?.(a); if (v) { const t = tr(v); if (t !== v) n.setAttribute(a, t) } }
  n.childNodes.forEach(walk)
}
function start() {
  if (obs) return; walk(document.body)
  obs = new MutationObserver(ms => { for (const m of ms) { if (m.type === 'childList') m.addedNodes.forEach(walk); else if (m.type === 'characterData') walk(m.target); else walk(m.target) } })
  obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATT })
}
const stop = () => { obs?.disconnect(); obs = null }
const ORIG = new Map()
export async function applyLanguage(lang) {
  if (lang === 'ar' && !LD.ar) LD.ar = (await import('../ndmoData.ar.js')).default
  if (!ORIG.size) { domains.forEach(d => ORIG.set(d, { name: d.name })); controls.forEach(c => ORIG.set(c, { name: c.name, description: c.description })); specifications.forEach(s => ORIG.set(s, { name: s.name, text: s.text })); Object.values(maturityQuestions).forEach(q => Object.values(q.levels).forEach(l => ORIG.set(l, { name: l.name }))) }
  const A = lang === 'ar' ? LD.ar : null
  domains.forEach(d => { d.name = A?.domains[d.id] || ORIG.get(d).name })
  controls.forEach(c => { const a = A?.controls[c.id]; c.name = a?.name || ORIG.get(c).name; c.description = a?.desc || ORIG.get(c).description })
  specifications.forEach(s => { const a = A?.specs[s.id]; s.name = a?.name || ORIG.get(s).name; s.text = a?.text || ORIG.get(s).text })
  Object.values(maturityQuestions).forEach(q => Object.entries(q.levels).forEach(([k, l]) => { l.name = A?.levels[k] || ORIG.get(l).name }))
  resetUniverse(); CUR = lang
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  lang === 'ar' ? start() : stop()
}
