import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useLang } from "../lib/lang";
import { t } from "../lib/i18n";

interface Props {
  onResult: (text: string) => void;
  onClose: () => void;
}

/** Camera QR scanner rendered in a native dialog. */
export default function ScanModal({ onResult, onClose }: Props) {
  const { lang } = useLang();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    let scanner: Html5Qrcode;
    try {
      scanner = new Html5Qrcode("qr-reader");
    } catch (err) {
      alert(`Camera error: ${err}`);
      dialog.close();
      onClose();
      return;
    }
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          if (doneRef.current) return;
          doneRef.current = true;
          scanner.stop().catch(() => {});
          dialog.close();
          onResult(text);
        },
        () => {},
      )
      .catch((err) => {
        alert(`Camera error: ${err}`);
        dialog.close();
        onClose();
      });

    return () => {
      scanner.stop().catch(() => {});
      if (dialog.open) dialog.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal-backdrop"
      onClick={onClose}
      onClose={onClose}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t("scanQr", lang)}</h2>
        <div className="viewfinder" style={{ width: 320 }}>
          <span className="vf" aria-hidden="true" />
          <div id="qr-reader" style={{ width: 320 }} />
        </div>
        <button className="btn secondary" onClick={onClose}>
          {t("cancel", lang)}
        </button>
      </div>
    </dialog>
  );
}
