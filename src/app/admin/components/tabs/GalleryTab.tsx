"use client";

import {
  Image as ImageIcon,
  Plus,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  Globe,
  X,
  Upload,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../../utils";
import type { UseGalleryReturn } from "../../hooks/useGallery";

interface GalleryTabProps {
  gallery: UseGalleryReturn;
}

export function GalleryTab({ gallery }: GalleryTabProps) {
  const { t } = useI18n();
  const {
    galleryItems,
    galleryLoading,
    showGalleryForm,
    editingGalleryId,
    galleryFormLang,
    galleryFormData,
    uploadingBefore,
    uploadingAfter,
    setShowGalleryForm,
    setEditingGalleryId,
    setGalleryFormLang,
    setGalleryFormData,
    handleImageUpload,
    handleSaveGallery,
    handleDeleteGallery,
    handleToggleGalleryActive,
    handleEditGallery,
  } = gallery;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          مدیریت گالری
        </h3>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditingGalleryId(null);
            setGalleryFormData({ title_fa: "", subtitle_fa: "", title_en: "", subtitle_en: "", title_ar: "", subtitle_ar: "", before_image: "", after_image: "", sort_order: galleryItems.length, is_active: true });
            setGalleryFormLang("fa");
            setShowGalleryForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />آیتم جدید
        </button>
      </div>

      {/* Loading */}
      {galleryLoading && galleryItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* Gallery grid */}
      {!galleryLoading && galleryItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هنوز آیتم گالری ثبت نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                {item.after_image ? (
                  <img src={item.after_image} alt={item.title_fa} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-200" />
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
                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.title_fa}</h4>
                <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.subtitle_fa}</p>
                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleToggleGalleryActive(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all" title={item.is_active ? "غیرفعال کردن" : "فعال کردن"}>
                    {item.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEditGallery(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-all" title="ویرایش">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteGallery(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Form Modal */}
      {showGalleryForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{editingGalleryId ? "ویرایش آیتم گالری" : "آیتم گالری جدید"}</h3>
              <button onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Language tabs */}
            <div className="flex gap-2 mb-4">
              {(["fa", "en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setGalleryFormLang(lang)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${galleryFormLang === lang ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "fa" ? "فارسی" : lang === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Persian fields */}
              {galleryFormLang === "fa" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>عنوان (فارسی) *</label>
                    <input value={galleryFormData.title_fa} onChange={(e) => setGalleryFormData({ ...galleryFormData, title_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>زیرعنوان (فارسی)</label>
                    <input value={galleryFormData.subtitle_fa} onChange={(e) => setGalleryFormData({ ...galleryFormData, subtitle_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                </>
              )}
              {/* English fields */}
              {galleryFormLang === "en" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Title (English)</label>
                    <input value={galleryFormData.title_en} onChange={(e) => setGalleryFormData({ ...galleryFormData, title_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle (English)</label>
                    <input value={galleryFormData.subtitle_en} onChange={(e) => setGalleryFormData({ ...galleryFormData, subtitle_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                  </div>
                </>
              )}
              {/* Arabic fields */}
              {galleryFormLang === "ar" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>العنوان (العربية)</label>
                    <input value={galleryFormData.title_ar} onChange={(e) => setGalleryFormData({ ...galleryFormData, title_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>العنوان الفرعي (العربية)</label>
                    <input value={galleryFormData.subtitle_ar} onChange={(e) => setGalleryFormData({ ...galleryFormData, subtitle_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
                  </div>
                </>
              )}
              {/* Image upload - always visible */}
              <div className="pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>تصویر قبل *</label>
                  <div className="flex items-center gap-2">
                    <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploadingBefore ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`} style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingBefore ? "در حال آپلود..." : "انتخاب فایل"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        disabled={uploadingBefore}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "before_image");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {galleryFormData.before_image && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={galleryFormData.before_image} alt="قبل" className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400 truncate" dir="ltr">{galleryFormData.before_image}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>تصویر بعد *</label>
                  <div className="flex items-center gap-2">
                    <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploadingAfter ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`} style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingAfter ? "در حال آپلود..." : "انتخاب فایل"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        disabled={uploadingAfter}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "after_image");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {galleryFormData.after_image && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={galleryFormData.after_image} alt="بعد" className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400 truncate" dir="ltr">{galleryFormData.after_image}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>ترتیب نمایش</label>
                  <input type="number" value={galleryFormData.sort_order} onChange={(e) => setGalleryFormData({ ...galleryFormData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={galleryFormData.is_active} onChange={(e) => setGalleryFormData({ ...galleryFormData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>فعال</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveGallery} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_save")}</button>
              <button onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
