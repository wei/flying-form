import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onResult: (text: string) => void;
  onClose: () => void;
}

/** Camera QR scanner rendered in a native dialog. */
export default function ScanModal({ onResult, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    const scanner = new Html5Qrcode("qr-reader");
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
        <h2>Scan success QR</h2>
        <div className="viewfinder" style={{ width: 320 }}>
          <span className="vf" aria-hidden="true" />
          <div id="qr-reader" style={{ width: 320 }} />
        </div>
        <button className="btn secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}
