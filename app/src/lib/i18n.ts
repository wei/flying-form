import type { Lang } from "./types";

// UI chrome strings for the fill flow (dashboard stays EN per PRD).
const STRINGS = {
  back: { en: "Back", ja: "戻る" },
  next: { en: "Next", ja: "次へ" },
  submit: { en: "Submit", ja: "送信" },
  required: { en: "This field is required", ja: "この項目は必須です" },
  invalidEmail: { en: "Enter a valid email", ja: "有効なメールアドレスを入力してください" },
  invalidTel: { en: "Enter a valid phone number", ja: "有効な電話番号を入力してください" },
  invalidNumber: { en: "Enter a number", ja: "数値を入力してください" },
  step: { en: "Step", ja: "ステップ" },
  of: { en: "of", ja: "/" },
  successTitle: { en: "Submitted!", ja: "送信完了！" },
  successBody: {
    en: "Show this QR code at the front desk.",
    ja: "受付でこのQRコードをご提示ください。",
  },
  select: { en: "Select…", ja: "選択…" },
  requiredMark: { en: "required", ja: "必須" },
  loading: { en: "Loading…", ja: "読み込み中…" },
  notFound: { en: "Form not found", ja: "フォームが見つかりません" },
  submitting: { en: "Submitting…", ja: "送信中…" },
} as const;

export type StringKey = keyof typeof STRINGS;

export const t = (key: StringKey, lang: Lang): string => STRINGS[key][lang];
