import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getForm, watchSubmissions } from "../lib/fb";
import LinkedQR from "../components/LinkedQR";
import type { FormField, StoredForm, Submission } from "../lib/types";
import ScanModal from "../components/ScanModal";
import AdminShell from "../components/AdminShell";

function display(field: FormField | undefined, v: string | string[]): string {
  if (Array.isArray(v)) {
    return v
      .map((x) => field?.options?.find((o) => o.value === x)?.label_en ?? x)
      .join(", ");
  }
  return field?.options?.find((o) => o.value === v)?.label_en ?? v;
}

export default function AdminFormDetail() {
  const { formId, subId } = useParams<{ formId: string; subId?: string }>();
  const [form, setForm] = useState<StoredForm | null | undefined>(undefined);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);
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
      <AdminShell title="Loading…">
        <div className="gen-status">
          <div className="spinner" />
          <p>Loading form…</p>
        </div>
      </AdminShell>
    );
  }
  if (form === null) {
    return (
      <AdminShell title="Form not found">
        <div className="center">
          <p className="error">This form does not exist.</p>
          <button className="btn primary" onClick={() => nav("/admin")}>Back to forms</button>
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
      title={form.schema.title_en}
      subtitle={form.schema.title_ja}
      actions={
        <button className="btn secondary" onClick={() => setScanning(true)}>
          Scan success QR
        </button>
      }
    >
      <div className="detail-grid">
        <aside className="detail-side">
          <div className="qr-box viewfinder">
            <span className="vf" aria-hidden="true" />
            <LinkedQR value={`${location.origin}/f/${form.id}`} size={160} />
          </div>
          <div className="side-actions">
            <a className="btn secondary" href={`/f/${form.id}`} target="_blank" rel="noreferrer">
              Open form
            </a>
            <button
              className="btn secondary"
              onClick={() => {
                navigator.clipboard.writeText(`${location.origin}/f/${form.id}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className="meta">{subs.length} {subs.length === 1 ? "submission" : "submissions"}</p>
        </aside>

        <div className="detail-main">
          <table className="subs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                {fieldList.slice(0, 4).map((f) => (
                  <th key={f.id}>{f.label_en}</th>
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
                  <td>{new Date(s.createdAt).toLocaleTimeString()}</td>
                  {fieldList.slice(0, 4).map((f) => (
                    <td key={f.id}>{display(f, s.values[f.id] ?? "")}</td>
                  ))}
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No submissions yet.
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
                ✕ Close
              </button>
            </div>
            <h2>Submission #{selected.id.slice(0, 6)}</h2>
            <p className="meta">{new Date(selected.createdAt).toLocaleString()}</p>
            <dl>
              {fieldList.map((f) => (
                <div key={f.id} className="sub-row">
                  <dt>
                    {f.label_en}
                    <span className="jp">{f.label_ja}</span>
                  </dt>
                  <dd>{display(f, selected.values[f.id] ?? "") || "—"}</dd>
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
