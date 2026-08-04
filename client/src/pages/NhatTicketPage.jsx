import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const NhatTicketPage = () => {
  const { ticketCode } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_URL}/api/nhat/tickets/code/${ticketCode}`);
        if (!res.ok) {
          throw new Error('Ticket not found');
        }
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError(vi ? 'Không tìm thấy vé hoặc có lỗi xảy ra.' : 'Ticket not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    if (ticketCode) {
      fetchTicket();
    }
  }, [ticketCode, vi]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.getElementById('nhat-ticket');
      if (!element) return;
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#01010A'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdfWidth = canvas.width;
      const pdfHeight = canvas.height;
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'l' : 'p',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output('blob');
      const blob = new Blob([pdfBlob], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Ve_NHAT_${ticketCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(vi ? 'Có lỗi xảy ra khi tải PDF.' : 'Error downloading PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 48, color: 'var(--purple)' }}>sync</span>
        <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '.15em', textTransform: 'uppercase' }}>
          {vi ? 'Đang tạo vé điện tử...' : 'Generating ticket...'}
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ff6b6b' }}>error</span>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate('/nhat')} style={{ color: 'var(--purple)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          {vi ? 'Về trang sự kiện Nhất' : 'Back to Nhất'}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingTop: 120, paddingBottom: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>

        <button
          onClick={() => { navigate('/nhat'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, textDecoration: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
          {vi ? 'Về trang Nhất' : 'Back to Nhất'}
        </button>

        <span style={{ padding: '6px 18px', borderRadius: 999, background: 'rgba(158,254,253,.1)', border: '1px solid rgba(158,254,253,.3)', color: 'var(--mint)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          ✓ {vi ? 'Đăng ký vé thành công' : 'Registration Confirmed'}
        </span>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div id="nhat-ticket" style={{ width: '100%', background: 'linear-gradient(180deg, rgba(14,16,44,.9), rgba(7,8,24,.85))', border: '1px solid rgba(168,150,246,.4)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(70,69,215,.2)' }}>
            
            <div style={{ height: 160, position: 'relative', overflow: 'hidden', marginBottom: -1, zIndex: 1 }}>
              <div style={{ position: 'absolute', inset: -2, backgroundImage: 'url(/nhat.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .55, filter: 'saturate(1.2)' }} />
              <div style={{ position: 'absolute', inset: -2, background: 'linear-gradient(to top, rgba(7,8,24,1) 0%, transparent 70%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ color: 'var(--mint)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 4 }}>NHẤT FASHION SHOW</p>
                  <h2 className="serif" style={{ color: '#fff', fontSize: 26, margin: 0, lineHeight: .9 }}>Vé điện tử</h2>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--purple)', fontSize: 32 }}>local_activity</span>
              </div>
            </div>

            <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#fff', padding: 12, borderRadius: 16, boxShadow: '0 0 40px rgba(168,150,246,.3)' }}>
                <QRCodeSVG value={ticket.ticketCode} size={180} bgColor="#ffffff" fgColor="#01010A" level="H" includeMargin={false} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.18em', marginBottom: 10 }}>
                  {vi ? 'MÃ VÉ' : 'TICKET CODE'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(168,150,246,.08)', border: '1px solid rgba(168,150,246,.3)', borderRadius: 12, padding: '12px 20px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 20, color: 'var(--purple)', fontWeight: 700, letterSpacing: '.15em', lineHeight: 1, display: 'block', transform: 'translateY(-2px)' }}>{ticket.ticketCode}</span>
                  <button onClick={() => handleCopy(ticket.ticketCode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--mint)' : 'var(--muted)', transition: 'color .2s', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: 1, transform: 'translateY(-1px)' }}>{copied ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', letterSpacing: '.08em', textTransform: 'uppercase', maxWidth: 240 }}>
                {vi ? 'Xuất trình mã QR tại cửa vào sự kiện' : 'Present QR code at the event entrance'}
              </p>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--black)', position: 'absolute', left: -11, boxShadow: 'inset -3px 0 5px rgba(0,0,0,.4)' }} />
              <div style={{ flex: 1, margin: '0 12px', borderTop: '2px dashed rgba(168,150,246,.25)' }} />
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--black)', position: 'absolute', right: -11, boxShadow: 'inset 3px 0 5px rgba(0,0,0,.4)' }} />
            </div>

            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
              {[
                { labelEn: 'Attendee',     labelVi: 'Người tham dự', value: ticket.fullName, sub: '' },
                { labelEn: 'Student ID',   labelVi: 'Mã SV',         value: ticket.studentId, sub: ticket.classInfo, align: 'right' },
                { labelEn: 'Date & Time',  labelVi: 'Ngày & Giờ',    value: '8 Thg 8, 2026', sub: '14:00' },
                { labelEn: 'Venue',        labelVi: 'Địa điểm',      value: 'Hội Trường D201', sub: 'ĐH Ngoại Thương', align: 'right' },
              ].map(c => (
                <div key={c.labelEn} style={{ textAlign: c.align || 'left' }}>
                  <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 4 }}>
                    {vi ? c.labelVi : c.labelEn}
                  </p>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{c.value}</p>
                  {c.sub && <p style={{ color: 'var(--muted)', fontSize: 11, margin: '2px 0 0' }}>{c.sub}</p>}
                </div>
              ))}
            </div>

          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn-outline-pill"
              style={{ flex: 1, justifyContent: 'center', gap: 8, opacity: isDownloading ? 0.6 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {isDownloading ? 'hourglass_empty' : 'download'}
              </span>
              {isDownloading ? (vi ? 'Đang tải...' : 'Downloading...') : 'PDF'}
            </button>
            <button
              onClick={() => handleCopy(window.location.href)}
              className="btn-outline-pill"
              style={{ flex: 1, justifyContent: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{copied ? 'check' : 'link'}</span>
              {copied ? (vi ? 'Đã sao chép' : 'Copied!') : (vi ? 'Copy Link vé' : 'Copy Link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhatTicketPage;
