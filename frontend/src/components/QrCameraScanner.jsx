import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_ID = "qr-camera-scanner";

export default function QrCameraScanner({ onScan, paused = false }) {
  const scannerRef = useRef(null);
  const lastScanRef = useRef(0);
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);

  onScanRef.current = onScan;
  pausedRef.current = paused;

  useEffect(() => {
    let mounted = true;
    const html5QrCode = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 240, height: 240 },
      aspectRatio: 1,
    };

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!mounted || cameras.length === 0) return;

        const backCamera =
          cameras.find((c) => /back|rear|environment/i.test(c.label)) ??
          cameras[cameras.length - 1];

        return html5QrCode.start(
          backCamera.id,
          config,
          (decodedText) => {
            if (pausedRef.current) return;
            const now = Date.now();
            if (now - lastScanRef.current < 2500) return;
            lastScanRef.current = now;
            onScanRef.current?.(decodedText);
          },
          () => {},
        );
      })
      .catch((err) => {
        console.error("No se pudo iniciar la cámara:", err);
      });

    return () => {
      mounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <div
        id={SCANNER_ID}
        className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}
