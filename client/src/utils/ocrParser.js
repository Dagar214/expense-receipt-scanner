// Heuristic parser that turns raw OCR text (from Tesseract.js) into
// structured receipt fields: store name, date, amount, tax.
import { guessCategory } from "./categories";

const DATE_PATTERNS = [
  // 12/07/2026, 12-07-2026, 2026/07/12
  /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/,
  // 12 Jul 2026, Jul 12 2026, July 12, 2026
  /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i,
  /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})\b/i,
];

const AMOUNT_KEYWORDS = [
  "grand total",
  "total amount",
  "net amount",
  "amount due",
  "balance due",
  "total",
  "amount payable",
];

const TAX_KEYWORDS = ["gst", "vat", "tax", "cgst", "sgst", "service tax"];

const cleanNumber = (str) => {
  if (!str) return null;
  const cleaned = str.replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
};

const findAmountNearKeyword = (lines, keywords) => {
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) {
      const match = line.match(/(\d{1,3}(?:[,.\s]\d{3})*(?:\.\d{1,2})?)/g);
      if (match && match.length) {
        // pick the last number on the line (usually the value, after the label)
        const value = cleanNumber(match[match.length - 1]);
        if (value !== null) return value;
      }
    }
  }
  return null;
};

const findAllNumbers = (text) => {
  const matches = text.match(/\d{1,3}(?:[,.\s]\d{3})*(?:\.\d{1,2})?/g) || [];
  return matches
    .map(cleanNumber)
    .filter((n) => n !== null && n > 0 && n < 10000000);
};

export const parseReceiptText = (rawText) => {
  const text = rawText || "";
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // --- Store name: heuristically the first substantial line, skipping generic words ---
  let storeName = "Unknown Store";
  const skipWords = ["receipt", "invoice", "bill", "tax invoice", "cash memo"];
  for (const line of lines) {
    const lower = line.toLowerCase();
    const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount >= 3 && !skipWords.some((w) => lower === w)) {
      storeName = line.replace(/[^a-zA-Z0-9&.,'’\- ]/g, "").trim() || storeName;
      break;
    }
  }

  // --- Date ---
  let date = null;
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!Number.isNaN(parsed.getTime())) {
        date = parsed.toISOString().slice(0, 10);
        break;
      }
    }
  }
  if (!date) date = new Date().toISOString().slice(0, 10);

  // --- Amount (total) ---
  let amount = findAmountNearKeyword(lines, AMOUNT_KEYWORDS);
  if (amount === null) {
    const numbers = findAllNumbers(text);
    amount = numbers.length ? Math.max(...numbers) : 0;
  }

  // --- Tax ---
  let tax = findAmountNearKeyword(lines, TAX_KEYWORDS);
  if (tax === null) tax = 0;

  const category = guessCategory(`${storeName} ${text}`);

  return {
    storeName,
    date,
    amount: amount || 0,
    tax: tax || 0,
    category,
    rawText: text,
  };
};
