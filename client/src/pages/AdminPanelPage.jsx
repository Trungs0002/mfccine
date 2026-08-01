import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import QrScannerOverlay from '../components/QrScannerOverlay';
import {
  buildSeats, CANVAS_W, CANVAS_H, CX, STAGE_W, STAGE_Y, STAGE_H, STAGE_BOT, RUNWAY_W, TOP_SECT_H, STAGE_RISER,
  TOP_RIGHT_X, TOP_BLOCK_W, TOP_SECT_Y,
  TOP_ROWS, ROW_PITCH, S, TOP_LEFT_X, ROW_LABEL_W, BOT_ROWS, BOT_SECT_Y, BOT_LEFT_X, BOT_RIGHT_X, BOT_BLOCK_W, TOP_COLS, TOP_COL_PITCH, BOT_COLS, BOT_SECT_H, COL_PITCH
} from '../utils/seatMap';

const fieldLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 };
const sectionLabelStyle = { fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' };

// The event's date is always entered/displayed as Vietnam wall-clock time (UTC+7, no DST),
// regardless of the admin's or server's own timezone - otherwise the datetime-local input
// (which has no timezone of its own) silently gets read/written as UTC and the saved time
// drifts by 7 hours from what was actually typed.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const toVnDatetimeLocal = (utcDate) => new Date(new Date(utcDate).getTime() + VN_OFFSET_MS).toISOString().slice(0, 16);
const fromVnDatetimeLocal = (value) => new Date(new Date(`${value}Z`).getTime() - VN_OFFSET_MS).toISOString();

export const generateEmailHTML = (emailModalData) => {
  if (!emailModalData || !emailModalData.booking) return '';
  const link = `https://mfcftu.site/ticket?id=${emailModalData.booking._id}&seats=${emailModalData.selectedSeats.join(',')}`;
  const orderRef = emailModalData.booking._id.toString().toUpperCase().slice(-8);
  const customerName = emailModalData.customerName || emailModalData.booking.fullName || 'Quý khách';
  const supportEmail = 'hienanhngn.mfc@gmail.com';
  const facebookUrl = 'https://facebook.com/mfcfashionshow';
  const eventImageUrl = 'https://res.cloudinary.com/dxlhalj80/image/upload/w_600,q_auto/v1785235186/mfc_gmail_banner.jpg';

  let customMessageHtml = '';
  if (emailModalData.body && emailModalData.body.trim()) {
    customMessageHtml = `<div style="padding: 15px; background: #fff5eb; border-left: 4px solid #ff9f43; margin-bottom: 24px; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #d35400;"><strong>Lời nhắn từ BTC:</strong><br>${emailModalData.body.replace(/\\n/g, '<br>')}</p>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[MFC Fashion Show] Vé điện tử của bạn đã sẵn sàng</title>
</head>
<body contenteditable="true" style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6; color: #333333; outline: none;">
    <!-- Preheader -->
    <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; mso-hide: all;">
        Vui lòng mở email để xem, lưu và sử dụng vé khi check-in tại sự kiện.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>
    
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; width: 100%;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 40px 24px;">
                            <img src="${eventImageUrl}" alt="FTU Fashion Show 2026" width="600" style="width: 100%; max-width: 600px; display: block; border-radius: 8px; margin-bottom: 32px; height: auto;">
                            <p style="margin-top: 0; margin-bottom: 16px; font-size: 16px;">Thân gửi ${customerName},</p>
                            
                            <p style="margin-top: 0; margin-bottom: 30px; font-size: 16px;">Vé điện tử cho đơn hàng <strong>${orderRef}</strong> đã được phát hành thành công. Vui lòng nhấn vào nút bên dưới để xem và lưu vé của bạn để xuất trình khi check-in tại sự kiện.</p>
                            
                            ${customMessageHtml}

                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2c3e50; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 6px; text-transform: uppercase;">XEM VÉ ĐIỆN TỬ</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #666666;">Trong trường hợp nút phía trên không hoạt động, vui lòng sao chép và mở đường dẫn sau trên trình duyệt:</p>
                            <p style="margin-top: 0; margin-bottom: 32px; font-size: 14px; word-break: break-all;">
                                <a href="${link}" target="_blank" rel="noopener noreferrer" style="color: #2980b9; text-decoration: underline;">${link}</a>
                            </p>
                            
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid #eeeeee;">
                                <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 17px; color: #1a1a1a;">Thông tin sự kiện</h3>
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td width="35%" style="padding-bottom: 10px; font-size: 15px; color: #666666; vertical-align: top;">Tên sự kiện:</td>
                                        <td style="padding-bottom: 10px; font-size: 15px; font-weight: bold; color: #333333; vertical-align: top;">FTU Fashion Show 2026</td>
                                    </tr>
                                    <tr>
                                        <td width="35%" style="padding-bottom: 10px; font-size: 15px; color: #666666; vertical-align: top;">Thời gian:</td>
                                        <td style="padding-bottom: 10px; font-size: 15px; font-weight: bold; color: #333333; vertical-align: top;">18:00, ngày 22 tháng 8 năm 2026</td>
                                    </tr>
                                    <tr>
                                        <td width="35%" style="font-size: 15px; color: #666666; vertical-align: top;">Địa điểm:</td>
                                        <td style="font-size: 15px; font-weight: bold; color: #333333; vertical-align: top;">Trống Đồng Palace, số 2 Lãng Yên, Hà Nội</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; color: #1a1a1a;">Lưu ý khi tham dự:</h3>
                            <ul style="margin-top: 0; margin-bottom: 32px; padding-left: 20px; font-size: 15px; color: #444444; line-height: 1.7;">
                                <li style="margin-bottom: 6px;">Vui lòng xuất trình mã QR trên vé điện tử tại khu vực check-in.</li>
                                <li style="margin-bottom: 6px;">Mỗi mã QR chỉ có giá trị sử dụng một lần.</li>
                                <li style="margin-bottom: 6px;">Không chia sẻ hình ảnh vé hoặc mã QR với người khác.</li>
                                <li style="margin-bottom: 0;">Nên lưu vé về thiết bị trước khi đến sự kiện.</li>
                            </ul>
                            
                            <p style="margin-top: 0; margin-bottom: 32px; font-size: 15px; color: #333333; line-height: 1.6;">
                                Cảm ơn bạn đã đồng hành cùng FTU Fashion Show 2026. Sự hiện diện của bạn là niềm vinh hạnh và cũng là nguồn động lực để Ban Tổ chức mang đến một đêm trình diễn thời trang chỉn chu, sáng tạo và đáng nhớ.<br><br>
                                Hẹn gặp bạn tại FTU Fashion Show 2026!
                            </p>
                            
                            <p style="margin-top: 0; margin-bottom: 32px; font-size: 15px;">
                                <strong>Thông tin hỗ trợ:</strong><br>
                                Hotline: <a href="tel:0961972458" style="color: #2980b9; text-decoration: none;">0961972458</a><br>
                                Email: <a href="mailto:${supportEmail}" style="color: #2980b9; text-decoration: none;">${supportEmail}</a><br>
                                Fanpage: <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="color: #2980b9; text-decoration: none;">${facebookUrl}</a>
                            </p>
                            
                            <p style="margin-top: 0; margin-bottom: 0; font-size: 15px;">
                                Trân trọng,<br>
                                <strong>Ban Tổ chức MFC Fashion Show</strong><br>
                                MFC FTU
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="background-color: #f8f9fa; padding: 24px; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; font-size: 12px; color: #888888; text-align: center; line-height: 1.5;">
                                Email này được gửi tự động nhằm xác nhận và cung cấp vé điện tử cho đơn hàng của bạn. Vui lòng không chia sẻ mã QR hoặc thông tin vé với người khác.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

const AdminSeatMap = ({ matchedSeats, language }) => {
  const allSeats = React.useMemo(() => buildSeats(language === 'vi', 0, 0, 0), [language]);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const available = el.clientWidth;
      setScale(Math.min(1, available / CANVAS_W));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '20px 0', marginBottom: 20 }}>
      <div style={{
        position: 'relative', width: CANVAS_W, height: CANVAS_H, margin: '0 auto',
        transform: `scale(${scale})`, transformOrigin: 'top center'
      }}>
        {/* ── Stage (horizontal T-bar) ── */}
        <div style={{
          position: 'absolute', top: STAGE_Y, left: '50%',
          transform: 'translateX(-50%)', width: STAGE_W, zIndex: 20,
        }}>
          <div style={{
            height: STAGE_H,
            background: 'linear-gradient(135deg, rgba(30,32,70,.95), rgba(70,69,215,.3))',
            border: '1px solid rgba(168,150,246,.4)', borderBottom: 'none',
            clipPath: 'polygon(4% 0, 96% 0, 100% 100%, 0% 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 12px 18px -12px rgba(168,150,246,.4)',
            overflow: 'hidden', padding: '0 12px',
          }}>
            <span className="serif" style={{
              color: 'var(--purple)', letterSpacing: '.15em',
              fontWeight: 800, fontSize: 11, textTransform: 'uppercase',
              overflow: 'hidden', whiteSpace: 'nowrap',
              maxWidth: '100%', textAlign: 'center',
            }}>
              {language === 'vi' ? 'SÂN KHẤU' : 'STAGE'}
            </span>
          </div>
          <div style={{
            height: STAGE_RISER,
            background: 'linear-gradient(180deg, rgba(70,69,215,.35), rgba(10,11,30,.95))',
            borderLeft: '1px solid rgba(168,150,246,.4)',
            borderRight: '1px solid rgba(168,150,246,.4)',
            borderBottom: '1px solid rgba(168,150,246,.4)',
            borderRadius: '0 0 6px 6px',
          }} />
        </div>

        {/* ── Runway (T-bar vertical stem) ── */}
        <div style={{
          position: 'absolute',
          top: STAGE_BOT,
          left: CX - RUNWAY_W / 2,
          width: RUNWAY_W,
          height: TOP_SECT_H + 8,
          background: 'linear-gradient(180deg, rgba(14,16,44,.88), rgba(70,69,215,.18))',
          border: '1px solid rgba(168,150,246,.3)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          zIndex: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="serif" style={{
            color: 'rgba(168,150,246,.4)', letterSpacing: '.3em',
            fontWeight: 800, fontSize: 14, textTransform: 'uppercase',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)'
          }}>
            {language === 'vi' ? 'SÂN KHẤU' : 'STAGE'}
          </span>
        </div>
        
        {/* ── Row number labels — Top-Left block (left side) ── */}
        {Array.from({ length: TOP_ROWS }, (_, r) => (
          <div key={`tl-row-${r}`} style={{
            position: 'absolute',
            top: TOP_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
            left: TOP_LEFT_X - ROW_LABEL_W,
            width: ROW_LABEL_W - 4,
            height: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
            pointerEvents: 'none',
          }}>
            {r + 1}
          </div>
        ))}

        {/* ── Row number labels — Top-Right block (right side) ── */}
        {Array.from({ length: TOP_ROWS }, (_, r) => (
          <div key={`tr-row-${r}`} style={{
            position: 'absolute',
            top: TOP_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
            left: TOP_RIGHT_X + TOP_BLOCK_W + 4,
            width: ROW_LABEL_W - 4,
            height: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
            pointerEvents: 'none',
          }}>
            {r + 1}
          </div>
        ))}

        {/* ── Row number labels — Bottom-Left block (left side) ── */}
        {Array.from({ length: BOT_ROWS }, (_, r) => (
          <div key={`bl-row-${r}`} style={{
            position: 'absolute',
            top: BOT_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
            left: BOT_LEFT_X - ROW_LABEL_W,
            width: ROW_LABEL_W - 4,
            height: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
            pointerEvents: 'none',
          }}>
            {String.fromCharCode(65 + 16 + r)}
          </div>
        ))}

        {/* ── Row number labels — Bottom-Right block (right side) ── */}
        {Array.from({ length: BOT_ROWS }, (_, r) => (
          <div key={`br-row-${r}`} style={{
            position: 'absolute',
            top: BOT_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
            left: BOT_RIGHT_X + BOT_BLOCK_W + 4,
            width: ROW_LABEL_W - 4,
            height: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
            pointerEvents: 'none',
          }}>
            {String.fromCharCode(65 + 16 + r)}
          </div>
        ))}

        {/* ── Col number labels — Top-Left block (below) ── */}
        {Array.from({ length: TOP_COLS }, (_, c) => (
          <div key={`tl-col-${c}`} style={{
            position: 'absolute',
            top: TOP_SECT_Y + TOP_SECT_H + 4,
            left: TOP_LEFT_X + c * TOP_COL_PITCH,
            width: S,
            textAlign: 'center',
            fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
            pointerEvents: 'none',
          }}>
            {String.fromCharCode(65 + c)}
          </div>
        ))}

        {/* ── Col number labels — Top-Right block (below) ── */}
        {Array.from({ length: TOP_COLS }, (_, c) => (
          <div key={`tr-col-${c}`} style={{
            position: 'absolute',
            top: TOP_SECT_Y + TOP_SECT_H + 4,
            left: TOP_RIGHT_X + c * TOP_COL_PITCH,
            width: S,
            textAlign: 'center',
            fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
            pointerEvents: 'none',
          }}>
            {String.fromCharCode(65 + TOP_COLS + c)}
          </div>
        ))}

        {/* ── Col number labels — Bottom-Left block (below) ── */}
        {Array.from({ length: BOT_COLS }, (_, c) => (
          <div key={`bl-col-${c}`} style={{
            position: 'absolute',
            top: BOT_SECT_Y + BOT_SECT_H + 4,
            left: BOT_LEFT_X + c * COL_PITCH,
            width: S,
            textAlign: 'center',
            fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
            pointerEvents: 'none',
          }}>
            {c + 1}
          </div>
        ))}

        {/* ── Col number labels — Bottom-Right block (below) ── */}
        {Array.from({ length: BOT_COLS }, (_, c) => (
          <div key={`br-col-${c}`} style={{
            position: 'absolute',
            top: BOT_SECT_Y + BOT_SECT_H + 4,
            left: BOT_RIGHT_X + c * COL_PITCH,
            width: S,
            textAlign: 'center',
            fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
            pointerEvents: 'none',
          }}>
            {BOT_COLS + c + 1}
          </div>
        ))}

        {allSeats.map(s => {
          const matchedInfo = matchedSeats.find(ms => ms.seatId === s.id);
          const isMatched = !!matchedInfo;
          
          let bgColor = 'rgba(255,255,255,0.1)';
          if (isMatched) {
            bgColor = matchedInfo.type === 'Nhất Ảnh' ? '#a896f6' : matchedInfo.type === 'Khởi Ảnh' ? '#5aaddc' : matchedInfo.type === 'Hoàn Ảnh' ? '#10b981' : '#ffb800';
          }

          return (
            <div key={s.id} style={{
              position: 'absolute', left: s.x, top: s.y, width: 16, height: 16, borderRadius: '50%',
              background: bgColor,
              boxShadow: isMatched ? `0 0 15px 5px ${bgColor}` : 'none',
              animation: isMatched ? 'blinkSeat 0.6s infinite alternate' : 'none',
              zIndex: isMatched ? 10 : 1
            }}></div>
          );
        })}
      </div>

      {/* Minimap (Area Guide) on the top left */}
      <div className="admin-minimap" style={{
        position: 'absolute', top: 20, left: 20, zIndex: 40,
        background: 'rgba(10, 11, 30, 0.95)',
        border: '1px solid rgba(168,150,246, 0.4)',
        boxShadow: '0 8px 32px rgba(168,150,246, 0.25)',
        borderRadius: 16,
        padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        alignItems: 'center',
        pointerEvents: 'none',
        minWidth: 180
      }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
          {language === 'vi' ? 'Sơ đồ khu vực' : 'Area Map'}
        </div>
        
        <div style={{ position: 'relative', width: 100, height: 90, margin: '18px auto 18px', transform: 'scale(1.4)', transformOrigin: 'center' }}>
          {/* Sân khấu (Stage) */}
          <div style={{ position: 'absolute', top: 0, left: 30, width: 40, height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 2 }} />
          {/* Runway (Đường băng) */}
          <div style={{ position: 'absolute', top: 6, left: 46, width: 8, height: 46, background: 'rgba(255,255,255,.15)', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />

          {/* Khu 1 */}
          <div style={{ position: 'absolute', top: 15, left: 16, width: 26, height: 46, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 600 }}>1</div>
          
          {/* Khu 2 */}
          <div style={{ position: 'absolute', top: 15, left: 58, width: 26, height: 46, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 600 }}>2</div>
          
          {/* Khu 3 */}
          <div style={{ position: 'absolute', top: 67, left: 0, width: 46, height: 23, background: 'rgba(168,150,246,.12)', border: '1px solid rgba(168,150,246,.3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--purple)', fontWeight: 600 }}>3</div>
          
          {/* Khu 4 */}
          <div style={{ position: 'absolute', top: 67, left: 54, width: 46, height: 23, background: 'rgba(168,150,246,.12)', border: '1px solid rgba(168,150,246,.3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--purple)', fontWeight: 600 }}>4</div>
        </div>
      </div>

      {/* Floating Info Box on the top right (next to Khu 2) */}
      {matchedSeats.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(10, 11, 30, 0.95)',
          border: '1px solid rgba(168,150,246, 0.4)',
          boxShadow: '0 8px 32px rgba(168,150,246, 0.25)',
          borderRadius: 16,
          padding: '20px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
          minWidth: 180
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
            {language === 'vi' ? 'Vị trí ghế ngồi' : 'Seat Location'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {matchedSeats.map((s, i) => {
              const bgColor = s.type === 'Nhất Ảnh' ? '#a896f6' : s.type === 'Khởi Ảnh' ? '#5aaddc' : s.type === 'Hoàn Ảnh' ? '#10b981' : '#ffb800';
              return (
                <div key={i} style={{
                  padding: '12px 16px', borderRadius: 12, 
                  background: `rgba(255,255,255,0.05)`, border: `1px solid ${bgColor}`, color: bgColor,
                  textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  <span style={{ fontSize: 24, fontWeight: 900 }}>{s.seatId}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, letterSpacing: '.05em' }}>• {s.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes blinkSeat { from { opacity: 0.3; transform: scale(1); } to { opacity: 1; transform: scale(1.6); } }
      `}</style>
    </div>
  );
};

