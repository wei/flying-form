import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { watchForms } from "../lib/fb";
import type { StoredForm } from "../lib/types";
import ScanModal from "../components/ScanModal";
import LinkedQR from "../components/LinkedQR";
import AdminShell from "../components/AdminShell";

export default function Admin() {
  const [forms, setForms] = useState<StoredForm[]>([]);
  const [scanning, setScanning] = useState(false);
  const nav = useNavigate();

  useEffect(() => watchForms(setForms), []);

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
      {forms.length === 0 ? (
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
        <div className="form-grid">
          {forms.map((f) => (
            <div
              key={f.id}
              className="form-card"
              role="link"
              tabIndex={0}
              onClick={() => nav(`/admin/form/${f.id}`)}
              onKeyDown={(e) => e.key === "Enter" && nav(`/admin/form/${f.id}`)}
              aria-label={`${f.schema.title_en} form`}
            >
              <div className="form-card-qr">
                <LinkedQR value={`${location.origin}/f/${f.id}`} size={72} />
              </div>
              <div className="form-card-body">
                <h3>{f.schema.title_en}</h3>
                <p className="jp">{f.schema.title_ja}</p>
                <p className="meta">
                  {f.schema.sections.length} sections · /f/{f.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {scanning && <ScanModal onResult={onScan} onClose={() => setScanning(false)} />}
    </AdminShell>
  );
}
