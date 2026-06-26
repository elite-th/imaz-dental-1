/* ══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ══════════════════════════════════════════════════════════════════════════ */
export function toPersianNum(n: number | string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(n).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/* Shared brand gradient (appears ~20 times across tabs) */
export const adminBrandGradient = "linear-gradient(135deg, #1B7A6E, #2DA89E)";
