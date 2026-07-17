import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForm, submitValues } from "../lib/fb";
import LinkedQR from "../components/LinkedQR";
import { t } from "../lib/i18n";
import type { FormValues, Lang, StoredForm } from "../lib/types";
import FieldInput, { validateField } from "../components/FieldInput";

export default function Fill() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<StoredForm | null | undefined>(undefined);
  const [lang, setLang] = useState<Lang>("ja");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"fill" | "submitting" | "done">("fill");
  const [subId, setSubId] = useState("");

  useEffect(() => {
    if (formId) getForm(formId).then(setForm);
  }, [formId]);

  if (form === undefined) return <div className="fill-shell center">{t("loading", lang)}</div>;
  if (form === null) return <div className="fill-shell center">{t("notFound", lang)}</div>;

  const schema = form.schema;
  const sections = schema.sections;
  const section = sections[step];
  const isLast = step === sections.length - 1;
  const title = lang === "ja" ? schema.title_ja : schema.title_en;

  const langToggle = (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === "ja" ? "en" : "ja")}
      aria-label="Switch language"
    >
      {lang === "ja" ? "English" : "日本語"}
    </button>
  );

  if (state === "done") {
    const qrPayload = `${location.origin}/admin/form/${form.id}/sub/${subId}`;
    return (
      <div className="fill-shell center success">
        {langToggle}
        <div className="success-check">✓</div>
        <h1>{t("successTitle", lang)}</h1>
        <p>{t("successBody", lang)}</p>
        <div className="qr-box">
          <LinkedQR value={qrPayload} size={220} />
        </div>
        <p className="sub-ref">#{subId}</p>
      </div>
    );
  }

  const validateSection = (): boolean => {
    const errs: Record<string, string> = {};
    for (const f of section.fields) {
      const e = validateField(f, values[f.id], lang);
      if (e) errs[f.id] = e;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onNext = async () => {
    if (!validateSection()) return;
    if (!isLast) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }
    setState("submitting");
    try {
      const id = await submitValues(form.id, values);
      setSubId(id);
      setState("done");
    } catch (err) {
      setState("fill");
      alert(String(err));
    }
  };

  return (
    <div className="fill-shell">
      <header className="fill-header">
        <h1>{title}</h1>
        {langToggle}
      </header>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={sections.length}
        aria-valuenow={step + 1}
      >
        <div className="progress-bar" style={{ width: `${((step + 1) / sections.length) * 100}%` }} />
      </div>
      <p className="step-label">
        {t("step", lang)} {step + 1} {t("of", lang)} {sections.length} ·{" "}
        {lang === "ja" ? section.title_ja : section.title_en}
      </p>
      <main>
        {section.fields.map((f) => (
          <FieldInput
            key={f.id}
            field={f}
            lang={lang}
            value={values[f.id]}
            error={errors[f.id]}
            onChange={(v) => {
              setValues({ ...values, [f.id]: v });
              if (errors[f.id]) setErrors({ ...errors, [f.id]: "" });
            }}
          />
        ))}
      </main>
      <footer className="fill-footer">
        {step > 0 && (
          <button className="btn secondary" onClick={() => setStep(step - 1)}>
            {t("back", lang)}
          </button>
        )}
        <button
          className="btn primary"
          disabled={state === "submitting"}
          onClick={onNext}
        >
          {state === "submitting"
            ? t("submitting", lang)
            : isLast
              ? t("submit", lang)
              : t("next", lang)}
        </button>
      </footer>
    </div>
  );
}
