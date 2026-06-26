"use client";

import {
  HelpCircle,
  Plus,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  Globe,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../../utils";
import type { UseFaqsReturn } from "../../hooks/useFaqs";

interface FaqTabProps {
  faqs: UseFaqsReturn;
}

export function FaqTab({ faqs }: FaqTabProps) {
  const { t } = useI18n();
  const {
    faqs: items,
    faqsLoading,
    showFaqForm,
    editingFaqId,
    faqFormLang,
    faqFormData,
    setShowFaqForm,
    setEditingFaqId,
    setFaqFormLang,
    setFaqFormData,
    handleSaveFaq,
    handleDeleteFaq,
    handleToggleFaqActive,
    handleEditFaq,
  } = faqs;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          مدیریت سوالات متداول
        </h3>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditingFaqId(null);
            setFaqFormData({ question_fa: "", answer_fa: "", question_en: "", answer_en: "", question_ar: "", answer_ar: "", sort_order: items.length, is_active: true });
            setFaqFormLang("fa");
            setShowFaqForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />سوال جدید
        </button>
      </div>

      {/* Loading */}
      {faqsLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* FAQ list */}
      {!faqsLoading && items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هنوز سوال متداولی ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl border border-gray-100/80 p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {toPersianNum(faq.sort_order + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{faq.question_fa}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${faq.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${faq.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                      {faq.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{faq.answer_fa.substring(0, 100)}{faq.answer_fa.length > 100 ? "..." : ""}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggleFaqActive(faq)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all" title={faq.is_active ? "غیرفعال کردن" : "فعال کردن"}>
                    {faq.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEditFaq(faq)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-all" title="ویرایش">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteFaq(faq.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Form Modal */}
      {showFaqForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowFaqForm(false); setEditingFaqId(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{editingFaqId ? "ویرایش سوال متداول" : "سوال متداول جدید"}</h3>
              <button onClick={() => { setShowFaqForm(false); setEditingFaqId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Language tabs */}
            <div className="flex gap-2 mb-4">
              {(["fa", "en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setFaqFormLang(lang)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqFormLang === lang ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "fa" ? "فارسی" : lang === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Persian fields */}
              {faqFormLang === "fa" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>سوال (فارسی) *</label>
                    <input value={faqFormData.question_fa} onChange={(e) => setFaqFormData({ ...faqFormData, question_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>پاسخ (فارسی) *</label>
                    <textarea value={faqFormData.answer_fa} onChange={(e) => setFaqFormData({ ...faqFormData, answer_fa: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                </>
              )}
              {/* English fields */}
              {faqFormLang === "en" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Question (English)</label>
                    <input value={faqFormData.question_en} onChange={(e) => setFaqFormData({ ...faqFormData, question_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Answer (English)</label>
                    <textarea value={faqFormData.answer_en} onChange={(e) => setFaqFormData({ ...faqFormData, answer_en: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="ltr" />
                  </div>
                </>
              )}
              {/* Arabic fields */}
              {faqFormLang === "ar" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>السؤال (العربية)</label>
                    <input value={faqFormData.question_ar} onChange={(e) => setFaqFormData({ ...faqFormData, question_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>الجواب (العربية)</label>
                    <textarea value={faqFormData.answer_ar} onChange={(e) => setFaqFormData({ ...faqFormData, answer_ar: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="rtl" />
                  </div>
                </>
              )}
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>ترتیب نمایش</label>
                  <input type="number" value={faqFormData.sort_order} onChange={(e) => setFaqFormData({ ...faqFormData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={faqFormData.is_active} onChange={(e) => setFaqFormData({ ...faqFormData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>فعال</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveFaq} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_save")}</button>
              <button onClick={() => { setShowFaqForm(false); setEditingFaqId(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
