"use client";

import { useState, useMemo, useCallback } from "react";
import { siteTextApi, ApiError, SiteTextItem } from "@/lib/api";
import { toast } from "sonner";
import { GROUP_LABELS_FA, KEY_LABELS_FA } from "../constants";
import type { EditingTextData } from "../types";

export function useSiteTexts() {
  const [siteTexts, setSiteTexts] = useState<SiteTextItem[]>([]);
  const [siteTextsLoading, setSiteTextsLoading] = useState(false);
  const [siteTextGroup, setSiteTextGroup] = useState("all");
  const [siteTextSearch, setSiteTextSearch] = useState("");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextData, setEditingTextData] = useState<EditingTextData>({ value_fa: "", value_en: "", value_ar: "" });

  /* ---- Fetch site texts ---- */
  const fetchSiteTexts = useCallback(async () => {
    setSiteTextsLoading(true);
    try {
      // Always fetch ALL site texts — filter on client side
      const result = await siteTextApi.list();
      setSiteTexts(result.texts || []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری متن‌ها";
      toast.error(message);
    } finally {
      setSiteTextsLoading(false);
    }
  }, []);

  /* ---- Filtered site texts ---- */
  const filteredSiteTexts = useMemo(() => {
    let texts = siteTexts || [];
    // Filter by group
    if (siteTextGroup !== "all") {
      texts = texts.filter((st) => st.group === siteTextGroup);
    }
    // Filter by search
    if (siteTextSearch) {
      const q = siteTextSearch.toLowerCase();
      texts = texts.filter((st) =>
        st.key.toLowerCase().includes(q) ||
        st.value_fa.toLowerCase().includes(q) ||
        st.value_en.toLowerCase().includes(q) ||
        st.group.toLowerCase().includes(q)
      );
    }
    return texts;
  }, [siteTexts, siteTextGroup, siteTextSearch]);

  /* ---- Site text groups ---- */
  const siteTextGroups = useMemo(() => {
    const groups = new Set((siteTexts || []).map((st) => st.group));
    return Array.from(groups).sort();
  }, [siteTexts]);

  /* ---- Site Text actions ---- */
  const handleSaveSiteText = async (id: string) => {
    try {
      await siteTextApi.update(id, {
        valueFa: editingTextData.value_fa,
        valueEn: editingTextData.value_en,
        valueAr: editingTextData.value_ar,
      });
      toast.success("متن با موفقیت ذخیره شد");
      setEditingTextId(null);
      await fetchSiteTexts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره متن";
      toast.error(message);
    }
  };

  const handleBulkSaveSiteTexts = async () => {
    try {
      const items = filteredSiteTexts.map((st) => ({
        id: st.id,
        valueFa: st.value_fa,
        valueEn: st.value_en,
        valueAr: st.value_ar,
      }));
      await siteTextApi.bulkUpdate(items);
      toast.success("تمام متن‌ها با موفقیت ذخیره شد");
      await fetchSiteTexts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره متن‌ها";
      toast.error(message);
    }
  };

  return {
    siteTexts,
    siteTextsLoading,
    siteTextGroup,
    siteTextSearch,
    editingTextId,
    editingTextData,
    setSiteTextGroup,
    setSiteTextSearch,
    setEditingTextId,
    setEditingTextData,
    fetchSiteTexts,
    handleSaveSiteText,
    handleBulkSaveSiteTexts,
    filteredSiteTexts,
    siteTextGroups,
    // re-export labels for tab convenience
    GROUP_LABELS_FA,
    KEY_LABELS_FA,
  };
}

export type UseSiteTextsReturn = ReturnType<typeof useSiteTexts>;
