import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

/**
 * QrScannerOverlay — iOS + Android compatible
 *
 * Uses native getUserMedia (triggers iOS permission dialog correctly)
 * + jsQR for frame-by-frame decoding via canvas.
 *
 * Why not @zxing/library?
 *   Dynamic import breaks the user-gesture chain on iOS Safari,
 *   so the browser silently refuses the camera request without prompting.
 */
const QrScannerOverlay = ({ onScan, onClose, language }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);
  const doneRef   = useRef(false);           // prevents double-fire

  const [started, setStarted] = useState(false);
  const [error,   setError]   = useState('');

  /* ── Stop everything ── */
  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  /* ── Close handler ── */
  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  /* ── Scan loop: reads video frames → jsQR ── */
  const tick = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || doneRef.current) return;

    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w > 0 && h > 0) {
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, w, h);
        const img  = ctx.getImageData(0, 0, w, h);
        const code = jsQR(img.data, img.width, img.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code && code.data) {
          doneRef.current = true;
          stopCamera();
          onScan(code.data);
          return;
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [stopCamera, onScan]);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    setError('');
    try {
      // iOS requires HTTPS (or localhost) + user-gesture context.
      // Calling getUserMedia directly (not inside dynamic import) is the key.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // rear cam on phones
          width:  { ideal: 1280 },
          height: { ideal: 720  },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) { stopCamera(); return; }

      video.srcObject = stream;

      // iOS Safari requires the video to have playsinline + be played programmatically
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      await video.play();

      setStarted(true);
      rafRef.current = requestAnimationFrame(tick);

    } catch (err) {
      // Map browser error names to user-facing messages
      const vi = language === 'vi';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(vi
          ? 'Quyền camera bị từ chối.\nTrên iPhone: Cài đặt → Safari → Camera → Cho phép'
          : 'Camera permission denied.\niPhone: Settings → Safari → Camera → Allow');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(vi ? 'Không tìm thấy camera trên thiết bị.' : 'No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setError(vi ? 'Camera đang được dùng bởi ứng dụng khác.' : 'Camera is in use by another app.');
      } else if (err.name === 'OverconstrainedError') {
        // Retry without facingMode constraint
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallback;
          const video = videoRef.current;
          if (video) {
            video.srcObject = fallback;
            video.setAttribute('playsinline', '');
            await video.play();
            setStarted(true);
            rafRef.current = requestAnimationFrame(tick);
          }
        } catch {
          setError(vi ? 'Không thể truy cập camera.' : 'Cannot access camera.');
        }
      } else {
        setError(vi
          ? `Lỗi camera: ${err.message || err.name}`
          : `Camera error: ${err.message || err.name}`);
      }
    }
  }, [language, stopCamera, tick]);

  useEffect(() => {
    // No setTimeout — call synchronously so iOS keeps the user-gesture context alive
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vi = language === 'vi';

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      style={{ touchAction: 'none' }}
    >
      {/* Hidden canvas for jsQR decoding */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── TOP BAR ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">qr_code_scanner</span>
          </div>
          <div>
            <p className="font-label-sm text-[11px] text-primary uppercase tracking-widest leading-none">
              {vi ? 'QUÉT MÃ QR' : 'QR SCANNER'}
            </p>
            <p className="text-white/40 text-[11px] mt-0.5">
              {vi ? 'Hướng camera vào mã QR' : 'Aim camera at QR code'}
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
        {/* Native video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Overlay UI — only show when camera is running */}
        {started && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark vignette with clear centre */}
            <div
              className="absolute inset-0 bg-black/55"
              style={{
                maskImage:
                  'radial-gradient(ellipse 62vmin 62vmin at 50% 48%, transparent 0%, transparent 38%, black 68%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 62vmin 62vmin at 50% 48%, transparent 0%, transparent 38%, black 68%)',
              }}
            />

            {/* Corner brackets */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '6%' }}>
              <div className="relative" style={{ width: '62vmin', height: '62vmin', maxWidth: '260px', maxHeight: '260px' }}>
                {[
                  'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl',
                  'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl',
                  'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl',
                  'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-primary ${cls}`} />
                ))}

                {/* Animated laser line */}
                <div
                  className="absolute left-3 right-3 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #4645D7 20%, #9EFEFD 50%, #4645D7 80%, transparent)',
                    boxShadow: '0 0 14px rgba(158,254,253,0.7)',
                    animation: 'qrLaser 1.8s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* Tip text */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <span className="bg-black/70 text-white/50 text-[11px] px-4 py-1.5 rounded-full font-label-sm uppercase tracking-widest">
                {vi ? 'Đưa mã QR vào khung' : 'Align QR code within frame'}
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {!started && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
            <p className="text-white/60 font-label-sm text-[12px] uppercase tracking-widest text-center px-8">
              {vi ? 'Đang mở camera...' : 'Opening camera...'}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center bg-black">
            <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-error">videocam_off</span>
            </div>
            <p className="text-white/80 text-[14px] leading-relaxed whitespace-pre-line">{error}</p>
            {/* iOS-specific instruction */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-left max-w-xs w-full">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-label-sm">
                {vi ? 'Hướng dẫn iPhone' : 'iPhone instructions'}
              </p>
              <p className="text-white/70 text-[12px] leading-relaxed">
                {vi
                  ? '1. Mở Cài đặt\n2. Kéo xuống chọn Safari\n3. Chọn Camera → Cho phép\n4. Quay lại và thử lại'
                  : '1. Open Settings\n2. Scroll down → Safari\n3. Camera → Allow\n4. Return here and retry'}
              </p>
            </div>
            <button
              onClick={() => { setError(''); startCamera(); }}
              className="bg-primary text-white px-8 py-3 rounded-xl font-label-sm text-[12px] uppercase tracking-widest"
            >
              {vi ? 'Thử lại' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM BAR — second close button ── */}
      <div className="flex-shrink-0 px-4 py-4 bg-black/90 border-t border-white/10">
        <button
          onClick={handleClose}
          className="w-full flex items-center justify-center gap-2 border border-white/20 rounded-xl py-4 text-white/80 font-label-sm text-[13px] uppercase tracking-widest active:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          {vi ? 'Thoát quét mã' : 'Exit Scanner'}
        </button>
      </div>

      {/* Laser keyframe */}
      <style>{`
        @keyframes qrLaser {
          0%   { top: 5%;  opacity: 1; }
          48%  { top: 95%; opacity: 1; }
          50%  { top: 95%; opacity: 0; }
          52%  { top: 5%;  opacity: 0; }
          54%  { top: 5%;  opacity: 1; }
          100% { top: 5%;  opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QrScannerOverlay;
