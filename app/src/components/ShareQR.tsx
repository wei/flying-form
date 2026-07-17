import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLang } from "../lib/lang";
import { t } from "../lib/i18n";

interface Props {
  url: string;
  title: string;
  subtitle?: string;
  size: number;
}

/** Center-logo settings; high error correction keeps the code scannable. */
const logoSettings = (size: number) => ({
  src: "/favicon.png",
  height: Math.round(size * 0.2),
  width: Math.round(size * 0.2),
  excavate: true,
});

/** QR tile that opens a large share dialog: title on top, big QR, link actions. */
export default function ShareQR({ url, title, subtitle, size }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { lang } = useLang();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="qr-trigger"
        aria-label={`Show QR code for ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <QRCodeSVG value={url} size={size} level="H" imageSettings={logoSettings(size)} />
      </button>

      <dialog
        ref={dialogRef}
        className="modal-backdrop"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      >
        <div className="modal qr-share" onClick={(e) => e.stopPropagation()}>
          <h2>{title}</h2>
          {subtitle && <p className="jp">{subtitle}</p>}
          <div className="qr-box viewfinder qr-share-big">
            <span className="vf" aria-hidden="true" />
            <QRCodeSVG value={url} size={300} level="H" imageSettings={logoSettings(300)} />
          </div>
          <p className="qr-share-url">{url}</p>
          <div className="qr-share-actions">
            <button
              className="btn secondary"
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? t("copied", lang) : t("copyLink", lang)}
            </button>
            <button
              className="btn secondary"
              onClick={() => window.open(url, "_blank", "noopener")}
            >
              {t("openLink", lang)}
            </button>
            <button className="btn primary" onClick={() => setOpen(false)}>
              {t("done", lang)}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
