import type { FormSchema, Lang } from "../lib/types";

/** Read-only render of a generated schema (not an editor, per PRD). */
export default function FormPreview({ schema, lang }: { schema: FormSchema; lang: Lang }) {
  const L = (en: string, ja: string) => (lang === "ja" ? ja : en);
  return (
    <div className="preview">
      <h2>{L(schema.title_en, schema.title_ja)}</h2>
      {schema.sections.map((s, i) => (
        <section key={i}>
          <h3>
            {i + 1}. {L(s.title_en, s.title_ja)}
          </h3>
          <ul>
            {s.fields.map((f) => (
              <li key={f.id}>
                <span className="pv-label">{L(f.label_en, f.label_ja)}</span>
                <span className="pv-type">{f.type}</span>
                {f.required && <span className="pv-req">required</span>}
                {f.options && (
                  <span className="pv-opts">
                    {f.options.map((o) => L(o.label_en, o.label_ja)).join(" / ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
