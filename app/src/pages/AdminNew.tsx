import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateSchema } from "../lib/kimi";
import { publishForm } from "../lib/fb";
import type { FormSchema, Lang } from "../lib/types";
import FormPreview from "../components/FormPreview";
import ShareQR from "../components/ShareQR";
import AdminShell from "../components/AdminShell";

type Stage =
  | { s: "pick" }
  | { s: "generating"; img: string }
  | { s: "preview"; img: string; schema: FormSchema }
  | { s: "publishing" }
  | { s: "published"; formId: string; schema: FormSchema }
  | { s: "error"; msg: string };

/** Downscale to keep the request small and fast. */
async function fileToDataUrl(file: File, maxDim = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AdminNew() {
  const [stage, setStage] = useState<Stage>({ s: "pick" });
  const [lang, setLang] = useState<Lang>("en");
  const nav = useNavigate();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const img = await fileToDataUrl(file);
      setStage({ s: "generating", img });
      const schema = await generateSchema(img);
      setStage({ s: "preview", img, schema });
    } catch (err) {
      setStage({ s: "error", msg: String(err) });
    }
  };

  const onPublish = async (schema: FormSchema) => {
    setStage({ s: "publishing" });
    try {
      const formId = await publishForm(schema);
      setStage({ s: "published", formId, schema });
    } catch (err) {
      setStage({ s: "error", msg: String(err) });
    }
  };

  const stageIndex =
    stage.s === "pick" || stage.s === "generating" || stage.s === "error"
      ? 0
      : stage.s === "preview" || stage.s === "publishing"
        ? 1
        : 2;
  const STAGES = ["Upload", "Review", "Live"];

  return (
    <AdminShell
      title="New form"
      subtitle="Upload a paper form and Kimi will build the digital version."
    >
      <ol className="stages" aria-label="Create form progress">
        {STAGES.map((name, i) => (
          <li
            key={name}
            className={`stage${i === stageIndex ? " current" : i < stageIndex ? " done" : ""}`}
            aria-current={i === stageIndex ? "step" : undefined}
          >
            <span className="stage-dot" aria-hidden="true">
              {i < stageIndex ? "✓" : i + 1}
            </span>
            {name}
            {i < STAGES.length - 1 && <span className="stage-rule" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {stage.s === "pick" && (
        <label className="dropzone viewfinder">
          <span className="vf" aria-hidden="true" />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <span className="dz-icon" aria-hidden="true">📷</span>
          <span className="dz-title">Photograph or upload a paper form</span>
          <span className="dz-hint">JPEG or PNG · flat lighting helps accuracy</span>
        </label>
      )}

      {stage.s === "generating" && (
        <div className="gen-row">
          <img src={stage.img} className="gen-thumb" alt="paper form" />
          <div className="gen-status">
            <div className="spinner" />
            <p>Kimi K2.7 is reading the form…</p>
          </div>
        </div>
      )}

      {stage.s === "preview" && (
        <div className="gen-row">
          <img src={stage.img} className="gen-thumb" alt="paper form" />
          <div className="preview-col">
            <div className="preview-toolbar">
              <button className="lang-toggle" onClick={() => setLang(lang === "ja" ? "en" : "ja")}>
                {lang === "ja" ? "English" : "日本語"}
              </button>
              <button className="btn primary" onClick={() => onPublish(stage.schema)}>
                Publish form
              </button>
            </div>
            <FormPreview schema={stage.schema} lang={lang} />
          </div>
        </div>
      )}

      {stage.s === "publishing" && (
        <div className="gen-status center">
          <div className="spinner" />
          <p>Publishing form…</p>
        </div>
      )}

      {stage.s === "published" && (
        <div className="published">
          <h2>Form is live</h2>
          <div className="qr-box viewfinder">
            <span className="vf" aria-hidden="true" />
            <ShareQR
              url={`${location.origin}/f/${stage.formId}`}
              title={stage.schema.title_en}
              subtitle={stage.schema.title_ja}
              size={260}
            />
          </div>
          <p>
            <a href={`/f/${stage.formId}`} target="_blank" rel="noreferrer">
              {location.origin}/f/{stage.formId}
            </a>
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button className="btn secondary" onClick={() => nav("/admin")}>
              Back to forms
            </button>
            <button className="btn primary" onClick={() => nav(`/admin/form/${stage.formId}`)}>
              Open dashboard
            </button>
          </div>
        </div>
      )}

      {stage.s === "error" && (
        <div className="center">
          <p className="error">{stage.msg}</p>
          <button className="btn primary" onClick={() => setStage({ s: "pick" })}>
            Try again
          </button>
        </div>
      )}
    </AdminShell>
  );
}
