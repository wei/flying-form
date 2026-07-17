import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  url: string;
  title: string;
  subtitle?: string;
  size: number;
}

/** QR tile that opens a large share dialog: title on top, big QR, link actions. */
export default function ShareQR({ url, title, subtitle, size }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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
        <QRCodeSVG value={url} size={size} />
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
            <QRCodeSVG value={url} size={300} />
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
              {copied ? "Copied" : "Copy link"}
            </button>
            <a className="btn secondary" href={url} target="_blank" rel="noreferrer">
              Open link
            </a>
            <button className="btn primary" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
