"use client";

import { useState, useCallback } from "react";
import { analyticsApi, ApiError, AnalyticsData } from "@/lib/api";
import { useI18n } from "@/i18n/context";
import { toast } from "sonner";

export function useAnalytics() {
  const { t } = useI18n();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /* ---- Fetch analytics ---- */
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const result = await analyticsApi.get();
      setAnalytics(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.load_error");
      toast.error(message);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [t]);

  const reset = () => setAnalytics(null);

  return {
    analytics,
    analyticsLoading,
    fetchAnalytics,
    reset,
  };
}

export type UseAnalyticsReturn = ReturnType<typeof useAnalytics>;
