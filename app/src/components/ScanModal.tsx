import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

/** Camera QR scanner; calls onResult with the decoded text. */
export default function ScanModal({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const done = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          if (done.current) return;
          done.current = true;
          scanner.stop().catch(() => {});
          onResult(text);
        },
        () => {},
      )
      .catch((err) => {
        alert(`Camera error: ${err}`);
        onClose();
      });
    return () => {
      scanner.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div id="qr-reader" style={{ width: 320 }} />
        <button className="btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
