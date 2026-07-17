import { parseSchema, type FormSchema, type FormValues } from "./types";

// ai& has no CORS, so calls go through our Cloud Function proxy
// (hosting rewrite in prod, vite proxy in dev).
const API_URL = "/api/kimi";
const MODEL = "moonshotai/kimi-k2.7";

type Content =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

async function chat(
  messages: Array<{ role: string; content: Content }>,
  maxTokens = 4000,
): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Kimi API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty model response");
  return content as string;
}

const SCHEMA_PROMPT = `You convert photos of paper forms into JSON. Output ONLY valid JSON, no markdown fences, no prose.
Schema: {"title_en":string,"title_ja":string,"sections":[{"title_en":string,"title_ja":string,"fields":[{"id":string,"label_en":string,"label_ja":string,"type":string,"required":boolean,"placeholder_en":string?,"placeholder_ja":string?,"options":[{"value":string,"label_en":string,"label_ja":string}]?}]}]}
Rules:
- "type" MUST be exactly one of: text,email,tel,number,date,select,radio,checkbox,textarea. Never anything else.
- Emit BOTH label_ja and label_en for every title, section, field, and option. If the paper is monolingual, translate for the other language.
- Group visually related fields into sections (each section becomes one screen).
- Infer types and validation from labels and layout: email addresses -> email, phone -> tel, dates -> date, long comment boxes -> textarea, checkbox rows -> checkbox with options, single-choice circles -> radio, dropdown-like lists -> select.
- field id: short snake_case english.
- Mark required:true when the paper marks it (※必須, *, required) or it is clearly essential (name).
- options only for select/radio/checkbox.`;

/** Paper photo -> validated FormSchema. Retries once on invalid output. */
export async function generateSchema(imageDataUrl: string): Promise<FormSchema> {
  const messages = [
    { role: "system", content: SCHEMA_PROMPT },
    {
      role: "user",
      content: [
        { type: "image_url" as const, image_url: { url: imageDataUrl } },
        { type: "text" as const, text: "Convert this paper form to the JSON schema." },
      ],
    },
  ];
  // retries cover both invalid JSON and transient upstream 503s (observed)
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return parseSchema(await chat(messages));
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/** P1: photo of a filled form + schema -> values keyed by field id. */
export async function prefillValues(
  imageDataUrl: string,
  schema: FormSchema,
): Promise<FormValues> {
  const raw = await chat([
    {
      role: "system",
      content: `You read handwritten/filled paper forms. Given a form schema and a photo of a FILLED copy, output ONLY a JSON object mapping field id -> value (string, or array of option values for checkbox). Omit fields you cannot read. No fences, no prose. Dates as YYYY-MM-DD. For select/radio/checkbox use the option "value" strings.`,
    },
    {
      role: "user",
      content: [
        { type: "image_url" as const, image_url: { url: imageDataUrl } },
        {
          type: "text" as const,
          text: `Schema:\n${JSON.stringify(schema)}\n\nExtract the filled values.`,
        },
      ],
    },
  ]);
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0) throw new Error("No JSON in prefill output");
  return JSON.parse(cleaned.slice(start, end + 1)) as FormValues;
}
