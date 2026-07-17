import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { countSubmissions, watchForms } from "../lib/fb";
import type { StoredForm } from "../lib/types";
import ScanModal from "../components/ScanModal";
import ShareQR from "../components/ShareQR";
import AdminShell from "../components/AdminShell";

export default function Admin() {
  const [forms, setForms] = useState<StoredForm[] | undefined>(undefined);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [scanning, setScanning] = useState(false);
  const nav = useNavigate();

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
      title="Forms"
      subtitle="Digitize paper forms and review submissions."
      actions={
        <>
          <button className="btn secondary" onClick={() => setScanning(true)}>
            Scan success QR
          </button>
          <button className="btn primary" onClick={() => nav("/admin/new")}>
            + New form
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
            <h3>No forms yet</h3>
            <p>Photograph or upload a paper form to create your first digital form.</p>
          </div>
          <button className="btn primary btn-lg" onClick={() => nav("/admin/new")}>
            Create a form
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="subs-table forms-table">
            <thead>
              <tr>
                <th className="col-qr">QR</th>
                <th>Form</th>
                <th className="num">Sections</th>
                <th className="num">Fields</th>
                <th className="num">Submissions</th>
                <th>Created</th>
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
                      <span className="cell-title">{f.schema.title_en}</span>
                      <span className="cell-sub">{f.schema.title_ja}</span>
                    </td>
                    <td className="num">{f.schema.sections.length}</td>
                    <td className="num">{fieldCount}</td>
                    <td className="num">{counts[f.id] ?? "–"}</td>
                    <td className="muted-cell">
                      {new Date(f.createdAt).toLocaleDateString(undefined, {
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
