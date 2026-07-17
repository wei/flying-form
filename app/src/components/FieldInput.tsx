import type { FormField, Lang } from "../lib/types";
import { t } from "../lib/i18n";

interface Props {
  field: FormField;
  lang: Lang;
  value: string | string[] | undefined;
  error?: string;
  onChange: (v: string | string[]) => void;
}

export default function FieldInput({ field, lang, value, error, onChange }: Props) {
  const label = lang === "ja" ? field.label_ja : field.label_en;
  const placeholder =
    (lang === "ja" ? field.placeholder_ja : field.placeholder_en) ?? "";
  const fieldId = `f-${field.id}`;

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          id={fieldId}
          value={(value as string) ?? ""}
          placeholder={placeholder}
          rows={4}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "select":
      control = (
        <select
          id={fieldId}
          value={(value as string) ?? ""}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{t("select", lang)}</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {lang === "ja" ? o.label_ja : o.label_en}
            </option>
          ))}
        </select>
      );
      break;
    case "radio":
      control = (
        <div className="choice-group" role="radiogroup" aria-labelledby={`${fieldId}-label`}>
          {field.options?.map((o) => (
            <label key={o.value} className="choice">
              <input
                type="radio"
                name={fieldId}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              <span>{lang === "ja" ? o.label_ja : o.label_en}</span>
            </label>
          ))}
        </div>
      );
      break;
    case "checkbox": {
      const arr = Array.isArray(value) ? value : [];
      control = (
        <div className="choice-group" role="group" aria-labelledby={`${fieldId}-label`}>
          {field.options?.map((o) => (
            <label key={o.value} className="choice">
              <input
                type="checkbox"
                checked={arr.includes(o.value)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...arr, o.value]
                      : arr.filter((v) => v !== o.value),
                  )
                }
              />
              <span>{lang === "ja" ? o.label_ja : o.label_en}</span>
            </label>
          ))}
        </div>
      );
      break;
    }
    default:
      // text, email, tel, number, date → native input types drive the right keyboard
      control = (
        <input
          id={fieldId}
          type={field.type}
          inputMode={
            field.type === "tel" ? "tel" : field.type === "number" ? "numeric" : undefined
          }
          value={(value as string) ?? ""}
          placeholder={placeholder}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label id={`${fieldId}-label`} htmlFor={fieldId} className="field-label">
        {label}
        {field.required && <span className="req"> *{t("requiredMark", lang)}</span>}
      </label>
      {control}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

/** Validate one field's value; returns error string key resolved for lang, or null. */
export function validateField(
  field: FormField,
  value: string | string[] | undefined,
  lang: Lang,
): string | null {
  const empty =
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);
  if (field.required && empty) return t("required", lang);
  if (empty) return null;
  const s = value as string;
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
    return t("invalidEmail", lang);
  if (field.type === "tel" && !/^[\d+\-() .]{6,}$/.test(s))
    return t("invalidTel", lang);
  if (field.type === "number" && Number.isNaN(Number(s)))
    return t("invalidNumber", lang);
  return null;
}
