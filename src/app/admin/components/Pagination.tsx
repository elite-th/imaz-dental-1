"use client";

import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../utils";
import { ITEMS_PER_PAGE } from "../constants";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (p: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = ITEMS_PER_PAGE,
  onPageChange,
}: PaginationProps) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-vazirmatn)" }}>
        {t("admin.pagination_showing")} {toPersianNum((currentPage - 1) * itemsPerPage + 1)}–{toPersianNum(Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage > totalItems ? totalItems : currentPage * itemsPerPage))} {t("admin.pagination_of")} {toPersianNum(totalPages * itemsPerPage > 100 ? totalItems : totalPages * itemsPerPage)} {t("admin.pagination_results")}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-100 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-vazirmatn)" }}
        >
          {t("admin.pagination_prev")}
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"
              }`}
            >
              {toPersianNum(pageNum)}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-100 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-vazirmatn)" }}
        >
          {t("admin.pagination_next")}
        </button>
      </div>
    </div>
  );
}
