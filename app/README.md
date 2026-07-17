# Flying Form — app

The Vite + React 19 single-page app that is the whole product. See the [root README](../README.md) for what Flying Form is, how it works, and the demo flow.

## Scripts

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview    # serve the production build locally
```

`/api/kimi` is proxied to the deployed ai& Cloud Function in dev (see `vite.config.ts`) and rewritten to it in production (see `firebase.json`). Firebase web config comes from `.env` (`VITE_FB_*`).

## Layout

- `src/pages` — `Admin`, `AdminNew`, `AdminFormDetail`, `Fill`
- `src/components` — `AdminShell`, `FormPreview`, `FieldInput`, `ShareQR`, `ScanModal`
- `src/lib` — `kimi.ts` (ai& calls), `types.ts` (schema + Zod validation), `fb.ts` (Firestore), `lang.tsx` / `i18n.ts` (EN/JA)
- `functions/index.js` — the ai& proxy Cloud Function
</content>
