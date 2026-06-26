"use client";

import { useState, useCallback } from "react";
import { faqApi, ApiError, FaqItem } from "@/lib/api";
import { toast } from "sonner";
import type { FaqFormData, FormLang } from "../types";

export function useFaqs() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqFormLang, setFaqFormLang] = useState<FormLang>("fa");
  const [faqFormData, setFaqFormData] = useState<FaqFormData>({
    question_fa: "", answer_fa: "", question_en: "", answer_en: "", question_ar: "", answer_ar: "", sort_order: 0, is_active: true,
  });

  /* ---- Fetch FAQs ---- */
  const fetchFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const result = await faqApi.listAdmin();
      setFaqs(result.faqs);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری سوالات متداول";
      toast.error(message);
    } finally {
      setFaqsLoading(false);
    }
  }, []);

  /* ---- FAQ actions ---- */
  const handleSaveFaq = async () => {
    if (!faqFormData.question_fa || !faqFormData.answer_fa) {
      toast.error("سوال و پاسخ فارسی الزامی است");
      return;
    }
    try {
      if (editingFaqId) {
        await faqApi.update(editingFaqId, {
          questionFa: faqFormData.question_fa, answerFa: faqFormData.answer_fa,
          questionEn: faqFormData.question_en, answerEn: faqFormData.answer_en,
          questionAr: faqFormData.question_ar, answerAr: faqFormData.answer_ar,
          sortOrder: faqFormData.sort_order, isActive: faqFormData.is_active,
        });
        toast.success("سوال متداول با موفقیت بروزرسانی شد");
      } else {
        await faqApi.create({
          questionFa: faqFormData.question_fa, answerFa: faqFormData.answer_fa,
          questionEn: faqFormData.question_en, answerEn: faqFormData.answer_en,
          questionAr: faqFormData.question_ar, answerAr: faqFormData.answer_ar,
          sortOrder: faqFormData.sort_order, isActive: faqFormData.is_active,
        });
        toast.success("سوال متداول با موفقیت ایجاد شد");
      }
      setShowFaqForm(false);
      setEditingFaqId(null);
      setFaqFormData({ question_fa: "", answer_fa: "", question_en: "", answer_en: "", question_ar: "", answer_ar: "", sort_order: 0, is_active: true });
      await fetchFaqs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره سوال متداول";
      toast.error(message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("آیا از حذف این سوال متداول اطمینان دارید؟")) return;
    try {
      await faqApi.delete(id);
      toast.success("سوال متداول حذف شد");
      await fetchFaqs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در حذف سوال متداول";
      toast.error(message);
    }
  };

  const handleToggleFaqActive = async (faq: FaqItem) => {
    try {
      await faqApi.update(faq.id, { isActive: !faq.is_active });
      toast.success(faq.is_active ? "سوال غیرفعال شد" : "سوال فعال شد");
      await fetchFaqs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در تغییر وضعیت";
      toast.error(message);
    }
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setFaqFormData({
      question_fa: faq.question_fa, answer_fa: faq.answer_fa,
      question_en: faq.question_en, answer_en: faq.answer_en,
      question_ar: faq.question_ar, answer_ar: faq.answer_ar,
      sort_order: faq.sort_order, is_active: faq.is_active,
    });
    setFaqFormLang("fa");
    setShowFaqForm(true);
  };

  return {
    faqs,
    faqsLoading,
    showFaqForm,
    editingFaqId,
    faqFormLang,
    faqFormData,
    setShowFaqForm,
    setEditingFaqId,
    setFaqFormLang,
    setFaqFormData,
    fetchFaqs,
    handleSaveFaq,
    handleDeleteFaq,
    handleToggleFaqActive,
    handleEditFaq,
  };
}

export type UseFaqsReturn = ReturnType<typeof useFaqs>;
