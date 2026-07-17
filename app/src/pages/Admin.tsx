import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { watchForms } from "../lib/fb";
import type { StoredForm } from "../lib/types";
import ScanModal from "../components/ScanModal";
import LinkedQR from "../components/LinkedQR";

export default function Admin() {
  const [forms, setForms] = useState<StoredForm[]>([]);
  const [scanning, setScanning] = useState(false);
  const nav = useNavigate();

  useEffect(() => watchForms(setForms), []);

  const onScan = (text: string) => {
    setScanning(false);
    try {
      const url = new URL(text);
      nav(url.pathname); // success QR encodes /admin/form/:id/sub/:subId
    } catch {
      alert(`Not a Flying Form QR: ${text}`);
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>✈️ Flying Form</h1>
        <div className="admin-actions">
          <button className="btn secondary" onClick={() => setScanning(true)}>
            Scan success QR
          </button>
          <Link className="btn primary" to="/admin/new">
            + New form from photo
          </Link>
        </div>
      </header>
      {forms.length === 0 && (
        <p className="empty">No forms yet. Photograph a paper form to create one.</p>
      )}
      <div className="form-grid">
        {forms.map((f) => (
          <div
            key={f.id}
            className="form-card"
            role="link"
            tabIndex={0}
            onClick={() => nav(`/admin/form/${f.id}`)}
            onKeyDown={(e) => e.key === "Enter" && nav(`/admin/form/${f.id}`)}
          >
            <div className="form-card-qr">
              <LinkedQR value={`${location.origin}/f/${f.id}`} size={72} />
            </div>
            <div>
              <h3>{f.schema.title_en}</h3>
              <p className="jp">{f.schema.title_ja}</p>
              <p className="meta">
                {f.schema.sections.length} sections · /f/{f.id}
              </p>
            </div>
          </div>
        ))}
      </div>
      {scanning && <ScanModal onResult={onScan} onClose={() => setScanning(false)} />}
    </div>
  );
}
