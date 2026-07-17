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
  received: { en: "RECEIVED", ja: "受付済" },
  successBody: {
    en: "Show this QR code at the front desk.",
    ja: "受付でこのQRコードをご提示ください。",
  },
  select: { en: "Select…", ja: "選択…" },
  requiredMark: { en: "required", ja: "必須" },
  loading: { en: "Loading…", ja: "読み込み中…" },
  notFound: { en: "Form not found", ja: "フォームが見つかりません" },
  submitting: { en: "Submitting…", ja: "送信中…" },

  // ---- Admin chrome ----
  navForms: { en: "Forms", ja: "フォーム一覧" },
  navNew: { en: "New form", ja: "新規作成" },
  formsTitle: { en: "Forms", ja: "フォーム" },
  formsSubtitle: {
    en: "Digitize paper forms and review submissions.",
    ja: "紙のフォームをデジタル化し、回答を管理します。",
  },
  scanQr: { en: "Scan success QR", ja: "受付QRをスキャン" },
  newFormBtn: { en: "+ New form", ja: "＋ 新規フォーム" },
  thForm: { en: "Form", ja: "フォーム" },
  thSections: { en: "Sections", ja: "セクション" },
  thFields: { en: "Fields", ja: "項目" },
  thSubmissions: { en: "Submissions", ja: "回答" },
  thCreated: { en: "Created", ja: "作成日時" },
  thTime: { en: "Time", ja: "受信時刻" },
  emptyTitle: { en: "No forms yet", ja: "まだフォームがありません" },
  emptyBody: {
    en: "Photograph or upload a paper form to create your first digital form.",
    ja: "紙のフォームを撮影またはアップロードして、最初のデジタルフォームを作成しましょう。",
  },
  createForm: { en: "Create a form", ja: "フォームを作成" },
  newTitle: { en: "New form", ja: "新規フォーム" },
  newSubtitle: {
    en: "Upload a paper form and Kimi will build the digital version.",
    ja: "紙のフォームをアップロードすると、Kimiがデジタル版を作成します。",
  },
  stUpload: { en: "Upload", ja: "アップロード" },
  stReview: { en: "Review", ja: "確認" },
  stLive: { en: "Live", ja: "公開" },
  dzTitle: {
    en: "Photograph or upload a paper form",
    ja: "紙のフォームを撮影またはアップロード",
  },
  dzHint: {
    en: "JPEG or PNG · flat lighting helps accuracy",
    ja: "JPEG・PNG対応。明るい場所での撮影で精度が上がります",
  },
  generating: { en: "Kimi K2.7 is reading the form…", ja: "Kimi K2.7がフォームを読み取っています…" },
  publishBtn: { en: "Publish form", ja: "フォームを公開" },
  publishing: { en: "Publishing form…", ja: "公開しています…" },
  liveTitle: { en: "Form is live", ja: "フォームが公開されました" },
  openDashboard: { en: "Open dashboard", ja: "ダッシュボードを開く" },
  backToForms: { en: "Back to forms", ja: "フォーム一覧へ" },
  tryAgain: { en: "Try again", ja: "もう一度試す" },
  openForm: { en: "Open form", ja: "フォームを開く" },
  copyLink: { en: "Copy link", ja: "リンクをコピー" },
  copied: { en: "Copied", ja: "コピーしました" },
  openLink: { en: "Open link", ja: "リンクを開く" },
  done: { en: "Done", ja: "完了" },
  cancel: { en: "Cancel", ja: "キャンセル" },
  close: { en: "Close", ja: "閉じる" },
  noSubs: { en: "No submissions yet.", ja: "まだ回答がありません。" },
  submissionOne: { en: "submission", ja: "件の回答" },
  submissionMany: { en: "submissions", ja: "件の回答" },
  submission: { en: "Submission", ja: "回答" },
  loadingForm: { en: "Loading form…", ja: "フォームを読み込んでいます…" },
  formNotExist: { en: "This form does not exist.", ja: "このフォームは存在しません。" },

  // ---- Landing ----
  heroTitle: {
    en: "Paper form in. Mobile form out.",
    ja: "紙のフォームが、そのままモバイルフォームに。",
  },
  heroSub: {
    en: "Photograph any paper form and share a QR code. Visitors fill it on their own phone, in Japanese or English, and show a receipt QR at the desk.",
    ja: "紙のフォームを撮影してQRコードを共有するだけ。来訪者は自分のスマホで日本語でも英語でも入力し、受付で受領QRを提示できます。",
  },
  heroCta: { en: "Open dashboard", ja: "ダッシュボードを開く" },
  stepShoot: { en: "Photograph", ja: "撮影" },
  stepShootSub: { en: "One photo builds the form", ja: "写真一枚でフォームが完成" },
  stepFill: { en: "Fill", ja: "入力" },
  stepFillSub: { en: "On the visitor's own phone", ja: "来訪者自身のスマホで" },
  stepReceive: { en: "Received", ja: "受付" },
  stepReceiveSub: { en: "Scan the receipt QR at the desk", ja: "受付で受領QRをスキャン" },
  sovereignty: {
    en: "Every inference runs on Kimi K2.7 via ai&, in Japan.",
    ja: "すべての推論は、日本国内のai&上のKimi K2.7で実行されます。",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

export const t = (key: StringKey, lang: Lang): string => STRINGS[key][lang];
