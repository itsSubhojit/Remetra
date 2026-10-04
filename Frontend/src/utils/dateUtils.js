/**
 * Normalizes varied document date strings (DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, textual dates)
 * into strict HTML input[type="date"] format (YYYY-MM-DD) preserving the calendar date
 * without UTC timezone shifting.
 *
 * @param {string|null|undefined} dateStr
 * @returns {string} Normalized date in YYYY-MM-DD or empty string if unparseable
 */
export const normalizeDateToISO = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();

  // 1. Direct match for YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return trimmed;
  }

  // 2. Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    const candidate = `${year}-${month}-${day}`;
    const d = new Date(candidate);
    if (!isNaN(d.getTime())) return candidate;
  }

  // 3. Format YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    const candidate = `${year}-${month}-${day}`;
    const d = new Date(candidate);
    if (!isNaN(d.getTime())) return candidate;
  }

  // 4. Fallback standard Date parsing (e.g. "15 Oct 2026")
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    try {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }

  return "";
};
