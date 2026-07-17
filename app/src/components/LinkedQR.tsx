import { QRCodeSVG } from "qrcode.react";

/** QR code that is also a clickable link to the URL it encodes. */
export default function LinkedQR({ value, size }: { value: string; size: number }) {
  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${value}`}
      onClick={(e) => e.stopPropagation()}
    >
      <QRCodeSVG value={value} size={size} />
    </a>
  );
}
