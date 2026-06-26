"use client";

import { useState, useCallback } from "react";
import { galleryApi, ApiError, GalleryItemAdmin, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import type { GalleryFormData, FormLang } from "../types";

export function useGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItemAdmin[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryFormLang, setGalleryFormLang] = useState<FormLang>("fa");
  const [galleryFormData, setGalleryFormData] = useState<GalleryFormData>({
    title_fa: "", subtitle_fa: "", title_en: "", subtitle_en: "", title_ar: "", subtitle_ar: "", before_image: "", after_image: "", sort_order: 0, is_active: true,
  });
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  /* ---- Fetch gallery items ---- */
  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const result = await galleryApi.listAdmin();
      setGalleryItems(result.items);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری گالری";
      toast.error(message);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  /* ---- Gallery upload helper ---- */
  const handleImageUpload = async (file: File, field: "before_image" | "after_image") => {
    if (field === "before_image") setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");

      // Attach auth token — upload uses raw fetch (not api.request) because FormData
      // must not have Content-Type set manually (browser sets multipart boundary)
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", { method: "POST", body: formData, headers });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "خطا در آپلود تصویر");
        return;
      }

      setGalleryFormData((prev) => ({ ...prev, [field]: data.url }));
      toast.success("تصویر با موفقیت آپلود شد");
    } catch {
      toast.error("خطا در آپلود تصویر");
    } finally {
      if (field === "before_image") setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  /* ---- Gallery actions ---- */
  const handleSaveGallery = async () => {
    if (!galleryFormData.title_fa || !galleryFormData.before_image || !galleryFormData.after_image) {
      toast.error("عنوان فارسی و مسیر تصاویر الزامی است");
      return;
    }
    try {
      if (editingGalleryId) {
        await galleryApi.update(editingGalleryId, {
          titleFa: galleryFormData.title_fa, subtitleFa: galleryFormData.subtitle_fa,
          titleEn: galleryFormData.title_en, subtitleEn: galleryFormData.subtitle_en,
          titleAr: galleryFormData.title_ar, subtitleAr: galleryFormData.subtitle_ar,
          beforeImage: galleryFormData.before_image, afterImage: galleryFormData.after_image,
          sortOrder: galleryFormData.sort_order, isActive: galleryFormData.is_active,
        });
        toast.success("آیتم گالری با موفقیت بروزرسانی شد");
      } else {
        await galleryApi.create({
          titleFa: galleryFormData.title_fa, subtitleFa: galleryFormData.subtitle_fa,
          titleEn: galleryFormData.title_en, subtitleEn: galleryFormData.subtitle_en,
          titleAr: galleryFormData.title_ar, subtitleAr: galleryFormData.subtitle_ar,
          beforeImage: galleryFormData.before_image, afterImage: galleryFormData.after_image,
          sortOrder: galleryFormData.sort_order, isActive: galleryFormData.is_active,
        });
        toast.success("آیتم گالری با موفقیت ایجاد شد");
      }
      setShowGalleryForm(false);
      setEditingGalleryId(null);
      setGalleryFormData({ title_fa: "", subtitle_fa: "", title_en: "", subtitle_en: "", title_ar: "", subtitle_ar: "", before_image: "", after_image: "", sort_order: 0, is_active: true });
      await fetchGallery();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره آیتم گالری";
      toast.error(message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("آیا از حذف این آیتم گالری اطمینان دارید؟")) return;
    try {
      await galleryApi.delete(id);
      toast.success("آیتم گالری حذف شد");
      await fetchGallery();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در حذف آیتم گالری";
      toast.error(message);
    }
  };

  const handleToggleGalleryActive = async (item: GalleryItemAdmin) => {
    try {
      await galleryApi.update(item.id, { isActive: !item.is_active });
      toast.success(item.is_active ? "آیتم غیرفعال شد" : "آیتم فعال شد");
      await fetchGallery();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در تغییر وضعیت";
      toast.error(message);
    }
  };

  const handleEditGallery = (item: GalleryItemAdmin) => {
    setEditingGalleryId(item.id);
    setGalleryFormData({
      title_fa: item.title_fa, subtitle_fa: item.subtitle_fa,
      title_en: item.title_en, subtitle_en: item.subtitle_en,
      title_ar: item.title_ar, subtitle_ar: item.subtitle_ar,
      before_image: item.before_image, after_image: item.after_image,
      sort_order: item.sort_order, is_active: item.is_active,
    });
    setGalleryFormLang("fa");
    setShowGalleryForm(true);
  };

  return {
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
    fetchGallery,
    handleImageUpload,
    handleSaveGallery,
    handleDeleteGallery,
    handleToggleGalleryActive,
    handleEditGallery,
  };
}

export type UseGalleryReturn = ReturnType<typeof useGallery>;
