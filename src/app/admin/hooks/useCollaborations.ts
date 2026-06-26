"use client";

import { useState, useCallback } from "react";
import { collaborationApi, ApiError, CollaborationItem, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import type { CollabFormData } from "../types";

export function useCollaborations() {
  const [collabs, setCollabs] = useState<CollaborationItem[]>([]);
  const [collabsLoading, setCollabsLoading] = useState(false);
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);
  const [collabFormData, setCollabFormData] = useState<CollabFormData>({
    name_fa: "", name_en: "", name_ar: "", image: "", sort_order: 0, is_active: true,
  });
  const [uploadingCollabImage, setUploadingCollabImage] = useState(false);

  /* ---- Fetch collaborations ---- */
  const fetchCollabs = useCallback(async () => {
    setCollabsLoading(true);
    try {
      const result = await collaborationApi.listAdmin();
      setCollabs(result.items);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری دندانپزشکان";
      toast.error(message);
    } finally {
      setCollabsLoading(false);
    }
  }, []);

  /* ---- Collaboration image upload helper ---- */
  const handleCollabImageUpload = async (file: File) => {
    setUploadingCollabImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "collaborations");

      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", { method: "POST", body: formData, headers });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "خطا در آپلود تصویر");
        return;
      }

      setCollabFormData((prev) => ({ ...prev, image: data.url }));
      toast.success("تصویر با موفقیت آپلود شد");
    } catch {
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploadingCollabImage(false);
    }
  };

  /* ---- Collaboration actions ---- */
  const handleSaveCollab = async () => {
    if (!collabFormData.name_fa || !collabFormData.name_en || !collabFormData.name_ar) {
      toast.error("نام سازمان به سه زبان الزامی است");
      return;
    }
    try {
      if (editingCollabId) {
        await collaborationApi.update(editingCollabId, {
          nameFa: collabFormData.name_fa, nameEn: collabFormData.name_en, nameAr: collabFormData.name_ar,
          image: collabFormData.image, sortOrder: collabFormData.sort_order, isActive: collabFormData.is_active,
        });
        toast.success("دندانپزشک با موفقیت بروزرسانی شد");
      } else {
        await collaborationApi.create({
          nameFa: collabFormData.name_fa, nameEn: collabFormData.name_en, nameAr: collabFormData.name_ar,
          image: collabFormData.image, sortOrder: collabFormData.sort_order, isActive: collabFormData.is_active,
        });
        toast.success("دندانپزشک با موفقیت ایجاد شد");
      }
      setShowCollabForm(false);
      setEditingCollabId(null);
      setCollabFormData({ name_fa: "", name_en: "", name_ar: "", image: "", sort_order: 0, is_active: true });
      await fetchCollabs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره دندانپزشک";
      toast.error(message);
    }
  };

  const handleDeleteCollab = async (id: string) => {
    if (!window.confirm("آیا از حذف این دندانپزشک اطمینان دارید؟")) return;
    try {
      await collaborationApi.delete(id);
      toast.success("دندانپزشک حذف شد");
      await fetchCollabs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در حذف دندانپزشک";
      toast.error(message);
    }
  };

  const handleToggleCollabActive = async (item: CollaborationItem) => {
    try {
      await collaborationApi.update(item.id, { isActive: !item.is_active });
      toast.success(item.is_active ? "دندانپزشک غیرفعال شد" : "دندانپزشک فعال شد");
      await fetchCollabs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در تغییر وضعیت";
      toast.error(message);
    }
  };

  const handleEditCollab = (item: CollaborationItem) => {
    setEditingCollabId(item.id);
    setCollabFormData({
      name_fa: item.name_fa, name_en: item.name_en, name_ar: item.name_ar,
      image: item.image, sort_order: item.sort_order, is_active: item.is_active,
    });
    setShowCollabForm(true);
  };

  return {
    collabs,
    collabsLoading,
    showCollabForm,
    editingCollabId,
    collabFormData,
    uploadingCollabImage,
    setShowCollabForm,
    setEditingCollabId,
    setCollabFormData,
    fetchCollabs,
    handleCollabImageUpload,
    handleSaveCollab,
    handleDeleteCollab,
    handleToggleCollabActive,
    handleEditCollab,
  };
}

export type UseCollaborationsReturn = ReturnType<typeof useCollaborations>;
