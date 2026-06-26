"use client";

import {
  Stethoscope,
  Plus,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../../utils";
import type { UseCollaborationsReturn } from "../../hooks/useCollaborations";

interface CollaborationsTabProps {
  collabs: UseCollaborationsReturn;
}

export function CollaborationsTab({ collabs }: CollaborationsTabProps) {
  const { t } = useI18n();
  const {
    collabs: items,
    collabsLoading,
    showCollabForm,
    editingCollabId,
    collabFormData,
    uploadingCollabImage,
    setShowCollabForm,
    setEditingCollabId,
    setCollabFormData,
    handleCollabImageUpload,
    handleSaveCollab,
    handleDeleteCollab,
    handleToggleCollabActive,
    handleEditCollab,
  } = collabs;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          مدیریت دندانپزشکان
        </h3>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditingCollabId(null);
            setCollabFormData({ name_fa: "", name_en: "", name_ar: "", image: "", sort_order: items.length, is_active: true });
            setShowCollabForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />دندانپزشک جدید
        </button>
      </div>

      {/* Loading */}
      {collabsLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* Collaborations grid */}
      {!collabsLoading && items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هنوز دندانپزشکی ثبت نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                {item.image && item.image.trim() !== "" ? (
                  <img
                    src={item.image}
                    alt={item.name_fa}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className = "flex items-center justify-center w-full h-full";
                        fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v-2a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <Stethoscope className="w-10 h-10 text-gray-200" />
                )}
                <span className={`absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${item.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {item.is_active ? "فعال" : "غیرفعال"}
                </span>
                <span className="absolute top-3 end-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/80 text-gray-600 border border-gray-100">
                  ترتیب: {toPersianNum(item.sort_order)}
                </span>
              </div>
              {/* Content */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 text-sm mb-0.5 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.name_fa}</h4>
                <p className="text-[11px] text-gray-400 truncate" dir="ltr">{item.name_en}</p>
                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleToggleCollabActive(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all" title={item.is_active ? "غیرفعال کردن" : "فعال کردن"}>
                    {item.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEditCollab(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-all" title="ویرایش">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteCollab(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collaboration Form Modal */}
      {showCollabForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowCollabForm(false); setEditingCollabId(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{editingCollabId ? "ویرایش دندانپزشک" : "دندانپزشک جدید"}</h3>
              <button onClick={() => { setShowCollabForm(false); setEditingCollabId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="space-y-3">
              {/* Persian name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>نام سازمان (فارسی) *</label>
                <input value={collabFormData.name_fa} onChange={(e) => setCollabFormData({ ...collabFormData, name_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
              </div>
              {/* English name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Organization Name (English) *</label>
                <input value={collabFormData.name_en} onChange={(e) => setCollabFormData({ ...collabFormData, name_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
              </div>
              {/* Arabic name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>اسم المنظمة (العربية) *</label>
                <input value={collabFormData.name_ar} onChange={(e) => setCollabFormData({ ...collabFormData, name_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
              </div>
              {/* Image upload */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>لوگو سازمان</label>
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploadingCollabImage ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`} style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingCollabImage ? "در حال آپلود..." : "انتخاب فایل"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      disabled={uploadingCollabImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCollabImageUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {collabFormData.image && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={collabFormData.image} alt="لوگو" className="w-10 h-10 rounded-lg object-contain border border-gray-100 flex-shrink-0 bg-gray-50 p-1" />
                      <span className="text-[11px] text-gray-400 truncate" dir="ltr">{collabFormData.image}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>ترتیب نمایش</label>
                  <input type="number" value={collabFormData.sort_order} onChange={(e) => setCollabFormData({ ...collabFormData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={collabFormData.is_active} onChange={(e) => setCollabFormData({ ...collabFormData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>فعال</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveCollab} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_save")}</button>
              <button onClick={() => { setShowCollabForm(false); setEditingCollabId(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
