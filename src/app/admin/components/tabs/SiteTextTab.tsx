"use client";

import { Search, Save, Loader2, Type, Edit3 } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { GROUP_LABELS_FA, KEY_LABELS_FA } from "../../constants";
import type { UseSiteTextsReturn } from "../../hooks/useSiteTexts";

interface SiteTextTabProps {
  siteTexts: UseSiteTextsReturn;
}

export function SiteTextTab({ siteTexts: st }: SiteTextTabProps) {
  const { t } = useI18n();
  void t; // (kept for parity; this tab doesn't currently use t directly)
  const {
    siteTexts: items,
    siteTextsLoading,
    siteTextGroup,
    siteTextSearch,
    editingTextId,
    editingTextData,
    setSiteTextGroup,
    setSiteTextSearch,
    setEditingTextId,
    setEditingTextData,
    handleSaveSiteText,
    handleBulkSaveSiteTexts,
    filteredSiteTexts,
    siteTextGroups,
  } = st;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          ویرایش متن سایت
        </h3>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={siteTextSearch}
            onChange={(e) => setSiteTextSearch(e.target.value)}
            placeholder="جستجو در متن‌ها..."
            className="w-56 ps-10 pe-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          />
        </div>
        <button
          onClick={handleBulkSaveSiteTexts}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Save className="w-4 h-4" />ذخیره همه
        </button>
      </div>

      {/* Group selector — sticky so it never disappears when scrolling */}
      <div className="sticky top-0 z-10 -mx-5 px-5 pb-3 pt-1 bg-[#F7F9FB] border-b border-gray-100/60 mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSiteTextGroup("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${siteTextGroup === "all" ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            همه
          </button>
          {siteTextGroups.map((g) => (
            <button
              key={g}
              onClick={() => setSiteTextGroup(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${siteTextGroup === g ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {GROUP_LABELS_FA[g] || g}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {siteTextsLoading && (items || []).length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* Site text list */}
      {!siteTextsLoading && (filteredSiteTexts || []).length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Type className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>متنی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSiteTexts.map((stItem) => (
            <div key={stItem.id} className="bg-white rounded-2xl border border-gray-100/80 p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">{GROUP_LABELS_FA[stItem.group] || stItem.group}</span>
                <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "var(--font-vazirmatn)" }}>{KEY_LABELS_FA[stItem.key] || stItem.key}</span>
                <code className="text-[10px] font-mono text-gray-400 hidden sm:inline">({stItem.key})</code>
              </div>
              {editingTextId === stItem.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">فارسی</label>
                    <textarea value={editingTextData.value_fa} onChange={(e) => setEditingTextData({ ...editingTextData, value_fa: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">English</label>
                    <textarea value={editingTextData.value_en} onChange={(e) => setEditingTextData({ ...editingTextData, value_en: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">العربية</label>
                    <textarea value={editingTextData.value_ar} onChange={(e) => setEditingTextData({ ...editingTextData, value_ar: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="rtl" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveSiteText(stItem.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
                      <Save className="w-3.5 h-3.5" />ذخیره
                    </button>
                    <button onClick={() => setEditingTextId(null)} className="px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold hover:bg-gray-100" style={{ fontFamily: "var(--font-vazirmatn)" }}>انصراف</button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer group"
                  onClick={() => { setEditingTextId(stItem.id); setEditingTextData({ value_fa: stItem.value_fa, value_en: stItem.value_en, value_ar: stItem.value_ar }); }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">فارسی</p>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-teal-700 transition-colors" style={{ fontFamily: "var(--font-vazirmatn)" }}>{stItem.value_fa || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">English</p>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-teal-700 transition-colors" dir="ltr">{stItem.value_en || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">العربية</p>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-teal-700 transition-colors" dir="rtl">{stItem.value_ar || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-3 h-3" />
                    <span style={{ fontFamily: "var(--font-vazirmatn)" }}>برای ویرایش کلیک کنید</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
