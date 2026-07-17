import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { countSubmissions, watchForms } from "../lib/fb";
import type { StoredForm } from "../lib/types";
import ScanModal from "../components/ScanModal";
import ShareQR from "../components/ShareQR";
import AdminShell from "../components/AdminShell";
import { useLang } from "../lib/lang";
import { t } from "../lib/i18n";

export default function Admin() {
  const [forms, setForms] = useState<StoredForm[] | undefined>(undefined);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [scanning, setScanning] = useState(false);
  const nav = useNavigate();
  const { lang } = useLang();

  useEffect(() => watchForms(setForms), []);

  useEffect(() => {
    forms?.forEach((f) => {
      countSubmissions(f.id)
        .then((n) => setCounts((c) => ({ ...c, [f.id]: n })))
        .catch(() => {});
    });
  }, [forms]);

  const onScan = (text: string) => {
    setScanning(false);
    try {
      const url = new URL(text);
      nav(url.pathname);
    } catch {
      alert(`Not a Flying Form QR: ${text}`);
    }
  };

  return (
    <AdminShell
      title={t("formsTitle", lang)}
      subtitle={t("formsSubtitle", lang)}
      actions={
        <>
          <button className="btn secondary" onClick={() => setScanning(true)}>
            {t("scanQr", lang)}
          </button>
          <button className="btn primary" onClick={() => nav("/admin/new")}>
            {t("newFormBtn", lang)}
          </button>
        </>
      }
    >
      {forms === undefined ? (
        <div className="table-skeleton" aria-hidden="true">
          <div className="skeleton" style={{ height: 44 }} />
          <div className="skeleton" style={{ height: 64 }} />
          <div className="skeleton" style={{ height: 64 }} />
        </div>
      ) : forms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">📄</div>
          <div>
            <h3>{t("emptyTitle", lang)}</h3>
            <p>{t("emptyBody", lang)}</p>
          </div>
          <button className="btn primary btn-lg" onClick={() => nav("/admin/new")}>
            {t("createForm", lang)}
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="subs-table forms-table">
            <thead>
              <tr>
                <th className="col-qr">QR</th>
                <th>{t("thForm", lang)}</th>
                <th className="num">{t("thSections", lang)}</th>
                <th className="num">{t("thFields", lang)}</th>
                <th className="num">{t("thSubmissions", lang)}</th>
                <th>{t("thCreated", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => {
                const fieldCount = f.schema.sections.reduce(
                  (n, s) => n + s.fields.length,
                  0,
                );
                return (
                  <tr
                    key={f.id}
                    tabIndex={0}
                    onClick={() => nav(`/admin/form/${f.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && nav(`/admin/form/${f.id}`)}
                    aria-label={`${f.schema.title_en} form`}
                  >
                    <td className="col-qr">
                      <ShareQR
                        url={`${location.origin}/f/${f.id}`}
                        title={f.schema.title_en}
                        subtitle={f.schema.title_ja}
                        size={44}
                      />
                    </td>
                    <td>
                      <span className="cell-title">
                        {lang === "ja" ? f.schema.title_ja : f.schema.title_en}
                      </span>
                      <span className="cell-sub">
                        {lang === "ja" ? f.schema.title_en : f.schema.title_ja}
                      </span>
                    </td>
                    <td className="num">{f.schema.sections.length}</td>
                    <td className="num">{fieldCount}</td>
                    <td className="num">{counts[f.id] ?? "–"}</td>
                    <td className="muted-cell">
                      {new Date(f.createdAt).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {scanning && <ScanModal onResult={onScan} onClose={() => setScanning(false)} />}
    </AdminShell>
  );
}
