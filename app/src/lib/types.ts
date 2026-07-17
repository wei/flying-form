import { z } from "zod";

// Closed field-type enum — the correctness guarantee (PRD).
export const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
  "textarea",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

const OptionZ = z.object({
  value: z.string().min(1),
  label_en: z.string().min(1),
  label_ja: z.string().min(1),
});

const FieldZ = z.object({
  id: z.string().min(1),
  label_en: z.string().min(1),
  label_ja: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().optional().default(false),
  placeholder_en: z.string().optional(),
  placeholder_ja: z.string().optional(),
  options: z.array(OptionZ).optional(),
});

const SectionZ = z.object({
  title_en: z.string().min(1),
  title_ja: z.string().min(1),
  fields: z.array(FieldZ).min(1),
});

export const FormSchemaZ = z.object({
  title_en: z.string().min(1),
  title_ja: z.string().min(1),
  sections: z.array(SectionZ).min(1),
});

export type FormOption = z.infer<typeof OptionZ>;
export type FormField = z.infer<typeof FieldZ>;
export type FormSection = z.infer<typeof SectionZ>;
export type FormSchema = z.infer<typeof FormSchemaZ>;

export type FormValues = Record<string, string | string[]>;

export interface StoredForm {
  id: string;
  schema: FormSchema;
  createdAt: number;
}

export interface Submission {
  id: string;
  formId: string;
  values: FormValues;
  createdAt: number;
}

export type Lang = "en" | "ja";

/** Parse model output defensively: strip fences, JSON.parse, validate enum. */
export function parseSchema(raw: string): FormSchema {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("No JSON object in model output");
  const obj = JSON.parse(cleaned.slice(start, end + 1));
  return FormSchemaZ.parse(obj);
}
