// Utility functions for common grid value formatters

export function normalizeArabicIndicDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06F0));
}

export function parseFlexibleNumber(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') return isNaN(raw) ? null : raw;
  if (typeof raw !== 'string') return null;

  const normalized = normalizeArabicIndicDigits(raw)
    .replace(/\s/g, '')
    .replace(/٬/g, '')
    .replace(/,/g, '')
    .replace(/٫/g, '.')
    .trim();

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

export function formatNumericCell(
  value: unknown,
  fractionDigits: number = 2,
  locale: string = 'en-US'
): string {
  const num = parseFlexibleNumber(value);
  if (num == null) return value == null ? '' : String(value);

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(num);
}


