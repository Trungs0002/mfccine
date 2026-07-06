import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * QrScannerOverlay
 * Full-screen camera overlay using @zxing/library for QR decoding.
 * Uses native getUserMedia — no DOM-injecting side effects.
 */
const QrScannerOverlay = ({ onScan, onClose, language }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');

  const handleClose = useCallback(async () => {
    try {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
    } catch { /* ignore */ }
    onClose();
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // Enumerate cameras, prefer rear
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        let deviceId;
        if (devices && devices.length > 0) {
          const rear = devices.find(d => /back|rear|environment/i.test(d.label));
          deviceId = rear ? rear.deviceId : devices[devices.length - 1].deviceId;
        }

        if (cancelled) return;

        await reader.decodeFromVideoDevice(
          deviceId || undefined,
          videoRef.current,
          (result, err) => {
            if (result && !cancelled) {
              cancelled = true;
              try { reader.reset(); readerRef.current = null; } catch { }
              onScan(result.getText());
            }
          }
        );

        if (!cancelled) setStarted(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            language === 'vi'
              ? 'Không thể mở camera. Vui lòng cấp quyền camera cho trình duyệt.'
              : 'Cannot access camera. Please allow camera permission in your browser.'
          );
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      try {
        if (readerRef.current) {
          readerRef.current.reset();
          readerRef.current = null;
        }
      } catch { }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      style={{ touchAction: 'none' }}
    >
      {/* ── TOP BAR ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/10 safe-top">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">qr_code_scanner</span>
          </div>
          <div>
            <p className="font-label-sm text-[11px] text-primary uppercase tracking-widest leading-none">
              {language === 'vi' ? 'QUÉT MÃ QR' : 'QR SCANNER'}
            </p>
            <p className="text-white/40 text-[11px] mt-0.5">
              {language === 'vi' ? 'Hướng camera vào mã QR' : 'Aim camera at QR code'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20"
        >
          <span className="material-symbols-outlined text-white text-[20px]">close</span>
        </button>
      </div>

      {/* ── CAMERA VIEWPORT ── */}
      <div className="flex-1 relative overflow-hidden bg-black min-h-0">
        {/* Video element — takes full area */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Dark vignette mask with transparent center hole */}
        {started && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Semi-dark surround */}
            <div className="absolute inset-0 bg-black/50" style={{
              maskImage: 'radial-gradient(ellipse 60vmin 60vmin at 50% 50%, transparent 0%, transparent 40%, black 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60vmin 60vmin at 50% 50%, transparent 0%, transparent 40%, black 70%)',
            }} />

            {/* Corner brackets */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: '65vmin', height: '65vmin', maxWidth: '280px', maxHeight: '280px' }}>
                {[
                  'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg',
                  'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg',
                  'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg',
                  'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-7 h-7 border-primary ${cls}`} />
                ))}

                {/* Animated scan line */}
                <div
                  className="absolute left-2 right-2 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #4645D7, #9EFEFD, #4645D7, transparent)',
                    boxShadow: '0 0 12px rgba(70,69,215,0.9)',
                    animation: 'qrScanLine 1.8s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* Tip text */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <span className="bg-black/60 text-white/60 text-[11px] px-4 py-2 rounded-full font-label-sm uppercase tracking-widest">
                {language === 'vi' ? 'Đưa mã QR vào khung' : 'Align QR code within frame'}
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {!started && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
            <p className="text-white/60 font-label-sm text-[12px] uppercase tracking-widest">
              {language === 'vi' ? 'Đang mở camera...' : 'Opening camera...'}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center bg-black">
            <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-error">videocam_off</span>
            </div>
            <p className="text-white/80 text-[14px] leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      {/* ── BOTTOM BAR — second close button ── */}
      <div className="flex-shrink-0 px-4 py-4 bg-black/90 border-t border-white/10 safe-bottom">
        <button
          onClick={handleClose}
          className="w-full flex items-center justify-center gap-2 border border-white/20 rounded-xl py-4 text-white/80 font-label-sm text-[13px] uppercase tracking-widest active:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          {language === 'vi' ? 'Thoát quét mã' : 'Exit Scanner'}
        </button>
      </div>

      {/* Scan line keyframe */}
      <style>{`
        @keyframes qrScanLine {
          0%   { top: 6%; opacity: 1; }
          49%  { top: 94%; opacity: 1; }
          50%  { top: 94%; opacity: 0; }
          51%  { top: 6%;  opacity: 0; }
          52%  { top: 6%;  opacity: 1; }
          100% { top: 6%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QrScannerOverlay;