const AdminPanelPage = ({ events, setEvents, settings, setSettings, user }) => {
  const { language, t } = useLanguage();
  const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + (language === 'vi' ? 'đ' : ' VND');
  const isStaff = user?.role === 'staff'; // staff accounts only see Bookings & Applications
  const [activeAdminTab, setActiveTab] = useState(isStaff ? 'bookings' : 'events'); // 'events', 'bookings', 'coupons', 'applications', or 'staff'
  const [showEventForm, setShowEventForm] = useState(false); // Controls visibility of the Create/Edit form

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    checkedInCount: 0,
    totalBookingsCount: 0
  });

  // Site Branding states
  const [siteName, setSiteName] = useState(settings?.siteName || 'MFC & FASHION CLUB');
  const [siteTagline, setSiteTagline] = useState(settings?.siteTagline || 'FOREIGN TRADE UNIVERSITY');
  const [ticketSalesEnabled, setTicketSalesEnabled] = useState(settings?.ticketSalesEnabled !== false);
  const [adminTestSalesEnabled, setAdminTestSalesEnabled] = useState(settings?.adminTestSalesEnabled !== false);
  const [recruitFormEnabled, setRecruitFormEnabled] = useState(settings?.recruitFormEnabled || false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Bilingual Event Management states
  const [editingEventId, setEditingEventId] = useState(null);
  const [titleEn, setTitleEn] = useState('');
  const [titleVi, setTitleVi] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descVi, setDescVi] = useState('');
  const [date, setDate] = useState('');
  const [locEn, setLocEn] = useState('');
  const [locVi, setLocVi] = useState('');
  const [venueEn, setVenueEn] = useState('');
  const [venueVi, setVenueVi] = useState('');
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');

  // Custom Bilingual Tier states
  const [tiers, setTiers] = useState({
    standard: { labelEn: 'Hoàn Ảnh', labelVi: 'Hoàn Ảnh', descEn: 'General admission pass.', descVi: 'Vé vào cửa tiêu chuẩn.', price: 150000 },
    premium: { labelEn: 'Khởi Ảnh', labelVi: 'Khởi Ảnh', descEn: 'Premium seating.', descVi: 'Vị trí ngồi cao cấp.', price: 250000 },
    vip: { labelEn: 'Nhất Ảnh', labelVi: 'Nhất Ảnh', descEn: 'Exclusive front row access.', descVi: 'Quyền lợi hàng ghế đầu độc quyền.', price: 500000 }
  });

  // Dynamic Schedule state
  const [schedule, setSchedule] = useState([{ time: '19:00', titleEn: 'Arrival', titleVi: 'Đón khách', descEn: 'Red Carpet', descVi: 'Thảm đỏ' }]);

  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Booking Management states
  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editBookingName, setEditBookingName] = useState('');
  const [editBookingEmail, setEditBookingEmail] = useState('');

  // QR Scanning state
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scanInputRef = React.useRef(null);

  // Auto-submit when exactly 11 chars starting with MFC (for physical barcode scanners)
  useEffect(() => {
    if (scanBookingId.length === 11 && scanBookingId.toUpperCase().startsWith('MFC')) {
      handleCheckIn(scanBookingId.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanBookingId]);

  // Discount code management states
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('');
  const [newCouponMaxSeats, setNewCouponMaxSeats] = useState('');
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  // Recruitment application (CTV) management states
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationDeptFilter, setApplicationDeptFilter] = useState('all');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [expandedApplicationId, setExpandedApplicationId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({}); // { [applicationId]: draft text }
  const staffName = user?.fullName || user?.email || '';

  // Staff account management states (admin-only tab)
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [loadingStaffAccounts, setLoadingStaffAccounts] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [creatingStaff, setCreatingStaff] = useState(false);

  // "Nhất" design contest submissions (admin-only tab)
  const [nhatSubmissions, setNhatSubmissions] = useState([]);
  const [loadingNhatSubmissions, setLoadingNhatSubmissions] = useState(false);
  const [expandedNhatId, setExpandedNhatId] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Casting Call Model submissions
  const [castingSubmissions, setCastingSubmissions] = useState([]);
  const [loadingCastingSubmissions, setLoadingCastingSubmissions] = useState(false);
  const [expandedCastingId, setExpandedCastingId] = useState(null);

  const [emailModalData, setEmailModalData] = useState(null);

  const fetchAnalytics = () => {
    fetch(`${API_URL}/api/analytics`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching analytics:', err));
  };

  const fetchAllBookings = (silent = false) => {
    if (!silent) setLoadingBookings(true);
    fetch(`${API_URL}/api/bookings`)
      .then(res => res.json())
      .then(data => {
        setAllBookings(data);
        if (!silent) setLoadingBookings(false);
      })
      .catch(() => { if (!silent) setLoadingBookings(false); });
  };

  const fetchCoupons = (silent = false) => {
    if (!silent) setLoadingCoupons(true);
    fetch(`${API_URL}/api/coupons`)
      .then(res => res.json())
      .then(data => {
        setCoupons(data);
        if (!silent) setLoadingCoupons(false);
      })
      .catch(() => { if (!silent) setLoadingCoupons(false); });
  };

  const fetchApplications = (silent = false) => {
    if (!silent) setLoadingApplications(true);
    fetch(`${API_URL}/api/applications`)
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        if (!silent) setLoadingApplications(false);
      })
      .catch(() => { if (!silent) setLoadingApplications(false); });
  };

  const fetchStaffAccounts = (silent = false) => {
    if (!silent) setLoadingStaffAccounts(true);
    fetch(`${API_URL}/api/users?role=staff`)
      .then(res => res.json())
      .then(data => {
        setStaffAccounts(data);
        if (!silent) setLoadingStaffAccounts(false);
      })
      .catch(() => { if (!silent) setLoadingStaffAccounts(false); });
  };

  const fetchNhatSubmissions = (silent = false) => {
    if (!silent) setLoadingNhatSubmissions(true);
    fetch(`${API_URL}/api/nhat-submissions`)
      .then(res => res.json())
      .then(data => {
        setNhatSubmissions(data);
        if (!silent) setLoadingNhatSubmissions(false);
      })
      .catch(() => { if (!silent) setLoadingNhatSubmissions(false); });
  };

  const handleDeleteNhatSubmission = async (id) => {
    if (!window.confirm(language === 'vi' ? 'Xóa bài dự thi này?' : 'Delete this submission?')) return;
    const res = await fetch(`${API_URL}/api/nhat-submissions/${id}`, { method: 'DELETE' });
    if (res.ok) setNhatSubmissions(nhatSubmissions.filter(s => s._id !== id));
  };

  const fetchCastingSubmissions = (silent = false) => {
    if (!silent) setLoadingCastingSubmissions(true);
    fetch(`${API_URL}/api/casting-call-submissions`)
      .then(res => res.json())
      .then(data => {
        setCastingSubmissions(Array.isArray(data) ? data : []);
        if (!silent) setLoadingCastingSubmissions(false);
      })
      .catch(() => { if (!silent) setLoadingCastingSubmissions(false); });
  };

  const handleDeleteCastingSubmission = async (id) => {
    if (!window.confirm(language === 'vi' ? 'Xóa đơn đăng ký này?' : 'Delete this submission?')) return;
    const res = await fetch(`${API_URL}/api/casting-call-submissions/${id}`, { method: 'DELETE' });
    if (res.ok) setCastingSubmissions(castingSubmissions.filter(s => s._id !== id));
  };

  useEffect(() => {
    fetchAnalytics();
    if (activeAdminTab === 'bookings') fetchAllBookings();
    if (activeAdminTab === 'coupons') fetchCoupons();
    if (activeAdminTab === 'applications') fetchApplications();
    if (activeAdminTab === 'staff') fetchStaffAccounts();
    if (activeAdminTab === 'nhat') fetchNhatSubmissions();
    if (activeAdminTab === 'casting') fetchCastingSubmissions();
  }, [events, activeAdminTab]);

  // Auto-sync the history tabs (bookings ledger, CTV applications, coupons, staff, Nhất entries)
  // every 5s — no manual reload needed. Uses the silent flag so the periodic refresh swaps data
  // in place instead of flashing the loading placeholder over the list every 5s (was causing visible jitter).
  useEffect(() => {
    let fetchFn = null;
    if (activeAdminTab === 'bookings') fetchFn = () => fetchAllBookings(true);
    if (activeAdminTab === 'applications') fetchFn = () => fetchApplications(true);
    if (activeAdminTab === 'coupons') fetchFn = () => fetchCoupons(true);
    if (activeAdminTab === 'staff') fetchFn = () => fetchStaffAccounts(true);
    if (activeAdminTab === 'nhat') fetchFn = () => fetchNhatSubmissions(true);
    if (activeAdminTab === 'casting') fetchFn = () => fetchCastingSubmissions(true);
    if (!fetchFn) return;
    const interval = setInterval(fetchFn, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdminTab]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) return;
    setCreatingStaff(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newStaffName.trim(), email: newStaffEmail.trim(), password: newStaffPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStaffAccounts([data, ...staffAccounts]);
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffPassword('');
      } else {
        alert(data.error || 'Failed to create staff account.');
      }
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm(language === 'vi' ? 'Xóa tài khoản nhân viên này?' : 'Delete this staff account?')) return;
    const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) setStaffAccounts(staffAccounts.filter(s => s._id !== id));
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm(language === 'vi' ? 'Xóa đơn ứng tuyển này?' : 'Delete this application?')) return;
    const res = await fetch(`${API_URL}/api/applications/${id}`, { method: 'DELETE' });
    if (res.ok) setApplications(applications.filter(a => a._id !== id));
  };

  const handleAddNote = async (applicationId) => {
    const message = (noteDrafts[applicationId] || '').trim();
    if (!staffName.trim() || !message) return;
    const res = await fetch(`${API_URL}/api/applications/${applicationId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: staffName.trim(), message }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApplications(applications.map(a => a._id === applicationId ? updated : a));
      setNoteDrafts(d => ({ ...d, [applicationId]: '' }));
    }
  };

  const handleUpdateStatus = async (application, status) => {
    const res = await fetch(`${API_URL}/api/applications/${application._id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolvedBy: status !== 'pending' ? staffName : null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApplications(applications.map(a => a._id === application._id ? updated : a));
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponPercent) return;
    setSubmittingCoupon(true);
    try {
      const res = await fetch(`${API_URL}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode.trim(),
          percent: Number(newCouponPercent),
          maxSeats: newCouponMaxSeats ? Number(newCouponMaxSeats) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons([data, ...coupons]);
        setNewCouponCode('');
        setNewCouponPercent('');
        setNewCouponMaxSeats('');
      } else {
        alert(data.error || 'Failed to create code.');
      }
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    const res = await fetch(`${API_URL}/api/coupons/${coupon._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons(coupons.map(c => c._id === coupon._id ? data : c));
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this discount code?')) return;
    const res = await fetch(`${API_URL}/api/coupons/${id}`, { method: 'DELETE' });
    if (res.ok) setCoupons(coupons.filter(c => c._id !== id));
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName, siteTagline, contactEmail: 'support@ftufashionshow.com', ticketSalesEnabled, adminTestSalesEnabled, recruitFormEnabled })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        alert('Branding updated.');
        setUpdatingSettings(false);
      })
      .catch(() => setUpdatingSettings(false));
  };

  const handleEditClick = (evt) => {
    setEditingEventId(evt._id);

    // Safely extract values handling both string (old) and object (new) formats
    const getVal = (field, lang) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      return field[lang] || '';
    };

    setTitleEn(getVal(evt.title, 'en'));
    setTitleVi(getVal(evt.title, 'vi'));
    setDescEn(getVal(evt.description, 'en'));
    setDescVi(getVal(evt.description, 'vi'));

    if (evt.date) {
      setDate(toVnDatetimeLocal(evt.date));
    }

    setLocEn(getVal(evt.location, 'en'));
    setLocVi(getVal(evt.location, 'vi'));
    setVenueEn(getVal(evt.venueName, 'en'));
    setVenueVi(getVal(evt.venueName, 'vi'));

    const mappedTiers = {};
    ['standard', 'premium', 'vip'].forEach(key => {
      const tData = evt.pricingTiers?.[key] || {};
      mappedTiers[key] = {
        labelEn: getVal(tData.label, 'en'),
        labelVi: getVal(tData.label, 'vi'),
        descEn: getVal(tData.description, 'en'),
        descVi: getVal(tData.description, 'vi'),
        price: tData.price || 0
      };
    });
    setTiers(mappedTiers);

    if (evt.schedule && evt.schedule.length > 0) {
      setSchedule(evt.schedule.map(s => ({
        time: s.time,
        titleEn: getVal(s.title, 'en'),
        titleVi: getVal(s.title, 'vi'),
        descEn: getVal(s.description, 'en'),
        descVi: getVal(s.description, 'vi')
      })));
    } else {
      setSchedule([{ time: '19:00', titleEn: '', titleVi: '', descEn: '', descVi: '' }]);
    }

    setImage(null);
    setImageName('');
    setShowEventForm(true);

    setTimeout(() => {
      const el = document.getElementById('event-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitleEn(''); setTitleVi('');
    setDescEn(''); setDescVi('');
    setDate('');
    setLocEn(''); setLocVi('');
    setVenueEn(''); setVenueVi('');
    setTiers({
      standard: { labelEn: 'Hoàn Ảnh', labelVi: 'Hoàn Ảnh', descEn: 'General admission pass.', descVi: 'Vé vào cửa tiêu chuẩn.', price: 150000 },
      premium: { labelEn: 'Khởi Ảnh', labelVi: 'Khởi Ảnh', descEn: 'Premium seating.', descVi: 'Vị trí ngồi cao cấp.', price: 250000 },
      vip: { labelEn: 'Nhất Ảnh', labelVi: 'Nhất Ảnh', descEn: 'Exclusive front row access.', descVi: 'Quyền lợi hàng ghế đầu độc quyền.', price: 500000 }
    });
    setSchedule([{ time: '19:00', titleEn: 'Arrival', titleVi: 'Đón khách', descEn: 'Red Carpet', descVi: 'Thảm đỏ' }]);
    setImage(null);
    setImageName('');
    setShowEventForm(false);
  };

  const handleAddNewEvent = () => {
    resetForm();
    setShowEventForm(true);
    setTimeout(() => {
      const el = document.getElementById('event-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const updateTierField = (tierKey, field, val) => {
    setTiers({
      ...tiers,
      [tierKey]: { ...tiers[tierKey], [field]: val }
    });
  };

  const addScheduleItem = () => setSchedule([...schedule, { time: '20:00', titleEn: '', titleVi: '', descEn: '', descVi: '' }]);
  const removeScheduleItem = (idx) => setSchedule(schedule.filter((_, i) => i !== idx));

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);

    const formattedTiers = {};
    ['standard', 'premium', 'vip'].forEach(key => {
      const t = tiers[key];
      formattedTiers[key] = {
        label: { en: t.labelEn, vi: t.labelVi },
        description: { en: t.descEn, vi: t.descVi },
        price: Number(t.price),
        capacity: key === 'standard' ? 250 : key === 'premium' ? 150 : 50
      };
    });

    const formattedSchedule = schedule.map(s => ({
      time: s.time,
      title: { en: s.titleEn, vi: s.titleVi },
      description: { en: s.descEn, vi: s.descVi }
    }));

    const eventData = {
      title: { en: titleEn, vi: titleVi },
      description: { en: descEn, vi: descVi },
      date: fromVnDatetimeLocal(date),
      location: { en: locEn, vi: locVi },
      venueName: { en: venueEn, vi: venueVi },
      image,
      pricingTiers: formattedTiers,
      schedule: formattedSchedule
    };

    const url = editingEventId ? `${API_URL}/api/events/${editingEventId}` : `${API_URL}/api/events`;
    const method = editingEventId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (res.ok) {
        if (editingEventId) setEvents(events.map(ev => ev._id === editingEventId ? data : ev));
        else setEvents([...events, data]);
        alert('Success.');
        resetForm();
      }
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Archive this event?')) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(ev => ev._id !== id));
        alert('Archived.');
      }
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBookingId(booking._id);
    setEditBookingName(booking.fullName);
    setEditBookingEmail(booking.email);
  };

  const saveBookingEdit = async () => {
    const res = await fetch(`${API_URL}/api/bookings/${editingBookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: editBookingName, email: editBookingEmail })
    });
    if (res.ok) {
      setAllBookings(allBookings.map(b => b._id === editingBookingId ? { ...b, fullName: editBookingName, email: editBookingEmail } : b));
      setEditingBookingId(null);
      alert('Ticket updated.');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Cancel and delete this ticket permanently?')) return;
    const res = await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAllBookings(allBookings.filter(b => b._id !== id));
      fetchAnalytics();
      alert('Ticket deleted.');
    }
  };

  const handleCheckIn = async (code) => {
    const idToScan = code || scanBookingId;
    if (!idToScan.trim()) return;
    
    // For physical scanners: Immediately clear the input so any new keystrokes 
    // during the API call don't get accidentally wiped out at the end.
    setScanBookingId('');
    setScanning(true);
    
    try {
      const res = await fetch(`${API_URL}/api/bookings/check-in/${idToScan.trim()}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // status: 'valid' — newly checked in
        setScanResult({ status: 'valid', message: data.message, details: data.booking, scannedTicketCode: idToScan.trim() });
        fetchAnalytics();
      } else if (data.status === 'already_used') {
        // status: 'already_used' — ticket was already scanned before
        setScanResult({ status: 'already_used', message: data.error, details: data.booking, scannedTicketCode: idToScan.trim() });
      } else {
        // not found or server error
        setScanResult({ status: 'not_found', message: data.error || 'Ticket not found' });
      }
    } catch (err) {
      setScanResult({ status: 'not_found', message: 'Lỗi kết nối máy chủ / Server error' });
    } finally {
      setScanning(false);
      // Auto-refocus the input for continuous scanning
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    }
  };

  const ADMIN_TABS = [
    { id: 'events', icon: 'theater_comedy', label: t('manageEvents') },
    { id: 'bookings', icon: 'confirmation_number', label: t('manageTickets') },
    { id: 'coupons', icon: 'sell', label: language === 'vi' ? 'Mã giảm giá' : 'Discount Codes' },
    { id: 'applications', icon: 'assignment_ind', label: language === 'vi' ? 'Đơn ứng tuyển CTV' : 'CTV Applications' },
    { id: 'staff', icon: 'badge', label: language === 'vi' ? 'Nhân viên' : 'Staff' },
    { id: 'nhat', icon: 'checkroom', label: language === 'vi' ? 'Bài dự thi Nhất' : 'Nhất Entries' },
    { id: 'casting', icon: 'accessibility_new', label: language === 'vi' ? 'Đơn Casting Model' : 'Model Casting' },
  ].filter(tab => !isStaff || tab.id === 'bookings' || tab.id === 'applications' || tab.id === 'nhat' || tab.id === 'casting');

  const getStatCards = () => {
    if (activeAdminTab === 'events') {
      return [
        { label: t('activeShows'), value: analytics.activeEvents, icon: 'theater_comedy', color: 'var(--pink)' },
        { label: t('revenue'), value: formatPrice(analytics.totalRevenue), icon: 'payments', color: 'var(--purple)' },
        { label: t('ticketsSold'), value: analytics.ticketsSold, icon: 'confirmation_number', color: 'var(--mint)' },
      ];
    }
    if (activeAdminTab === 'bookings') {
      const totalTickets = allBookings.reduce((sum, b) => sum + (b.selectedSeats?.filter(s => s.status !== 'Cancelled').length || 0), 0);
      const checkedInTickets = allBookings.reduce((sum, b) => sum + (b.selectedSeats?.filter(s => s.status !== 'Cancelled' && s.isCheckedIn).length || 0), 0);
      return [
        {
          label: language === 'vi' ? 'Tổng số vé đã bán' : 'Total Tickets Sold', value: totalTickets, icon: 'confirmation_number', color: 'var(--purple)',
          onClick: () => document.getElementById('master-ledger-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
        { label: language === 'vi' ? 'Chưa check-in' : 'Not Checked-in', value: totalTickets - checkedInTickets, icon: 'schedule', color: '#ffb800' },
        { label: language === 'vi' ? 'Đã check-in' : 'Checked-in', value: checkedInTickets, icon: 'how_to_reg', color: 'var(--mint)' },
      ];
    }
    if (activeAdminTab === 'coupons') {
      const activeCount = coupons.filter(c => c.active).length;
      return [
        { label: language === 'vi' ? 'Tổng số mã' : 'Total Codes', value: coupons.length, icon: 'sell', color: 'var(--purple)' },
        { label: language === 'vi' ? 'Còn lượt dùng' : 'Still Active', value: activeCount, icon: 'check_circle', color: 'var(--mint)' },
        { label: language === 'vi' ? 'Hết lượt dùng' : 'Exhausted', value: coupons.length - activeCount, icon: 'block', color: '#ff6b6b' },
      ];
    }
    if (activeAdminTab === 'applications') {
      const passedCount = applications.filter(a => a.status === 'passed' || a.resolved).length;
      const failedCount = applications.filter(a => a.status === 'failed').length;
      const pendingCount = applications.length - passedCount - failedCount;
      return [
        { label: language === 'vi' ? 'Tổng số' : 'Total Applications', value: applications.length, icon: 'assignment_ind', color: 'var(--purple)' },
        { label: language === 'vi' ? 'Chưa xử lý' : 'Pending', value: pendingCount, icon: 'pending', color: '#ffb800' },
        { label: language === 'vi' ? 'Đậu' : 'Passed', value: passedCount, icon: 'task_alt', color: 'var(--mint)' },
        { label: language === 'vi' ? 'Trượt' : 'Failed', value: failedCount, icon: 'cancel', color: '#ff6b6b' },
      ];
    }
    if (activeAdminTab === 'nhat') {
      return [
        { label: language === 'vi' ? 'Tổng số bài dự thi' : 'Total Entries', value: nhatSubmissions.length, icon: 'checkroom', color: 'var(--purple)' },
      ];
    }
    if (activeAdminTab === 'casting') {
      return [
        { label: language === 'vi' ? 'Tổng đơn đăng ký' : 'Total Applications', value: castingSubmissions.length, icon: 'accessibility_new', color: 'var(--purple)' },
      ];
    }
    return [];
  };

  return (
    <>
      {/* Full-screen QR Scanner Overlay */}
      {showScanner && (
        <QrScannerOverlay
          language={language}
          onScan={(code) => {
            setShowScanner(false);
            handleCheckIn(code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Image zoom overlay */}
      {zoomedImage && (() => {
        const ext = /^data:image\/png/.test(zoomedImage.src) ? 'png' : 'jpg';
        return (
          <div
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(1,1,10,.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, cursor: 'zoom-out',
            }}
          >
            <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 16 }}>
              <a
                href={zoomedImage.src}
                download={`${zoomedImage.name}.${ext}`}
                onClick={e => e.stopPropagation()}
                title={language === 'vi' ? 'Tải ảnh chất lượng gốc' : 'Download original quality'}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>download</span>
              </a>
              <button
                onClick={() => setZoomedImage(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>close</span>
              </button>
            </div>
            <img src={zoomedImage.src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,.6)' }} />
          </div>
        );
      })()}

      <div className="animate-fade-in" style={{ paddingTop: 120, paddingBottom: 64 }}>
        <div className="container">

          {/* HEADER */}
          <div style={{ marginBottom: 24 }}>
            <h1 className="gradient-title" style={{ fontSize: 'clamp(26px, 4vw, 38px)', margin: '0 0 6px' }}>
              {t('adminCommandCenter')}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{t('adminSubtitle')}</p>
          </div>

          {/* TAB BAR */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {ADMIN_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 999,
                  border: activeAdminTab === tab.id ? '1px solid rgba(168,150,246,.8)' : '1px solid rgba(168,150,246,.22)',
                  background: activeAdminTab === tab.id ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(1,1,10,.4)',
                  color: activeAdminTab === tab.id ? '#fff' : 'var(--muted)',
                  fontSize: 13, fontWeight: activeAdminTab === tab.id ? 700 : 500,
                  cursor: 'pointer', transition: 'all .2s',
                  boxShadow: activeAdminTab === tab.id ? '0 0 20px rgba(168,150,246,.3)' : 'none',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* STAT CARDS — contextual to the active tab */}
          {(() => {
            const statCards = getStatCards();
            return statCards.length > 0 && (
              <div className="admin-analytics-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${statCards.length}, 1fr)`, gap: 16, marginBottom: 32 }}>
                {statCards.map((c, i) => (
                  <div
                    key={i}
                    className="mfc-card"
                    onClick={c.onClick}
                    style={{
                      padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12,
                      cursor: c.onClick ? 'pointer' : 'default',
                      transition: c.onClick ? 'border-color .2s' : undefined,
                    }}
                    onMouseEnter={c.onClick ? (e => e.currentTarget.style.borderColor = 'rgba(168,150,246,.6)') : undefined}
                    onMouseLeave={c.onClick ? (e => e.currentTarget.style.borderColor = '') : undefined}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168,150,246,.12)', color: c.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{c.icon}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4, whiteSpace: 'nowrap' }}>{c.label}</div>
                      <div className="serif" style={{ fontSize: 21, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {activeAdminTab === 'events' ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div className="mfc-card" style={{ padding: 26 }}>
                <h3 style={{ ...sectionLabelStyle, color: 'var(--mint)' }}>{t('websiteBranding')}</h3>
                <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <label style={fieldLabelStyle}>{t('siteName')}</label>
                    <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder={t('siteName')} className="mfc-input" required />
                  </div>
                  <div style={{ flex: '1 1 260px' }}>
                    <label style={fieldLabelStyle}>{language === 'vi' ? 'Chữ phụ (dưới tên site)' : 'Tagline (below site name)'}</label>
                    <input type="text" value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="FOREIGN TRADE UNIVERSITY" className="mfc-input" required />
                  </div>

                  <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(168,150,246,.28)', background: 'rgba(1,1,10,.4)' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                        {language === 'vi' ? 'Nhận đơn Tuyển CTV' : 'Accept CTV Applications'}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                        {language === 'vi'
                          ? 'Mở để cho phép gửi đơn ở trang Tuyển dụng. Tắt để đóng form và hiện thông báo kết thúc đợt tuyển.'
                          : 'Turn on to allow submissions on the Recruitment page. Turn off to close the form and show the expired message.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecruitFormEnabled(v => !v)}
                      style={{
                        position: 'relative', width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'all .3s',
                        background: recruitFormEnabled ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(255,255,255,.15)',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute', top: 3, left: recruitFormEnabled ? 25 : 3, width: 20, height: 20, borderRadius: '50%',
                          background: '#fff', transition: 'all .3s', boxShadow: '0 2px 5px rgba(0,0,0,.2)'
                        }}
                      />
                    </button>
                  </div>

                  <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(168,150,246,.28)', background: 'rgba(1,1,10,.4)' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                        {language === 'vi' ? 'Mở bán vé (trang chọn ghế)' : 'Ticket Sales (Seating Page)'}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                        {language === 'vi'
                          ? 'Tắt để chặn truy cập trang chọn ghế/thanh toán và ẩn giá vé ở trang chủ.'
                          : 'Turn off to block the seating/checkout pages and hide ticket prices on the home page.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTicketSalesEnabled(v => !v)}
                      style={{
                        position: 'relative', flexShrink: 0, width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
                        background: ticketSalesEnabled ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(255,255,255,.15)',
                        transition: 'background .2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, left: ticketSalesEnabled ? 25 : 3, width: 20, height: 20, borderRadius: '50%',
                        background: '#fff', transition: 'left .2s',
                      }} />
                    </button>
                  </div>

                  <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(168,150,246,.28)', background: 'rgba(1,1,10,.4)' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                        {language === 'vi' ? 'Cho phép admin/nhân viên test (mua vé khi đóng)' : 'Allow admin/staff to test (buy tickets when closed)'}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                        {language === 'vi'
                          ? 'Bật để cho phép admin và nhân viên truy cập trang chọn vé dù đã tắt bán vé chung.'
                          : 'Turn on to allow admins and staff to access ticket page despite general sales being closed.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminTestSalesEnabled(v => !v)}
                      style={{
                        position: 'relative', flexShrink: 0, width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
                        background: adminTestSalesEnabled ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(255,255,255,.15)',
                        transition: 'background .2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, left: adminTestSalesEnabled ? 25 : 3, width: 20, height: 20, borderRadius: '50%',
                        background: '#fff', transition: 'left .2s',
                      }} />
                    </button>
                  </div>

                  <button type="submit" disabled={updatingSettings} className="btn-pill" style={{ flexShrink: 0 }}>
                    {updatingSettings ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : t('applyChanges')}
                  </button>
                </form>
              </div>

              {/* Active List & Form below */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={sectionLabelStyle}>{t('activeRepertoire')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {events.map((evt) => {
                      const isBeingEdited = editingEventId === evt._id;
                      return (
                        <div
                          key={evt._id}
                          className="mfc-card admin-event-card"
                          style={{
                            padding: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
                            border: isBeingEdited ? '1px solid rgba(168,150,246,.8)' : undefined,
                            boxShadow: isBeingEdited ? '0 0 24px rgba(168,150,246,.25)' : undefined,
                          }}
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={evt.image} alt="Show" style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover' }} />
                            {isBeingEdited && (
                              <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--purple)', color: '#000', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>
                                {language === 'vi' ? 'Đang sửa' : 'Editing'}
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
                                {new Date(evt.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--line)' }} />
                              <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                                {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <h4 className="serif" style={{ color: '#fff', fontSize: 19, margin: '0 0 4px' }}>{l(evt.title)}</h4>
                            <p style={{ color: 'var(--muted)', fontSize: 12, fontStyle: 'italic', margin: '0 0 10px' }}>{l(evt.venueName)} • {l(evt.location)}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                              {['vip', 'premium', 'standard'].map(tKey => (
                                <div key={tKey} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: tKey === 'vip' ? '#a896f6' : tKey === 'premium' ? '#5aaddc' : '#10b981' }} />
                                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,.7)' }}>{formatPrice(evt.pricingTiers?.[tKey]?.price || 0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'fit-content' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleEditClick(evt)} className={isBeingEdited ? 'btn-pill' : 'btn-outline-pill'} style={{ fontSize: 12 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{isBeingEdited ? 'check_circle' : 'edit'}</span>
                                {isBeingEdited ? (language === 'vi' ? 'Đang chọn' : 'Active') : t('editEvent').split(' ')[0]}
                              </button>
                              <button onClick={() => handleDeleteEvent(evt._id)} style={{ padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                fetch(`${API_URL}/api/bookings/event/${evt._id}/occupied-seats`)
                                  .then(res => res.json())
                                  .then(data => alert(`${l(evt.title)}: ${data.length} seats reserved.`));
                              }}
                              className="btn-outline-pill"
                              style={{ fontSize: 11, justifyContent: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>monitoring</span>
                              {t('logs')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!showEventForm && (
                    <button
                      onClick={handleAddNewEvent}
                      style={{
                        width: '100%', padding: '32px', borderRadius: 20, border: '2px dashed rgba(168,150,246,.3)',
                        background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,150,246,.6)'; e.currentTarget.style.color = 'var(--purple)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,150,246,.3)'; e.currentTarget.style.color = 'var(--muted)'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add_circle</span>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.15em' }}>{t('addNewShowcase')}</span>
                    </button>
                  )}
                </div>

                {/* THE DYNAMIC EVENT FORM */}
                {showEventForm && (
                  <div id="event-form-section" className="mfc-card animate-fade-in" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                      <div>
                        <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: 0 }}>
                          {editingEventId ? t('editEvent') : t('newEvent')}
                        </h3>
                        {editingEventId && (
                          <p style={{ color: 'var(--purple)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 6 }}>
                            {language === 'vi' ? 'Đang chỉnh sửa: ' : 'Editing: '}
                            <span style={{ color: '#fff', fontWeight: 700 }}>{l(events.find(e => e._id === editingEventId)?.title)}</span>
                          </p>
                        )}
                      </div>
                      <button onClick={resetForm} style={{ background: 'rgba(1,1,10,.4)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 8, borderRadius: 999, display: 'flex' }}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmitEvent} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                      <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label style={fieldLabelStyle}>{t('titleEn')}</label>
                            <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="mfc-input" required />
                          </div>
                          <div>
                            <label style={fieldLabelStyle}>{t('descEn')}</label>
                            <textarea value={descEn} onChange={e => setDescEn(e.target.value)} className="mfc-input" style={{ height: 96, resize: 'vertical' }} required />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('titleVi')}</label>
                            <input type="text" value={titleVi} onChange={e => setTitleVi(e.target.value)} className="mfc-input" required />
                          </div>
                          <div>
                            <label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('descVi')}</label>
                            <textarea value={descVi} onChange={e => setDescVi(e.target.value)} className="mfc-input" style={{ height: 96, resize: 'vertical' }} required />
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                        <div><label style={fieldLabelStyle}>{t('dateLabel')}</label><input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="mfc-input" required /></div>
                        <div><label style={fieldLabelStyle}>{t('cityEn')}</label><input type="text" value={locEn} onChange={e => setLocEn(e.target.value)} className="mfc-input" required /></div>
                        <div><label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('cityVi')}</label><input type="text" value={locVi} onChange={e => setLocVi(e.target.value)} className="mfc-input" required /></div>
                      </div>

                      <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div><label style={fieldLabelStyle}>{t('venueEn')}</label><input type="text" value={venueEn} onChange={e => setVenueEn(e.target.value)} className="mfc-input" required /></div>
                        <div><label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('venueVi')}</label><input type="text" value={venueVi} onChange={e => setVenueVi(e.target.value)} className="mfc-input" required /></div>
                      </div>

                      <div>
                        <h4 style={{ ...sectionLabelStyle, fontWeight: 700, letterSpacing: '.15em' }}>{t('ticketPricing')}</h4>
                        <div className="admin-tier-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                          {['standard', 'premium', 'vip'].map(tKey => (
                            <div key={tKey} className="mfc-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <p style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--purple)', margin: 0 }}>{tKey} Tier</p>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input type="text" value={tiers[tKey].labelEn} onChange={e => updateTierField(tKey, 'labelEn', e.target.value)} placeholder="Label (EN)" className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required />
                                <input type="text" value={tiers[tKey].labelVi} onChange={e => updateTierField(tKey, 'labelVi', e.target.value)} placeholder="Tên (VI)" className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>Price ($)</span>
                                <input type="number" value={tiers[tKey].price} onChange={e => updateTierField(tKey, 'price', e.target.value)} className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Schedule Section */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 18, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                          <h4 style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.15em', fontWeight: 700, margin: 0 }}>
                            {language === 'vi' ? 'Lịch trình sự kiện' : 'Event Itinerary'}
                          </h4>
                          <button type="button" onClick={addScheduleItem} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                            + {language === 'vi' ? 'Thêm mốc' : 'Add Time Slot'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {schedule.map((item, idx) => (
                            <div key={idx} className="mfc-card" style={{ padding: 18, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <button type="button" onClick={() => removeScheduleItem(idx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                              </button>
                              <div className="admin-schedule-grid" style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 2fr', gap: 14 }}>
                                <div><label style={{ ...fieldLabelStyle, fontSize: 9 }}>Time</label><input type="text" value={item.time} onChange={e => { const ns = [...schedule]; ns[idx].time = e.target.value; setSchedule(ns); }} placeholder="19:00" className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required /></div>
                                <div><label style={{ ...fieldLabelStyle, fontSize: 9 }}>Title (EN)</label><input type="text" value={item.titleEn} onChange={e => { const ns = [...schedule]; ns[idx].titleEn = e.target.value; setSchedule(ns); }} className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required /></div>
                                <div><label style={{ ...fieldLabelStyle, fontSize: 9, color: 'var(--purple)' }}>Tên (VI)</label><input type="text" value={item.titleVi} onChange={e => { const ns = [...schedule]; ns[idx].titleVi = e.target.value; setSchedule(ns); }} className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required /></div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <textarea value={item.descEn} onChange={e => { const ns = [...schedule]; ns[idx].descEn = e.target.value; setSchedule(ns); }} placeholder="Description (EN)" className="mfc-input" style={{ fontSize: 11, height: 56, resize: 'vertical' }} required />
                                <textarea value={item.descVi} onChange={e => { const ns = [...schedule]; ns[idx].descVi = e.target.value; setSchedule(ns); }} placeholder="Mô tả (VI)" className="mfc-input" style={{ fontSize: 11, height: 56, resize: 'vertical' }} required />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="cloudinaryInput" />
                        <button
                          type="button"
                          onClick={() => document.getElementById('cloudinaryInput').click()}
                          className="btn-outline-pill"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>image</span>
                          {imageName ? `${language === 'vi' ? 'Đã chọn' : 'Selected'}: ${imageName.slice(0, 25)}` : editingEventId ? (language === 'vi' ? 'Thay ảnh sự kiện' : 'Replace Event Image') : (language === 'vi' ? 'Tải ảnh sự kiện' : 'Upload Event Image')}
                        </button>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <button type="button" onClick={resetForm} className="btn-outline-pill" style={{ flex: 1, justifyContent: 'center' }}>{t('cancel')}</button>
                          <button type="submit" disabled={submittingEvent} className="btn-pill" style={{ flex: 2, justifyContent: 'center' }}>
                            {submittingEvent ? (language === 'vi' ? 'Đang lưu...' : 'Synchronizing...') : (editingEventId ? t('confirmUpdates') : t('saveShowcase'))}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : activeAdminTab === 'coupons' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>{language === 'vi' ? 'Mã giảm giá' : 'Discount Codes'}</h3>
              </div>

              <form onSubmit={handleCreateCoupon} className="mfc-card admin-coupon-form" style={{ padding: 20, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <label style={fieldLabelStyle}>{language === 'vi' ? 'Mã' : 'Code'}</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="MFC2026"
                    className="mfc-input"
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                    required
                  />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={fieldLabelStyle}>%</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCouponPercent}
                    onChange={e => setNewCouponPercent(e.target.value)}
                    placeholder="10"
                    className="mfc-input"
                    required
                  />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabelStyle}>
                    {language === 'vi' ? 'Tổng số vé được áp dụng' : 'Total seats allowed'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCouponMaxSeats}
                    onChange={e => setNewCouponMaxSeats(e.target.value)}
                    placeholder={language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                    className="mfc-input"
                  />
                </div>
                <button type="submit" disabled={submittingCoupon} className="btn-pill" style={{ flexShrink: 0 }}>
                  {submittingCoupon ? '...' : (language === 'vi' ? 'Tạo mã' : 'Create')}
                </button>
              </form>

              {loadingCoupons ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
              ) : coupons.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có mã giảm giá nào.' : 'No discount codes yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {coupons.map(c => (
                    <div key={c._id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--purple)', fontWeight: 700, letterSpacing: '.05em', fontSize: 15 }}>{c.code}</span>
                        <span style={{ color: 'var(--mint)', fontWeight: 700, fontSize: 14 }}>−{c.percent}%</span>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                          {c.maxSeats
                            ? (language === 'vi'
                              ? `Đã dùng ${c.usedSeats || 0}/${c.maxSeats} vé`
                              : `Used ${c.usedSeats || 0}/${c.maxSeats} seats`)
                            : (language === 'vi' ? 'Không giới hạn vé' : 'Unlimited seats')}
                        </span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                          border: `1px solid ${c.active ? 'rgba(158,254,253,.3)' : 'rgba(255,107,107,.3)'}`,
                          color: c.active ? 'var(--mint)' : '#ff6b6b',
                          background: c.active ? 'rgba(158,254,253,.08)' : 'rgba(255,107,107,.08)',
                        }}>
                          {c.active ? (language === 'vi' ? 'Đang bật' : 'Active') : (language === 'vi' ? 'Đã tắt' : 'Inactive')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleToggleCoupon(c)} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                          {c.active ? (language === 'vi' ? 'Tắt' : 'Disable') : (language === 'vi' ? 'Bật' : 'Enable')}
                        </button>
                        <button onClick={() => handleDeleteCoupon(c._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeAdminTab === 'applications' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                  {language === 'vi' ? 'Đơn ứng tuyển CTV' : 'CTV Applications'}
                </h3>
              </div>

              {(() => {
                const deptOptions = ['all', ...Array.from(new Set(applications.map(a => a.department)))];
                let filteredApplications = applicationDeptFilter === 'all'
                  ? applications
                  : applications.filter(a => a.department === applicationDeptFilter);

                filteredApplications = applicationStatusFilter === 'all'
                  ? filteredApplications
                  : filteredApplications.filter(a => {
                    if (applicationStatusFilter === 'passed') return a.status === 'passed' || a.resolved;
                    if (applicationStatusFilter === 'failed') return a.status === 'failed';
                    if (applicationStatusFilter === 'pending') return a.status !== 'passed' && a.status !== 'failed' && !a.resolved;
                    return true;
                  });

                return (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {deptOptions.map(d => (
                        <button
                          key={d}
                          onClick={() => setApplicationDeptFilter(d)}
                          style={{
                            padding: '9px 18px', borderRadius: 999, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em',
                            border: applicationDeptFilter === d ? '1px solid rgba(168,150,246,.8)' : '1px solid var(--line)',
                            background: applicationDeptFilter === d ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(1,1,10,.4)',
                            color: applicationDeptFilter === d ? '#fff' : 'var(--muted)',
                            cursor: 'pointer', transition: 'all .2s',
                          }}
                        >
                          {d === 'all' ? (language === 'vi' ? 'Tất cả ban' : 'All Depts') : d}
                          {' '}({d === 'all' ? applications.length : applications.filter(a => a.department === d).length})
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {[
                        { id: 'all', label: language === 'vi' ? 'Tất cả trạng thái' : 'All Statuses' },
                        { id: 'pending', label: language === 'vi' ? 'Chưa xử lý' : 'Pending' },
                        { id: 'passed', label: language === 'vi' ? 'Đậu' : 'Passed' },
                        { id: 'failed', label: language === 'vi' ? 'Trượt' : 'Failed' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setApplicationStatusFilter(st.id)}
                          style={{
                            padding: '9px 18px', borderRadius: 999, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em',
                            border: applicationStatusFilter === st.id ? '1px solid rgba(168,150,246,.8)' : '1px solid var(--line)',
                            background: applicationStatusFilter === st.id ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(1,1,10,.4)',
                            color: applicationStatusFilter === st.id ? '#fff' : 'var(--muted)',
                            cursor: 'pointer', transition: 'all .2s',
                          }}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {loadingApplications ? (
                      <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                        {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                      </p>
                    ) : filteredApplications.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                        {language === 'vi' ? 'Chưa có đơn ứng tuyển nào.' : 'No applications yet.'}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredApplications.map(a => {
                          const isExpanded = expandedApplicationId === a._id;
                          return (
                            <div key={a._id} style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{a.name}</span>
                                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', border: '1px solid rgba(168,150,246,.3)', color: 'var(--purple)', background: 'rgba(168,150,246,.1)' }}>
                                    {a.department}
                                  </span>
                                  <span
                                    style={{
                                      padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                                      border: `1px solid ${a.status === 'passed' || a.resolved ? 'rgba(158,254,253,.3)' : a.status === 'failed' ? 'rgba(255,107,107,.3)' : 'rgba(255,184,0,.3)'}`,
                                      color: a.status === 'passed' || a.resolved ? 'var(--mint)' : a.status === 'failed' ? '#ff6b6b' : '#ffb800',
                                      background: a.status === 'passed' || a.resolved ? 'rgba(158,254,253,.08)' : a.status === 'failed' ? 'rgba(255,107,107,.08)' : 'rgba(255,184,0,.08)',
                                    }}
                                    title={(a.status === 'passed' || a.status === 'failed' || a.resolved) ? `${language === 'vi' ? 'Xử lý bởi' : 'Processed by'} ${a.resolvedBy || '—'}` : ''}
                                  >
                                    {a.status === 'passed' || a.resolved ? (language === 'vi' ? 'Đậu' : 'Passed') : a.status === 'failed' ? (language === 'vi' ? 'Trượt' : 'Failed') : (language === 'vi' ? 'Chưa xử lý' : 'Pending')}
                                  </span>
                                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                                    {new Date(a.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                  </span>
                                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>{a.email} · {a.phone}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => setExpandedApplicationId(isExpanded ? null : a._id)} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                                    {isExpanded ? (language === 'vi' ? 'Thu gọn' : 'Collapse') : (language === 'vi' ? 'Xem chi tiết' : 'View details')}
                                  </button>
                                  {!isStaff && (
                                    <button onClick={() => handleDeleteApplication(a._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                                  <div className="admin-app-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Ngày sinh: ' : 'DOB: '}</span><span style={{ color: '#fff' }}>{a.dob}</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Trường / đơn vị: ' : 'School: '}</span><span style={{ color: '#fff' }}>{a.school || '—'}</span></p>
                                    {a.facebook && (
                                      <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Facebook: </span><a href={a.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', wordBreak: 'break-all' }}>{a.facebook}</a></p>
                                    )}
                                    {a.portfolio && (
                                      <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Portfolio: </span><a href={a.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', wordBreak: 'break-all' }}>{a.portfolio}</a></p>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                                    {(a.answers || []).map((qa, i) => qa.answer && (
                                      <div key={i}>
                                        <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 4px' }}>
                                          {language === 'vi' ? `Câu ${i + 1}` : `Q${i + 1}`}
                                        </p>
                                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{qa.question}</p>
                                        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{qa.answer}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Processing notes */}
                                  <div style={{ paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                      <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>
                                        {language === 'vi' ? 'Ghi chú' : 'Notes'}
                                      </p>
                                      {(a.status === 'passed' || a.status === 'failed' || a.resolved) ? (
                                        <button
                                          onClick={() => handleUpdateStatus(a, 'pending')}
                                          className="btn-outline-pill"
                                          style={{ fontSize: 10, padding: '7px 14px' }}
                                        >
                                          {language === 'vi' ? '↺ Hoàn tác' : '↺ Undo'}
                                        </button>
                                      ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <button
                                            onClick={() => handleUpdateStatus(a, 'passed')}
                                            className="btn-pill"
                                            style={{ fontSize: 10, padding: '7px 14px', background: 'var(--mint)', color: '#000', border: 'none' }}
                                          >
                                            {language === 'vi' ? '✓ Đánh Đậu' : '✓ Mark Passed'}
                                          </button>
                                          <button
                                            onClick={() => handleUpdateStatus(a, 'failed')}
                                            className="btn-pill"
                                            style={{ fontSize: 10, padding: '7px 14px', background: 'rgba(255,107,107,.15)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,.5)' }}
                                          >
                                            {language === 'vi' ? '✗ Đánh trượt' : '✗ Mark Failed'}
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {(a.notes || []).length > 0 && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                        {a.notes.map((n, i) => (
                                          <div key={i} style={{ borderRadius: 10, background: 'rgba(1,1,10,.4)', border: '1px solid var(--line)', padding: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                              <span style={{ fontWeight: 700, color: 'var(--purple)', fontSize: 12 }}>{n.author}</span>
                                              <span style={{ color: 'var(--muted)', fontSize: 10 }}>
                                                {new Date(n.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                              </span>
                                            </div>
                                            <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{n.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {(a.status === 'passed' || a.status === 'failed' || a.resolved) ? (
                                      <p style={{ color: a.status === 'failed' ? '#ff6b6b' : 'var(--mint)', fontSize: 12, fontStyle: 'italic', margin: 0 }}>
                                        {language === 'vi'
                                          ? `Đã được đánh ${a.status === 'failed' ? 'trượt' : 'đậu'} bởi ${a.resolvedBy || '—'}${a.resolvedAt ? ` lúc ${new Date(a.resolvedAt).toLocaleString('vi-VN')}` : ''}. Bấm "Hoàn tác" để mở lại.`
                                          : `Marked as ${a.status === 'failed' ? 'failed' : 'passed'} by ${a.resolvedBy || '—'}${a.resolvedAt ? ` at ${new Date(a.resolvedAt).toLocaleString('en-US')}` : ''}. Click "Undo" to reopen.`}
                                      </p>
                                    ) : (
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <input
                                          value={noteDrafts[a._id] || ''}
                                          onChange={e => setNoteDrafts(d => ({ ...d, [a._id]: e.target.value }))}
                                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(a._id); } }}
                                          placeholder={language === 'vi' ? 'Nhập ghi chú...' : 'Enter a note...'}
                                          className="mfc-input"
                                          style={{ flex: 1, fontSize: 12, padding: '10px 14px' }}
                                        />
                                        <button
                                          onClick={() => handleAddNote(a._id)}
                                          disabled={!staffName.trim() || !(noteDrafts[a._id] || '').trim()}
                                          className="btn-pill"
                                          style={{ fontSize: 11, flexShrink: 0 }}
                                        >
                                          {language === 'vi' ? 'Gửi' : 'Send'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : activeAdminTab === 'staff' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                  {language === 'vi' ? 'Tài khoản nhân viên' : 'Staff Accounts'}
                </h3>
              </div>

              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0, marginBottom: 20 }}>
                {language === 'vi'
                  ? 'Tài khoản nhân viên chỉ có thể xem "Quản lý vé" và "Đơn ứng tuyển CTV" trong trang quản trị.'
                  : 'Staff accounts can only access "Manage Tickets" and "CTV Applications" in the admin panel.'}
              </p>

              <form onSubmit={handleCreateStaff} className="mfc-card" style={{ padding: 20, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={fieldLabelStyle}>{language === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                  <input type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'} className="mfc-input" required />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={fieldLabelStyle}>Email</label>
                  <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} placeholder="email@example.com" className="mfc-input" required />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabelStyle}>{language === 'vi' ? 'Mật khẩu' : 'Password'}</label>
                  <input type="password" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} placeholder="••••••••" className="mfc-input" required />
                </div>
                <button type="submit" disabled={creatingStaff} className="btn-pill" style={{ flexShrink: 0 }}>
                  {creatingStaff ? '...' : (language === 'vi' ? 'Tạo tài khoản' : 'Create Account')}
                </button>
              </form>

              {loadingStaffAccounts ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
              ) : staffAccounts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có tài khoản nhân viên nào.' : 'No staff accounts yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {staffAccounts.map(s => (
                    <div key={s._id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)' }}>
                      <div>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{s.fullName}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 10 }}>{s.email}</span>
                      </div>
                      <button onClick={() => handleDeleteStaff(s._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeAdminTab === 'nhat' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                  {language === 'vi' ? 'Bài dự thi "Nhất"' : '"Nhất" Entries'}
                </h3>
              </div>

              {loadingNhatSubmissions ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
              ) : nhatSubmissions.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có bài dự thi nào.' : 'No entries yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {nhatSubmissions.map(s => {
                    const isExpanded = expandedNhatId === s._id;
                    return (
                      <div key={s._id} style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{s.fullName}</span>
                            <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 10 }}>{s.email} · {s.phone}</span>
                            {s.school && <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 10 }}>· {s.school}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setExpandedNhatId(isExpanded ? null : s._id)} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                              {isExpanded ? (language === 'vi' ? 'Thu gọn' : 'Collapse') : (language === 'vi' ? 'Xem chi tiết' : 'View details')}
                            </button>
                            {!isStaff && (
                              <button onClick={() => handleDeleteNhatSubmission(s._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                            <div className="admin-app-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Họ và tên: ' : 'Full Name: '}</span><span style={{ color: '#fff' }}>{s.fullName}</span></p>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Email: </span><span style={{ color: '#fff' }}>{s.email}</span></p>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Số điện thoại: ' : 'Phone: '}</span><span style={{ color: '#fff' }}>{s.phone}</span></p>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Trường / đơn vị: ' : 'School: '}</span><span style={{ color: '#fff' }}>{s.school || '-'}</span></p>
                            </div>

                            <div>
                              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px' }}>
                                {language === 'vi' ? 'Ghi chú thêm' : 'Additional Notes'}
                              </p>
                              <p style={{ color: '#e0dbff', margin: 0, lineHeight: 1.6 }}>{s.note || (language === 'vi' ? 'Không có' : 'None')}</p>
                            </div>

                            {(s.outfits && s.outfits.length > 0 ? s.outfits : [{ designImage: s.designImage, outfitPhoto1: s.outfitPhoto1, outfitPhoto2: s.outfitPhoto2 }]).map((outfit, index) => (
                              <div key={index} style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, marginBottom: 8 }}>
                                  {language === 'vi'
                                    ? `Bộ đồ ${index + 1}${outfit.name ? `: ${outfit.name}` : ''}`
                                    : `Outfit ${index + 1}${outfit.name ? `: ${outfit.name}` : ''}`}
                                </div>
                                <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                  {[
                                    { label: language === 'vi' ? 'Bản vẽ thiết kế' : 'Design Sketch', src: outfit.designImage, name: `${s.fullName}-outfit${index + 1}-sketch` },
                                    { label: language === 'vi' ? 'Ảnh bộ đồ (1)' : 'Outfit Photo (1)', src: outfit.outfitPhoto1, name: `${s.fullName}-outfit${index + 1}-photo1` },
                                    { label: language === 'vi' ? 'Ảnh bộ đồ (2)' : 'Outfit Photo (2)', src: outfit.outfitPhoto2, name: `${s.fullName}-outfit${index + 1}-photo2` },
                                  ].map((img, i) => (
                                    <div key={i}>
                                      <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px' }}>{img.label}</p>
                                      {img.src ? (
                                        <img
                                          src={img.src}
                                          alt={img.label}
                                          onClick={() => setZoomedImage({ src: img.src, name: img.name })}
                                          style={{ width: '100%', maxHeight: 180, objectFit: 'cover', border: '1px solid var(--line)', display: 'block', cursor: 'zoom-in' }}
                                        />
                                      ) : (
                                        <div style={{ height: 180, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>N/A</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <p style={{ color: 'var(--muted)', fontSize: 10, margin: 0 }}>
                              {new Date(s.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeAdminTab === 'casting' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                  {language === 'vi' ? 'Đơn Đăng Ký Casting Call Model' : 'Model Casting Call Applications'}
                </h3>
              </div>

              {loadingCastingSubmissions ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
              ) : castingSubmissions.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có đơn đăng ký nào.' : 'No applications yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {castingSubmissions.map(s => {
                    const isExpanded = expandedCastingId === s._id;
                    return (
                      <div key={s._id} style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{s.fullName}</span>
                            <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 10 }}>{s.email} · {s.phone}</span>
                            <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 10 }}>· {s.height}cm / {s.weight}kg</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setExpandedCastingId(isExpanded ? null : s._id)} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                              {isExpanded ? (language === 'vi' ? 'Thu gọn' : 'Collapse') : (language === 'vi' ? 'Xem chi tiết' : 'View details')}
                            </button>
                            {!isStaff && (
                              <button onClick={() => handleDeleteCastingSubmission(s._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: '16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                            <div className="admin-app-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Họ và tên: ' : 'Full Name: '}</span><span style={{ color: '#fff' }}>{s.fullName}</span></p>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Email: </span><span style={{ color: '#fff' }}>{s.email}</span></p>
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Số điện thoại: ' : 'Phone: '}</span><span style={{ color: '#fff' }}>{s.phone}</span></p>
                              {s.facebook && (
                                <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Facebook: </span><a href={s.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', wordBreak: 'break-all' }}>{s.facebook}</a></p>
                              )}
                              <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Ngày sinh: ' : 'DOB: '}</span><span style={{ color: '#fff' }}>{s.dob}</span></p>
                            </div>
                            <div>
                              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 8px' }}>
                                {language === 'vi' ? 'Chỉ số hình thể' : 'Body Statistics'}
                              </p>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {[['Chiều cao','Height',`${s.height} cm`],['Cân nặng','Weight',`${s.weight} kg`],['Vòng 1','Bust',`${s.bust} cm`],['Vòng 2','Waist',`${s.waist} cm`],['Vòng 3','Hips',`${s.hips} cm`]].map(([lv,le,val]) => (
                                  <div key={lv} style={{ textAlign: 'center', padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{language === 'vi' ? lv : le}</div>
                                    <div style={{ color: '#fff', fontWeight: 700 }}>{val}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px' }}>
                                {language === 'vi' ? 'Kinh nghiệm trình diễn' : 'Runway Experience'}
                              </p>
                              <p style={{ color: '#e0dbff', margin: 0, lineHeight: 1.6 }}>{s.experience}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: 10, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, margin: '0 0 10px' }}>
                                Compcard
                              </p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                {[
                                  { label: language === 'vi' ? 'Chân dung chính diện' : 'Frontal Portrait', src: s.portraitFront, name: `${s.fullName}-front` },
                                  { label: language === 'vi' ? 'Chân dung góc nghiêng' : 'Side Portrait', src: s.portraitSide, name: `${s.fullName}-side` },
                                  { label: language === 'vi' ? 'Bán toàn thân' : 'Half-Body', src: s.halfBody, name: `${s.fullName}-half` },
                                  { label: language === 'vi' ? 'Toàn thân' : 'Full-Body', src: s.fullBody, name: `${s.fullName}-full` },
                                ].map((img, i) => (
                                  <div key={i}>
                                    <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px' }}>{img.label}</p>
                                    {img.src ? (
                                      <img src={img.src} alt={img.label} onClick={() => setZoomedImage({ src: img.src, name: img.name })}
                                        style={{ width: '100%', maxHeight: 200, objectFit: 'cover', border: '1px solid var(--line)', display: 'block', cursor: 'zoom-in' }} />
                                    ) : (
                                      <div style={{ height: 160, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>N/A</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p style={{ color: 'var(--muted)', fontSize: 10, margin: 0 }}>
                              {new Date(s.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>

              {/* ── Live Scanner ── */}
              <h3 style={sectionLabelStyle}>{t('liveScanner')}</h3>
              <button
                onClick={() => { setScanResult(null); setShowScanner(true); }}
                className="btn-pill"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 18, padding: '14px 20px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_camera</span>
                {language === 'vi' ? 'Bật camera quét QR' : 'Start Camera Scanner'}
              </button>

              <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                {language === 'vi' ? 'Hoặc nhập mã vé thủ công' : 'Or enter ticket code manually'}
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <input
                  ref={scanInputRef}
                  autoFocus
                  type="text"
                  value={scanBookingId}
                  onChange={(e) => setScanBookingId(e.target.value)}
                  placeholder="MFCXXXXXXXX"
                  className="mfc-input"
                  style={{ fontFamily: 'monospace' }}
                  required
                />
                <button type="submit" disabled={scanning} className="btn-pill" style={{ flexShrink: 0 }}>
                  {scanning ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span> : t('scan')}
                </button>
              </form>

              {/* ── Scan Result Card ── */}
              {scanResult && (() => {
                const isValid = scanResult.status === 'valid';
                const isUsed = scanResult.status === 'already_used';
                const d = scanResult.details;

                const cfg = isValid
                  ? { color: 'var(--mint)', bg: 'rgba(158, 254, 253, 0.1)', icon: 'check_circle', label: language === 'vi' ? 'HỢP LỆ — VÀO CỬA' : 'VALID — ADMITTED' }
                  : isUsed
                    ? { color: '#ffb800', bg: 'rgba(255, 184, 0, 0.1)', icon: 'warning', label: language === 'vi' ? 'ĐÃ SỬ DỤNG' : 'ALREADY USED' }
                    : { color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.1)', icon: 'cancel', label: language === 'vi' ? 'KHÔNG TÌM THẤY' : 'NOT FOUND' };

                return (
                  <div style={{ marginBottom: 28, borderRadius: 20, overflow: 'hidden', border: `1px solid ${cfg.color}55`, background: 'var(--card-bg)', boxShadow: `0 8px 32px ${cfg.bg}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: cfg.bg, borderBottom: `1px solid ${cfg.color}33` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 28, color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '.1em', color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</span>
                      <button onClick={() => setScanResult(null)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', width: 32, height: 32, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                      </button>
                    </div>

                    {d ? (
                      <div className="admin-scan-grid" style={{ padding: '24px 20px', fontSize: 14 }}>
                        <style>{`
                          .admin-scan-grid {
                            display: flex;
                            flex-direction: column;
                            gap: 20px;
                          }
                          .desktop-seat-map-wrapper {
                            display: none;
                          }
                          @media (min-width: 900px) {
                            .admin-scan-grid {
                              display: grid;
                              grid-template-columns: 1.3fr 1fr;
                              align-items: start;
                            }
                            .desktop-seat-map-wrapper {
                              display: block;
                            }
                          }
                        `}</style>
                        
                        {/* LEFT COLUMN: Map (Hidden on mobile) */}
                        {d.selectedSeats?.length > 0 && (() => {
                          const matchedSeats = scanResult.scannedTicketCode 
                            ? d.selectedSeats.filter(s => s.ticketCode === scanResult.scannedTicketCode)
                            : d.selectedSeats;
                          return (
                            <div className="desktop-seat-map-wrapper">
                              <AdminSeatMap matchedSeats={matchedSeats} language={language} />
                            </div>
                          );
                        })()}

                        {/* RIGHT COLUMN: Info cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          
                          {/* Seat & Ticket Code */}
                          {d.selectedSeats?.length > 0 && (() => {
                            const matchedSeats = scanResult.scannedTicketCode 
                              ? d.selectedSeats.filter(s => s.ticketCode === scanResult.scannedTicketCode)
                              : d.selectedSeats;
                              
                            return (
                              <>
                                <div style={{ background: 'rgba(158,254,253,0.05)', padding: '24px', borderRadius: 16, border: '1px solid rgba(158,254,253,0.15)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                                  <div style={{ fontSize: 13, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 900, marginBottom: 20 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chair</span> 
                                    {language === 'vi' ? 'Vị trí ghế ngồi' : 'Seat Location'}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                                    {matchedSeats.map((s, i) => {
                                      const c = isUsed ? { hex: '#ffb800', rgb: '255,184,0' }
                                              : s.type === 'Nhất Ảnh' ? { hex: '#a896f6', rgb: '168,150,246' } 
                                              : s.type === 'Khởi Ảnh' ? { hex: '#5aaddc', rgb: '90,173,220' } 
                                              : s.type === 'Hoàn Ảnh' ? { hex: '#10b981', rgb: '16,185,129' } 
                                              : { hex: '#ffb800', rgb: '255,184,0' };
                                      
                                      return (
                                        <div key={i} style={{
                                          padding: '16px 32px', borderRadius: 12, fontSize: 32, fontWeight: 900,
                                          background: `rgba(${c.rgb}, 0.15)`,
                                          border: `2px solid ${c.hex}`,
                                          color: c.hex,
                                          boxShadow: `0 0 24px rgba(${c.rgb}, 0.4)`,
                                        }}>
                                          {s.seatId} <span style={{ opacity: 0.9, fontWeight: 600, fontSize: 16 }}>• {s.type}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>qr_code</span> Mã vé
                                  </div>
                                  <div style={{ fontFamily: 'monospace', color: 'var(--purple)', fontWeight: 800, letterSpacing: '.1em', fontSize: 16, wordBreak: 'break-all' }}>
                                    {scanResult.scannedTicketCode || d.ticketCode}
                                  </div>
                                </div>
                              </>
                            );
                          })()}

                          {/* User Info */}
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span> Khách hàng</div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{d.fullName}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{d.email}</div>
                          </div>

                          {/* Timestamp */}
                          {d.checkInDate && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18, color: cfg.color }}>{isValid ? 'verified' : 'history'}</span>
                              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {language === 'vi' ? 'Thời gian check-in:' : 'Check-in time:'}
                              </span>
                              <span style={{ fontFamily: 'monospace', color: cfg.color, fontSize: 14, fontWeight: 600 }}>
                                {new Date(d.checkInDate).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ padding: 24, fontSize: 14, color: '#ff6b6b', margin: 0, textAlign: 'center' }}>{scanResult.message}</p>
                    )}
                  </div>
                );
              })()}

              {/* ── Check-in overview: two split lists (FLATTENED TO INDIVIDUAL TICKETS) ── */}
              <div className="admin-checkin-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                {[
                  { key: 'in', title: language === 'vi' ? 'Đã check-in' : 'Checked-in', color: 'var(--mint)', icon: 'check_circle', list: allBookings.flatMap(b => (b.selectedSeats || []).filter(s => s.status !== 'Cancelled' && s.isCheckedIn).map(s => ({ ...b, seat: s, ticketId: s.ticketCode || `${b._id.toString().slice(-8).toUpperCase()}-${s.seatId}` }))) },
                  { key: 'out', title: language === 'vi' ? 'Chưa check-in' : 'Not Checked-in', color: '#ffb800', icon: 'schedule', list: allBookings.flatMap(b => (b.selectedSeats || []).filter(s => s.status !== 'Cancelled' && !s.isCheckedIn).map(s => ({ ...b, seat: s, ticketId: s.ticketCode || `${b._id.toString().slice(-8).toUpperCase()}-${s.seatId}` }))) },
                ].map(group => (
                  <div key={group.key}>
                    <h4 style={{ ...sectionLabelStyle, color: group.color }}>{group.title} ({group.list.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
                      {group.list.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                          {language === 'vi' ? 'Không có vé nào.' : 'No tickets.'}
                        </p>
                      ) : group.list.map(t => (
                        <div key={t.ticketId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(1,1,10,.3)' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.fullName} - Ghế {t.seat.seatId}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>{t.ticketId}</div>
                          </div>
                          <span className="material-symbols-outlined" style={{ color: group.color, fontSize: 20 }}>{group.icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Master ledger: full ticket list ── */}
              <div id="master-ledger-section" style={{ paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>{t('masterLedger')}</h3>
              </div>

              {loadingBookings ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang đồng bộ...' : 'Synchronizing Global Sales...'}
                </p>
              ) : allBookings.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có đơn đặt vé nào.' : 'No bookings yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {allBookings.map(booking => (
                    <div key={booking._id} className="admin-booking-row" style={{ display: 'grid', gridTemplateColumns: '90px 1.1fr 1fr 280px 110px auto', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--purple)', fontSize: 12, lineHeight: 1 }}>{booking._id.toString().slice(-8).toUpperCase()}</span>
                        {booking.bookingDate && (
                          <span style={{ color: 'var(--muted)', fontSize: 10, lineHeight: 1 }}>
                            {new Date(booking.bookingDate).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div>
                        {editingBookingId === booking._id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 220 }}>
                            <input value={editBookingName} onChange={e => setEditBookingName(e.target.value)} className="mfc-input" style={{ fontSize: 12, padding: '8px 12px' }} />
                            <input value={editBookingEmail} onChange={e => setEditBookingEmail(e.target.value)} className="mfc-input" style={{ fontSize: 12, padding: '8px 12px' }} />
                          </div>
                        ) : (
                          <>
                            <p style={{ fontWeight: 700, color: '#fff', margin: 0 }}>{booking.fullName}</p>
                            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{booking.email}</p>
                            <p style={{ fontSize: 10, color: 'var(--mint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', margin: '4px 0 0' }}>{l(booking.eventId?.title)}</p>
                          </>
                        )}
                      </div>

                      <div>
                        <p style={{ margin: 0, color: '#fff' }}>{booking.selectedSeats?.filter(s => s.status !== 'Cancelled').length} Seat(s)</p>
                        <p style={{ margin: '2px 0 0', color: 'var(--purple)', fontWeight: 700 }}>
                          {formatPrice(booking.subtotal)}
                          {booking.discountCode && (
                            <span style={{ color: 'var(--mint)', fontSize: 10, marginLeft: 6, fontWeight: 500 }}>
                              (Mã: {booking.discountCode})
                            </span>
                          )}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 0' }}>
                          <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)' }}>{booking.paymentMethod}</p>
                          <span style={{ color: 'var(--line)', fontSize: 10 }}>|</span>
                          <span style={{ color: booking.paymentStatus === 'Completed' ? 'var(--mint)' : (booking.paymentStatus === 'Failed' ? '#ff6b6b' : '#f59e0b'), fontSize: 10, fontWeight: 600 }}>
                            {booking.paymentStatus === 'Completed' 
                              ? (language === 'vi' ? 'Đã duyệt' : 'Completed')
                              : booking.paymentStatus === 'Failed'
                                ? (language === 'vi' ? 'Đã hủy' : 'Failed')
                                : booking.paymentBillUrl 
                                  ? (language === 'vi' ? 'Chờ duyệt bill' : 'Pending Approval') 
                                  : (language === 'vi' ? 'Chờ thanh toán' : 'Awaiting Payment')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 0' }}>
                          {booking.paymentBillUrl && (
                            <a href={booking.paymentBillUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--mint)', textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>receipt_long</span> {language === 'vi' ? 'Xem Bill' : 'View Bill'}
                            </a>
                          )}
                          <a href={`/ticket?id=${booking._id}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--purple)', textDecoration: 'none', fontSize: 10, fontWeight: 600 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>qr_code_2</span> {language === 'vi' ? 'Xem Vé & Ghế' : 'View Ticket & Seats'}
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {booking.selectedSeats?.map(seat => (
                          <div key={seat.seatId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textDecoration: seat.status === 'Cancelled' ? 'line-through' : 'none' }}>
                              {seat.seatId}
                              <span style={{ color: 'var(--muted)', fontWeight: 500, marginLeft: 4 }}>
                                ({formatPrice(seat.price * (1 - (booking.discountPercent || 0) / 100))})
                                {booking.discountPercent > 0 && (
                                  <span style={{ color: 'var(--mint)', marginLeft: 4, fontSize: 9 }}>
                                    [-{booking.discountPercent}%]
                                  </span>
                                )}
                              </span>
                            </span>

                            {seat.status === 'Cancelled' ? (
                              <span style={{ padding: '2px 6px', borderRadius: 999, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', border: '1px solid rgba(255,87,87,.3)', color: 'var(--red)', background: 'rgba(255,87,87,.08)' }}>
                                {language === 'vi' ? 'Đã xóa' : 'Cancelled'}
                              </span>
                            ) : (
                              <>
                                <span style={{
                                  padding: '2px 6px', borderRadius: 999, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
                                  border: `1px solid ${seat.isCheckedIn ? 'rgba(158,254,253,.3)' : 'rgba(168,150,246,.3)'}`,
                                  color: seat.isCheckedIn ? 'var(--mint)' : 'var(--purple)',
                                  background: seat.isCheckedIn ? 'rgba(158,254,253,.08)' : 'rgba(168,150,246,.08)',
                                }}>
                                  {seat.isCheckedIn ? (language === 'vi' ? 'Đã checkin' : 'Checked-in') : (language === 'vi' ? 'Chưa checkin' : 'Not checked-in')}
                                </span>
                                <span style={{
                                  padding: '2px 6px', borderRadius: 999, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
                                  border: `1px solid ${seat.isSent ? 'rgba(70,69,215,.3)' : 'rgba(255,255,255,.2)'}`,
                                  color: seat.isSent ? '#807df5' : 'var(--muted)',
                                  background: seat.isSent ? 'rgba(70,69,215,.1)' : 'rgba(255,255,255,.05)',
                                }}>
                                  {seat.isSent ? (language === 'vi' ? 'Đã gửi' : 'Sent') : (language === 'vi' ? 'Chưa gửi' : 'Unsent')}
                                </span>
                                {!isStaff && (
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(language === 'vi' ? `Bạn có chắc muốn xóa ghế ${seat.seatId} khỏi đơn hàng này?` : `Are you sure you want to delete seat ${seat.seatId}?`)) {
                                        try {
                                          const res = await fetch(`${API_URL}/api/bookings/${booking._id}/seats/${seat.seatId}`, { method: 'DELETE' });
                                          if (res.ok) fetchAllBookings(true);
                                          else { const j = await res.json(); alert(j.error); }
                                        } catch (e) { console.error(e); }
                                      }
                                    }}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'var(--red)', opacity: 0.7, marginLeft: 'auto' }}
                                    title={language === 'vi' ? 'Xóa ghế' : 'Delete seat'}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {!isStaff && (
                        <button
                          onClick={() => {
                            const activeSeats = booking.selectedSeats?.filter(s => s.status !== 'Cancelled').map(s => s.seatId) || [];
                            setEmailModalData({
                              booking: booking,
                              to: booking.email,
                              subject: '[MFC Fashion Show] Vé điện tử của bạn đã sẵn sàng',
                              customerName: booking.fullName || 'Quý khách',
                              body: '',
                              selectedSeats: activeSeats,
                              sending: false
                            });
                          }}
                          style={{
                            padding: '6px 12px', borderRadius: 999, fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: booking.ticketSent ? 'rgba(168,150,246,.15)' : 'rgba(255,255,255,.05)',
                            color: booking.ticketSent ? 'var(--purple)' : 'var(--muted)',
                            display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{booking.ticketSent ? 'mark_email_read' : 'forward_to_inbox'}</span>
                          {booking.ticketSent ? (language === 'vi' ? 'Đã gửi vé' : 'Sent') : (language === 'vi' ? 'Chưa gửi' : 'Unsent')}
                        </button>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        {isStaff ? null : editingBookingId === booking._id ? (
                          <>
                            <button onClick={saveBookingEdit} style={{ background: 'none', border: 'none', color: 'var(--mint)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>{t('save')}</button>
                            <button onClick={() => setEditingBookingId(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>{t('cancel')}</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditBooking(booking)} style={{ padding: 8, borderRadius: 999, border: '1px solid var(--line)', background: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
                            </button>
                            <button onClick={() => handleDeleteBooking(booking._id)} style={{ padding: 8, borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {emailModalData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', padding: 16 }}>
          <div className="mfc-card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 24, background: '#0a0a0a', border: '1px solid var(--line)', borderRadius: 16 }}>
            <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 16px' }}>{language === 'vi' ? 'Soạn Mail Gửi Vé' : 'Compose Ticket Email'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12 }}>{language === 'vi' ? 'Email người nhận' : 'Recipient Email'}</p>
                <input
                  type="email"
                  value={emailModalData.to}
                  onChange={e => setEmailModalData({ ...emailModalData, to: e.target.value })}
                  placeholder="name@example.com"
                  className="mfc-input"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <p style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12 }}>{language === 'vi' ? 'Tên khách hàng' : 'Customer Name'}</p>
                <input
                  type="text"
                  value={emailModalData.customerName}
                  onChange={e => setEmailModalData({ ...emailModalData, customerName: e.target.value })}
                  placeholder="Tên hiển thị trong mail"
                  className="mfc-input"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <p style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12 }}>{language === 'vi' ? 'Tiêu đề thư' : 'Email Subject'}</p>
                <input
                  type="text"
                  value={emailModalData.subject}
                  onChange={e => setEmailModalData({ ...emailModalData, subject: e.target.value })}
                  placeholder="Subject (Tiêu đề)"
                  className="mfc-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <p style={{ margin: '0 0 6px', color: 'var(--muted)', fontSize: 12 }}>{language === 'vi' ? 'Chọn vé đính kèm' : 'Select tickets to include'}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {emailModalData.booking.selectedSeats?.filter(s => s.status !== 'Cancelled').map(s => (
                    <label key={s.seatId} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#fff', fontSize: 13, background: 'rgba(255,255,255,.05)', padding: '4px 8px', borderRadius: 4 }}>
                      <input
                        type="checkbox"
                        checked={emailModalData.selectedSeats.includes(s.seatId)}
                        onChange={(e) => {
                          const newSeats = e.target.checked
                            ? [...emailModalData.selectedSeats, s.seatId]
                            : emailModalData.selectedSeats.filter(id => id !== s.seatId);
                          setEmailModalData({ ...emailModalData, selectedSeats: newSeats });
                        }}
                      />
                      {s.seatId}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 6 }}>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>{language === 'vi' ? 'Xem trước & Chỉnh sửa (Click trực tiếp vào chữ để sửa)' : 'Preview & Edit'}</p>
                  <span style={{ fontSize: 11, color: '#ff6b6b' }}>{language === 'vi' ? '*Lưu ý: Đổi vé/đổi tên sẽ làm reset lại những gì bạn đã sửa bên dưới' : '*Note: Changing tickets resets edits below'}</span>
                </div>
                <iframe
                  id="email-preview-iframe"
                  title="Email Preview"
                  srcDoc={generateEmailHTML(emailModalData)}
                  style={{ width: '100%', height: '40vh', minHeight: 250, border: '1px solid var(--mint)', borderRadius: 8, background: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button onClick={() => setEmailModalData(null)} className="btn-outline-pill">{language === 'vi' ? 'Hủy' : 'Cancel'}</button>
                <button
                  disabled={emailModalData.sending}
                  onClick={async () => {
                    setEmailModalData({ ...emailModalData, sending: true });
                    
                    let finalBody = generateEmailHTML(emailModalData);
                    try {
                      const iframe = document.getElementById('email-preview-iframe');
                      if (iframe && iframe.contentDocument) {
                        const clone = iframe.contentDocument.documentElement.cloneNode(true);
                        const body = clone.querySelector('body');
                        if (body) body.removeAttribute('contenteditable');
                        finalBody = '<!DOCTYPE html>\n' + clone.outerHTML;
                      }
                    } catch (e) {
                      console.error('Could not read iframe content', e);
                    }
                    
                    try {
                      const res = await fetch(`${API_URL}/api/bookings/${emailModalData.booking._id}/send-ticket`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: emailModalData.to,
                          subject: emailModalData.subject,
                          body: finalBody,
                          seats: emailModalData.selectedSeats
                        })
                      });
                      if (res.ok) {
                        alert(language === 'vi' ? 'Đã gửi mail thành công!' : 'Email sent!');
                        setEmailModalData(null);
                        fetchAllBookings(true);
                      } else {
                        const err = await res.json();
                        alert('Lỗi: ' + err.error);
                        setEmailModalData({ ...emailModalData, sending: false });
                      }
                    } catch (e) {
                      console.error(e);
                      alert('Lỗi mạng');
                      setEmailModalData({ ...emailModalData, sending: false });
                    }
                  }}
                  className="btn-pill"
                >
                  {emailModalData.sending ? (language === 'vi' ? 'Đang gửi...' : 'Sending...') : (language === 'vi' ? 'Gửi Mail' : 'Send Email')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .admin-analytics-grid { grid-template-columns: 1fr !important; }
          .admin-checkin-split { grid-template-columns: 1fr !important; }
          .admin-form-grid-2, .admin-form-grid-3, .admin-tier-grid, .admin-schedule-grid, .admin-app-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-booking-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminPanelPage;
