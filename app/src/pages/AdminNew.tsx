import { useState } from "react";
import { Link } from "react-router-dom";
import { generateSchema } from "../lib/kimi";
import { publishForm } from "../lib/fb";
import type { FormSchema, Lang } from "../lib/types";
import FormPreview from "../components/FormPreview";
import LinkedQR from "../components/LinkedQR";

type Stage =
  | { s: "pick" }
  | { s: "generating"; img: string }
  | { s: "preview"; img: string; schema: FormSchema }
  | { s: "publishing" }
  | { s: "published"; formId: string }
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
      setStage({ s: "published", formId });
    } catch (err) {
      setStage({ s: "error", msg: String(err) });
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>
          <Link to="/admin">✈️ Flying Form</Link> · New form
        </h1>
      </header>

      {stage.s === "pick" && (
        <label className="dropzone">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <span className="dz-icon">📷</span>
          <span>Photograph or upload a paper form</span>
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
                Publish
              </button>
            </div>
            <FormPreview schema={stage.schema} lang={lang} />
          </div>
        </div>
      )}

      {stage.s === "publishing" && (
        <div className="gen-status center">
          <div className="spinner" />
          <p>Publishing…</p>
        </div>
      )}

      {stage.s === "published" && (
        <div className="published center">
          <h2>Form is live</h2>
          <div className="qr-box">
            <LinkedQR value={`${location.origin}/f/${stage.formId}`} size={260} />
          </div>
          <p>
            <a href={`/f/${stage.formId}`} target="_blank" rel="noreferrer">
              {location.origin}/f/{stage.formId}
            </a>
          </p>
          <Link className="btn primary" to={`/admin/form/${stage.formId}`}>
            Open dashboard
          </Link>
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
    </div>
  );
}
