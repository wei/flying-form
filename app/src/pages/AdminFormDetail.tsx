import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getForm, watchSubmissions } from "../lib/fb";
import ShareQR from "../components/ShareQR";
import type { FormField, StoredForm, Submission } from "../lib/types";
import ScanModal from "../components/ScanModal";
import AdminShell from "../components/AdminShell";
import { useLang } from "../lib/lang";
import { t } from "../lib/i18n";
import type { Lang } from "../lib/types";

function display(field: FormField | undefined, v: string | string[], lang: Lang): string {
  const opt = (x: string) => {
    const o = field?.options?.find((o) => o.value === x);
    return o ? (lang === "ja" ? o.label_ja : o.label_en) : x;
  };
  return Array.isArray(v) ? v.map(opt).join(", ") : opt(v);
}

export default function AdminFormDetail() {
  const { formId, subId } = useParams<{ formId: string; subId?: string }>();
  const [form, setForm] = useState<StoredForm | null | undefined>(undefined);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const { lang } = useLang();
  const nav = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (formId) getForm(formId).then(setForm);
  }, [formId]);
  useEffect(() => (formId ? watchSubmissions(formId, setSubs) : undefined), [formId]);

  const fields = useMemo(() => {
    const map = new Map<string, FormField>();
    form?.schema.sections.forEach((s) => s.fields.forEach((f) => map.set(f.id, f)));
    return map;
  }, [form]);

  const selected = subId && form?.id ? subs.find((s) => s.id === subId) : undefined;

  useEffect(() => {
    if (selected) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [selected]);

  if (form === undefined) {
    return (
      <AdminShell title={t("loading", lang)}>
        <div className="gen-status">
          <div className="spinner" />
          <p>{t("loadingForm", lang)}</p>
        </div>
      </AdminShell>
    );
  }
  if (form === null) {
    return (
      <AdminShell title={t("notFound", lang)}>
        <div className="center">
          <p className="error">{t("formNotExist", lang)}</p>
          <button className="btn primary" onClick={() => nav("/admin")}>
            {t("backToForms", lang)}
          </button>
        </div>
      </AdminShell>
    );
  }

  const fieldList = [...fields.values()];

  const onScan = (text: string) => {
    setScanning(false);
    try {
      nav(new URL(text).pathname);
    } catch {
      alert(`Not a Flying Form QR: ${text}`);
    }
  };

  return (
    <AdminShell
      title={lang === "ja" ? form.schema.title_ja : form.schema.title_en}
      subtitle={lang === "ja" ? form.schema.title_en : form.schema.title_ja}
      actions={
        <button className="btn secondary" onClick={() => setScanning(true)}>
          {t("scanQr", lang)}
        </button>
      }
    >
      <div className="detail-grid">
        <aside className="detail-side">
          <div className="qr-box viewfinder">
            <span className="vf" aria-hidden="true" />
            <ShareQR
              url={`${location.origin}/f/${form.id}`}
              title={form.schema.title_en}
              subtitle={form.schema.title_ja}
              size={160}
            />
          </div>
          <div className="side-actions">
            <a className="btn secondary" href={`/f/${form.id}`} target="_blank" rel="noreferrer">
              {t("openForm", lang)}
            </a>
            <button
              className="btn secondary"
              onClick={() => {
                navigator.clipboard.writeText(`${location.origin}/f/${form.id}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? t("copied", lang) : t("copyLink", lang)}
            </button>
          </div>
          <p className="meta">
            {subs.length}{" "}
            {t(subs.length === 1 ? "submissionOne" : "submissionMany", lang)}
          </p>
        </aside>

        <div className="detail-main">
          <table className="subs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("thTime", lang)}</th>
                {fieldList.slice(0, 4).map((f) => (
                  <th key={f.id}>{lang === "ja" ? f.label_ja : f.label_en}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr
                  key={s.id}
                  className={s.id === subId ? "selected" : ""}
                  onClick={() => nav(`/admin/form/${form.id}/sub/${s.id}`)}
                >
                  <td>{s.id.slice(0, 6)}</td>
                  <td>{new Date(s.createdAt).toLocaleTimeString(lang === "ja" ? "ja-JP" : "en-US")}</td>
                  {fieldList.slice(0, 4).map((f) => (
                    <td key={f.id}>{display(f, s.values[f.id] ?? "", lang)}</td>
                  ))}
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    {t("noSubs", lang)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <dialog
          ref={dialogRef}
          className="modal-backdrop"
          onClick={() => nav(`/admin/form/${form.id}`)}
          onClose={() => nav(`/admin/form/${form.id}`)}
        >
          <div className="modal submission-view" onClick={(e) => e.stopPropagation()}>
            <div className="close-row">
              <button className="btn ghost" onClick={() => nav(`/admin/form/${form.id}`)}>
                ✕ {t("close", lang)}
              </button>
            </div>
            <h2>
              {t("submission", lang)} #{selected.id.slice(0, 6)}
            </h2>
            <p className="meta">
              {new Date(selected.createdAt).toLocaleString(lang === "ja" ? "ja-JP" : "en-US")}
            </p>
            <dl>
              {fieldList.map((f) => (
                <div key={f.id} className="sub-row">
                  <dt>
                    {lang === "ja" ? f.label_ja : f.label_en}
                    <span className="jp">{lang === "ja" ? f.label_en : f.label_ja}</span>
                  </dt>
                  <dd>{display(f, selected.values[f.id] ?? "", lang) || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </dialog>
      )}

      {scanning && <ScanModal onResult={onScan} onClose={() => setScanning(false)} />}
    </AdminShell>
  );
}
