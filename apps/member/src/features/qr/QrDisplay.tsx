import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface QrDisplayProps {
  value: string;
  size?: number;
}

export function QrDisplay({ value, size = 280 }: QrDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0c2110', light: '#ffffff' },
    });
  }, [value, size]);

  return <canvas ref={canvasRef} className="rounded-lg" aria-label="Annual Pass QR code" />;
}
